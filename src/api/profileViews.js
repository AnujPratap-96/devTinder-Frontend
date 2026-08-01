import client from "./client";

export const getProfileViews = (params = {}) =>
  client.get("/profile/views", { params }).then((r) => r.data.data);

export const verifyPremium = () =>
  client.get("/premium/verify").then((r) => r.data.data);
