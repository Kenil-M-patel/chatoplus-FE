import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "@/constants/constants";
import axiosInstance from "@/axios/axios";

interface ContactsState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ContactsState = {
  users: [],
  isLoading: false,
  error: null,
};

export const getAllUsers = createAsyncThunk(
  "contacts/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth');
        console.log('response', response);
      return response.users;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch users");
    }
  }
);

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
    },
    updateUserStatus(state, action: PayloadAction<{ userId: string; isOnline: boolean }>) {
      const user = state.users.find(u => u.id === action.payload.userId);
      if (user) {
        user.is_online = action.payload.isOnline;
      }
    },
    updateUserLastMessage(state, action: PayloadAction<{ 
      userId: string; 
      last_message: string; 
      last_message_time: Date; 
    }>) {
      const user = state.users.find(u => u.id === action.payload.userId);
      if (user) {
        user.last_message = action.payload.last_message;
        user.last_message_time = action.payload.last_message_time;
      }
    },
    clearUsers(state) {
      state.users = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload as User[];
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUsers, updateUserStatus, updateUserLastMessage, clearUsers } = contactsSlice.actions;
export default contactsSlice.reducer; 