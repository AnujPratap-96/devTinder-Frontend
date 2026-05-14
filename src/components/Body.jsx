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
    <div className="flex min-h-screen flex-col bg-neutral-950 overflow-x-hidden">
      <Navbar />

      <div className="flex flex-1 lg:pl-72">
        <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 flex flex-col">
          <div className="content-container w-full max-w-full py-10">
            <Outlet />
          </div>
        </main>

        {!isSidebarOpen && (
          <div className="fixed bottom-6 right-6 z-30 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-400 to-accent-purple text-neutral-50 shadow-brand-glow-strong transition-transform duration-200 ease-snappy hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              aria-label="Open navigation"
            >
              <HiMenuAlt3 className="text-xl" />
            </button>
          </div>
        )}
      </div>

      <Footer />

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
