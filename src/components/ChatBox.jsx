/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Virtuoso } from "react-virtuoso";
import { motion } from "framer-motion";
import {
  HiArrowLeft,
  HiPaperAirplane,
  HiCheck,
  HiOutlineExclamation,
  HiDotsVertical,
  HiBan,
  HiFlag,
} from "react-icons/hi";
import { BASE_URL, createSocketConnection } from "../utils/constant";
import { useToast } from "../context/ToastProvider";
import { getOnlineStatus, formatTimeAgo } from "../utils/timeUtils";

const MESSAGE_LIMIT = 30;

const generateClientId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const getStatusLabel = (message, isMine) => {
  if (!isMine) return null;
  if (message.seen) {
    return <span className="text-brand-300">✔✔</span>;
  }
  if (message.delivered) {
    return <span className="text-neutral-400">✔✔</span>;
  }
  if (message.status === "failed") {
    return <HiOutlineExclamation className="text-error-400" />;
  }
  if (message.status === "pending") {
    return <span className="text-neutral-500">…</span>;
  }
  return <HiCheck className="text-neutral-500" />;
};

const decorateMessage = (payload, userId, targetUserId) => ({
  ...payload,
  sender: payload.senderId === userId ? "me" : "them",
  isOwn: payload.senderId === userId,
  counterpartId: payload.senderId === userId ? targetUserId : payload.senderId,
  receiverId: payload.receiverId,
});

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
  const { addToast } = useToast();

  const blockUser = async () => {
    try {
      await axios.post(`${BASE_URL}/user/block`, { blockedUserId: targetUserId }, { withCredentials: true });
      addToast("User blocked", "success");
      setShowMenu(false);
      navigate("/messages");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to block user", "error");
    }
  };

  const reportUser = async () => {
    try {
      await axios.post(`${BASE_URL}/user/report`, { reportedUserId: targetUserId, reason: "Inappropriate behavior" }, { withCredentials: true });
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
      const { data } = await axios.get(`${BASE_URL}/chat/${targetUserId}?limit=${MESSAGE_LIMIT}`, {
        withCredentials: true,
      });
      setMatchId(data.chat.matchId);
      setMessages((prev) => {
        const decorated = data.messages.map((msg) => decorateMessage(msg, userId, targetUserId));
        return [...decorated];
      });
      setPage(1);
      setHasMore((data.messages ?? []).length === MESSAGE_LIMIT);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load messages");
      addToast(err.response?.data?.message || "Unable to load messages", "error");
    }
  };

  const handleLoadOlder = async () => {
    if (!matchId || loadingOlder || !hasMore) return;
    setLoadingOlder(true);
    try {
      const nextPage = page + 1;
      const { data } = await axios.get(
        `${BASE_URL}/messages/${matchId}?page=${nextPage}&limit=${MESSAGE_LIMIT}`,
        { withCredentials: true }
      );
      const decorated = data.messages.map((msg) => decorateMessage(msg, userId, targetUserId));
      if (decorated.length) {
        setMessages((prev) => [...decorated, ...prev]);
        virtuosoRef.current?.prependItems(decorated.length);
      }
      setPage(nextPage);
      setHasMore(data.hasMore);
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

  const handleAck = (payload) => {
    pendingTimeoutsRef.current.get(payload.clientMessageId)?.();
    pendingTimeoutsRef.current.delete(payload.clientMessageId);
    upsertMessage(decorateMessage(payload, userId, targetUserId));
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

    socket.on("message:created", (msg) => {
      upsertMessage(decorateMessage(msg, userId, targetUserId));
    });

    socket.on("message:ack", (msg) => {
      handleAck(msg);
    });

    socket.on("messages:delivered", (payload) => handleDeliveryUpdate(payload, "delivered"));
    socket.on("messages:seen", (payload) => handleDeliveryUpdate(payload, "seen"));

    socket.on("typing:start", (payload) => handleTyping(payload, true));
    socket.on("typing:stop", (payload) => handleTyping(payload, false));

    socket.on("chat:error", ({ message }) => {
      addToast(message, "error");
    });
  };

  useEffect(() => {
    fetchInitialMessages();
  }, [targetUserId, userId]);

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

  const sendMessage = () => {
    if (!socketRef.current || !input.trim() || !userId || !targetUserId) return;
    const clientMessageId = generateClientId();
    const payload = {
      matchId,
      userId,
      targetUserId,
      message: input.trim(),
      messageType: "text",
      clientMessageId,
      receiverId: targetUserId,
    };
    const pendingMessage = decorateMessage(
      {
        ...payload,
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

  const handleRetry = (message) => {
    if (!socketRef.current) return;
    const retriedPayload = {
      matchId,
      userId,
      targetUserId,
      message: message.message,
      messageType: message.messageType,
      clientMessageId: generateClientId(),
      receiverId: targetUserId,
    };
    const pendingMessage = decorateMessage(
      {
        ...retriedPayload,
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

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (error) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-surface-900/70">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-error-500/20 bg-error-500/10 text-3xl">
          ⚠️
        </div>
        <p className="text-base font-semibold text-error-300">{error}</p>
        <button
          onClick={() => navigate("/messages")}
          className="rounded-lg border border-white/10 px-5 py-2 text-sm font-semibold text-neutral-200 hover:bg-white/5"
        >
          ← Back to Messages
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[520px] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface-900/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
        <button
          onClick={() => navigate("/messages")}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-neutral-300 transition hover:bg-white/10"
        >
          <HiArrowLeft className="text-base" />
        </button>
        {otherUser && (
          <div className="flex items-center gap-3 flex-1">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-brand-400/30">
              <img
                src={otherUser.photoUrl?.[0] || "https://via.placeholder.com/40"}
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
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
              >
                <HiDotsVertical className="text-lg" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-white/10 bg-surface-900 py-1 shadow-xl z-50">
                  <button
                    type="button"
                    onClick={blockUser}
                    className="w-full px-4 py-2 text-left text-sm text-warning-400 hover:bg-white/5 flex items-center gap-2"
                  >
                    <HiBan className="text-sm" /> Block
                  </button>
                  <button
                    type="button"
                    onClick={reportUser}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-400 hover:bg-white/5 flex items-center gap-2"
                  >
                    <HiFlag className="text-sm" /> Report
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1">
        <Virtuoso
          ref={virtuosoRef}
          data={sortedMessages}
          followOutput="smooth"
          startReached={handleLoadOlder}
          overscan={200}
          className="h-full px-5 py-4"
          itemContent={(index, message) => {
            const showAvatar = !message.isOwn && (index === 0 || sortedMessages[index - 1]?.senderId !== message.senderId);
            return (
              <motion.div
                layout
                className={`mb-3 flex w-full items-end gap-2 ${message.isOwn ? "justify-end" : "justify-start"}`}
              >
                {!message.isOwn && (
                  <div className={`h-8 w-8 overflow-hidden rounded-lg border border-white/5 transition ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                    <img
                      src={otherUser?.photoUrl?.[0] || "https://via.placeholder.com/32"}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm leading-relaxed sm:max-w-md ${message.isOwn ? "bg-gradient-to-br from-brand-500 to-brand-400 text-white" : "border border-white/10 bg-white/10 text-neutral-100"}`}>
                  <p>{message.message}</p>
                  <div className="mt-1 flex items-center justify-end gap-2 text-xs text-neutral-300">
                    <span>{formatMessageTime(message.createdAt)}</span>
                    <span>{getStatusLabel(message, message.isOwn)}</span>
                    {message.status === "failed" && (
                      <button
                        type="button"
                        onClick={() => handleRetry(message)}
                        className="rounded-md border border-white/20 px-2 py-0.5 text-[11px] text-white/90 hover:bg-white/10"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          }}
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-white/5 px-4 py-3">
        {typingUsers.size > 0 && (
          <p className="text-xs text-brand-200">Someone is typing…</p>
        )}
        <div className="flex items-end gap-3">
          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
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
    </div>
  );
};

export default ChatBox;
