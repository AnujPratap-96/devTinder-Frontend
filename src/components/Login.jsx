import { useRef, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import { useToast } from "../context/ToastProvider";
import { HiCode, HiEye, HiEyeOff, HiArrowRight } from "react-icons/hi";
import { motion } from "framer-motion";

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
      navigate("/feed");
    } catch (err) {
      addToast(err?.response?.data?.ERROR || "Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#0a0f1e" }}
    >
      {/* Ambient blobs */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", filter: "blur(70px)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(70px)" }}
      />

      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden relative z-10" style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
        {/* Left — Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2 p-8 sm:p-10"
          style={{ background: "#0f1629", borderRight: "1px solid rgba(99,102,241,0.12)" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <HiCode />
            </div>
            <span className="font-bold text-xl" style={{ color: "#e0e7ff" }}>DevTinder</span>
          </div>

          <h2 className="text-3xl font-bold mb-1" style={{ color: "#f1f5f9" }}>Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: "#64748b" }}>Sign in to your developer account</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                ref={emailRef}
                className="input-base"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#f1f5f9",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  ref={passwordRef}
                  style={{
                    width: "100%",
                    padding: "12px 44px 12px 16px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    color: "#f1f5f9",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center" }}
                >
                  {showPassword ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <span
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs cursor-pointer"
                  style={{ color: "#818cf8" }}
                >
                  Forgot password?
                </span>
              </div>
            </div>

            {/* Submit */}
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
                transition: "all 0.25s ease",
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} /> Signing in...
                </>
              ) : (
                <>
                  Sign In <HiArrowRight />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "#64748b" }}>
            Don&apos;t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="font-semibold cursor-pointer"
              style={{ color: "#818cf8" }}
              onMouseEnter={(e) => e.target.style.color = "#a5b4fc"}
              onMouseLeave={(e) => e.target.style.color = "#818cf8"}
            >
              Create one free
            </span>
          </p>
        </motion.div>

        {/* Right — Visual */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0f1629, #1a1040)" }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(circle at 30% 40%, rgba(99,102,241,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(139,92,246,0.25) 0%, transparent 50%)",
            }}
          />
          <div className="relative z-10 text-center">
            <div className="text-6xl mb-6">👩‍💻</div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: "#e0e7ff" }}>Dev Meets Dev</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
              Connect with talented developers, find collaborators, and build amazing things together.
            </p>
            <div className="mt-8 flex gap-3 justify-center flex-wrap">
              {["React", "Node.js", "Python", "Go", "Rust"].map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
