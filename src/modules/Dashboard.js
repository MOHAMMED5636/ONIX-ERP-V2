import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import AdminMessagePopup from "../components/AdminMessagePopup";
import { useLanguage } from "../LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useWelcomeBannerExtras } from "../context/WelcomeBannerExtrasContext";
import {
  getDashboardSummary,
  getDashboardStats,
  getMyDashboardWidgetPreferences,
  saveMyDashboardWidgetPreferences,
  resetMyDashboardWidgetPreferences,
} from "../services/dashboardAPI";
import { getTodayAttendance, getMyAttendance } from "../services/attendanceAPI";
import DraggableDashboard, { DraggableDashboardCard, DraggableWidgetBox } from "../components/DraggableDashboard";
import DashboardMeetingsCalendar from "../components/dashboard/DashboardMeetingsCalendar";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function PieChart({ colors = ["#a78bfa", "#fbbf24", "#f87171"], size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className="mx-auto">
      <circle r="16" cx="16" cy="16" fill={colors[0]} />
      <path d="M16 16 L16 0 A16 16 0 0 1 32 16 Z" fill={colors[1]} />
      <path d="M16 16 L32 16 A16 16 0 0 1 16 32 Z" fill={colors[2]} />
    </svg>
  );
}

// Enhanced DashboardCard for themed gradients, icons, badges, and micro-interactions
function DashboardCard({ title, value, icon, accent, gradient, shadow, children, className = "" }) {
  return (
    <div className={`relative rounded-2xl shadow-md p-4 sm:p-5 lg:p-7 flex flex-col items-start border border-gray-100 glass-card transition-all duration-300 animate-fade-in ${gradient} ${shadow} hover:scale-[1.04] hover:shadow-2xl group ${className}`}>
      <div className="flex items-center gap-3 mb-2 w-full">
        {icon && (
          <span className="flex items-center justify-center rounded-full p-2 bg-white/40 shadow-md mr-2">
            {icon}
          </span>
        )}
        <span className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 truncate drop-shadow">{title}</span>
        {accent && (
          <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-white/70 text-indigo-600 shadow badge-pop">{accent}</span>
        )}
      </div>
      <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 w-full animate-bounce-in flex items-center gap-2">{value}</div>
      {children}
    </div>
  );
}

// Sidebar widget ids from drag-order: each id should render only its slice (not the full card twice).
function rightSidebarSectionForWidgetId(widgetId) {
  if (widgetId === 'quick-links') return 'quick-links';
  if (widgetId === 'calendar') return 'calendar';
  return 'both';
}

// 1. Enhanced RightWidgetBox for Quick Links and/or Calendar (one draggable block per section)
function RightWidgetBox({ simplifiedQuickLinks, section = 'both' }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const hideBankReconciliation = user?.role === 'MANAGER' || user?.role === 'PROJECT_MANAGER';
  const showQuickLinks = section === 'both' || section === 'quick-links';
  const showCalendar = section === 'both' || section === 'calendar';

  return (
    <aside className="glass-card bg-gradient-to-br from-cyan-50 via-white to-indigo-50 rounded-2xl shadow-xl p-4 sm:p-6 border border-cyan-100 w-full max-w-xs mx-auto mb-4 sm:mb-6 xl:mb-0 animate-fade-in flex flex-col gap-6">
      {showQuickLinks && (
      <>
      {/* Quick Links Section */}
      <div>
        <h4 className="flex items-center gap-2 font-bold text-indigo-700 mb-3 text-base sm:text-lg"><svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg> {t("Quick Links")}</h4>
        {simplifiedQuickLinks ? (
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                to="/tasks"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-indigo-100 text-indigo-600 font-semibold shadow transition group"
              >
                <svg className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
                {t("My Projects")}
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-indigo-100 text-indigo-600 font-semibold shadow transition group"
              >
                <svg className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                {t("Profile")}
              </Link>
            </li>
          </ul>
        ) : (
        <ul className="flex flex-col gap-2">
          <li><a href="#" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-indigo-100 text-indigo-600 font-semibold shadow transition group"><svg className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg> My Parcels</a></li>
          <li><a href="#" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-indigo-100 text-indigo-600 font-semibold shadow transition group"><svg className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg> Inspection Reports</a></li>
          {!hideBankReconciliation && (
            <li><a href="/bank-reconciliation" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-indigo-100 text-indigo-600 font-semibold shadow transition group"><svg className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg> Bank Reconciliation</a></li>
          )}
          <li><a href="#" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-indigo-100 text-indigo-600 font-semibold shadow transition group"><svg className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 5h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg> Building Services</a></li>
      </ul>
        )}
      </div>
      <div className="border-t border-cyan-100 pt-3 text-xs text-gray-400">Company: ONIX Engineering</div>
      </>
      )}
      {/* Calendar Section */}
      {showCalendar && (
      <div className={showQuickLinks ? 'mt-2' : ''}>
        <h4 className="flex items-center gap-2 font-bold text-cyan-700 mb-3 text-base sm:text-lg"><svg className="h-6 w-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 5h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg> Calendar</h4>
        <div className="glass-card bg-white/80 rounded-2xl shadow-lg p-2 border border-cyan-100">
      <DashboardMeetingsCalendar />
        </div>
      </div>
      )}
    </aside>
  );
}

function AdminMessageModal({ open, onClose, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-md relative">
        <button
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-red-500 text-xl sm:text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-indigo-700 mb-2">{message.title}</h2>
        <div className="text-sm sm:text-base text-gray-700 mb-2">{message.body}</div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Got it
          </button>
        </div>
      </div>

    </div>
  );
}

function AnimatedNumber({ n }) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const end = n;
    if (start === end) return;
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

/** Roles that see employee-like personal attendance (live card + stats table + friendlier hero). */
const PM_STYLE_ATTENDANCE_ROLES = ["PROJECT_MANAGER", "MANAGER", "HR", "CONTRACTOR"];

/** Project Manager: hide finance placeholders, unusual attendance, and extra chrome (employee-like dashboard). */
const PROJECT_MANAGER_ROLE = "PROJECT_MANAGER";

const MANAGER_ROLES_HIDE_TEAM_CARD = ["MANAGER", "PROJECT_MANAGER"];

const DASHBOARD_WIDGETS = [
  { id: "active-employees", label: "Project Health Overview", area: "main" },
  { id: "active-contracts", label: "Daily Tasks Widget", area: "main" },
  { id: "attendance", label: "Attendance Widget", area: "main" },
  { id: "active-tasks", label: "Workload Indicator Widget", area: "main" },
  { id: "team-progress", label: "KPI Performance Widget", area: "main" },
  { id: "reminders", label: "Reminders Widget", area: "main" },
  { id: "authority-alerts", label: "Authority Alerts Widget", area: "main" },
  { id: "document-expiry", label: "Document Expiry Widget", area: "main" },
  { id: "quick-links", label: "Quick Links Widget", area: "sidebar" },
  { id: "calendar", label: "Calendar Widget", area: "sidebar" },
];

const DEFAULT_MAIN_WIDGET_ORDER = [
  "active-employees",
  "active-contracts",
  "attendance",
  "active-tasks",
  "team-progress",
  "reminders",
  "authority-alerts",
  "document-expiry",
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
  // Append any missing allowed IDs to the end (stable defaults)
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

function PlaceholderWidget({ title, tone = "indigo", children }) {
  const toneMap = {
    indigo: "from-indigo-50 via-white to-cyan-50 border-indigo-100 text-indigo-700",
    amber: "from-amber-50 via-white to-orange-50 border-amber-100 text-amber-700",
    rose: "from-rose-50 via-white to-pink-50 border-rose-100 text-rose-700",
  };
  const cls = toneMap[tone] || toneMap.indigo;
  return (
    <div className={`glass-card bg-gradient-to-br ${cls} rounded-2xl shadow-lg p-4 sm:p-6 border w-full animate-fade-in`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <div className="mt-3 text-sm text-gray-600">
        {children || "This widget is ready for live data integration."}
      </div>
    </div>
  );
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

function WidgetFrame({ title, widgetId, collapsed, onToggleCollapse, onRemove, children }) {
  return (
    <div className="w-full">
      <div className="glass-card bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 w-full animate-fade-in">
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-bold text-gray-900">{title}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleCollapse(widgetId)}
              className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
            >
              {collapsed ? "Expand" : "Collapse"}
            </button>
            <button
              type="button"
              onClick={() => onRemove(widgetId)}
              className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition"
              title="Remove from dashboard"
            >
              Remove
            </button>
          </div>
        </div>
        {!collapsed && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { setLastUpdated, setDashboardLoading, registerDashboardRefresh } = useWelcomeBannerExtras();
  const location = useLocation();
  const navigate = useNavigate();
  const showPmStyleAttendance = PM_STYLE_ATTENDANCE_ROLES.includes(user?.role);
  const isProjectManager = user?.role === PROJECT_MANAGER_ROLE;
  const hideTeamMembersDashboardCard = MANAGER_ROLES_HIDE_TEAM_CARD.includes(user?.role);

  const [todayAttendance, setTodayAttendance] = useState({ checkIn: null, checkOut: null });
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

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
      console.error("Dashboard attendance fetch error:", err);
    } finally {
      setAttendanceLoading(false);
    }
  };
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    activeProjects: 0,
    activeTasks: 0,
    teamMembers: 0,
    inProgressTenders: 0,
    totalClients: 0,
    totalTenders: 0,
    pendingInvitations: 0,
    loading: true,
    error: null
  });
  
  // State for widget order
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

  // Load widget order from localStorage on mount
  useEffect(() => {
    // Open customizer when the top-bar button is clicked (dispatched from App.js)
    const openCustomizer = () => setCustomizeOpen(true);
    window.addEventListener("open-dashboard-widget-customizer", openCustomizer);
    return () => window.removeEventListener("open-dashboard-widget-customizer", openCustomizer);
  }, []);

  // Load per-user widget preferences from backend (fallback to localStorage if missing)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMyDashboardWidgetPreferences();
        const cfg = res?.data?.config || null;
        if (!mounted) return;

        if (cfg && typeof cfg === "object") {
          const nextMain = sanitizeWidgetOrder(cfg.mainOrder, MAIN_WIDGET_IDS);
          const nextSidebar = sanitizeWidgetOrder(cfg.sidebarOrder, SIDEBAR_WIDGET_IDS);
          const nextSel = sanitizeSelection(cfg.selection, [...MAIN_WIDGET_IDS, ...SIDEBAR_WIDGET_IDS]);
          setWidgetOrder(nextMain);
          setSidebarWidgetOrder(nextSidebar);
          setWidgetSelection(nextSel);
          return;
        }

        // fallback to legacy localStorage (one-time)
        const savedOrder = localStorage.getItem("dashboard-widget-order");
        const savedSidebarOrder = localStorage.getItem("dashboard-sidebar-order");
        if (savedOrder) {
          try {
            const parsed = JSON.parse(savedOrder);
            setWidgetOrder(sanitizeWidgetOrder(parsed, MAIN_WIDGET_IDS));
          } catch {
            /* ignore */
          }
        }
        if (savedSidebarOrder) {
          try {
            const parsed = JSON.parse(savedSidebarOrder);
            setSidebarWidgetOrder(sanitizeWidgetOrder(parsed, SIDEBAR_WIDGET_IDS));
          } catch {
            /* ignore */
          }
        }
      } catch (e) {
        // If API fails, keep defaults (and legacy localStorage will still work)
      }
    })();

    return () => {
      mounted = false;
    };
  }, [MAIN_WIDGET_IDS, SIDEBAR_WIDGET_IDS]);

  /**
   * Fetch dashboard data from backend
   * This function is called on mount and when refresh is needed
   */
  const fetchDashboardData = async (detailed = false) => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch summary data (or detailed stats if needed)
      // IMPORTANT: This fetches from backend API - no hardcoded values
      const summaryResponse = detailed 
        ? await getDashboardStats() 
        : await getDashboardSummary();
      
      // Log response for debugging
      console.log('📊 Dashboard - API Response:', summaryResponse);
      
      if (summaryResponse.success && summaryResponse.data) {
        // Map API response to state - ensure activeProjects is a number
        const activeProjects = Number(summaryResponse.data.activeProjects) || 0;
        const activeTasks = Number(summaryResponse.data.activeTasks) || 0;
        
        console.log(`📊 Dashboard - Setting state: activeProjects=${activeProjects}, activeTasks=${activeTasks}`);
        
        setDashboardData(prev => ({
          ...prev,
          activeProjects,  // Use mapped value, not from spread (ensures correct type)
          activeTasks,
          teamMembers: Number(summaryResponse.data.teamMembers) || 0,
          inProgressTenders: Number(summaryResponse.data.inProgressTenders) || 0,
          totalClients: Number(summaryResponse.data.totalClients) || 0,
          totalTenders: Number(summaryResponse.data.totalTenders) || 0,
          pendingInvitations: Number(summaryResponse.data.pendingInvitations) || 0,
          loading: false,
          error: null
        }));
        setLastUpdated(new Date());
      } else {
        throw new Error(summaryResponse.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      // On error, set all counts to 0 (not hardcoded 3)
      setDashboardData(prev => ({
        ...prev,
        activeProjects: 0,  // Always 0 on error
        activeTasks: 0,
        teamMembers: 0,
        inProgressTenders: 0,
        totalClients: 0,
        totalTenders: 0,
        pendingInvitations: 0,
        loading: false,
        error: error.message || 'Failed to load dashboard data'
      }));
    }
  };

  useEffect(() => {
    setDashboardLoading(dashboardData.loading);
  }, [dashboardData.loading, setDashboardLoading]);

  useEffect(() => {
    registerDashboardRefresh(() => {
      fetchDashboardData(true);
      fetchAttendanceData();
    });
  }, [registerDashboardRefresh]);

  // Initial fetch on mount
  useEffect(() => {
    fetchDashboardData();
    fetchAttendanceData();
    
    // Check for localStorage refresh flag (set when tasks/projects are created in MainTable)
    const shouldRefresh = localStorage.getItem('dashboardNeedsRefresh');
    if (shouldRefresh === 'true') {
      fetchDashboardData(true);
      localStorage.removeItem('dashboardNeedsRefresh');
    }
    
    // Set up interval to check for refresh flag (for real-time updates when projects are created)
    const refreshInterval = setInterval(() => {
      const needsRefresh = localStorage.getItem('dashboardNeedsRefresh');
      if (needsRefresh === 'true') {
        console.log('🔄 Dashboard refresh triggered by localStorage flag');
        fetchDashboardData(true);
        localStorage.removeItem('dashboardNeedsRefresh');
      }
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  /**
   * Auto-refresh when navigating back from projects/tasks pages
   * This ensures counts are updated after creating/editing projects or tasks
   */
  useEffect(() => {
    // Check if we're coming back from a project or task page with refresh flag
    if (location.state?.refreshDashboard) {
      fetchDashboardData(true); // Fetch detailed stats on refresh
      // Clear the refresh flag
      window.history.replaceState({}, document.title);
    }
    
    // Also check localStorage flag on location change
    const shouldRefresh = localStorage.getItem('dashboardNeedsRefresh');
    if (shouldRefresh === 'true') {
      console.log('🔄 Dashboard refresh triggered by location change');
      fetchDashboardData(true);
      localStorage.removeItem('dashboardNeedsRefresh');
    }
  }, [location]);
  
  /**
   * Listen for custom dashboard refresh events (triggered when projects/tasks are created)
   * This provides real-time updates without requiring navigation
   */
  useEffect(() => {
    const handleDashboardRefresh = () => {
      console.log('🔄 Dashboard refresh triggered by custom event');
      fetchDashboardData(true);
      localStorage.removeItem('dashboardNeedsRefresh');
    };
    
    window.addEventListener('dashboardRefresh', handleDashboardRefresh);
    
    return () => {
      window.removeEventListener('dashboardRefresh', handleDashboardRefresh);
    };
  }, []);

  // Save widget order to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-widget-order', JSON.stringify(widgetOrder));
  }, [widgetOrder]);

  useEffect(() => {
    localStorage.setItem('dashboard-sidebar-order', JSON.stringify(sidebarWidgetOrder));
  }, [sidebarWidgetOrder]);

  const mainDashboardWidgetOrder = useMemo(() => {
    let ids = widgetOrder.filter((id) => widgetSelection[id]);
    if (hideTeamMembersDashboardCard) ids = ids.filter((id) => id !== "team-progress");
    return ids;
  }, [widgetOrder, hideTeamMembersDashboardCard, widgetSelection]);

  const visibleSidebarWidgetOrder = useMemo(() => {
    return sidebarWidgetOrder.filter((id) => widgetSelection[id]);
  }, [sidebarWidgetOrder, widgetSelection]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over?.id) return;
    if (active.id !== over.id) {
      // Check if it's a main widget or sidebar widget
      if (widgetOrder.includes(active.id)) {
        setWidgetOrder((items) => {
          const hideTM = MANAGER_ROLES_HIDE_TEAM_CARD.includes(user?.role);
          const visibleIds = hideTM
            ? items.filter((id) => id !== 'team-progress')
            : [...items];
          const oldIndex = visibleIds.indexOf(active.id);
          const newIndex = visibleIds.indexOf(over.id);
          if (oldIndex === -1 || newIndex === -1) {
            return arrayMove(items, items.indexOf(active.id), items.indexOf(over.id));
          }
          return arrayMove(visibleIds, oldIndex, newIndex);
        });
      } else if (sidebarWidgetOrder.includes(active.id)) {
        setSidebarWidgetOrder((items) => {
          const oldIndex = items.indexOf(active.id);
          const newIndex = items.indexOf(over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  }

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

  // Admin message popup state
  const [showAdminMsg, setShowAdminMsg] = useState(() => {
    // Disable the modal by default for now
    return false; // localStorage.getItem('adminMsgRead') !== 'true';
  });
  const adminMessage = {
    title: t('Welcome to the ERP Dashboard!'),
    body: t('Please review your pending tasks and check the calendar for upcoming events. Contact admin for any urgent issues.')
  };
  const handleCloseAdminMsg = () => {
    setShowAdminMsg(false);
    localStorage.setItem('adminMsgRead', 'true');
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="relative min-h-screen w-full bg-white flex flex-col items-stretch justify-start">
        {/* Faded watermark overlay */}
        <div className="absolute inset-0 bg-white bg-opacity-80 z-10" />
        {/* 0. Add imports for useRef and animated SVG blob */}
        {/* 1. Animated SVG Blob background (add just inside main container, before DashboardLayout): */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="blobGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.12" />
              </linearGradient>
            </defs>
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0 400 300" to="360 400 300" dur="24s" repeatCount="indefinite" />
              <path d="M600,300Q600,400,500,450Q400,500,300,450Q200,400,200,300Q200,200,300,150Q400,100,500,150Q600,200,600,300Z" fill="url(#blobGrad)" />
            </g>
          </svg>
        </div>
        <DashboardLayout>
        <div className="relative z-20 p-2 sm:p-4 lg:p-6 xl:p-8 w-full flex flex-col items-stretch justify-start">
          {/* Error Message */}
          {dashboardData.error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                ⚠️ {dashboardData.error}. Using default values.
              </p>
            </div>
          )}
          <AdminMessagePopup title={t("Admin Message")} message={t("System will be down Sunday 2:00 AM")}/>
          <AdminMessageModal open={showAdminMsg} onClose={handleCloseAdminMsg} message={adminMessage} />
          {/* Responsive main grid: stack on mobile, row on xl+ */}
          <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 gap-x-8 w-full items-stretch justify-start">
            {/* Main content */}
            <div className="flex-1 flex flex-col gap-4 sm:gap-6 lg:gap-8 min-w-0 items-stretch justify-start">
              {/* Summary cards: responsive grid with drag and drop */}
              {/* Use rectSortingStrategy for smoother grid reordering animations */}
              <SortableContext items={mainDashboardWidgetOrder} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                  {mainDashboardWidgetOrder.map((widgetId) => {
                    switch (widgetId) {
                      case 'active-employees':
                        return (
                          <DraggableDashboardCard
                            key={widgetId}
                            id={widgetId}
                            title={t('Active Projects')}
                            value={
                              collapsedWidgets[widgetId]
                                ? <span className="text-sm text-gray-500">Collapsed</span>
                                : (dashboardData.loading ? '...' : <AnimatedNumber n={dashboardData.activeProjects} />)
                            }
                            icon={<svg className="h-9 w-9 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m9-4a4 4 0 1 0-8 0 4 4 0 0 0 8 0z" /></svg>}
                            accent={dashboardData.loading ? '' : 'Active'}
                            gradient="bg-white"
                            shadow="shadow-lg"
                            className="w-full"
                          >
                            <div className="mt-3 flex items-center justify-end gap-2 w-full">
                              <button type="button" onClick={() => toggleWidgetCollapsed(widgetId)} className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100">
                                {collapsedWidgets[widgetId] ? t("Expand") : t("Collapse")}
                              </button>
                              <button type="button" onClick={() => removeWidgetFromDashboard(widgetId)} className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100">
                                {t("Remove")}
                              </button>
                            </div>
                          </DraggableDashboardCard>
                        );
                      case 'active-contracts':
                        return (
                          <DraggableDashboardCard
                            key={widgetId}
                            id={widgetId}
                            title={t('Active Tasks')}
                            value={
                              collapsedWidgets[widgetId]
                                ? <span className="text-sm text-gray-500">Collapsed</span>
                                : (dashboardData.loading ? '...' : <AnimatedNumber n={dashboardData.activeTasks} />)
                            }
                            icon={<svg className="h-9 w-9 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg>}
                            accent={dashboardData.loading ? '' : 'Open'}
                            gradient="bg-white"
                            shadow="shadow-lg"
                            className="w-full"
                          >
                            <div className="mt-3 flex items-center justify-end gap-2 w-full">
                              <button type="button" onClick={() => toggleWidgetCollapsed(widgetId)} className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100">
                                {collapsedWidgets[widgetId] ? t("Expand") : t("Collapse")}
                              </button>
                              <button type="button" onClick={() => removeWidgetFromDashboard(widgetId)} className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100">
                                {t("Remove")}
                              </button>
                            </div>
                          </DraggableDashboardCard>
                        );
                      case 'attendance':
                        return (
                          <DraggableDashboardCard
                            key={widgetId}
                            id={widgetId}
                            title={t('Your Daily Attendance')}
                            valueVariant="compact"
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
                                    <span className="text-base sm:text-lg font-bold text-green-600">
                                      {todayAttendance.checkIn
                                        ? new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                        : "—"}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm text-gray-600">Check-Out:</span>
                                    <span className="text-base sm:text-lg font-bold text-red-500">
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
                                    to="/workplace/my-attendance"
                                    className="text-xs text-indigo-600 hover:underline mt-2 font-medium"
                                  >
                                    View / Mark attendance →
                                  </Link>
                                </div>
                              )
                            }
                            icon={<svg className="h-9 w-9 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 5h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg>}
                            accent={todayAttendance.checkIn ? (todayAttendance.checkOut ? t("Today") : t("Checked in")) : t("Today")}
                            gradient="bg-white"
                            shadow="shadow-lg"
                            className="w-full"
                          >
                            <div className="mt-3 flex items-center justify-end gap-2 w-full">
                              <button type="button" onClick={() => toggleWidgetCollapsed(widgetId)} className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100">
                                {collapsedWidgets[widgetId] ? t("Expand") : t("Collapse")}
                              </button>
                              <button type="button" onClick={() => removeWidgetFromDashboard(widgetId)} className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100">
                                {t("Remove")}
                              </button>
                            </div>
                          </DraggableDashboardCard>
                        );
                      case 'active-tasks':
                        return (
                          <DraggableDashboardCard
                            key={widgetId}
                            id={widgetId}
                            title={t('In Progress')}
                            value={
                              collapsedWidgets[widgetId]
                                ? <span className="text-sm text-gray-500">Collapsed</span>
                                : (dashboardData.loading ? '...' : <AnimatedNumber n={dashboardData.inProgressTenders} />)
                            }
                            icon={<svg className="h-9 w-9 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-6-8h6" /></svg>}
                            accent={dashboardData.loading ? '' : 'Open'}
                            gradient="bg-white"
                            shadow="shadow-lg"
                            className="w-full"
                          >
                            <div className="mt-3 flex items-center justify-end gap-2 w-full">
                              <button type="button" onClick={() => toggleWidgetCollapsed(widgetId)} className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100">
                                {collapsedWidgets[widgetId] ? t("Expand") : t("Collapse")}
                              </button>
                              <button type="button" onClick={() => removeWidgetFromDashboard(widgetId)} className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100">
                                {t("Remove")}
                              </button>
                            </div>
                          </DraggableDashboardCard>
                        );
                      case 'team-progress':
                        return (
                          <DraggableDashboardCard
                            key={widgetId}
                            id={widgetId}
                            title={t('Team Members')}
                            valueVariant="compact"
                            value={
                              collapsedWidgets[widgetId] ? (
                                <div className="text-sm text-gray-500">Collapsed</div>
                              ) :
                              <div className="flex flex-col items-center w-full">
                                <div className="relative flex items-center justify-center">
                                  <svg className="w-14 h-14" viewBox="0 0 48 48">
                                    <circle cx="24" cy="24" r="20" fill="#f1f5f9" />
                                    <circle cx="24" cy="24" r="20" fill="none" stroke="#a5b4fc" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset="0" />
                                    <circle cx="24" cy="24" r="20" fill="none" stroke="#38bdf8" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset={dashboardData.loading ? 125.6 : Math.max(0, 125.6 - (Math.min(dashboardData.teamMembers, 100) * 1.256))} strokeLinecap="round" className="progress-ring" />
                                  </svg>
                                  <span className="absolute text-lg font-bold text-blue-700 animate-countup">
                                    {dashboardData.loading ? '...' : dashboardData.teamMembers}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-600 font-medium mt-1">Active</span>
                              </div>
                            }
                            icon={<svg className="h-9 w-9 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>}
                            accent={dashboardData.loading ? '' : `Total: ${dashboardData.teamMembers}`}
                            gradient="bg-white"
                            shadow="shadow-lg"
                            className="sm:col-span-2 lg:col-span-1 w-full"
                          >
                            <div className="mt-3 flex items-center justify-end gap-2 w-full">
                              <button type="button" onClick={() => toggleWidgetCollapsed(widgetId)} className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100">
                                {collapsedWidgets[widgetId] ? t("Expand") : t("Collapse")}
                              </button>
                              <button type="button" onClick={() => removeWidgetFromDashboard(widgetId)} className="text-xs font-semibold px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100">
                                {t("Remove")}
                              </button>
                            </div>
                          </DraggableDashboardCard>
                        );
                      case "authority-alerts":
                        return (
                          <DraggableWidgetBox key={widgetId} id={widgetId}>
                            <WidgetFrame
                              title={t("Authority Alerts")}
                              widgetId={widgetId}
                              collapsed={Boolean(collapsedWidgets[widgetId])}
                              onToggleCollapse={toggleWidgetCollapsed}
                              onRemove={removeWidgetFromDashboard}
                            >
                              <div className="text-sm text-gray-600">
                                {t("Upcoming authority submissions, permits, and compliance reminders will appear here.")}
                              </div>
                            </WidgetFrame>
                          </DraggableWidgetBox>
                        );
                      case "document-expiry":
                        return (
                          <DraggableWidgetBox key={widgetId} id={widgetId}>
                            <WidgetFrame
                              title={t("Document Expiry")}
                              widgetId={widgetId}
                              collapsed={Boolean(collapsedWidgets[widgetId])}
                              onToggleCollapse={toggleWidgetCollapsed}
                              onRemove={removeWidgetFromDashboard}
                            >
                              <div className="text-sm text-gray-600">
                                {t("Passport/visa/ID expiry alerts will appear here with actionable links.")}
                              </div>
                            </WidgetFrame>
                          </DraggableWidgetBox>
                        );
                      case "reminders":
                        return (
                          <DraggableWidgetBox key={widgetId} id={widgetId}>
                            <WidgetFrame
                              title={t("Reminders")}
                              widgetId={widgetId}
                              collapsed={Boolean(collapsedWidgets[widgetId])}
                              onToggleCollapse={toggleWidgetCollapsed}
                              onRemove={removeWidgetFromDashboard}
                            >
                              <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                  <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" /></svg>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-indigo-800 text-xs sm:text-sm">{t("Document Expiry")}</div>
                                    <div className="text-xs text-indigo-600">{t("Passport expires in 30 days")}</div>
                                  </div>
                                  <span className="inline-block px-2 py-1 rounded-full bg-indigo-200 text-indigo-800 font-bold text-xs">!</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-rose-50 rounded-lg border border-rose-200">
                                  <svg className="h-5 w-5 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" /></svg>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-rose-800 text-xs sm:text-sm">{t("Urgent Task")}</div>
                                    <div className="text-xs text-rose-600">{t("Project review due today")}</div>
                                  </div>
                                  <span className="inline-block px-2 py-1 rounded-full bg-rose-200 text-rose-800 font-bold text-xs">!</span>
                                </div>
                              </div>
                            </WidgetFrame>
                          </DraggableWidgetBox>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              </SortableContext>

              {/* Your Daily Attendance Statistics — same idea as employee dashboard (PM / Manager / HR / Contractor) */}
              {showPmStyleAttendance && (
                <div className="glass-card bg-gradient-to-br from-green-50 via-white to-cyan-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-green-100 w-full animate-fade-in">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-green-700 mb-3">
                    <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {t("Your Daily Attendance Statistics")}
                  </h3>
                  {attendanceLoading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : attendanceList.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      {t("No attendance records yet. Mark check-in from My Attendance.")}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-green-200">
                            <th className="text-left py-3 font-semibold text-gray-700">{t("Date")}</th>
                            <th className="text-left py-3 font-semibold text-gray-700">{t("Check-In")}</th>
                            <th className="text-left py-3 font-semibold text-gray-700">{t("Check-Out")}</th>
                            <th className="text-left py-3 font-semibold text-gray-700">{t("Hours")}</th>
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
                            const rows = Object.values(byDate)
                              .sort((a, b) => b.date.localeCompare(a.date))
                              .slice(0, 14);
                            return rows.map((row) => {
                              const inTime = row.checkIn
                                ? new Date(row.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : "—";
                              const outTime = row.checkOut
                                ? new Date(row.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : "—";
                              const hours =
                                row.checkIn && row.checkOut
                                  ? ((new Date(row.checkOut) - new Date(row.checkIn)) / (1000 * 60 * 60)).toFixed(1)
                                  : "—";
                              return (
                                <tr key={row.date} className="border-b border-green-100 hover:bg-green-50/40">
                                  <td className="py-3 text-gray-800 font-medium">
                                    {new Date(row.date).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 text-green-600">{inTime}</td>
                                  <td className="py-3 text-red-600">{outTime}</td>
                                  <td className="py-3 text-gray-700">{hours !== "—" ? `${hours}h` : "—"}</td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <Link
                    to="/workplace/my-attendance"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:underline mt-3"
                  >
                    {t("View all attendance")} →
                  </Link>
                </div>
              )}
              
              {/* Balance Sheet & Invoice — not shown for Project Manager (simpler dashboard) */}
              {!isProjectManager && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
                <div className="glass-card bg-gradient-to-br from-indigo-50 via-white to-cyan-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-indigo-100 w-full overflow-x-auto animate-fade-in">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-700 mb-4"><svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg> Balance Sheet</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">
                    <div className="flex items-center gap-2 bg-white/70 rounded-lg px-2">
                      <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg>
                      <select className="border-0 bg-transparent focus:ring-0 w-full text-xs sm:text-sm">
                      <option>Furnitures and fittings</option>
                    </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 rounded-lg px-2">
                      <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg>
                      <select className="border-0 bg-transparent focus:ring-0 w-full text-xs sm:text-sm">
                      <option>Loans</option>
                    </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 rounded-lg px-2">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg>
                      <select className="border-0 bg-transparent focus:ring-0 w-full text-xs sm:text-sm">
                      <option>Clients</option>
                    </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 rounded-lg px-2">
                      <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg>
                      <select className="border-0 bg-transparent focus:ring-0 w-full text-xs sm:text-sm">
                      <option>Imprest and Insurance</option>
                    </select>
                    </div>
                  </div>
                </div>
                <div className="glass-card bg-gradient-to-br from-yellow-50 via-white to-orange-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-yellow-100 w-full overflow-x-auto animate-fade-in">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-yellow-700 mb-4"><svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg> Invoice Pending Payments</h3>
                  <div className="text-gray-400 text-sm sm:text-base">No Record / No Data</div>
                </div>
              </div>
              )}
              
              {/* Unusual Attendance (admin-style placeholder) — hidden for Project Manager */}
              {!isProjectManager && (
                <div className="glass-card bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-pink-100 w-full overflow-x-auto animate-fade-in">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-pink-700 mb-4"><svg className="h-6 w-6 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg> Unusual Attendance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px] text-xs sm:text-sm rounded-xl overflow-hidden border border-pink-100">
                      <thead>
                        <tr className="text-gray-500 border-b bg-pink-50">
                          <th className="py-2 text-left">Name</th>
                          <th className="py-2 text-left">Status</th>
                          <th className="py-2 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white/80">
                          <td className="py-2 font-semibold flex items-center gap-2">OMAR SHAKAN</td>
                          <td className="py-2"><span className="inline-block px-2 py-1 rounded-full bg-pink-100 text-pink-600 font-bold text-xs">No Record</span></td>
                          <td className="py-2"><button className="bg-pink-100 text-pink-700 rounded px-3 py-1 text-xs font-bold shadow hover:bg-pink-200 transition">View</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            {/* Right sidebar: stack below on mobile, right on xl+ */}
            <div className="xl:w-80 w-full mt-6 xl:mt-0 flex-shrink-0 items-stretch justify-start">
              <SortableContext items={visibleSidebarWidgetOrder} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-6">
                  {visibleSidebarWidgetOrder.map((widgetId) => (
                    <DraggableWidgetBox key={widgetId} id={widgetId}>
                      <WidgetFrame
                        title={widgetId === "quick-links" ? t("Quick Links") : t("Calendar")}
                        widgetId={widgetId}
                        collapsed={Boolean(collapsedWidgets[widgetId])}
                        onToggleCollapse={toggleWidgetCollapsed}
                        onRemove={removeWidgetFromDashboard}
                      >
                        <RightWidgetBox
                          simplifiedQuickLinks={isProjectManager}
                          section={rightSidebarSectionForWidgetId(widgetId)}
                        />
                      </WidgetFrame>
                    </DraggableWidgetBox>
                  ))}
                </div>
              </SortableContext>
            </div>
          </div>
        </div>
      </DashboardLayout>
      {/* Customize Widgets Drawer */}
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
                <div className="text-lg font-extrabold text-gray-900">{t("Customize Widgets")}</div>
                <div className="text-xs text-gray-500">{t("Choose widgets, drag to reorder, then save.")}</div>
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
                <div className="text-sm font-bold text-indigo-800 mb-2">{t("Main Widgets")}</div>
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
                            label={t(meta.label)}
                            onToggle={(e) => setWidgetSelection((m) => ({ ...m, [id]: e.target.checked }))}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              <div>
                <div className="text-sm font-bold text-indigo-800 mb-2">{t("Sidebar Widgets")}</div>
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
                            label={t(meta.label)}
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
                {t("Reset to default")}
              </button>
              <button
                type="button"
                onClick={handleSaveWidgetPrefs}
                disabled={savingPrefs}
                className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingPrefs ? t("Saving...") : t("Save")}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Floating chrome — hidden for Project Manager (cleaner, employee-like dashboard) */}
      {!isProjectManager && (
      <>
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 border border-indigo-100 glass-card">
          <svg className="h-6 w-6 text-yellow-400 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" /></svg>
          <div>
            <div className="font-semibold text-gray-700">Document Expiry</div>
            <div className="text-xs text-gray-500">Passport expires in 30 days</div>
          </div>
          <button className="ml-2 text-indigo-500 hover:underline text-xs">View</button>
        </div>
      </div>
      <div className="fixed bottom-20 right-7 z-50 animate-fade-in">
        {showQuickAddMenu && (
          <div className="mb-3 w-56">
            <div className="bg-white/85 backdrop-blur-md border border-indigo-100 shadow-lg rounded-2xl p-2 flex flex-col gap-2">
              <div className="px-3 py-3 text-sm text-gray-500">
                Quick Add is disabled.
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowQuickAddMenu((v) => !v)}
          className="bg-gradient-to-br from-indigo-500 to-cyan-400 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl hover:scale-110 transition-all fab-pop"
          title="Quick Add"
        >
          +
        </button>
      </div>
      </>
      )}
      {/* 8. Add CSS for ripple, bounce, pop, glassmorphism, and fade-in at the end of the file: */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
        .animate-countup { transition: color 0.3s, transform 0.3s; }
        .ripple { position: relative; overflow: hidden; }
        .ripple:after { content: ''; position: absolute; left: 50%; top: 50%; width: 0; height: 0; background: rgba(59,130,246,0.15); border-radius: 100%; transform: translate(-50%, -50%); transition: width 0.4s, height 0.4s; z-index: 0; }
        .ripple:active:after { width: 200px; height: 200px; }
        .bounce { animation: bounce 1.2s infinite alternate; }
        @keyframes bounce { 0% { transform: translateY(0);} 100% { transform: translateY(-6px);} }
        .fab-pop { animation: fabPop 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes fabPop { from { transform: scale(0.7);} to { transform: scale(1);} }
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); }
        .progress-ring { transition: stroke-dashoffset 1s cubic-bezier(.4,0,.2,1); }
        .badge-pop { animation: badgePop 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes badgePop { from { transform: scale(0.7);} to { transform: scale(1);} }
        .animate-bounce-in { animation: bounceIn 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes bounceIn { 0% { transform: scale(0.7); opacity: 0;} 80% { transform: scale(1.1); opacity: 1;} 100% { transform: scale(1); } }
        .animate-progress-bar { animation: progressBar 1.2s cubic-bezier(.4,0,.2,1); }
        @keyframes progressBar { from { width: 0; } to { width: 80%; } }
      `}</style>

      </div>
    </DndContext>
  );
}