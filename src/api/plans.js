import client from "./client";

export const getPlans = () =>
  client.get("/plans").then((r) => r.data.data);

export const createPaymentOrder = (slug) =>
  client.post("/payment/create", { membershipType: slug }).then((r) => r.data.data);
