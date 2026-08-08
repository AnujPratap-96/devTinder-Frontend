/**
 * enhancementApi.js — Phase-1 chat enhancement API calls.
 * All endpoints are additive (/chat/enhance/*) and never touch existing ones.
 */
import client from "../../api/client";

export const uploadVoiceNote = (formData, onProgress) =>
  client
    .post("/chat/enhance/voice-note", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress,
    })
    .then((r) => r.data.data);

export const searchMessages = (matchId, { query = "", pinned = false, limit } = {}) =>
  client
    .get("/chat/enhance/messages/search", {
      params: { matchId, q: query, pinned, limit },
    })
    .then((r) => r.data.data);

export const togglePinMessage = (messageId) =>
  client.patch(`/chat/enhance/messages/${messageId}/pin`).then((r) => r.data.data);

export const getChatPrefs = () => client.get("/chat/enhance/prefs").then((r) => r.data.data);

export const setChatPref = (matchId, { pinned, muted }) =>
  client.patch("/chat/enhance/prefs", { matchId, pinned, muted }).then((r) => r.data.data);

export const getMissedCalls = () => client.get("/calls/missed").then((r) => r.data.data);
