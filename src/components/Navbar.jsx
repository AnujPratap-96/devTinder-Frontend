import clsx from "clsx";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import { HiCode } from "react-icons/hi";
import { useState } from "react";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClickHome = () => {
    navigate(user ? "/feed" : "/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-surface-900/80 backdrop-blur-xl">
      <div className="content-container flex items-center justify-between py-4">
        <button
          type="button"
          onClick={handleClickHome}
          className="group flex items-center gap-3 rounded-xl px-2 py-1 text-left transition duration-200 ease-snappy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-400 to-accent-purple text-xl font-semibold text-neutral-50 shadow-brand-glow transition-transform duration-200 ease-snappy group-hover:-translate-y-0.5">
            <HiCode />
          </span>
          <span className="flex flex-col">
            <span className="text-lg font-semibold text-neutral-50">
              Dev<span className="gradient-text">Tinder</span>
            </span>
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.42em] text-neutral-500">
              Match · Collaborate · Ship
            </span>
          </span>
        </button>

        <div className="hidden items-center gap-4 sm:flex">
          {user ? (
            <>
              <NotificationBell />
              <span className="text-sm font-medium text-neutral-400">
                Hey, <span className="text-neutral-100">{user.firstName}</span> 👋
              </span>
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="avatar-ring h-11 w-11 overflow-hidden transition duration-200 ease-snappy hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                aria-label="View profile"
              >
                <img
                  alt={`${user?.firstName || "User"}'s profile`}
                  src={
                    user.photoUrl?.[0] ||
                    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  }
                  className="h-full w-full object-cover"
                />
              </button>
            </>
          ) : (
            <button type="button" className="btn-primary" onClick={() => navigate("/login")}
            >
              Login <FiLogIn className="text-base" />
            </button>
          )}
        </div>

        <div className="flex items-center sm:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition duration-200 ease-snappy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={clsx(
                "block h-0.5 w-6 rounded-full bg-brand-200 transition-transform duration-300 ease-snappy",
                isMenuOpen && "translate-y-1.5 rotate-45"
              )}
            />
            <span
              className={clsx(
                "block h-0.5 w-6 rounded-full bg-brand-200 transition-opacity duration-300 ease-snappy",
                isMenuOpen && "opacity-0"
              )}
            />
            <span
              className={clsx(
                "block h-0.5 w-6 rounded-full bg-brand-200 transition-transform duration-300 ease-snappy",
                isMenuOpen && "-translate-y-1.5 -rotate-45"
              )}
            />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/5 bg-surface-900/95 px-4 py-4 backdrop-blur-xl sm:hidden">
          {user ? (
            <button
              type="button"
              onClick={() => {
                navigate("/profile");
                setIsMenuOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 text-left transition duration-200 ease-snappy hover:bg-white/10"
            >
              <div className="avatar-ring h-10 w-10 overflow-hidden">
                <img
                  src={
                    user.photoUrl?.[0] ||
                    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  }
                  className="h-full w-full object-cover"
                  alt="profile"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-100">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-xs text-neutral-400">View profile</span>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                navigate("/login");
                setIsMenuOpen(false);
              }}
              className="btn-primary w-full justify-center"
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
