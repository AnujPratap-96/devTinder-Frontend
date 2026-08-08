import client from "./client";

export const getAdminUsers = (params = {}) =>
  client.get("/admin/users", { params }).then((r) => r.data.data);

export const getAdminUserDetail = (userId) =>
  client.get(`/admin/users/${userId}`).then((r) => r.data.data);

export const banUser = (userId) =>
  client.post("/admin/ban", { userId }).then((r) => r.data.data);

export const unbanUser = (userId) =>
  client.post("/admin/unban", { userId }).then((r) => r.data.data);

export const getAdminBannedUsers = () =>
  client.get("/admin/banned").then((r) => r.data.data);

export const getAdminReports = () =>
  client.get("/admin/reports").then((r) => r.data.data);

export const updateReportStatus = (id, status) =>
  client.patch(`/admin/reports/${id}`, { status }).then((r) => r.data.data);

export const getAdminPlans = () =>
  client.get("/admin/plans").then((r) => r.data.data);

export const createAdminPlan = (payload) =>
  client.post("/admin/plans", payload).then((r) => r.data.data);

export const updateAdminPlan = (id, payload) =>
  client.patch(`/admin/plans/${id}`, payload).then((r) => r.data.data);

export const deleteAdminPlan = (id) =>
  client.delete(`/admin/plans/${id}`).then((r) => r.data.data);
