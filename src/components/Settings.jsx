/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  HiShieldCheck,
  HiDeviceMobile,
  HiEyeOff,
  HiEye,
  HiClipboardCopy,
  HiCheckCircle,
  HiXCircle,
  HiTrash,
  HiLockClosed,
} from "react-icons/hi";
import {
  getSessions,
  revokeSession,
  setup2fa,
  enable2fa,
  disable2fa,
} from "../api/auth";
import { viewProfile, updatePrivacy } from "../api/profile";
import Button from "./ui/Button";
import { useToast } from "../context/ToastProvider";
import { removeUser } from "../store/userSlice";
import { closeSocketConnection } from "../utils/constant";

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days}d ago` : new Date(date).toLocaleDateString();
};

const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
  <section className="rounded-2xl border border-hairline-soft bg-surface-900 p-5 sm:p-6">
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-400/30 bg-brand-500/10 text-brand-500">
        <Icon className="text-lg" />
      </span>
      <div>
        <h2 className="text-base font-bold text-neutral-100">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-neutral-400">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

const Settings = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const [setup, setSetup] = useState(null); // { secret, otpauthUri, qrDataUrl }
  const [code, setCode] = useState("");
  const [codeBusy, setCodeBusy] = useState(false);

  const [hideProfileViews, setHideProfileViews] = useState(false);
  const [privacyBusy, setPrivacyBusy] = useState(false);

  const [revokingId, setRevokingId] = useState(null);

  const refreshData = useCallback(async () => {
    try {
      const [sessionData, profileData] = await Promise.all([getSessions(), viewProfile()]);
      setSessions(sessionData.sessions ?? []);
      setCurrentSessionId(sessionData.currentSessionId ?? null);
      setTwoFactorEnabled(!!profileData.user?.twoFactorEnabled);
      setHideProfileViews(!!profileData.user?.privacy?.hideProfileViews);
    } catch (err) {
      addToast(err?.response?.data?.ERROR || "Failed to load security settings", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleStartSetup = async () => {
    try {
      const data = await setup2fa();
      const { default: QRCode } = await import("qrcode");
      const qrDataUrl = await QRCode.toDataURL(data.otpauthUri, { width: 200, margin: 1 });
      setSetup({ secret: data.secret, otpauthUri: data.otpauthUri, qrDataUrl });
      addToast("Scan the QR code with your authenticator app", "info");
    } catch (err) {
      addToast(err?.response?.data?.ERROR || "Failed to start 2FA setup", "error");
    }
  };

  const handleEnable = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      addToast("Enter the 6-digit code from your authenticator app", "error");
      return;
    }
    setCodeBusy(true);
    try {
      await enable2fa(code.trim());
      setSetup(null);
      setCode("");
      setTwoFactorEnabled(true);
      addToast("Two-factor authentication enabled", "success");
      refreshData();
    } catch (err) {
      addToast(err?.response?.data?.ERROR || "Invalid code", "error");
    } finally {
      setCodeBusy(false);
    }
  };

  const handleDisable = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      addToast("Enter the 6-digit code from your authenticator app", "error");
      return;
    }
    setCodeBusy(true);
    try {
      await disable2fa(code.trim());
      setCode("");
      setTwoFactorEnabled(false);
      addToast("Two-factor authentication disabled", "success");
    } catch (err) {
      addToast(err?.response?.data?.ERROR || "Invalid code", "error");
    } finally {
      setCodeBusy(false);
    }
  };

  const handleRevoke = async (sessionId) => {
    setRevokingId(sessionId);
    try {
      const data = await revokeSession(sessionId);
      if (!data.revoked) {
        addToast("Session not found", "error");
      } else if (sessionId === currentSessionId) {
        addToast("This session was revoked — signing you out", "info");
        closeSocketConnection();
        dispatch(removeUser());
        navigate("/login");
        return;
      } else {
        addToast("Session revoked", "success");
      }
      refreshData();
    } catch (err) {
      addToast(err?.response?.data?.ERROR || "Failed to revoke session", "error");
    } finally {
      setRevokingId(null);
    }
  };

  const handleTogglePrivacy = async (checked) => {
    setHideProfileViews(checked);
    setPrivacyBusy(true);
    try {
      await updatePrivacy(checked);
      addToast(checked ? "Your profile visits are now private" : "Profile visits are recorded again", "success");
    } catch (err) {
      setHideProfileViews(!checked);
      addToast(err?.response?.data?.ERROR || "Failed to update privacy settings", "error");
    } finally {
      setPrivacyBusy(false);
    }
  };

  const copySecret = () => {
    if (!setup?.secret) return;
    navigator.clipboard?.writeText(setup.secret).catch(() => {});
    addToast("Secret copied — keep it safe", "success");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl border border-hairline-soft bg-surface-900" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="mb-2">
        <h1 className="text-xl font-bold text-neutral-100">Security &amp; Privacy</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Protect your account, manage active devices, and control who sees your browsing.
        </p>
      </header>

      {/* ─── Two-factor authentication ─────────────────────────────── */}
      <SectionCard
        icon={HiShieldCheck}
        title="Two-factor authentication"
        subtitle="Add an extra code from your authenticator app on every sign-in."
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "flex h-6 w-6 items-center justify-center rounded-full",
                twoFactorEnabled ? "bg-success-500/20 text-success-600" : "bg-tint text-neutral-400"
              )}
            >
              {twoFactorEnabled ? <HiCheckCircle /> : <HiXCircle />}
            </span>
            <span className={clsx("text-sm font-semibold", twoFactorEnabled ? "text-success-600" : "text-neutral-300")}>
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          {!twoFactorEnabled && !setup && (
            <Button size="sm" variant="secondary" onClick={handleStartSetup}>
              Enable 2FA
            </Button>
          )}
        </div>

        {setup && (
          <div className="mt-4 rounded-xl border border-hairline-soft bg-tint p-4">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {setup.qrDataUrl && (
                <img
                  src={setup.qrDataUrl}
                  alt="2FA QR code"
                  className="h-44 w-44 shrink-0 rounded-xl bg-white p-2"
                />
              )}
              <div className="w-full flex-1 space-y-3">
                <p className="text-sm text-neutral-300">
                  Scan this QR code in <strong>Google Authenticator</strong> (or any TOTP app), then enter the
                  6-digit code to confirm.
                </p>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-surface-900 px-3 py-2">
                  <code className="truncate text-xs text-neutral-200">{setup.secret}</code>
                  <button
                    type="button"
                    onClick={copySecret}
                    className="shrink-0 text-neutral-400 transition hover:text-brand-500"
                    aria-label="Copy secret"
                  >
                    <HiClipboardCopy className="text-base" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit code"
                    className="input-base w-32 text-center tracking-[0.3em]"
                  />
                  <Button size="sm" loading={codeBusy} onClick={handleEnable}>
                    Verify &amp; Enable
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSetup(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {twoFactorEnabled && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Current code to disable"
              className="input-base w-48 text-center tracking-[0.3em]"
            />
            <Button size="sm" variant="danger" loading={codeBusy} onClick={handleDisable}>
              Disable 2FA
            </Button>
          </div>
        )}
      </SectionCard>

      {/* ─── Active sessions ───────────────────────────────────────── */}
      <SectionCard
        icon={HiDeviceMobile}
        title="Active sessions"
        subtitle="Devices currently signed in to your account."
      >
        {sessions.length === 0 ? (
          <p className="py-4 text-center text-sm text-neutral-500">No active sessions.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => {
              const isCurrent = session._id === currentSessionId;
              return (
                <li
                  key={session._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-hairline-soft bg-tint px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-neutral-100">{session.device}</p>
                      {isCurrent && (
                        <span className="shrink-0 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-500">
                          This device
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-neutral-400">
                      {session.ip ? `${session.ip} · ` : ""}last active {timeAgo(session.lastActiveAt)}
                    </p>
                  </div>
                  {!isCurrent && (
                    <Button
                      size="xs"
                      variant="danger"
                      loading={revokingId === session._id}
                      onClick={() => handleRevoke(session._id)}
                    >
                      <HiTrash className="text-sm" /> Revoke
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* ─── Privacy ───────────────────────────────────────────────── */}
      <SectionCard
        icon={hideProfileViews ? HiEyeOff : HiEye}
        title="Privacy"
        subtitle="Control what other developers can see about your activity."
      >
        <div className="flex items-center justify-between gap-4 rounded-xl border border-hairline-soft bg-tint px-4 py-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
              <HiLockClosed className="text-base text-neutral-400" />
              Anonymized browsing
            </p>
            <p className="mt-0.5 text-xs text-neutral-400">
              Don&apos;t record my profile visits in others&apos; &quot;Who viewed me&quot; lists.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={hideProfileViews}
            disabled={privacyBusy}
            onClick={() => handleTogglePrivacy(!hideProfileViews)}
            className={clsx(
              "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200",
              hideProfileViews ? "bg-brand-500" : "bg-neutral-600",
              privacyBusy && "opacity-60"
            )}
          >
            <span
              className={clsx(
                "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all duration-200",
                hideProfileViews ? "right-0.5" : "left-0.5"
              )}
            />
          </button>
        </div>
      </SectionCard>
    </div>
  );
};

export default Settings;
