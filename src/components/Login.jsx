import { useRef, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import { toast } from "react-hot-toast";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);


  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Using useRef for input fields
  const emailRef = useRef();
  const passwordRef = useRef();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        {
          emailId: emailRef.current.value,
          password: passwordRef.current.value,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.user));
      toast.success("Login successful!");
      navigate("/feed");
    } catch (err) {
      toast.error(err?.response?.data?.ERROR || "Something went wrong!");
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center px-6">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl bg-gray-800 p-8 rounded-xl shadow-xl">
        
        {/* Left side - Login form */}
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-3xl font-bold">Welcome Back!</h2>
          <p className="text-gray-400 mb-4">Sign in to your account</p>

          <input
            type="email"
            placeholder="Email"
            ref={emailRef}
            className="p-2 w-full rounded bg-gray-700 mt-3"
          />

          <div className="relative mt-3">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              ref={passwordRef}
              className="p-2 w-full rounded bg-gray-700"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-gray-400"
            >
              {showPassword ? "👁️" : "🤦‍♂️"}
            </button>
          </div>

        

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 mt-4 p-2 rounded text-white font-semibold"
          >
            Login
          </button>

          {/* Redirect to signup */}
          <p className="mt-4 text-center text-gray-400">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-400 cursor-pointer"
            >
              Sign up
            </span>
          </p>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="https://i.pinimg.com/originals/06/aa/40/06aa408f09f394c3b46d6cbe1efad944.gif"
            alt="Background"
            className="w-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
