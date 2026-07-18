import { HiArrowRight, HiCode } from "react-icons/hi";
import Card from "./ui/Card";
import { highlightText } from "../utils/textUtils.jsx";
import { memo } from "react";

const CompactUserItem = memo(({ user, onView, searchQuery = "" }) => {
  const photo = Array.isArray(user.photoUrl) ? user.photoUrl[0] : (user.photoUrl || user.photo);
  const fallbackPhoto = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`;


  return (
    <Card 
      tone="glass" 
      className="flex items-center justify-between p-4 hover:bg-tint transition-all cursor-pointer border border-hairline-soft active:scale-[0.98]"
      onClick={() => onView(user)}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-brand-500/30">
          <img 
            src={photo || fallbackPhoto} 
            className="h-full w-full object-cover" 
            alt={user.firstName}
            onError={(e) => { e.target.src = fallbackPhoto; }}
          />
          {user.isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-900 bg-success-500" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-neutral-100 truncate">
            {highlightText(`${user.firstName} ${user.lastName}`, searchQuery)}
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5 truncate">
            <span className="shrink-0">{user.role || "Developer"}</span>
            <span className="opacity-30">•</span>
            <div className="flex items-center gap-1 truncate">
              <HiCode className="shrink-0" />
              {highlightText(user.skills?.slice(0, 3).join(", "), searchQuery)}
            </div>
          </div>
        </div>
      </div>

      <button 
        className="flex items-center gap-1.5 rounded-lg bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-500/20"
      >
        View <HiArrowRight className="text-sm" />
      </button>
    </Card>
  );
});

export default CompactUserItem;
