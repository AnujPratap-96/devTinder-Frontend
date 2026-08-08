import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiMail, HiCheckCircle, HiXCircle, HiClock, HiBan, HiUserAdd, HiArrowRight, HiCollection, HiPaperAirplane } from "react-icons/hi";
import { FiSend, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useToast } from "../context/ToastProvider";
import { getInviteStats, getInvites, sendInvite, cancelInvite } from "../api/invite";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Spinner from "./ui/Spinner";
import EmptyState from "./ui/EmptyState";

const statusConfig = {
  pending: { icon: HiClock, label: "Pending", className: "bg-warning-400/10 text-warning-400 border-warning-400/25" },
  accepted: { icon: HiCheckCircle, label: "Accepted", className: "bg-success-500/10 text-success-500 border-success-500/25" },
  expired: { icon: HiXCircle, label: "Expired", className: "bg-neutral-500/10 text-neutral-400 border-neutral-500/25" },
  cancelled: { icon: HiBan, label: "Cancelled", className: "bg-error-500/10 text-error-500 border-error-500/25" },
};

const TABS = [
  { key: "invite", label: "Invite", icon: HiPaperAirplane },
  { key: "history", label: "History", icon: HiCollection },
];

const InviteFriends = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const user = useSelector((s) => s.user);
  const inputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("invite");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [invites, setInvites] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const hasLoaded = useRef(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getInviteStats();
      setStats(data);
    } catch (err) {
      if (err?.response?.status !== 429) {
        addToast("Failed to load invite stats", "error");
      }
    }
  }, [addToast]);

  const fetchHistory = useCallback(async (cursor = null, append = false) => {
    try {
      const params = { limit: 20 };
      if (cursor) params.cursor = cursor;
      if (append) setLoadingMore(true);
      const data = await getInvites(params);
      const { invites: page, nextCursor: next, hasMore: more } = data;
      setInvites((prev) => (append ? [...prev, ...page] : page));
      setNextCursor(next);
      setHasMore(more);
    } catch (err) {
      addToast("Failed to load invite history", "error");
    } finally {
      setLoadingMore(false);
    }
  }, [addToast]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    fetchHistory(nextCursor, true);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchHistory()]);
      setLoading(false);
    };
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      init();
    }
  }, [fetchStats, fetchHistory]);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed || !validateEmail(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setSending(true);
    try {
      const data = await sendInvite(trimmed);
      addToast("Invitation sent successfully!", "success");
      setEmail("");
      const newInvite = data?.invite;
      if (newInvite) {
        setInvites((prev) => [newInvite, ...prev]);
      }
      setStats((prev) => prev ? { ...prev, totalSent: prev.totalSent + 1, remaining: Math.max(0, prev.remaining - 1) } : prev);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to send invitation";
      addToast(msg, "error");
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (inviteId) => {
    try {
      await cancelInvite(inviteId);
      addToast("Invite cancelled", "info");
      setInvites((prev) => prev.map((inv) => inv._id === inviteId ? { ...inv, status: "cancelled" } : inv));
      setStats((prev) => prev ? { ...prev, pending: Math.max(0, prev.pending - 1) } : prev);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to cancel", "error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !sending) handleSend();
  };

  const goToInviteTab = () => {
    setActiveTab("invite");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        <div className="space-y-3">
          <div className="skeleton h-8 w-48 rounded-xl" />
          <div className="skeleton h-4 w-72 rounded-lg" />
        </div>
        <div className="skeleton h-32 w-full rounded-3xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const isLimitReached = stats?.remaining === 0 && stats?.limit !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl space-y-8 px-4 py-8"
    >
      <div>
        <h1 className="text-display-sm font-bold text-neutral-50">Invite Friends</h1>
        <p className="mt-2 text-body-md text-neutral-400">Invite developers to join the platform.</p>
      </div>

      <div className="flex gap-2">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === key ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20" : "text-neutral-400 hover:text-neutral-200 hover:bg-tint"
            }`}
          >
            <Icon className="text-base" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "invite" && (
        <div className="space-y-8">
          {stats && (
            <Card tone="accent" padding="md" className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400">
                  <HiUserAdd className="text-xl" />
                </span>
                <div>
                  <p className="text-body-sm text-neutral-400">Remaining this month</p>
                  <p className="text-display-sm font-bold text-neutral-50">
                    {stats.limit !== null ? `${stats.remaining} / ${stats.limit}` : "Unlimited"}
                  </p>
                </div>
              </div>
              {stats.limit !== null && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-neutral-700">
                    <div
                      className="h-full rounded-full bg-brand-400 transition-all duration-500"
                      style={{ width: `${stats.limit > 0 ? ((stats.limit - stats.remaining) / stats.limit) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-body-xs text-neutral-500">{stats.limit - stats.remaining}/{stats.limit}</span>
                </div>
              )}
            </Card>
          )}

          <Card tone="glass" padding="md" className="space-y-5">
            <h2 className="text-heading-sm font-semibold text-neutral-50">Send Invitation</h2>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-neutral-400" />
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    placeholder="developer@example.com"
                    disabled={isLimitReached}
                    className="input-base w-full rounded-2xl border border-hairline bg-surface-900 py-3.5 pl-12 pr-4 text-body-md text-neutral-50 placeholder-neutral-500 transition duration-200 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-400/20 disabled:opacity-50"
                  />
                </div>
                {error && <p className="mt-2 text-body-xs text-error-500">{error}</p>}
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleSend}
                loading={sending}
                disabled={isLimitReached}
                className="shrink-0"
              >
                <FiSend className="text-base" />
                Send Invite
              </Button>
            </div>

            {isLimitReached && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-brand-400/25 bg-gradient-to-br from-brand-500/15 via-brand-400/10 to-accent-cyan/10 p-5 text-center"
              >
                <p className="text-body-sm text-neutral-300">
                  You've used all invites included in your current plan.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/premium")}
                  className="mt-4"
                >
                  Upgrade to send more
                  <HiArrowRight className="text-base" />
                </Button>
              </motion.div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "history" && (
        <div>
          <h2 className="mb-4 text-heading-sm font-semibold text-neutral-50">Invite History</h2>
          {invites.length === 0 ? (
            <EmptyState
              icon={<HiMail className="text-2xl" />}
              title="No invitations yet"
              description="Start inviting your developer friends to join the platform."
              action={
                <Button variant="primary" size="sm" onClick={goToInviteTab}>
                  Send Your First Invite
                </Button>
              }
            />
          ) : (
            <Card tone="glass" padding="none" className="overflow-hidden">
              <div className="divide-y divide-hairline-soft">
                <AnimatePresence initial={false}>
                  {invites.map((inv) => {
                    const Status = statusConfig[inv.status] || statusConfig.pending;
                    return (
                      <motion.div
                        key={inv._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-tint"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body-md font-medium text-neutral-50">{inv.email}</p>
                          <p className="text-body-xs text-neutral-500">
                            {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-body-xs font-medium ${Status.className}`}>
                            <Status.icon className="text-xs" />
                            {Status.label}
                          </span>
                          {inv.status === "pending" && (
                            <button
                              onClick={() => handleCancel(inv._id)}
                              className="text-body-xs font-medium text-neutral-500 underline transition hover:text-error-500"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {hasMore && (
                <div className="flex items-center justify-center border-t border-hairline-soft px-5 py-4">
                  <Button variant="ghost" size="sm" onClick={loadMore} loading={loadingMore}>
                    <FiPlus className="text-base" />
                    Load More
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default InviteFriends;
