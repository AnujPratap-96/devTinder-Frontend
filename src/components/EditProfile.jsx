/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { BASE_URL } from "../utils/constant";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

const EditProfile = ({ user }) => {
  const firstNameRef = useRef(user.firstName);
  const lastNameRef = useRef(user.lastName);
  const photoUrlRef = useRef(user.photoUrl[0]);
  const extraPhoto1Ref = useRef(user.photoUrl[1]|| ""); // Extra Photo 1
  const extraPhoto2Ref = useRef(user.photoUrl[2] || ""); // Extra Photo 2
  const ageRef = useRef(user.age || "");
  const genderRef = useRef(user.gender || "");
  const aboutRef = useRef(user.about || "");
  const skillsRef = useRef(user.skills ? user.skills.join(", ") : "");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);

  const saveProfile = async () => {
    setError("");
    try {
      // Creating an array for photos
      const photoUrl = [
        photoUrlRef.current.value.trim(),
        extraPhoto1Ref.current.value.trim(),
        extraPhoto2Ref.current.value.trim(),
      ].filter(url => url); // Remove empty values

      const updatedUser = {
        firstName: firstNameRef.current.value,
        lastName: lastNameRef.current.value,
        photoUrl, // Send the array instead of separate fields
        age: ageRef.current.value,
        gender: genderRef.current.value,
        about: aboutRef.current.value,
        skills: skillsRef.current.value.split(",").map(skill => skill.trim()),
      };

      const res = await axios.patch(BASE_URL + "/profile/edit", updatedUser, {
        withCredentials: true,
      });

      dispatch(addUser(res?.data?.user));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err.response.data);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full min-h-screen bg-gray-900 px-6 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full md:w-1/2 max-w-3xl">
        <h2 className="text-2xl font-semibold text-cyan-400 text-center mb-4">
          Edit Profile ✍️
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="First Name" inputRef={firstNameRef} />
          <InputField label="Last Name" inputRef={lastNameRef} />
          <InputField label="Age" inputRef={ageRef} />
          <InputField label="Gender" inputRef={genderRef} />
          <InputField label="Photo URL" inputRef={photoUrlRef} fullWidth />
          {user.isPremium && (
            <>
              <InputField label="Extra Photo URL 1" inputRef={extraPhoto1Ref} fullWidth />
              <InputField label="Extra Photo URL 2" inputRef={extraPhoto2Ref} fullWidth />
            </>
          )}
          <InputField label="About" inputRef={aboutRef} fullWidth />
          <InputField label="Skills (comma separated)" inputRef={skillsRef} fullWidth />
        </div>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <div className="flex justify-center mt-4">
          <button
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2 rounded-lg transition-all duration-200 shadow-md"
            onClick={saveProfile}
          >
            Save Profile
          </button>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-0">
        <UserCard user={user} />
      </div>

      {showToast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md z-50">
          Profile saved successfully! ✅
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, inputRef, fullWidth }) => (
  <div className={`flex flex-col w-full ${fullWidth ? "md:col-span-2" : ""}`}>
    <label className="text-sm font-medium text-gray-300">{label}:</label>
    <input
      type="text"
      defaultValue={inputRef.current}
      ref={inputRef}
      className="mt-1 p-2 bg-gray-700 text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
    />
  </div>
);

const UserCard = ({ user }) => {
  const images = user.photoUrl
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const truncatedSkills = user.isPremium ? user.skills.slice(0, 5) : user.skills.slice(0, 3);

  return (
    <motion.div
      className="relative w-full max-w-xs md:w-80 h-[75vh] rounded-2xl overflow-hidden shadow-lg bg-gray-800 border border-transparent"
      whileHover={{
        scale: 1.05,
        boxShadow: "0px 0px 20px rgba(0, 255, 255, 0.5)",
      }}
    >
      {/* Background Image Slider */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {images.map((img, index) => (
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
      <div className="absolute bottom-2 left-4 right-4 p-2 bg-gray-900/60 backdrop-blur-md rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center">
          {user.firstName} {user.lastName} {user.isPremium && <FaCheckCircle className="text-blue-500 ml-2" />}
        </h2>
        <p className="text-gray-300 text-sm">🎂 {user.age || "N/A"} years old</p>
        <p className="text-gray-300 text-sm">👩‍💻 {user.about || "No bio available"}</p>
        <p className="text-gray-300 text-sm">🚀 Skills: {truncatedSkills.join(", ")}</p>
      </div>
    </motion.div>
  );
};

export default EditProfile;
