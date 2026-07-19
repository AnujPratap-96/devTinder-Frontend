/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../../utils/constant";
import Card from "../ui/Card";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import { useToast } from "../../context/ToastProvider";

const PAGE_SIZE = 20;

const Row = ({ label, value }) =>
  value ? (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className="text-right text-neutral-200">{value}</span>
    </div>
  ) : null;

const AdminUsers = () => {
  const user = useSelector((store) => store.user);
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Raw filter inputs
  const [searchInput, setSearchInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [availability, setAvailability] = useState("");
  const [banned, setBanned] = useState("");

  // Debounced values used for the actual query
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const reqId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const t = setTimeout(() => setRole(roleInput), 350);
    return () => clearTimeout(t);
  }, [roleInput]);

  const loadPage = useCallback(
    async ({ cursor = null, append = false } = {}) => {
      const id = ++reqId.current;
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);
        const res = await axios.get(`${BASE_URL}/admin/users`, {
          withCredentials: true,
          params: {
            limit: PAGE_SIZE,
            cursor: cursor || undefined,
            search: search || undefined,
            role: role || undefined,
            availability: availability || undefined,
            banned: banned || undefined,
          },
        });
        if (id !== reqId.current) return; // stale response
        const { users: page, nextCursor: next, hasMore: more } = res.data.data;
        setUsers((prev) => (append ? [...prev, ...page] : page));
        setNextCursor(next);
        setHasMore(more);
      } catch (err) {
        if (id !== reqId.current) return;
        addToast(err?.response?.data?.message || "Failed to load users", "error");
      } finally {
        if (id === reqId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [search, role, availability, banned, addToast]
  );

  // Reload from the first page whenever filters (or admin status) change.
  useEffect(() => {
    if (user?.isAdmin) loadPage({ cursor: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, search, role, availability, banned]);

  const openUser = async (userId) => {
    try {
      setDetailLoading(true);
      setSelected({ _id: userId });
      const res = await axios.get(`${BASE_URL}/admin/users/${userId}`, { withCredentials: true });
      setSelected(res.data.data.user);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to load user", "error");
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const banUser = async (userId) => {
    try {
      await axios.post(`${BASE_URL}/admin/ban`, { userId }, { withCredentials: true });
      addToast("User banned", "success");
      loadPage({ cursor: null });
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to ban user", "error");
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setRoleInput("");
    setAvailability("");
    setBanned("");
  };

  if (loading) return <Card tone="translucent" className="flex h-48 items-center justify-center"><Spinner /></Card>;

  return (
    <Card tone="glass" className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-hairline-soft p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-100">Users</h2>
          <span className="rounded-full bg-tint px-2 py-1 text-xs text-neutral-300">{users.length} loaded</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="input-base"
            placeholder="Search name or email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <input
            className="input-base"
            placeholder="Filter by role"
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
          />
          <Select
            value={availability}
            onChange={setAvailability}
            options={[
              { value: "", label: "All availability" },
              { value: "available", label: "Available" },
              { value: "open", label: "Open" },
              { value: "busy", label: "Busy" },
            ]}
          />
          <Select
            value={banned}
            onChange={setBanned}
            options={[
              { value: "", label: "All status" },
              { value: "false", label: "Active" },
              { value: "true", label: "Banned" },
            ]}
          />
        </div>

        {(searchInput || roleInput || availability || banned) && (
          <button
            type="button"
            onClick={resetFilters}
            className="self-start text-xs text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="divide-y divide-hairline-soft">
        {users.length === 0 && <EmptyState title="No users" description="No users match the current filters." tone="translucent" />}
        {users.map((u) => (
          <div
            key={u._id}
            onClick={() => openUser(u._id)}
            className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-tint/50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-100">
                {u.firstName} {u.lastName}
              </p>
              <p className="truncate text-[11px] text-neutral-500">{u.emailId}</p>
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <span className="hidden rounded-full border border-hairline bg-tint px-2 py-0.5 text-[10px] text-neutral-300 sm:inline">
                {u.role || "—"}
              </span>
              {u.isBanned ? (
                <span className="rounded-full bg-danger-500/15 px-2 py-0.5 text-[10px] text-danger-400">banned</span>
              ) : (
                u._id !== user?._id && (
                  <Button variant="danger" size="xs" onClick={() => banUser(u._id)}>
                    Ban
                  </Button>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center border-t border-hairline-soft p-3">
          <Button variant="ghost" size="sm" onClick={() => loadPage({ cursor: nextCursor, append: true })} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="User details">
        {detailLoading || !selected ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-hairline-soft bg-tint/50 p-4">
              <img
                src={selected.photoUrl || selected.avatarUrl || "https://avatar.iran.liara.run/public/boy"}
                alt=""
                className="h-16 w-16 flex-shrink-0 rounded-full border border-hairline-soft object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-neutral-100">
                  {selected.firstName} {selected.lastName}
                  {selected.isAdmin && (
                    <span className="ml-2 rounded bg-brand-500/20 px-1.5 py-0.5 text-[10px] text-brand-400">admin</span>
                  )}
                </p>
                <p className="truncate text-sm text-neutral-400">{selected.emailId}</p>
              </div>
            </div>

            <div className="rounded-xl border border-hairline-soft bg-tint/40 px-4 py-2">
              <Row label="Role" value={selected.role} />
              <Row label="Gender" value={selected.gender} />
              <Row label="Age" value={selected.age} />
              <Row label="Experience" value={selected.experienceYears ? `${selected.experienceYears} yrs` : null} />
              <Row label="Availability" value={selected.availability} />
              <Row label="Location" value={[selected.city, selected.country].filter(Boolean).join(", ") || null} />
              <Row label="Membership" value={selected.membershipType} />
              <Row label="Premium" value={selected.isPremium ? "Yes" : "No"} />
              <Row label="Profile strength" value={selected.profileStrength != null ? `${selected.profileStrength}%` : null} />
              <Row label="Joined" value={selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : null} />
            </div>

            {selected.about && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">About</p>
                <p className="text-sm text-neutral-300">{selected.about}</p>
              </div>
            )}

            {selected.skills?.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.skills.map((s) => (
                    <span key={s} className="rounded-full bg-brand-500/15 px-2 py-0.5 text-xs text-brand-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(selected.socialLinks?.github || selected.socialLinks?.linkedin || selected.socialLinks?.portfolio || selected.githubProfile) && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">Links</p>
                <div className="space-y-1 text-sm">
                  {selected.socialLinks?.github && (
                    <a className="block text-brand-400 hover:underline" href={selected.socialLinks.github} target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  )}
                  {selected.socialLinks?.linkedin && (
                    <a className="block text-brand-400 hover:underline" href={selected.socialLinks.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  )}
                  {selected.socialLinks?.portfolio && (
                    <a className="block text-brand-400 hover:underline" href={selected.socialLinks.portfolio} target="_blank" rel="noreferrer">
                      Portfolio
                    </a>
                  )}
                  {!selected.socialLinks?.github && selected.githubProfile && (
                    <a className="block text-brand-400 hover:underline" href={selected.githubProfile} target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default AdminUsers;
