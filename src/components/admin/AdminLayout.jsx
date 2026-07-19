import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiShieldCheck, HiUsers, HiExclamationCircle, HiBan, HiCreditCard } from "react-icons/hi";
import EmptyState from "../ui/EmptyState";

const AdminLayout = () => {
  const user = useSelector((store) => store.user);

  const tabs = [
    { to: "/admin/users", icon: HiUsers, label: "Users" },
    { to: "/admin/reports", icon: HiExclamationCircle, label: "Reports" },
    { to: "/admin/banned", icon: HiBan, label: "Banned" },
    { to: "/admin/plans", icon: HiCreditCard, label: "Plans" },
  ];

  if (!user?.isAdmin) {
    return (
      <EmptyState
        icon={<HiShieldCheck className="text-3xl" />}
        title="Restricted"
        description="This area is limited to admins."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-50">
          <HiShieldCheck className="text-brand-500" /> Admin Panel
        </h1>
        <p className="text-sm text-neutral-400">Manage users, reports, bans and membership plans.</p>
      </div>

      <nav className="flex flex-wrap gap-2">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-brand-400/50 bg-brand-500/15 text-brand-400 shadow-brand-glow"
                  : "border-hairline bg-tint text-neutral-300 hover:bg-tint-strong hover:text-neutral-100"
              }`
            }
          >
            <Icon className="text-base" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="min-h-[300px]">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
