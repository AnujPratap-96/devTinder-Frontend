import { HiPhone, HiVideoCamera } from "react-icons/hi";
import { useSelector } from "react-redux";
import { useCallContext } from "./CallProvider";

const planAllows = (membershipType, type) => {
  const tier = membershipType || "free";
  if (type === "video") return tier === "gold";
  return tier === "silver" || tier === "gold";
};

const CallButton = ({ calleeId, type = "voice", chatId = null, peer = null, className = "" }) => {
  const user = useSelector((s) => s.user);
  const { startCall } = useCallContext();
  const allowed = planAllows(user?.membershipType, type);

  return (
    <button
      type="button"
      disabled={!allowed}
      title={allowed ? `Start ${type} call` : `Upgrade to ${type === "video" ? "Gold" : "Silver"} to call`}
      onClick={() => startCall(calleeId, type, chatId, peer)}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-brand-500/40 bg-brand-500/15 text-brand-300 transition hover:bg-brand-500/30 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      aria-label={`Start ${type} call`}
    >
      {type === "video" ? <HiVideoCamera className="text-sm" /> : <HiPhone className="text-sm" />}
    </button>
  );
};

export default CallButton;
