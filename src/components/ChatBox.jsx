/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Virtuoso } from "react-virtuoso";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiArrowLeft,
  HiPaperAirplane,
  HiCheck,
  HiOutlineExclamation,
  HiDotsVertical,
  HiBan,
  HiFlag,
  HiX,
} from "react-icons/hi";
import { BASE_URL, createSocketConnection } from "../utils/constant";
import { ensureCrypto, isCryptoReady, encryptMessage, decryptMessage, canEncryptWith } from "../utils/e2ee";
import { useToast } from "../context/ToastProvider";
import { getOnlineStatus, formatTimeAgo } from "../utils/timeUtils";
import { resolvePhotoUrl } from "../utils/avatar";
import { generateIcebreaker, suggestCollaboration, aiErrorMessage } from "../utils/aiApi";
import CallButton from "./call/CallButton";

const MESSAGE_LIMIT = 30;

const generateClientId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getStatusLabel = (message, isMine) => {
  if (!isMine) return null;
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

const decorateMessage = (payload, userId, targetUserId) => ({
  ...payload,
  sender: payload.senderId === userId ? "me" : "them",
  isOwn: payload.senderId === userId,
  counterpartId: payload.senderId === userId ? targetUserId : payload.senderId,
  receiverId: payload.receiverId,
});

// Decrypt an incoming message for display. If it isn't encrypted, or we can't
// decrypt it (e.g. missing peer key), return it with a safe placeholder so the
// UI never crashes on ciphertext.
const decryptIncoming = async (msg) => {
  if (!msg?.isEncrypted) return msg;
  if (!isCryptoReady()) return { ...msg, message: "[encrypted message]" };
  try {
    const peer = msg.senderId === userId ? msg.receiverId : msg.senderId;
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

  const connections = useSelector((state) => state.connections);
  const user = useSelector((state) => state.user);
  const userId = user?._id;
  const otherUser = connections?.find((conn) => conn._id === targetUserId);

  const [matchId, setMatchId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showMenu, setShowMenu] = useState(false);
  const [icebreaker, setIcebreaker] = useState("");
  const [icebreakerLoading, setIcebreakerLoading] = useState(false);
  const [collabSuggestion, setCollabSuggestion] = useState(null);
  const [collabLoading, setCollabLoading] = useState(false);
  const { addToast } = useToast();

  const blockUser = async () => {
    try {
      await axios.post(`${BASE_URL}/block`, { userId: targetUserId }, { withCredentials: true });
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
      await axios.post(`${BASE_URL}/report`, { userId: targetUserId, reason: "Inappropriate behavior" }, { withCredentials: true });
      addToast("User reported", "success");
      setShowMenu(false);
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to report user", "error");
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
      const { data } = await axios.get(`${BASE_URL}/chat/${targetUserId}?limit=${MESSAGE_LIMIT}`, {
        withCredentials: true,
      });
      setMatchId(data.data.chat.matchId);

      const raw = (data.data.messages ?? []).map((msg) =>
        decorateMessage(msg, userId, targetUserId)
      );

      // Initialize E2E in the background; a failure must not block the chat.
      try {
        await ensureCrypto({ userId });
      } catch {
        /* fall back to plaintext/placeholder display */
      }

      const decorated = await Promise.all(raw.map((msg) => decryptIncoming(msg)));
      setMessages(decorated);
      setPage(1);
      setHasMore(raw.length === MESSAGE_LIMIT);
      setError(null);

      // Fetch icebreaker only on a fresh/empty chat
      if (raw.length === 0 && targetUserId) {
        fetchIcebreaker();
      }
    } catch (err) {
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
      const nextPage = page + 1;
      const { data } = await axios.get(
        `${BASE_URL}/messages/${matchId}?page=${nextPage}&limit=${MESSAGE_LIMIT}`,
        { withCredentials: true }
      );
       const decorated = await Promise.all(
         data.data.messages.map((msg) => decryptIncoming(decorateMessage(msg, userId, targetUserId)))
       );
       if (decorated.length) {
         setMessages((prev) => [...decorated, ...prev]);
         virtuosoRef.current?.prependItems(decorated.length);
       }
       setPage(nextPage);
       setHasMore(data.data.hasMore);
    } catch (err) {
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

  const handleAck = async (payload) => {
    pendingTimeoutsRef.current.get(payload.clientMessageId)?.();
    pendingTimeoutsRef.current.delete(payload.clientMessageId);
    const decrypted = await decryptIncoming(payload);
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

  const initializeSocket = () => {
    if (!userId) return;
    const socket = createSocketConnection(userId);
    socketRef.current = socket;

    socket.emit("joinChat", { userId, targetUserId, matchId });

    socket.on("chat:joined", ({ matchId: serverMatchId }) => {
      setMatchId(serverMatchId);
    });

    socket.on("message:created", async (msg) => {
      const decrypted = await decryptIncoming(msg);
      upsertMessage(decorateMessage(decrypted, userId, targetUserId));
    });

    socket.on("message:ack", (msg) => {
      handleAck(msg);
    });

    socket.on("messages:delivered", (payload) => handleDeliveryUpdate(payload, "delivered"));
    socket.on("messages:seen", (payload) => handleDeliveryUpdate(payload, "seen"));

    socket.on("typing:start", (payload) => handleTyping(payload, true));
    socket.on("typing:stop", (payload) => handleTyping(payload, false));

    socket.on("message:deleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
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
      socketRef.current.off("chat:joined");
      socketRef.current.off("message:created");
      socketRef.current.off("message:ack");
      socketRef.current.off("messages:delivered");
      socketRef.current.off("messages:seen");
      socketRef.current.off("typing:start");
      socketRef.current.off("typing:stop");
      socketRef.current.off("message:deleted");
      socketRef.current.off("chat:error");
    };
  }, [userId, targetUserId, matchId]);

  useEffect(() => {
    if (!matchId || !userId) return;
    const unseen = sortedMessages.filter((msg) => !msg.seen && !msg.isOwn);
    if (!unseen.length) return;
    socketRef.current?.emit("message:seen", { userId, matchId });
    axios.patch(
      `${BASE_URL}/messages/seen`,
      { matchId },
      { withCredentials: true }
    ).catch(() => {});
  }, [sortedMessages, matchId, userId]);


  const schedulePendingTimeout = (clientMessageId) => {
    const timer = setTimeout(() => {
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
    if (!socketRef.current || !input.trim() || !userId || !targetUserId) return;
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
    schedulePendingTimeout(clientMessageId);
    socketRef.current.emit("sendMessage", payload);
  };

  const handleRetry = async (message) => {
    if (!socketRef.current) return;
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
    schedulePendingTimeout(retriedPayload.clientMessageId);
    emitTyping(false);
    socketRef.current.emit("sendMessage", retriedPayload);
  };

  const handleDelete = async (message) => {
    try {
      await axios.delete(`${BASE_URL}/messages/${message._id}`, { withCredentials: true });
      socketRef.current?.emit("message:delete", { messageId: message._id, matchId });
      setMessages((prev) => prev.filter((msg) => msg._id !== message._id));
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete message", "error");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
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
            const showAvatar = !message.isOwn && (index === 0 || sortedMessages[index - 1]?.senderId !== message.senderId);
            return (
              <motion.div
                layout
                className={`mb-4 flex w-full gap-3 px-6 ${message.isOwn ? "justify-end" : "justify-start text-left"}`}
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
                <div 
                  className={`relative flex max-w-[75%] flex-col rounded-2xl px-3 py-1.5 text-sm shadow-sm transition-all sm:max-w-[70%] group ${
                    message.isOwn 
                      ? "bg-brand-500 text-white rounded-br-none" 
                      : "bg-surface-800 text-neutral-100 border border-hairline-soft rounded-bl-none"
                  }`}
                >
                  <p className="break-words whitespace-pre-wrap leading-relaxed">
                    {message.message}
                  </p>
                  {message.isOwn && (
                    <button
                      type="button"
                      onClick={() => handleDelete(message)}
                      className="absolute -top-2 -right-2 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-white text-xs shadow-md hover:bg-error-600 transition"
                    >
                      ✕
                    </button>
                  )}
                  <div className={`mt-0.5 flex items-center gap-1.5 text-[10px] tabular-nums ${message.isOwn ? "justify-end text-white/70" : "text-neutral-400"}`}>
                    <span>{formatMessageTime(message.createdAt)}</span>
                    {message.isOwn && (
                      <>
                        <span className="opacity-40">•</span>
                        <span>{getStatusLabel(message, true)}</span>
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
              </motion.div>
            );
          }}
        />
      )}
      </div>

      <div className="flex flex-col gap-2 border-t border-hairline-soft px-4 py-3">
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
                    "{collabSuggestion.why}"
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
    </div>
  );
};

export default ChatBox;
