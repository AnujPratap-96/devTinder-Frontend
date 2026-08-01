import { useEffect, useCallback, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSocketConnection } from "../utils/constant";
import { getConnections } from "../api/connections";
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
  const seeded = useRef(false);

  const fetchConnections = useCallback(async ({ cursor = null, append = false } = {}) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      const data = await getConnections({ limit: PAGE_SIZE, cursor: cursor || undefined });
      const items = data?.connections || [];
      const next = data?.nextCursor ?? null;
      const more = data?.hasMore ?? false;
      if (append) {
        setConnections((prev) => [...prev, ...items]);
      } else {
        setConnections(items);
        dispatch(addConnections({ items, nextCursor: next, hasMore: more }));
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
    if (seeded.current) return;
    seeded.current = true;
    if (reduxConnections?.items?.length > 0) {
      setConnections(reduxConnections.items);
      setNextCursor(reduxConnections.nextCursor);
      setHasMore(reduxConnections.hasMore);
      setLoading(false);
    } else {
      fetchConnections({ cursor: null });
    }
  }, [reduxConnections?.items?.length]);

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
