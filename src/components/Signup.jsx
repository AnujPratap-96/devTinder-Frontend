import { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import { useEffect } from "react";
import { toast } from "react-hot-toast";


const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  

  const navigate = useNavigate();

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const ageRef = useRef();
  const genderRef = useRef();
  const passwordRef = useRef();

  useEffect(()=> {
    const signup_token = localStorage.getItem("signup_token");
    if (!signup_token) {
      navigate("/register");
    }
  }, [navigate])

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
    const res =  await axios.post(
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
      if(res.status === 200){
        toast.success("Signup successful!");
        localStorage.removeItem("signup_token");

        navigate("/login");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong!");
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center px-6">
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl bg-gray-800 p-8 rounded-xl shadow-xl">
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-3xl font-bold">SignUp</h2>
          <p className="text-gray-400 mb-4">Complete your signup</p>

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
            onClick={handleSignUp}
            className="w-full bg-blue-600 mt-4 p-2 rounded text-white font-semibold"
          >
            Sign Up
          </button>

          <p className="mt-4 text-center text-gray-400">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-400 cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>

        <div className="hidden md:block md:w-1/2">
          <img
            src="https://i.pinimg.com/originals/a4/07/22/a4072206392b57e4b3ede6588e81d7f3.gif"
            alt="Background"
            className="w-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
