/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { motion, AnimatePresence } from "framer-motion";
import {
HiArrowLeft,
HiPaperAirplane,
HiOutlineExclamation,
HiDotsVertical,
HiBan,
HiFlag,
HiX,
HiOutlineTrash,
HiOutlineLocationMarker,
HiVolumeUp,
HiVolumeOff,
} from "react-icons/hi";
import { createSocketConnection } from "../utils/constant";
import { getMessages, getMessagesByMatch, markAsSeen, deleteMessage, uploadChatFile } from "../api/chat";
import { blockUser as blockUserApi, reportUser as reportUserApi } from "../api/connections";
import { ensureCrypto, isCryptoReady, encryptMessage, decryptMessage, canEncryptWith } from "../utils/e2ee";
import { useToast } from "../context/ToastProvider";
import { getOnlineStatus } from "../utils/timeUtils";
import { resolvePhotoUrl } from "../utils/avatar";
import { generateIcebreaker, suggestCollaboration, aiErrorMessage } from "../utils/aiApi";
import CallButton from "./call/CallButton";
// ── [PHASE-1] chat enhancements (revert: delete this block + every `// [PHASE-1]` block below)
import {
  FEATURES,
  MarkdownMessage,
  VoiceNoteRecorder,
  VoiceNotePlayer,
  MessageReactions,
  GifPicker,
  ChatSearchBar,
} from "../features/chat";
import { getChatPrefs, setChatPref } from "../features/chat/enhancementApi";
// ── [PHASE-2] offline chat resilience (revert: delete this block + every `// [PHASE-2]` block below)
import {
  getPeerKey,
  cacheMessages,
  getCachedMessages,
  queueOutgoing,
  getQueuedOutgoing,
  removeQueuedOutgoing,
  queuedOutgoingCount,
} from "../features/offline";

const MESSAGE_LIMIT = 30;

const generateClientId = () =>
typeof crypto !== "undefined" && crypto.randomUUID
? crypto.randomUUID()
: `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Client-side image compression for faster uploads
const compressImage = (file, maxWidth = 1280, maxHeight = 1280, quality = 0.8) => {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
      }, file.type, quality);
    };
    reader.readAsDataURL(file);
  });
};

const getStatusLabel = (message, isMine) => {
if (!isMine) return null;
// [PHASE-2] queued (offline) messages wait in the outbox, not in flight
if (message.queued) {
return <span className="text-warning-400">Queued</span>;
}
if (message.seen) {
return <span className="text-brand-600 font-medium">Seen</span>;
}
if (message.delivered) {
return <span className="text-neutral-400">Delivered</span>;
}
if (message.status === "failed") {
return <HiOutlineExclamation className="text-error-400" />;
}
if (message.status === "pending") {
return <span className="text-neutral-500">…</span>;
}
return <span className="text-neutral-400">Sent</span>;
};

const decorateMessage = (payload, userId, targetUserId) => {
  const senderId = payload.senderId?._id ?? payload.senderId;
  return {
    ...payload,
    sender: senderId === userId ? "me" : "them",
    isOwn: senderId === userId,
    counterpartId: senderId === userId ? targetUserId : senderId,
    receiverId: payload.receiverId,
  };
};

// Decrypt an incoming message for display. If it isn't encrypted, or we can't
// decrypt it (e.g. missing peer key), return it with a safe placeholder so the
// UI never crashes on ciphertext.
const decryptIncoming = async (msg, userId) => {
  if (!msg?.isEncrypted) return msg;
  if (!isCryptoReady()) return { ...msg, message: "[encrypted message]" };
  try {
    const senderId = msg.senderId?._id ?? msg.senderId;
    const peer = senderId === userId ? msg.receiverId : msg.senderId;
    const plain = await decryptMessage(peer, msg.message);
    return { ...msg, message: plain };
  } catch {
    return { ...msg, message: "[encrypted message]" };
  }
};

const ChatBox = () => {
const { targetUserId } = useParams();
const navigate = useNavigate();
const virtuosoRef = useRef(null);
const socketRef = useRef(null);
const typingTimeoutRef = useRef(null);
const pendingTimeoutsRef = useRef(new Map());
const fileInputRef = useRef(null);

const connections = useSelector((state) => state.connections?.items);
const user = useSelector((state) => state.user);
const userId = user?._id;
const otherUser = connections?.find((conn) => conn._id === targetUserId);

const [matchId, setMatchId] = useState(null);
const [messages, setMessages] = useState([]);
const [nextCursor, setNextCursor] = useState(null);
const [hasMore, setHasMore] = useState(false);
const [loadingOlder, setLoadingOlder] = useState(false);
const [input, setInput] = useState("");
const [error, setError] = useState(null);
const [typingUsers, setTypingUsers] = useState(new Set());
const [showMenu, setShowMenu] = useState(false);
const [menuMessageId, setMenuMessageId] = useState(null);
const [icebreaker, setIcebreaker] = useState("");
const [icebreakerLoading, setIcebreakerLoading] = useState(false);
const [collabSuggestion, setCollabSuggestion] = useState(null);
const [collabLoading, setCollabLoading] = useState(false);
const [uploading, setUploading] = useState(false);
const [previewImage, setPreviewImage] = useState(null);
// ── [PHASE-1] chat prefs (pin conversation / mute)
const [chatPrefs, setChatPrefs] = useState({ pinned: false, muted: false });
const { addToast } = useToast();
// ── [PHASE-2] offline chat state
const [isOffline, setIsOffline] = useState(false);
const [showingCached, setShowingCached] = useState(false);
const [queuedCount, setQueuedCount] = useState(0);

const blockUser = async () => {
try {
      await blockUserApi(targetUserId);
      addToast("User blocked", "success");
setShowMenu(false);
navigate("/messages");
} catch (error) {
addToast(error?.response?.data?.message || "Unable to block user", "error");
}
};

const fetchCollabSuggestion = async () => {
setCollabLoading(true);
try {
const { data } = await suggestCollaboration(targetUserId);
setCollabSuggestion(data);
} catch (err) {
addToast(aiErrorMessage(err), "error");
} finally {
setCollabLoading(false);
}
};

const reportUser = async () => {
try {
      await reportUserApi(targetUserId, "Inappropriate behavior");
      addToast("User reported", "success");
setShowMenu(false);
} catch (error) {
addToast(error?.response?.data?.message || "Unable to report user", "error");
}
};

const handleDelete = async (message) => {
try {
      await deleteMessage(message._id);
      setMessages((prev) => prev.filter((m) => m._id !== message._id));
setMenuMessageId(null);
if (socketRef.current && matchId) {
socketRef.current.emit("message:delete", { messageId: message._id, matchId });
}
} catch (err) {
addToast(err?.response?.data?.message || "Failed to delete message", "error");
}
};

const formatMessageTime = (date) => {
if (!date) return "";
const now = new Date();
const msgDate = new Date(date);
const diffMs = now - msgDate;
const diffSec = Math.floor(diffMs / 1000);
const diffMin = Math.floor(diffSec / 60);
const diffHour = Math.floor(diffMin / 60);
const diffDay = Math.floor(diffHour / 24);

if (diffSec < 60) return "Just now";
if (diffMin < 60) return `${diffMin}m ago`;
if (diffHour < 24) return `${diffHour}h ago`;
if (diffDay === 1) return "Yesterday";
if (diffDay < 7) return `${diffDay}d ago`;
return msgDate.toLocaleDateString();
};

const sortedMessages = useMemo(
() => [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
[messages]
);

const fetchInitialMessages = async () => {
if (!userId || !targetUserId) return;
try {
// Load messages first — this is the critical path and must never depend
// on crypto succeeding. E2E init happens afterwards and is non-fatal.
const data = await getMessages(targetUserId, { limit: MESSAGE_LIMIT });
      setMatchId(data.chat.matchId);

      const raw = (data.messages ?? []).map((msg) =>
decorateMessage(msg, userId, targetUserId)
);

// Initialize E2E in the background; a failure must not block the chat.
try {
await ensureCrypto({ userId });
} catch {
/* fall back to plaintext/placeholder display */
}

const decorated = await Promise.all(raw.map((msg) => decryptIncoming(msg, userId)));
        setMessages(decorated);
        setNextCursor(data.nextCursor ?? null);
        setHasMore(data.hasMore ?? false);
setError(null);

// [PHASE-2] write-through to the offline display cache (non-blocking)
if (FEATURES.offlineChat) {
cacheMessages(getPeerKey({ userId, targetUserId }), decorated).catch(() => {});
setShowingCached(false);
}

// Fetch icebreaker only on a fresh/empty chat
if (raw.length === 0 && targetUserId) {
fetchIcebreaker();
}
} catch (err) {
// [PHASE-2] fall back to the on-disk cache when the server is unreachable
if (FEATURES.offlineChat) {
try {
const cached = await getCachedMessages(getPeerKey({ userId, targetUserId }));
if (cached.length) {
setMessages(cached);
setMatchId(cached[cached.length - 1]?.matchId ?? null);
setNextCursor(null);
setHasMore(false);
setError(null);
setShowingCached(true);
addToast("Offline — showing cached messages", "info");
return;
}
} catch {
/* fall through to the standard error state */
}
}
setError(err.response?.data?.message || "Unable to load messages");
addToast(err.response?.data?.message || "Unable to load messages", "error");
}
};

const fetchIcebreaker = async () => {
setIcebreakerLoading(true);
try {
const result = await generateIcebreaker(targetUserId);
if (result.success) {
setIcebreaker(result.data.message);
}
} catch (err) {
addToast(aiErrorMessage(err), "error");
} finally {
setIcebreakerLoading(false);
}
};

const handleLoadOlder = async () => {
    if (!matchId || loadingOlder || !hasMore) return;
    setLoadingOlder(true);
    try {
      try {
        await ensureCrypto({ userId });
      } catch {
        /* non-fatal; older messages still load (possibly as placeholders) */
      }
      const data = await getMessagesByMatch(matchId, { cursor: nextCursor, limit: MESSAGE_LIMIT });
      const decorated = await Promise.all(
        data.messages.map((msg) => decryptIncoming(decorateMessage(msg, userId, targetUserId), userId))
      );
      if (decorated.length) {
        setMessages((prev) => [...decorated, ...prev]);
        virtuosoRef.current?.prependItems(decorated.length);
      }
      setNextCursor(data.data.nextCursor ?? null);
      setHasMore(data.data.hasMore ?? false);
    } catch {
      addToast("Unable to retrieve older messages", "error");
    } finally {
      setLoadingOlder(false);
    }
  };

const upsertMessage = (incoming) => {
setMessages((prev) => {
const exists = prev.find((msg) => msg.clientMessageId === incoming.clientMessageId || msg._id === incoming._id);
if (exists) {
return prev.map((msg) =>
msg.clientMessageId === incoming.clientMessageId || msg._id === incoming._id
? { ...msg, ...incoming }
: msg
);
}
return [...prev, incoming];
});
};

// [PHASE-2] refresh the number of messages waiting in the outbox
const syncQueuedCount = () =>
queuedOutgoingCount(userId).then(setQueuedCount).catch(() => {});

const handleAck = async (payload) => {
pendingTimeoutsRef.current.get(payload.clientMessageId)?.();
pendingTimeoutsRef.current.delete(payload.clientMessageId);
// [PHASE-2] server confirmed the queued send — remove it from the outbox
if (FEATURES.offlineChat && payload.clientMessageId) {
removeQueuedOutgoing(userId, payload.clientMessageId);
syncQueuedCount();
}
const decrypted = await decryptIncoming(payload, userId);
upsertMessage(decorateMessage(decrypted, userId, targetUserId));
};

const handleDeliveryUpdate = (messagesPayload, mode = "delivered") => {
if (mode === "seen") {
setMessages((prev) =>
prev.map((msg) =>
msg.isOwn && messagesPayload.userId === msg.receiverId
? { ...msg, seen: true, delivered: true, seenAt: new Date().toISOString() }
: msg
)
);
return;
}
messagesPayload.forEach((msg) => {
upsertMessage(decorateMessage(msg, userId, targetUserId));
});
};

const handleTyping = (payload, isTyping) => {
if (payload.userId === userId) return;
setTypingUsers((prev) => {
  const updated = new Set(prev);
  if (isTyping) {
  updated.add(payload.userId);
  } else {
  updated.delete(payload.userId);
  }
  return updated;
  });
};

// [PHASE-2] re-emit every queued message on (re)connect. Server dedupes by
// clientMessageId, so safe to re-send; entries are dropped only on ack/timeout.
const handleReconnect = async () => {
if (!FEATURES.offlineChat || !socketRef.current?.connected) return;
const queued = await getQueuedOutgoing(userId);
queued.forEach(({ entry }) => {
socketRef.current.emit("sendMessage", entry.payload);
});
setQueuedCount(queued.length);
};

const initializeSocket = () => {
if (!userId) return;
const socket = createSocketConnection(userId);
socketRef.current = socket;

// [PHASE-2] flush queued outgoing messages whenever the socket (re)connects
socket.on("connect", handleReconnect);

socket.emit("joinChat", { userId, targetUserId, matchId });

socket.on("chat:joined", ({ matchId: serverMatchId }) => {
setMatchId(serverMatchId);
});

socket.on("message:created", async (msg) => {
  const decrypted = await decryptIncoming(msg, userId);
  const decorated = decorateMessage(decrypted, userId, targetUserId);

  // ── [PHASE-1] Replace optimistic voice note on server confirmation
  if (decorated.messageType === "audio" && decorated.isOwn) {
    setMessages((prev) => {
      const optimisticIndex = prev.findLastIndex(
        (m) => m.isOptimistic && m.clientMessageId && m.clientMessageId === decorated.clientMessageId
      );
      if (optimisticIndex >= 0) {
        const updated = [...prev];
        updated[optimisticIndex] = decorated;
        return updated;
      }
      return [...prev, decorated];
    });
    return;
  }

  // Replace optimistic image message if this is the server confirmation
  if (decorated.messageType === "image" && decorated.isOwn) {
    setMessages((prev) => {
      // Find the most recent optimistic image from this user
      const optimisticIndex = prev.findLastIndex(
        (m) =>
          m.isOptimistic &&
          m.messageType === "image" &&
          m.isOwn
      );
      if (optimisticIndex >= 0) {
        const updated = [...prev];
        updated[optimisticIndex] = decorated;
        return updated;
      }
      // No optimistic message to replace - add the server message normally
      return [...prev, decorated];
    });
    return; // Don't call upsertMessage again
  }
  // [PHASE-2] own message confirmed by the server — drop it from the outbox
  if (decorated.isOwn && FEATURES.offlineChat && msg.clientMessageId) {
    removeQueuedOutgoing(userId, msg.clientMessageId);
    syncQueuedCount();
  }
  upsertMessage(decorated);
});

socket.on("message:ack", (msg) => {
handleAck(msg);
});

socket.on("messages:delivered", (payload) => handleDeliveryUpdate(payload, "delivered"));
socket.on("messages:seen", (payload) => handleDeliveryUpdate(payload, "seen"));

socket.on("typing:start", (payload) => handleTyping(payload, true));
socket.on("typing:stop", (payload) => handleTyping(payload, false));

socket.on("message:deleted", ({ messageId }) => {
setMessages((prev) => prev.filter((m) => m._id !== messageId));
});

// ── [PHASE-1] reactions
socket.on("message:reacted", ({ messageId, reactions }) => {
setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, reactions } : m)));
});

socket.on("chat:error", ({ message }) => {
addToast(message, "error");
});
};

useEffect(() => {
fetchInitialMessages();
}, [targetUserId, userId]);

  useEffect(() => {
    if (sortedMessages.length > 0) {
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({ index: sortedMessages.length - 1, align: "end", behavior: "auto" });
      }, 50);
    }
  }, [sortedMessages.length]);

useEffect(() => {
initializeSocket();
return () => {
pendingTimeoutsRef.current.forEach((clearFn) => clearFn());
pendingTimeoutsRef.current.clear();
if (typingTimeoutRef.current) {
clearTimeout(typingTimeoutRef.current);
}
if (!socketRef.current) return;
socketRef.current.off("connect", handleReconnect); // [PHASE-2]
socketRef.current.off("chat:joined");
socketRef.current.off("message:created");
socketRef.current.off("message:ack");
socketRef.current.off("messages:delivered");
socketRef.current.off("messages:seen");
socketRef.current.off("message:deleted");
socketRef.current.off("message:reacted"); // [PHASE-1]
socketRef.current.off("typing:start");
socketRef.current.off("typing:stop");
socketRef.current.off("chat:error");
};
}, [userId, targetUserId, matchId]);

useEffect(() => {
if (!matchId || !userId) return;
const unseen = sortedMessages.filter((msg) => !msg.seen && !msg.isOwn);
if (!unseen.length) return;
socketRef.current?.emit("message:seen", { userId, matchId });
  markAsSeen(matchId).catch(() => {});
}, [sortedMessages, matchId, userId]);

// ── [PHASE-1] load chat prefs (pin/mute)
useEffect(() => {
if (!matchId || !FEATURES.chatPrefs) return;
getChatPrefs().then((data) => {
const prefs = data.prefs?.[matchId];
if (prefs) setChatPrefs(prefs);
}).catch(() => {});
}, [matchId]);

// ── [PHASE-2] track browser online/offline for the offline banner + queuing
useEffect(() => {
if (!FEATURES.offlineChat) return;
const sync = () => setIsOffline(!navigator.onLine);
sync();
window.addEventListener("online", sync);
window.addEventListener("offline", sync);
return () => {
window.removeEventListener("online", sync);
window.removeEventListener("offline", sync);
};
}, []);


const schedulePendingTimeout = (clientMessageId) => {
const timer = setTimeout(() => {
// [PHASE-2] an unacked send is no longer waiting in the outbox
if (FEATURES.offlineChat) {
removeQueuedOutgoing(userId, clientMessageId);
syncQueuedCount();
}
setMessages((prev) => prev.map((msg) => (msg.clientMessageId === clientMessageId ? { ...msg, status: "failed" } : msg)));
}, 5000);
pendingTimeoutsRef.current.set(clientMessageId, () => clearTimeout(timer));
};

const emitTyping = (isTyping) => {
if (!socketRef.current || !matchId) return;
socketRef.current.emit(isTyping ? "typing:start" : "typing:stop", {
userId,
matchId,
});
};

const handleInputChange = (event) => {
const value = event.target.value;
setInput(value);
if (!socketRef.current || !matchId) return;
emitTyping(true);
if (typingTimeoutRef.current) {
clearTimeout(typingTimeoutRef.current);
}
typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1500);
};

const sendMessage = async () => {
if (!input.trim() || !userId || !targetUserId) return;
const clientMessageId = generateClientId();
const plaintext = input.trim();

// Encrypt client-side when the recipient has an E2E public key; otherwise
// fall back to plaintext for backwards compatibility with legacy clients.
let body = plaintext;
let isEncrypted = false;
try {
await ensureCrypto({ userId });
if (await canEncryptWith(targetUserId)) {
body = await encryptMessage(targetUserId, plaintext);
isEncrypted = true;
}
} catch {
/* fall back to plaintext */
}

const payload = {
matchId,
userId,
targetUserId,
message: body,
messageType: "text",
clientMessageId,
receiverId: targetUserId,
isEncrypted,
};
const pendingMessage = decorateMessage(
{
matchId,
userId,
targetUserId,
clientMessageId,
message: plaintext,
messageType: "text",
delivered: false,
seen: false,
status: "pending",
createdAt: new Date().toISOString(),
receiverId: targetUserId,
},
userId,
targetUserId
);

setMessages((prev) => [...prev, pendingMessage]);
setInput("");
emitTyping(false);

// [PHASE-2] offline / disconnected: persist to the outbox instead of emitting.
// The message keeps its clientMessageId, so when it flushes on reconnect the
// server ack replaces this optimistic bubble and the outbox entry is dropped.
if (FEATURES.offlineChat && !socketRef.current?.connected) {
await queueOutgoing(userId, { payload, plaintext, createdAt: pendingMessage.createdAt });
setQueuedCount((c) => c + 1);
setMessages((prev) =>
prev.map((msg) => (msg.clientMessageId === clientMessageId ? { ...msg, queued: true } : msg))
);
addToast("Message queued — will send when you're back online", "info");
return;
}

schedulePendingTimeout(clientMessageId);
socketRef.current.emit("sendMessage", payload);
};

const handleRetry = async (message) => {
const plaintext = message.message;
let body = plaintext;
let isEncrypted = false;
try {
await ensureCrypto({ userId });
if (await canEncryptWith(targetUserId)) {
body = await encryptMessage(targetUserId, plaintext);
isEncrypted = true;
}
} catch {
/* fall back to plaintext */
}

const retriedPayload = {
matchId,
userId,
targetUserId,
message: body,
messageType: message.messageType,
clientMessageId: generateClientId(),
receiverId: targetUserId,
isEncrypted,
};
const pendingMessage = decorateMessage(
{
matchId,
userId,
targetUserId,
clientMessageId: retriedPayload.clientMessageId,
message: plaintext,
messageType: message.messageType,
delivered: false,
seen: false,
status: "pending",
createdAt: new Date().toISOString(),
receiverId: targetUserId,
},
userId,
targetUserId
);
setMessages((prev) =>
prev.map((msg) => (msg.clientMessageId === message.clientMessageId ? pendingMessage : msg))
);

// [PHASE-2] offline retry re-queues instead of emitting
if (FEATURES.offlineChat && !socketRef.current?.connected) {
await queueOutgoing(userId, { payload: retriedPayload, plaintext, createdAt: pendingMessage.createdAt });
setQueuedCount((c) => c + 1);
setMessages((prev) =>
prev.map((msg) => (msg.clientMessageId === message.clientMessageId ? { ...msg, queued: true, status: "pending" } : msg))
);
addToast("Message queued — will send when you're back online", "info");
return;
}

schedulePendingTimeout(retriedPayload.clientMessageId);
emitTyping(false);
socketRef.current.emit("sendMessage", retriedPayload);
};

const handleKeyDown = (event) => {
if (event.key === "Enter" && !event.shiftKey) {
event.preventDefault();
sendMessage();
}
};

const handleFileSelect = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setUploading(true);

  // Compress image client-side before upload for faster transfers
  const compressedFile = await compressImage(file);

  // Optimistic preview: create blob URL for immediate display
  const blobUrl = URL.createObjectURL(compressedFile);
  const clientMessageId = generateClientId();
  let uploadProgress = 0;

  const optimisticMessage = decorateMessage(
    {
      matchId,
      userId,
      targetUserId,
      clientMessageId,
      message: blobUrl,
      messageType: "image",
      delivered: false,
      seen: false,
      status: "pending",
      createdAt: new Date().toISOString(),
      receiverId: targetUserId,
      senderId: userId,
      isOptimistic: true,
      uploadProgress: 0,
    },
    userId,
    targetUserId
  );
  setMessages((prev) => [...prev, optimisticMessage]);
  virtuosoRef.current?.scrollToIndex({ index: "END", behavior: "auto" });

  try {
    const formData = new FormData();
    formData.append("image", compressedFile);
    formData.append("matchId", matchId);
    formData.append("targetUserId", targetUserId);

    await uploadChatFile(formData, (progressEvent) => {
      if (progressEvent.total) {
        uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.clientMessageId === clientMessageId
              ? { ...msg, uploadProgress }
              : msg
          )
        );
      }
    });
    // The actual message will come via socket "message:created" event
  } catch (err) {
    // Remove optimistic message on failure
    setMessages((prev) => prev.filter((msg) => msg.clientMessageId !== clientMessageId));
    addToast(err?.response?.data?.message || "Failed to upload image", "error");
  } finally {
    setUploading(false);
    e.target.value = "";
    // Clean up blob URL after a delay (give time for socket to deliver real message)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
  }
};

// ── [PHASE-1] helpers for voice notes / GIFs (additive)
const addOptimisticMessage = (partial) => {
  setMessages((prev) => [...prev, decorateMessage(partial, userId, targetUserId)]);
};
const removeMessageByClientId = (clientMessageId) => {
  setMessages((prev) => prev.filter((m) => m.clientMessageId !== clientMessageId));
};
const jumpToMessage = (messageId) => {
  const index = sortedMessages.findIndex((m) => m._id === messageId);
  if (index >= 0) {
    virtuosoRef.current?.scrollToIndex({ index, align: "center", behavior: "smooth" });
  }
};
const emitEnhancement = (event, payload) => socketRef.current?.emit(event, payload);

// [PHASE-1] chat prefs handlers
const toggleChatPin = () => {
  const next = !chatPrefs.pinned;
  setChatPrefs((p) => ({ ...p, pinned: next }));
  setChatPref(matchId, { pinned: next }).catch(() => {});
};
const toggleChatMute = () => {
  const next = !chatPrefs.muted;
  setChatPrefs((p) => ({ ...p, muted: next }));
  setChatPref(matchId, { muted: next }).catch(() => {});
};

if (error) {
return (
<div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-hairline bg-surface-900/70">
<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-error-500/20 bg-error-500/10 text-3xl">
⚠️
</div>
<p className="text-base font-semibold text-error-300">{error}</p>
<button
onClick={() => navigate("/messages")}
className="rounded-lg border border-hairline px-5 py-2 text-sm font-semibold text-neutral-200 hover:bg-tint"
>
← Back to Messages
</button>
</div>
);
}

// ── empty state (no messages yet) ──────────────────────────
const EmptyChat = () => (
<div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
<div className="relative flex h-20 w-20 items-center justify-center">
{/* pulsing glow ring */}
<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500/20" />
<div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-400/20 bg-brand-500/10">
{otherUser?.photoUrl?.[0] ? (
<img
src={resolvePhotoUrl(otherUser.photoUrl, otherUser.firstName)}
alt={otherUser.firstName}
className="h-full w-full rounded-2xl object-cover"
/>
) : (
<span className="text-2xl">💬</span>
)}
</div>
</div>
<div>
<p className="text-base font-bold text-neutral-100">
Start a conversation with{" "}
<span className="text-brand-600">{otherUser?.firstName ?? "this developer"}</span>
</p>
<p className="mt-1 text-xs text-neutral-500">
Send the first message — or use the AI icebreaker below ✨
</p>
</div>
</div>
);

return (
<div className="flex h-[calc(100svh-theme(spacing.48))] min-h-[500px] w-full flex-col overflow-hidden rounded-2xl border border-hairline bg-surface-900/80 backdrop-blur-xl">
<div className="flex items-center gap-3 border-b border-hairline-soft px-5 py-4">
<button
onClick={() => navigate("/messages")}
className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-tint text-neutral-300 transition hover:bg-tint-strong"
>
<HiArrowLeft className="text-base" />
</button>
{otherUser && (
<div className="flex items-center gap-3 flex-1">
<div className="relative h-10 w-10 overflow-hidden rounded-xl border border-brand-400/30">
<img
src={resolvePhotoUrl(otherUser.photoUrl, otherUser.firstName)}
alt={otherUser.firstName}
className="h-full w-full object-cover"
/>
<span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface-900 ${otherUser.isOnline ? "bg-success-500" : "bg-neutral-500"}`} />
</div>
<div className="flex-1 min-w-0">
<p className="text-sm font-semibold text-neutral-50 truncate">
{otherUser.firstName} {otherUser.lastName}
</p>
<p className="text-xs text-neutral-400">
{typingUsers.size ? "Typing…" : getOnlineStatus(otherUser.isOnline, otherUser.lastSeenAt)}
</p>
</div>
<div className="flex items-center gap-2">
<button
type="button"
onClick={fetchCollabSuggestion}
disabled={collabLoading}
className="flex items-center gap-2 rounded-lg bg-brand-500/10 px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-500 transition hover:bg-brand-500/20 disabled:opacity-50"
>
{collabLoading ? (
<span className="spinner h-[10px] w-[10px] border text-brand-600" />
) : (
<>✨ Suggest Activity</>
)}
</button>
<CallButton
calleeId={targetUserId}
type="voice"
chatId={matchId}
peer={otherUser}
/>
<CallButton
calleeId={targetUserId}
type="video"
chatId={matchId}
peer={otherUser}
/>
{/* ── [PHASE-1] search / pin / mute */}
{FEATURES.chatSearch && (
<ChatSearchBar matchId={matchId} onJump={jumpToMessage} />
)}
{FEATURES.chatPrefs && (
<>
<button
type="button"
onClick={toggleChatPin}
title={chatPrefs.pinned ? "Unpin conversation" : "Pin conversation"}
className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${chatPrefs.pinned ? "border-brand-500/60 bg-brand-500/20 text-brand-300" : "border-brand-500/40 bg-brand-500/15 text-brand-300 hover:bg-brand-500/30"}`}
>
<HiOutlineLocationMarker className="text-sm" />
</button>
<button
type="button"
onClick={toggleChatMute}
title={chatPrefs.muted ? "Unmute notifications" : "Mute notifications"}
className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${chatPrefs.muted ? "border-brand-500/60 bg-brand-500/20 text-brand-300" : "border-brand-500/40 bg-brand-500/15 text-brand-300 hover:bg-brand-500/30"}`}
>
{chatPrefs.muted ? <HiVolumeOff className="text-sm" /> : <HiVolumeUp className="text-sm" />}
</button>
</>
)}
<div className="relative">
<button
type="button"
onClick={() => setShowMenu(!showMenu)}
className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-tint"
>
<HiDotsVertical className="text-lg" />
</button>
{showMenu && (
<div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-hairline bg-surface-900 py-1 shadow-xl z-50">
<button
type="button"
onClick={blockUser}
className="w-full px-4 py-2 text-left text-sm text-warning-400 hover:bg-tint flex items-center gap-2"
>
<HiBan className="text-sm" /> Block
</button>
<button
type="button"
onClick={reportUser}
className="w-full px-4 py-2 text-left text-sm text-neutral-400 hover:bg-tint flex items-center gap-2"
>
<HiFlag className="text-sm" /> Report
</button>
</div>
)}
</div>
</div>
</div>
)}
</div>

{/* Message list OR empty state */}
<div className="relative min-h-0 flex-1 overflow-hidden">
{sortedMessages.length === 0 ? (
<EmptyChat />
) : (
<Virtuoso
ref={virtuosoRef}
data={sortedMessages}
followOutput="smooth"
startReached={handleLoadOlder}
overscan={200}
style={{ height: "100%", overflowX: "hidden" }}
className="px-0 py-4"
components={{
Header: () => <div className="h-8" />,
}}

        itemContent={(index, message) => {
            if (message.messageType === "call") {
              const details = message.metadata?.callDetails || {};
              const status = details.status || "ended";
              const isVideo = details.type === "video";
              const isMissed = status === "missed";
              const mins = Math.floor((details.durationSec || 0) / 60);
              const secs = (details.durationSec || 0) % 60;
              const durationLabel = mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `0:${String(secs).padStart(2, "0")}`;
              const callLabel =
                status === "started"
                  ? `${isVideo ? "Video" : "Voice"} call`
                  : status === "missed"
                    ? `Missed ${isVideo ? "video" : "voice"} call`
                    : status === "declined"
                      ? `${isVideo ? "Video" : "Voice"} call declined`
                      : "Call ended";
              return (
                <div className="mb-1 flex w-full justify-center px-6">
                  <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${isMissed ? "bg-error-500/10 text-error-300" : "bg-surface-800/40 text-neutral-400"}`}>
                    <span>{isVideo ? "📹" : "📞"}</span>
                    <span>{callLabel}</span>
                    {status === "ended" && details.durationSec > 0 && (
                      <span className="text-neutral-500">· {durationLabel}</span>
                    )}
                  </div>
                </div>
              );
            }

            // ── [PHASE-1] voice notes (additive branch; renders outside bubble)
            if (message.messageType === "audio") {
              const showAvatar = !message.isOwn && (index === 0 || sortedMessages[index - 1]?.senderId !== message.senderId);
              const isUploading = message.isOptimistic;
              return (
                <motion.div layout className={`group mb-1 flex w-full gap-2 px-3 ${message.isOwn ? "justify-end" : "justify-start text-left"}`}>
                  {!message.isOwn && (
                    <div className={`mt-auto h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-hairline-soft transition ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                      <img
                        src={resolvePhotoUrl(otherUser?.photoUrl, otherUser?.firstName)}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <MessageReactions message={message} matchId={matchId} userId={userId} emit={emitEnhancement}>
                  <div className="relative flex flex-col items-end">
                    <VoiceNotePlayer
                      src={message.message}
                      durationSec={message.metadata?.durationSec}
                      isOwn={message.isOwn}
                      isPending={isUploading}
                    />
                    <div className={`mt-1 flex items-center gap-1.5 text-[10px] tabular-nums ${message.isOwn ? "justify-end text-white/70" : "text-neutral-400"}`}>
                      <span>{formatMessageTime(message.createdAt)}</span>
                      {message.isOwn && (
                        <>
                          <span className="opacity-40">•</span>
                          <span>{getStatusLabel(message, true)}</span>
                          {!isUploading && (
                            <>
                              <button
                                type="button"
                                onClick={() => setMenuMessageId(menuMessageId === message._id ? null : message._id)}
                                className="flex h-4 w-4 items-center justify-center rounded text-[10px] leading-none hover:bg-white/20 transition"
                                title="Message options"
                              >
                                ...
                              </button>
                              {menuMessageId === message._id && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(message)}
                                  className="flex h-4 w-4 items-center justify-center rounded bg-error-500 text-white hover:bg-error-600 transition"
                                  title="Delete"
                                >
                                  <HiOutlineTrash className="h-2.5 w-2.5" />
                                </button>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  </MessageReactions>
                </motion.div>
              );
            }

            // Images render outside the bubble with fixed 40x40 dimensions
            if (message.messageType === "image") {
              const showAvatar = !message.isOwn && (index === 0 || sortedMessages[index - 1]?.senderId !== message.senderId);
              const isUploading = message.isOptimistic || (message.uploadProgress !== undefined && message.uploadProgress < 100);
              return (
                <motion.div layout className={`group mb-1 flex w-full gap-2 px-3 ${message.isOwn ? "justify-end" : "justify-start text-left"}`}>
                  {!message.isOwn && (
                    <div className={`mt-auto h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-hairline-soft transition ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                      <img
                        src={resolvePhotoUrl(otherUser?.photoUrl, otherUser?.firstName)}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <MessageReactions message={message} matchId={matchId} userId={userId} emit={emitEnhancement}>
                  <div className="relative flex flex-col">
                    {isUploading ? (
                      <div className="w-[40px] h-[40px] rounded-lg bg-neutral-700/50 flex items-center justify-center">
                        <span className="block h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
                      </div>
                    ) : (
                      <img
                        src={message.message}
                        alt="Shared image"
                        onClick={() => !isUploading && setPreviewImage(message.message)}
                        className={`w-[40px] h-[40px] rounded-lg object-cover cursor-zoom-in ${message.isOwn ? "rounded-tr-none" : "rounded-tl-none"} ${isUploading ? "pointer-events-none" : ""}`}
                        loading="lazy"
                      />
                    )}
                    {
                      message.isOwn ? (
                      <div className={`mt-1 flex items-center gap-1.5 text-[10px] tabular-nums justify-end text-white/70`}>
                        {message.uploadProgress !== undefined && message.uploadProgress < 100 && (
                          <>
                            <span className="text-brand-400">{message.uploadProgress}%</span>
                            <div className="h-1 w-16 bg-neutral-600 rounded">
                              <div className="h-full bg-brand-400 rounded transition-all" style={{ width: `${message.uploadProgress}%` }} />
                            </div>
                          </>
                        )}
                        <span>{formatMessageTime(message.createdAt)}</span>
                        <>
                          <span className="opacity-40">•</span>
                          <span>{getStatusLabel(message, true)}</span>
                          <button
                            type="button"
                            onClick={() => setMenuMessageId(menuMessageId === message._id ? null : message._id)}
                            className="flex h-4 w-4 items-center justify-center rounded text-[10px] leading-none transition hover:bg-white/20"
                            title="Message options"
                          >
                            ...
                          </button>
                          {menuMessageId === message._id && (
                            <button
                              type="button"
                              onClick={() => handleDelete(message)}
                              className="flex h-4 w-4 items-center justify-center rounded bg-error-500 text-white transition hover:bg-error-600"
                              title="Delete"
                            >
                              <HiOutlineTrash className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </>
                      </div>
                    ) : (
                      <div className={`mt-1 flex items-center gap-1.5 text-[10px] tabular-nums text-neutral-400`}>
                        <span>{formatMessageTime(message.createdAt)}</span>
                      </div>
                    )
                    }
                    {message.status === "failed" && (
                      <button
                        type="button"
                        onClick={() => handleRetry(message)}
                        className="mt-1 self-end rounded-md bg-tint-strong px-2 py-0.5 text-[10px] text-white hover:bg-tint-strong"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                  </MessageReactions>
                </motion.div>
              );
            }

            const showAvatar = !message.isOwn && (index === 0 || sortedMessages[index - 1]?.senderId !== message.senderId);
            return (
              <motion.div
                layout
                className={`group mb-1 flex w-full gap-2 px-3 ${message.isOwn ? "justify-end" : "justify-start text-left"}`}
              >
                {!message.isOwn && (
                  <div className={`mt-auto h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-hairline-soft transition ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                    <img
                      src={resolvePhotoUrl(otherUser?.photoUrl, otherUser?.firstName)}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <MessageReactions
                  message={message}
                  matchId={matchId}
                  userId={userId}
                  emit={emitEnhancement}
                  className="max-w-[85%] sm:max-w-[72%]"
                >
                  <div
                    className={`flex w-auto max-w-full flex-col rounded-[18px] px-[14px] py-[10px] text-[15px] leading-snug shadow-sm transition-all ${
                      message.isOwn
                        ? "bg-brand-500 text-white rounded-br-[6px]"
                        : "bg-surface-800 text-neutral-100 border border-hairline-soft rounded-bl-[6px]"
                    }`}
                  >
                    {FEATURES.markdown ? (
                      <MarkdownMessage text={message.message} />
                    ) : (
                      <p className="break-words whitespace-pre-wrap">{message.message}</p>
                    )}

                    <div className={`mt-1 flex items-center gap-1.5 text-[10px] tabular-nums ${message.isOwn ? "justify-end text-white/70" : "text-neutral-400"}`}>
                      <span>{formatMessageTime(message.createdAt)}</span>
                      {message.isOwn && (
                        <>
                          <span className="opacity-40">•</span>
                          <span>{getStatusLabel(message, true)}</span>
                          <button
                            type="button"
                            onClick={() => setMenuMessageId(menuMessageId === message._id ? null : message._id)}
                            className="flex h-4 w-4 items-center justify-center rounded text-[10px] leading-none transition hover:bg-white/20"
                            title="Message options"
                          >
                            ...
                          </button>
                          {menuMessageId === message._id && (
                            <button
                              type="button"
                              onClick={() => handleDelete(message)}
                              className="flex h-4 w-4 items-center justify-center rounded bg-error-500 text-white transition hover:bg-error-600"
                              title="Delete"
                            >
                              <HiOutlineTrash className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    {message.status === "failed" && (
                      <button
                        type="button"
                        onClick={() => handleRetry(message)}
                        className="mt-1 self-end rounded-md bg-tint-strong px-2 py-0.5 text-[10px] text-white hover:bg-tint-strong"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </MessageReactions>
              </motion.div>
            );
          }}
        />
      )}
    </div>

<div className="flex flex-col gap-2 border-t border-hairline-soft px-4 py-3">
{/* ── [PHASE-2] offline / queued status banner */}
{FEATURES.offlineChat && (isOffline || showingCached || queuedCount > 0) && (
<div className="flex items-center gap-2 rounded-lg border border-warning-500/20 bg-warning-500/10 px-3 py-1.5 text-xs text-warning-300">
<span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-warning-400" />
{showingCached
? "Offline — showing cached messages"
: isOffline
? "You're offline — messages will be queued"
: `${queuedCount} queued message${queuedCount === 1 ? "" : "s"} — sending on reconnect`}
</div>
)}
{typingUsers.size > 0 && (
<p className="text-xs text-brand-600">Someone is typing…</p>
)}

{/* AI Icebreaker suggestion — only shown when input is empty */}
<AnimatePresence>
{(icebreaker || icebreakerLoading) && !input.trim() && messages.length === 0 && (
<motion.div
initial={{ opacity: 0, y: 6 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 6 }}
className="flex items-start gap-2 rounded-xl border border-violet-500/20 bg-violet-950/30 px-3 py-2"
>
<span className="mt-0.5 shrink-0 text-violet-400 text-xs">✨</span>
<div className="flex-1 min-w-0">
<p className="text-[10px] font-semibold uppercase tracking-wider text-violet-500 mb-1">AI Icebreaker</p>
{icebreakerLoading ? (
<div className="flex items-center gap-1.5">
{[0,1,2].map((i) => (
<motion.span
key={i}
className="block h-1 w-1 rounded-full bg-violet-400"
animate={{ y: [0, -4, 0] }}
transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
/>
))}
<span className="text-xs text-violet-500">Crafting opener…</span>
</div>
) : (
<button
type="button"
onClick={() => { setInput(icebreaker); setIcebreaker(""); }}
className="text-left text-xs text-violet-200 hover:text-violet-100 transition leading-relaxed"
title="Click to use this icebreaker"
>
{icebreaker}
<span className="ml-2 text-[10px] text-violet-500">(tap to use)</span>
</button>
)}
</div>
{!icebreakerLoading && (
<button
type="button"
onClick={() => setIcebreaker("")}
className="shrink-0 text-violet-600 hover:text-violet-400 text-lg leading-none"
title="Dismiss"
>
×
</button>
)}
</motion.div>
)}
</AnimatePresence>
<div className="flex items-end gap-3">
{/* ── [PHASE-1] GIF picker + voice note recorder (additive) */}
{FEATURES.gifs && (
<GifPicker
matchId={matchId}
targetUserId={targetUserId}
userId={userId}
onOptimistic={addOptimisticMessage}
onRemove={removeMessageByClientId}
/>
)}
{FEATURES.voiceNotes && (
<VoiceNoteRecorder
matchId={matchId}
targetUserId={targetUserId}
userId={userId}
onOptimistic={addOptimisticMessage}
onRemove={removeMessageByClientId}
/>
)}
<input
type="file"
accept="image/*"
ref={fileInputRef}
onChange={handleFileSelect}
className="hidden"
/>
<button
type="button"
onClick={() => fileInputRef.current?.click()}
disabled={uploading}
className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
uploading
? "bg-tint-strong cursor-wait text-neutral-500"
: "bg-tint-strong text-neutral-400 hover:text-neutral-200"
}`}
title="Send image"
>
{uploading ? (
<span className="block h-4 w-4 animate-spin rounded-full border-2 border-neutral-500 border-t-transparent" />
) : (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
<path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
</svg>
)}
</button>
<div className="flex-1 rounded-xl border border-hairline bg-tint px-4 py-2">
<textarea
value={input}
onChange={handleInputChange}
onKeyDown={handleKeyDown}
rows={1}
placeholder="Type a message"
className="h-12 w-full resize-none bg-transparent text-sm text-neutral-50 outline-none placeholder:text-neutral-500"
/>
</div>
<button
onClick={sendMessage}
disabled={!input.trim()}
className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 text-white shadow-lg transition ${!input.trim() ? "cursor-not-allowed opacity-60" : "hover:shadow-brand-500/40"}`}
>
<HiPaperAirplane className="rotate-90 text-lg" />
</button>
</div>
</div>
<AnimatePresence>
{collabSuggestion && (
<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
onClick={() => setCollabSuggestion(null)}
/>
<motion.div
initial={{ opacity: 0, scale: 0.9, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.9, y: 20 }}
className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-hairline bg-surface-900 shadow-brand-strong"
>
<style>{`
               .custom-scrollbar::-webkit-scrollbar { width: 4px; }
               .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
               .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
               .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.4); }
             `}</style>
<div className="relative border-b border-brand-500/10 bg-brand-500/5 px-6 py-5">
<button
type="button"
onClick={() => setCollabSuggestion(null)}
className="absolute right-4 top-4 rounded-full p-2 text-neutral-500 transition hover:bg-tint-strong hover:text-white"
>
<HiX className="text-lg" />
</button>
<p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand-500">Collaboration Idea ✨</p>
<h3 className="pr-6 text-xl font-bold text-neutral-50">{collabSuggestion.title}</h3>
</div>
<div className="max-h-[50vh] overflow-y-auto p-6 space-y-5 custom-scrollbar">
<div className="space-y-2">
<p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">The Mission</p>
<div className="rounded-2xl border border-hairline-soft bg-tint p-4 text-[13px] sm:text-sm leading-relaxed text-neutral-300">
{collabSuggestion.description}
</div>
</div>

<div className="space-y-2">
<p className="text-[10px] font-black uppercase tracking-widest text-brand-500/60">AI Insight: Why this works</p>
<p className="text-[13px] italic text-brand-600 bg-brand-500/5 p-4 rounded-2xl border border-brand-500/10 leading-relaxed">
        &quot;{collabSuggestion.why}&quot;
</p>
</div>

<div className="pt-4 flex flex-col gap-3">
<button
onClick={() => {
const msg = `Hey! I just got an AI suggestion for us: "${collabSuggestion.title}". ${collabSuggestion.description.slice(0, 160)}... Let's build this!`;
setInput(msg);
setCollabSuggestion(null);
}}
className="w-full rounded-xl bg-brand-500 py-4 text-sm font-bold text-white transition hover:bg-brand-400 shadow-brand-strong"
>
Post to Chat
</button>
<button
onClick={() => setCollabSuggestion(null)}
className="w-full text-center text-xs font-semibold text-neutral-500 hover:text-neutral-300 py-2"
>
Dismiss
</button>
</div>
</div>
</motion.div>
</div>
)}
</AnimatePresence>

{/* Image preview popup */}
<AnimatePresence>
{previewImage && (
<div
className="fixed inset-0 z-[110] flex items-center justify-center p-4"
onClick={() => setPreviewImage(null)}
>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
/>
<motion.div
initial={{ opacity: 0, scale: 0.9, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.9, y: 20 }}
onClick={(e) => e.stopPropagation()}
className="relative z-10 overflow-hidden rounded-2xl border border-hairline bg-surface-900 shadow-brand-strong"
>
<img
src={previewImage}
alt="Image preview"
className="max-h-[60vh] max-w-[85vw] object-contain"
/>
<button
type="button"
onClick={() => setPreviewImage(null)}
className="absolute right-3 top-3 rounded-full bg-neutral-950/60 p-2 text-neutral-200 transition hover:bg-neutral-950/90 hover:text-white"
title="Close"
>
<HiX className="text-lg" />
</button>
</motion.div>
</div>
)}
</AnimatePresence>
</div>
);
};

export default ChatBox;
