import client from "./client";

export const login = (credentials) =>
  client.post("/login", credentials).then((r) => r.data.data);

export const register = (emailId) =>
  client.post("/register", { emailId }).then((r) => r.data.data);

export const sendOtp = (email, purpose) =>
  client.post("/send-otp", { email, purpose }).then((r) => r.data.data);

export const verifyOtp = (email, otp, purpose) =>
  client.post("/verify-otp", { email, otp, purpose }).then((r) => r.data.data);

export const completeSignup = (data) =>
  client.post("/complete-signup", data).then((r) => r.data.data);

export const resetPassword = (data) =>
  client.post("/reset-password", data).then((r) => r.data.data);

export const logout = () =>
  client.post("/logout").then((r) => r.data.data);

export const verifyPremium = () =>
  client.get("/premium/verify").then((r) => r.data.data);

// [PHASE-3] two-factor authentication
export const setup2fa = () =>
  client.post("/auth/2fa/setup").then((r) => r.data.data);

export const enable2fa = (token) =>
  client.post("/auth/2fa/enable", { token }).then((r) => r.data.data);

export const disable2fa = (token) =>
  client.post("/auth/2fa/disable", { token }).then((r) => r.data.data);

export const verify2faLogin = (tempToken, token) =>
  client.post("/auth/2fa/verify-login", { tempToken, token }).then((r) => r.data.data);

// [PHASE-3] active session management
export const getSessions = () =>
  client.get("/auth/sessions").then((r) => r.data.data);

export const revokeSession = (sessionId) =>
  client.post("/auth/sessions/revoke", { sessionId }).then((r) => r.data.data);
