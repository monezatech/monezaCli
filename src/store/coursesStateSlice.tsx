import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CoursesState {
  categoryId: string | null; // <-- Optional clarity
}

const initialState: CoursesState = {
  categoryId: null,
};

const coursesStateSlice = createSlice({
  name: "coursesState",
  initialState,
  reducers: {
    setCategoryId: (state, action: PayloadAction<string | null>) => {
      state.categoryId = action.payload;
    },
    removeCategoryId: (state) => {
      state.categoryId = null;
    },
  },
});

export const { setCategoryId, removeCategoryId } = coursesStateSlice.actions;
export default coursesStateSlice.reducer;
