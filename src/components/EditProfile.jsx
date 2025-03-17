/* eslint-disable react/prop-types */
import { useRef, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { BASE_URL } from "../utils/constant";
import { motion } from "framer-motion";

const EditProfile = ({ user }) => {
  const firstNameRef = useRef(user.firstName);
  const lastNameRef = useRef(user.lastName);
  const photoUrlRef = useRef(user.photoUrl);
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
      const updatedUser = {
        firstName: firstNameRef.current.value,
        lastName: lastNameRef.current.value,
        photoUrl: photoUrlRef.current.value,
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
      {/* Left: Form */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full md:w-1/2 max-w-3xl">
        <h2 className="text-2xl font-semibold text-cyan-400 text-center mb-4">
          Edit Profile ✍️
        </h2>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="First Name" inputRef={firstNameRef} />
          <InputField label="Last Name" inputRef={lastNameRef} />
          <InputField label="Age" inputRef={ageRef} />
          <InputField label="Gender" inputRef={genderRef} />
          <InputField label="Photo URL" inputRef={photoUrlRef} fullWidth />
          <InputField label="About" inputRef={aboutRef} fullWidth />
          <InputField label="Skills (comma separated)" inputRef={skillsRef} fullWidth />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        {/* Save Button */}
        <div className="flex justify-center mt-4">
          <button
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2 rounded-lg transition-all duration-200 shadow-md"
            onClick={saveProfile}
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* Right: User Card */}
      <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-0">
        <UserCard user={user} />
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md z-50">
          Profile saved successfully! ✅
        </div>
      )}
    </div>
  );
};

// Input Field Component with Responsive Styles
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

// User Card Component
const UserCard = ({ user }) => {
  const truncatedSkills = user.skills ? user.skills.slice(0, 3) : [];

  return (
    <motion.div
      className="relative w-full max-w-xs md:w-80 h-[75vh] rounded-2xl overflow-hidden shadow-lg bg-gray-800 border border-transparent"
      whileHover={{
        scale: 1.05,
        boxShadow: "0px 0px 20px rgba(0, 255, 255, 0.5)",
      }}
    >
      <img
        src={user.photoUrl || "https://via.placeholder.com/150"}
        alt={`${user.firstName} ${user.lastName}`}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/40 to-gray-900/80"></div>
      <div className="absolute bottom-2 left-4 right-4 p-2 bg-gray-900/60 backdrop-blur-md rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-gray-300 text-sm">
          🎂 {user.age || "N/A"} years old ,{" "}
          {user.gender === "male" ? (
            <span className="text-gray-300">🧔‍♂️ Male </span>
          ) : (
            <span className="text-gray-300">🙍‍♀️ Female</span>
          )}
        </p>
        <p className="text-gray-300 text-sm line-clamp-2">
          👩‍💻 {user.about || "No bio available"}
        </p>
        <p className="text-gray-300 text-sm">
          🚀 Skills: {truncatedSkills.join(", ")}
        </p>
      </div>
    </motion.div>
  );
};

export default EditProfile;
