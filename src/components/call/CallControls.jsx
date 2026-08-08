import { useSelector } from "react-redux";
import { useCallContext } from "./CallProvider";

const CallControls = () => {
  const { type, muted, cameraOn } = useSelector((s) => s.call);
  const { toggleMute, toggleCamera, switchCamera, endCall } = useCallContext();

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={toggleMute}
        className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
          muted ? "bg-error-500/90 text-white" : "bg-white/15 text-white hover:bg-white/25"
        }`}
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? "🔇" : "🎙"}
      </button>

      {type === "video" && (
        <button
          type="button"
          onClick={toggleCamera}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
            !cameraOn ? "bg-error-500/90 text-white" : "bg-white/15 text-white hover:bg-white/25"
          }`}
          aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
        >
          {cameraOn ? "🎥" : "🚫"}
        </button>
      )}

      {type === "video" && (
        <button
          type="button"
          onClick={switchCamera}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          aria-label="Switch camera"
        >
          🔄
        </button>
      )}

      <button
        type="button"
        onClick={endCall}
        className="flex h-12 w-16 items-center justify-center rounded-full bg-error-600 text-white transition hover:bg-error-500"
        aria-label="End call"
      >
        ☎
      </button>
    </div>
  );
};

export default CallControls;
