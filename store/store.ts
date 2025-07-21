"use client";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import messageReducer from "./messageSlice";
import contactsReducer from "./contactsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    messages: messageReducer,
    contacts: contactsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
