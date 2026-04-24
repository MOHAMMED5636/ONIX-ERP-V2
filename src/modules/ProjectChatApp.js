import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getProjects } from "../services/projectsAPI";
import {
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  VideoCameraIcon,
  PhoneIcon,
  XMarkIcon,
  Bars3Icon,
  FaceSmileIcon,
} from "@heroicons/react/24/outline";

const initialMessages = {};

function formatListTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function projectToChatGroup(project) {
  const name = project.name || "Untitled project";
  const clientName =
    typeof project.client === "string"
      ? project.client
      : project.client?.name || "";
  return {
    id: project.id,
    name,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name.slice(0, 2) || "P"
    )}&background=6366f1&color=fff&rounded=true&size=128`,
    lastMessage: clientName ? `Client: ${clientName}` : "Team project chat",
    time: formatListTime(project.updatedAt) || formatListTime(project.createdAt),
    unread: 0,
  };
}

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ProjectChatApp() {
  const { user } = useAuth();
  const [chatGroups, setChatGroups] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState(initialMessages);
  const [showSidebar, setShowSidebar] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    setProjectsError("");
    try {
      const response = await getProjects();
      if (response?.success && Array.isArray(response.data)) {
        const groups = response.data.map(projectToChatGroup);
        setChatGroups(groups);
      } else {
        setChatGroups([]);
        setProjectsError(response?.message || "No projects returned");
      }
    } catch (e) {
      setChatGroups([]);
      setProjectsError(e.message || "Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (chatGroups.length === 0) {
      setActiveChat(null);
      return;
    }
    setActiveChat((prev) =>
      prev != null && chatGroups.some((g) => g.id === prev)
        ? prev
        : chatGroups[0].id
    );
  }, [chatGroups]);

  const handleSendMessage = (text) => {
    if (!activeChat || !text.trim()) return;
    const newMsg = {
      id: Date.now(),
      user: user?.name || "You",
      avatar: user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`,
      time: getCurrentTime(),
      text,
    };
    setMessages((prev) => {
      const updated = { ...prev };
      updated[activeChat] = [...(updated[activeChat] || []), newMsg];
      return updated;
    });
    setInput("");
    const preview = text.trim().slice(0, 72);
    setChatGroups((prev) =>
      prev.map((g) =>
        g.id === activeChat
          ? { ...g, lastMessage: preview, time: "Now", unread: 0 }
          : g
      )
    );
  };

  const activeChatGroup = chatGroups.find(group => group.id === activeChat);
  const currentMessages = useMemo(() => {
    const m = messages[activeChat];
    return Array.isArray(m) ? m : [];
  }, [messages, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const filteredGroups = chatGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (!activeChat) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  return (
    <div className="w-full h-full flex bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Chat Groups Sidebar */}
      <div className={`
        ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative z-30 w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col 
        transition-transform duration-300 ease-in-out h-full shadow-lg lg:shadow-none
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-7 h-7" />
              Project Chats
            </h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/95 backdrop-blur-sm rounded-xl border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>
        
        {/* Chat Groups List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-1">
            {loadingProjects ? (
              <div className="space-y-3 px-1 py-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex gap-3 p-3 rounded-xl bg-gray-100/80"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2 py-0.5">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2 bg-gray-200 rounded w-full" />
                      <div className="h-2 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projectsError ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <p className="text-gray-600 text-sm mb-3">{projectsError}</p>
                <button
                  type="button"
                  onClick={loadProjects}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">
                  {searchQuery.trim()
                    ? "No projects match your search"
                    : "No project chats available"}
                </p>
              </div>
            ) : (
              filteredGroups.map((group) => {
              const isActive = activeChat === group.id;
              return (
                <button
                  key={group.id}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group
                    ${isActive 
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-md" 
                      : "hover:bg-gray-50 border-2 border-transparent"
                    }
                  `}
                  onClick={() => {
                    setActiveChat(group.id);
                    setShowSidebar(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${isActive ? 'ring-2 ring-indigo-300' : ''}`}>
                      <img 
                        src={group.avatar} 
                        alt={group.name}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold text-sm truncate ${isActive ? 'text-indigo-900' : 'text-gray-900'}`}>
                          {group.name}
                        </h3>
                        {group.unread > 0 && !isActive && (
                          <span className="flex-shrink-0 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {group.unread}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${isActive ? 'text-gray-600' : 'text-gray-500'}`}>
                        {group.lastMessage}
                      </p>
                      <p className={`text-xs mt-1 ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                        {group.time}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Mobile title row */}
          <div className="lg:hidden flex items-center gap-2 px-3 py-3 border-b border-gray-100 bg-white shrink-0">
            <button
              type="button"
              onClick={() => setShowSidebar(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Open project list"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <span className="font-semibold text-gray-900 truncate text-sm">
              {activeChatGroup?.name || "Project Chats"}
            </span>
          </div>

          {!activeChat ? (
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="text-center max-w-sm">
                <ChatBubbleLeftRightIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No chat selected</h2>
                <p className="text-gray-500 text-sm">
                  Select a project from the sidebar, or add a project in Tasks if the list is empty.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden ring-2 ring-indigo-100">
                      <img
                        src={
                          activeChatGroup?.avatar ||
                          "https://ui-avatars.com/api/?name=Project&background=6366f1&color=fff"
                        }
                        alt={activeChatGroup?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="font-bold text-gray-900 text-lg truncate">
                        {activeChatGroup?.name || "Project Chat"}
                      </h1>
                      <p className="text-sm text-gray-500">
                        Active conversation • {currentMessages.length} messages
                      </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-indigo-600 transition-colors"
                    title="Voice Call"
                  >
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-indigo-600 transition-colors"
                    title="Video Call"
                  >
                    <VideoCameraIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-indigo-600 transition-colors"
                    title="More options"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-gray-50 to-white px-4 lg:px-8 py-6">
                <div className="max-w-4xl mx-auto space-y-4">
                  {currentMessages.length === 0 && (
                    <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-gray-200 bg-white/60">
                      <p className="text-gray-600 text-sm font-medium mb-1">Start the conversation</p>
                      <p className="text-gray-400 text-xs">
                        Messages are stored in this session only until a chat backend is connected.
                      </p>
                    </div>
                  )}
                  {currentMessages.map((msg) => {
                    const isMe = msg.user === (user?.name || "You");
                    const isBot = msg.user === "AI Bot";

                    return (
                      <div
                        key={msg.id}
                        className={`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
                      >
                        <div
                          className={`flex items-end gap-3 max-w-[75%] lg:max-w-[60%] ${
                            isMe ? "flex-row-reverse" : ""
                          }`}
                        >
                          {!isMe && (
                            <img
                              src={msg.avatar}
                              alt={msg.user}
                              className={`w-8 h-8 rounded-full shadow-md border-2 border-white flex-shrink-0 ${
                                isBot ? "ring-2 ring-purple-400" : ""
                              }`}
                            />
                          )}

                          <div
                            className={`flex flex-col ${
                              isMe ? "items-end" : "items-start"
                            } min-w-0 flex-1`}
                          >
                            {!isMe && (
                              <div className="text-xs font-semibold text-gray-600 mb-1 px-1">
                                {msg.user}
                              </div>
                            )}
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-sm break-words
                          ${
                            isMe
                              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-md"
                              : isBot
                                ? "bg-purple-100 text-purple-900 rounded-bl-md border border-purple-200"
                                : "bg-white text-gray-800 rounded-bl-md border border-gray-200 shadow-md"
                          }
                        `}
                            >
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
                            </div>
                            <span className="text-xs text-gray-400 mt-1.5 px-1">{msg.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Chat footer — always visible */}
        <div
          className={`shrink-0 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/90 px-4 lg:px-6 pt-3 pb-4 shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.08)] ${
            !activeChat ? "opacity-90" : ""
          }`}
        >
          <div className="max-w-4xl mx-auto">
            <div
              className={`flex items-end gap-2 sm:gap-3 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 border-2 transition-all ${
                activeChat
                  ? "bg-gray-50/90 border-gray-200 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100/80"
                  : "bg-gray-100 border-gray-200"
              }`}
            >
              <button
                type="button"
                disabled={!activeChat}
                className="flex-shrink-0 p-2 rounded-xl text-gray-500 hover:bg-gray-200 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                title="Attach file"
              >
                <PaperClipIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                disabled={!activeChat}
                className="flex-shrink-0 p-2 rounded-xl text-gray-500 hover:bg-gray-200 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:pointer-events-none hidden sm:inline-flex"
                title="Emoji"
              >
                <FaceSmileIcon className="w-5 h-5" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!activeChat}
                placeholder={
                  activeChat
                    ? "Write a message…"
                    : "Select a project to send a message…"
                }
                rows={1}
                className="flex-1 bg-transparent border-0 focus:outline-none resize-none text-gray-800 placeholder-gray-400 text-sm leading-relaxed disabled:cursor-not-allowed min-h-[40px] max-h-[120px]"
              />
              <button
                type="button"
                className={`flex-shrink-0 p-2.5 rounded-xl font-semibold transition-all ${
                  activeChat && input.trim()
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                onClick={() => handleSendMessage(input)}
                disabled={!activeChat || !input.trim()}
                title="Send"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-2 text-center">
              {activeChat
                ? "Enter to send · Shift+Enter for a new line"
                : "Choose a project chat on the left to enable messaging"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
