/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
    name: "feed",
    initialState: { items: [], nextCursor: null, hasMore: false },
    reducers: {
        addFeed: (state, action) => action.payload,
        removeUserFromFeed: (state, action) => {
            return { ...state, items: state.items.filter((user) => user._id !== action.payload) };
        },
    }
})
export const { addFeed, removeUserFromFeed } = feedSlice.actions;
export default feedSlice.reducer;
