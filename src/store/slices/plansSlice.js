import { createSlice } from "@reduxjs/toolkit";

const plansSlice = createSlice({
  name: "plans",
  initialState: null,
  reducers: {
    setPlans: (state, action) => action.payload,
  },
});

export const { setPlans } = plansSlice.actions;
export default plansSlice.reducer;
