/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { HiCreditCard, HiPencil, HiTrash, HiPlus } from "react-icons/hi";
import { BASE_URL } from "../../utils/constant";
import Card from "../ui/Card";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";
import { useToast } from "../../context/ToastProvider";

const EMPTY_FORM = {
  slug: "",
  name: "",
  description: "",
  price: 0,
  currency: "INR",
  durationMonths: 0,
  order: 0,
  isFree: false,
  isActive: true,
  featuresText: "",
  limits: {
    connectionRequestsPerDay: "",
    aiCallsPerDay: "",
    canCreateProjects: false,
    canChat: false,
    canViewProfileViews: false,
    blueBadge: false,
    themeAccess: false,
  },
};

const LIMIT_FIELDS = [
  { key: "canCreateProjects", label: "Can create projects" },
  { key: "canChat", label: "Can chat" },
  { key: "canViewProfileViews", label: "Can view profile views" },
  { key: "blueBadge", label: "Blue badge" },
  { key: "themeAccess", label: "Theme access" },
];

const AdminPlans = () => {
  const user = useSelector((store) => store.user);
  const { addToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // plan object or EMPTY_FORM
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/plans`, { withCredentials: true });
      setPlans(res.data.data.plans ?? []);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to load plans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const openCreate = () => setEditing({ ...EMPTY_FORM });
  const openEdit = (plan) =>
    setEditing({
      _id: plan._id,
      slug: plan.slug,
      name: plan.name,
      description: plan.description || "",
      price: plan.price,
      currency: plan.currency || "INR",
      durationMonths: plan.durationMonths || 0,
      order: plan.order || 0,
      isFree: plan.isFree || false,
      isActive: plan.isActive !== false,
      featuresText: (plan.features || []).join("\n"),
      limits: {
        connectionRequestsPerDay: plan.limits?.connectionRequestsPerDay ?? "",
        aiCallsPerDay: plan.limits?.aiCallsPerDay ?? "",
        canCreateProjects: plan.limits?.canCreateProjects || false,
        canChat: plan.limits?.canChat || false,
        canViewProfileViews: plan.limits?.canViewProfileViews || false,
        blueBadge: plan.limits?.blueBadge || false,
        themeAccess: plan.limits?.themeAccess || false,
      },
    });

  const numOrNull = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        description: editing.description,
        price: editing.isFree ? 0 : Number(editing.price) || 0,
        currency: editing.currency,
        durationMonths: Number(editing.durationMonths) || 0,
        order: Number(editing.order) || 0,
        isFree: editing.isFree,
        isActive: editing.isFree ? true : editing.isActive,
        features: editing.featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
        limits: {
          connectionRequestsPerDay: numOrNull(editing.limits.connectionRequestsPerDay),
          aiCallsPerDay: numOrNull(editing.limits.aiCallsPerDay),
          canCreateProjects: editing.limits.canCreateProjects,
          canChat: editing.limits.canChat,
          canViewProfileViews: editing.limits.canViewProfileViews,
          blueBadge: editing.limits.blueBadge,
          themeAccess: editing.limits.themeAccess,
        },
      };
      if (editing._id) {
        await axios.patch(`${BASE_URL}/admin/plans/${editing._id}`, payload, { withCredentials: true });
        addToast("Plan updated", "success");
      } else {
        payload.slug = editing.slug.toLowerCase().trim();
        await axios.post(`${BASE_URL}/admin/plans`, payload, { withCredentials: true });
        addToast("Plan created", "success");
      }
      setEditing(null);
      load();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to save plan", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id, isFree) => {
    if (isFree) {
      addToast("The free plan cannot be deleted", "error");
      return;
    }
    if (!window.confirm("Delete this plan?")) return;
    try {
      await axios.delete(`${BASE_URL}/admin/plans/${id}`, { withCredentials: true });
      addToast("Plan deleted", "success");
      load();
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to delete plan", "error");
    }
  };

  if (loading) return <Card tone="translucent" className="flex h-48 items-center justify-center"><Spinner /></Card>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-neutral-100">Membership plans</h2>
        <Button size="sm" onClick={openCreate}><HiPlus className="mr-1" /> New plan</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <Card key={p._id} tone="glass" className="space-y-2 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-neutral-100">{p.name}</p>
                <p className="text-[11px] text-neutral-500">/{p.slug}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${p.isActive ? "bg-success-500/15 text-success-400" : "bg-tint text-neutral-400"}`}>
                {p.isActive ? "active" : "inactive"}
              </span>
            </div>
            <p className="text-lg font-bold text-neutral-50">
              ₹{p.price}
              <span className="text-xs font-normal text-neutral-400"> / {p.durationMonths || 0} mo</span>
            </p>
            <div className="flex flex-wrap gap-1">
              {(p.features || []).slice(0, 3).map((f, i) => (
                <span key={i} className="rounded bg-tint px-1.5 py-0.5 text-[10px] text-neutral-300">{f}</span>
              ))}
              {(p.features || []).length > 3 && (
                <span className="rounded bg-tint px-1.5 py-0.5 text-[10px] text-neutral-400">+{p.features.length - 3}</span>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="xs" variant="ghost" onClick={() => openEdit(p)}><HiPencil /> Edit</Button>
              <Button size="xs" variant="danger" onClick={() => remove(p._id, p.isFree)}><HiTrash /> Delete</Button>
            </div>
          </Card>
        ))}
        {plans.length === 0 && <EmptyState icon={<HiCreditCard className="text-2xl" />} title="No plans" description="Create your first plan." tone="translucent" />}
      </div>

      {editing && (
        <Card tone="glass" className="space-y-5 p-5">
          <h3 className="font-semibold text-neutral-100">{editing._id ? "Edit plan" : "New plan"}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name"><input className="input-base" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Slug" disabled={!!editing._id}>
              <input className="input-base" value={editing.slug} disabled={!!editing._id} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="silver" />
            </Field>
            <Field label="Price (₹)"><input type="number" className="input-base" value={editing.price} disabled={editing.isFree} onChange={(e) => setEditing({ ...editing, price: e.target.value })} /></Field>
            <Field label="Duration (months)"><input type="number" className="input-base" value={editing.durationMonths} onChange={(e) => setEditing({ ...editing, durationMonths: e.target.value })} /></Field>
            <Field label="Order"><input type="number" className="input-base" value={editing.order} onChange={(e) => setEditing({ ...editing, order: e.target.value })} /></Field>
            <Field label="Currency"><input className="input-base" value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} /></Field>
          </div>

          <Field label="Description">
            <input className="input-base w-full" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </Field>

          <Field label="Features (one per line)">
            <textarea
              className="input-base w-full min-h-[120px] resize-y"
              value={editing.featuresText}
              onChange={(e) => setEditing({ ...editing, featuresText: e.target.value })}
            />
            {editing.featuresText.split("\n").map((f) => f.trim()).filter(Boolean).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {editing.featuresText
                  .split("\n")
                  .map((f) => f.trim())
                  .filter(Boolean)
                  .map((f, i) => (
                    <span key={i} className="rounded-full bg-brand-500/15 px-2 py-0.5 text-xs text-brand-300">{f}</span>
                  ))}
              </div>
            )}
          </Field>

          <div className="rounded-xl border border-hairline-soft bg-tint/40 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">Limits</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Connection req / day (blank = unlimited)"><input type="number" className="input-base" value={editing.limits.connectionRequestsPerDay} onChange={(e) => setEditing({ ...editing, limits: { ...editing.limits, connectionRequestsPerDay: e.target.value } })} /></Field>
              <Field label="AI calls / day (blank = unlimited)"><input type="number" className="input-base" value={editing.limits.aiCallsPerDay} onChange={(e) => setEditing({ ...editing, limits: { ...editing.limits, aiCallsPerDay: e.target.value } })} /></Field>
              {LIMIT_FIELDS.map((f) => (
                <label key={f.key} className="flex items-center gap-2 text-sm text-neutral-300">
                  <input type="checkbox" checked={editing.limits[f.key]} onChange={(e) => setEditing({ ...editing, limits: { ...editing.limits, [f.key]: e.target.checked } })} />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={editing.isFree} onChange={(e) => setEditing({ ...editing, isFree: e.target.checked })} /> Free plan (price locked 0)
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> Active
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

const Field = ({ label, children, disabled }) => (
  <label className={`block ${disabled ? "opacity-60" : ""}`}>
    <span className="mb-1 block text-xs font-medium text-neutral-400">{label}</span>
    {children}
  </label>
);

export default AdminPlans;
