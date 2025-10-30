import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import globalStateReducer from "./auth/globalStateSlice";
import courseStateReducer from "./coursesStateSlice";
import selectedCourseReducer from "./selectedCourseSlice"
import userReducer from "./auth/userSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    globalState: globalStateReducer,
    courseState: courseStateReducer,
    selectedCourseState: selectedCourseReducer,
    userState: userReducer
  },
});

export type RootState = ReturnType<typeof store.getState>; 
export type AppDispatch = typeof store.dispatch; 

export default store;
