import { useEffect, useState } from "react";
import axios from "axios";
import { HiBookmark, HiTrash, HiBan, HiFlag } from "react-icons/hi";
import { BASE_URL } from "../utils/constant";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import Button from "./ui/Button";
import { useToast } from "../context/ToastProvider";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/bookmarks`, {
          withCredentials: true,
        });
        setBookmarks(data.bookmarks ?? []);
      } catch (error) {
        addToast(error?.response?.data?.message || "Unable to load bookmarks", "error");
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, [addToast]);

  const removeBookmark = async (bookmarkId) => {
    try {
      await axios.delete(`${BASE_URL}/bookmark/${bookmarkId}`, {
        withCredentials: true,
      });
      setBookmarks((prev) => prev.filter((b) => b._id !== bookmarkId));
      addToast("Bookmark removed", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to remove bookmark", "error");
    }
  };

  const blockUser = async (userId) => {
    try {
      await axios.post(
        `${BASE_URL}/user/block`,
        { blockedUserId: userId },
        { withCredentials: true }
      );
      addToast("User blocked", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to block user", "error");
    }
  };

  const reportUser = async (userId) => {
    try {
      await axios.post(
        `${BASE_URL}/user/report`,
        { reportedUserId: userId, reason: "Inappropriate behavior" },
        { withCredentials: true }
      );
      addToast("User reported", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to report user", "error");
    }
  };

  if (loading) {
    return (
      <Card tone="translucent" className="mx-auto flex h-64 w-full max-w-lg items-center justify-center">
        <span className="loading loading-spinner loading-lg text-brand-300" />
      </Card>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="mx-auto max-w-lg">
        <EmptyState
          icon={<HiBookmark className="text-3xl" />}
          title="No saved profiles yet"
          description="Bookmark developers you want to revisit by tapping the Save button on their profile cards."
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <Card key={bookmark._id} tone="glass" className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/10">
              <img
                src={bookmark.savedUserId?.photoUrl?.[0] || "https://via.placeholder.com/48"}
                alt={bookmark.savedUserId?.firstName}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-100">
                {bookmark.savedUserId?.firstName} {bookmark.savedUserId?.lastName}
              </p>
              <p className="text-xs text-neutral-400">
                {bookmark.savedUserId?.role ?? "Developer"}
              </p>
            </div>
          </div>
          <p className="text-xs text-neutral-400">
            Saved on {new Date(bookmark.createdAt).toLocaleDateString()}
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeBookmark(bookmark._id)}
              className="text-error-400 hover:text-error-300"
            >
              <HiTrash className="text-sm" /> Remove
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => blockUser(bookmark.savedUserId?._id)}
              className="text-warning-400 hover:text-warning-300"
            >
              <HiBan className="text-sm" /> Block
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => reportUser(bookmark.savedUserId?._id)}
              className="text-neutral-400 hover:text-neutral-300"
            >
              <HiFlag className="text-sm" /> Report
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Bookmarks;
