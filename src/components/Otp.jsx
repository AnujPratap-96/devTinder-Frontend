import { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import { useToast } from "../context/ToastProvider";
import { HiCode, HiArrowRight } from "react-icons/hi";
import { motion } from "framer-motion";

const OtpVerify = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const otpRefs = useRef([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const signup_token = localStorage.getItem("signup_token");
    if (!signup_token) {
      navigate("/register");
    }
  }, [navigate]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
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
      addToast("Please enter the 6-digit OTP", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "/verify-otp",
        { otp },
        { withCredentials: true }
      );
      if (res.status === 200) {
        addToast("OTP verified successfully! ✅", "success");
        navigate("/complete-signup");
      }
    } catch (err) {
      addToast(err?.response?.data?.error || "❌ Invalid OTP", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#0a0f1e" }}
    >
      {/* Ambient */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", filter: "blur(70px)" }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)", filter: "blur(70px)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 sm:p-10 rounded-2xl relative z-10"
        style={{ background: "#0f1629", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <HiCode />
          </div>
          <span className="font-bold text-xl" style={{ color: "#e0e7ff" }}>DevTinder</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {["Email", "OTP Verify", "Profile"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: i === 0 ? "rgba(99,102,241,0.3)" : i === 1 ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.06)",
                    color: i <= 1 ? "white" : "#64748b",
                  }}
                >
                  {i === 0 ? "✓" : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block" style={{ color: i === 1 ? "#a5b4fc" : "#475569" }}>{step}</span>
              </div>
              {i < 2 && <div className="h-px w-6" style={{ background: i === 0 ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)" }} />}
            </div>
          ))}
        </div>

        {/* OTP icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
          style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          📧
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: "#f1f5f9" }}>Verify your email</h2>
        <p className="text-sm text-center mb-8" style={{ color: "#64748b" }}>
          Enter the 6-digit code sent to your email address
        </p>

        {/* OTP Inputs */}
        <div className="flex gap-1 sm:gap-3 justify-center mb-6 overflow-x-auto" onPaste={handlePaste}>
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              key={index}
              ref={(el) => (otpRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold"
              style={{
                textAlign: "center",
                background: "rgba(255,255,255,0.04)",
                border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#f1f5f9",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
                e.target.style.background = "rgba(99,102,241,0.1)";
                e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.1)";
                e.target.style.background = "rgba(255,255,255,0.04)";
                e.target.style.boxShadow = "none";
              }}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleVerifyOtp}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
          style={{
            padding: "13px",
            background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "white",
            fontWeight: 700,
            fontSize: "0.95rem",
            borderRadius: "10px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
          }}
        >
          {loading ? (
            <><div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} /> Verifying...</>
          ) : (
            <>Verify OTP <HiArrowRight /></>
          )}
        </motion.button>

        <p className="mt-6 text-center text-sm" style={{ color: "#64748b" }}>
          Not registered?{" "}
          <span
            onClick={() => navigate("/register")}
            className="font-semibold cursor-pointer"
            style={{ color: "#818cf8" }}
          >
            Register here
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default OtpVerify;
