import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  HiCollection,
  HiUserAdd,
  HiX,
  HiPlus,
  HiChat,
  HiCheck,
  HiPaperAirplane,
  HiUsers,
  HiGlobeAlt,
  HiPencilAlt,
  HiTrash,
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { BASE_URL } from "../utils/constant";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { useToast } from "../context/ToastProvider";
import { addProjects, removeProject, updateProject } from "../store/projectSlice";
import { generateProjectDescription, suggestProjectTechStack, generateProjectRoadmap, suggestProjectDetails } from "../utils/aiApi";
import { HiTrendingUp } from "react-icons/hi";

const AI_LOADING_TEXT = "AI is thinking...";

const RoadmapModal = ({ project, onClose }) => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { addToast } = useToast();

  const fetchRoadmap = async (force = false) => {
    if (force) setIsEnhancing(true);
    else setLoading(true);

    try {
      const { data } = await generateProjectRoadmap({
        title: project.title,
        description: project.description,
        techStack: project.techStack,
        projectId: project._id,
        forceRefresh: force,
      });
       setRoadmap(data.data.roadmap);
      if (force) addToast("Roadmap enhanced with AI!", "success");
    } catch (error) {
      addToast("Failed to generate roadmap", "error");
      if (!force) onClose();
    } finally {
      setLoading(false);
      setIsEnhancing(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [project._id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Card tone="glass" className="max-h-[85vh] overflow-y-auto p-0">
          <div className="flex items-center justify-between border-b border-white/10 p-6 sticky top-0 bg-surface-900/80 backdrop-blur-md z-20">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-brand-500/20 p-2 text-brand-400 font-bold uppercase tracking-widest leading-none">
                <HiTrendingUp className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-100">Project Blueprint</h3>
                <p className="text-xs text-neutral-400">Step-by-step strategy for {project.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fetchRoadmap(true)}
                disabled={loading || isEnhancing}
                className="text-[10px] uppercase font-bold tracking-widest text-brand-400 hover:text-brand-300"
              >
                {isEnhancing ? "Refining..." : "✨ Enhance"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
                <HiX className="text-xl text-neutral-400" />
              </Button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="loading loading-spinner loading-lg text-brand-500" />
                <p className="text-sm font-medium text-neutral-400 animate-pulse uppercase tracking-widest">Architecting Plan...</p>
              </div>
            ) : (
              <div className="space-y-8 py-2">
                {roadmap?.map((phase, idx) => (
                  <div key={idx} className="relative pl-10">
                    {/* Connection Line */}
                    {idx !== roadmap.length - 1 && (
                      <div className="absolute left-[11px] top-8 h-[calc(100%+16px)] w-[1px] bg-gradient-to-b from-brand-500/30 to-transparent" />
                    )}
                    
                    <div className="absolute left-0 top-[3px] flex h-6 w-6 items-center justify-center rounded-full border border-brand-500/40 bg-brand-500/10 text-[10px] font-black text-brand-400 shadow-brand-glow">
                      {idx + 1}
                    </div>

                    <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-neutral-200">{phase.title}</h4>
                    <div className="grid gap-2.5">
                      {phase.tasks.map((task, tidx) => (
                        <div key={tidx} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 hover:bg-white/[0.06] transition-all group">
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/20 group-hover:border-brand-500/50 transition-colors">
                            <HiCheck className="text-[10px] text-brand-400 opacity-30 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-sm text-neutral-300 leading-tight">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-6 flex justify-between items-center bg-white/[0.02]">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-medium">Blueprint v1.0 • AI Verified</p>
            <Button variant="primary" size="sm" onClick={onClose} className="px-6">Explore Tasks</Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

const EditProjectModal = ({ project, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: project.title,
    description: project.description,
    techStack: project.techStack,
    status: project.status,
  });
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const { addToast } = useToast();

  const handleMagicSuggest = async () => {
    if (!form.title.trim()) {
      addToast("Enter a project title first!", "info");
      return;
    }
    setLoadingSuggestion(true);
    try {
      const { data } = await suggestProjectDetails(form.title);
       setForm((p) => ({
         ...p,
         description: data.data.description,
         techStack: [...new Set([...p.techStack, ...data.data.techStack])],
       }));
      addToast("AI has filled in the project details!", "success");
    } catch (error) {
      addToast("Failed to get suggestions", "error");
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleSave = () => {
    onSave(project._id, form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Card tone="glass" className="space-y-4 p-6">
          <h3 className="text-xl font-bold text-neutral-100">Edit Project</h3>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase text-neutral-500">Project Title</label>
                <button
                  type="button"
                  onClick={handleMagicSuggest}
                  disabled={loadingSuggestion}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-400 hover:text-brand-300 disabled:opacity-50"
                  title="Generate description and tech stack automatically"
                >
                  {loadingSuggestion ? "Thinking..." : "✨ Magic AI"}
                </button>
              </div>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Title"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-neutral-500">Tech Stack</label>
              <TechInput
                value={form.techStack}
                onChange={(ts) => setForm((p) => ({ ...p, techStack: ts }))}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-neutral-500">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description"
                className="w-full min-h-[120px] rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-100 outline-none resize-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-neutral-500">Project Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-brand-500 [&>option]:bg-neutral-900"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save Changes</Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

const MembersModal = ({ project, currentUserId, onClose, onRemove }) => {
  const getUserId = (m) => m.userId?._id || m.userId;
  const ownerId = project.ownerId?._id || project.ownerId;
  const isOwner = ownerId === currentUserId;
  const userRole = project.members?.find((m) => getUserId(m) === currentUserId)?.role;
  const canManage = isOwner || userRole === "admin" || userRole === "owner";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card tone="glass" className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <h3 className="text-lg font-semibold text-neutral-100">Members</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <HiX className="text-xl" />
            </Button>
          </div>
          <div className="space-y-1 max-h-80 overflow-y-auto p-2">
            {project.members?.map((member) => {
              const memberUserId = getUserId(member);
              const isMemberOwner = member.role === "owner";
              const memberFullName = member.userId?.firstName && member.userId?.lastName
                ? `${member.userId.firstName} ${member.userId.lastName}`
                : member.userId?.firstName || "Unknown";
              return (
                <div
                  key={memberUserId}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-2 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-brand-400/30">
                      <img
                        src={
                          member.userId?.photoUrl?.[0] ||
                          "https://ui-avatars.com/api/?name=User&background=random"
                        }
                        alt={memberFullName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  <div>
                    <p className="text-sm text-neutral-200">{memberFullName}</p>
                    {isMemberOwner && (
                      <p className="text-[10px] text-brand-200">Owner</p>
                    )}
                  </div>
                </div>
                {!isMemberOwner && canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(project._id, memberUserId)}
                  >
                    <HiX className="text-error-400" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

const TechChip = ({ tech, onRemove }) => (
  <span className="flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-500/15 px-3 py-1 text-xs font-medium text-brand-200">
    {tech}
    <button
      type="button"
      onClick={onRemove}
      className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-brand-200 transition hover:bg-white/20"
    >
      <HiX className="text-[10px]" />
    </button>
  </span>
);

const TechInput = ({ value, onChange }) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTech = e.currentTarget.value.trim();
      if (!value.includes(newTech)) {
        onChange([...value, newTech]);
      }
      e.currentTarget.value = "";
    }
  };

  const removeTech = (techToRemove) => {
    onChange(value.filter((t) => t !== techToRemove));
  };

  return (
    <div className="flex min-h-[46px] flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition focus-within:ring-2 focus-within:ring-brand-500/50 hover:bg-white/10">
      {value.map((tech) => (
        <TechChip key={tech} tech={tech} onRemove={() => removeTech(tech)} />
      ))}
      <input
        ref={inputRef}
        type="text"
        placeholder={value.length === 0 ? "Type tech & press Enter..." : ""}
        className="flex-1 min-w-[140px] border-none bg-transparent text-sm text-neutral-50 outline-none placeholder:text-neutral-500"
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

const ProjectCard = ({ project, currentUserId, onJoin, onView, onRespond, onRemove, onShowMembers, onEdit, onDelete, onShowRoadmap }) => {
  const getUserId = (m) => m.userId?._id || m.userId;
  const ownerId = project.ownerId?._id || project.ownerId;
  const ownerFullName = project.ownerId?.firstName || "Unknown";
  const isMember = project.members?.some(
    (m) => getUserId(m) === currentUserId
  );
  const isOwner = ownerId === currentUserId;
  const userRole = project.members?.find(
    (m) => getUserId(m) === currentUserId
  )?.role;
  const canManage = isOwner || userRole === "admin" || userRole === "owner";
  const hasPendingRequest = project.joinRequests?.some(
    (r) => r.user?._id === currentUserId && r.status === "pending"
  );

  return (
    <Card tone="glass" className="relative space-y-3 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-neutral-100">
              {project.title}
            </h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                project.status === "open"
                  ? "border-success-400/40 bg-success-500/15 text-success-200"
                  : project.status === "in_progress"
                  ? "border-warning-400/40 bg-warning-500/15 text-warning-200"
                  : "border-neutral-500/40 bg-neutral-500/15 text-neutral-400"
              }`}
            >
              {project.status.replace("_", " ")}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-6 w-6 overflow-hidden rounded-full border border-brand-400/50">
              <img
                src={
                  project.ownerId?.photoUrl?.[0] ||
                  "https://ui-avatars.com/api/?name=User&background=random"
                }
                alt={ownerFullName}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-xs text-brand-200">{ownerFullName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <>
              <Button variant="ghost" size="sm" onClick={() => onEdit(project)}>
                <HiPencilAlt className="text-lg text-brand-300" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(project._id)}>
                <HiTrash className="text-lg text-error-400" />
              </Button>
            </>
          )}
          {isMember && (
            <Button variant="ghost" size="sm" onClick={() => onView(project)}>
              <HiChat className="text-lg" /> Chat
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-neutral-300 line-clamp-4 min-h-[3.5rem]">
        {project.description}
      </p>

      {project.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-neutral-300"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="px-2" onClick={() => onShowRoadmap(project)}>
            <HiTrendingUp className="text-lg text-brand-400" /> Roadmap
          </Button>
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span className="text-brand-200">{project.members?.length ?? 1} members</span>
            {project.members?.length > 1 && (
              <button
                type="button"
                onClick={() => onShowMembers(project)}
                className="flex items-center gap-1 text-brand-300 hover:text-brand-200"
              >
                <HiUsers className="text-sm" /> View
              </button>
            )}
          </div>
        </div>
        <div>
          {project.joinRequests?.filter((r) => r.status === "pending")
            ?.length > 0 && canManage && (
            <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-brand-200">
              {project.joinRequests.filter((r) => r.status === "pending").length}{" "}
              pending
            </span>
          )}
        </div>
        {!isMember && project.status === "open" && (
          <div>
            {hasPendingRequest ? (
              <span className="text-xs text-warning-200">Request pending...</span>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => onJoin(project._id)}>
                <HiUserAdd className="text-lg" /> Join
              </Button>
            )}
          </div>
        )}
      </div>

      {canManage &&
        project.joinRequests?.filter((r) => r.status === "pending").length > 0 && (
          <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
            <p className="text-xs font-medium uppercase text-neutral-500">
              Join Requests
            </p>
            {project.joinRequests
              .filter((r) => r.status === "pending")
              .map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10">
                      <img
                        src={
                          request.user?.photoUrl?.[0] ||
                          "https://via.placeholder.com/32"
                        }
                        alt={request.user?.firstName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-200">
                        {request.user?.firstName} {request.user?.lastName}
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onRespond(project._id, request._id, "accept")
                      }
                    >
                      <HiCheck className="text-success-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onRespond(project._id, request._id, "reject")
                      }
                    >
                      <HiX className="text-error-400" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
    </Card>
  );
};

const ProjectChat = ({ project, currentUserId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { addToast } = useToast();
  const messagesEndRef = useRef(null);

  const loadMessages = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/project/${project._id}/messages`, {
        withCredentials: true,
      });
       setMessages(data.data.messages || []);
    } catch (error) {
      addToast("Unable to load messages", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [project._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await axios.post(
        `${BASE_URL}/project/${project._id}/message`,
        { message: newMessage },
        { withCredentials: true }
      );
      setNewMessage("");
      await loadMessages();
    } catch (error) {
      addToast("Unable to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const getSenderName = (senderId) => {
    if (!senderId) return "Unknown";
    const senderIdStr = String(senderId?._id || senderId);
    const ownerId = String(project.ownerId?._id || project.ownerId);
    if (senderIdStr === ownerId) return project.ownerId?.firstName || "Owner";
    const member = project.members?.find((m) => String(m.userId?._id || m.userId) === senderIdStr);
    if (member?.userId) return `${member.userId.firstName} ${member.userId.lastName || ""}`;
    if (senderId?.firstName) return `${senderId.firstName} ${senderId.lastName || ""}`;
    return senderIdStr === currentUserId ? "You" : "Unknown";
  };

  const getSenderPhoto = (senderId) => {
    if (!senderId) return "https://ui-avatars.com/api/?name=User&background=random";
    const senderIdStr = String(senderId?._id || senderId);
    const ownerId = String(project.ownerId?._id || project.ownerId);
    if (senderIdStr === ownerId) return project.ownerId?.photoUrl?.[0] || "https://ui-avatars.com/api/?name=Owner&background=random";
    const member = project.members?.find((m) => String(m.userId?._id || m.userId) === senderIdStr);
    if (member?.userId?.photoUrl?.[0]) return member.userId.photoUrl[0];
    if (senderId?.photoUrl?.[0]) return senderId.photoUrl[0];
    return "https://ui-avatars.com/api/?name=User&background=random";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="flex h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-neutral-900 border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h3 className="text-lg font-semibold text-neutral-100">{project.title}</h3>
            <p className="text-xs text-neutral-400">Project Chat</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <HiX className="text-xl" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <span className="loading loading-spinner loading-md text-brand-300" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-neutral-500">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => {
              const senderIdStr = String(msg.senderId?._id || msg.senderId);
              const isOwn = senderIdStr === currentUserId;
              return (
                <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  {!isOwn && (
                    <div className="mr-2 flex-shrink-0">
                      <img
                        src={getSenderPhoto(msg.senderId)}
                        alt={getSenderName(msg.senderId)}
                        className="h-8 w-8 rounded-full object-cover border border-white/10"
                      />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isOwn ? "bg-brand-500 text-white" : "bg-white/10 text-neutral-200"
                  }`}>
                    {!isOwn && <p className="text-xs font-medium text-brand-200 mb-1">{getSenderName(msg.senderId)}</p>}
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-[10px] text-white/60 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 p-3">
          <div className="flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-100 outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            />
            <Button variant="primary" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
              <HiPaperAirplane className="text-lg" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Projects = () => {
  const dispatch = useDispatch();
  const projects = useSelector((store) => store.projects) || [];
  const [loading, setLoading] = useState(!projects.length);
  const [creating, setCreating] = useState(false);
  const [chatProject, setChatProject] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState("my");
  const [membersProject, setMembersProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [roadmapProject, setRoadmapProject] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", techStack: [] });
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const { addToast } = useToast();
  const user = useSelector((store) => store.user);
  const currentUserId = user?._id;

  const handleMagicSuggest = async () => {
    if (!form.title.trim()) {
      addToast("Enter a project title first!", "info");
      return;
    }
    setLoadingSuggestion(true);
    try {
      const { data } = await suggestProjectDetails(form.title);
       setForm((p) => ({
         ...p,
         description: data.data.description,
         techStack: [...new Set([...p.techStack, ...data.data.techStack])],
       }));
      addToast("AI has filled in the project details!", "success");
    } catch (error) {
      addToast("Failed to get suggestions", "error");
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const loadProjects = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/projects`, {
        withCredentials: true,
      });
       dispatch(addProjects(data.data.projects ?? []));
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [dispatch]);

  const currentUserIdStr = String(currentUserId || "");
  const getUserId = (m) => String(m.userId?._id || m.userId || "");
  
  const myProjects = projects.filter((p) => {
    const ownerIdStr = String(p.ownerId?._id || p.ownerId || "");
    return ownerIdStr === currentUserIdStr || p.members?.some((m) => getUserId(m) === currentUserIdStr);
  });
  
  const exploreProjects = projects.filter((p) => {
    const ownerIdStr = String(p.ownerId?._id || p.ownerId || "");
    const isMember = ownerIdStr === currentUserIdStr || p.members?.some((m) => getUserId(m) === currentUserIdStr);
    return !isMember && p.status === "open";
  });
  
  const displayProjects = activeTab === "my" ? myProjects : exploreProjects;
  const displayTitle = activeTab === "my" ? "My Projects" : "Explore Projects";
  const displaySubtitle = activeTab === "my" ? "Projects you've joined or created" : "Find projects to join and collaborate";

  const removeMember = async (projectId, memberId) => {
    try {
      await axios.delete(`${BASE_URL}/project/${projectId}/member/${memberId}`, { withCredentials: true });
      loadProjects();
      addToast("Member removed", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to remove member", "error");
    }
  };

  const createProject = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      addToast("Provide a title and description", "info");
      return;
    }
    setCreating(true);
    try {
      const { data } = await axios.post(`${BASE_URL}/project`, form, { withCredentials: true });
       dispatch(addProjects([data.data.project, ...projects]));
      setForm({ title: "", description: "", techStack: [] });
      setShowCreate(false);
      addToast("Project created", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to create project", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleEditSave = async (projectId, updatedData) => {
    try {
      const { data } = await axios.patch(`${BASE_URL}/project/${projectId}`, updatedData, { withCredentials: true });
       dispatch(updateProject(data.data.project));
      setEditingProject(null);
      addToast("Project updated", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to update project", "error");
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`${BASE_URL}/project/${projectId}`, { withCredentials: true });
      dispatch(removeProject(projectId));
      addToast("Project deleted", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to delete project", "error");
    }
  };

  const requestJoin = async (projectId) => {
    try {
      await axios.post(`${BASE_URL}/project/request`, { projectId }, { withCredentials: true });
      loadProjects();
      addToast("Join request sent", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to send request", "error");
    }
  };

  const respondToRequest = async (projectId, requestId, action) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/project/request/respond`, { projectId, requestId, action }, { withCredentials: true });
       dispatch(updateProject(data.data.project));
      addToast(`Request ${action}ed`, "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to respond", "error");
    }
  };

  return (
    <div className="space-y-8">
      {!showCreate ? (
        <>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {["my", "explore"].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab ? "bg-brand-500 text-white" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {tab === "my" ? "My Projects" : "Explore"}
                </button>
              ))}
            </div>
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <HiPlus className="text-lg" /> Create
            </Button>
          </div>

          {loading ? (
            <Card tone="translucent" className="flex h-64 items-center justify-center">
              <span className="loading loading-spinner loading-lg text-brand-300" />
            </Card>
          ) : displayProjects.length === 0 ? (
            <Card tone="translucent" className="flex flex-col items-center gap-4 p-8 text-center">
              {activeTab === "my" ? <HiCollection className="text-3xl text-brand-300" /> : <HiGlobeAlt className="text-3xl text-brand-300" />}
              <h3 className="text-lg font-semibold text-neutral-100">{activeTab === "my" ? "No projects yet" : "No projects to explore"}</h3>
              <p className="text-sm text-neutral-400">{activeTab === "my" ? "Create a project to start collaborating." : "All projects are either private or you've already joined."}</p>
              {activeTab === "my" && <Button variant="primary" onClick={() => setShowCreate(true)}><HiPlus className="text-lg" /> Create Project</Button>}
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {displayProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  currentUserId={currentUserId}
                  onJoin={requestJoin}
                  onView={setChatProject}
                  onRespond={respondToRequest}
                  onRemove={removeMember}
                  onShowMembers={setMembersProject}
                  onEdit={setEditingProject}
                  onDelete={handleDelete}
                  onShowRoadmap={setRoadmapProject}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <Card tone="translucent" className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-100">Create Project</h2>
              <p className="text-xs text-neutral-400">Share your vision and find teammates.</p>
            </div>
            <Button variant="ghost" onClick={() => setShowCreate(false)}><HiX className="text-xl" /></Button>
          </div>
          <div className="grid gap-4">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase text-neutral-500">Project Title</label>
                <button
                  type="button"
                  onClick={handleMagicSuggest}
                  disabled={loadingSuggestion}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-400 hover:text-brand-300 disabled:opacity-50"
                  title="Generate description and tech stack automatically"
                >
                  {loadingSuggestion ? "Thinking..." : "✨ Magic AI"}
                </button>
              </div>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Real-time Crypto Dashboard"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-neutral-500">Tech Stack</label>
              <TechInput
                value={form.techStack}
                onChange={(ts) => setForm((p) => ({ ...p, techStack: ts }))}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-neutral-500">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe your vision and find teammates."
                className="min-h-[150px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-100 outline-none resize-y focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" onClick={createProject} disabled={creating}>{creating ? <span className="loading loading-spinner loading-sm" /> : <><HiPlus className="text-lg" /> Create Project</>}</Button>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {editingProject && <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} onSave={handleEditSave} />}
        {chatProject && <ProjectChat project={chatProject} currentUserId={currentUserId} onClose={() => setChatProject(null)} />}
        {membersProject && <MembersModal project={membersProject} currentUserId={currentUserId} onClose={() => setMembersProject(null)} onRemove={removeMember} />}
        {roadmapProject && <RoadmapModal project={roadmapProject} onClose={() => setRoadmapProject(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default Projects;