/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";


const connectionSlice = createSlice({
  name: "connections",
  initialState: null,
  reducers: {
    addConnections: (state, action) => action.payload,
    removeConnection: (state, action) => {
      if (!state) return null;
      return state.filter((connection) => connection._id !== action.payload);
    },
    clearConnections: (state) => null,
  },
});

export const { addConnections, removeConnection, clearConnections } = connectionSlice.actions;

export default connectionSlice.reducer;