import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
  name: "projects",
  initialState: null,
  reducers: {
    addProjects: (state, action) => {
      return action.payload;
    },
    removeProject: (state, action) => {
      if (!state) return null;
      return state.filter((project) => project._id !== action.payload);
    },
    updateProject: (state, action) => {
      if (!state) return null;
      return state.map((project) =>
        project._id === action.payload._id ? { ...project, ...action.payload } : project
      );
    },
    clearProjects: () => {
      return null;
    },
  },
});

export const { addProjects, removeProject, updateProject, clearProjects } = projectSlice.actions;
export default projectSlice.reducer;
