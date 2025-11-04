import { configureStore, combineReducers } from '@reduxjs/toolkit';
import settingReducer from './SettingSlice';
import authReducer from "./auth/authSlice";
import globalStateReducer from "./auth/globalStateSlice";
import courseStateReducer from "./coursesStateSlice";
import selectedCourseReducer from "./selectedCourseSlice"
import userReducer from "./auth/userSlice"

const rootReducer = combineReducers({
  settings: settingReducer,
  auth: authReducer,
  globalState: globalStateReducer,
  courseState: courseStateReducer,
  selectedCourseState: selectedCourseReducer,
  userState: userReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
