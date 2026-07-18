import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiBookmark,
  HiTrash,
  HiBan,
  HiFlag,
  HiCode,
  HiExternalLink,
} from "react-icons/hi";
import { BASE_URL } from "../utils/constant";
import EmptyState from "./ui/EmptyState";
import { useToast } from "../context/ToastProvider";

// ─── Availability badge colours ───────────────────────────────
const availabilityConfig = {
  open: { label: "Open to work", dot: "bg-emerald-400", text: "text-emerald-700", ring: "border-emerald-500/30 bg-emerald-500/10" },
  busy: { label: "Busy", dot: "bg-amber-400", text: "text-amber-700", ring: "border-amber-500/30 bg-amber-500/10" },
  not_looking: { label: "Not looking", dot: "bg-neutral-500", text: "text-neutral-400", ring: "border-neutral-600/30 bg-neutral-700/20" },
};

// ─── Role → gradient map ───────────────────────────────────────
const roleGradient = {
  frontend: "from-sky-600/40 via-indigo-700/30 to-transparent",
  backend: "from-emerald-700/40 via-teal-800/30 to-transparent",
  fullstack: "from-violet-700/40 via-purple-800/30 to-transparent",
  mobile: "from-pink-700/40 via-rose-800/30 to-transparent",
  design: "from-orange-600/40 via-amber-700/30 to-transparent",
  product: "from-blue-700/40 via-cyan-800/30 to-transparent",
  data: "from-yellow-600/40 via-lime-700/30 to-transparent",
  devops: "from-red-700/40 via-orange-800/30 to-transparent",
  other: "from-neutral-700/40 via-stone-800/30 to-transparent",
};

// ─── Skeleton loader ───────────────────────────────────────────
const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl border border-hairline-soft bg-surface-900 animate-pulse">
    <div className="h-28 bg-tint" />
    <div className="p-4 space-y-3">
      <div className="flex items-end gap-3 -mt-8">
        <div className="h-14 w-14 rounded-xl bg-tint-strong ring-4 ring-surface-900" />
        <div className="flex-1 space-y-1.5 pb-1">
          <div className="h-3 rounded bg-tint-strong w-32" />
          <div className="h-2.5 rounded bg-tint w-20" />
        </div>
      </div>
      <div className="h-2 rounded bg-tint w-full" />
      <div className="h-2 rounded bg-tint w-4/5" />
      <div className="flex gap-2 pt-1">
        <div className="h-7 rounded-full bg-tint flex-1" />
        <div className="h-7 rounded-full bg-tint flex-1" />
        <div className="h-7 rounded-full bg-tint flex-1" />
      </div>
    </div>
  </div>
);

// ─── Main component ────────────────────────────────────────────
const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/bookmarks`, {
          withCredentials: true,
        });
        setBookmarks(data.data.bookmarks ?? []);
      } catch (error) {
        addToast(error?.response?.data?.message || "Unable to load bookmarks", "error");
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, [addToast]);

  const removeBookmark = async (bookmarkId) => {
    setRemoving(bookmarkId);
    try {
      await axios.delete(`${BASE_URL}/bookmark/${bookmarkId}`, {
        withCredentials: true,
      });
      setBookmarks((prev) => prev.filter((b) => b._id !== bookmarkId));
      addToast("Bookmark removed", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to remove bookmark", "error");
    } finally {
      setRemoving(null);
    }
  };

  const blockUser = async (userId, bookmarkId) => {
    try {
      await axios.post(
        `${BASE_URL}/block`,
        { userId },
        { withCredentials: true }
      );
      setBookmarks((prev) => prev.filter((b) => b._id !== bookmarkId));
      addToast("User blocked and removed from bookmarks", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to block user", "error");
    }
  };

  const reportUser = async (userId) => {
    try {
      await axios.post(
        `${BASE_URL}/report`,
        { userId, reason: "Inappropriate behavior" },
        { withCredentials: true }
      );
      addToast("User reported", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to report user", "error");
    }
  };

  // ── Page header ─────────────────────────────────────────────
  const Header = () => (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-neutral-50">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20">
            <HiBookmark className="text-lg text-brand-500" />
          </span>
          Saved Profiles
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {bookmarks.length} developer{bookmarks.length !== 1 ? "s" : ""} saved
        </p>
      </div>
    </div>
  );

  // ── Loading skeleton grid ────────────────────────────────────
  if (loading) {
    return (
      <div>
        <Header />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div>
        <Header />
        <div className="mx-auto max-w-lg">
          <EmptyState
            icon={<HiBookmark className="text-3xl" />}
            title="No saved profiles yet"
            description="Bookmark developers you want to revisit by tapping the Save button on their profile cards."
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {bookmarks.map((bookmark, idx) => {
            const dev = bookmark.savedUserId;
            if (!dev) return null;

            const avail = availabilityConfig[dev.availability] ?? availabilityConfig.open;
            const gradient = roleGradient[dev.role] ?? roleGradient.other;
            const skills = (dev.skills ?? []).slice(0, 4);
            const photo = Array.isArray(dev.photoUrl)
              ? dev.photoUrl[0]
              : dev.photoUrl;
            const name = `${dev.firstName ?? ""} ${dev.lastName ?? ""}`.trim();
            const isRemoving = removing === bookmark._id;

            return (
              <motion.article
                key={bookmark._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -10 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="group relative overflow-hidden rounded-2xl border border-hairline-soft bg-surface-900 shadow-soft transition hover:border-brand-500/20 hover:shadow-brand-glow"
              >
                {/* ── Cover banner ── */}
                <div className={`relative h-28 bg-gradient-to-br ${gradient}`}>
                  {/* subtle mesh pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  {/* experience pill */}
                  {typeof dev.experienceYears === "number" && (
                    <span className="absolute top-3 right-3 rounded-full border border-hairline bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-white/70 backdrop-blur-sm">
                      {dev.experienceYears} yr{dev.experienceYears !== 1 ? "s" : ""} exp
                    </span>
                  )}
                </div>

                {/* ── Main body ── */}
                <div className="px-4 pb-4">
                  {/* Avatar + name row — avatar overlaps banner */}
                  <div className="flex items-end gap-3 -mt-7 mb-3">
                    <div className="relative shrink-0">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border-[3px] border-surface-900 shadow-lg">
                        {photo ? (
                          <img
                            src={photo}
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-600 to-violet-700 text-lg font-bold text-white">
                            {(dev.firstName?.[0] ?? "?").toUpperCase()}
                          </div>
                        )}
                      </div>
                      {/* online dot */}
                      {dev.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface-900 bg-emerald-400" />
                      )}
                    </div>

                    <div className="min-w-0 pb-0.5 flex-1">
                      <p className="truncate text-sm font-bold text-neutral-50 leading-tight">
                        {name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {dev.role && (
                          <span className="text-[11px] font-medium text-neutral-400 capitalize">
                            {dev.role}
                          </span>
                        )}
                        {dev.age && (
                          <>
                            <span className="text-neutral-600 text-[10px]">·</span>
                            <span className="text-[11px] text-neutral-500">{dev.age}y</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Availability badge */}
                  <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${avail.ring} mb-3`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${avail.dot}`} />
                    <span className={`text-[10px] font-semibold ${avail.text}`}>{avail.label}</span>
                  </div>

                  {/* About snippet */}
                  {dev.about && dev.about !== "This is a default about the user" && (
                    <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-neutral-400">
                      {dev.about}
                    </p>
                  )}

                  {/* Skills chips */}
                  {skills.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="flex items-center gap-1 rounded-full border border-brand-400/20 bg-brand-500/10 px-2.5 py-1 text-[10px] font-semibold text-brand-600"
                        >
                          <HiCode className="text-[9px]" />
                          {skill}
                        </span>
                      ))}
                      {(dev.skills?.length ?? 0) > 4 && (
                        <span className="rounded-full border border-hairline-soft bg-tint px-2.5 py-1 text-[10px] text-neutral-500">
                          +{dev.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Saved date */}
                  <p className="mb-3 text-[10px] text-neutral-600">
                    Saved{" "}
                    {new Date(bookmark.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  {/* Divider */}
                  <div className="mb-3 border-t border-hairline-soft" />

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => removeBookmark(bookmark._id)}
                      disabled={isRemoving}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                    >
                      {isRemoving ? (
                        <span className="spinner h-3 w-3 border text-brand-600" />
                      ) : (
                        <HiTrash className="text-sm" />
                      )}
                      Remove
                    </button>

                    <button
                      type="button"
                      onClick={() => blockUser(dev._id, bookmark._id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 transition hover:bg-amber-500/20 hover:text-amber-300"
                      title="Block user"
                    >
                      <HiBan className="text-sm" />
                    </button>

                    <button
                      type="button"
                      onClick={() => reportUser(dev._id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-hairline-soft bg-tint text-neutral-500 transition hover:bg-tint-strong hover:text-neutral-300"
                      title="Report user"
                    >
                      <HiFlag className="text-sm" />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Bookmarks;
