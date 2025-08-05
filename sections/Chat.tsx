"use client";

import { ChatView } from "@/components/ChatView";
import { NoChatSelectedView } from "@/components/NoChatSelectedView";
import {  Message, User, UserInfo } from "@/constants/constants";
import { logout } from "@/store/authSlice";
import { RootState } from "@/store/ReduxProvider";
import { handleError } from "@/utils/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import Sidebar from "./Sidebar";
import { sendMessage, fetchMessages, addMessage,  clearMessages, setTyping } from "@/store/messageSlice";
import { updateUserStatus, updateUserLastMessage } from "@/store/contactsSlice";
import { AppDispatch } from "@/store/store";

export default function ChatPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatViewMobile, setShowChatViewMobile] = useState(false);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const dispatch = useDispatch<AppDispatch>();
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const messages = useSelector((state: RootState) => state.messages.messages);
  const isMessagesLoading = useSelector((state: RootState) => state.messages.isLoading);
  const isTyping = useSelector((state: RootState) => state.messages.isTyping);
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        dispatch(logout());
        router.push("/login");
      }
    } else {
      setCurrentUser(null);
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    console.log(token)
    socketRef.current = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, 
      {
      auth: { token: `Bearer ${token}` },
      path: "/service2/socket.io/",
      transports: ['websocket', 'polling'],
    });
    const socket = socketRef.current;
    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket error:", error.message);
      if (error.message.includes("token")) {
        dispatch(logout());
        router.push("/login");
      }
    });

    socket.on("error", ({ message }) => {
      handleError(message);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, router, dispatch]);

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    const handleUserStatus = ({
      userId,
      isOnline,
    }: {
      userId: number;
      isOnline: boolean;
    }) => {
      dispatch(updateUserStatus({ userId: String(userId), isOnline }));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) =>
          prev ? { ...prev, is_online: isOnline } : null
        );
      }
    };
    const handleMessage = (message: Message) => {
      console.log(message)
      if (
        selectedUser &&
        (message.senderId === selectedUser.id || message.senderId === currentUser?.id)
      ) {
        dispatch(addMessage({ ...message, timestamp: new Date(message.timestamp) }));
      }
    };
    const handleUserUpdate = ({
      userId,
      last_message,
      last_message_time,
    }: {
      userId: number;
      last_message: string;
      last_message_time: Date;
    }) => {
      if (userId !== currentUser?.id) {
        dispatch(updateUserLastMessage({ userId: String(userId), last_message, last_message_time }));
      }

      if (selectedUser?.id === userId) {
    dispatch(
      addMessage({
        id: crypto.randomUUID() as unknown as number, // Force type to number
        senderId: String(userId),
        text: last_message,
        timestamp: last_message_time,
      })
    );
  }

    };
    const handleTyping = ({ userId }: { userId: number }) => {
      if (selectedUser && userId === selectedUser.id) {
        dispatch(setTyping(true));
      }
    };
    const handleStopTyping = ({ userId }: { userId: number }) => {
      if (selectedUser && userId === selectedUser.id) {
        dispatch(setTyping(false));
      }
    };
    socket.on("userStatus", handleUserStatus);
    socket.on("message", handleMessage);
    socket.on("userUpdate", handleUserUpdate);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
  }, [selectedUser, currentUser, dispatch]);

  useEffect(() => {
    if (selectedUser && currentUser) {
      dispatch(fetchMessages({ selectedUserId: String(selectedUser.id) }));
      console.log('hell');
      socketRef.current?.emit("joinChat", selectedUser.id);
      if (isMobileView) setShowChatViewMobile(true);
    } else {
      dispatch(clearMessages());
      if (isMobileView) setShowChatViewMobile(false);
    }
  }, [selectedUser, currentUser, isMobileView, dispatch]);


  useEffect(() => {
    if (messages?.length && !isMessagesLoading) {
      // Auto-scroll to bottom when messages change (new message sent or received)
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, isMessagesLoading]);

const handleSendMessage = async (e: FormEvent) => {
  e.preventDefault();
  if (!newMessage.trim() || !selectedUser || !currentUser) return;
  await dispatch(sendMessage({ receiverId: String(selectedUser.id), text: newMessage }));
  setNewMessage("");
  (e.target as HTMLFormElement).querySelector("input")?.blur();
};

  const handleTyping = () => {
    if (selectedUser && socketConnected) {
      socketRef.current?.emit("typing", { receiverId: selectedUser.id });
    }
  };
  const handleStopTyping = () => {
    if (selectedUser && socketConnected) {
      socketRef.current?.emit("stopTyping", { receiverId: selectedUser.id });
    }
  };

  return (
    <div className="flex h-screen antialiased text-gray-800 bg-white">
      <Sidebar
        token={token}
        setUsers={setUsers}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        isMobileView={isMobileView}
        users={users}
        currentUser={currentUser}
        setShowChatViewMobile={setShowChatViewMobile}
        showChatViewMobile={showChatViewMobile}
      />
      <main
        className={`flex-1 ${
          isMobileView && !showChatViewMobile ? "hidden" : "flex"
        } flex-col md:my-2 md:mr-2`}
      >
        {selectedUser ? (
          <ChatView
            key={selectedUser.id}
            isMobileView={isMobileView}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            setShowChatViewMobile={setShowChatViewMobile}
            currentUser={currentUser}
            isMessagesLoading={isMessagesLoading}
            messages={messages}
            messagesEndRef={messagesEndRef}
            handleSendMessage={handleSendMessage}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleTyping={handleTyping}
            handleStopTyping={handleStopTyping}
            isTyping={isTyping}
          />
        ) : (
          <NoChatSelectedView key="nochat_placeholder" />
        )}
      </main>
    </div>
  );
}
