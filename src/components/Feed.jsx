import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { addFeed } from "../store/feedSlice";
import UserCard from "./UserCard";
import { useToast } from "../context/ToastProvider";
import { motion } from "framer-motion";
import { HiUsers } from "react-icons/hi";
import Button from "./ui/Button";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";

const Feed = () => {
  const { addToast } = useToast();
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [locationRequested, setLocationRequested] = useState(false);

  const getFeed = useCallback(async (force = false) => {
    if (!force && feed.length > 0) {
      setLoading(false);
      return;
    }
    try {
      const params = new URLSearchParams();
      if (coords?.lat && coords?.lng) {
        params.set("lat", coords.lat);
        params.set("lng", coords.lng);
        params.set("radius", "50");
      }
      const url = params.toString() ? `${BASE_URL}/feed?${params.toString()}` : `${BASE_URL}/feed`;
      const res = await axios.get(url, { withCredentials: true });
      dispatch(addFeed(res?.data?.users || []));
    } catch (err) {
      addToast(err.message || "Error fetching feed. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  }, [feed.length, dispatch, addToast, coords]);

  useEffect(() => {
    getFeed();
  }, [getFeed]);

  useEffect(() => {
    const hasGeolocation = "geolocation" in navigator;
    if (!hasGeolocation || locationRequested) return;
    setLocationRequested(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        setCoords(null);
      },
      { enableHighAccuracy: true, maximumAge: 600000 }
    );
  }, [locationRequested]);

  const SkeletonCard = () => (
    <Card
      tone="translucent"
      className="relative flex h-[520px] w-full max-w-md flex-col justify-end overflow-hidden"
    >
      <div className="absolute inset-0 skeleton rounded-3xl" />
      <div className="relative space-y-4 p-6">
        <div className="skeleton h-8 w-2/3 rounded-xl" />
        <div className="skeleton h-4 w-1/3 rounded-lg" />
        <div className="skeleton h-12 w-4/5 rounded-xl" />
      </div>
    </Card>
  );

  return (
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-center">
      {loading ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full flex-col items-center gap-10"
        >
          <div className="space-y-3 text-center">
            <div className="skeleton mx-auto h-9 w-48 rounded-xl" />
            <div className="skeleton mx-auto h-4 w-40 rounded-lg" />
          </div>
          <SkeletonCard />
        </motion.div>
      ) : feed.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex w-full flex-col items-center"
        >
          <div className="mb-8 text-center space-y-2">
            <h1 className="text-heading-md text-neutral-50">Discover Developers</h1>
            <p className="text-body-sm text-neutral-400">
              Tailored matches powered by skills, experience, and proximity.
            </p>
            {coords && (
              <p className="text-xs text-brand-200/80">
                Showing matches within 50km of your current location
              </p>
            )}
          </div>
          <UserCard key={feed[0]._id} user={feed[0]} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          <EmptyState
            icon={<HiUsers className="text-3xl" />}
            title="All caught up!"
            description="You have seen all developers in your feed. Check back later for new profiles."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setLoading(true);
                  getFeed(true);
                }}
              >
                Refresh Feed
              </Button>
            }
          />
        </motion.div>
      )}
    </div>
  );
};

export default Feed;
