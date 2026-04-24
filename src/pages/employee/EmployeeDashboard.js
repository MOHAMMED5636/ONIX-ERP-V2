import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../modules/calendar-custom.css";
import { useAuth } from "../../contexts/AuthContext";
import {
  getDashboardStats,
  getMyDashboardWidgetPreferences,
  saveMyDashboardWidgetPreferences,
  resetMyDashboardWidgetPreferences,
} from "../../services/dashboardAPI";
import { getTodayAttendance, getMyAttendance } from "../../services/attendanceAPI";
import DashboardMeetingsCalendar from "../../components/dashboard/DashboardMeetingsCalendar";
import AIChatbot from "../../components/tasks/AIChatbot";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DraggableDashboardCard, DraggableWidgetBox } from "../../components/DraggableDashboard";
import {
  FolderIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BellIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import SystemFeedbackModal from "../../components/SystemFeedbackModal";

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

const DASHBOARD_WIDGETS = [
  { id: "active-employees", label: "Project Health Overview", area: "main" },
  { id: "active-contracts", label: "Daily Tasks Widget", area: "main" },
  { id: "attendance", label: "Attendance Widget", area: "main" },
  { id: "active-tasks", label: "Workload Indicator Widget", area: "main" },
  { id: "reminders", label: "Reminders Widget", area: "main" },
  { id: "quick-links", label: "Quick Links Widget", area: "sidebar" },
  { id: "calendar", label: "Calendar Widget", area: "sidebar" },
];

const DEFAULT_MAIN_WIDGET_ORDER = [
  "active-employees",
  "active-contracts",
  "attendance",
  "active-tasks",
  "reminders",
];
const DEFAULT_SIDEBAR_WIDGET_ORDER = ["quick-links", "calendar"];
const DEFAULT_WIDGET_SELECTION = DASHBOARD_WIDGETS.reduce((acc, w) => {
  acc[w.id] = true;
  return acc;
}, {});

function sanitizeWidgetOrder(order, allowedIds) {
  const out = [];
  const seen = new Set();
  (Array.isArray(order) ? order : []).forEach((id) => {
    if (allowedIds.includes(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  });
  allowedIds.forEach((id) => {
    if (!seen.has(id)) out.push(id);
  });
  return out;
}

function sanitizeSelection(selection, allowedIds) {
  const base = { ...DEFAULT_WIDGET_SELECTION };
  if (!selection || typeof selection !== "object") return base;
  allowedIds.forEach((id) => {
    if (typeof selection[id] === "boolean") base[id] = selection[id];
  });
  return base;
}

function DrawerSortableRow({ id, checked, label, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges: () => false,
  });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: isDragging ? undefined : (transition || "transform 200ms cubic-bezier(.2,.8,.2,1)"),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 ${
        isDragging ? "opacity-70 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-gray-400 cursor-grab select-none px-2 py-1 rounded-lg hover:bg-white"
        title="Drag to reorder"
      >
        ≡
      </button>
      <input type="checkbox" checked={checked} onChange={onToggle} className="h-4 w-4" />
      <div className="flex-1">
        <div className="text-sm font-semibold text-gray-900">{label}</div>
        <div className="text-xs text-gray-500">{id}</div>
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    activeProjects: 0,
    activeTasks: 0,
    inProgressTasks: 0,
    teamMembers: 0,
    loading: true,
    error: null,
  });
  const [todayAttendance, setTodayAttendance] = useState({ checkIn: null, checkOut: null });
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [taskSearchTerm, setTaskSearchTerm] = useState("");
  const [showAIChatbot, setShowAIChatbot] = useState(false);
  const [showSystemFeedbackModal, setShowSystemFeedbackModal] = useState(false);
  const allowEmployeeCustomization = user?.role === "EMPLOYEE";

  const MAIN_WIDGET_IDS = useMemo(
    () => DASHBOARD_WIDGETS.filter((w) => w.area === "main").map((w) => w.id),
    []
  );
  const SIDEBAR_WIDGET_IDS = useMemo(
    () => DASHBOARD_WIDGETS.filter((w) => w.area === "sidebar").map((w) => w.id),
    []
  );

  const [widgetOrder, setWidgetOrder] = useState(DEFAULT_MAIN_WIDGET_ORDER);
  const [sidebarWidgetOrder, setSidebarWidgetOrder] = useState(DEFAULT_SIDEBAR_WIDGET_ORDER);
  const [widgetSelection, setWidgetSelection] = useState(DEFAULT_WIDGET_SELECTION);
  const [collapsedWidgets, setCollapsedWidgets] = useState({});
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const DASHBOARD_TASK_SEARCH_KEY = "onix-dashboard-search";

  const handleDashboardTaskSearch = () => {
    const term = taskSearchTerm.trim();
    if (term) {
      try {
        localStorage.setItem(DASHBOARD_TASK_SEARCH_KEY, term);
      } catch (_) {}
    } else {
      try {
        localStorage.removeItem(DASHBOARD_TASK_SEARCH_KEY);
      } catch (_) {}
    }
    navigate("/employee/tasks");
  };

  const fetchAttendanceData = async () => {
    setAttendanceLoading(true);
    try {
      const [todayRes, listRes] = await Promise.all([
        getTodayAttendance(),
        getMyAttendance({ limit: 14, page: 1 }),
      ]);
      if (todayRes?.success && todayRes.data) {
        setTodayAttendance({
          checkIn: todayRes.data.checkIn?.time ?? null,
          checkOut: todayRes.data.checkOut?.time ?? null,
        });
      }
      if (listRes?.success && Array.isArray(listRes.data)) {
        setAttendanceList(listRes.data);
      }
    } catch (err) {
      console.error("Attendance fetch error:", err);
    } finally {
      setAttendanceLoading(false);
    }
  };

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

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  useEffect(() => {
    if (!allowEmployeeCustomization) return;
    let mounted = true;
    (async () => {
      try {
        const res = await getMyDashboardWidgetPreferences();
        const cfg = res?.data?.config || null;
        if (!mounted) return;
        if (cfg && typeof cfg === "object") {
          setWidgetOrder(sanitizeWidgetOrder(cfg.mainOrder, MAIN_WIDGET_IDS));
          setSidebarWidgetOrder(sanitizeWidgetOrder(cfg.sidebarOrder, SIDEBAR_WIDGET_IDS));
          setWidgetSelection(sanitizeSelection(cfg.selection, [...MAIN_WIDGET_IDS, ...SIDEBAR_WIDGET_IDS]));
        }
      } catch (_) {
        /* keep defaults */
      }
    })();
    return () => {
      mounted = false;
    };
  }, [allowEmployeeCustomization, MAIN_WIDGET_IDS, SIDEBAR_WIDGET_IDS]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const mainVisibleOrder = useMemo(() => {
    return widgetOrder.filter((id) => widgetSelection[id]);
  }, [widgetOrder, widgetSelection]);

  const sidebarVisibleOrder = useMemo(() => {
    return sidebarWidgetOrder.filter((id) => widgetSelection[id]);
  }, [sidebarWidgetOrder, widgetSelection]);

  const toggleWidgetCollapsed = (id) => {
    setCollapsedWidgets((m) => ({ ...m, [id]: !m[id] }));
  };

  const removeWidgetFromDashboard = (id) => {
    setWidgetSelection((m) => ({ ...m, [id]: false }));
  };

  const handleSaveWidgetPrefs = async () => {
    setSavingPrefs(true);
    try {
      const config = {
        version: 1,
        selection: widgetSelection,
        mainOrder: widgetOrder,
        sidebarOrder: sidebarWidgetOrder,
      };
      await saveMyDashboardWidgetPreferences(config);
      setCustomizeOpen(false);
    } catch (e) {
      console.error("Failed to save dashboard widget preferences:", e);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleResetWidgetPrefs = async () => {
    setSavingPrefs(true);
    try {
      await resetMyDashboardWidgetPreferences();
      setWidgetSelection(DEFAULT_WIDGET_SELECTION);
      setWidgetOrder(DEFAULT_MAIN_WIDGET_ORDER);
      setSidebarWidgetOrder(DEFAULT_SIDEBAR_WIDGET_ORDER);
      setCollapsedWidgets({});
      setCustomizeOpen(false);
    } catch (e) {
      console.error("Failed to reset dashboard widget preferences:", e);
    } finally {
      setSavingPrefs(false);
    }
  };

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
          <div className="flex flex-col sm:flex-row gap-2 items-stretch w-full sm:w-auto min-w-0">
            <div className="relative w-full sm:w-auto">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
              <input
                type="text"
                value={taskSearchTerm}
                onChange={(e) => setTaskSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleDashboardTaskSearch();
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
              onClick={() => {
                fetchDashboardData();
                fetchAttendanceData();
              }}
              disabled={dashboardData.loading}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto justify-start sm:justify-center"
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
              <span className="hidden sm:inline">{dashboardData.loading ? "Refreshing..." : "Refresh"}</span>
            </button>
            {allowEmployeeCustomization && (
              <button
                type="button"
                onClick={() => setCustomizeOpen(true)}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-center"
                title="Customize Widgets"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-indigo-500" />
                <span className="hidden sm:inline">Customize Widgets</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate("/project-chat")}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto justify-start sm:justify-center"
              title="Chatroom"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-500" />
              <span className="hidden sm:inline">Chatroom</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSystemFeedbackModal(true)}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-center"
              title="Send feedback to administrators"
            >
              <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-indigo-500" />
              <span className="hidden sm:inline">Feedback</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAIChatbot(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-center"
              title="AI Assistant"
            >
              <SparklesIcon className="h-5 w-5" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Main grid: cards + right sidebar */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            const { active, over } = event;
            if (!over?.id || active.id === over.id) return;
            if (widgetOrder.includes(active.id) && widgetOrder.includes(over.id)) {
              setWidgetOrder((items) => arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)));
              return;
            }
            if (sidebarWidgetOrder.includes(active.id) && sidebarWidgetOrder.includes(over.id)) {
              setSidebarWidgetOrder((items) => arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)));
            }
          }}
        >
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 w-full">
          {/* Left: summary cards - same layout as admin */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <SortableContext items={mainVisibleOrder} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mainVisibleOrder.map((widgetId) => {
                switch (widgetId) {
                  case "active-employees":
                    return (
                      <DraggableDashboardCard
                        key={widgetId}
                        id={widgetId}
                        title="My Active Projects"
                        value={
                          collapsedWidgets[widgetId]
                            ? <span className="text-sm text-gray-500">Collapsed</span>
                            : (dashboardData.loading ? "..." : <AnimatedNumber n={dashboardData.activeProjects} />)
                        }
                        icon={<FolderIcon className="h-9 w-9 text-indigo-500" aria-hidden />}
                        accent={dashboardData.loading ? "" : "Assigned"}
                        gradient="bg-white"
                        shadow="shadow-lg"
                      >
                        <div className="mt-3 flex items-center justify-end gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => toggleWidgetCollapsed(widgetId)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
                          >
                            {collapsedWidgets[widgetId] ? "Expand" : "Collapse"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeWidgetFromDashboard(widgetId)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </DraggableDashboardCard>
                    );
                  case "active-contracts":
                    return (
                      <DraggableDashboardCard
                        key={widgetId}
                        id={widgetId}
                        title="My Active Tasks"
                        value={
                          collapsedWidgets[widgetId]
                            ? <span className="text-sm text-gray-500">Collapsed</span>
                            : (dashboardData.loading ? "..." : <AnimatedNumber n={dashboardData.activeTasks} />)
                        }
                        icon={<ClipboardDocumentListIcon className="h-9 w-9 text-yellow-500" aria-hidden />}
                        accent={dashboardData.loading ? "" : "Open"}
                        gradient="bg-white"
                        shadow="shadow-lg"
                      >
                        <div className="mt-3 flex items-center justify-end gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => toggleWidgetCollapsed(widgetId)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
                          >
                            {collapsedWidgets[widgetId] ? "Expand" : "Collapse"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeWidgetFromDashboard(widgetId)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </DraggableDashboardCard>
                    );
                  case "attendance":
                    return (
                      <DraggableDashboardCard
                        key={widgetId}
                        id={widgetId}
                        title="Your Daily Attendance"
                        value={
                          collapsedWidgets[widgetId] ? (
                            <div className="text-sm text-gray-500">Collapsed</div>
                          ) :
                          attendanceLoading ? (
                            <div className="flex flex-col w-full gap-1 text-gray-500 text-sm">Loading...</div>
                          ) : (
                            <div className="flex flex-col w-full gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-gray-600">Check-In:</span>
                                <span className="text-sm font-bold text-green-600">
                                  {todayAttendance.checkIn
                                    ? new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                    : "—"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-gray-600">Check-Out:</span>
                                <span className="text-sm font-bold text-red-500">
                                  {todayAttendance.checkOut
                                    ? new Date(todayAttendance.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                    : "—"}
                                </span>
                              </div>
                              {todayAttendance.checkIn && todayAttendance.checkOut && (
                                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                                  <span>Hours:</span>
                                  <span>
                                    {(
                                      (new Date(todayAttendance.checkOut) - new Date(todayAttendance.checkIn)) /
                                      (1000 * 60 * 60)
                                    ).toFixed(1)}
                                    h
                                  </span>
                                </div>
                              )}
                              <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-green-400 to-red-400 transition-all"
                                  style={{
                                    width:
                                      todayAttendance.checkIn && todayAttendance.checkOut
                                        ? "100%"
                                        : todayAttendance.checkIn
                                          ? "50%"
                                          : "0%",
                                  }}
                                />
                              </div>
                              <Link
                                to="/employee/attendance"
                                className="text-xs text-indigo-600 hover:underline mt-2 font-medium"
                              >
                                View / Mark attendance →
                              </Link>
                            </div>
                          )
                        }
                        icon={<CalendarDaysIcon className="h-9 w-9 text-green-500" aria-hidden />}
                        accent="Today"
                        valueVariant="compact"
                        gradient="bg-white"
                        shadow="shadow-lg"
                      >
                        <div className="mt-3 flex items-center justify-end gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => toggleWidgetCollapsed(widgetId)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
                          >
                            {collapsedWidgets[widgetId] ? "Expand" : "Collapse"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeWidgetFromDashboard(widgetId)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </DraggableDashboardCard>
                    );
                  case "active-tasks":
                    return (
                      <DraggableDashboardCard
                        key={widgetId}
                        id={widgetId}
                        title="In Progress"
                        value={
                          collapsedWidgets[widgetId]
                            ? <span className="text-sm text-gray-500">Collapsed</span>
                            : (dashboardData.loading ? "..." : <AnimatedNumber n={dashboardData.inProgressTasks} />)
                        }
                        icon={
                          <svg className="h-9 w-9 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-6-8h6" />
                          </svg>
                        }
                        accent={dashboardData.loading ? "" : "Tasks"}
                        gradient="bg-white"
                        shadow="shadow-lg"
                      >
                        <div className="mt-3 flex items-center justify-end gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => toggleWidgetCollapsed(widgetId)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
                          >
                            {collapsedWidgets[widgetId] ? "Expand" : "Collapse"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeWidgetFromDashboard(widgetId)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </DraggableDashboardCard>
                    );
                  default:
                    return null;
                }
              })}
            </div>
            </SortableContext>

            {/* Your Daily Attendance Statistics list */}
            <div className="glass-card bg-gradient-to-br from-green-50 via-white to-cyan-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-green-100 w-full">
              <h3 className="flex items-center gap-2 text-lg font-bold text-green-700 mb-3">
                <ClockIcon className="h-6 w-6 text-green-500" />
                Your Daily Attendance Statistics
              </h3>
              {attendanceLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : attendanceList.length === 0 ? (
                <p className="text-sm text-gray-500">No attendance records yet. Mark check-in from Attendance.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-green-200">
                        <th className="text-left py-2 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Check-In</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Check-Out</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const byDate = {};
                        attendanceList.forEach((r) => {
                          const d = r.date ? new Date(r.date).toISOString().slice(0, 10) : null;
                          if (!d) return;
                          if (!byDate[d]) byDate[d] = { date: d, checkIn: null, checkOut: null };
                          if (r.type === "CHECK_IN" && r.checkInTime) byDate[d].checkIn = r.checkInTime;
                          if (r.type === "CHECK_OUT" && r.checkOutTime) byDate[d].checkOut = r.checkOutTime;
                        });
                        const rows = Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
                        return rows.map((row) => {
                          const inTime = row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
                          const outTime = row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
                          const hours =
                            row.checkIn && row.checkOut
                              ? ((new Date(row.checkOut) - new Date(row.checkIn)) / (1000 * 60 * 60)).toFixed(1)
                              : "—";
                          return (
                            <tr key={row.date} className="border-b border-green-100 hover:bg-green-50/50">
                              <td className="py-2 text-gray-800 font-medium">{new Date(row.date).toLocaleDateString()}</td>
                              <td className="py-2 text-green-600">{inTime}</td>
                              <td className="py-2 text-red-600">{outTime}</td>
                              <td className="py-2 text-gray-700">{hours !== "—" ? `${hours}h` : "—"}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              )}
              <Link
                to="/employee/attendance"
                className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:underline mt-3"
              >
                View all attendance →
              </Link>
            </div>

            {/* Reminders - same style as admin */}
            {widgetSelection["reminders"] && (
              <DraggableWidgetBox id="reminders">
                <div className="glass-card bg-gradient-to-br from-yellow-50 via-white to-orange-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-yellow-100 w-full">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-yellow-700">
                      <BellIcon className="h-6 w-6 text-yellow-400" aria-hidden />
                      Reminders
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleWidgetCollapsed("reminders")}
                        className="text-xs font-semibold px-2 py-1 rounded-lg bg-white/70 border border-yellow-100 text-yellow-800 hover:bg-white transition"
                      >
                        {collapsedWidgets["reminders"] ? "Expand" : "Collapse"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeWidgetFromDashboard("reminders")}
                        className="text-xs font-semibold px-2 py-1 rounded-lg bg-white/70 border border-yellow-100 text-rose-600 hover:bg-white transition"
                        title="Remove from dashboard"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {!collapsedWidgets["reminders"] && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <DocumentTextIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" aria-hidden />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-yellow-800 text-sm">Document Expiry</div>
                          <div className="text-xs text-yellow-600">Check your profile for document expiry dates.</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-400 flex-shrink-0" aria-hidden />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-indigo-800 text-sm">Tasks</div>
                          <div className="text-xs text-indigo-600">
                            You have {dashboardData.activeTasks} active task(s). Update status from My Tasks.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </DraggableWidgetBox>
            )}
          </div>

          {/* Right sidebar: Quick Links + Calendar - same as admin */}
          <aside className="xl:w-80 w-full flex-shrink-0 flex flex-col gap-6">
            {sidebarVisibleOrder.includes("quick-links") && (
              <SortableContext items={sidebarVisibleOrder} strategy={verticalListSortingStrategy}>
                <DraggableWidgetBox id="quick-links">
                  <div className="glass-card bg-gradient-to-br from-cyan-50 via-white to-indigo-50 rounded-2xl shadow-xl p-4 sm:p-6 border border-cyan-100 w-full">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h4 className="flex items-center gap-2 font-bold text-indigo-700 text-lg">
                        <DocumentTextIcon className="h-6 w-6 text-indigo-400" aria-hidden />
                        Quick Links
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleWidgetCollapsed("quick-links")}
                          className="text-xs font-semibold px-2 py-1 rounded-lg bg-white/70 border border-cyan-100 text-indigo-700 hover:bg-white transition"
                        >
                          {collapsedWidgets["quick-links"] ? "Expand" : "Collapse"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWidgetFromDashboard("quick-links")}
                          className="text-xs font-semibold px-2 py-1 rounded-lg bg-white/70 border border-cyan-100 text-rose-600 hover:bg-white transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {!collapsedWidgets["quick-links"] && (
                      <>
                        <ul className="flex flex-col gap-2">
                          <li>
                            <Link
                              to="/employee/projects"
                              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-indigo-100 text-indigo-600 font-semibold shadow transition"
                            >
                              <FolderIcon className="h-4 w-4 text-indigo-400" aria-hidden />
                              My Projects
                            </Link>
                          </li>
                        </ul>
                        <div className="border-t border-cyan-100 pt-3 mt-3 text-xs text-gray-400">
                          Employee Portal · ONIX
                        </div>
                      </>
                    )}
                  </div>
                </DraggableWidgetBox>
              </SortableContext>
            )}
            {sidebarVisibleOrder.includes("calendar") && (
              <SortableContext items={sidebarVisibleOrder} strategy={verticalListSortingStrategy}>
                <DraggableWidgetBox id="calendar">
                  <div className="glass-card bg-gradient-to-br from-cyan-50 via-white to-indigo-50 rounded-2xl shadow-xl p-4 sm:p-6 border border-cyan-100 w-full">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h4 className="flex items-center gap-2 font-bold text-cyan-700 text-lg">
                        <CalendarDaysIcon className="h-6 w-6 text-cyan-400" aria-hidden />
                        Calendar
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleWidgetCollapsed("calendar")}
                          className="text-xs font-semibold px-2 py-1 rounded-lg bg-white/70 border border-cyan-100 text-cyan-700 hover:bg-white transition"
                        >
                          {collapsedWidgets["calendar"] ? "Expand" : "Collapse"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWidgetFromDashboard("calendar")}
                          className="text-xs font-semibold px-2 py-1 rounded-lg bg-white/70 border border-cyan-100 text-rose-600 hover:bg-white transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {!collapsedWidgets["calendar"] && (
                      <div className="glass-card bg-white/80 rounded-2xl shadow-lg p-2 border border-cyan-100">
                        <DashboardMeetingsCalendar />
                      </div>
                    )}
                  </div>
                </DraggableWidgetBox>
              </SortableContext>
            )}
          </aside>
        </div>
        </DndContext>
      </div>

      {allowEmployeeCustomization && (
        <div
          className={`fixed inset-0 z-[60] ${customizeOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          aria-hidden={!customizeOpen}
        >
          <div
            className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${customizeOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setCustomizeOpen(false)}
          />
          <div
            className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-indigo-100 transform transition-transform duration-300 ${
              customizeOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-full flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-lg font-extrabold text-gray-900">Customize Widgets</div>
                  <div className="text-xs text-gray-500">Choose widgets, drag to reorder, then save.</div>
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
                  onClick={() => setCustomizeOpen(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                <div>
                  <div className="text-sm font-bold text-indigo-800 mb-2">Main Widgets</div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => {
                      const { active, over } = event;
                      if (!over?.id || active.id === over.id) return;
                      if (!widgetOrder.includes(active.id) || !widgetOrder.includes(over.id)) return;
                      setWidgetOrder((items) => arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)));
                    }}
                  >
                    <SortableContext items={widgetOrder} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {widgetOrder.map((id) => {
                          const meta = DASHBOARD_WIDGETS.find((w) => w.id === id);
                          if (!meta || meta.area !== "main") return null;
                          const checked = Boolean(widgetSelection[id]);
                          return (
                            <DrawerSortableRow
                              key={id}
                              id={id}
                              checked={checked}
                              label={meta.label}
                              onToggle={(e) => setWidgetSelection((m) => ({ ...m, [id]: e.target.checked }))}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>

                <div>
                  <div className="text-sm font-bold text-indigo-800 mb-2">Sidebar Widgets</div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => {
                      const { active, over } = event;
                      if (!over?.id || active.id === over.id) return;
                      if (!sidebarWidgetOrder.includes(active.id) || !sidebarWidgetOrder.includes(over.id)) return;
                      setSidebarWidgetOrder((items) => arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)));
                    }}
                  >
                    <SortableContext items={sidebarWidgetOrder} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {sidebarWidgetOrder.map((id) => {
                          const meta = DASHBOARD_WIDGETS.find((w) => w.id === id);
                          if (!meta || meta.area !== "sidebar") return null;
                          const checked = Boolean(widgetSelection[id]);
                          return (
                            <DrawerSortableRow
                              key={id}
                              id={id}
                              checked={checked}
                              label={meta.label}
                              onToggle={(e) => setWidgetSelection((m) => ({ ...m, [id]: e.target.checked }))}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetWidgetPrefs}
                  disabled={savingPrefs}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-60"
                >
                  Reset to default
                </button>
                <button
                  type="button"
                  onClick={handleSaveWidgetPrefs}
                  disabled={savingPrefs}
                  className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {savingPrefs ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SystemFeedbackModal
        isOpen={showSystemFeedbackModal}
        onClose={() => setShowSystemFeedbackModal(false)}
      />
      <AIChatbot isOpen={showAIChatbot} onClose={() => setShowAIChatbot(false)} />

      <style>{`
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); }
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

