import client from "./client";

export const getReceivedRequests = (params = {}) =>
  client.get("/user/requests/received", { params }).then((r) => r.data.data);

export const reviewRequest = (status, requestId) =>
  client.post(`/request/review/${status}/${requestId}`).then((r) => r.data.data);

export const sendRequest = (status, userId) =>
  client.post(`/request/send/${status}/${userId}`).then((r) => r.data.data);
