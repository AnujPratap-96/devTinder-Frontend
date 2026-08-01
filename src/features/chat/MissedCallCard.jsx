/**
 * MissedCallCard.jsx — renders missed-call cards inside the chat.
 * Uses the existing /calls/missed endpoint, filtered to the current chat.
 */
import { useEffect, useState } from "react";
import { HiPhoneMissedCall } from "react-icons/hi";
import { getMissedCalls } from "./enhancementApi";

const MissedCallCard = ({ matchId, onCallBack }) => {
  const [missed, setMissed] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getMissedCalls()
      .then((data) => {
        if (cancelled) return;
        const list = (data.calls || [])
          .filter((c) => c.chatId?.toString() === String(matchId))
          .slice(0, 5);
        setMissed(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  if (!missed.length) return null;

  return (
    <div className="mb-3 space-y-1.5 px-6">
      {missed.map((call) => (
        <div
          key={call._id}
          className="mx-auto flex w-fit items-center gap-2 rounded-full bg-surface-800/60 px-4 py-1.5 text-xs text-neutral-400"
        >
          <HiPhoneMissedCall className="text-error-400" />
          <span>
            Missed {call.type} call · {new Date(call.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {onCallBack && (
            <button
              type="button"
              onClick={onCallBack}
              className="font-semibold text-brand-400 transition hover:text-brand-300"
            >
              Call back
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MissedCallCard;
