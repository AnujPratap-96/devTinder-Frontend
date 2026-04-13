/**
 * aiApi.js
 * Thin wrapper around all AI backend endpoints.
 * Centralising these calls makes it easy to swap the backend URL or add caching later.
 */

import axios from "axios";
import { BASE_URL } from "./constant";

const ai = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20_000, // AI calls can take a moment
});

/** Generate a professional developer bio */
export const generateBio = async ({ skills, experienceYears, role, interests } = {}) => {
  const { data } = await ai.post("/ai/bio", { skills, experienceYears, role, interests });
  return data; // { success, data: { bio } }
};

/** Suggest in-demand skills based on current skills + role + bio */
export const suggestSkills = async ({ currentSkills, role, about } = {}) => {
  const { data } = await ai.post("/ai/skills", { currentSkills, role, about });
  return data; // { success, data: { suggestions: string[] } }
};

/** Generate a personalised icebreaker message to send to a match */
export const generateIcebreaker = async (receiverId) => {
  const { data } = await ai.post("/ai/icebreaker", { receiverId });
  return data; // { success, data: { message } }
};

/** Explain why the current user and a target user are a good match */
export const explainMatch = async (targetUserId) => {
  const { data } = await ai.post("/ai/match-explanation", { targetUserId });
  return data; // { success, data: { points: string[] } }
};
