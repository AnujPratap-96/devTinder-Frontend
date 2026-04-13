import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState, useTransition, memo } from "react";
import { addFeed } from "../store/feedSlice";
import UserCard from "./UserCard";
import CompactUserItem from "./CompactUserItem";
import { useToast } from "../context/ToastProvider";

import { motion, AnimatePresence } from "framer-motion";
import { HiUsers, HiSearch, HiArrowLeft } from "react-icons/hi";
import Button from "./ui/Button";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";
import ErrorBoundary from "./ErrorBoundary";

const SearchGrid = memo(({ results, onSelect, query }) => (
  <motion.div 
    key="results-grid"
    className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-7xl"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {results.slice(0, 15).map(u => (
      <CompactUserItem 
        key={u._id} 
        user={u} 
        searchQuery={query} 
        onView={onSelect} 
      />
    ))}
  </motion.div>
));

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

const Feed = () => {
  const { addToast } = useToast();
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelectUser = (user) => {
    setIsTransitioning(true);
    // Use a small delay to allow the list to "breathe" before mounting the heavy card
    setTimeout(() => {
      setSelectedResult(user);
      setIsTransitioning(false);
    }, 100);
  };

  // Clear selectedResult when query changes
  useEffect(() => {
    setSelectedResult(null);
  }, [debouncedQuery]);

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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSearchResults = useCallback(async (q, signal) => {
    if (!q.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/search?q=${encodeURIComponent(q.trim())}`, {
        withCredentials: true,
        signal,
      });
      setSearchResults(res.data.users || []);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (debouncedQuery.trim()) {
      fetchSearchResults(debouncedQuery, controller.signal);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
    return () => controller.abort();
  }, [debouncedQuery, fetchSearchResults]);

  useEffect(() => {
    if (!searchQuery.trim() && !isSearching) {
      getFeed();
    }
  }, [getFeed, searchQuery, isSearching]);

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

  const targetUsers = isSearching ? searchResults : feed;

  return (
    <div className="flex min-h-[80vh] w-full flex-col items-center">
      {/* Search Header */}
      <div className="mb-10 w-full max-w-2xl px-4">
        <div className="relative">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by name or skills (e.g. 'React', 'Node')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-surface-900 py-3.5 pl-11 pr-4 text-sm text-neutral-50 shadow-soft outline-none transition-all focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 placeholder:text-neutral-600"
          />
        </div>
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full flex-col items-center gap-10"
        >
          <SkeletonCard />
        </motion.div>
      ) : targetUsers.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex w-full flex-col items-center"
        >
          {isSearching ? (
             <div className="flex w-full flex-col items-center gap-6 px-4 min-h-[400px]">
                {isTransitioning ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
                    <p className="text-neutral-400 font-medium animate-pulse">Loading Profile...</p>
                  </div>
                ) : (selectedResult || searchResults.length === 1) ? (
                  <motion.div 
                    key="single-card"
                    className="w-full flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {selectedResult && (
                      <button
                        onClick={() => setSelectedResult(null)}
                        className="mb-8 flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-6 py-2.5 text-sm font-medium text-neutral-100 shadow-lg backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
                      >
                        <HiArrowLeft className="text-base" /> Back to Search Results
                      </button>
                    )}
                    <ErrorBoundary>
                      <UserCard user={selectedResult || searchResults[0]} searchQuery={debouncedQuery} />
                    </ErrorBoundary>
                  </motion.div>
                ) : (
                  <SearchGrid 
                    results={searchResults} 
                    onSelect={handleSelectUser} 
                    query={debouncedQuery} 
                  />
                )}
             </div>
          ) : (
            <>
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
              <ErrorBoundary>
                <UserCard key={targetUsers[0]?._id} user={targetUsers[0]} searchQuery={searchQuery} />
              </ErrorBoundary>
            </>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          <EmptyState
            icon={isSearching ? <HiSearch className="text-3xl" /> : <HiUsers className="text-3xl" />}
            title={isSearching ? "No search results" : "All caught up!"}
            description={isSearching ? "Try a different keyword or skill." : "You have seen all developers in your feed. Check back later for new profiles."}
            action={
              !isSearching && (
              <Button
                variant="secondary"
                onClick={() => {
                  setLoading(true);
                  getFeed(true);
                }}
              >
                Refresh Feed
              </Button>
              )
            }
          />
        </motion.div>
      )}
    </div>
  );
};

export default Feed;
