import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { HiShieldCheck, HiExclamationCircle } from "react-icons/hi";
import { BASE_URL } from "../utils/constant";
import Card from "./ui/Card";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import { useToast } from "../context/ToastProvider";

const AdminDashboard = () => {
  const user = useSelector((store) => store.user);
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [usersRes, reportsRes] = await Promise.all([
        axios.get(`${BASE_URL}/admin/users`, { withCredentials: true }),
        axios.get(`${BASE_URL}/admin/reports`, { withCredentials: true }),
      ]);
       setUsers(usersRes.data.data.users ?? []);
       setReports(reportsRes.data.data.reports ?? []);
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to load admin data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      loadData();
    }
  }, [user]);

  const banUser = async (userId) => {
    try {
      await axios.post(
        `${BASE_URL}/admin/ban`,
        { userId },
        { withCredentials: true }
      );
      addToast("User banned", "success");
      await loadData();
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to ban user", "error");
    }
  };

  if (!user?.isAdmin) {
    return (
      <EmptyState
        icon={<HiShieldCheck className="text-3xl" />}
        title="Restricted"
        description="This area is limited to admins."
      />
    );
  }

  if (loading) {
    return (
      <Card tone="translucent" className="flex h-64 items-center justify-center">
        <span className="spinner h-7 w-7 border-[3px] text-brand-600" />
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card tone="glass" className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-100">Users</h2>
            <p className="text-xs text-neutral-400">Monitor account health and availability.</p>
          </div>
          <span className="rounded-full bg-tint px-2 py-1 text-xs text-neutral-300">
            {users.length} total
          </span>
        </div>
        <div className="space-y-3">
          {users.map((item) => (
            <div key={item._id} className="flex items-center justify-between rounded-xl border border-hairline-soft bg-tint p-3">
              <div>
                <p className="text-sm font-semibold text-neutral-100">
                  {item.firstName} {item.lastName}
                </p>
                <p className="text-[11px] text-neutral-500">{item.emailId}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-hairline bg-tint px-2 py-0.5 text-[10px] text-neutral-300">
                  {item.availability}
                </span>
                {!item.isBanned && (
                  <Button variant="danger" size="xs" onClick={() => banUser(item._id)}>
                    Ban
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card tone="glass" className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-100">Reports</h2>
            <p className="text-xs text-neutral-400">User generated reports awaiting review.</p>
          </div>
          <span className="rounded-full bg-tint px-2 py-1 text-xs text-neutral-300">
            {reports.length}
          </span>
        </div>
        {reports.length === 0 ? (
          <EmptyState
            icon={<HiExclamationCircle className="text-2xl" />}
            title="All clear"
            description="No pending reports at the moment."
            tone="translucent"
          />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report._id} className="rounded-xl border border-hairline-soft bg-tint p-3">
                <p className="text-sm font-semibold text-neutral-100">{report.reason}</p>
                <p className="text-xs text-neutral-400">{report.details || "No additional details"}</p>
                <p className="mt-2 text-[11px] text-neutral-500">
                  Reporter: {report.reporterId?.emailId} → {report.reportedUserId?.emailId}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
