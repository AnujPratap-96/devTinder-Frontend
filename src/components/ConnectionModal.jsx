import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiCode, HiChat } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";

const ConnectionModal = ({ user, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 top-[76px] lg:left-72 z-40 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm cursor-pointer"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex w-full max-w-2xl flex-col bg-surface-900 overflow-hidden shadow-brand-strong border border-white/10 rounded-3xl z-10 sm:flex-row"
          style={{ maxHeight: "90vh" }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <HiX className="text-lg" />
          </button>

          {/* Left Image Area / Top on mobile */}
          <div className="relative h-64 w-full shrink-0 sm:h-auto sm:w-2/5 xl:w-5/12">
            <img
              src={user.photoUrl?.[0] || "https://via.placeholder.com/400"}
              alt={user.firstName}
              className="h-full w-full object-cover"
            />
            {/* Gradient mask for seamless blend on desktop, and soften bottom on mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-transparent sm:bg-gradient-to-r" />
          </div>

          {/* Right Content Area */}
          <div className="flex flex-1 flex-col overflow-y-auto p-6 sm:p-8 scrollbar-thin z-10">
            <div>
              <h2 className="text-3xl font-bold text-neutral-50 mb-1 leading-tight tracking-tight">
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex items-center gap-2 text-brand-300 text-sm font-medium uppercase tracking-wider">
                {user.age && <span>{user.age} Yrs</span>}
                {user.age && user.gender && <span>&bull;</span>}
                {user.gender && <span>{user.gender}</span>}
              </div>
            </div>

            {user.about && (
              <div className="mt-8">
                <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2.5">
                  About
                </h3>
                <p className="text-sm leading-relaxed text-neutral-300">
                  {user.about}
                </p>
              </div>
            )}

            {user.skills && user.skills.length > 0 && (
              <div className="mt-8 border-t border-white/5 pt-8">
                <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-3.5">
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-100 shadow-sm"
                    >
                      <HiCode className="text-brand-300 text-[10px]" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-8">
              <Button
                variant="primary"
                className="w-full justify-center shadow-brand-glow"
                onClick={() => {
                  onClose();
                  navigate(`/chat/${user._id}`);
                }}
              >
                <HiChat className="text-lg" />
                <span className="font-semibold">Start Chatting</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConnectionModal;
