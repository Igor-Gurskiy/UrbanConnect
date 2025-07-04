import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setCookie, deleteCookie } from "../../../utils/cookies";
import {
  getUserApi,
  // updateUserApi,
  logoutUserApi,
  loginUserApi,
  registerUserApi,
  type TRegisterData,
  type TLoginData,
  type TUser,
} from "../../../utils/urbanConnect-api";

type TProfileState = {
  user: TUser | null;
  isLoadingRegistration: boolean;
  isAuthChecked: boolean;
  error: string | null;
};

export const initialState: TProfileState = {
  user: null,
  isLoadingRegistration: false,
  isAuthChecked: false,
  error: null,
};


export const registerUser = createAsyncThunk(
  "profile/registerUser",
  async (data: TRegisterData) =>
    await registerUserApi(data).then((data) => {
      setCookie("accessToken", data.accessToken, {expires: 3600});
      localStorage.setItem("refreshToken", data.refreshToken);
      return data.user;
    })
)
export const loginUser = createAsyncThunk(
  "profile/loginUser",
  async (data: TLoginData) =>
    await loginUserApi(data).then((data) => {
      const tokenOptions = data.remember ? {expires: 60 * 60 * 24 * 30} : {expires: 60 * 15};
      console.log(data.remember)
      setCookie("accessToken", data.accessToken, tokenOptions);
      localStorage.setItem("refreshToken", data.refreshToken);
    if (data.remember) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }
      return data.user;
    })
);

export const logoutUser = createAsyncThunk(
  "profile/logoutUser",
  async () =>
    await logoutUserApi().then(() => {
      deleteCookie("accessToken");
      localStorage.removeItem("refreshToken");
    })
);

export const getUser = createAsyncThunk("profile/getUser", getUserApi);

export const ProfileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthChecked: (state) => state.isAuthChecked,
    selectError: (state) => state.error,
    selectIsLoadingRegistration: (state) => state.isLoadingRegistration,
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoadingRegistration = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoadingRegistration = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoadingRegistration = false;
        state.error = action.error.message || null;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoadingRegistration = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoadingRegistration = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoadingRegistration = false;
        state.error = action.error.message || null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.error.message || null;
      })
      .addCase(getUser.pending, (state) => {
        state.isAuthChecked = false;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthChecked = true;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.error = action.error.message || null;
        state.isAuthChecked = true;
      })
      // .addCase(updateUser.pending, (state) => {
      //   state.isLoadingRegistration = true;
      // })
      // .addCase(updateUser.fulfilled, (state, action) => {
      //   state.user = action.payload.user;
      // })
      // .addCase(updateUser.rejected, (state, action) => {
      //   state.isLoadingRegistration = false;
      //   state.error = action.error.message || null;
      //   state.user = null;
      // });
  },
});

export const {
  selectUser,
  selectIsAuthChecked,
  selectError,
  selectIsLoadingRegistration,
} = ProfileSlice.selectors;

export const { clearError } = ProfileSlice.actions;

export default ProfileSlice.reducer;
