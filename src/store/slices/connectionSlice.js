/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";

const connectionSlice = createSlice({
  name: "connections",
  initialState: { items: null, nextCursor: null, hasMore: false },
  reducers: {
    addConnections: (state, action) => action.payload,
    removeConnection: (state, action) => {
      if (!state?.items) return state;
      return { ...state, items: state.items.filter((connection) => connection._id !== action.payload) };
    },
    clearConnections: () => ({ items: null, nextCursor: null, hasMore: false }),
  },
});

export const { addConnections, removeConnection, clearConnections } = connectionSlice.actions;
export default connectionSlice.reducer;
