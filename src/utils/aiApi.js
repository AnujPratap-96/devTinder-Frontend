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

/** Generate a project description based on title and tech stack */
export const generateProjectDescription = async ({ title, techStack } = {}) => {
  const { data } = await ai.post("/ai/project-description", { title, techStack });
  return data; // { success, data: { description } }
};

/** Suggest a tech stack based on project title and description */
export const suggestProjectTechStack = async ({ title, description } = {}) => {
  const { data } = await ai.post("/ai/project-tech-stack", { title, description });
  return data; // { success, data: { suggestions: string[] } }
};

/** Generate a development roadmap for a project */
export const generateProjectRoadmap = async ({ title, description, techStack, projectId, forceRefresh } = {}) => {
  const { data } = await ai.post("/ai/project-roadmap", { title, description, techStack, projectId, forceRefresh });
  return data; // { success, data: { roadmap: any[], source: 'ai'|'cache' } }
};

/** Suggest project description and tech stack based on title */
export const suggestProjectDetails = async (title) => {
  const { data } = await ai.post("/ai/project-suggestions", { title });
  return data; // { success, data: { description: string, techStack: string[] } }
};

/** Suggest a collaboration activity (Coding Date) between two users */
export const suggestCollaboration = async (targetUserId) => {
  const { data } = await ai.post("/ai/collaboration-activity", { targetUserId });
  return data; // { success, data: { title, description, why } }
};

/** Save a system-level AI config (like Mistral API Key) to the DB */
export const setAIConfig = async (key, value) => {
  const { data } = await ai.post("/ai/config/set", { key, value });
  return data;
};

/** Sync profile data from GitHub repositories */
export const syncGitHubData = async (githubUsername, githubToken = null) => {
  const { data } = await ai.post("/ai/github-sync", { githubUsername, githubToken });
  return data; // { success, data: { bio: string, skills: string[] } }
};
