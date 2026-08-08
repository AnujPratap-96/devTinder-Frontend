import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";
import { login, verify2faLogin } from "../api/auth";
import { ensureCrypto } from "../utils/e2ee";
import { useToast } from "../context/ToastProvider";
import { HiEye, HiEyeOff, HiArrowRight, HiMail, HiShieldCheck } from "react-icons/hi";
import AuthShell from "./ui/AuthShell";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";

const Login = () => {
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pending2fa, setPending2fa] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const emailRef = useRef();
  const passwordRef = useRef();

  const finishLogin = (user) => {
    dispatch(addUser(user));
    addToast("Login successful!", "success");
    ensureCrypto({ userId: user._id }).catch(() => {});
    navigate("/feed");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login({
        emailId: emailRef.current.value,
        password: passwordRef.current.value,
      });
      if (data.twoFactorRequired) {
        setPending2fa(data.tempToken);
        return;
      }
      finishLogin(data.user);
    } catch (err) {
      addToast(err?.response?.data?.ERROR || "Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handle2faVerify = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp.trim())) {
      addToast("Enter the 6-digit code from your authenticator app", "error");
      return;
    }
    setOtpLoading(true);
    try {
      const data = await verify2faLogin(pending2fa, otp.trim());
      finishLogin(data.user);
    } catch (err) {
      addToast(err?.response?.data?.ERROR || "Invalid code", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const visual = (
    <div className="text-center">
      <div className="mb-6 text-6xl">👩‍💻</div>
      <h3 className="mb-3 text-2xl font-bold text-neutral-50">Dev Meets Dev</h3>
      <p className="text-sm leading-relaxed text-neutral-400">
        Connect with talented developers, find collaborators, and build amazing things together.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {["React", "Node.js", "Python", "Go", "Rust"].map((s) => (
          <span
            key={s}
            className="rounded-pill border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );

  if (pending2fa) {
    return (
      <AuthShell
        title="Two-factor authentication"
        subtitle="Enter the code from your authenticator app"
        visual={visual}
        visualSide="right"
      >
        <form onSubmit={handle2faVerify} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="otp"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-neutral-400"
            >
              Authenticator code
            </label>
            <div className="relative">
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit code"
                className="input-base pr-11 text-center text-lg tracking-[0.4em]"
              />
              <HiShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-neutral-500" />
            </div>
          </div>

          <AuthButton loading={otpLoading}>
            {otpLoading ? "Verifying..." : <>Verify & Sign In <HiArrowRight className="text-base" /></>}
          </AuthButton>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Wrong account?{" "}
          <button
            type="button"
            onClick={() => setPending2fa(null)}
            className="font-semibold text-brand-600 transition hover:text-brand-600"
          >
            Back to login
          </button>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your developer account"
      visual={visual}
      visualSide="right"
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <AuthInput
          ref={emailRef}
          id="email"
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          icon={HiMail}
        />

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-neutral-400"
          >
            Password
          </label>
          <div className="relative">
            <input
              ref={passwordRef}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
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
          <div className="mt-1 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs text-brand-600 transition hover:text-brand-600"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <AuthButton loading={loading}>
          {loading ? "Signing in..." : <>Sign In <HiArrowRight className="text-base" /></>}
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="font-semibold text-brand-600 transition hover:text-brand-600"
        >
          Create one free
        </button>
      </p>
    </AuthShell>
  );
};

export default Login;
