import { useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";

import { useToast } from "../context/ToastProvider";
const OtpVerify = () => {
  const {addToast} = useToast();
  const navigate = useNavigate();
  const otpRefs = useRef([]); // single ref storing all input elements

  // ✅ Redirect logic fixed
  useEffect(() => {
    const signup_token = localStorage.getItem("signup_token");
    if (!signup_token) {
      navigate("/register");
    }
  }, [navigate]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1); // only 1 digit
    e.target.value = val;
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    paste.split("").forEach((ch, i) => {
      if (otpRefs.current[i]) otpRefs.current[i].value = ch;
    });
    const focusIndex = Math.min(paste.length, 6) - 1;
    if (focusIndex >= 0) otpRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otp = otpRefs.current.map((el) => el?.value || "").join("");
    if (otp.length < 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }

    try {
      const res = await axios.post(
        BASE_URL + "/verify-otp",
        { otp },
        { withCredentials: true }
      );

      if (res.status === 200) {
        addToast(" OTP verified successfully! ✅" , "success")
       
        navigate("/complete-signup");
      }
    } catch (err) {
      addToast(err?.response?.data?.error || "❌ Invalid OTP", "error");
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center px-4 sm:px-6">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl bg-gray-800 p-6 sm:p-8 rounded-xl shadow-xl">
        
        {/* Left side - OTP Form */}
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-2xl sm:text-3xl font-bold">Verify OTP</h2>
          <p className="text-gray-400 mb-4 text-sm sm:text-base">
            Enter the 6-digit code sent to your email
          </p>

          {/* OTP input fields */}
          <div
            className="flex space-x-2 mb-4 justify-center"
            onPaste={handlePaste}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                className="w-10 h-10 sm:w-12 sm:h-12 border rounded bg-gray-700 text-center text-lg sm:text-xl"
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          <button
            onClick={handleVerifyOtp}
            className="w-full bg-blue-600 mt-4 p-2 rounded text-white font-semibold hover:bg-blue-700 transition"
          >
            Verify OTP
          </button>

          {/* Redirect to signup */}
          <p className="mt-4 text-center text-gray-400 text-sm">
            Not registered?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-400 cursor-pointer hover:underline"
            >
              Register
            </span>
          </p>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="https://i.pinimg.com/originals/06/aa/40/06aa408f09f394c3b46d6cbe1efad944.gif"
            alt="OTP Illustration"
            className="w-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default OtpVerify;
