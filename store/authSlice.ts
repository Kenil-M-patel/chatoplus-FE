/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import axiosInstance from "@/axios/axios";
import { AuthState as BaseAuthState } from "@/constants/constants";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RegisteredUserData } from "@/utils/validationSchema";

const storedUser =
  typeof window !== "undefined" ? localStorage.getItem("user") : null;
const storedToken =
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
// interface AuthResponse {
//   user: any; // Replace with your actual user type
//   token: string;
//   message?: string;
// }

type AuthState = BaseAuthState & {
  isLoading: boolean;
  error: string | null;
  users?: [];
};

const initialState: AuthState = {
  isAuthenticated: !!storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isLoading: false,
  error: null,
  users: [], // You can optionally remove this if you're not using it
};

// Thunks
export const handleLoginThunk = createAsyncThunk<
  any,
  { email: string; password: string }
>(
  "auth/handleLogin",
  async (
    { email, password },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.message || "Login failed"
      );
    }
  }
);

export const handleRegisterThunk = createAsyncThunk<any, RegisteredUserData>(
  "auth/handleRegister",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.message || "Registration failed"
      );
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ user: AuthState["user"]; token: string }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleLoginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleLoginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", action.payload.token);
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(handleLoginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(handleRegisterThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleRegisterThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", action.payload.token);
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(handleRegisterThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
