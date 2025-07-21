"use server";
import { API_URL } from "@/constants/constants";
import { RegisteredUserData } from "@/utils/validationSchema";
import axiosInstance from "@/axios/axios";

export async function handleRegister(userData: RegisteredUserData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  return data;
}

export async function handleLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  console.log('response', response);
  const data = await response.json();
  return data;
}

export async function getAllUsers() {
  try {
    const response = await axiosInstance.get('/auth');
    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      status: "error",
      message: "Failed to fetch users",
    };
  }
}

export async function getMessages(selectedUserId: string) {
  try {
    console.log('reach here ');
    const response = await axiosInstance.get('/messages/messages', {
      params: { selectedUserId },
    });

    return response;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      status: "error",
      message: "Failed to fetch messages",
    };
  }
}

export async function sendMessage(receiverId: string, text: string) {
  try {
    const response = await axiosInstance.post('/messages/sendMessage', {
      receiverId,
      text,
    });
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      status: "error",
      message: "Failed to send message",
    };
  }
}

export async function getAIChatResponse(
  message: string,
  chatHistory: Array<{ role: string; content: string }> = []
) {
  const res = await fetch(`${API_URL}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, chatHistory }),
  });
  if (!res.ok) throw new Error("AI request failed");
  const data = await res.json();
  return data.response;
}
