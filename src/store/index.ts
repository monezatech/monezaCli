import { configureStore, combineReducers } from '@reduxjs/toolkit';
import settingReducer from './SettingSlice';

const rootReducer = combineReducers({
  settings: settingReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
