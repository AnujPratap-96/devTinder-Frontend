export const formatTimeAgo = (date) => {
  if (!date) return "";
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  
  if (diffSec < 60) {
    return "Just now";
  } else if (diffMin < 60) {
    return `${diffMin}m`;
  } else if (diffHour < 24) {
    return `${diffHour}h`;
  } else if (diffDay === 1) {
    return "Yesterday";
  } else if (diffDay < 7) {
    return `${diffDay}d`;
  } else if (diffWeek < 4) {
    return `${diffWeek}w`;
  } else {
    return past.toLocaleDateString();
  }
};

export const getOnlineStatus = (isOnline, lastSeenAt) => {
  if (isOnline) return "Active now";
  if (lastSeenAt) return `Last seen ${formatTimeAgo(lastSeenAt)}`;
  return "Recently active";
};