import client from "./client";

export const generateBio = (payload) =>
  client.post("/ai/generate-bio", payload).then((r) => r.data.data);

export const improveSkills = (payload) =>
  client.post("/ai/improve-skills", payload).then((r) => r.data.data);

export const generateProjectDesc = (payload) =>
  client.post("/ai/generate-project-description", payload).then((r) => r.data.data);

export const suggestTechStack = (payload) =>
  client.post("/ai/suggest-tech-stack", payload).then((r) => r.data.data);

export const generateRoadmap = (payload) =>
  client.post("/ai/generate-roadmap", payload).then((r) => r.data.data);

export const suggestProjectDetails = (payload) =>
  client.post("/ai/suggest-project-details", payload).then((r) => r.data.data);

export const getMatchExplanation = (targetUserId) =>
  client.get(`/ai/match-explanation/${targetUserId}`).then((r) => r.data.data);

export const generateIcebreaker = (targetUserId) =>
  client.get(`/ai/icebreaker/${targetUserId}`).then((r) => r.data.data);

export const suggestCollaboration = (targetUserId) =>
  client.get(`/ai/collaboration/${targetUserId}`).then((r) => r.data.data);
