import { useRef, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import { ensureCrypto } from "../utils/e2ee";
import { useToast } from "../context/ToastProvider";
import { HiEye, HiEyeOff, HiArrowRight, HiMail } from "react-icons/hi";
import AuthShell from "./ui/AuthShell";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";

const Login = () => {
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const emailRef = useRef();
  const passwordRef = useRef();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        {
          emailId: emailRef.current.value,
          password: passwordRef.current.value,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.data.user));
      addToast("Login successful!", "success");
      // Provision/restore end-to-end encryption keys (device-bound).
      ensureCrypto({ userId: res.data.data.user._id }).catch(() => {});
      navigate("/feed");
    } catch (err) {
      addToast(err?.response?.data?.ERROR || "Something went wrong!", "error");
    } finally {
      setLoading(false);
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
