import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import ChatRoom from "../components/ChatRoom";

const chatGroups = [
  { id: "contract", name: "Sign the Contract" },
  { id: "architecture", name: "Architecture Concept Design" },
  { id: "test-task-2", name: "Test Task 2" },
];

const initialMessages = {
  contract: [
    { user: "Alice", avatar: "https://ui-avatars.com/api/?name=Alice&background=34d399&color=fff", time: "10:01 AM", text: "Hey team, are we ready for the meeting?" },
    { user: "Bob", avatar: "https://ui-avatars.com/api/?name=Bob&background=60a5fa&color=fff", time: "10:02 AM", text: "Almost! Just finishing up my notes." },
    { user: "Charlie", avatar: "https://ui-avatars.com/api/?name=Charlie&background=fbbf24&color=fff", time: "10:03 AM", text: "I'll join in 2 minutes." },
    { user: "Alice", avatar: "https://ui-avatars.com/api/?name=Alice&background=34d399&color=fff", time: "10:04 AM", text: "Great, see you all there!" },
  ],
  architecture: [
    { user: "Bob", avatar: "https://ui-avatars.com/api/?name=Bob&background=60a5fa&color=fff", time: "09:00 AM", text: "Let's finalize the architecture diagrams today." },
    { user: "Alice", avatar: "https://ui-avatars.com/api/?name=Alice&background=34d399&color=fff", time: "09:05 AM", text: "Agreed! I'll share my notes soon." },
  ],
  "test-task-2": [
    { user: "Charlie", avatar: "https://ui-avatars.com/api/?name=Charlie&background=fbbf24&color=fff", time: "11:00 AM", text: "Test Task 2 is almost done." },
    { user: "Bob", avatar: "https://ui-avatars.com/api/?name=Bob&background=60a5fa&color=fff", time: "11:10 AM", text: "Great work, Charlie!" },
  ],
};

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ProjectChatApp() {
  const [activeChat, setActiveChat] = useState(chatGroups[0].id);
  const [messages, setMessages] = useState(initialMessages);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    const newMsg = {
      user: "Alice",
      avatar: "https://ui-avatars.com/api/?name=Alice&background=34d399&color=fff",
      time: getCurrentTime(),
      text,
    };
    setMessages((prev) => {
      const updated = { ...prev };
      updated[activeChat] = [...(updated[activeChat] || []), newMsg];
      return updated;
    });
    // Simulate AI bot response
    setTimeout(() => {
      const aiMsg = {
        user: "AI Bot",
        avatar: "https://ui-avatars.com/api/?name=AI+Bot&background=6366f1&color=fff",
        time: getCurrentTime(),
        text: `AI Bot: You said, "${text}". How can I assist you further?`,
      };
      setMessages((prev) => {
        const updated = { ...prev };
        updated[activeChat] = [...(updated[activeChat] || []), aiMsg];
        return updated;
      });
    }, 1200);
  };

  const activeChatGroup = chatGroups.find(group => group.id === activeChat);

  return (
    <div className="w-full h-full flex bg-gray-50 overflow-hidden">
      {/* Main Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Project Chat Groups Sidebar - Responsive */}
      <div className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative z-30 w-64 lg:w-64 bg-white border-r border-gray-100 flex flex-col 
        transition-transform duration-300 ease-in-out h-full
      `}>
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          <h2 className="text-lg font-semibold text-gray-800">Project Chats</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-2 text-xs font-bold text-gray-500 px-4 uppercase tracking-wide hidden lg:block">
          Project Chats
        </div>
        
        <ul className="flex-1 space-y-1 overflow-y-auto p-2">
          {chatGroups.map((group) => (
            <li key={group.id}>
              <button
                className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition font-medium
                  ${activeChat === group.id 
                    ? "bg-blue-100 text-blue-900 font-semibold" 
                    : "hover:bg-gray-100 text-gray-700"
                  }
                `}
                onClick={() => {
                  setActiveChat(group.id);
                  setShowSidebar(false); // Close sidebar on mobile after selection
                }}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                <span className="truncate">{group.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-full min-w-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="font-semibold text-gray-900 text-lg">
                {activeChatGroup?.name || 'Project Chat'}
              </h1>
              <p className="text-sm text-gray-500">Active conversation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ChatHeader />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatRoom messages={messages[activeChat] || []} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
} 