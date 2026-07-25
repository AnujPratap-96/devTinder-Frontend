import { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL, createSocketConnection } from "../utils/constant";
import { addConnections } from "../store/connectionSlice";
import { useToast } from "../context/ToastProvider";

const PAGE_SIZE = 20;

const useConnectionList = () => {
  const { addToast } = useToast();
  const dispatch = useDispatch();
  const reduxConnections = useSelector((store) => store.connections);
  const userId = useSelector((store) => store.user?._id);

  const [connections, setConnections] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchConnections = useCallback(async ({ cursor = null, append = false } = {}) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
        params: { limit: PAGE_SIZE, cursor: cursor || undefined },
      });
      const items = res.data.data || [];
      const next = res?.data?.nextCursor ?? null;
      const more = res?.data?.hasMore ?? false;
      if (append) {
        setConnections((prev) => [...prev, ...items]);
      } else {
        setConnections(items);
        dispatch(addConnections(items));
      }
      setNextCursor(next);
      setHasMore(more);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to fetch connections", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [dispatch, addToast]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchConnections({ cursor: nextCursor, append: true });
  }, [hasMore, loadingMore, nextCursor, fetchConnections]);

  useEffect(() => {
    fetchConnections({ cursor: null });
  }, [fetchConnections]);

  useEffect(() => {
    if (!userId) return;
    const socket = createSocketConnection(userId);
    const refresh = () => fetchConnections({ cursor: null });
    socket.on("message:created", refresh);
    socket.on("unread:update", refresh);
    socket.on("messages:seen", refresh);
    return () => {
      socket.off("message:created", refresh);
      socket.off("unread:update", refresh);
      socket.off("messages:seen", refresh);
    };
  }, [userId, fetchConnections]);

  return { connections, nextCursor, hasMore, loadMore, loading, loadingMore };
};

export default useConnectionList;
