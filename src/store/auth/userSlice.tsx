// store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Address {
  city: string;
  state: string;
  street: string;
  zip: string;
}

interface Bank {
  _id: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  dob: string | null;
  address: Address;
  createdAt: string;
  updatedAt: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  referralCode: string;
  referralEarnings: number;
  referralEligible: boolean;
  referredBy: string | null;
  wallet: number;
  maxReferralBonus: number;
  tc: boolean;
  enrolledCourses: any[];
  purchasedCourses: any[];
  fcmToken: string | null;
  profilePicture: string | null;
  phone: string | null;
  bankDetails: Bank[]; // <-- added bank details
  __v: number;
}

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    addBank: (state, action: PayloadAction<Bank>) => {
      if (state.user) {
        state.user.bankDetails.push(action.payload);
      }
    },
    removeBank: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.bankDetails = state.user.bankDetails.filter(
          (bank) => bank._id !== action.payload
        );
      }
    },
  },
});

export const { setUser, clearUser, addBank, removeBank } = userSlice.actions;
export default userSlice.reducer;
