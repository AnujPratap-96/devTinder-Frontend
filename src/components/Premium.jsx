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
      if (res.data.data.isPremium) {
        dispatch(addUser(res.data.data.user));
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
          <h1 className="mb-1 text-2xl font-bold text-neutral-50">Premium</h1>
          <p className="text-sm text-neutral-400">Your active membership</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass relative max-w-md rounded-card border-warning-400/30 p-8 text-center"
        >
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-warning-400/30 bg-warning-400/15 text-4xl">
            <FaCrown className="text-warning-400" />
          </div>
          <div className="premium-badge mx-auto mb-3">
            <HiSparkles /> Active Member
          </div>
          <h2 className="mt-2 text-2xl font-bold text-warning-400">
            {membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} Membership
          </h2>
          <p className="mt-1 text-sm text-neutral-400">You&apos;re enjoying premium benefits!</p>

          <div className="mt-6 space-y-3 text-left">
            {[
              { icon: <FaComments className="text-success-400" />, text: "Unlimited Chat with Connections" },
              { icon: <FaCheckCircle className="text-info-400" />, text: "Verified Blue Badge on Profile" },
              { icon: <FaUserPlus className="text-accent-purple" />, text: "Unlimited Connection Requests" },
              { icon: <FaClock className="text-warning-400" />, text: "Extended Membership Access" },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-tint p-3">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium text-brand-600">{text}</span>
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
      icon: <FaCrown className="text-4xl text-neutral-400" />,
      priceClass: "text-neutral-300",
      cardClass: "glass border-hairline",
      btnClass: "border border-hairline bg-tint text-neutral-200 hover:bg-tint-strong",
      features: [
        { icon: <FaComments className="text-neutral-400" />, text: "Chat with connections" },
        { icon: <FaCheckCircle className="text-info-400" />, text: "Verified Blue Badge" },
        { icon: <FaClock className="text-neutral-400" />, text: "3 months access" },
        { icon: <FaUserPlus className="text-neutral-400" />, text: "100 requests/day" },
      ],
    },
    {
      type: "gold",
      label: "Gold",
      price: "₹50",
      period: "/month",
      popular: true,
      icon: <FaCrown className="text-4xl text-warning-400" />,
      priceClass: "text-warning-400",
      cardClass: "glass-elevated border-warning-400/40",
      btnClass:
        "bg-gradient-to-r from-warning-400 to-warning-600 text-white hover:shadow-brand-glow",
      features: [
        { icon: <FaComments className="text-warning-400" />, text: "Unlimited chat" },
        { icon: <FaCheckCircle className="text-info-400" />, text: "Verified Blue Badge" },
        { icon: <FaClock className="text-warning-400" />, text: "6 months access" },
        { icon: <FaUserPlus className="text-warning-400" />, text: "500 requests/day" },
      ],
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-neutral-50">Upgrade to Premium</h1>
        <p className="text-sm text-neutral-400">Unlock the full DevTinder experience</p>
      </div>

      <div className="flex max-w-2xl flex-col gap-5 sm:flex-row">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className={`relative flex-1 rounded-card p-6 ${plan.cardClass}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-warning-400 to-warning-600 px-3 py-1 text-xs font-bold tracking-[0.05em] text-white">
                MOST POPULAR
              </div>
            )}

            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-hairline bg-tint">
                {plan.icon}
              </div>
              <h2 className="text-xl font-bold text-neutral-50">{plan.label} Plan</h2>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-neutral-50">{plan.price}</span>
                <span className={`text-sm ${plan.priceClass}`}>{plan.period}</span>
              </div>
            </div>

            <div className="mb-6 space-y-2.5">
              {plan.features.map(({ icon, text }, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <span className="flex-shrink-0 text-base">{icon}</span>
                  <span className="text-sm text-neutral-400">{text}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleBuyClick(plan.type)}
              className={`w-full rounded-xl py-3 text-sm font-bold ${plan.btnClass}`}
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
