import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => { // Allow null for token
      state.token = action.payload;
      state.isAuthenticated = action.payload !== null; // Set isAuthenticated based on token presence
    },

    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },

    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setToken, setIsAuthenticated, logout } = authSlice.actions;
export default authSlice.reducer;
