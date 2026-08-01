/**
 * MessageReactions.jsx — emoji reactions under a chat message.
 * Emits `message:react` over the socket; the server broadcasts the updated
 * reaction list back as `message:reacted` (listened in ChatBox).
 */
import { useState } from "react";
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
  const reactions = groupReactions(message.reactions, userId);

  const react = (emoji) => {
    if (!emit || !matchId) return;
    emit("message:react", { matchId, messageId: message._id, emoji });
    setPickerOpen(false);
  };

  if (!reactions.length && !pickerOpen) {
    return (
      <div className="mt-1 flex">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-tint-strong text-neutral-400 opacity-0 transition hover:text-neutral-200 group-hover:opacity-100"
          title="React"
        >
          <HiOutlineEmojiHappy className="text-xs" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1">
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
      <button
        type="button"
        onClick={() => setPickerOpen((v) => !v)}
        className="flex h-5 w-5 items-center justify-center rounded-full bg-tint-strong text-neutral-400 transition hover:text-brand-400"
        title="Add reaction"
      >
        <HiOutlineEmojiHappy className="text-xs" />
      </button>
      {pickerOpen && (
        <div className="flex items-center gap-0.5 rounded-full border border-hairline-soft bg-surface-900 px-1.5 py-1 shadow-xl">
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
