/* eslint-disable react/prop-types */
import { TbCardsFilled } from "react-icons/tb";
import { FaUsers, FaUserEdit, FaCrown } from "react-icons/fa";
import { MdOutlineNotifications } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineMessage } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { removeUser } from "../store/userSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useToast } from "../context/ToastProvider";

const Sidebar = ({ isSidebarOpen }) => {
  const {addToast} = useToast();
  const location = useLocation(); // Get the current route
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      addToast("Logiut Successfully" , "success")
      navigate("/");
    } catch (err) {
      addToast( err?.response?.data?.message ||"Error logging out. Please try again later.", "error")
    }
  };

  return (
    <>
      {/* Sidebar - Hidden on Small Screens & Open on Large Screens */}
      <div
        className={`absolute top-0 left-0 h-full w-64 bg-gray-800 text-white p-5 shadow-lg transform transition-transform duration-300 ease-in-out z-40  ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <h2 className="text-2xl font-bold text-center mb-6">Dashboard</h2>

        <ul className="space-y-4">
          <SidebarItem
            to="/feed"
            icon={<TbCardsFilled />}
            text="Explore"
            currentPath={location.pathname}
          />
          <SidebarItem
            to="/connections"
            icon={<FaUsers />}
            text="Connections"
            currentPath={location.pathname}
          />
          <SidebarItem
            to="/requests"
            icon={<MdOutlineNotifications />}
            text="Notifications"
            currentPath={location.pathname}
          />
          <SidebarItem
            to="/messages"
            icon={<AiOutlineMessage />}
            text="Messages"
            currentPath={location.pathname}
          />
          <SidebarItem
            to="/profile"
            icon={<FaUserEdit />}
            text="Profile"
            currentPath={location.pathname}
          />
          <SidebarItem
            to="/premium"
            icon={<FaCrown className="text-yellow-500 text-2xl" />}
            text="Premium"
            currentPath={location.pathname}
          />
          <button
            onClick={handleLogout}
            className={` w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-700 hover:text-yellow-300`}
          >
            <FiLogOut /> Logout{" "}
          </button>
        </ul>
      </div>
    </>
  );
};

// Sidebar Item Component for cleaner code
const SidebarItem = ({ to, icon, text, currentPath }) => {
  const isActive = currentPath === to; // Check if the link is active

  return (
    <li>
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
          isActive
            ? "bg-gray-700 text-yellow-400 font-semibold shadow-md"
            : "hover:bg-gray-700 hover:text-yellow-300"
        }`}
      >
        {icon} {text}
      </Link>
    </li>
  );
};

export default Sidebar;
