import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HiMenuAlt3 } from "react-icons/hi";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { addUser, removeUser } from "../store/userSlice";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useToast } from "../context/ToastProvider";
import { createSocketConnection } from "../utils/constant";

const Body = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const { addToast } = useToast();
  const unauthorizedShownRef = useRef(false);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  // Keep a single app-wide socket connection alive while the user is signed
  // in, so notifications and messages are delivered in real-time. The socket
  // is only torn down on logout (Sidebar calls closeSocketConnection).
  useEffect(() => {
    if (user?._id) {
      createSocketConnection(user._id);
    }
  }, [user?._id]);

  useEffect(() => {
    const resolveUser = async () => {
      if (user) return;
      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });
        if (res.data) {
          dispatch(addUser(res.data.data.user));
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          dispatch(removeUser());
          if (!unauthorizedShownRef.current) {
            addToast("Log in to continue", "info");
            unauthorizedShownRef.current = true;
          }
          if (location.pathname !== "/") {
            navigate("/");
          }
        } else {
          addToast(err?.response?.data?.message || "Something went wrong!", "error");
        }
      }
    };

    resolveUser();
  }, [user, dispatch, navigate, addToast, location.pathname]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden pt-20 lg:pl-80">
        <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="content-container w-full max-w-full px-4 py-10 sm:px-6 lg:px-8">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>

      {!isSidebarOpen && (
        <div className="fixed bottom-6 right-6 z-30 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-400 to-accent-purple text-on-accent shadow-brand-glow-strong transition-transform duration-200 ease-snappy hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            aria-label="Open navigation"
          >
            <HiMenuAlt3 className="text-xl" />
          </button>
        </div>
      )}

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-neutral-950/70 backdrop-blur-md lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Body;
