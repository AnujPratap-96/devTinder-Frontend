import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import { useToast } from "../context/ToastProvider";
import { HiCode, HiEye, HiEyeOff, HiArrowRight, HiArrowLeft } from "react-icons/hi";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => setResendCooldown((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (step === 2 && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast("Please enter your email", "error");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/send-otp`,
        { email, purpose: "reset-password" },
        { withCredentials: true }
      );
      addToast("OTP sent to your email!", "success");
      setStep(2);
      setResendCooldown(30);
    } catch (err) {
      addToast(err?.response?.data?.error || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otpInputs.join("");
    if (otpValue.length !== 6) {
      addToast("Please enter valid OTP", "error");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/verify-otp`,
        { email, otp: otpValue, purpose: "reset-password" },
        { withCredentials: true }
      );
      addToast("OTP verified!", "success");
      setStep(3);
    } catch (err) {
      addToast(err?.response?.data?.error || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }
    if (newPassword.length < 8) {
      addToast("Password must be at least 8 characters", "error");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );
      addToast("Password reset successfully!", "success");
      navigate("/");
    } catch (err) {
      addToast(err?.response?.data?.error || "Failed to reset password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpInputs];
    newOtp[index] = value;
    setOtpInputs(newOtp);
    setOtp(newOtp.join(""));
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (pastedData.length >= 6) {
      const otpChars = pastedData.slice(0, 6).split("");
      setOtpInputs(otpChars);
      setOtp(otpChars.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtpInputs(["", "", "", "", "", ""]);
    setOtp("");
    try {
      await axios.post(
        `${BASE_URL}/send-otp`,
        { email, purpose: "reset-password" },
        { withCredentials: true }
      );
      addToast("OTP resent!", "success");
      setResendCooldown(30);
    } catch (err) {
      addToast(err?.response?.data?.error || "Failed to resend OTP", "error");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#0a0f1e" }}
    >
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", filter: "blur(70px)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(70px)" }}
      />

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 sm:p-10 rounded-2xl relative z-10"
        style={{ background: "#0f1629", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
      >
        <div className="flex items-center gap-2 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <HiCode />
          </div>
          <span className="font-bold text-xl" style={{ color: "#e0e7ff" }}>DevTinder</span>
        </div>

        <h2 className="text-2xl font-bold mb-1" style={{ color: "#f1f5f9" }}>
          {step === 1 && "Reset Password"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "New Password"}
        </h2>
        <p className="text-sm mb-8" style={{ color: "#64748b" }}>
          {step === 1 && "Enter your email to receive reset OTP"}
          {step === 2 && "Enter the 6-digit OTP sent to your email"}
          {step === 3 && "Enter your new password"}
        </p>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base w-full"
                style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#f1f5f9",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2"
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
              {loading ? "Sending..." : <>Send OTP <HiArrowRight /></>}
            </motion.button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="flex justify-center gap-1 sm:gap-2" onPaste={handlePaste}>
              {otpInputs.map((_, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otpInputs[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    color: "#f1f5f9",
                    outline: "none",
                  }}
                />
              ))}
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2"
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
              {loading ? "Verifying..." : <>Verify OTP <HiArrowRight /></>}
            </motion.button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-center text-sm"
              style={{ color: resendCooldown > 0 ? "#64748b" : "#818cf8", cursor: resendCooldown > 0 ? "not-allowed" : "pointer" }}
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-base w-full"
                style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#f1f5f9",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-base w-full"
                style={{
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#f1f5f9",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs"
              style={{ color: "#818cf8", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2"
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
              {loading ? "Resetting..." : <>Reset Password <HiArrowRight /></>}
            </motion.button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 mx-auto text-sm"
            style={{ color: "#818cf8", background: "none", border: "none", cursor: "pointer" }}
          >
            <HiArrowLeft /> Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;