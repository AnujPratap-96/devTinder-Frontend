/**
 * MessageReactions.jsx — Instagram-style reactions on chat messages.
 *
 * Behaviour mirrors Instagram DMs:
 *  • double-tap / double-click on a message  → quick-react (default ❤️, toggles off)
 *  • press-and-hold (or right-click)         → emoji tray floats above the bubble
 *  • hovering a message reveals a smiley     → opens the same tray (desktop)
 *  • one reaction per user per message — a new emoji REPLACES the old one,
 *    tapping the same emoji again removes it (also enforced server-side)
 *
 * Wrap the message bubble with <MessageReactions>{bubble}</MessageReactions>.
 * Anything special message owners are toggled via `message.isOwn`.
 */
import { useEffect, useRef, useState } from "react";
import { HiOutlineEmojiHappy, HiPlus } from "react-icons/hi";
import { FEATURES } from "../../config/features";

/* eslint-disable react/prop-types */
export const DEFAULT_REACTION = "❤️";

export const QUICK_REACTIONS = ["❤️", "😍", "😂", "😮", "😢", "👍", "👏"];

export const MORE_EMOJIS = [
  "😀", "😄", "😁", "😆", "😅", "🤣", "😊", "😇", "🙂", "😉", "😎", "🥳",
  "🤩", "😘", "😋", "🤔", "🤭", "😴", "😏", "🙄", "😪", "😵", "🤯", "🤧",
  "😢", "😭", "😤", "😡", "🤬", "😅", "👍", "👎", "👌", "✌️", "🤞", "🤝",
  "👏", "🙏", "💪", "🔥", "🎉", "💫", "💖", "💔", "💜", "💚", "✅", "⭐",
];

const HOLD_MS = 550;
const DOUBLE_TAP_MS = 300;

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

const MessageReactions = ({ message, matchId, userId, emit, children, className = "" }) => {
  const own = Boolean(message?.isOwn);
  const [trayOpen, setTrayOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const rootRef = useRef(null);
  const holdTimer = useRef(null);
  const lastTapAt = useRef(0);

  const reactions = groupReactions(message?.reactions, userId);
  const hasReactions = reactions.length > 0;

  const closeTray = () => {
    setTrayOpen(false);
    setShowMore(false);
  };

  const openTray = () => setTrayOpen(true);

  useEffect(() => {
    if (!trayOpen) return undefined;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) closeTray();
    };
    const onKey = (e) => {
      if (e.key === "Escape") closeTray();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [trayOpen]);

  const clearHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const react = (emoji) => {
    if (!emit || !matchId) return;
    emit("message:react", { matchId, messageId: message?._id, emoji });
    closeTray();
  };

  const quickReactHeart = () => react(QUICK_REACTIONS[0]);

  const startHold = () => {
    clearHold();
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      setTrayOpen(true);
    }, HOLD_MS);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    startHold();
  };

  const handleTouchStart = () => startHold();

  // A press-that-lasted long enough opens the tray; otherwise the release is a
  // tap which we feed into a manual double-tap detector (touch rarely fires
  // onDoubleClick reliably). For mouse, the browser's dblclick covers it.
  const handleTouchEnd = () => {
    const wasHold = holdTimer.current === null;
    clearHold();
    if (wasHold) {
      lastTapAt.current = 0;
      return; // tray already opened by the hold
    }
    const now = Date.now();
    if (now - lastTapAt.current <= DOUBLE_TAP_MS) {
      lastTapAt.current = 0;
      quickReactHeart();
      return;
    }
    lastTapAt.current = now;
  };

  const handleDoubleClick = () => {
    clearHold();
    quickReactHeart();
  };

  // Feature flag off → behave as a plain wrapper so the chat layout is
  // unaffected (reactions fully disabled).
  if (!FEATURES.reactions) return <>{children}</>;

  return (
    <div
      ref={rootRef}
      className={`group/msg relative flex flex-col ${className} ${own ? "items-end" : "items-start"}`}
      style={{ touchAction: "manipulation" }}
      onMouseDown={handleMouseDown}
      onMouseUp={clearHold}
      onMouseLeave={clearHold}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => {
        e.preventDefault();
        openTray();
      }}
    >
      <div className="relative">
        {/* bubble content */}
        {children}

        {/* Instagram-style reaction anchor: hover smiley (desktop) */}
        <button
          type="button"
          onClick={openTray}
          aria-label="React"
          title="Add reaction"
          className={`pointer-events-none absolute -bottom-2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-tint-strong text-neutral-400 opacity-0 shadow-sm transition group-hover/msg:pointer-events-auto group-hover/msg:opacity-100 hover:text-brand-400 ${
            own ? "right-1" : "right-1"
          }`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <HiOutlineEmojiHappy className="text-[10px]" />
        </button>

        {/* reaction tray above the bubble (Instagram style) */}
        {trayOpen && (
          <div
            className={`absolute top-full z-30 mt-1.5 rounded-full border border-hairline-soft bg-surface-900/95 p-1 shadow-strong backdrop-blur-md ${
              own ? "right-0" : "left-0"
            } ${showMore ? "max-w-[240px] rounded-2xl" : ""}`}
            onMouseDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            {showMore ? (
              <div className="grid max-h-48 w-[240px] grid-cols-6 gap-0.5 overflow-y-auto p-0.5">
                {MORE_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => react(emoji)}
                    className="rounded-lg p-0.5 text-lg transition hover:bg-tint"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-0.5">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => react(emoji)}
                    className="rounded-full px-1.5 py-0.5 text-lg transition hover:bg-tint">
                    {emoji}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowMore(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition hover:bg-tint hover:text-brand-400"
                  aria-label="More emojis"
                >
                  <HiPlus className="text-base" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* existing reactions (Instagram stamps them under the bubble) */}
      {hasReactions && (
        <div className={`mt-1 flex items-center gap-1 ${own ? "justify-end" : "justify-start"}`}>
          {reactions.map((r) => (
            <button
              key={r.emoji}
              type="button"
              onClick={() => react(r.emoji)}
              className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] transition ${
                r.reactedByMe
                  ? "border-brand-500/60 bg-brand-500/20 text-brand-200"
                  : "border-hairline-soft bg-tint-strong text-neutral-300 hover:bg-tint"
              }`}
              title={`${r.emoji} ${r.count}`}
            >
              <span>{r.emoji}</span>
              <span className="tabular-nums">{r.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;