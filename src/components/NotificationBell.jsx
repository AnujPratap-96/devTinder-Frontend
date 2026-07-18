import { useEffect, useMemo, useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { HiBell, HiCheck, HiClock, HiTrash, HiUserAdd } from "react-icons/hi";
import { BASE_URL, createSocketConnection } from "../utils/constant";
import Button from "./ui/Button";

const groupNotifications = (notifications) => {
  const bucket = notifications.reduce((acc, notification) => {
    const dateKey = new Date(notification.createdAt).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(notification);
    return acc;
  }, {});
  return Object.entries(bucket).map(([date, items]) => ({ date, items }));
};

const getNotificationMessage = (notification) => {
  const { type, payload } = notification;
  
  if (type === "project.join_request") {
    return `Wants to join "${payload?.projectTitle || "your project"}"`;
  }
  if (type === "project.request_accepted") {
    return `Your request to join "${payload?.projectTitle || "project"}" was accepted`;
  }
  if (type === "project.request_rejected") {
    return `Your request to join "${payload?.projectTitle || "project"}" was rejected`;
  }
  if (type === "match") {
    return `You matched with ${payload?.firstName || "someone"}!`;
  }
  if (type === "like") {
    return `${payload?.firstName || "Someone"} liked your profile`;
  }
  if (type === "project.member_removed") {
    return `You were removed from "${payload?.projectTitle || "a project"}"`;
  }
  if (type === "message.new") {
    return "You received a new encrypted message";
  }
  if (type === "connection.request") {
    return `You have a new connection request from ${payload?.fromUserName || "someone"}`;
  }
  if (type === "connection.response") {
    const verb =
      payload?.status === "accepted"
        ? "accepted"
        : payload?.status === "rejected"
        ? "declined"
        : payload?.status || "responded to";
    return `Your connection request was ${verb}`;
  }
  if (type === "project.message") {
    return `New message in "${payload?.projectTitle || "your project"}"`;
  }

  // Fall back to a safe generic line. Never serialize the raw payload — that
  // would leak internal fields (status, ids, etc.) to the user.
  return "You have a new notification";
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [requestCount, setRequestCount] = useState(0);
  const dropdownRef = useRef(null);
  const reduxUser = useSelector((store) => store.user);
  const currentUserId = reduxUser?._id;

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const totalCount = unreadCount + requestCount;

  const groupedNotifications = useMemo(
    () => groupNotifications(notifications),
    [notifications]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/notifications`, {
          withCredentials: true,
        });
         const ordered = (data.data.notifications ?? []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(ordered);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const socket = createSocketConnection(currentUserId);
    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev];
      });
      if (notification.type === "connection.request" && !notification.isRead) {
        setRequestCount((count) => count + 1);
      }
    };
    socket.on("notification:new", handleNewNotification);
    return () => socket.off("notification:new", handleNewNotification);
  }, [currentUserId]);

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

  const markAsRead = async () => {
    try {
      setBusy(true);
      await axios.patch(
        `${BASE_URL}/notifications/read`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    } catch (error) {
      console.error("Unable to mark notifications as read", error);
    } finally {
      setBusy(false);
    }
  };

  const deleteNotificationItem = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/notifications/${id}`, {
        withCredentials: true,
      });
      setNotifications((prev) => prev.filter((notification) => notification._id !== id));
      setRequestCount((prev) => {
        const target = notifications.find((n) => n._id === id);
        if (target?.type === "connection.request" && !target.isRead) {
          return Math.max(0, prev - 1);
        }
        return prev;
      });
    } catch (error) {
      console.error("Unable to delete notification", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete(`${BASE_URL}/notifications`, {
        withCredentials: true,
      });
      setNotifications([]);
      setRequestCount(0);
    } catch (error) {
      console.error("Unable to clear notifications", error);
    }
  };

  useEffect(() => {
    if (open && unreadCount > 0) {
      markAsRead();
    }
  }, [open, unreadCount]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-hairline bg-tint text-neutral-200 transition hover:bg-tint-strong"
        aria-label="Notifications"
      >
        <HiBell className="text-lg" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-400 px-1 text-[10px] font-semibold text-white">
            {totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-hairline bg-surface-900/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-neutral-100">Notifications</p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="xs"
                disabled={notifications.length === 0}
                onClick={clearAllNotifications}
              >
                <HiTrash className="text-sm" /> Clear
              </Button>
              <Button
                variant="ghost"
                size="xs"
                disabled={busy || unreadCount === 0}
                onClick={markAsRead}
              >
                <HiCheck className="text-sm" /> Mark read
              </Button>
            </div>
          </div>

          {requestCount > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-warning-400/40 bg-warning-500/15 px-3 py-2">
              <HiUserAdd className="text-warning-200" />
              <p className="text-xs text-warning-200">
                {requestCount} pending request{requestCount > 1 ? "s" : ""}
              </p>
            </div>
          )}

          <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-neutral-500">No notifications yet. We'll keep you posted.</p>
            ) : (
              groupedNotifications.map((group) => (
                <div key={group.date} className="space-y-2">
                  <p className="text-[11px] uppercase tracking-wide text-neutral-500">
                    {group.date}
                  </p>
                  {group.items.map((notification) => (
                    <div
                      key={notification._id}
                      className={`relative rounded-xl border px-3 py-2 pr-9 text-xs text-neutral-200 ${notification.isRead ? "border-hairline-soft bg-tint" : "border-brand-400/40 bg-brand-400/10"}`}
                    >
                      <button
                        type="button"
                        onClick={() => deleteNotificationItem(notification._id)}
                        aria-label="Delete notification"
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-danger-500/15 hover:text-danger-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-400/40"
                      >
                        <HiTrash className="text-sm" />
                      </button>
                      <p className="font-medium">
                        {notification.type.replace(".", " ")}
                      </p>
                      <p className="mt-1 text-[11px] text-neutral-400">
                        {getNotificationMessage(notification)}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-neutral-500">
                        <HiClock className="text-xs" />
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
