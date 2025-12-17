import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GlobalState {
    id: string | null;
    type: 'course' | 'bundle' | null;
}

const initialState: GlobalState = {
    id: null,
    type: null,
};

const globalStateSlice = createSlice({
    name: "globalState",
    initialState,
    reducers: {
        setId: (state, action: PayloadAction<string | null>) => {
            state.id = action.payload;
        },
        setType: (state, action: PayloadAction<'course' | 'bundle' | null>) => {
            state.type = action.payload;
        },
        removeId: (state) => {
            state.id = null;
            state.type = null;
        },
    },
});

export const { setId, setType, removeId } = globalStateSlice.actions;
export default globalStateSlice.reducer;
