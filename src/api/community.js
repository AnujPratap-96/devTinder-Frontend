import client from "./client";

export const searchCommunity = (params = {}) =>
  client.get("/community", { params }).then((r) => r.data.data);

export const getDeveloperDetail = (userId) =>
  client.get(`/community/${userId}`).then((r) => r.data.data);
