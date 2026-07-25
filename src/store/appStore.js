import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import feedReducer from "./feedSlice";
import connectionReducer from "./connectionSlice";
import requestReducer from "./requestsSlice";
import projectReducer from "./projectSlice";
import callReducer from "./callSlice";
import profileViewReducer from "./profileViewSlice";
import plansReducer from "./plansSlice";
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
