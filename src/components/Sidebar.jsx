/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import clsx from "clsx";
import { TbCardsFilled } from "react-icons/tb";
import { FaUsers, FaUserEdit, FaCrown } from "react-icons/fa";
import { MdOutlineNotifications } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineMessage } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { HiX } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "../store/userSlice";
import axios from "axios";
import { BASE_URL, closeSocketConnection } from "../utils/constant";
import { useToast } from "../context/ToastProvider";
import { HiBookmark, HiCollection, HiShieldCheck, HiMail } from "react-icons/hi";

const Sidebar = ({ isSidebarOpen, setSidebarOpen }) => {
  const { addToast } = useToast();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const currentUserId = user?._id;
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const fetchRequestCount = async () => {
      if (!currentUserId) return;
      try {
        const { data: notifData } = await axios.get(`${BASE_URL}/notifications`, {
          withCredentials: true,
        });
        const connectionRequests = notifData.data.notifications?.filter(
          (n) => n.type === "connection.request" && !n.isRead
        )?.length || 0;

        const { data: projectData } = await axios.get(`${BASE_URL}/projects`, {
          withCredentials: true,
        });
        let projectRequests = 0;
        const userIdStr = String(currentUserId);
        projectData.data.projects?.forEach((project) => {
          const ownerIdStr = String(project.ownerId?._id || project.ownerId || "");
          if (ownerIdStr === userIdStr) {
            projectRequests += project.joinRequests?.filter((r) => r.status === "pending").length || 0;
          }
        });

        setRequestCount(connectionRequests + projectRequests);
      } catch (error) {
        console.error("Failed to load request count", error);
      }
    };
    fetchRequestCount();
  }, [currentUserId]);

  const navItems = [
    { to: "/feed", icon: TbCardsFilled, text: "Explore" },
    { to: "/connections", icon: FaUsers, text: "Connections" },
    { to: "/requests", icon: MdOutlineNotifications, text: "Requests", badge: requestCount },
    { to: "/messages", icon: AiOutlineMessage, text: "Messages" },
    { to: "/projects", icon: HiCollection, text: "Projects" },
    { to: "/bookmarks", icon: HiBookmark, text: "Bookmarks" },
    { to: "/invite-friends", icon: HiMail, text: "Invite Friends" },
    { to: "/profile", icon: FaUserEdit, text: "Profile" },
    { to: "/premium", icon: FaCrown, text: "Premium", iconClassName: "text-warning-400 group-hover:text-warning-100" },
  ];

  if (user?.isAdmin) {
    navItems.push({ to: "/admin", icon: HiShieldCheck, text: "Admin" });
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      closeSocketConnection();
      dispatch(removeUser());
      addToast("Logged out successfully", "success");
      navigate("/");
    } catch (err) {
      addToast(err?.response?.data?.message || "Error logging out. Please try again later.", "error");
    }
  };

  return (
    <aside
      className={clsx(
        "glass fixed bottom-3 left-3 top-24 z-40 flex w-72 flex-col rounded-3xl border-hairline transition-transform duration-300 ease-snappy lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
      )}
    >
        <div className="flex items-center justify-between px-5 pt-6 pb-2 lg:px-6 lg:pt-8">
        <p className="text-[0.65rem]  font-semibold uppercase tracking-[0.42em] text-neutral-500">
          Navigation
        </p>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline bg-tint text-neutral-200 transition duration-200 ease-snappy hover:bg-tint-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas lg:hidden"
          aria-label="Close navigation"
        >
          <HiX className="text-lg" />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto scrollbar-thin px-4 pb-6 pt-4 lg:px-6">
        {navItems.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            Icon={item.icon}
            text={item.text}
            iconClassName={item.iconClassName}
            badge={item.badge}
            currentPath={location.pathname}
            setSidebarOpen={setSidebarOpen}
          />
        ))}
      </nav>

      <div className="border-t border-hairline-soft px-4 pb-6 pt-5 lg:px-6">
        <button
          type="button"
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-2xl border border-danger-400/30 bg-danger-500/10 px-4 py-3 text-sm font-semibold text-danger-400 transition duration-200 ease-snappy hover:-translate-y-0.5 hover:border-danger-400 hover:bg-danger-500/20 hover:text-danger-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          <FiLogOut className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const SidebarItem = ({ to, Icon, text, currentPath, setSidebarOpen, iconClassName, badge }) => {
  const isActive = currentPath === to;

  return (
    <Link
      to={to}
      onClick={() => setSidebarOpen && setSidebarOpen(false)}
      className={clsx(
        "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-body-sm font-medium transition duration-200 ease-snappy lg:px-5",
        isActive
          ? "nav-item-active shadow-brand-glow"
          : "text-neutral-400 hover:bg-tint hover:text-neutral-100"
      )}
    >
      <span
        className={clsx(
          "flex h-9 w-9 items-center justify-center rounded-xl border border-hairline-soft bg-tint transition duration-200 ease-snappy",
          isActive
            ? "border-brand-400/40 bg-brand-500/15 text-brand-500"
            : iconClassName ?? "text-neutral-300 group-hover:text-neutral-100"
        )}
      >
        <Icon className="text-lg" />
      </span>
      <span className="truncate">{text}</span>
      {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-brand-400" />}
      {badge > 0 && (
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-error-400 px-1.5 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
};

export default Sidebar;
