/**
 * CallQualityBadge.jsx — live call-quality indicator using RTCPeerConnection
 * stats (packet loss). Mounted in InCallScreen; polls every 3s.
 */
import { useEffect, useState } from "react";
import callClient from "../../utils/callClient";

const readStats = async () => {
  const pc = callClient.getPeer();
  if (!pc) return null;
  const stats = await pc.getStats();
  let total = 0;
  let lost = 0;
  stats.forEach((report) => {
    if (report.type === "inbound-rtp" && report.kind === "audio") {
      total += report.packetsReceived || 0;
      lost += report.packetsLost || 0;
    }
  });
  if (!total) return null;
  return (lost / total) * 100;
};

const CallQualityBadge = () => {
  const [level, setLevel] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const loss = await readStats().catch(() => null);
      if (cancelled) return;
      if (loss === null) {
        setLevel(null);
      } else if (loss > 10) {
        setLevel("poor");
      } else if (loss > 3) {
        setLevel("weak");
      } else {
        setLevel("good");
      }
    };
    poll();
    const t = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (!level) return null;

  const config = {
    good: { label: "Good", dot: "bg-success-500", text: "text-success-400" },
    weak: { label: "Weak connection", dot: "bg-warning-500", text: "text-warning-300" },
    poor: { label: "Poor connection", dot: "bg-error-500", text: "text-error-300" },
  }[level];

  return (
    <span className={`flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs ${config.text}`}>
      <span className={`block h-1.5 w-1.5 rounded-full ${config.dot} ${level !== "good" ? "animate-pulse" : ""}`} />
      {config.label}
    </span>
  );
};

export default CallQualityBadge;
