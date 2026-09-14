import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import feedReducer from "./slices/feedSlice";
import connectionReducer from "./slices/connectionSlice";
import requestReducer from "./slices/requestsSlice";
import projectReducer from "./slices/projectSlice";
import callReducer from "./slices/callSlice";
import profileViewReducer from "./slices/profileViewSlice";
import plansReducer from "./slices/plansSlice";
const appStore = configureStore({
  reducer: {
    user: userReducer,
    feed: feedReducer,
    connections: connectionReducer,
    requests: requestReducer,
    projects: projectReducer,
    call: callReducer,
    profileViews: profileViewReducer,
    plans: plansReducer,
  },
});

export default appStore;
