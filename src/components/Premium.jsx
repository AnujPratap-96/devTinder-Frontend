/* eslint-disable react/no-unescaped-entities */
import axios from "axios";
import {
  FaCrown,
  FaComments,
  FaCheckCircle,
  FaClock,
  FaUserPlus,
} from "react-icons/fa";
import { useEffect } from "react";
import { BASE_URL } from "../utils/constant";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { toast } from "react-hot-toast";

const MembershipCards = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    verifyPremiumUser();
  }, []);

  const verifyPremiumUser = async () => {
    try {
      const res = await axios.get(BASE_URL + "/premium/verify", {
        withCredentials: true,
      });
      if (res.data.isPremium) {
        dispatch(addUser(res.data.user));
      }
    } catch (error) {
      toast.error("Error verifying premium status. Please try again later.");
    }
  };

  const handleBuyClick = async (type) => {
    try {
      const order = await axios.post(
        BASE_URL + "/payment/create",
        { membershipType: type },
        { withCredentials: true }
      );

      const { amount, keyId, currency, orderId, notes } = order.data;
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Devs Tinder Site",
        description: "Connect to other devs",
        order_id: orderId,
        prefill: {
          name: notes.firstName + " " + notes.lastName,
          email: notes.emailId,
          contact: "9876543214",
        },
        theme: {
          color: "#F37254",
        },
        handler: verifyPremiumUser,
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  // Extract user details
  const isPremium = user?.isPremium || false;
  const membershipType = user?.membershipType || "";

  if (isPremium) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="bg-green-800 border border-green-600 text-white rounded-2xl shadow-lg p-6 w-full sm:w-96 text-center">
          <FaCrown className="text-yellow-400 text-5xl mx-auto" />
          <h2 className="text-2xl font-bold mt-4">
            {membershipType.charAt(0).toUpperCase() + membershipType.slice(1)}{" "}
            Membership
          </h2>
          <p className="mt-2 text-lg">You're a premium user!</p>

          <div className="mt-4 space-y-2 text-left">
            <p className="flex items-center gap-2">
              <FaComments className="text-green-400" /> Unlimited Chat
            </p>
            <p className="flex items-center gap-2">
              <FaCheckCircle className="text-blue-500" /> Verified Badge
            </p>
            <p className="flex items-center gap-2">
              <FaUserPlus className="text-green-400" /> Unlimited Connection
            </p>
            <p className="flex items-center gap-2">
              <FaClock className="text-green-400" /> Extended Membership Access
            </p>
          </div>

          <h3 className="text-xl font-semibold mt-4">Enjoy Your Benefits!</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-6 p-6">
      {/* Silver Membership */}
      <div className="bg-gray-800 border border-gray-600 text-white rounded-2xl shadow-lg p-6 w-full sm:w-80 text-center hover:shadow-2xl hover:scale-105 transition-transform duration-300 hover:border-gray-500">
        <FaCrown className="text-gray-400 text-5xl mx-auto" />
        <h2 className="text-2xl font-bold mt-4">Silver Membership</h2>

        <div className="mt-4 space-y-2 text-left">
          <p className="flex items-center gap-2">
            <FaComments className="text-gray-400" /> Chat with people
          </p>
          <p className="flex items-center gap-2">
            <FaCheckCircle className="text-blue-500" /> Blue Tick
          </p>
          <p className="flex items-center gap-2">
            <FaClock className="text-gray-400" /> 3 Months
          </p>
          <p className="flex items-center gap-2">
            <FaUserPlus className="text-gray-400" /> 100 Connection Requests/day
          </p>
        </div>

        <h3 className="text-xl font-semibold mt-4">₹33/month</h3>
        <button
          className="mt-4 px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
          onClick={() => handleBuyClick("silver")}
        >
          Get Silver
        </button>
      </div>

      {/* Gold Membership */}
      <div className="bg-yellow-900 border border-yellow-700 text-white rounded-2xl shadow-lg p-6 w-full sm:w-80 text-center hover:shadow-2xl hover:scale-105 transition-transform duration-300 hover:border-yellow-500">
        <FaCrown className="text-yellow-500 text-5xl mx-auto" />
        <h2 className="text-2xl font-bold mt-4">Gold Membership</h2>

        <div className="mt-4 space-y-2 text-left">
          <p className="flex items-center gap-2">
            <FaComments className="text-yellow-400" /> Chat with people
          </p>
          <p className="flex items-center gap-2">
            <FaCheckCircle className="text-blue-500" /> Blue Tick
          </p>
          <p className="flex items-center gap-2">
            <FaClock className="text-yellow-400" /> 6 Months
          </p>
          <p className="flex items-center gap-2">
            <FaUserPlus className="text-yellow-400" /> 500 Connection
            Requests/day
          </p>
        </div>

        <h3 className="text-xl font-semibold mt-4">₹50/month</h3>
        <button
          className="mt-4 px-5 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition"
          onClick={() => handleBuyClick("gold")}
        >
          Get Gold
        </button>
      </div>
    </div>
  );
};

export default MembershipCards;
