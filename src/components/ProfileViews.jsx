import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addProfileViews } from "../store/profileViewSlice";
import { getProfileViews } from "../api/profileViews";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { useToast } from "../context/ToastProvider";
import EmptyState from "./ui/EmptyState";
import { HiEye, HiEyeOff, HiArrowDown, HiStar } from "react-icons/hi";
import { optimizePhotoUrl } from "../utils/avatar";

const PAGE_SIZE = 2;

const ProfileViews = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduxViews = useSelector((store) => store.profileViews);
  const {
    items: reduxItems,
    nextCursor: reduxNextCursor,
    hasMore: reduxHasMore,
    totalViews: reduxTotalViews,
    profileViewsLimit: reduxLimit,
  } = reduxViews;
  const [views, setViews] = useState([]);
  const [totalViews, setTotalViews] = useState(0);
  const [profileViewsLimit, setProfileViewsLimit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const { addToast } = useToast();
  const seeded = useRef(false);

  const loadViews = useCallback(async ({ cursor = null, append = false } = {}) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      const data = await getProfileViews({ limit: PAGE_SIZE, cursor: cursor || undefined });
      const items = data.views ?? [];
      const next = data?.nextCursor ?? null;
      const more = data?.hasMore ?? false;
      const total = data?.totalViews ?? 0;
      const limit = data?.profileViewsLimit ?? null;
      if (append) {
        setViews((prev) => [...prev, ...items]);
      } else {
        setViews(items);
        dispatch(addProfileViews({ items, nextCursor: next, hasMore: more, totalViews: total, profileViewsLimit: limit }));
      }
      setTotalViews(total);
      setProfileViewsLimit(limit);
      setNextCursor(next);
      setHasMore(more);
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to load profile views", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [dispatch, addToast]);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if (reduxItems?.length > 0) {
      setViews(reduxItems);
      setNextCursor(reduxNextCursor);
      setHasMore(reduxHasMore);
      setTotalViews(reduxTotalViews);
      setProfileViewsLimit(reduxLimit);
      setLoading(false);
    } else {
      loadViews({ cursor: null });
    }
  }, [reduxItems, reduxNextCursor, reduxHasMore, reduxTotalViews, reduxLimit, loadViews]);

  if (loading) {
    return (
      <Card tone="translucent" className="flex h-40 items-center justify-center">
        <span className="spinner h-5 w-5 border-2 text-brand-600" />
      </Card>
    );
  }

  if (totalViews === 0 && views.length === 0) {
    return (
      <EmptyState
        icon={<HiEye className="text-3xl" />}
        title="No profile views yet"
        description="We'll notify you when other developers check out your profile."
        tone="translucent"
      />
    );
  }

  const limitReached =
    typeof profileViewsLimit === "number" &&
    profileViewsLimit > 0 &&
    views.length >= profileViewsLimit;

  return (
    <Card tone="translucent" className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-100">Recent profile views</h2>
        <span className="rounded-full bg-tint px-2 py-1 text-[11px] text-neutral-300">
          {totalViews} {totalViews === 1 ? "person" : "people"}
        </span>
      </div>

      {views.length > 0 ? (
        <div className="space-y-3">
          {views.map((view) => (
            <div key={view._id} className="flex items-center justify-between rounded-xl border border-hairline-soft bg-tint p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-xl border border-hairline">
                  <img
                    src={optimizePhotoUrl(view.viewerId?.photoUrl?.[0]) || "https://via.placeholder.com/40"}
                    alt={view.viewerId?.firstName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-100">
                    {view.viewerId?.firstName} {view.viewerId?.lastName}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    {new Date(view.viewedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-hairline-soft bg-tint p-4 text-center">
          <HiEyeOff className="mx-auto mb-2 text-2xl text-neutral-500" />
          <p className="text-sm font-semibold text-neutral-100">
            {totalViews} {totalViews === 1 ? "person has" : "people have"} viewed your profile
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Upgrade to Silver to see who&apos;s visiting you.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-3"
            onClick={() => navigate("/premium")}
          >
            <HiStar className="text-warning-400" /> Upgrade to see viewers
          </Button>
        </div>
      )}

      {hasMore && !limitReached && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadViews({ cursor: nextCursor, append: true })}
            disabled={loadingMore}
          >
            {loadingMore ? <span className="spinner h-4 w-4 border-2 text-brand-600" /> : <HiArrowDown className="text-lg" />}
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ProfileViews;
