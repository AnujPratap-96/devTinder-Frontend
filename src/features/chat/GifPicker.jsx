/**
 * GifPicker.jsx — Tenor GIF picker for the composer.
 * Sends the GIF through the existing image-upload flow, so the server
 * treats it exactly like a chat image (no backend changes needed).
 * Requires VITE_TENOR_API_KEY; the button is hidden when unset.
 */
import { useEffect, useRef, useState } from "react";
import { HiOutlineGift, HiX } from "react-icons/hi";
import { uploadChatFile } from "../../api/chat";
import { isGifEnabled, GIF_TENOR_LIMIT } from "../../config/features";

const TENOR_ENDPOINT = "https://tenor.googleapis.com/v2/search";

const GifPicker = ({ matchId, targetUserId, userId, onOptimistic, onRemove, onSent }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const fetchRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      const apiKey = import.meta.env.VITE_TENOR_API_KEY;
      if (!apiKey) return;
      const term = query.trim() || "coding developer";
      const seq = ++fetchRef.current;
      setLoading(true);
      fetch(`${TENOR_ENDPOINT}?q=${encodeURIComponent(term)}&key=${apiKey}&limit=${GIF_TENOR_LIMIT}&contentfilter=high&media_filter=tinygif`)
        .then((r) => r.json())
        .then((data) => {
          if (seq !== fetchRef.current) return;
          setGifs((data.results || []).map((g) => ({ url: g.media_formats?.tinygif?.url, preview: g.media_formats?.tinygif?.url })));
        })
        .catch(() => {})
        .finally(() => {
          if (seq === fetchRef.current) setLoading(false);
        });
    }, 350);
    return () => clearTimeout(t);
  }, [query, open]);

  const sendGif = async (url) => {
    if (sending || !url || !userId || !targetUserId) return;
    setSending(true);
    let clientMessageId;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "gif.gif", { type: "image/gif" });
      clientMessageId = `gif-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const blobUrl = URL.createObjectURL(blob);

      onOptimistic({
        matchId,
        userId,
        targetUserId,
        clientMessageId,
        message: blobUrl,
        messageType: "image",
        delivered: false,
        seen: false,
        status: "pending",
        createdAt: new Date().toISOString(),
        receiverId: targetUserId,
        senderId: userId,
        isOptimistic: true,
      });

      const formData = new FormData();
      formData.append("image", file);
      formData.append("matchId", matchId || "");
      formData.append("targetUserId", targetUserId);
      await uploadChatFile(formData);
      onSent?.();
      setOpen(false);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch {
      onRemove?.(clientMessageId);    } finally {
      setSending(false);
    }
  };

  if (!isGifEnabled()) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tint-strong text-neutral-400 transition hover:text-brand-400"
        title="Send a GIF"
      >
        <HiOutlineGift className="text-lg" />
      </button>
      {open && (
        <div className="absolute bottom-14 left-0 z-50 w-72 overflow-hidden rounded-2xl border border-hairline bg-surface-900 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-hairline-soft px-3 py-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search GIFs…"
              className="h-8 flex-1 rounded-lg bg-tint px-3 text-xs text-neutral-100 outline-none placeholder:text-neutral-500"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-neutral-500 hover:text-neutral-200"
            >
              <HiX className="text-sm" />
            </button>
          </div>
          <div className="grid max-h-64 grid-cols-3 gap-1 overflow-y-auto p-2">
            {loading ? (
              <div className="col-span-3 flex justify-center py-6">
                <span className="spinner h-5 w-5 border-2 text-brand-600" />
              </div>
            ) : gifs.length ? (
              gifs.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendGif(g.url)}
                  className="aspect-square overflow-hidden rounded-lg bg-tint transition hover:opacity-80"
                >
                  <img src={g.preview} alt="GIF" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))
            ) : (
              <p className="col-span-3 py-6 text-center text-xs text-neutral-500">No GIFs found</p>
            )}
          </div>
          {sending && (
            <div className="flex items-center justify-center gap-2 border-t border-hairline-soft py-2 text-[10px] text-neutral-400">
              <span className="spinner h-3 w-3 border-2 text-brand-600" /> Sending…
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GifPicker;
