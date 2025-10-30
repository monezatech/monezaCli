import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GlobalState {
    id: string | null;
}

const initialState: GlobalState = {
    id: null,
};

const globalStateSlice = createSlice({
    name: "globalState",
    initialState,
    reducers: {
        setId: (state, action: PayloadAction<string | null>) => {
            state.id = action.payload;
        },
        removeId: (state) => {
            state.id = null;
        },
    },
});

export const { setId, removeId } = globalStateSlice.actions;
export default globalStateSlice.reducer;
