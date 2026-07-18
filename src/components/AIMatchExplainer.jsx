/* eslint-disable react/prop-types */
/**
 * AIMatchExplainer.jsx
 * Shows why two developers are a good match.
 * Renders as a compact button on the feed card;
 * expands into a polished floating panel on click.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { explainMatch } from "../utils/aiApi";

const SparkleIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
    <path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z" />
    <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
  </svg>
);

const LoadingDots = () => (
  <span className="inline-flex items-end gap-0.5">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="block h-1 w-1 rounded-full bg-violet-300"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </span>
);

/**
 * Props:
 *   targetUserId  – the feed card user's _id
 *   targetName    – first name (for display)
 */
const AIMatchExplainer = ({ targetUserId, targetName }) => {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  const handleOpen = async (e) => {
    e.stopPropagation(); // don't trigger card drag
    setOpen(true);

    // Only fetch once per card mount
    if (fetched) return;
    setLoading(true);
    setError("");
    try {
      const result = await explainMatch(targetUserId);
      if (!result.success) throw new Error(result.message);
      setPoints(result.data.points);
      setFetched(true);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "AI unavailable");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button — sits inside the card overlay row */}
      <motion.button
        type="button"
        onClick={handleOpen}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-500/20 px-3 py-1.5 text-[11px] font-semibold text-violet-200 shadow backdrop-blur-sm transition hover:bg-violet-500/35"
        title="Why are we a match?"
      >
        <SparkleIcon className="h-3.5 w-3.5" />
        Why match?
      </motion.button>

      {/* Floating modal panel */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-[#1a0a2e] via-[#150920] to-[#0d0617] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-violet-500/15 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/25">
                    <SparkleIcon className="h-4 w-4 text-violet-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">AI Match Analysis</p>
                    <p className="text-[10px] text-violet-400">
                      Why you &amp; {targetName || "this dev"} click
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-tint text-neutral-400 transition hover:bg-tint-strong hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-5">
                {loading && (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <LoadingDots />
                    <p className="text-xs text-violet-400">Analysing compatibility…</p>
                  </div>
                )}

                {error && !loading && (
                  <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-xs text-red-300">
                    {error}
                  </div>
                )}

                {!loading && !error && points.length > 0 && (
                  <ul className="flex flex-col gap-3">
                    {points.map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/25 text-[10px] font-bold text-violet-300">
                          {i + 1}
                        </span>
                        <p className="text-sm leading-relaxed text-neutral-200">{point}</p>
                      </motion.li>
                    ))}
                  </ul>
                )}

                <p className="mt-4 text-center text-[10px] text-violet-600">
                  Powered by Mistral AI
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIMatchExplainer;
