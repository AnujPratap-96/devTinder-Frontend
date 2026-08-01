import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useConnectionList from "../hooks/useConnectionList";
import { motion } from "framer-motion";
import { HiChat, HiSearch, HiArrowDown, HiOutlineLocationMarker } from "react-icons/hi";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";
// ── [PHASE-1] pinned conversations
import { FEATURES } from "../config/features";
import { getChatPrefs } from "../features/chat/enhancementApi";

const Messages = () => {
  const { connections, hasMore, loadMore, loadingMore } = useConnectionList();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  // [PHASE-1] pinned conversation ids
  const [pinnedIds, setPinnedIds] = useState(new Set());

  useEffect(() => {
    if (!FEATURES.chatPrefs) return;
    getChatPrefs().then((data) => {
      const ids = Object.entries(data.prefs ?? {})
        .filter(([, prefs]) => prefs?.pinned)
        .map(([matchId]) => matchId);
      setPinnedIds(new Set(ids));
    }).catch(() => {});
  }, []);

  const filteredConnections = useMemo(() => {
    if (!connections) return [];
    const normalized = query.trim().toLowerCase();
    const base = normalized
      ? connections.filter((conn) => {
          const name = `${conn.firstName ?? ""} ${conn.lastName ?? ""}`.toLowerCase();
          const about = (conn.about ?? "").toLowerCase();
          return name.includes(normalized) || about.includes(normalized);
        })
      : connections;
    // [PHASE-1] pinned-first ordering (additive; no-op when no prefs loaded)
    if (FEATURES.chatPrefs && pinnedIds.size > 0) {
      return [...base].sort((a, b) => Number(pinnedIds.has(b._id)) - Number(pinnedIds.has(a._id)));
    }
    return base;
  }, [connections, query, pinnedIds]);

  const hasConnections = Boolean(connections?.length);
  const hasResults = filteredConnections.length > 0;
  const isSearching = query.trim().length > 0;

  return (
    <div className="w-full space-y-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-heading-md text-neutral-50">Messages</h1>
          <p className="mt-1 text-body-sm text-neutral-400">
            {hasConnections
              ? `${connections.length} conversation${connections.length !== 1 ? "s" : ""}`
              : "No conversations yet"}
          </p>
        </div>
        {hasConnections && (
          <div className="relative w-full max-w-xs">
            <HiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search conversations"
              placeholder="Search conversations"
              className="input-base h-11 pl-11"
            />
          </div>
        )}
      </div>

      {hasConnections && hasResults ? (
        <>
          <div className="mx-auto w-full max-w-2xl space-y-4">
            <ul className="flex flex-col gap-3">
              {filteredConnections.map((conn, index) => (
                <li key={conn._id}>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => navigate(`/chat/${conn._id}`)}
                    className="flex w-full items-center gap-4 rounded-xl border border-hairline-soft bg-surface-800/40 px-5 py-4 text-left transition duration-200 ease-snappy hover:-translate-y-0.5 hover:bg-surface-800/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="avatar-ring h-12 w-12 overflow-hidden">
                        <img
                          src={Array.isArray(conn.photoUrl) ? conn.photoUrl[0] : conn.photoUrl || "https://via.placeholder.com/150"}
                          alt={conn.firstName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-neutral-950 ${conn.isOnline ? "bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-neutral-600"}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-body-sm font-semibold text-neutral-50">
                          {conn.firstName} {conn.lastName}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                          {conn.isOnline ? (
                            <span className="text-success-500 font-medium">Active now</span>
                          ) : conn.lastSeenAt ? (
                            <span>Seen {new Date(conn.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-1 truncate text-body-xs text-neutral-400">
                        {conn.about || "Click to start chatting..."}
                      </p>
                    </div>

                    {conn.unreadCount > 0 && (
                      <div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white shadow-brand-glow animate-pulse">
                        {conn.unreadCount}
                      </div>
                    )}

                    {pinnedIds.has(conn._id) && (
                      <HiOutlineLocationMarker className="text-base text-brand-400" title="Pinned conversation" />
                    )}
                    <HiChat className="text-base text-neutral-700" />
                  </motion.button>
                </li>
              ))}
            </ul>

            {isSearching && (
              <p className="text-body-xs text-neutral-500">
                Showing {filteredConnections.length} result{filteredConnections.length === 1 ? "" : "s"} for “{query.trim()}”.
              </p>
            )}
          </div>
          {hasMore && !isSearching && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="secondary"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? <span className="spinner h-4 w-4 border-2 text-brand-600" /> : <HiArrowDown className="text-lg" />}
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      ) : !hasConnections ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md"
        >
          <EmptyState
            icon={<HiChat className="text-3xl" />}
            title="No messages yet"
            description="Connect with developers on the Explore page to start chatting."
            tone="translucent"
            action={
              <Button variant="primary" size="sm" onClick={() => navigate("/feed")}>
                Start Exploring
              </Button>
            }
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md"
        >
          <EmptyState
            icon={<HiSearch className="text-3xl" />}
            title="No matches found"
            description="Try adjusting your search terms to find the conversation you need."
            tone="translucent"
            secondaryAction={
              <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
                Clear search
              </Button>
            }
          />
        </motion.div>
      )}
    </div>
  );
};

export default Messages;
