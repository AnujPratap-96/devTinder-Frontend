import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { createSocketConnection } from "../utils/constant";
import confetti from "canvas-confetti";
import { HiHeart, HiX, HiChat, HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import { suggestCollaboration } from "../utils/aiApi";

const MatchCelebration = () => {
  const user = useSelector((store) => store.user);
  const [match, setMatch] = useState(null);
  const [collab, setCollab] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?._id) return;

    const socket = createSocketConnection(user._id);
    const eventName = `match:found:${user._id}`;
    
    socket.on(eventName, (data) => {
      setMatch(data);
      // Fire confetti!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#ec4899"],
      });

      // Fetch collaboration suggestion immediately
      const other = data.users.find(u => u._id !== user._id);
      if (other) {
        suggestCollaboration(other._id)
          .then(res => setCollab(res.data))
          .catch(() => {});
      }
    });

    return () => {
      socket.off(eventName);
    };
  }, [user?._id]);

  if (!match) return null;

  const otherUser = match.users.find((u) => u._id !== user._id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="relative w-full max-w-lg p-8 text-center"
        >
          {/* Close Button */}
          <button
            onClick={() => setMatch(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/60 hover:bg-white/20 hover:text-white"
          >
            <HiX className="text-xl" />
          </button>

          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="mb-6 inline-flex rounded-full bg-brand-500/20 p-4 text-brand-400 shadow-brand-glow"
          >
            <HiHeart className="text-5xl animate-pulse" />
          </motion.div>

          <h1 className="mb-2 text-4xl font-bold text-white tracking-tight">It's a Match!</h1>
          <p className="mb-8 text-lg text-neutral-300">
            You and <span className="font-bold text-brand-400">{otherUser?.firstName}</span> are now connected.
          </p>

          <div className="relative mb-10 flex justify-center items-center">
            <motion.div
              initial={{ x: -40, rotate: -10 }}
              animate={{ x: 0, rotate: -5 }}
              className="z-10 h-32 w-32 overflow-hidden rounded-2xl border-4 border-white shadow-xl"
            >
              <img
                src={user.photoUrl?.[0] || "https://via.placeholder.com/150"}
                alt="You"
                className="h-full w-full object-cover"
              />
            </motion.div>

            <div className="relative z-20 -mx-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-brand-glow">
              <HiHeart className="text-2xl" />
            </div>

            <motion.div
              initial={{ x: 40, rotate: 10 }}
              animate={{ x: 0, rotate: 5 }}
              className="z-10 h-32 w-32 overflow-hidden rounded-2xl border-4 border-white shadow-xl"
            >
              <img
                src={otherUser?.photoUrl?.[0] || "https://via.placeholder.com/150"}
                alt={otherUser?.firstName}
                className="h-full w-full object-cover"
              />
            </motion.div>
          </div>

          <AnimatePresence>
            {collab && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-4 text-left backdrop-blur-sm"
              >
                <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-400">
                  <HiSparkles /> AI Suggestion
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Project Idea: {collab.title}</h4>
                <p className="text-[11px] text-neutral-400 italic line-clamp-1">{collab.why}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              className="flex-1 justify-center shadow-brand-strong"
              onClick={() => {
                const mid = otherUser?._id;
                setMatch(null);
                navigate(`/chat/${mid}`);
              }}
            >
              <HiChat className="text-xl" />
              Say Hello
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 justify-center"
              onClick={() => setMatch(null)}
            >
              Keep Exploring
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MatchCelebration;
