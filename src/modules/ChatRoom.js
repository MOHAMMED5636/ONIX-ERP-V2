import React, { useEffect, useState, useRef } from "react";
import { useLanguage } from "../LanguageContext";
import ChatUserList from "./ChatUserList";
import ChatWindow from "./ChatWindow";
import ChatMessageInput from "./ChatMessageInput";
import io from "socket.io-client";
import { isSocketClientEnabled, getSocketBaseUrl } from "../utils/socketConfig";

export default function ChatRoom() {
  const { lang } = useLanguage();
  const socketRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [typingUser, setTypingUser] = useState(null);

  useEffect(() => {
    if (!isSocketClientEnabled()) {
      return undefined;
    }
    const socket = io(getSocketBaseUrl(), { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("users", setUsers);
    socket.on("messages", setMessages);
    socket.on("typing", setTypingUser);
    return () => {
      socket.off("users", setUsers);
      socket.off("messages", setMessages);
      socket.off("typing", setTypingUser);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleSend = (msg) => {
    socketRef.current?.emit("message", msg);
  };

  const handleTyping = () => {
    socketRef.current?.emit("typing");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden md:min-h-[500px] min-h-[300px]">
      {!isSocketClientEnabled() && (
        <div className="px-3 py-2 text-sm text-amber-900 bg-amber-50 border-b border-amber-200 shrink-0">
          Live chat is off (no Socket.IO server on the API). To enable, run a socket server and set{' '}
          <code className="text-xs bg-amber-100 px-1 rounded">REACT_APP_ENABLE_SOCKET=true</code> in{' '}
          <code className="text-xs bg-amber-100 px-1 rounded">.env</code>.
        </div>
      )}
      <div className="flex flex-1 min-h-0">
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
    </div>
  );
} 