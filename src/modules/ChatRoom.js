import React, { useEffect, useState, useRef } from "react";
import { useLanguage } from "../LanguageContext";
import ChatUserList from "./ChatUserList";
import ChatWindow from "./ChatWindow";
import ChatMessageInput from "./ChatMessageInput";
import io from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || "http://192.168.1.54:3001"); // Backend URL

export default function ChatRoom() {
  const { t, lang } = useLanguage();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    socket.on("users", setUsers);
    socket.on("messages", setMessages);
    socket.on("typing", setTypingUser);
    return () => {
      socket.off("users");
      socket.off("messages");
      socket.off("typing");
    };
  }, []);

  const handleSend = (msg) => {
    socket.emit("message", msg);
  };

  const handleTyping = () => {
    socket.emit("typing");
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden md:min-h-[500px] min-h-[300px]">
      <ChatUserList users={users} onSelect={setSelectedUser} selectedUser={selectedUser} />
      <div className="flex flex-col flex-1">
        <ChatWindow
          messages={messages}
          typingUser={typingUser}
          lang={lang}
        />
        <ChatMessageInput
          onSend={handleSend}
          onTyping={handleTyping}
          lang={lang}
        />
      </div>
    </div>
  );
} 