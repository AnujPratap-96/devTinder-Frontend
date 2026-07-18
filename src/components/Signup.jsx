import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import { useToast } from "../context/ToastProvider";
import { HiArrowRight, HiEye, HiEyeOff } from "react-icons/hi";
import AuthShell from "./ui/AuthShell";
import AuthInput from "./ui/AuthInput";
import AuthButton from "./ui/AuthButton";

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
          age: Number(ageRef.current.value),
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

  return (
    <AuthShell
      title="Complete your profile"
      subtitle="Tell us a bit about yourself"
      steps={["Email", "OTP Verify", "Profile"]}
      currentStep={2}
    >
      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <AuthInput ref={firstNameRef} id="firstName" label="First Name" placeholder="John" />
          <AuthInput ref={lastNameRef} id="lastName" label="Last Name" placeholder="Doe" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <AuthInput ref={ageRef} id="age" type="number" label="Age" placeholder="25" />
          <div>
            <label
              htmlFor="gender"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-neutral-400"
            >
              Gender
            </label>
            <select ref={genderRef} id="gender" className="input-base" defaultValue="">
              <option value="" className="bg-surface-900">Select</option>
              <option value="male" className="bg-surface-900">Male</option>
              <option value="female" className="bg-surface-900">Female</option>
              <option value="other" className="bg-surface-900">Other</option>
            </select>
          </div>
        </div>

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
              placeholder="Create a strong password"
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

        <AuthButton loading={loading}>
          {loading ? "Creating account..." : <>Create Account <HiArrowRight className="text-base" /></>}
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Already have an account?{" "}
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

export default Signup;
