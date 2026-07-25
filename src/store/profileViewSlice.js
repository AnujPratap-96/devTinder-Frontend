import { createSlice } from "@reduxjs/toolkit";

const profileViewSlice = createSlice({
  name: "profileViews",
  initialState: { items: null, nextCursor: null, hasMore: false },
  reducers: {
    addProfileViews: (state, action) => action.payload,
  },
});

export const { addProfileViews } = profileViewSlice.actions;
export default profileViewSlice.reducer;
