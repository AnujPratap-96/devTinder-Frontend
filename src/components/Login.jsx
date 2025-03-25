import { useRef, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Using useRef to store form values
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const ageRef = useRef();
  const genderRef = useRef();
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
      navigate("/feed");
    } catch (err) {
      setErrorMessage(err?.response?.data?.ERROR || "Something went wrong!");
      console.error(err);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        BASE_URL + "/signup",
        {
          emailId: emailRef.current.value,
          password: passwordRef.current.value,
          firstName: firstNameRef.current.value,
          lastName: lastNameRef.current.value,
          age: ageRef.current.value,
          gender: genderRef.current.value,
        },
        { withCredentials: true }
      );
      navigate("/feed");
      setIsLogin(true);
    } catch (err) {
      setErrorMessage(err?.response?.data?.message || "Something went wrong!");
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center px-6">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl bg-gray-800 p-8 rounded-xl shadow-xl">
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-3xl font-bold">
            {isLogin ? "Welcome Back!" : "Register"}
          </h2>
          <p className="text-gray-400 mb-4">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </p>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First Name"
                ref={firstNameRef}
                className="p-2 rounded bg-gray-700"
              />
              <input
                type="text"
                placeholder="Last Name"
                ref={lastNameRef}
                className="p-2 rounded bg-gray-700"
              />
              <input
                type="text"
                placeholder="Age"
                ref={ageRef}
                className="p-2 rounded bg-gray-700"
              />
              <select ref={genderRef} className="p-2 rounded bg-gray-700">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            ref={emailRef}
            defaultValue=""
            className="p-2 w-full rounded bg-gray-700 mt-3"
          />
          <div className="relative mt-3">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              ref={passwordRef}
              defaultValue=""
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

          {errorMessage && (
            <div className="text-red-500 mt-2">{errorMessage}</div>
          )}

          <button
            onClick={isLogin ? handleLogin : handleSignUp}
            className="w-full bg-blue-600 mt-4 p-2 rounded text-white font-semibold"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>

          <p className="mt-4 text-center text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 cursor-pointer"
            >
              {isLogin ? "Sign up" : "Login"}
            </span>
          </p>
        </div>
        <div className="hidden md:block md:w-1/2">
          <img
            src={
              isLogin
                ? "https://i.pinimg.com/originals/06/aa/40/06aa408f09f394c3b46d6cbe1efad944.gif"
                : "https://i.pinimg.com/originals/a4/07/22/a4072206392b57e4b3ede6588e81d7f3.gif"
            }
            alt="Background"
            className="w-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
