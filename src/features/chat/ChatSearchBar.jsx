/**
 * ChatSearchBar.jsx — search inside the current chat + pinned messages panel.
 * Results are clickable and jump the Virtuoso list to the message.
 */
import { useEffect, useState } from "react";
import { HiSearch, HiX, HiOutlineLocationMarker } from "react-icons/hi";
import { searchMessages } from "./enhancementApi";

const typeIcon = (type) => (type === "image" ? "🖼️" : type === "audio" ? "🎤" : type === "call" ? "📞" : "💬");

const ChatSearchBar = ({ matchId, onJump }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    if (tab === "pinned") {
      setLoading(true);
      searchMessages(matchId, { pinned: true })
        .then((data) => {
          if (!cancelled) setResults(data.messages || []);
        })
        .catch(() => {})
        .finally(() => !cancelled && setLoading(false));
      return () => {
        cancelled = true;
      };
    }
    if (!query.trim()) {
      setResults([]);
      return undefined;
    }
    const t = setTimeout(() => {
      setLoading(true);
      searchMessages(matchId, { query })
        .then((data) => {
          if (!cancelled) setResults(data.messages || []);
        })
        .catch(() => {})
        .finally(() => !cancelled && setLoading(false));
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, tab, query, matchId]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-tint hover:text-neutral-200"
        title="Search chat"
      >
        <HiSearch className="text-base" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-hairline bg-surface-900 shadow-2xl">
          <div className="flex items-center gap-1 border-b border-hairline-soft px-2 py-2">
            <button
              type="button"
              onClick={() => setTab("search")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${tab === "search" ? "bg-brand-500/20 text-brand-300" : "text-neutral-400 hover:bg-tint"}`}
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setTab("pinned")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition ${tab === "pinned" ? "bg-brand-500/20 text-brand-300" : "text-neutral-400 hover:bg-tint"}`}
            >
              <HiOutlineLocationMarker className="text-xs" /> Pinned
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto rounded-full p-1 text-neutral-500 hover:text-neutral-200"
            >
              <HiX className="text-sm" />
            </button>
          </div>
          {tab === "search" && (
            <div className="border-b border-hairline-soft p-2">
              <div className="flex items-center gap-2 rounded-lg bg-tint px-3 py-1.5">
                <HiSearch className="text-xs text-neutral-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search messages…"
                  className="w-full bg-transparent text-xs text-neutral-100 outline-none placeholder:text-neutral-500"
                />
              </div>
            </div>
          )}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-6">
                <span className="spinner h-5 w-5 border-2 text-brand-600" />
              </div>
            ) : results.length ? (
              results.map((msg) => (
                <button
                  key={msg._id}
                  type="button"
                  onClick={() => {
                    onJump?.(msg._id);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left transition hover:bg-tint"
                >
                  <span className="mt-0.5 text-sm">{typeIcon(msg.messageType)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs text-neutral-200">
                      {msg.message}
                    </span>
                    <span className="block text-[10px] text-neutral-500">
                      {new Date(msg.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      {msg.pinnedAt ? " · pinned" : ""}
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-neutral-500">
                {tab === "pinned" ? "No pinned messages" : query.trim() ? "No results" : "Type to search"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSearchBar;
