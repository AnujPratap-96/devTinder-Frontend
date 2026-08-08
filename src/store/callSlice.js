import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: "idle", // idle | outgoing | incoming | connecting | active | ended
  direction: null, // "in" | "out"
  callId: null,
  peer: null, // { _id, firstName, photoUrl }
  type: "voice", // voice | video
  chatId: null,
  muted: false,
  cameraOn: true,
  error: null,
};

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    startOutgoing: (state, action) => {
      state.status = "outgoing";
      state.direction = "out";
      state.callId = action.payload.callId ?? state.callId;
      state.peer = action.payload.peer ?? state.peer;
      state.type = action.payload.type ?? state.type;
      state.chatId = action.payload.chatId ?? state.chatId;
      state.error = null;
    },
    setIncoming: (state, action) => {
      state.status = "incoming";
      state.direction = "in";
      state.callId = action.payload.callId;
      state.peer = action.payload.caller;
      state.type = action.payload.type;
      state.chatId = action.payload.chatId ?? null;
      state.error = null;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setCallId: (state, action) => {
      state.callId = action.payload;
    },
    toggleMute: (state) => {
      state.muted = !state.muted;
    },
    toggleCamera: (state) => {
      state.cameraOn = !state.cameraOn;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetCall: () => initialState,
  },
});

export const {
  startOutgoing,
  setIncoming,
  setStatus,
  setCallId,
  toggleMute,
  toggleCamera,
  setError,
  resetCall,
} = callSlice.actions;

export default callSlice.reducer;
