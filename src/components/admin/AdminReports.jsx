import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { HiExclamationCircle } from "react-icons/hi";
import { BASE_URL } from "../../utils/constant";
import Card from "../ui/Card";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";
import { useToast } from "../../context/ToastProvider";

const STATUS_OPTIONS = ["open", "reviewing", "resolved"];
const STATUS_STYLES = {
  open: "bg-warning-500/15 text-warning-400",
  reviewing: "bg-info-500/15 text-info-400",
  resolved: "bg-success-500/15 text-success-400",
};

const AdminReports = () => {
  const user = useSelector((store) => store.user);
  const { addToast } = useToast();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/reports`, { withCredentials: true });
      setReports(res.data.data.reports ?? []);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to load reports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const resolve = async (id, status) => {
    try {
      await axios.patch(`${BASE_URL}/admin/reports/${id}`, { status }, { withCredentials: true });
      addToast("Report updated", "success");
      load();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update report", "error");
    }
  };

  const filtered = reports.filter((r) => filter === "all" || r.status === filter);

  if (loading) return <Card tone="translucent" className="flex h-48 items-center justify-center"><Spinner /></Card>;

  return (
    <Card tone="glass" className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline-soft px-5 py-4">
        <h2 className="font-semibold text-neutral-100">Reports</h2>
        <div className="flex gap-1.5">
          {["all", ...STATUS_OPTIONS].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                filter === f ? "bg-brand-500/20 text-brand-400" : "bg-tint text-neutral-400 hover:text-neutral-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-hairline-soft">
        {filtered.length === 0 && (
          <EmptyState icon={<HiExclamationCircle className="text-2xl" />} title="All clear" description="No reports match this filter." tone="translucent" />
        )}
        {filtered.map((r) => (
          <div key={r._id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-neutral-100">{r.reason}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] capitalize ${STATUS_STYLES[r.status] || "bg-tint text-neutral-300"}`}>
                  {r.status}
                </span>
              </div>
              <p className="truncate text-xs text-neutral-400">{r.details || "No additional details"}</p>
              <p className="truncate text-[11px] text-neutral-500">
                {r.reporterId?.emailId || "Unknown"} → {r.reportedUserId?.emailId || "Unknown"}
              </p>
            </div>
            {r.status !== "resolved" && (
              <div className="flex shrink-0 gap-1.5">
                <Button size="xs" variant="ghost" onClick={() => resolve(r._id, "reviewing")}>Review</Button>
                <Button size="xs" variant="success" onClick={() => resolve(r._id, "resolved")}>Resolve</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AdminReports;
