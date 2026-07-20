import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useCallContext } from "./CallProvider";
import { resolvePhotoUrl } from "../../utils/avatar";

const IncomingCallSheet = () => {
  const { peer, type } = useSelector((s) => s.call);
  const { acceptCall, declineCall } = useCallContext();

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl glass border-hairline p-6 text-center"
      >
        <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border border-brand-500/40">
          <img
            src={resolvePhotoUrl(peer?.photoUrl)}
            alt={peer?.firstName || "User"}
            className="h-full w-full object-cover"
          />
        </div>
        <h3 className="text-lg font-bold text-neutral-50">
          {peer?.firstName || "Someone"} is calling…
        </h3>
        <p className="mb-6 text-sm capitalize text-neutral-400">
          Incoming {type} call
        </p>
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={declineCall}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-error-500/90 text-white transition hover:bg-error-500"
            aria-label="Decline"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={acceptCall}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-success-500/90 text-white transition hover:bg-success-500"
            aria-label="Accept"
          >
            ☎
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default IncomingCallSheet;
