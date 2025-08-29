import { useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Signup = () => {
  const emailRef = useRef();
 
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        BASE_URL + "/register",
        {
          emailId: emailRef.current.value,
        },
        { withCredentials: true }
      );
      toast.success("OTP sent successfully!");
      localStorage.setItem("signup_token", res.data.token);
      navigate("/verify-otp");
   
      console.log(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center px-6">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl bg-gray-800 p-8 rounded-xl shadow-xl">
        
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-gray-400 mb-4">Sign up with your email to continue</p>

          <input
            type="email"
            placeholder="Enter your email"
            ref={emailRef}
            className="p-2 w-full rounded bg-gray-700 mt-3"
          />

         
          <button
            onClick={handleSendOtp}
            className="w-full bg-blue-600 mt-4 p-2 rounded text-white font-semibold"
          >
            Send OTP
          </button>
                    {/* Redirect to signup */}
          <p className="mt-4 text-center text-gray-400">
            Already registered?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-400 cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="https://i.pinimg.com/originals/a4/07/22/a4072206392b57e4b3ede6588e81d7f3.gif"
            alt="Signup Illustration"
            className="w-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
