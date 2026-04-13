/* eslint-disable react/prop-types */
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { BASE_URL } from "../utils/constant";
import axios from "axios";
import { removeUserFromFeed } from "../store/feedSlice";
import { useDispatch } from "react-redux";
import { useToast } from "../context/ToastProvider";
import { HiHeart, HiX, HiCode, HiLightningBolt, HiLocationMarker, HiBan, HiFlag, HiBookmark, HiCheck, HiArrowLeft } from "react-icons/hi";
import AIMatchExplainer from "./AIMatchExplainer";
import Button from "./ui/Button";
import { highlightText } from "../utils/textUtils.jsx";

const SwipeCard = ({ user, searchQuery = "" }) => {
  const { addToast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipe, setSwipe] = useState("center");
  const [bookmarked, setBookmarked] = useState(Boolean(user?.isBookmarked));
  const dispatch = useDispatch();

  if (!user || !user._id) {
    console.warn("SwipeCard received invalid user object:", user);
    return null;
  }

  const {
    _id,
    firstName = "",
    lastName = "",
    about = "",
    photoUrl: incomingPhotoUrl,
    age,
    gender,
    skills = [],
    role = "Developer",
    experienceYears,
    availability,
    distanceKm,
    recommended,
    matchScore,
    relationshipStatus = "none",
  } = user;

  const photoUrl = Array.isArray(incomingPhotoUrl) 
    ? incomingPhotoUrl 
    : (incomingPhotoUrl ? [incomingPhotoUrl] : []);

  const truncatedSkills = Array.isArray(skills) ? skills.slice(0, 4) : [];

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0]);

  // Record view on mount
  useEffect(() => {
    if (_id) {
      axios.post(`${BASE_URL}/profile/view/${_id}`, {}, { withCredentials: true })
        .catch(err => console.error("Error recording profile view:", err));
    }
  }, [_id]);

  useEffect(() => {
    if (photoUrl?.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photoUrl.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [photoUrl?.length]);

  const sendConnectionRequest = async (status, userId, direction) => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );
      setSwipe(direction);
      addToast(status === "interested" ? "💚 Connection sent!" : "✕ Skipped", status === "interested" ? "success" : "info");
      setTimeout(() => {
        dispatch(removeUserFromFeed(userId));
      }, 350);
    } catch (err) {
      addToast(err.response?.data?.message || "Something went wrong", "error");
      setSwipe("center");
    }
  };

  const respondToRequest = async (status, userId) => {
    try {
      const action = status === "accepted" ? "interested" : "ignored";
      await axios.post(
        `${BASE_URL}/request/send/${action}/${userId}`,
        {},
        { withCredentials: true }
      );
      addToast(status === "accepted" ? "Connection Accepted!" : "Ignored", "success");
      dispatch(removeUserFromFeed(userId));
    } catch (err) {
      addToast(err.response?.data?.message || "Unable to respond", "error");
    }
  };

  const bookmarkProfile = async () => {
    try {
      await axios.post(
        `${BASE_URL}/bookmark`,
        { userId: _id },
        { withCredentials: true }
      );
      setBookmarked(true);
      addToast("Profile saved", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to bookmark", "error");
    }
  };

  const blockUser = async () => {
    try {
      await axios.post(
        `${BASE_URL}/user/block`,
        { blockedUserId: _id },
        { withCredentials: true }
      );
      addToast("User blocked", "success");
      dispatch(removeUserFromFeed(_id));
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to block user", "error");
    }
  };

  const reportUser = async () => {
    try {
      await axios.post(
        `${BASE_URL}/user/report`,
        { reportedUserId: _id, reason: "Inappropriate behavior" },
        { withCredentials: true }
      );
      addToast("User reported", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to report user", "error");
    }
  };

  const handleDragEnd = (_, info) => {
    if (relationshipStatus !== "none") return setSwipe("center");
    if (info.offset.x > 120) {
      sendConnectionRequest("interested", _id, "right");
    } else if (info.offset.x < -120) {
      sendConnectionRequest("ignored", _id, "left");
    } else {
      setSwipe("center");
    }
  };

  const swipeVariants = {
    center: { x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 },
    right: { x: 200, y: 50, opacity: 0, rotate: 25, scale: 0.9 },
    left: { x: -200, y: 50, opacity: 0, rotate: -25, scale: 0.9 },
  };

  const renderActions = () => {
    switch (relationshipStatus) {
      case "connected":
        return (
          <div className="flex h-14 items-center gap-2 rounded-2xl bg-success-500/10 px-6 font-semibold text-success-300 border border-success-500/30">
            <HiCheck className="text-xl" /> Connected
          </div>
        );
      case "pending_sent":
        return (
          <div className="flex h-14 items-center gap-2 rounded-2xl bg-warning-500/10 px-6 font-semibold text-warning-300 border border-warning-500/30">
            ⏳ Request Pending
          </div>
        );
      case "pending_received":
        return (
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => respondToRequest("ignored", _id)}
              className="px-6 py-4 rounded-xl border-error-500/40 text-error-400 hover:bg-error-500/10"
            >
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={() => respondToRequest("accepted", _id)}
              className="px-8 py-4 rounded-xl shadow-brand-glow"
            >
              Accept
            </Button>
          </div>
        );
      default:
        return (
          <>
            <motion.button
              whileHover={{ scale: 1.12, boxShadow: "0 0 25px rgba(239,68,68,0.4)" }}
              whileTap={{ scale: 0.92 }}
              onClick={() => sendConnectionRequest("ignored", _id, "left")}
              className="swipe-btn-nope"
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(239,68,68,0.1)",
                border: "2px solid rgba(239,68,68,0.4)",
                color: "#f87171",
                fontSize: "1.4rem",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(239,68,68,0.15)",
                transition: "all 0.25s ease",
              }}
            >
              <HiX />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.12, boxShadow: "0 8px 35px rgba(16,185,129,0.35)" }}
              whileTap={{ scale: 0.92 }}
              onClick={() => sendConnectionRequest("interested", _id, "right")}
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, rgba(16,185,129,0.25), rgba(52,211,153,0.2))",
                border: "2px solid rgba(16,185,129,0.5)",
                color: "#34d399",
                fontSize: "1.6rem",
                cursor: "pointer",
                boxShadow: "0 8px 25px rgba(16,185,129,0.25)",
                transition: "all 0.25s ease",
              }}
            >
              <HiHeart />
            </motion.button>
          </>
        );
    }
  };

  return user ? (
    <div className="relative flex flex-col justify-center items-center w-full">
      {/* Card */}
      <motion.div
        className="relative cursor-grab active:cursor-grabbing select-none"
        style={{
          width: "340px",
          height: "520px",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
          x,
          y,
          rotate,
        }}
        drag={relationshipStatus === "none"}
        dragElastic={0.4}
        dragMomentum={true}
        onDragEnd={handleDragEnd}
        variants={swipeVariants}
        animate={swipe}
        transition={{ type: "tween", duration: 0.25, ease: "easeIn" }}
      >
        {recommended && (
          <div className="absolute top-6 left-6 z-30 flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200 shadow-lg">
            <HiLightningBolt className="text-sm" /> Recommended
          </div>
        )}

        <div className="absolute top-6 right-6 z-30 flex gap-2">
          <button
            type="button"
            onClick={blockUser}
            className="rounded-full border border-warning-400/40 bg-warning-500/20 p-2 text-warning-200 transition hover:bg-warning-500/30"
            title="Block user"
          >
            <HiBan className="text-sm" />
          </button>
          <button
            type="button"
            onClick={reportUser}
            className="rounded-full border border-neutral-400/40 bg-neutral-500/20 p-2 text-neutral-300 transition hover:bg-neutral-500/30"
            title="Report user"
          >
            <HiFlag className="text-sm" />
          </button>
        </div>

        {/* LIKE badge */}
        <motion.div
          className="absolute top-8 left-8 z-20 rotate-[-20deg]"
          style={{ opacity: likeOpacity }}
        >
          <div
            className="px-4 py-1.5 rounded-lg text-xl font-black"
            style={{ border: "3px solid #34d399", color: "#34d399", letterSpacing: "0.1em" }}
          >
            LIKE
          </div>
        </motion.div>

        {/* NOPE badge */}
        <motion.div
          className="absolute top-8 right-8 z-20 rotate-[20deg]"
          style={{ opacity: nopeOpacity }}
        >
          <div
            className="px-4 py-1.5 rounded-lg text-xl font-black"
            style={{ border: "3px solid #f87171", color: "#f87171", letterSpacing: "0.1em" }}
          >
            NOPE
          </div>
        </motion.div>

        {/* Photo sliders */}
        <div className="absolute inset-0">
          {photoUrl?.map((img, index) => (
            <img
              key={index}
              src={img || "https://i.pinimg.com/474x/18/b9/ff/18b9ffb2a8a791d50213a9d595c4dd52.jpg"}
              alt="developer"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)" }}
        />

        {/* Slider dots */}
        {photoUrl?.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {photoUrl.map((_, idx) => (
              <span
                key={idx}
                className="rounded-full transition-all duration-300"
                style={{
                  width: idx === currentIndex ? "20px" : "6px",
                  height: "6px",
                  background: idx === currentIndex ? "white" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </div>
        )}

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-2xl font-bold text-white leading-tight">
            {highlightText(firstName, searchQuery)} {highlightText(lastName, searchQuery)}
            {age && <span className="font-normal text-xl ml-2" style={{ color: "#c7d2fe" }}>{age}</span>}
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-200/90">
            {role && (
              <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1 uppercase tracking-wide">
                {highlightText(role, searchQuery)}
              </span>
            )}
            {typeof experienceYears === "number" && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                {experienceYears} yrs exp
              </span>
            )}
            {availability && (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 text-emerald-200">
                {availability === "open"
                  ? "Available"
                  : availability.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
              </span>
            )}
            {typeof matchScore === "number" && (
              <span className="rounded-full border border-brand-400/40 bg-brand-500/10 px-2 py-1 text-brand-100">
                Score {Math.round(matchScore)}%
              </span>
            )}
          </div>

          {(gender || distanceKm !== undefined) && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-300/80">
              {gender && <span>{gender === "male" ? "♂ Male" : gender === "female" ? "♀ Female" : gender}</span>}
              {distanceKm !== undefined && (
                <span className="flex items-center gap-1 text-xs">
                  <HiLocationMarker className="text-sm" />
                  {distanceKm} km away
                </span>
              )}
            </div>
          )}

          {about && (
            <p className="mt-2 text-sm line-clamp-2 leading-relaxed" style={{ color: "#cbd5e1" }}>
              {highlightText(about, searchQuery)}
            </p>
          )}

           {skills?.length > 0 && (
             <div className="mt-3 flex flex-wrap gap-1.5">
               {truncatedSkills.map((skill, idx) => (
                 <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: "rgba(99,102,241,0.2)",
                    color: "#c7d2fe",
                    border: "1px solid rgba(99,102,241,0.3)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <HiCode className="inline mr-1 text-xs" />
                  {highlightText(skill, searchQuery)}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="px-2.5 py-1 rounded-full text-xs" style={{ color: "#64748b" }}>
                  +{skills.length - 4} more
                </span>
              )}
            </div>
          )}
          {/* AI Match Explainer */}
          <div className="mt-3">
            <AIMatchExplainer targetUserId={_id} targetName={firstName} />
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="flex items-center gap-6 mt-7">
        {renderActions()}
      </div>

      <p className="mt-4 text-xs" style={{ color: "#475569" }}>
        {relationshipStatus === "none" ? "Drag the card or use buttons to connect" : "Current relationship status shown above"}
      </p>
    </div>
  ) : (
    <div className="text-center" style={{ color: "#94a3b8" }}>
      🚫 No Users Available
    </div>
  );
};

export default SwipeCard;
