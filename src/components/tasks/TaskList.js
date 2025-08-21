import React, { useState, useEffect } from "react";
import { 
  UserCircleIcon, 
  GlobeAltIcon, 
  MagnifyingGlassIcon, 
  ChatBubbleLeftRightIcon, 
  Bars3Icon,
  SparklesIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
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
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0
  });

  // Simulate loading and fetch stats
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setStats({
        total: 156,
        completed: 89,
        inProgress: 42,
        pending: 25
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Enhanced Header Bar */}
      <header className="flex-shrink-0 w-full bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 flex items-center px-3 sm:px-6 py-4 z-40 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 flex items-center w-full">
          {/* Left section: Enhanced Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 group">
              <div className="relative">
                <img 
                  src="/onix-bg.png" 
                  alt="Logo" 
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl border-2 border-white/50 shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-xl" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Task Management
                </h1>
                <p className="text-xs text-gray-500">Project Dashboard</p>
              </div>
            </div>
          </div>

          {/* Center section: Enhanced Search bar */}
          <div className="flex-1 min-w-0 flex justify-center items-center max-w-md mx-4">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="lg:hidden p-2 focus:outline-none hover:bg-white/50 rounded-xl transition-all duration-200"
              aria-label="Toggle search"
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="hidden lg:flex relative w-full max-w-sm">
              <div className="relative w-full group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl h-9 w-9 shadow-lg group-hover:scale-110 transition-all duration-300">
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  placeholder={lang === "ar" ? "بحث في المهام..." : "Search tasks..."}
                  className="w-full pl-14 pr-4 py-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm shadow-lg transition-all duration-300 focus:bg-white hover:bg-white/90 group-hover:shadow-xl"
                  dir={lang}
                />
              </div>
            </div>
            {showSearch && (
              <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-white/20 p-4 lg:hidden z-50 rounded-b-2xl shadow-xl">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl h-9 w-9 shadow-lg">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder={lang === "ar" ? "بحث في المهام..." : "Search tasks..."}
                    className="w-full pl-14 pr-4 py-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm shadow-lg transition-all duration-300 focus:bg-white"
                    dir={lang}
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right section: Enhanced Controls */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Enhanced Chatroom Button */}
            <button
              onClick={() => navigate("/project-chat")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative group"
              title="Go to Chatroom"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="hidden sm:inline">Chatroom</span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold shadow-lg border-2 border-white animate-pulse">2</span>
            </button>
            
            {/* Enhanced Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/50"
            >
              <GlobeAltIcon className="h-5 w-5" />
              <span className="hidden sm:inline">{lang === "en" ? "EN | ع" : "ع | EN"}</span>
              <span className="sm:hidden">{lang === "en" ? "EN" : "ع"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Enhanced Task Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Stats Dashboard */}
        {!isLoading && (
          <div className="flex-shrink-0 p-4 bg-white/60 backdrop-blur-sm border-b border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Completed</p>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                  </div>
                  <CheckCircleIcon className="h-8 w-8 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">In Progress</p>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-yellow-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                  </div>
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-200" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced TabBar */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-white/20">
          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        {/* Enhanced ActionControls */}
        <div className="flex-shrink-0 bg-white/60 backdrop-blur-sm border-b border-white/20">
          <ActionControls />
        </div>
        
        {/* Main Content - Enhanced */}
        <div className="flex-1 min-h-0 overflow-auto bg-gradient-to-br from-slate-50/50 via-blue-50/50 to-indigo-50/50">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading your tasks...</p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {activeTab === "main-table" && <MainTable />}
              {activeTab === "kanban" && <KanbanBoard />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 