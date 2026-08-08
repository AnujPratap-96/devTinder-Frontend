import client from "./client";

export const getMessages = (userId, params = {}) =>
  client.get(`/chat/${userId}`, { params }).then((r) => r.data.data);

export const sendMessage = (toUserId, text) =>
  client.post("/chat/send", { toUserId, text }).then((r) => r.data.data);

export const markAsSeen = (senderId) =>
  client.patch("/chat/seen", { senderId }).then((r) => r.data.data);

export const getUnreadCount = () =>
  client.get("/chat/unread-count").then((r) => r.data.data);

export const deleteMessage = (messageId) =>
  client.delete(`/messages/${messageId}`).then((r) => r.data.data);

export const getMessagesByMatch = (matchId, params = {}) =>
  client.get(`/messages/${matchId}`, { params }).then((r) => r.data.data);

export const uploadChatFile = (formData, onProgress) =>
  client.post("/chat/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress,
  }).then((r) => r.data.data);
