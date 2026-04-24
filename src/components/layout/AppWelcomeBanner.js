import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SparklesIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import onixLogo from "../../assets/onix-logo.png";
import { useAuth } from "../../contexts/AuthContext";
import { useWelcomeBannerExtras } from "../../context/WelcomeBannerExtrasContext";

const PM_STYLE_ATTENDANCE_ROLES = ["PROJECT_MANAGER", "MANAGER", "HR", "CONTRACTOR"];

const TASK_SEARCH_KEY = "onix-dashboard-search";

function getUserDisplayName(user) {
  if (!user) return "there";
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`.trim();
  if (user.firstName) return user.firstName;
  if (user.email) return user.email.split("@")[0];
  return "there";
}

export default function AppWelcomeBanner({ onOpenAIAssistant, onOpenCustomizeWidgets }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    lastUpdated,
    dashboardLoading,
    triggerDashboardRefresh,
    welcomeBannerDismissed,
    dismissWelcomeBanner,
  } = useWelcomeBannerExtras();

  const [taskSearchTerm, setTaskSearchTerm] = useState("");

  const showPmStyleAttendance = PM_STYLE_ATTENDANCE_ROLES.includes(user?.role);
  const displayName = getUserDisplayName(user);

  const handleTaskSearch = () => {
    const term = taskSearchTerm.trim();
    try {
      if (term) {
        localStorage.setItem(TASK_SEARCH_KEY, term);
      } else {
        localStorage.removeItem(TASK_SEARCH_KEY);
      }
    } catch (_) {
      /* ignore */
    }
    navigate("/tasks");
  };

  const openFeedback = () => {
    window.dispatchEvent(new Event("open-system-feedback"));
  };

  if (welcomeBannerDismissed) return null;

  return (
    <div className="px-2 sm:px-4 lg:px-6 xl:px-8 pt-2 sm:pt-4 w-full shrink-0">
      <div className="w-full mb-4 sm:mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-2 sm:px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-300 shadow-lg animate-fade-in relative overflow-hidden">
        <button
          type="button"
          onClick={dismissWelcomeBanner}
          className="absolute top-2 right-2 z-10 rounded-full p-1.5 bg-white/20 hover:bg-white/35 text-white transition focus:outline-none focus:ring-2 focus:ring-white/80"
          aria-label="Dismiss welcome banner"
          title="Dismiss for this tab — use “Show welcome” in the sidebar or navbar to bring it back"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4 pr-8 sm:pr-0 min-w-0 flex-1">
          <img
            src={onixLogo}
            alt="Onix Logo"
            className="h-14 w-14 rounded-full shadow-lg border-2 border-white bg-white object-cover shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow truncate">
              Welcome back, <span className="font-extrabold">{displayName}</span>!
            </h1>
            <p className="text-white text-sm sm:text-base opacity-90 min-w-0">
              {showPmStyleAttendance
                ? "Here's your snapshot, attendance, and quick actions."
                : "Here's your company snapshot and quick actions."}
              {lastUpdated && (
                <span className="ml-2 text-xs opacity-75">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
        </div>
        {/* Controls: allow wrapping so rightmost buttons (AI) never get cut off */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch w-full lg:w-auto lg:justify-end min-w-0">
          <div className="relative w-full sm:min-w-[260px] sm:w-72 lg:w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
            <input
              type="text"
              value={taskSearchTerm}
              onChange={(e) => setTaskSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTaskSearch();
              }}
              placeholder="Search tasks..."
              className="w-full bg-white/90 text-indigo-800 pl-10 pr-8 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {taskSearchTerm && (
              <button
                type="button"
                onClick={() => setTaskSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-700"
                aria-label="Clear search"
              >
                <span className="text-sm font-bold">×</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => triggerDashboardRefresh()}
            disabled={Boolean(dashboardLoading)}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2 ripple disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-start sm:justify-center"
            title="Refresh"
          >
            <svg
              className={`h-5 w-5 text-indigo-500 ${dashboardLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">
              {dashboardLoading ? "Refreshing..." : "Refresh"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onOpenCustomizeWidgets?.()}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2 ripple w-full sm:w-auto justify-start sm:justify-center"
            title="Customize Widgets"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-indigo-500" />
            <span className="hidden sm:inline">Customize Widgets</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/project-chat")}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2 ripple w-full sm:w-auto justify-start sm:justify-center"
            title="Chatroom"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-500" />
            <span className="hidden sm:inline">Chatroom</span>
          </button>
          <button
            type="button"
            onClick={openFeedback}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2 ripple w-full sm:w-auto justify-start sm:justify-center"
            title="Send feedback to administrators"
          >
            <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-indigo-500" />
            <span className="hidden sm:inline">Feedback</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAIAssistant?.()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 ripple relative group w-full sm:w-auto justify-start sm:justify-center"
            title="AI Dashboard Assistant"
          >
            <SparklesIcon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow-lg border border-white animate-pulse">
              AI
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
