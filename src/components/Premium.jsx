/* eslint-disable react/no-unescaped-entities */
import axios from "axios";
import { FaCrown, FaComments, FaCheckCircle, FaClock, FaUserPlus } from "react-icons/fa";
import { useEffect } from "react";
import { BASE_URL } from "../utils/constant";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { useToast } from "../context/ToastProvider";
import { motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi";

const MembershipCards = () => {
  const { addToast } = useToast();
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useEffect(() => {
    verifyPremiumUser();
  }, []);

  const verifyPremiumUser = async () => {
    try {
      const res = await axios.get(BASE_URL + "/premium/verify", { withCredentials: true });
      if (res.data.isPremium) {
        dispatch(addUser(res.data.user));
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Error verifying premium status.", "error");
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
        amount,
        currency,
        name: "Devs Tinder Site",
        description: "Connect to other devs",
        order_id: orderId,
        prefill: {
          name: notes.firstName + " " + notes.lastName,
          email: notes.emailId,
          contact: "9876543214",
        },
        theme: { color: "#6366f1" },
        handler: verifyPremiumUser,
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  const isPremium = user?.isPremium || false;
  const membershipType = user?.membershipType || "";

  if (isPremium) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#e0e7ff" }}>Premium</h1>
          <p className="text-sm" style={{ color: "#475569" }}>Your active membership</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md p-8 rounded-2xl text-center"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,179,8,0.05))",
            border: "1px solid rgba(245,158,11,0.25)",
            boxShadow: "0 8px 30px rgba(245,158,11,0.1)",
          }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-5"
            style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}
          >
            <FaCrown style={{ color: "#fbbf24" }} />
          </div>
          <div className="premium-badge mx-auto mb-3">
            <HiSparkles /> Active Member
          </div>
          <h2 className="text-2xl font-bold mt-2" style={{ color: "#fbbf24" }}>
            {membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} Membership
          </h2>
          <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>You're enjoying premium benefits!</p>

          <div className="mt-6 space-y-3 text-left">
            {[
              { icon: <FaComments style={{ color: "#34d399" }} />, text: "Unlimited Chat with Connections" },
              { icon: <FaCheckCircle style={{ color: "#60a5fa" }} />, text: "Verified Blue Badge on Profile" },
              { icon: <FaUserPlus style={{ color: "#a78bfa" }} />, text: "Unlimited Connection Requests" },
              { icon: <FaClock style={{ color: "#fbbf24" }} />, text: "Extended Membership Access" },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium" style={{ color: "#c7d2fe" }}>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const plans = [
    {
      type: "silver",
      label: "Silver",
      price: "₹33",
      period: "/month",
      icon: <FaCrown className="text-4xl" style={{ color: "#94a3b8" }} />,
      tagColor: { bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)", text: "#94a3b8" },
      cardBg: "rgba(17,24,39,0.8)",
      cardBorder: "rgba(148,163,184,0.15)",
      btnBg: "rgba(148,163,184,0.15)",
      btnBorder: "rgba(148,163,184,0.3)",
      btnColor: "#94a3b8",
      features: [
        { icon: <FaComments style={{ color: "#94a3b8" }} />, text: "Chat with connections" },
        { icon: <FaCheckCircle style={{ color: "#60a5fa" }} />, text: "Verified Blue Badge" },
        { icon: <FaClock style={{ color: "#94a3b8" }} />, text: "3 months access" },
        { icon: <FaUserPlus style={{ color: "#94a3b8" }} />, text: "100 requests/day" },
      ],
    },
    {
      type: "gold",
      label: "Gold",
      price: "₹50",
      period: "/month",
      popular: true,
      icon: <FaCrown className="text-4xl" style={{ color: "#f59e0b" }} />,
      tagColor: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", text: "#fbbf24" },
      cardBg: "rgba(17,24,39,0.9)",
      cardBorder: "rgba(245,158,11,0.25)",
      btnBg: "linear-gradient(135deg, #f59e0b, #d97706)",
      btnColor: "white",
      features: [
        { icon: <FaComments style={{ color: "#fbbf24" }} />, text: "Unlimited chat" },
        { icon: <FaCheckCircle style={{ color: "#60a5fa" }} />, text: "Verified Blue Badge" },
        { icon: <FaClock style={{ color: "#fbbf24" }} />, text: "6 months access" },
        { icon: <FaUserPlus style={{ color: "#fbbf24" }} />, text: "500 requests/day" },
      ],
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#e0e7ff" }}>Upgrade to Premium</h1>
        <p className="text-sm" style={{ color: "#475569" }}>Unlock the full DevTinder experience</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 max-w-2xl">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="flex-1 p-6 rounded-2xl relative"
            style={{
              background: plan.cardBg,
              border: `1px solid ${plan.cardBorder}`,
              boxShadow: plan.popular ? "0 8px 30px rgba(245,158,11,0.1)" : "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            {plan.popular && (
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", letterSpacing: "0.05em" }}
              >
                MOST POPULAR
              </div>
            )}

            <div className="text-center mb-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: plan.tagColor.bg, border: `1px solid ${plan.tagColor.border}` }}
              >
                {plan.icon}
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#e0e7ff" }}>{plan.label} Plan</h2>
              <div className="mt-2">
                <span className="text-3xl font-extrabold" style={{ color: plan.tagColor.text }}>{plan.price}</span>
                <span className="text-sm" style={{ color: "#64748b" }}>{plan.period}</span>
              </div>
            </div>

            <div className="space-y-2.5 mb-6">
              {plan.features.map(({ icon, text }, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <span className="text-base flex-shrink-0">{icon}</span>
                  <span className="text-sm" style={{ color: "#94a3b8" }}>{text}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleBuyClick(plan.type)}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{
                background: plan.btnBg,
                border: plan.btnBorder ? `1.5px solid ${plan.btnBorder}` : "none",
                color: plan.btnColor,
                cursor: "pointer",
              }}
            >
              Get {plan.label}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MembershipCards;
