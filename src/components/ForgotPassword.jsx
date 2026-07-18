import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import { useToast } from "../context/ToastProvider";
import { HiArrowRight, HiArrowLeft, HiEye, HiEyeOff } from "react-icons/hi";
import AuthShell from "./ui/AuthShell";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";

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

  const otpBox =
    "h-12 w-10 text-center text-lg font-bold rounded-control border border-hairline bg-tint text-neutral-50 outline-none transition focus:border-brand-400 focus:bg-brand-500/10 focus:ring-2 focus:ring-brand-500/30 sm:h-14 sm:w-14 sm:text-xl";

  const PasswordField = ({ id, label, value, onChange }) => (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-neutral-400"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={value}
          onChange={onChange}
          className="input-base pr-11"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-200"
        >
          {showPassword ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
        </button>
      </div>
    </div>
  );

  return (
    <AuthShell
      title={step === 1 ? "Reset Password" : step === 2 ? "Verify OTP" : "New Password"}
      subtitle={
        step === 1
          ? "Enter your email to receive reset OTP"
          : step === 2
          ? "Enter the 6-digit OTP sent to your email"
          : "Enter your new password"
      }
      steps={["Email", "OTP", "New Password"]}
      currentStep={step - 1}
    >
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <AuthInput
            id="email"
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthButton loading={loading}>
            {loading ? "Sending..." : <>Send OTP <HiArrowRight className="text-base" /></>}
          </AuthButton>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
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
                className={otpBox}
              />
            ))}
          </div>
          <AuthButton loading={loading}>
            {loading ? "Verifying..." : <>Verify OTP <HiArrowRight className="text-base" /></>}
          </AuthButton>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-center text-sm text-brand-600 transition hover:text-brand-600 disabled:cursor-not-allowed disabled:text-neutral-500"
          >
            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <PasswordField
            id="newPassword"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="self-start text-xs text-brand-600 transition hover:text-brand-600"
          >
            {showPassword ? "Hide password" : "Show password"}
          </button>
          <AuthButton loading={loading}>
            {loading ? "Resetting..." : <>Reset Password <HiArrowRight className="text-base" /></>}
          </AuthButton>
        </form>
      )}

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mx-auto flex items-center gap-1 text-sm text-brand-600 transition hover:text-brand-600"
        >
          <HiArrowLeft /> Back to Login
        </button>
      </div>
    </AuthShell>
  );
};

export default ForgotPassword;
