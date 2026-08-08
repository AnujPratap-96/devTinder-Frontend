import client from "./client";

export const getFeed = (params = {}) =>
  client.get("/feed", { params }).then((r) => r.data.data);

export const searchUsers = (query, signal) =>
  client.get("/search", {
    params: { q: query },
    signal,
  }).then((r) => r.data.data);
