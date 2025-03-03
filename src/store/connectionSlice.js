/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";


const connectionSlice = createSlice({
    name : "connections",
    initialState : null ,
    reducers : {
        addConnections : (state , action) => action.payload,
        removeConnections : (state , action) => null 
    }
});

export const {addConnections} = connectionSlice.actions;

export default connectionSlice.reducer;