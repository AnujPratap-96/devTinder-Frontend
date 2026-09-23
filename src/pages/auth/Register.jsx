import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { register } from "../../api/auth";
import { addUser } from "../../store/slices/userSlice";
import { ensureCrypto } from "../../utils/e2ee";
import { useToast } from "../../context/ToastProvider";
import { HiArrowRight, HiMail } from "react-icons/hi";
import AuthShell from "../../components/ui/AuthShell";
import AuthInput from "../../components/ui/AuthInput";
import AuthButton from "../../components/ui/AuthButton";
import GoogleAuthButton from "../../components/ui/GoogleAuthButton";
import GitHubAuthButton from "../../components/ui/GitHubAuthButton";

const Register = () => {
  const emailRef = useRef();
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const finishGoogleLogin = (user) => {
    dispatch(addUser(user));
    addToast("Google sign up successful!", "success");
    ensureCrypto({ userId: user._id }).catch(() => {});
    navigate("/feed");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(emailRef.current.value);
      addToast("OTP sent successfully!", "success");
      localStorage.setItem("signup_token", data.token);
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

      <div className="relative my-5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-hairline" />
        </div>
        <span className="relative bg-surface-900 px-3 text-xs uppercase tracking-wider text-neutral-500">
          Or continue with
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <GoogleAuthButton onSuccess={finishGoogleLogin} text="Sign up with Google" />
        <GitHubAuthButton text="Sign up with GitHub" />
      </div>

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
