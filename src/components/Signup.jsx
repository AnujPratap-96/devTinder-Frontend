import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import { useToast } from "../context/ToastProvider";
import { HiCode, HiArrowRight, HiEye, HiEyeOff } from "react-icons/hi";
import { motion } from "framer-motion";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const ageRef = useRef();
  const genderRef = useRef();
  const passwordRef = useRef();

  useEffect(() => {
    const signup_token = localStorage.getItem("signup_token");
    if (!signup_token) {
      navigate("/register");
    }
  }, [navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        BASE_URL + "/complete-signup",
        {
          password: passwordRef.current.value,
          firstName: firstNameRef.current.value,
          lastName: lastNameRef.current.value,
          age: ageRef.current.value,
          gender: genderRef.current.value,
        },
        { withCredentials: true }
      );
      if (res.status === 200) {
        addToast("Signup successful!", "success");
        localStorage.removeItem("signup_token");
        navigate("/login");
      }
    } catch (err) {
      addToast(err?.response?.data?.message || "Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "0.9rem",
    outline: "none",
    transition: "all 0.2s ease",
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "#6366f1";
    e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: "#0a0f1e" }}
    >
      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", filter: "blur(70px)" }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(70px)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg p-8 sm:p-10 rounded-2xl relative z-10"
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
                    background: i < 2 ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                  }}
                >
                  {i < 2 ? "✓" : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block" style={{ color: i === 2 ? "#a5b4fc" : "#475569" }}>{step}</span>
              </div>
              {i < 2 && <div className="h-px w-6" style={{ background: i < 1 ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)" }} />}
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-1" style={{ color: "#f1f5f9" }}>Complete your profile</h2>
        <p className="text-sm mb-8" style={{ color: "#64748b" }}>Tell us a bit about yourself</p>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>First Name</label>
              <input type="text" placeholder="John" ref={firstNameRef} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>Last Name</label>
              <input type="text" placeholder="Doe" ref={lastNameRef} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>

          {/* Age & Gender row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>Age</label>
              <input type="number" placeholder="25" ref={ageRef} style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>Gender</label>
              <select
                ref={genderRef}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="" style={{ background: "#0f1629" }}>Select</option>
                <option value="male" style={{ background: "#0f1629" }}>Male</option>
                <option value="female" style={{ background: "#0f1629" }}>Female</option>
                <option value="other" style={{ background: "#0f1629" }}>Other</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                ref={passwordRef}
                style={{ ...inputStyle, paddingRight: "44px" }}
                onFocus={handleFocus}
                onBlur={handleBlur}
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
            }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} /> Creating account...</>
            ) : (
              <>Create Account <HiArrowRight /></>
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "#64748b" }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="font-semibold cursor-pointer"
            style={{ color: "#818cf8" }}
          >
            Sign in
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
