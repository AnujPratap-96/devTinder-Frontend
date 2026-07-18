/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import Spinner from "./Spinner";

const AuthButton = ({ children, loading = false, className = "", ...props }) => (
  <motion.button
    type="submit"
    whileHover={loading ? undefined : { scale: 1.02 }}
    whileTap={loading ? undefined : { scale: 0.98 }}
    disabled={loading}
    className={`mt-2 flex w-full items-center justify-center gap-2 rounded-control bg-gradient-to-r from-[#6E7BFF] to-[#7B5DFF] px-4 py-3.5 text-sm font-semibold text-on-accent shadow-[0_8px_30px_rgba(110,123,255,0.35)] transition duration-200 ease-snappy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B95FF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60 ${
      loading ? "" : "hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_38px_rgba(110,123,255,0.5)]"
    } ${className}`}
    {...props}
  >
    {loading ? (
      <>
        <Spinner size="sm" className="text-white" />
        {children}
      </>
    ) : (
      children
    )}
  </motion.button>
);

export default AuthButton;
