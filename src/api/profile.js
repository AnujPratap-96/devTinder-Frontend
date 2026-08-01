import client from "./client";

export const viewProfile = () =>
  client.get("/profile/view").then((r) => r.data.data);

export const editProfile = (payload) =>
  client.patch("/profile/edit", payload).then((r) => r.data.data);

export const uploadImage = (formData) =>
  client.patch("/profile/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data.data);

export const updateLocation = (lat, lng) =>
  client.patch("/profile/location", { lat, lng }).then((r) => r.data.data);

export const syncGitHub = (githubToken) =>
  client.post("/ai/github-sync", { githubToken }).then((r) => r.data.data);
