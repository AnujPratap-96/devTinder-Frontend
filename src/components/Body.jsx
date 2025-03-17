import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GiHamburgerMenu } from "react-icons/gi";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { addUser } from "../store/userSlice";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Body = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  

  const findUser = async () => {
    if (user) return;
    try {
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });
      if (res.data) {
        dispatch(addUser(res.data.user));
        navigate("/feed");
      }
    } catch (err) {
      if (err.status === 401) {
        navigate("/");
      }
      console.log(err);
    }
  };

  useEffect(() => {
    findUser();
  }, []);

  // Function to close sidebar when clicking outside
  const closeSidebar = (e) => {
    if (e.target.id === "sidebar-overlay") {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-900">
      {/* Navbar at the top */}
      <Navbar />

      {/* Sidebar Toggle Button for Small Screens */}
      {!isSidebarOpen && (
        <div className="lg:hidden p-4">
          <button
            className="text-white bg-gray-800 p-2 rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <GiHamburgerMenu size={24} />
          </button>
        </div>
      )}

      {/* Sidebar Overlay for Small Screens */}
      {isSidebarOpen && (
        <div
          id="sidebar-overlay"
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 relative min-h-screen">
        {/* Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <div className="flex-1 p-5 flex justify-center lg:ml-64">
          <div className="w-full max-w-6xl">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default Body;
