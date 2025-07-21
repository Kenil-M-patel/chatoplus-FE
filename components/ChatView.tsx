import { FaArrowLeft, FaUserAlt } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { ChatViewProps } from "@/constants/constants";
import { ChangeEvent, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export function ChatView({
  isMobileView,
  selectedUser,
  setSelectedUser,
  setShowChatViewMobile,
  currentUser,
  isMessagesLoading,
  messages,
  messagesEndRef,
  handleSendMessage,
  newMessage,
  setNewMessage,
  isTyping,
  handleTyping,
  handleStopTyping,
}: ChatViewProps) {
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (streamingMessage && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [streamingMessage, messages]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    setStreamingMessage(null);
  }, [selectedUser]);

  // Auto-focus input when user is selected or component mounts
  useEffect(() => {
    if (selectedUser && inputRef.current) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedUser]);

  // Refocus input after sending a message
  useEffect(() => {
    if (inputRef.current && messages.length > 0) {
      // Focus input after a short delay to ensure the message was sent
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const markdownComponents = {
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            className="rounded-lg text-xs sm:text-sm"
            wrapLines={true}
            wrapLongLines={true}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code
          className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded font-mono text-xs sm:text-sm break-words"
          {...props}
        >
          {children}
        </code>
      );
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-slate-600 text-xs sm:text-sm">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className="bg-slate-800">{children}</thead>;
    },
    th({ children }) {
      return (
        <th className="border border-slate-600 px-2 py-1 sm:px-4 sm:py-2 text-sky-400 font-semibold">
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td className="border border-slate-600 px-2 py-1 sm:px-4 sm:py-2 text-slate-100 break-words">
          {children}
        </td>
      );
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-sky-500 pl-3 sm:pl-4 italic text-slate-200 text-xs sm:text-sm">
          {children}
        </blockquote>
      );
    },
    ul({ children }) {
      return (
        <ul className="list-disc pl-4 sm:pl-6 space-y-1 text-slate-100 text-xs sm:text-sm">
          {children}
        </ul>
      );
    },
    ol({ children }) {
      return (
        <ol className="list-decimal pl-4 sm:pl-6 space-y-1 text-slate-100 text-xs sm:text-sm">
          {children}
        </ol>
      );
    },
    li({ children }) {
      return <li className="text-slate-100">{children}</li>;
    },
    img({ src, alt }) {
      return (
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="100vw"
          className="rounded-lg w-full max-w-[90%] sm:max-w-[600px] h-auto mx-auto"
        />
      );
    },
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg md:rounded-r-2xl overflow-hidden">
      {/* WhatsApp-style Header */}
      <header className="flex items-center p-3 sm:p-4 bg-gray-50 border-b border-gray-200 shadow-sm sticky top-0 z-10">
        {isMobileView && (
                      <button
              onClick={() => {
                setSelectedUser(null);
                setShowChatViewMobile(false);
              }}
              className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Back to user list"
            >
              <FaArrowLeft className="text-gray-600 text-lg" />
            </button>
        )}
        <div className="flex items-center flex-1">
          {selectedUser.image_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
              <Image
                src={selectedUser.image_url}
                alt={selectedUser.user_name}
                className="w-full h-full object-cover"
                width={40}
                height={40}
                sizes="40px"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
              <FaUserAlt className="text-gray-600 text-lg" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-gray-800 font-semibold text-base">
              {selectedUser.user_name}
            </h2>
            <p className="text-gray-500 text-sm flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  selectedUser.is_online ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
              {selectedUser.is_online ? "online" : "offline"}
            </p>
          </div>
        </div>
      </header>

      {/* WhatsApp-style Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-2">
        {isMessagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500 text-sm">Loading messages...</div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === currentUser?.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] px-3 py-2 rounded-lg shadow-sm ${
                  msg.senderId === currentUser?.id
                    ? "bg-blue-500 text-white rounded-br-md"
                    : "bg-white text-gray-800 rounded-bl-md border border-gray-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {msg.text}
                </p>
                <div
                  className={`text-xs mt-1 opacity-70 ${
                    msg.senderId === currentUser?.id
                      ? "text-right text-blue-100"
                      : "text-left text-gray-500"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 px-4 py-2 rounded-lg rounded-bl-md border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* WhatsApp-style Input */}
      <div className="p-3 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onBlur={handleStopTyping}
            placeholder="Type a message"
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 text-sm placeholder-gray-500 transition-all duration-150"
          />
          <button
            type="submit"
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newMessage.trim()}
            aria-label="Send message"
          >
            <IoSend className="text-lg" />
          </button>
        </form>
      </div>
    </div>
  );
}
