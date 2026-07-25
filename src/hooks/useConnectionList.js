import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL, createSocketConnection } from "../utils/constant";
import { addConnections } from "../store/connectionSlice";
import { useToast } from "../context/ToastProvider";

const useConnectionList = () => {
  const { addToast } = useToast();
  const dispatch = useDispatch();
  const connections = useSelector((store) => store.connections);
  const userId = useSelector((store) => store.user?._id);

  // Memoize fetchConnections so it doesn't get recreated on every render
  const fetchConnections = useCallback(async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to fetch connections", "error");
    }
  }, [dispatch, addToast]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Refresh the conversation list in real-time whenever a message is sent,
  // delivered, or read for this user.
  useEffect(() => {
    if (!userId) return;
    const socket = createSocketConnection(userId);
    const refresh = () => fetchConnections();
    socket.on("message:created", refresh);
    socket.on("unread:update", refresh);
    socket.on("messages:seen", refresh);
    return () => {
      socket.off("message:created", refresh);
      socket.off("unread:update", refresh);
      socket.off("messages:seen", refresh);
    };
  }, [userId, fetchConnections]);

  return connections;
};

export default useConnectionList;
