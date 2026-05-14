import useConnectionList from "../hooks/useConnectionList";
import { motion, AnimatePresence } from "framer-motion";
import { HiUsers, HiCode, HiDotsVertical, HiBan, HiFlag } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import { useState, useRef, useEffect } from "react";
import ConnectionModal from "./ConnectionModal";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useToast } from "../context/ToastProvider";
import { useDispatch } from "react-redux";
import { removeConnection } from "../store/connectionSlice";

const Connections = () => {
  const connections = useConnectionList();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedUser, setSelectedUser] = useState(null);
  const { addToast } = useToast();
  const [openMenu, setOpenMenu] = useState(null);
  const [reportModal, setReportModal] = useState({ isOpen: false, userId: null, name: "" });
  const [reportData, setReportData] = useState({ reason: "", details: "" });
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBlock = async (userId) => {
    if (!window.confirm("Are you sure you want to block this user? This will remove them from your connections.")) return;
    try {
      await axios.post(`${BASE_URL}/block`, { userId }, { withCredentials: true });
      dispatch(removeConnection(userId));
      addToast("User blocked successfully", "success");
      setOpenMenu(null);
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to block user", "error");
    }
  };

  const handleReport = async () => {
    if (!reportData.reason) return addToast("Please select a reason", "error");
    try {
      await axios.post(
        `${BASE_URL}/report`,
        { 
          userId: reportModal.userId, 
          reason: reportData.reason, 
          details: reportData.details 
        },
        { withCredentials: true }
      );
      addToast("Report submitted. Thank you for keeping DevTinder safe.", "success");
      setReportModal({ isOpen: false, userId: null, name: "" });
      setReportData({ reason: "", details: "" });
      setOpenMenu(null);
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to submit report", "error");
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-heading-md text-neutral-50">Your Connections</h1>
        <p className="mt-1 text-body-sm text-neutral-400">
          {connections?.length > 0
            ? `${connections.length} developer${connections.length !== 1 ? "s" : ""} in your network`
            : "Build your developer network"}
        </p>
      </div>

      {connections?.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection, index) => {
            const { _id, firstName, lastName, photoUrl, age, gender, about, skills } = connection;
            return (
              <Card
                as={motion.div}
                key={_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                whileHover={{ y: -6, scale: 1.01 }}
                tone="muted"
                padding="md"
                interactive
                onClick={() => setSelectedUser(connection)}
                className="flex h-full flex-col gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 relative"
              >
                {/* Options Menu */}
                <div className="absolute top-4 right-4 z-10" ref={openMenu === _id ? menuRef : null}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === _id ? null : _id);
                    }}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors text-neutral-400 hover:text-neutral-50"
                  >
                    <HiDotsVertical />
                  </button>
                  
                  <AnimatePresence>
                    {openMenu === _id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-48 rounded-2xl bg-surface-800 border border-white/10 shadow-xl overflow-hidden py-1 z-20"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBlock(_id);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error-400 hover:bg-error-500/10 transition-colors font-medium text-left"
                        >
                          <HiBan className="text-lg" /> Block User
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReportModal({ isOpen: true, userId: _id, name: `${firstName} ${lastName}` });
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/5 transition-colors font-medium text-left"
                        >
                          <HiFlag className="text-lg" /> Report User
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Top row: avatar + name */}
                <div className="flex items-center gap-3 pr-8">
                  <div className="relative flex-shrink-0">
                    <div className="avatar-ring h-14 w-14 overflow-hidden">
                      <img
                        alt={`${firstName}'s profile`}
                        className="h-full w-full object-cover"
                        src={Array.isArray(photoUrl) ? photoUrl[0] : photoUrl || "https://via.placeholder.com/150"}
                      />
                    </div>
                    <span className={`absolute -bottom-1 -right-1 block h-3.5 w-3.5 rounded-full border-2 border-neutral-950 ${connection.isOnline ? "bg-success-500" : "bg-neutral-500"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-body-sm font-semibold text-neutral-50 break-words line-clamp-2">
                      {firstName} {lastName}
                    </h2>
                    {age && gender && (
                      <p className="mt-0.5 text-body-xs text-neutral-400">
                        {age} · {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </p>
                    )}
                  </div>
                </div>

                {/* About */}
                {about && (
                  <p className="line-clamp-3 text-body-xs leading-relaxed text-neutral-300 break-words whitespace-pre-wrap">
                    {about}
                  </p>
                )}

                {/* Skills */}
                {skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-pill border border-brand-400/30 bg-brand-500/10 px-2.5 py-1 text-[0.7rem] font-medium text-brand-100">
                        <HiCode className="text-sm text-brand-200" /> {skill}
                      </span>
                    ))}
                    {skills.length > 3 && (
                      <span className="inline-flex items-center rounded-pill bg-neutral-800 px-2 py-1 text-[0.65rem] font-medium text-neutral-400">
                        +{skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Message CTA */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-auto justify-center"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/chat/${_id}`);
                  }}
                >
                  💬 Send Message
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <EmptyState
            icon={<HiUsers className="text-3xl" />}
            title="No connections yet"
            description="Start swiping on the Explore page to connect with fellow developers."
            tone="translucent"
            action={
              <Button variant="primary" size="sm" onClick={() => navigate("/feed")}>
                Start Exploring
              </Button>
            }
          />
        </motion.div>
      )}

      {/* Report Modal */}
      <AnimatePresence>
        {reportModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-heading-sm text-neutral-50">Report {reportModal.name}</h3>
                  <p className="mt-1 text-body-xs text-neutral-400">Help us understand what's wrong with this profile.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Reason</label>
                    <select
                      value={reportData.reason}
                      onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                      className="w-full bg-surface-800 border border-white/10 rounded-2xl px-4 py-3 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    >
                      <option value="">Select a reason</option>
                      <option value="Inappropriate behavior">Inappropriate behavior</option>
                      <option value="Spam or scam">Spam or scam</option>
                      <option value="Fake profile">Fake profile</option>
                      <option value="Harassment">Harassment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Additional Details</label>
                    <textarea
                      value={reportData.details}
                      onChange={(e) => setReportData({ ...reportData, details: e.target.value })}
                      placeholder="Please provide more information..."
                      className="w-full bg-surface-800 border border-white/10 rounded-2xl px-4 py-3 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setReportModal({ isOpen: false, userId: null, name: "" })}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 shadow-brand-glow"
                    onClick={handleReport}
                  >
                    Submit Report
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConnectionModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
};

export default Connections;

