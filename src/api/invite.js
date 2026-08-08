import client from "./client";

export const getInviteStats = () =>
  client.get("/invite/stats").then((r) => r.data.data);

export const getInvites = (params = {}) =>
  client.get("/invite/history", { params }).then((r) => r.data.data);

export const sendInvite = (email) =>
  client.post("/invite/send", { email }).then((r) => r.data.data);

export const cancelInvite = (id) =>
  client.delete(`/invite/${id}`).then((r) => r.data.data);
