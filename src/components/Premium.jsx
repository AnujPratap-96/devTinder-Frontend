import axios from "axios";
import { FaCrown, FaCheckCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constant";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { useToast } from "../context/ToastProvider";
import { motion } from "framer-motion";
import { HiSparkles, HiShoppingBag } from "react-icons/hi";
import Spinner from "./ui/Spinner";

const Premium = () => {
  const { addToast } = useToast();
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyPremiumUser();
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyPremiumUser = async () => {
    try {
      const res = await axios.get(BASE_URL + "/premium/verify", { withCredentials: true });
      if (res.data.data.isPremium) {
        dispatch(addUser(res.data.data.user));
      }
    } catch {
      // non-fatal
    }
  };

  const loadPlans = async () => {
    try {
      const res = await axios.get(BASE_URL + "/plans", { withCredentials: true });
      setPlans(res.data.data.plans ?? []);
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to load plans", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = async (slug) => {
    try {
      const order = await axios.post(
        BASE_URL + "/payment/create",
        { membershipType: slug },
        { withCredentials: true }
      );
      const { payment, keyId } = order.data.data;
      const notes = payment?.notes ?? {};
      const options = {
        key: keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: "Devs Tinder Site",
        description: "Connect to other devs",
        order_id: payment.orderId,
        prefill: {
          name: `${notes.firstName ?? ""} ${notes.lastName ?? ""}`.trim(),
          email: notes.emailId,
          contact: "9876543214",
        },
        theme: { color: "#6366f1" },
        handler: () => {
          verifyPremiumUser();
          addToast("Payment successful! Your membership is active.", "success");
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      addToast(error.response?.data?.message || "Unable to start payment. Please try again.", "error");
    }
  };

  const isPremium = user?.isPremium || false;
  const memberships = plans.filter((p) => p.isActive && !p.isFree);
  const currentPlan = plans.find((p) => p.slug === (user?.membershipType || "free"));
  const popularSlug = memberships.reduce(
    (max, p) => (p.price > (max?.price ?? -1) ? p : max),
    null
  )?.slug;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isPremium && currentPlan && !currentPlan.isFree) {
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
            {currentPlan.name} Membership
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            {currentPlan.durationMonths ? `${currentPlan.durationMonths} months access` : "Active membership"}
          </p>

          <div className="mt-6 space-y-3 text-left">
            {(currentPlan.features || []).map((f, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-tint p-3">
                <span className="text-lg text-success-400">
                  <FaCheckCircle />
                </span>
                <span className="text-sm font-medium text-brand-600">{f}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-neutral-50">Upgrade to Premium</h1>
        <p className="text-sm text-neutral-400">Unlock the full DevTinder experience</p>
      </div>

      {memberships.length === 0 ? (
        <div className="glass rounded-card p-8 text-center text-sm text-neutral-400">
          No paid plans are available right now. Please check back later.
        </div>
      ) : (
        <div className="flex max-w-3xl flex-col gap-5 sm:flex-row">
          {memberships.map((plan, i) => {
            const isPopular = plan.slug === popularSlug;
            return (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`relative flex-1 rounded-card p-6 ${
                  isPopular
                    ? "glass-elevated border-warning-400/40"
                    : "glass border-hairline"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-warning-400 to-warning-600 px-3 py-1 text-xs font-bold tracking-[0.05em] text-white">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-5 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-hairline bg-tint">
                    <FaCrown className={`text-4xl ${isPopular ? "text-warning-400" : "text-neutral-400"}`} />
                  </div>
                  <h2 className="text-xl font-bold text-neutral-50">{plan.name} Plan</h2>
                  <div className="mt-2">
                    <span className="text-3xl font-extrabold text-neutral-50">₹{plan.price}</span>
                    <span className="text-sm text-neutral-400">
                      {plan.durationMonths ? `/${plan.durationMonths} mo` : ""}
                    </span>
                  </div>
                </div>

                <div className="mb-6 space-y-2.5">
                  {(plan.features || []).map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <span className="flex-shrink-0 text-base text-success-400">
                        <FaCheckCircle />
                      </span>
                      <span className="text-sm text-neutral-400">{f}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleBuyClick(plan.slug)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${
                    isPopular
                      ? "bg-gradient-to-r from-warning-400 to-warning-600 text-white hover:shadow-brand-glow"
                      : "border border-hairline bg-tint text-neutral-200 hover:bg-tint-strong"
                  }`}
                >
                  <HiShoppingBag /> Get {plan.name}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Premium;
