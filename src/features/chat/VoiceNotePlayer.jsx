/**
 * VoiceNotePlayer.jsx — play/pause audio messages (messageType "audio").
 * Renders a simple progress bar + duration; shows a pending state while
 * the optimistic message is still uploading.
 */
import { useEffect, useRef, useState } from "react";
import { HiPlay, HiPause } from "react-icons/hi";

const formatTime = (secs) => {
  const s = Math.floor(secs || 0);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
};

const VoiceNotePlayer = ({ src, durationSec, isOwn, isPending }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const onTime = () => setElapsed(audio.currentTime);
    const onEnd = () => {
      setPlaying(false);
      setElapsed(0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {});
      setPlaying(true);
    }
  };

  const onProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = ratio * audio.duration;
  };

  const duration = durationSec || (audioRef.current?.duration || 0);
  const display = playing || elapsed > 0 ? elapsed : 0;
  const pct = duration ? Math.min(display / duration, 1) * 100 : 0;

  return (
    <div
      className={`flex min-w-[180px] max-w-[240px] items-center gap-2 rounded-xl px-2.5 py-2 ${
        isOwn ? "bg-brand-600/40" : "bg-tint-strong"
      }`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition ${
          isOwn ? "bg-brand-500" : "bg-neutral-700 hover:bg-neutral-600"
        } ${isPending ? "opacity-50" : ""}`}
      >
        {playing ? <HiPause className="text-sm" /> : <HiPlay className="ml-0.5 text-sm" />}
      </button>
      <div className="min-w-0 flex-1">
        <div
          className={`h-1.5 w-full cursor-pointer overflow-hidden rounded-full ${isOwn ? "bg-white/25" : "bg-neutral-600"}`}
          onClick={onProgressClick}
        >
          <div
            className={`h-full rounded-full transition-all ${isOwn ? "bg-white" : "bg-brand-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={`mt-1 text-[10px] tabular-nums ${isOwn ? "text-white/70" : "text-neutral-400"}`}>
          {isPending ? "Uploading…" : `${formatTime(display || 0)} / ${formatTime(duration)}`}
        </p>
      </div>
    </div>
  );
};

export default VoiceNotePlayer;
