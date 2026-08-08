import { createSlice } from "@reduxjs/toolkit";

const requestSlice = createSlice({
    name: "request",
    initialState: { items: null, nextCursor: null, hasMore: false },
    reducers: {
        addRequests: (state, action) => action.payload,
        removeRequest: (state, action) => {
            if (!state?.items) return state;
            return { ...state, items: state.items.filter((user) => user._id !== action.payload) };
        }
    }
});

export const { addRequests, removeRequest } = requestSlice.actions;
export default requestSlice.reducer;
