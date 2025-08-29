/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { BASE_URL } from "../utils/constant";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { useToast } from "../context/ToastProvider";


const EditProfile = ({ user }) => {
  const {addToast} = useToast();
  const firstNameRef = useRef(user.firstName);
  const lastNameRef = useRef(user.lastName);
  const ageRef = useRef(user.age || "");
  const genderRef = useRef(user.gender || "");
  const aboutRef = useRef(user.about || "");
  const skillsRef = useRef(user.skills ? user.skills.join(", ") : "");
  const photoUrlRef = useRef([...user.photoUrl]); // keep old urls

  const [openModal, setOpenModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const saveProfile = async () => {
    try {
      const body = {
        firstName: firstNameRef.current.value,
        lastName: lastNameRef.current.value,
        age: ageRef.current.value,
        gender: genderRef.current.value,
        about: aboutRef.current.value,
        skills: skillsRef.current.value.split(",").map((s) => s.trim()),
        // photoUrl: photoUrlRef.current, // include updated photos
      };

      const res = await axios.patch(BASE_URL + "/profile/edit", body, {
        withCredentials: true,
      });

      dispatch(addUser(res?.data?.user));
      addToast("Profile Updated Successfully" , "success")
    } catch (err) {
      addToast(err.data.message || "Something went wrong" , "error")
    }
  };

  const uploadImage = async () => {
    if (!selectedFile || selectedIndex === null) return;
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("index", selectedIndex);

      const res = await axios.patch(
        BASE_URL + "/profile/upload-image",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.status === 200 && res.data.secure_url) {
        photoUrlRef.current[selectedIndex] = res.data.secure_url;
        dispatch(addUser({ ...user, photoUrl: photoUrlRef.current }));
       addToast("Image Uploaded" , "success")

        // Close modal only after success
        setOpenModal(false);
        setSelectedFile(null);
        setSelectedIndex(null);
      }
    } catch (err) {
      addToast(err.response?.data?.message ||"Image upload failed ❌" , "error" )
     
    } finally {
      setLoading(false);
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
          <InputField label="About" inputRef={aboutRef} fullWidth />
          <InputField
            label="Skills (comma separated)"
            inputRef={skillsRef}
            fullWidth
          />

          {/* Profile Images */}
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-300 mb-1">
              Profile Images
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {[...Array(user.isPremium ? 3 : 1)].map((_, index) => (
                <div
                  key={index}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedIndex(index);
                    setOpenModal(true);
                  }}
                >
                  <img
                    src={
                      photoUrlRef.current[index] ||
                      "https://via.placeholder.com/150"
                    } // placeholder
                    alt="preview"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2 rounded-lg transition-all duration-200 shadow-md"
            onClick={saveProfile}
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* Preview Card */}
      <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-0">
        <UserCard user={{ ...user, photoUrl: photoUrlRef.current }} />
      </div>

      {/* Modal for Upload */}
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl mb-4">Upload Image</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              disabled={loading}
            />

            {selectedFile && (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="preview"
                className="w-40 h-40 object-cover rounded-lg mt-3"
              />
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-600 rounded-lg disabled:opacity-50"
                onClick={() => setOpenModal(false)}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg flex items-center gap-2 disabled:opacity-50"
                onClick={uploadImage}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loader border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </div>
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
  const images = user.photoUrl;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(
        () => setCurrentIndex((prev) => (prev + 1) % images.length),
        3000
      );
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const truncatedSkills = user.isPremium
    ? user.skills.slice(0, 5)
    : user.skills.slice(0, 3);

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
          {user.firstName} {user.lastName}{" "}
          {user.isPremium && <FaCheckCircle className="text-blue-500 ml-2" />}
        </h2>
        <p className="text-gray-300 text-sm">
          🎂 {user.age || "N/A"} years old
        </p>
        <p className="text-gray-300 text-sm">
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
