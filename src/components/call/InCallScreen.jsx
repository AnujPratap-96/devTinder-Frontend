import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useCallContext } from "./CallProvider";
import CallControls from "./CallControls";
import { resolvePhotoUrl } from "../../utils/avatar";

const formatDuration = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const InCallScreen = () => {
  const { peer, type } = useSelector((s) => s.call);
  const { localStream, remoteStream, reconnecting } = useCallContext();
  const remoteRef = useRef(null);
  const localRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const isVideo = type === "video";

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
      {/* Call status bar */}
      <div className="flex items-center justify-center gap-3 bg-gradient-to-b from-black/80 to-transparent py-4">
        {reconnecting ? (
          <span className="flex items-center gap-2 rounded-full bg-warning-500/20 px-4 py-1.5 text-sm text-warning-300">
            <span className="block h-3 w-3 animate-spin rounded-full border-2 border-warning-300 border-t-transparent" />
            Reconnecting…
          </span>
        ) : (
          <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm tabular-nums text-neutral-200">
            {formatDuration(elapsed)}
          </span>
        )}
      </div>

      {/* Remote */}
      <div className="relative flex flex-1 items-center justify-center">
        {isVideo ? (
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <audio ref={remoteRef} autoPlay />
            <div className="flex flex-col items-center gap-4">
              <img
                src={resolvePhotoUrl(peer?.photoUrl)}
                alt={peer?.firstName || "User"}
                className="h-28 w-28 rounded-full object-cover"
              />
              <p className="text-neutral-300">{peer?.firstName || "User"}</p>
              <p className="text-sm text-neutral-500">Voice call in progress</p>
            </div>
          </>
        )}

        {/* Local PiP */}
        {isVideo && (
          <div className="absolute bottom-24 right-4 h-32 w-24 overflow-hidden rounded-xl border border-white/20">
            <video
              ref={localRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent py-8">
        <CallControls />
      </div>
    </div>
  );
};

export default InCallScreen;
