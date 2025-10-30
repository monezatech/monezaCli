import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingState {
  language: string;
  isDarkMode: boolean;
}

const initialState: SettingState = {
  language: 'en',
  isDarkMode: false,
};

const settingSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    onToggleTheme: state => {
      state.isDarkMode = !state.isDarkMode;
    },
  },
});

export const { setLanguage, onToggleTheme } = settingSlice.actions;
export default settingSlice.reducer;
