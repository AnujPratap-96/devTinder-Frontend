/* eslint-disable react/prop-types */
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { BASE_URL } from "../utils/constant";
import axios from "axios";
import { removeUserFromFeed } from "../store/feedSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";

const SwipeCard = ({ user }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipe, setSwipe] = useState("center");
  const dispatch = useDispatch();

  const { _id, firstName, lastName, about, photoUrl, age, gender, skills } =
    user || {};
  const truncatedSkills = user?.skills ? user.skills.slice(0, 3) : [];

  // Motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Tilt effect
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  // Auto image slideshow
  useEffect(() => {
    if (photoUrl?.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photoUrl.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [photoUrl?.length]);

  // Send request + animate out
  const sendConnectionRequest = async (status, userId, direction) => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );

      setSwipe(direction);
      toast.success(`Marked as ${status}`);

      setTimeout(() => {
        dispatch(removeUserFromFeed(userId));
      }, 350);
    } catch (err) {
      toast.error("Error sending connection request");
      setSwipe("center");
    }
  };

  // Handle drag release
  const handleDragEnd = (_, info) => {
    if (info.offset.x > 120) {
      sendConnectionRequest("interested", _id, "right");
    } else if (info.offset.x < -120) {
      sendConnectionRequest("ignored", _id, "left");
    } else {
      setSwipe("center");
    }
  };

  // Swipe animations
  const swipeVariants = {
    center: { x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 },
    right: { x: 100, y: 50, opacity: 0, rotate: 25, scale: 0.95 },
    left: { x: -100, y: 50, opacity: 0, rotate: -25, scale: 0.95 },
  };

  return user ? (
    <div className="relative flex justify-center items-center bg-gray-900 py-6 overflow-hidden w-full">
      {/* Card */}
      <motion.div
        className="relative w-80 h-[75vh] rounded-3xl overflow-hidden shadow-2xl cursor-grab bg-gray-800"
        drag
        style={{ x, y, rotate }}
        dragElastic={0.4}
        dragMomentum={true}
        onDragEnd={handleDragEnd}
        variants={swipeVariants}
        animate={swipe}
        transition={{ type: "tween", duration: 0.2, ease: "easeIn" }}
      >
        {/* Image slider */}
        <div className="absolute inset-0">
          {photoUrl?.map((img, index) => (
            <img
              key={index}
              src={
                img ||
                "https://i.pinimg.com/474x/18/b9/ff/18b9ffb2a8a791d50213a9d595c4dd52.jpg"
              }
              alt="User"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80"></div>

        {/* Slider dots */}
        {photoUrl?.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex space-x-1">
            {photoUrl.map((_, idx) => (
              <span
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              ></span>
            ))}
          </div>
        )}

        {/* User info */}
        <div className="absolute bottom-0 p-5 w-full bg-gradient-to-t from-black/70 via-black/50 to-transparent">
          <h2 className="text-2xl font-bold text-cyan-300 drop-shadow-md">
            {firstName} {lastName},{" "}
            <span className="font-medium text-pink-400">{age}</span>
          </h2>
          <p className="text-purple-300 text-sm mt-1">
            {gender === "male" ? "🧔 Male" : "🙍 Female"}
          </p>
          <p className="text-gray-300 text-sm italic line-clamp-2 mt-2">
            {about}
          </p>
          {skills?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {truncatedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* LIKE / NOPE badges stay centered */}
      {swipe === "right" && (
        <motion.div
          className="absolute text-green-400 font-extrabold text-5xl drop-shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          LIKE
        </motion.div>
      )}

      {swipe === "left" && (
        <motion.div
          className="absolute text-red-400 font-extrabold text-5xl drop-shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          NOPE
        </motion.div>
      )}
    </div>
  ) : (
    <div className="text-center text-cyan-400 text-lg">
      🚫 No Users Available
    </div>
  );
};

export default SwipeCard;
