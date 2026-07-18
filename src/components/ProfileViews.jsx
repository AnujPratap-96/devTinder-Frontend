import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import Card from "./ui/Card";
import { useToast } from "../context/ToastProvider";
import EmptyState from "./ui/EmptyState";
import { HiEye } from "react-icons/hi";

const ProfileViews = () => {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const loadViews = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/profile/views`, {
          withCredentials: true,
        });
         setViews(data.data.views ?? []);
      } catch (error) {
        addToast(error?.response?.data?.message || "Unable to load profile views", "error");
      } finally {
        setLoading(false);
      }
    };

    loadViews();
  }, [addToast]);

  if (loading) {
    return (
      <Card tone="translucent" className="flex h-40 items-center justify-center">
        <span className="spinner h-5 w-5 border-2 text-brand-600" />
      </Card>
    );
  }

  if (views.length === 0) {
    return (
      <EmptyState
        icon={<HiEye className="text-3xl" />}
        title="No profile views yet"
        description="We'll notify you when other developers check out your profile."
        tone="translucent"
      />
    );
  }

  return (
    <Card tone="translucent" className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-100">Recent profile views</h2>
        <span className="rounded-full bg-tint px-2 py-1 text-[11px] text-neutral-300">{views.length}</span>
      </div>
      <div className="space-y-3">
        {views.map((view) => (
          <div key={view._id} className="flex items-center justify-between rounded-xl border border-hairline-soft bg-tint p-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-xl border border-hairline">
                <img
                  src={view.viewerId?.photoUrl?.[0] || "https://via.placeholder.com/40"}
                  alt={view.viewerId?.firstName}
                  className="h-full w-full object-cover"
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
    </Card>
  );
};

export default ProfileViews;
