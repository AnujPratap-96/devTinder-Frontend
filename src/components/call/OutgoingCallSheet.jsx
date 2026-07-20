import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useCallContext } from "./CallProvider";
import { resolvePhotoUrl } from "../../utils/avatar";

const OutgoingCallSheet = () => {
  const { peer, type } = useSelector((s) => s.call);
  const { endCall } = useCallContext();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-3xl glass border-hairline p-8 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border border-brand-500/40"
        >
          <img
            src={resolvePhotoUrl(peer?.photoUrl)}
            alt={peer?.firstName || "User"}
            className="h-full w-full object-cover"
          />
        </motion.div>
        <h3 className="text-lg font-bold text-neutral-50">
          {peer?.firstName || "Calling…"}
        </h3>
        <p className="mb-6 text-sm capitalize text-neutral-400">Calling… ({type})</p>
        <button
          type="button"
          onClick={endCall}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-500/90 text-white transition hover:bg-error-500"
          aria-label="Cancel"
        >
          ✕
        </button>
      </motion.div>
    </div>
  );
};

export default OutgoingCallSheet;
