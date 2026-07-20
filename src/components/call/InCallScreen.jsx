import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useCallContext } from "./CallProvider";
import CallControls from "./CallControls";
import { resolvePhotoUrl } from "../../utils/avatar";

const InCallScreen = () => {
  const { peer, type } = useSelector((s) => s.call);
  const { localStream, remoteStream } = useCallContext();
  const remoteRef = useRef(null);
  const localRef = useRef(null);

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

  const isVideo = type === "video";

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
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
            <audio ref={remoteRef} autoPlay playsInline />
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
