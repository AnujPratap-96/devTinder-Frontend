/* eslint-disable react/prop-types */
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { BASE_URL } from "../utils/constant";
import axios from "axios";
import { removeUserFromFeed } from "../store/feedSlice";
import { useDispatch } from "react-redux";
import { useToast } from "../context/ToastProvider";
import { useTheme } from "../context/ThemeProvider";
import { HiHeart, HiX, HiCode, HiLightningBolt, HiLocationMarker, HiBan, HiFlag, HiBookmark, HiCheck, HiArrowLeft } from "react-icons/hi";
import AIMatchExplainer from "./AIMatchExplainer";
import Button from "./ui/Button";
import { highlightText } from "../utils/textUtils.jsx";

const themeStyles = {
  default: {
    shadow: "0 24px 60px rgba(8, 12, 24, 0.45)",
    gradient: "linear-gradient(to top, rgba(8,12,24,0.92) 0%, rgba(8,12,24,0.45) 45%, rgba(8,12,24,0.05) 100%)",
    font: "sans",
    badgeBg: "rgba(99,102,241,0.18)",
    badgeColor: "#c7d2fe",
    badgeBorder: "rgba(99,102,241,0.35)"
  },
  glassmorphism: {
    shadow: "0 24px 60px rgba(8, 12, 24, 0.45)",
    gradient: "linear-gradient(to top, rgba(8,12,24,0.92) 0%, rgba(8,12,24,0.45) 45%, rgba(8,12,24,0.05) 100%)",
    font: "sans tracking-tight",
    badgeBg: "rgba(255,255,255,0.10)",
    badgeColor: "#e2e8f0",
    badgeBorder: "rgba(255,255,255,0.20)"
  },
  minimal: {
    shadow: "0 18px 44px rgba(8, 12, 24, 0.50)",
    gradient: "linear-gradient(to top, rgba(8,12,24,0.90) 0%, rgba(8,12,24,0.50) 50%, transparent 100%)",
    font: "sans font-light tracking-wide",
    badgeBg: "rgba(255,255,255,0.08)",
    badgeColor: "#e2e8f0",
    badgeBorder: "rgba(255,255,255,0.18)"
  },
  matrix: {
    shadow: "0 24px 60px rgba(16,185,129,0.16)",
    gradient: "linear-gradient(to top, rgba(6,18,12,0.92) 0%, rgba(6,18,12,0.42) 50%, transparent 100%)",
    font: "mono",
    badgeBg: "rgba(16,185,129,0.16)",
    badgeColor: "#86efac",
    badgeBorder: "rgba(16,185,129,0.35)"
  },
  hacker: {
    shadow: "0 24px 60px rgba(34,197,94,0.18)",
    gradient: "linear-gradient(to top, rgba(4,12,8,0.94) 0%, rgba(4,12,8,0.45) 50%, transparent 100%)",
    font: "mono",
    badgeBg: "rgba(34,197,94,0.16)",
    badgeColor: "#86efac",
    badgeBorder: "rgba(34,197,94,0.35)"
  },
  neon: {
    shadow: "0 24px 60px rgba(168,85,247,0.18)",
    gradient: "linear-gradient(to top, rgba(20,8,24,0.92) 0%, rgba(20,8,24,0.42) 50%, transparent 100%)",
    font: "sans",
    badgeBg: "rgba(168,85,247,0.16)",
    badgeColor: "#f5d0fe",
    badgeBorder: "rgba(168,85,247,0.35)"
  },
  cyberpunk: {
    shadow: "0 24px 60px rgba(234,179,8,0.16)",
    gradient: "linear-gradient(to top, rgba(20,16,4,0.92) 0%, rgba(20,16,4,0.42) 50%, transparent 100%)",
    font: "sans uppercase tracking-wide",
    badgeBg: "rgba(234,179,8,0.16)",
    badgeColor: "#fde68a",
    badgeBorder: "rgba(234,179,8,0.35)"
  }
};

const SwipeCard = ({ user, searchQuery = "" }) => {
  const { addToast } = useToast();
  const { theme: appTheme } = useTheme();
  const isAppDark = appTheme !== "light";
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
    theme = "default",
    endorsements = [],
  } = user;

  const currentTheme = themeStyles[theme] || themeStyles["default"];

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

  const toggleBookmark = async () => {
    try {
      if (bookmarked) {
        await axios.delete(`${BASE_URL}/bookmark/${_id}`, { withCredentials: true });
        setBookmarked(false);
        addToast("Bookmark removed", "success");
      } else {
        await axios.post(
          `${BASE_URL}/bookmark`,
          { userId: _id },
          { withCredentials: true }
        );
        setBookmarked(true);
        addToast("Profile saved", "success");
      }
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to bookmark", "error");
    }
  };

  const blockUser = async () => {
    try {
      await axios.post(
        `${BASE_URL}/block`,
        { userId: _id },
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
        `${BASE_URL}/report`,
        { userId: _id, reason: "Inappropriate behavior" },
        { withCredentials: true }
      );
      addToast("User reported", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to report user", "error");
    }
  };

  const [localEndorsements, setLocalEndorsements] = useState(endorsements);

  const handleEndorse = async (skill) => {
    try {
      const res = await axios.post(`${BASE_URL}/user/endorse`, { targetUserId: _id, skill }, { withCredentials: true });
      addToast(`Endorsed for ${skill} 👍`, "success");
       setLocalEndorsements(res.data.data || []);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to endorse", "error");
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
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => sendConnectionRequest("ignored", _id, "left")}
                className="swipe-btn-nope"
                aria-label="Skip"
              >
                <HiX />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => sendConnectionRequest("interested", _id, "right")}
                className="swipe-btn-like"
                aria-label="Like"
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
        className={`relative cursor-grab active:cursor-grabbing select-none ${currentTheme.font}`}
        style={{
          width: "min(340px, 86vw)",
          height: "520px",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: currentTheme.shadow,
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
            onClick={toggleBookmark}
            className={`rounded-full border p-2 backdrop-blur transition ${
              bookmarked
                ? "border-brand-500/60 bg-brand-500/30 text-brand-200"
                : "border-white/40 bg-black/55 text-white hover:bg-black/75"
            }`}
            title={bookmarked ? "Remove bookmark" : "Save profile"}
          >
            <HiBookmark className="text-sm" />
          </button>
          <button
            type="button"
            onClick={blockUser}
            className="rounded-full border border-warning-400/50 bg-black/55 p-2 text-warning-200 backdrop-blur transition hover:bg-warning-500/30"
            title="Block user"
          >
            <HiBan className="text-sm" />
          </button>
          <button
            type="button"
            onClick={reportUser}
            className="rounded-full border border-white/40 bg-black/55 p-2 text-white backdrop-blur transition hover:bg-black/75"
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
          <div className="rounded-lg border-[3px] border-success-500 px-4 py-1.5 text-xl font-black text-success-500 tracking-[0.1em]">
            LIKE
          </div>
        </motion.div>

        {/* NOPE badge */}
        <motion.div
          className="absolute top-8 right-8 z-20 rotate-[20deg]"
          style={{ opacity: nopeOpacity }}
        >
          <div className="rounded-lg border-[3px] border-error-500 px-4 py-1.5 text-xl font-black text-error-500 tracking-[0.1em]">
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
          style={{ background: currentTheme.gradient }}
        />

        {/* Slider dots */}
        {photoUrl?.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {photoUrl.map((_, idx) => (
              <span
                key={idx}
                className={`rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "bg-white" : "bg-tint-strong"
                }`}
                style={{
                  width: idx === currentIndex ? "20px" : "6px",
                  height: "6px",
                }}
              />
            ))}
          </div>
        )}

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h2 className="text-2xl font-bold text-white leading-tight">
            {highlightText(firstName, searchQuery)} {highlightText(lastName, searchQuery)}
            {age && <span className="ml-2 font-normal text-xl text-brand-600">{age}</span>}
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-200/90">
            {role && (
              <span
                className="rounded-full px-2 py-1 uppercase tracking-wide"
                style={{
                  background: currentTheme.badgeBg,
                  color: currentTheme.badgeColor,
                  border: `1px solid ${currentTheme.badgeBorder}`,
                  backdropFilter: "blur(8px)",
                }}
              >
                {highlightText(role, searchQuery)}
              </span>
            )}
            {typeof experienceYears === "number" && (
              <span
                className="rounded-full px-2 py-1"
                style={{
                  background: currentTheme.badgeBg,
                  color: currentTheme.badgeColor,
                  border: `1px solid ${currentTheme.badgeBorder}`,
                  backdropFilter: "blur(8px)",
                }}
              >
                {experienceYears} yrs exp
              </span>
            )}
            {availability && (
              <span className={`rounded-full border px-2 py-1 font-semibold ${isAppDark ? "border-emerald-500/40 text-emerald-300" : "border-emerald-500/50 text-emerald-700"}`}>
                {availability === "open"
                  ? "Available"
                  : availability.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
              </span>
            )}
            {typeof matchScore === "number" && (
              <span className={`rounded-full border px-2 py-1 font-semibold ${isAppDark ? "border-brand-400/40 text-brand-300" : "border-brand-500/50 text-brand-600"}`}>
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
            <p className={`mt-2 text-sm leading-relaxed line-clamp-2 ${isAppDark ? "text-neutral-200" : "text-neutral-800"}`}>
              {highlightText(about, searchQuery)}
            </p>
          )}

           {skills?.length > 0 && (
             <div className="mt-3 flex flex-wrap gap-1.5">
               {truncatedSkills.map((skill, idx) => {
                 const skillEndorsementCount = localEndorsements?.find(e => e.skill.toLowerCase() === skill.toLowerCase())?.endorsers?.length || 0;
                 return (
                 <motion.span
                  key={idx}
                  whileHover={{ scale: relationshipStatus === "connected" ? 1.05 : 1 }}
                  whileTap={{ scale: relationshipStatus === "connected" ? 0.95 : 1 }}
                  onClick={(e) => {
                    if (relationshipStatus === "connected") {
                      e.stopPropagation();
                      handleEndorse(skill);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center transition-all ${relationshipStatus === "connected" ? "cursor-pointer hover:brightness-110" : ""}`}
                  style={{
                    background: currentTheme.badgeBg,
                    color: currentTheme.badgeColor,
                    border: `1px solid ${currentTheme.badgeBorder}`,
                    backdropFilter: "blur(8px)",
                  }}
                  title={relationshipStatus === "connected" ? "Click to endorse" : "Endorsements"}
                >
                  <HiCode className="inline mr-1 text-[10px]" />
                  {highlightText(skill, searchQuery)}
                  {skillEndorsementCount > 0 && (
                    <span className="ml-1.5 flex items-center gap-0.5 text-[9px] bg-tint-strong px-1.5 rounded-full font-bold">
                      {skillEndorsementCount}
                    </span>
                  )}
                </motion.span>
               )})}
              {skills.length > 4 && (
                <span className="rounded-full px-2.5 py-1 text-xs text-neutral-500">
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

      <p className="mt-4 text-xs text-neutral-600">
        {relationshipStatus === "none" ? "Drag the card or use buttons to connect" : "Current relationship status shown above"}
      </p>
    </div>
  ) : (
    <div className="text-center text-neutral-400">
      🚫 No Users Available
    </div>
  );
};

export default SwipeCard;
