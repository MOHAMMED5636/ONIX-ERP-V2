import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../modules/calendar-custom.css";
import { useAuth } from "../../contexts/AuthContext";
import { getDashboardStats } from "../../services/dashboardAPI";
import {
  FolderIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

function AnimatedNumber({ n }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = typeof n === "number" ? n : 0;
    if (start === end) {
      setVal(end);
      return;
    }
    let increment = end / 30;
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setVal(end);
        clearInterval(timer);
      } else {
        setVal(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [n]);
  return <span>{val}</span>;
}

// Card component matching admin dashboard style
function DashboardCard({ title, value, icon, accent, children, className = "" }) {
  return (
    <div
      className={`relative rounded-2xl shadow-md p-4 sm:p-5 lg:p-7 flex flex-col items-start border border-gray-100 glass-card transition-all duration-300 animate-fade-in bg-white shadow-lg hover:scale-[1.02] hover:shadow-xl group ${className}`}
    >
      <div className="flex items-center gap-3 mb-2 w-full">
        {icon && (
          <span className="flex items-center justify-center rounded-full p-2 bg-white/40 shadow-md mr-2">
            {icon}
          </span>
        )}
        <span className="text-base sm:text-lg font-semibold text-gray-800 truncate">{title}</span>
        {accent && (
          <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-white/70 text-indigo-600 shadow">
            {accent}
          </span>
        )}
      </div>
      <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 w-full flex items-center gap-2">
        {value}
      </div>
      {children}
    </div>
  );
}

function CalendarWidget({ onDateClick }) {
  const [value, setValue] = useState(new Date());
  const formatDate = (d) => d.toISOString().split("T")[0];
  return (
    <div className="mt-4">
      <Calendar
        onChange={setValue}
        value={value}
        tileContent={({ date }) => {
          const key = formatDate(date);
          const isToday = formatDate(new Date()) === key;
          if (isToday) {
            return (
              <span className="block w-5 h-5 mx-auto mt-1 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-400 text-white flex items-center justify-center text-xs font-bold shadow">
                ★
              </span>
            );
          }
          return null;
        }}
        onClickDay={(date) => onDateClick && onDateClick(formatDate(date))}
        className="rounded-xl shadow-md p-2 border-0 w-full"
      />
    </div>
  );
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  useNavigate(); // keep hook so runtime doesn't throw if something expects it
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    activeProjects: 0,
    activeTasks: 0,
    inProgressTasks: 0,
    teamMembers: 0,
    loading: true,
    error: null,
  });

  const fetchDashboardData = async () => {
    try {
      setDashboardData((prev) => ({ ...prev, loading: true, error: null }));
      // Use stats so we get inProgressTasks; summary doesn't include it
      const res = await getDashboardStats();
      if (res.success && res.data) {
        const d = res.data;
        setDashboardData((prev) => ({
          ...prev,
          activeProjects: Number(d.activeProjects) || 0,
          activeTasks: Number(d.activeTasks) || 0,
          inProgressTasks: Number(d.inProgressTasks) ?? Number(d.inProgressTenders) ?? 0,
          teamMembers: Number(d.teamMembers) || 0,
          loading: false,
          error: null,
        }));
        setLastUpdated(new Date());
      } else {
        throw new Error(res.message || "Failed to load dashboard");
      }
    } catch (err) {
      setDashboardData((prev) => ({
        ...prev,
        activeProjects: 0,
        activeTasks: 0,
        inProgressTasks: 0,
        teamMembers: 0,
        loading: false,
        error: err.message || "Failed to load dashboard",
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email?.split("@")[0] || "Employee";

  return (
    <div className="relative min-h-screen w-full bg-white flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="employeeBlobGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 400 300"
              to="360 400 300"
              dur="24s"
              repeatCount="indefinite"
            />
            <path
              d="M600,300Q600,400,500,450Q400,500,300,450Q200,400,200,300Q200,200,300,150Q400,100,500,150Q600,200,600,300Z"
              fill="url(#employeeBlobGrad)"
            />
          </g>
        </svg>
      </div>

      <div className="relative z-20 p-4 sm:p-6 lg:p-8 w-full flex flex-col">
        {dashboardData.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">⚠️ {dashboardData.error}</p>
          </div>
        )}

        {/* Hero Banner - same style as admin, employee actions only */}
        <div className="w-full mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-300 shadow-lg animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full shadow-lg border-2 border-white bg-white flex items-center justify-center text-indigo-600 font-bold text-lg">
              {displayName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">
                Welcome back, <span className="font-extrabold">{displayName.split(" ")[0]}</span>!
              </h1>
              <p className="text-white text-sm sm:text-base opacity-90">
                Here’s your snapshot and quick actions.
                {lastUpdated && (
                  <span className="ml-2 text-xs opacity-75">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchDashboardData()}
              disabled={dashboardData.loading}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2 disabled:opacity-50"
            >
              <svg
                className={`h-5 w-5 text-indigo-500 ${dashboardData.loading ? "animate-spin" : ""}`}
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
              {dashboardData.loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Main grid: cards + right sidebar */}
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 w-full">
          {/* Left: summary cards - same layout as admin */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="My Active Projects"
                value={dashboardData.loading ? "..." : <AnimatedNumber n={dashboardData.activeProjects} />}
                icon={
                  <FolderIcon className="h-9 w-9 text-indigo-500" />
                }
                accent={dashboardData.loading ? "" : "Assigned"}
              />
              <DashboardCard
                title="My Active Tasks"
                value={dashboardData.loading ? "..." : <AnimatedNumber n={dashboardData.activeTasks} />}
                icon={
                  <ClipboardDocumentListIcon className="h-9 w-9 text-yellow-500" />
                }
                accent={dashboardData.loading ? "" : "Open"}
              />
              <DashboardCard
                title="Your Daily Attendance"
                value={
                  <div className="flex flex-col w-full gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Check-In:</span>
                      <span className="text-base font-bold text-green-600">—</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Check-Out:</span>
                      <span className="text-base font-bold text-red-500">—</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-400 to-red-400"
                        style={{ width: "0%" }}
                      />
                    </div>
                  </div>
                }
                icon={<CalendarDaysIcon className="h-9 w-9 text-green-500" />}
                accent="Today"
              />
              <DashboardCard
                title="In Progress"
                value={dashboardData.loading ? "..." : <AnimatedNumber n={dashboardData.inProgressTasks} />}
                icon={
                  <svg
                    className="h-9 w-9 text-pink-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-6-8h6" />
                  </svg>
                }
                accent={dashboardData.loading ? "" : "Tasks"}
              />
            </div>

            {/* Reminders - same style as admin */}
            <div className="glass-card bg-gradient-to-br from-yellow-50 via-white to-orange-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-yellow-100 w-full">
              <h3 className="flex items-center gap-2 text-lg font-bold text-yellow-700 mb-4">
                <BellIcon className="h-6 w-6 text-yellow-400" />
                Reminders
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <DocumentTextIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-yellow-800 text-sm">Document Expiry</div>
                    <div className="text-xs text-yellow-600">Check your profile for document expiry dates.</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-indigo-800 text-sm">Tasks</div>
                    <div className="text-xs text-indigo-600">
                      You have {dashboardData.activeTasks} active task(s). Update status from My Tasks.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar: Quick Links + Calendar - same as admin */}
          <aside className="xl:w-80 w-full flex-shrink-0 flex flex-col gap-6">
            <div className="glass-card bg-gradient-to-br from-cyan-50 via-white to-indigo-50 rounded-2xl shadow-xl p-4 sm:p-6 border border-cyan-100 w-full">
              <h4 className="flex items-center gap-2 font-bold text-indigo-700 mb-3 text-lg">
                <DocumentTextIcon className="h-6 w-6 text-indigo-400" />
                Quick Links
              </h4>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    to="/employee/projects"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-indigo-100 text-indigo-600 font-semibold shadow transition"
                  >
                    <FolderIcon className="h-4 w-4 text-indigo-400" />
                    My Projects
                  </Link>
                </li>
                <li>
                  <Link
                    to="/employee/profile"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-indigo-100 text-indigo-600 font-semibold shadow transition"
                  >
                    <UserCircleIcon className="h-4 w-4 text-indigo-400" />
                    Profile
                  </Link>
                </li>
              </ul>
              <div className="border-t border-cyan-100 pt-3 mt-3 text-xs text-gray-400">
                Employee Portal · ONIX
              </div>
            </div>
            <div className="glass-card bg-gradient-to-br from-cyan-50 via-white to-indigo-50 rounded-2xl shadow-xl p-4 sm:p-6 border border-cyan-100 w-full">
              <h4 className="flex items-center gap-2 font-bold text-cyan-700 mb-3 text-lg">
                <CalendarDaysIcon className="h-6 w-6 text-cyan-400" />
                Calendar
              </h4>
              <div className="glass-card bg-white/80 rounded-2xl shadow-lg p-2 border border-cyan-100">
                <CalendarWidget />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); }
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
