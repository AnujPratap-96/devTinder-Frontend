import useConnectionList from "../hooks/useConnectionList";
import { motion } from "framer-motion";
import { HiUsers, HiCode, HiDotsVertical, HiBan, HiFlag } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import { useState } from "react";
import ConnectionModal from "./ConnectionModal";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useToast } from "../context/ToastProvider";

const Connections = () => {
  const connections = useConnectionList();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const { addToast } = useToast();
  const [openMenu, setOpenMenu] = useState(null);

  const blockUser = async (userId) => {
    try {
      await axios.post(`${BASE_URL}/user/block`, { blockedUserId: userId }, { withCredentials: true });
      addToast("User blocked", "success");
      setOpenMenu(null);
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to block user", "error");
    }
  };

  const reportUser = async (userId) => {
    try {
      await axios.post(`${BASE_URL}/user/report`, { reportedUserId: userId, reason: "Inappropriate behavior" }, { withCredentials: true });
      addToast("User reported", "success");
      setOpenMenu(null);
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to report user", "error");
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
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                whileHover={{ y: -6, scale: 1.01 }}
                tone="muted"
                padding="md"
                interactive
                onClick={() => setSelectedUser(connection)}
                className="flex h-full flex-col gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {/* Top row: avatar + name */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="avatar-ring h-14 w-14 overflow-hidden">
                      <img
                        alt={`${firstName}'s profile`}
                        className="h-full w-full object-cover"
                        src={photoUrl?.[0] || "https://via.placeholder.com/150"}
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

      <ConnectionModal 
        user={selectedUser} 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
};

export default Connections;
