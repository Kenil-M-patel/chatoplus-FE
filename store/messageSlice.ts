import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Message } from "@/constants/constants";
import axiosInstance from "@/axios/axios";

interface MessageState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
}

const initialState: MessageState = {
  messages: [],
  isLoading: false,
  error: null,
  isTyping: false,
};

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (
    { receiverId, text }: { receiverId: string; text: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post('/messages/sendMessage', {
        receiverId,
        text,
      });

      return response.message;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to send message");
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (
    { selectedUserId }: { selectedUserId: string },
    { rejectWithValue }
  ) => {
    try {
      console.log('reach here 2');
      const response = await axiosInstance.get('/messages/messages', {
        params: { selectedUserId },
      });

        console.log('response', response);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch messages");
    }
  }
);

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      // Prevent duplicates
      if (!state.messages.some((m) => m.id === action.payload.id)) {
        state.messages.push(action.payload);
      }
    },
    clearMessages(state) {
      state.messages = [];
    },
    setTyping(state, action: PayloadAction<boolean>) {
      state.isTyping = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (action.payload) {
          state.messages.push(action.payload as Message);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload as Message[];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setMessages, addMessage, clearMessages, setTyping } = messageSlice.actions;
export default messageSlice.reducer; 