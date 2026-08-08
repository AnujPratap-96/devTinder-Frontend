import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
  name: "projects",
  initialState: { items: null, nextCursor: null, hasMore: false },
  reducers: {
    addProjects: (state, action) => action.payload,
    removeProject: (state, action) => {
      if (!state?.items) return state;
      state.items = state.items.filter((project) => project._id !== action.payload);
    },
    updateProject: (state, action) => {
      if (!state?.items) return state;
      const idx = state.items.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    clearProjects: () => ({ items: null, nextCursor: null, hasMore: false }),
  },
});

export const { addProjects, removeProject, updateProject, clearProjects } = projectSlice.actions;
export default projectSlice.reducer;
