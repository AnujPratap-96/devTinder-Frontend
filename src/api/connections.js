import client from "./client";

export const getConnections = (params = {}) =>
  client.get("/user/connections", { params }).then((r) => r.data.data);

export const blockUser = (userId) =>
  client.post("/block", { userId }).then((r) => r.data.data);

export const reportUser = (userId, reason, details = "") =>
  client.post("/report", { userId, reason, details }).then((r) => r.data.data);

export const bookmarkUser = (userId) =>
  client.post("/bookmark", { userId }).then((r) => r.data.data);

export const removeBookmark = (userId) =>
  client.delete(`/bookmark/${userId}`).then((r) => r.data.data);

export const endorseSkill = (targetUserId, skill) =>
  client.post("/user/endorse", { targetUserId, skill }).then((r) => r.data.data);

export const recordProfileView = (userId) =>
  client.post(`/profile/view/${userId}`).then((r) => r.data.data);
