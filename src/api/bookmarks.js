import client from "./client";

export const getBookmarks = (params = {}) =>
  client.get("/bookmarks", { params }).then((r) => r.data.data);
