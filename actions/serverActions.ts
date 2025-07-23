"use server";
// import { API_URL } from "@/constants/constants";
import { RegisteredUserData } from "@/utils/validationSchema";
import axiosInstance from "@/axios/axios";

export async function handleRegister(userData: RegisteredUserData) {
  const response = await axiosInstance.post('/auth/register');
  const data =  response;
  return data;
}

export async function handleLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const response = await axiosInstance.post('/auth/login');
  const data =  response;
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


