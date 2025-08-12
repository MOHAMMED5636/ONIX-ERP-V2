import React, { useState } from "react";
import { UserCircleIcon, GlobeAltIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../LanguageContext";
import TabBar from "./TabBar";
import ActionControls from "./ActionControls";
import MainTable from "./MainTable";
import KanbanBoard from "./KanbanBoard";

export default function TaskList() {
  const [activeTab, setActiveTab] = useState("main-table");
  const { lang, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="w-full bg-white flex flex-col">
      {/* Header Bar with Search, Logo, Chatroom, and Language */}
      <header className="w-full glass-card bg-gradient-to-br from-indigo-50 via-white to-cyan-50 shadow-xl flex items-center px-3 sm:px-6 py-4 z-40 border-b border-indigo-100 backdrop-blur-md">
        {/* Left section: Logo */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/onix-bg.png" alt="Logo" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-gray-200" />
          </div>
        </div>

        {/* Center section: Search bar */}
        <div className="flex-1 min-w-0 flex justify-center items-center max-w-md mx-4">
          {/* Mobile search toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="lg:hidden p-2 focus:outline-none hover:bg-indigo-50 rounded-lg"
            aria-label="Toggle search"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
          </button>
          {/* Desktop search */}
          <div className="hidden lg:flex relative w-full max-w-sm">
            <div className="relative w-full">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gradient-to-br from-indigo-400 to-cyan-400 text-white rounded-full h-8 w-8 shadow search-pop">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder={lang === "ar" ? "بحث..." : "Search..."}
                className="w-full pl-12 pr-4 py-2 rounded-2xl glass-card bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border border-indigo-100 focus:ring-2 focus:ring-indigo-300 focus:outline-none text-sm shadow search-pop transition-all duration-200 focus:border-cyan-400 hover:shadow-lg"
                dir={lang}
              />
            </div>
          </div>
          {/* Mobile search dropdown */}
          {showSearch && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-4 lg:hidden z-50">
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gradient-to-br from-indigo-400 to-cyan-400 text-white rounded-full h-8 w-8 shadow search-pop">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  placeholder={lang === "ar" ? "بحث..." : "Search..."}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl glass-card bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border border-indigo-100 focus:ring-2 focus:ring-indigo-300 focus:outline-none text-sm shadow search-pop transition-all duration-200 focus:border-cyan-400 hover:shadow-lg"
                  dir={lang}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        {/* Right section: Controls */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Chatroom Button */}
          <button
            onClick={() => navigate("/project-chat")}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold shadow border border-blue-200 hover:bg-blue-100 transition pill-pop relative"
            title="Go to Chatroom"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Chatroom</span>
            {/* Notification badge example */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow-sm border-2 border-white">2</span>
          </button>
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold shadow border border-blue-200 hover:bg-blue-100 transition pill-pop relative"
          >
            <GlobeAltIcon className="h-5 w-5" />
            <span className="hidden sm:inline">{lang === "en" ? "EN | ع" : "ع | EN"}</span>
            <span className="sm:hidden">{lang === "en" ? "EN" : "ع"}</span>
          </button>
        </div>
      </header>

      {/* Task Content */}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <ActionControls />
      {activeTab === "main-table" && <MainTable />}
      {activeTab === "kanban" && <KanbanBoard />}
      {/* Other tabs (Cards, Kanban, etc.) will be added here */}

      <style>{`
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); }
        .search-pop { transition: box-shadow 0.3s, border 0.3s, background 0.3s; }
        .search-pop:focus-within, .search-pop:focus, .search-pop:hover { box-shadow: 0 0 0 2px #38bdf8, 0 2px 8px 0 #a5b4fc33; }
        .pill-pop { animation: pillPop 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes pillPop { from { transform: scale(0.9);} to { transform: scale(1);} }
      `}</style>
    </div>
  );
} 