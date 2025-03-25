/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { useState } from "react";
import { BASE_URL } from "../utils/constant";
import axios from "axios";
import { removeUserFromFeed } from "../store/feedSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

const SwipeCard = ({ user }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();
  const { _id, firstName, lastName, about, photoUrl, age, gender, skills } =
    user || {};
  const truncatedSkills = user.skills ? user.skills.slice(0, 3) : [];
  const [swipe, setSwipe] = useState(null);

  useEffect(() => {
    if (photoUrl.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photoUrl.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [photoUrl.length]);

  const sendConnectionRequest = async (status, userId) => {
    try {
      const res = await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(userId));
    } catch (err) {
      console.error(err);
    }
  };

  const swipeVariants = {
    left: { x: -300, opacity: 0, rotate: -15, scale: 0.9 },
    right: { x: 300, opacity: 0, rotate: 15, scale: 0.9 },
    center: { x: 0, opacity: 1, rotate: 0, scale: 1 },
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) {
      setSwipe("right");
      sendConnectionRequest("interested", _id);
    } else if (info.offset.x < -100) {
      setSwipe("left");
      sendConnectionRequest("ignored", _id);
    } else {
      setSwipe("center");
    }
  };

  return user ? (
    <div className="flex justify-center  bg-gray-900 ">
      <motion.div
        className="relative w-80 h-[75vh] rounded-2xl overflow-hidden shadow-lg cursor-grab bg-gray-800 border border-transparent transition-all"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        variants={swipeVariants}
        animate={swipe || "center"}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        whileHover={{
          scale: 1.05,
          boxShadow: "0px 0px 20px rgba(0, 255, 255, 0.5)",
        }} // 🟢 Hover Effect
      >
        {/* 🔥 Neon Border Animation */}
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent animate-glow"></div>

        {/* Background Image Slider */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {photoUrl.map((img, index) => (
            <img
              key={index}
              src={img || "https://via.placeholder.com/150"}
              alt="User background"
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/40 to-gray-900/80"></div>

        {/* 📌 User Info Container - Moved to Bottom */}
        <div className="absolute bottom-1 left-0 right-0 p-5 bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-md ml-1 mr-1">
          {/* 🏷️ Name with Gradient */}
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {firstName} {lastName}
          </h2>

          {/* 📋 Additional Details */}
          <p className="text-gray-300 text-sm flex items-center gap-2">
            🎂 <span className="font-medium">{age} years old</span>
            📌{" "}
            <span className="font-medium ">
              {gender == "male" ? "🧔‍♂️ male" : "🙍‍♀️ female"}
            </span>
          </p>

          <p className="text-gray-300 text-sm flex items-start gap-2 line-clamp-2">
            👩‍💻 <span className="italic">{about}</span>
          </p>
          {skills && (
            <p className="text-gray-300 text-sm">
              🚀 Skills: {truncatedSkills.join(", ")}
            </p>
          )}
        </div>

        {/* ✅ Like & ❌ Nope Effects */}
        {swipe === "right" && (
          <motion.div
            className="absolute top-8 right-8 text-green-400 text-6xl font-bold animate-wiggle drop-shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            💚 LIKE!
          </motion.div>
        )}
        {swipe === "left" && (
          <motion.div
            className="absolute top-8 left-8 text-red-400 text-6xl font-bold animate-wiggle drop-shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            ❌ NOPE!
          </motion.div>
        )}
      </motion.div>

      {/* 🔥 CSS Animations */}
      <style>
        {`
          @keyframes glow {
            0% { border-color: rgba(0, 255, 255, 0.5); }
            50% { border-color: rgba(255, 0, 255, 0.5); }
            100% { border-color: rgba(0, 255, 255, 0.5); }
          }

          .animate-glow {
            animation: glow 3s infinite alternate ease-in-out;
          }

          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
          }

          .animate-wiggle {
            animation: wiggle 0.5s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  ) : (
    <div className="text-center text-cyan-400 text-lg">
      🚫 No Users Available
    </div>
  );
};

export default SwipeCard;
