import { useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastProvider";
import { HiCode, HiArrowRight, HiMail } from "react-icons/hi";
import { motion } from "framer-motion";

const Signup = () => {
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
      localStorage.setItem("signup_token", res.data.token);
      navigate("/verify-otp");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to send OTP", "error");
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
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", filter: "blur(70px)" }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)", filter: "blur(70px)" }} />

      <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden relative z-10" style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
        {/* Left — Visual */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0f2029, #0f1629)" }}
        >
          <div className="absolute inset-0 opacity-40"
            style={{ backgroundImage: "radial-gradient(circle at 30% 40%, rgba(34,211,238,0.25) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(99,102,241,0.2) 0%, transparent 50%)" }}
          />
          <div className="relative z-10 text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: "#e0e7ff" }}>Join the Dev Community</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
              Start your journey with a quick email verification. Takes less than 2 minutes.
            </p>
            <div className="mt-8 space-y-3 text-left">
              {["✅ Free forever plan", "✅ Match with 10K+ developers", "✅ Real-time chat"].map((item) => (
                <p key={item} className="text-xs" style={{ color: "#94a3b8" }}>{item}</p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right — Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2 p-8 sm:p-10"
          style={{ background: "#0f1629" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <HiCode />
            </div>
            <span className="font-bold text-xl" style={{ color: "#e0e7ff" }}>DevTinder</span>
          </div>

          <h2 className="text-3xl font-bold mb-1" style={{ color: "#f1f5f9" }}>Create account</h2>
          <p className="text-sm mb-8" style={{ color: "#64748b" }}>Enter your email to get started</p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {["Email", "OTP Verify", "Profile"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: i === 0 ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.06)",
                      color: i === 0 ? "white" : "#64748b",
                    }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:block" style={{ color: i === 0 ? "#a5b4fc" : "#475569" }}>{step}</span>
                </div>
                {i < 2 && <div className="flex-1 h-px w-6" style={{ background: "rgba(255,255,255,0.06)" }} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Email Address
              </label>
              <div className="relative">
                <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: "#475569" }} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  ref={emailRef}
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 42px",
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
              <p className="text-xs mt-2" style={{ color: "#475569" }}>We'll send a 6-digit OTP to verify your email</p>
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
              {loading ? (
                <>
                  <div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} /> Sending OTP...
                </>
              ) : (
                <>
                  Send OTP <HiArrowRight />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "#64748b" }}>
            Already registered?{" "}
            <span
              onClick={() => navigate("/login")}
              className="font-semibold cursor-pointer"
              style={{ color: "#818cf8" }}
              onMouseEnter={(e) => e.target.style.color = "#a5b4fc"}
              onMouseLeave={(e) => e.target.style.color = "#818cf8"}
            >
              Sign in
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
