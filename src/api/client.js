import axios from "axios";
import { BASE_URL } from "../config/constants";
import appStore from "../store/appStore";
import { removeUser } from "../store/userSlice";

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

const getSessionId = () => appStore.getState().user?._id ?? null;

client.interceptors.request.use((config) => {
  config._sessionId = getSessionId();
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      // Fired while logged out (boot/landing without cookies): a 401 is
      // expected. Reject quietly — no refresh attempt, no removeUser. This
      // prevents the pre-login 401 flood AND stops a stale 401 response from
      // racing a fresh login and kicking the user back to the login page.
      if (!originalRequest._sessionId) {
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes("/refresh-token")) {
        if (getSessionId() === originalRequest._sessionId) {
          appStore.dispatch(removeUser());
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => client(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await client.post("/refresh-token");
        processQueue(null);
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (getSessionId() === originalRequest._sessionId) {
          appStore.dispatch(removeUser());
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
