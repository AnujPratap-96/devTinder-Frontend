import client from "./client";

export const getNotifications = (params = {}) =>
  client.get("/notifications", { params }).then((r) => r.data.data);

export const markNotificationRead = (notificationId) =>
  client.patch(`/notifications/${notificationId}/read`).then((r) => r.data.data);

export const markAllNotificationsRead = () =>
  client.patch("/notifications/read-all").then((r) => r.data.data);

export const markNotificationsRead = () =>
  client.patch("/notifications/read").then((r) => r.data.data);

export const deleteNotification = (id) =>
  client.delete(`/notifications/${id}`).then((r) => r.data.data);

export const clearAllNotifications = () =>
  client.delete("/notifications").then((r) => r.data.data);
