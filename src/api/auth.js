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
