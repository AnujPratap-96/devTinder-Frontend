import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { HiBan } from "react-icons/hi";
import { BASE_URL } from "../../utils/constant";
import Card from "../ui/Card";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";
import { useToast } from "../../context/ToastProvider";

const AdminBanned = () => {
  const user = useSelector((store) => store.user);
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/banned`, { withCredentials: true });
      setUsers(res.data.data.users ?? []);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to load banned users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const unban = async (userId) => {
    try {
      await axios.post(`${BASE_URL}/admin/unban`, { userId }, { withCredentials: true });
      addToast("User unbanned", "success");
      load();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to unban user", "error");
    }
  };

  if (loading) return <Card tone="translucent" className="flex h-48 items-center justify-center"><Spinner /></Card>;

  return (
    <Card tone="glass" className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-hairline-soft px-5 py-4">
        <h2 className="font-semibold text-neutral-100">Banned users</h2>
        <span className="rounded-full bg-tint px-2 py-1 text-xs text-neutral-300">{users.length}</span>
      </div>
      <div className="divide-y divide-hairline-soft">
        {users.length === 0 && <EmptyState icon={<HiBan className="text-2xl" />} title="No banned users" description="Everyone is in good standing." tone="translucent" />}
        {users.map((u) => (
          <div key={u._id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-100">
                {u.firstName} {u.lastName}
              </p>
              <p className="truncate text-[11px] text-neutral-500">{u.emailId}</p>
            </div>
            <Button size="xs" variant="ghost" onClick={() => unban(u._id)}>
              Unban
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AdminBanned;
