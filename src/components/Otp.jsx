import { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import { useToast } from "../context/ToastProvider";
import { HiArrowRight } from "react-icons/hi";
import AuthShell from "./ui/AuthShell";
import AuthButton from "./ui/AuthButton";

const OtpVerify = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const otpRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const decodeSignupEmail = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.emailId || "";
    } catch {
      return "";
    }
  };
  const signupToken = localStorage.getItem("signup_token") || "";
  const signupEmail =
    decodeSignupEmail(signupToken) || localStorage.getItem("signup_email") || "";

  useEffect(() => {
    const signup_token = localStorage.getItem("signup_token");
    if (!signup_token) {
      navigate("/register");
    }
  }, [navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => setResendCooldown((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || !signupEmail) return;
    try {
      await axios.post(
        BASE_URL + "/send-otp",
        { email: signupEmail, purpose: "signup" },
        { withCredentials: true }
      );
      addToast("OTP resent to your email!", "success");
      setResendCooldown(30);
    } catch (err) {
      addToast(
        err?.response?.data?.error || err?.response?.data?.message || "Failed to resend OTP",
        "error"
      );
    }
  };

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
        { email: signupEmail, otp, purpose: "signup" },
        { withCredentials: true }
      );
      if (res.status === 200) {
        addToast("OTP verified successfully! ✅", "success");
        localStorage.removeItem("signup_email");
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
    <AuthShell
      steps={["Email", "OTP Verify", "Profile"]}
      currentStep={1}
      title="Verify your email"
      subtitle="Enter the 6-digit code sent to your email address"
    >
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-400/20 bg-brand-500/10 text-3xl">
          📧
        </div>
      </div>

      <div
        className="mb-6 flex gap-1.5 overflow-x-auto justify-center sm:gap-3"
        onPaste={handlePaste}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (otpRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="h-12 w-10 rounded-xl border border-hairline bg-tint text-center text-lg font-bold text-neutral-50 outline-none transition focus:border-brand-400 focus:bg-brand-500/10 focus:ring-2 focus:ring-brand-400/30 sm:h-14 sm:w-12"
          />
        ))}
      </div>

      <AuthButton type="button" onClick={handleVerifyOtp} loading={loading}>
        {loading ? "Verifying..." : <>Verify OTP <HiArrowRight /></>}
      </AuthButton>

      <p className="mt-4 text-center text-sm text-neutral-500">
        Didn&apos;t get the code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="font-semibold text-brand-500 transition hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
        </button>
      </p>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Not registered?{" "}
        <span
          onClick={() => navigate("/register")}
          className="cursor-pointer font-semibold text-brand-500 hover:text-brand-600"
        >
          Register here
        </span>
      </p>
    </AuthShell>
  );
};

export default OtpVerify;
