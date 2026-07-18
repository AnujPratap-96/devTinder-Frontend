import { useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastProvider";
import { HiArrowRight, HiMail } from "react-icons/hi";
import AuthShell from "./ui/AuthShell";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";

const Register = () => {
  const emailRef = useRef();
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "/register",
        { emailId: emailRef.current.value },
        { withCredentials: true }
      );
      addToast("OTP sent successfully!", "success");
      localStorage.setItem("signup_token", res.data.data.token);
      localStorage.setItem("signup_email", emailRef.current.value);
      navigate("/verify-otp");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const visual = (
    <div className="text-center">
      <div className="mb-6 text-6xl">🚀</div>
      <h3 className="mb-3 text-2xl font-bold text-neutral-50">Join the Dev Community</h3>
      <p className="text-sm leading-relaxed text-neutral-400">
        Start your journey with a quick email verification. Takes less than 2 minutes.
      </p>
      <div className="mt-8 space-y-3 text-left">
        {["✅ Free forever plan", "✅ Match with 10K+ developers", "✅ Real-time chat"].map((item) => (
          <p key={item} className="text-xs text-neutral-300">
            {item}
          </p>
        ))}
      </div>
    </div>
  );

  return (
    <AuthShell
      title="Create account"
      subtitle="Enter your email to get started"
      visual={visual}
      visualSide="left"
      steps={["Email", "OTP Verify", "Profile"]}
      currentStep={0}
    >
      <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
        <AuthInput
          ref={emailRef}
          id="email"
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          icon={HiMail}
        />
        <p className="-mt-2 text-xs text-neutral-500">
          We&apos;ll send a 6-digit OTP to verify your email
        </p>

        <AuthButton loading={loading}>
          {loading ? "Sending OTP..." : <>Send OTP <HiArrowRight className="text-base" /></>}
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Already registered?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="font-semibold text-brand-600 transition hover:text-brand-600"
        >
          Sign in
        </button>
      </p>
    </AuthShell>
  );
};

export default Register;
