import client from "./client";

export const getProjects = (params = {}) =>
  client.get("/projects", { params }).then((r) => r.data.data);

export const createProject = (data) =>
  client.post("/project", data).then((r) => r.data.data);

export const createProjectWithForm = (formData) =>
  client.post("/project", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data.data);

export const updateProject = (id, data) =>
  client.patch(`/project/${id}`, data).then((r) => r.data.data);

export const deleteProject = (id) =>
  client.delete(`/project/${id}`).then((r) => r.data.data);

export const getProjectMessages = (projectId, params = {}) =>
  client.get(`/project/${projectId}/messages`, { params }).then((r) => r.data.data);

export const sendProjectMessage = (projectId, data) =>
  client.post(`/project/${projectId}/message`, data).then((r) => r.data.data);

export const removeProjectMember = (projectId, memberId) =>
  client.delete(`/project/${projectId}/member/${memberId}`).then((r) => r.data.data);

export const joinProject = (projectId) =>
  client.post("/project/request", { projectId }).then((r) => r.data.data);

export const respondToJoinRequest = (projectId, requestId, action) =>
  client.post("/project/request/respond", { projectId, requestId, action }).then((r) => r.data.data);
