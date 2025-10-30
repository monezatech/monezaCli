import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Course {
  _id: string;
  title: string;
  price: number;
  [key: string]: any;
}

interface SelectedCourseState {
  course: Course | null;
}

const initialState: SelectedCourseState = {
  course: null,
};

const selectedCourseSlice = createSlice({
  name: "selectedCourse",
  initialState,
  reducers: {
    setCourse(state, action: PayloadAction<Course>) {
      state.course = action.payload;
    },
    clearCourse(state) {
      state.course = null;
    },
  },
});

export const { setCourse, clearCourse } = selectedCourseSlice.actions;
export default selectedCourseSlice.reducer;
