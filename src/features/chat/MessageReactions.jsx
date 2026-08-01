/**
 * MessageReactions.jsx — emoji reactions under a chat message.
 * Emits `message:react` over the socket; the server broadcasts the updated
 * reaction list back as `message:reacted` (listened in ChatBox).
 */
import { useEffect, useRef, useState } from "react";
import { HiOutlineEmojiHappy } from "react-icons/hi";

const EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "👀", "🚀", "💡"];

const groupReactions = (reactions = [], myUserId) => {
  const map = new Map();
  reactions.forEach((r) => {
    const entry = map.get(r.emoji) || { emoji: r.emoji, count: 0, reactedByMe: false };
    entry.count += 1;
    if (r.userId === myUserId) entry.reactedByMe = true;
    map.set(r.emoji, entry);
  });
  return [...map.values()];
};

const MessageReactions = ({ message, matchId, userId, emit }) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const rootRef = useRef(null);
  const reactions = groupReactions(message.reactions, userId);
  const hasReactions = reactions.length > 0;

  // Close the picker when clicking outside of it
  useEffect(() => {
    if (!pickerOpen) return undefined;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [pickerOpen]);

  const react = (emoji) => {
    if (!emit || !matchId) return;
    emit("message:react", { matchId, messageId: message._id, emoji });
    setPickerOpen(false);
  };

  return (
    <div ref={rootRef} className="relative z-20">
      {hasReactions && (
        <div className={`mt-1 flex items-center gap-1 ${message.isOwn ? "justify-end" : "justify-start"}`}>
          {reactions.map((r) => (
            <button
              key={r.emoji}
              type="button"
              onClick={() => react(r.emoji)}
              className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] transition ${
                r.reactedByMe
                  ? "border-brand-500/60 bg-brand-500/20 text-brand-200"
                  : "border-hairline-soft bg-tint-strong text-neutral-300 hover:bg-tint"
              }`}
              title={`${r.emoji} (${r.count})`}
            >
              <span>{r.emoji}</span>
              <span className="tabular-nums">{r.count}</span>
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setPickerOpen((v) => !v)}
        className={`pointer-events-none group-hover:pointer-events-auto absolute top-full z-10 mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-tint-strong text-neutral-400 opacity-0 transition hover:text-brand-400 group-hover:opacity-100 ${
          message.isOwn ? "right-2" : "left-2"
        }`}
        title="Add reaction"
      >
        <HiOutlineEmojiHappy className="text-xs" />
      </button>
      {pickerOpen && (
        <div
          className={`absolute top-full z-20 mt-0.5 flex items-center gap-0.5 rounded-full border border-hairline-soft bg-surface-900 px-1.5 py-1 shadow-xl ${
            message.isOwn ? "right-0" : "left-0"
          }`}
        >
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => react(emoji)}
              className="rounded-full p-0.5 text-sm transition hover:bg-tint"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;
