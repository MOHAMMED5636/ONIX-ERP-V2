import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useWelcomeBannerExtras } from "../context/WelcomeBannerExtrasContext";
import DocumentManagement from "../components/DocumentManagement";
import onixLogo from "../assets/onix-logo.png";
import { resolveProfilePhotoUrl } from "../utils/profilePhotoUrl";
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  FolderIcon,
  ComputerDesktopIcon,
  StarIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  MoonIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  SparklesIcon,
  InboxStackIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { key: "dashboard", icon: HomeIcon, label: { en: "Dashboard", ar: "لوحة التحكم" }, path: "/dashboard" },
  // Single Company entry for ADMIN/HR (companies list + org structure from there — no duplicate building icon)
  { key: "companies", icon: BuildingOfficeIcon, label: { en: "Company", ar: "الشركة" }, path: "/companies", roles: ["ADMIN", "HR"] },
  // Workplace Hub dropdown menu
  {
    key: "workplace-hub-menu",
    icon: FolderIcon,
    label: { en: "Workplace Hub", ar: "مركز العمل" },
    dropdown: true,
    submenus: [
      { key: "company-policy", label: { en: "Company Policy", ar: "سياسة الشركة" }, path: "/workplace/company-policy" },
      { key: "my-attendance", label: { en: "My Attendance", ar: "حضوري" }, path: "/workplace/my-attendance", hideForRoles: ["ADMIN"] },
      { key: "my-leaves", label: { en: "Team Leaves", ar: "إجازات الفريق" }, path: "/workplace/leaves" },
      {
        key: "team-leaves",
        label: { en: "Team Leave Management", ar: "إدارة إجازات الفريق" },
        path: "/workplace/leaves/team",
        showForRoles: ["MANAGER", "PROJECT_MANAGER"],
      },
      { key: "feedbacks-survey", label: { en: "Feedbacks & Survey", ar: "التغذية الراجعة والاستبيان" }, path: "/workplace/feedbacks-survey" },
    ],
  },
  // Tasks dropdown menu with Contracts
  {
    key: "tasks-menu",
    icon: ClipboardDocumentListIcon,
    label: { en: "Tasks", ar: "المهام" },
    dropdown: true,
    submenus: [
      { key: "tasks", label: { en: "Project List", ar: "قائمة المهام" }, path: "/tasks" },
      { key: "tender", label: { en: "Tender", ar: "المناقصات" }, path: "/tender" },
      { key: "supervision", label: { en: "Supervision", ar: "الإشراف" }, path: "/tasks?view=supervision" },
      { key: "contracts", label: { en: "Contracts", ar: "العقود" }, path: "/contracts" },
      { key: "clients", label: { en: "Clients", ar: "العملاء" }, path: "/clients" },
      { key: "task-categories", label: { en: "Task Category List", ar: "قائمة فئات المهام" }, path: "/task-categories" },
      { key: "team-project-tracker", label: { en: "Team Project Tracker", ar: "متتبع مشاريع الفريق" }, path: "/team-project-tracker" },
      { key: "project-lifecycle", label: { en: "Project Life Cycle", ar: "دورة حياة المشروع" }, path: "/project-lifecycle" },
    ],
  },
  // Team Project Tracker dropdown menu
  {
    key: "team-project-tracker-menu",
    icon: ChartPieIcon,
    label: { en: "Team Project Tracker", ar: "متتبع مشاريع الفريق" },
    dropdown: true,
    submenus: [
      { key: "project-overview", label: { en: "Project Overview", ar: "نظرة عامة على المشروع" }, path: "/team-project-tracker/overview" },
      { key: "task-management", label: { en: "Project Management", ar: "إدارة المشاريع" }, path: "/team-project-tracker/tasks" },
      { key: "team-members", label: { en: "Team Members", ar: "أعضاء الفريق" }, path: "/team-project-tracker/members", hideForRoles: ["MANAGER", "PROJECT_MANAGER"] },
      { key: "progress-tracking", label: { en: "Progress Tracking", ar: "تتبع التقدم" }, path: "/team-project-tracker/progress" },
      { key: "reports", label: { en: "Reports", ar: "التقارير" }, path: "/team-project-tracker/reports" },
    ],
  },
  { key: "contractors", icon: UsersIcon, label: { en: "Contractors & Suppliers", ar: "المقاولون والموردون" }, path: "/contractors" },
  // Admin/HR attendance list (all employees by date) — not for PROJECT_MANAGER
  { key: "attendance", icon: CalendarDaysIcon, label: { en: "Attendance", ar: "الحضور" }, path: "/attendance", roles: ["ADMIN", "HR"] },
  {
    key: "employee-activity-calendar",
    icon: ClockIcon,
    label: { en: "Employee Activity Calendar", ar: "تقويم نشاط الموظفين" },
    path: "/employee-activity-calendar",
    roles: ["ADMIN", "HR"],
  },
  {
    key: "system-feedback-admin",
    icon: InboxStackIcon,
    label: { en: "System feedback", ar: "ملاحظات النظام" },
    path: "/admin/system-feedback",
    roles: ["ADMIN"],
  },
  { key: "balance", icon: ChartPieIcon, label: { en: "Balance", ar: "الميزانية" }, path: "/balance", hideForRoles: ["MANAGER", "PROJECT_MANAGER"] },
  { key: "bank-reconciliation", icon: BanknotesIcon, label: { en: "Bank Reconciliation", ar: "التوفيق المصرفي" }, path: "/bank-reconciliation", hideForRoles: ["MANAGER", "PROJECT_MANAGER"] },
  { key: "salary-management", icon: CurrencyDollarIcon, label: { en: "Salary Management", ar: "إدارة الرواتب" }, path: "/salary", roles: ["ADMIN", "HR"] },
  { key: "employee-salary-setup", icon: UsersIcon, label: { en: "Employee Salary Setup", ar: "إعداد رواتب الموظفين" }, path: "/salary/employee-setup", roles: ["ADMIN", "HR"] },
  { key: "salary-deductions", icon: DocumentTextIcon, label: { en: "Deductions", ar: "الاستقطاعات" }, path: "/salary/deductions", roles: ["ADMIN", "HR"] },
  { key: "salary-increments", icon: ChartPieIcon, label: { en: "Increments", ar: "الزيادات" }, path: "/salary/increments", roles: ["ADMIN", "HR"] },
  { key: "payroll", icon: CurrencyDollarIcon, label: { en: "Payroll Processing", ar: "معالجة الرواتب" }, path: "/payroll", roles: ["ADMIN", "HR"] },
  { key: "my-salary", icon: CurrencyDollarIcon, label: { en: "My Salary", ar: "راتبي" }, path: "/my-salary", roles: ["MANAGER", "PROJECT_MANAGER"] },
  {
    key: "email-management-menu",
    icon: InboxStackIcon,
    label: { en: "Email Management", ar: "إدارة البريد الإلكتروني" },
    dropdown: true,
    roles: ["ADMIN", "HR"],
    submenus: [
      { key: "email-templates", label: { en: "Email Templates", ar: "قوالب البريد" }, path: "/emails/templates" },
      { key: "email-triggers", label: { en: "Email Triggers", ar: "مشغلات البريد" }, path: "/emails/triggers" },
      { key: "email-logs", label: { en: "Email Logs", ar: "سجلات البريد" }, path: "/emails/logs" },
      { key: "email-queue", label: { en: "Email Queue", ar: "قائمة الانتظار" }, path: "/emails/queue" },
    ],
  },
  {
    key: "it-support-menu",
    icon: ComputerDesktopIcon,
    label: { en: "IT Support", ar: "دعم تكنولوجيا المعلومات" },
    path: "/it-support",
  },
  { key: "ai-employee-evaluations", icon: StarIcon, label: { en: "AI Employee Evaluations", ar: "تقييم الموظفين بالذكاء الاصطناعي" }, path: "/ai-employee-evaluations" },
  { key: "settings", icon: Cog6ToothIcon, label: { en: "Settings", ar: "الإعدادات" }, path: "/settings", hideForRoles: ["MANAGER", "PROJECT_MANAGER"] },
];

const submenuIcons = {
  employees: UsersIcon,
  departments: FolderIcon,
  'working-locations': CalendarDaysIcon,
  tasks: ClipboardDocumentListIcon,
  contracts: ClipboardDocumentListIcon,
  'task-categories': ClipboardDocumentListIcon,
  'team-project-tracker': ClipboardDocumentListIcon,
  'project-lifecycle': ClipboardDocumentListIcon,
  tender: ClipboardDocumentListIcon,
  supervision: ClipboardDocumentListIcon,
  companies: BuildingOfficeIcon,
  'company-policy': DocumentTextIcon,
  'my-attendance': CalendarDaysIcon,
  'feedbacks-survey': ChatBubbleLeftRightIcon,
  'my-leaves': DocumentTextIcon,
  'team-leaves': UsersIcon,
  'email-templates': InboxStackIcon,
  'email-triggers': InboxStackIcon,
  'email-logs': InboxStackIcon,
  'email-queue': InboxStackIcon,
  // Team Project Tracker nested submenu icons
  'project-overview': ChartPieIcon,
  'task-management': ClipboardDocumentListIcon,
  'team-members': UsersIcon,
  'progress-tracking': ChartPieIcon,
  'reports': DocumentTextIcon,
  'it-support-home': ComputerDesktopIcon,
  'dark-mode': MoonIcon,
  'help-support': QuestionMarkCircleIcon,
};

function Tooltip({ label, children }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-white text-gray-800 text-xs rounded shadow-lg whitespace-nowrap z-50 hidden lg:block border border-gray-200">
          {label}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle, dir }) {
  const { t, lang } = useLanguage();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 280 });
  const profileButtonRef = useRef(null);
  const dropdownButtonRefs = useRef({});
  const navigate = useNavigate();
  // Get user from AuthContext - MUST be called before any conditional returns
  const { user: authUser, logout: handleLogout } = useAuth();
  const { welcomeBannerDismissed, restoreWelcomeBanner } = useWelcomeBannerExtras();
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // Persist dropdown open state across navigation/session
  React.useEffect(() => {
    try {
      const saved = sessionStorage.getItem("sidebarOpenDropdownKey");
      if (saved) setOpenDropdown(saved);
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    try {
      if (openDropdown) sessionStorage.setItem("sidebarOpenDropdownKey", String(openDropdown));
      else sessionStorage.removeItem("sidebarOpenDropdownKey");
    } catch {
      /* ignore */
    }
  }, [openDropdown]);

  React.useEffect(() => {
    setAvatarLoadError(false);
  }, [authUser?.photo]);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dropdown position when profile menu is shown
  React.useEffect(() => {
    if (showProfileMenu && profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect();
      const sidebarWidth = collapsed ? 64 : 112; // w-16 = 64px, w-28 = 112px
      setDropdownPosition({
        top: rect.bottom + 8,
        left: collapsed ? rect.right + 8 : rect.left,
        width: collapsed ? 280 : Math.max(rect.width, 280)
      });
    }
  }, [showProfileMenu, collapsed]);

  // Close dropdown when clicking outside on mobile
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && openDropdown && !event.target.closest('.sidebar-dropdown')) {
        setOpenDropdown(null);
      }
      if (showProfileMenu && !event.target.closest('.sidebar-profile') && !event.target.closest('.profile-dropdown-menu')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown, isMobile, showProfileMenu]);

  // Get user display name dynamically
  const getUserDisplayName = () => {
    if (!authUser) return 'User';
    if (authUser.firstName && authUser.lastName) {
      return `${authUser.firstName} ${authUser.lastName}`;
    }
    if (authUser.firstName) {
      return authUser.firstName;
    }
    if (authUser.email) {
      return authUser.email.split('@')[0];
    }
    return 'User';
  };

  // Get role display name
  const getRoleDisplayName = () => {
    if (!authUser || !authUser.role) return '';
    const roleMap = {
      ADMIN: 'Administrator',
      TENDER_ENGINEER: 'Tender Engineer',
      PROJECT_MANAGER: 'Project Manager',
      CONTRACTOR: 'Contractor',
    };
    return roleMap[authUser.role] || authUser.role;
  };

  /** Hide submenu entries for specific roles (e.g. My Attendance for ADMIN). */
  const filterSubmenusByRole = (submenus) => {
    if (!Array.isArray(submenus)) return [];
    return submenus.filter((sub) => {
      if (sub.hideForRoles && authUser?.role && sub.hideForRoles.includes(authUser.role)) {
        return false;
      }
      if (sub.roles && authUser?.role && !sub.roles.includes(authUser.role)) {
        return false;
      }
      if (sub.showForRoles?.length && authUser?.role && !sub.showForRoles.includes(authUser.role)) {
        return false;
      }
      return true;
    });
  };

  const handleToggleDarkMode = () => {
    const root = document.documentElement;
    const nextDark = !root.classList.contains('dark');
    if (nextDark) {
      root.classList.add('dark');
      try {
        localStorage.setItem('onix-theme', 'dark');
      } catch (_) {}
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('onix-theme', 'light');
      } catch (_) {}
    }
    setOpenDropdown(null);
  };

  const handleOpenHelp = () => {
    setShowHelpModal(true);
    setOpenDropdown(null);
  };

  /** Active state for Workplace Hub leave links (My Leaves vs Team). */
  const submenuPathIsActive = (path) => {
    if (path === '/workplace/leaves/team') return location.pathname.startsWith('/workplace/leaves/team');
    if (path === '/workplace/leaves') return location.pathname === '/workplace/leaves';
    return location.pathname === path;
  };

  /** Single submenu row: route link or action (dark mode / help) — matches Manager-style IT Support menu. */
  const renderLeafSubmenu = (submenu, variant) => {
    const SubIcon = submenuIcons[submenu.key] || FolderIcon;
    const isMobile = variant === 'mobile';
    const itemClass = isMobile
      ? 'flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-b border-gray-100 last:border-b-0 w-full text-left'
      : 'flex items-center gap-3 px-4 py-2 text-sm text-gray-700 rounded-lg transition hover:bg-indigo-50 hover:text-indigo-600 w-full text-left';
    let active = '';
    if (submenu.path) {
      if (submenu.path === '/workplace/leaves/team') {
        if (location.pathname.startsWith('/workplace/leaves/team')) {
          active = ' font-bold text-indigo-600 bg-indigo-50';
        }
      } else if (submenu.path === '/workplace/leaves') {
        if (location.pathname === '/workplace/leaves') {
          active = ' font-bold text-indigo-600 bg-indigo-50';
        }
      } else if (location.pathname === submenu.path) {
        active = ' font-bold text-indigo-600 bg-indigo-50';
      }
    }

    if (submenu.action === 'toggleDarkMode') {
      return (
        <button type="button" className={itemClass + active} onClick={handleToggleDarkMode}>
          <SubIcon className="h-5 w-5 text-indigo-400 flex-shrink-0" />
          <span>{submenu.label[lang]}</span>
        </button>
      );
    }
    if (submenu.action === 'openHelp') {
      return (
        <button type="button" className={itemClass + active} onClick={handleOpenHelp}>
          <SubIcon className="h-5 w-5 text-cyan-500 flex-shrink-0" />
          <span>{submenu.label[lang]}</span>
        </button>
      );
    }
    return (
      <Link
        to={submenu.path}
        className={itemClass + active}
        onClick={() => setOpenDropdown(null)}
      >
        <SubIcon className="h-5 w-5 text-indigo-400 flex-shrink-0" />
        <span>{submenu.label[lang]}</span>
      </Link>
    );
  };

  const photoUrl = authUser?.photo ? resolveProfilePhotoUrl(authUser.photo) : null;
  const showSidebarPhoto = Boolean(photoUrl && !avatarLoadError);
  const user = {
    name: getUserDisplayName().split(' ')[0], // First name only for sidebar
    avatar: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName())}&background=6366f1&color=fff`,
    status: "Online"
  };

  // Dynamic admin profile data
  const adminPhotoUrl = photoUrl;
  const admin = authUser ? {
    name: getUserDisplayName(),
    jobTitle: authUser.jobTitle || getRoleDisplayName(),
    middleName: authUser.lastName || '',
    status: "Active",
    id: authUser.id || '',
    avatar: adminPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName())}&background=6366f1&color=fff`,
    contacts: {
      mobile: "",
      email: authUser.email || ""
    },
    company: {
      department: "",
      manager: "",
      joiningDate: "",
      exitDate: "",
      yearsOfService: "",
      attendance: ""
    },
    personal: {
      gender: "",
      nationality: "",
      birthDay: "",
      maritalStatus: "",
      children: 0,
      currentAddress: "",
      permanentAddress: ""
    },
    passport: {
      number: "",
      issueDate: "",
      expiryDate: ""
    },
    residency: {
      sponsorCompany: "",
      issueDate: "",
      expiryDate: "",
      visaNumber: "",
      employmentSponsor: "",
      nationalId: "",
      nationalIdExpiry: "",
      insuranceCompany: "",
      insuranceCard: "",
      insuranceExpiry: "",
      drivingLicenceNumber: "",
      drivingLicenceIssue: "",
      drivingLicenceExpiry: "",
      labourId: "",
      labourIdExpiry: ""
    },
    documents: [],
    policyAcknowledgements: []
  } : {
    name: "Loading...",
    jobTitle: "",
    middleName: "",
    status: "Active",
    id: "",
    avatar: "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff",
    contacts: { mobile: "", email: "" },
    company: { department: "", manager: "", joiningDate: "", exitDate: "", yearsOfService: "", attendance: "" },
    personal: { gender: "", nationality: "", birthDay: "", maritalStatus: "", children: 0, currentAddress: "", permanentAddress: "" },
    passport: { number: "", issueDate: "", expiryDate: "" },
    residency: { sponsorCompany: "", issueDate: "", expiryDate: "", visaNumber: "", employmentSponsor: "", nationalId: "", nationalIdExpiry: "", insuranceCompany: "", insuranceCard: "", insuranceExpiry: "", drivingLicenceNumber: "", drivingLicenceIssue: "", drivingLicenceExpiry: "", labourId: "", labourIdExpiry: "" },
    documents: [],
    policyAcknowledgements: []
  };

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      navigate("/login");
    }
  };

  // Hide sidebar on mobile if collapsed (after all hooks are called)
  if (isMobile && collapsed) return null;

  return (
    <>
      {/* Overlay for mobile - only show when sidebar is open (not collapsed) */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden"
          onClick={onToggle}
        />
      )}
      {/* Overlay for dropdowns (desktop and mobile) */}
      {(showProfileMenu || openDropdown) && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'transparent' }}
          onClick={() => { setShowProfileMenu(false); setOpenDropdown(null); }}
        />
      )}
      <aside
        className={`fixed top-0 ${dir === "rtl" ? "right-0" : "left-0"} h-full glass-card bg-gradient-to-br from-indigo-50 via-white to-cyan-50 shadow-xl border-r border-indigo-100 z-50 transition-all duration-300
          ${isMobile ? 'w-[280px] max-w-[85vw] transform ' + (collapsed ? '-translate-x-full' : 'translate-x-0') + ' lg:hidden' : (collapsed ? 'w-16 lg:w-16 xl:w-16' : 'w-28 lg:w-28 xl:w-28')}
          flex flex-col justify-between`}
        style={isMobile ? { transition: 'transform 0.3s ease-in-out' } : {}}
      >
        {/* Top: ONIX GROUP Logo */}
        <div className="flex flex-col items-center gap-2 pt-4 pb-2">
          <div className="flex flex-col items-center justify-center mb-1 px-2">
            <img
              src={onixLogo}
              alt="Onix Group"
              className={`${collapsed ? "h-10 w-10" : "h-12 w-12"} object-contain rounded-lg shadow-md`}
            />
          </div>
          {/* User Mini-Profile Card */}
          <div className="sidebar-profile w-full flex flex-col items-center mb-2 relative z-50" onClick={e => e.stopPropagation()}>
            <button 
              ref={profileButtonRef}
              onClick={() => setShowProfileMenu((v) => !v)} 
              className="flex flex-col items-center gap-1 w-full px-1 py-1 rounded-xl bg-white/80 shadow border border-indigo-100 hover:bg-indigo-50 transition relative z-10"
            >
              <div className="h-7 w-7 rounded-full border-2 border-indigo-200 shadow bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden shrink-0">
                {showSidebarPhoto ? (
                  <img
                    key={authUser?.photo || "avatar"}
                    src={photoUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setAvatarLoadError(true)}
                  />
                ) : (
                  getUserDisplayName()
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                )}
              </div>
              <span className="font-bold text-indigo-700 text-xs mt-1">{user.name}</span>
              <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold"><span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> {user.status}</span>
              <svg className="h-3 w-3 text-indigo-400 absolute right-1 top-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showProfileMenu && createPortal(
              <div 
                className="fixed bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] flex flex-col overflow-hidden animate-fade-in profile-dropdown-menu"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  minWidth: '280px'
                }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header Section */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full border-2 border-indigo-200 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                      {showSidebarPhoto ? (
                        <img
                          key={(authUser?.photo || "") + "-menu"}
                          src={photoUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={() => setAvatarLoadError(true)}
                        />
                      ) : (
                        getUserDisplayName()
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 truncate">{authUser?.role === 'ADMIN' ? 'Administrator' : authUser?.jobTitle || 'User'}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button 
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 text-left group"
                    onClick={() => {
                      if (authUser?.role === "MANAGER" || authUser?.role === "PROJECT_MANAGER") {
                        setShowProfileMenu(false);
                        navigate("/profile");
                      } else {
                        setShowAdminModal(true);
                        setShowProfileMenu(false);
                      }
                    }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <UserCircleIcon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-indigo-700">
                      {authUser?.role === "MANAGER" || authUser?.role === "PROJECT_MANAGER" ? "Profile" : "Admin Profile"}
                    </span>
                  </button>

                  {(authUser?.role === "MANAGER" || authUser?.role === "PROJECT_MANAGER") && (
                    <button
                      type="button"
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 text-left group"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/preferences");
                      }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <Cog6ToothIcon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-indigo-700">
                        Customization & Preferences
                      </span>
                    </button>
                  )}

                  {authUser?.role !== "MANAGER" && authUser?.role !== "PROJECT_MANAGER" && (
                    <Link 
                      to="/settings" 
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 text-left group block"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <Cog6ToothIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-gray-900">Settings</span>
                    </Link>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-1"></div>

                {/* Logout Button */}
                <div className="p-2">
                  <button 
                    className="w-full px-4 py-3 flex items-center gap-3 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 rounded-xl transition-all duration-200 text-left group border border-red-200 hover:border-red-300"
                    onClick={handleLogoutClick}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="font-semibold text-red-600 group-hover:text-red-700">Logout</span>
                  </button>
                </div>
              </div>
            , document.body)}
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 min-h-0 overflow-y-auto sidebar-nav-scroll flex flex-col gap-2 mt-2 px-2 lg:px-0 lg:items-center">
          <div className="mb-2 border-b border-indigo-100 w-full" />
          {navItems.filter((item) => {
            if (item.hideForRoles && authUser?.role && item.hideForRoles.includes(authUser.role)) {
              return false;
            }
            // If item has roles restriction, check if user role matches
            if (item.roles && authUser?.role) {
              return item.roles.includes(authUser.role);
            }
            // If no roles restriction, show to everyone
            return true;
          }).map((item, idx) => {
            if (item.dropdown) {
              const visibleSubmenus = filterSubmenusByRole(item.submenus || []);
              if (visibleSubmenus.length === 0) {
                return null;
              }
              const Icon = item.icon;
              const isOpen = openDropdown === item.key;
              const dropdownBtnEl = dropdownButtonRefs.current[item.key] || null;
              const dropdownBtnRect = dropdownBtnEl ? dropdownBtnEl.getBoundingClientRect() : null;
              return (
                <div key={item.key} className="w-full flex flex-col items-center mb-2 relative sidebar-dropdown" onClick={e => e.stopPropagation()}>
                  <button
                    ref={(el) => {
                      if (el) dropdownButtonRefs.current[item.key] = el;
                    }}
                    className={`flex items-center justify-center w-full lg:w-12 h-12 rounded-xl transition text-indigo-500 hover:bg-indigo-100 hover:scale-105 nav-pop ${isOpen ? "text-indigo-600 font-bold bg-indigo-100" : ""} ${collapsed ? "lg:flex-col" : "lg:flex-row lg:gap-2 lg:px-3"}`}
                    title={item.label[lang]}
                    onClick={() => setOpenDropdown(isOpen ? null : item.key)}
                  >
                    <Icon className="h-6 w-6" />
                    {!collapsed && (
                      <span className="text-sm font-medium lg:hidden">{item.label[lang] || "Menu"}</span>
                    )}
                  </button>
                  {isOpen && (
                    <>
                      {/* Mobile dropdown - full width */}
                      <div className="lg:hidden w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                        {visibleSubmenus.map((submenu) => {
                          const SubIcon = submenuIcons[submenu.key] || FolderIcon;
                          if (submenu.dropdown && submenu.submenus) {
                            // Nested dropdown (like Departments under Company Resources)
                            return (
                              <div key={submenu.key} className="border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 font-semibold bg-gray-50">
                                  <SubIcon className="h-5 w-5 text-indigo-400" />
                                  <span>{submenu.label[lang]}</span>
                                </div>
                                {filterSubmenusByRole(submenu.submenus || []).map((nestedSubmenu) => {
                                  const NestedIcon = submenuIcons[nestedSubmenu.key] || FolderIcon;
                                  return (
                                    <Link
                                      key={nestedSubmenu.key}
                                      to={nestedSubmenu.path}
                                      className={`flex items-center gap-3 px-8 py-2 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 ${location.pathname === nestedSubmenu.path ? "font-bold text-indigo-600 bg-indigo-50" : ""}`}
                                      onClick={() => setOpenDropdown(null)}
                                    >
                                      <NestedIcon className="h-4 w-4 text-indigo-400" />
                                      <span>{nestedSubmenu.label[lang]}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            );
                          } else {
                            // Regular submenu item
                            return (
                              <Link
                                key={submenu.key}
                                to={submenu.path}
                                className={`flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-b border-gray-100 last:border-b-0 ${submenuPathIsActive(submenu.path) ? "font-bold text-indigo-600 bg-indigo-50" : ""}`}
                                onClick={() => setOpenDropdown(null)}
                              >
                                <SubIcon className="h-5 w-5 text-indigo-400" />
                                <span>{submenu.label[lang]}</span>
                              </Link>
                            );
                          }
                        })}
                      </div>
                      {/* Desktop dropdown - floating (portal, outside sidebar scroll) */}
                      {dropdownBtnRect &&
                        createPortal(
                          <div
                            className="hidden lg:block fixed bg-white shadow-2xl rounded-xl w-64 z-[9999] border border-gray-100 flex flex-col py-2 animate-fade-in dropdown-flyout-scroll"
                            style={{
                              top: `${Math.max(8, Math.min(dropdownBtnRect.top, window.innerHeight - 120))}px`,
                              left: `${Math.max(8, Math.min(dropdownBtnRect.right + 8, window.innerWidth - 280))}px`,
                              maxHeight: "70vh",
                              overflowY: "auto",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Arrow indicator */}
                            <div className="absolute left-0 top-6 -ml-1 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white shadow-lg z-50" />
                            {visibleSubmenus.map((submenu) => {
                              const SubIcon = submenuIcons[submenu.key] || FolderIcon;
                              if (submenu.dropdown && submenu.submenus) {
                                // Nested dropdown (like Departments under Company Resources)
                                return (
                                  <div key={submenu.key} className="border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 font-semibold bg-gray-50">
                                      <SubIcon className="h-5 w-5 text-indigo-400" />
                                      <span>{submenu.label[lang]}</span>
                                    </div>
                                    {filterSubmenusByRole(submenu.submenus || []).map((nestedSubmenu) => {
                                      const NestedIcon = submenuIcons[nestedSubmenu.key] || FolderIcon;
                                      return (
                                        <Link
                                          key={nestedSubmenu.key}
                                          to={nestedSubmenu.path}
                                          className={`flex items-center gap-3 px-8 py-2 text-sm text-gray-600 rounded-lg transition hover:bg-indigo-50 hover:text-indigo-600 ${location.pathname === nestedSubmenu.path ? "font-bold text-indigo-600 bg-indigo-50" : ""}`}
                                          onClick={() => setOpenDropdown(null)}
                                        >
                                          <NestedIcon className="h-4 w-4 text-indigo-400" />
                                          <span>{nestedSubmenu.label[lang]}</span>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                );
                              } else {
                                // Regular submenu item
                                return (
                                  <Link
                                    key={submenu.key}
                                    to={submenu.path}
                                    className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 rounded-lg transition hover:bg-indigo-50 hover:text-indigo-600 ${submenuPathIsActive(submenu.path) ? "font-bold text-indigo-600 bg-indigo-50" : ""}`}
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    <SubIcon className="h-5 w-5 text-indigo-400" />
                                    <span>{submenu.label[lang]}</span>
                                  </Link>
                                );
                              }
                            })}
                          </div>,
                          document.body
                        )}
                    </>
                  )}
                </div>
              );
            } else {
              const Icon = item.icon;
              return (
                <Tooltip key={item.key} label={item.label[lang]}>
                  <Link
                    to={item.path}
                    className={`flex items-center justify-center w-full lg:w-12 h-12 rounded-xl transition text-indigo-500 mb-2 hover:bg-indigo-100 hover:scale-105 nav-pop ${location.pathname === item.path ? "text-indigo-600 font-bold bg-indigo-100" : ""} ${collapsed ? "lg:flex-col" : "lg:flex-row lg:gap-2 lg:px-3"}`}
                    title={item.label[lang]}
                  >
                    <Icon className="h-6 w-6" />
                    {!collapsed && (
                      <span className="text-sm font-medium lg:hidden">{item.label[lang]}</span>
                    )}
                  </Link>
                </Tooltip>
              );
            }
          })}
        </nav>
        {/* Bottom: optional Quick Add (admin/HR only), Theme Toggle, Help */}
        <div className="flex flex-col items-center gap-4 pb-6 mt-4">
          {!['MANAGER', 'PROJECT_MANAGER'].includes(authUser?.role || '') && (
            <button
              type="button"
              className="bg-gradient-to-br from-indigo-500 to-cyan-400 text-white rounded-full shadow-lg w-9 h-9 flex items-center justify-center text-2xl hover:scale-110 transition-all fab-pop mb-2"
              title="Quick Add"
            >
              +
            </button>
          )}
          {welcomeBannerDismissed && (
            <button
              type="button"
              onClick={restoreWelcomeBanner}
              className={
                collapsed
                  ? "w-8 h-8 rounded-full bg-indigo-100/90 shadow border border-indigo-200 flex items-center justify-center hover:bg-indigo-200 transition"
                  : "w-full px-2 py-2 rounded-xl bg-indigo-100/90 border border-indigo-200 text-indigo-800 text-xs font-semibold text-center hover:bg-indigo-200 transition shadow-sm max-w-[11rem]"
              }
              title={lang === "ar" ? "إظهار شريط الترحيب" : "Show welcome banner again"}
            >
              {collapsed ? (
                <SparklesIcon className="h-5 w-5 text-indigo-600" aria-hidden />
              ) : (
                <>
                  <SparklesIcon className="inline h-4 w-4 text-indigo-600 mr-1 align-text-bottom" aria-hidden />
                  {lang === "ar" ? "إظهار الترحيب" : "Show welcome"}
                </>
              )}
            </button>
          )}
          {/* Theme Toggle */}
          <button
            className="w-8 h-8 rounded-full bg-white/80 shadow border border-indigo-100 flex items-center justify-center hover:bg-indigo-50 transition"
            title="Toggle Theme"
            onClick={handleToggleDarkMode}
          >
            <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" /></svg>
          </button>
          {/* Help Button */}
          <button
            className="w-8 h-8 rounded-full bg-white/80 shadow border border-indigo-100 flex items-center justify-center hover:bg-indigo-50 transition"
            title="Help & Support"
            onClick={handleOpenHelp}
          >
            <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 14v.01M12 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 0v4m0 4h.01" /></svg>
          </button>
        </div>
        <style>{`
          .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); }
          .animate-logo-glow { animation: logoGlow 2.5s infinite alternate; }
          @keyframes logoGlow { 0% { box-shadow: 0 0 0 0 #a5b4fc33, 0 0 0 0 #67e8f933; } 100% { box-shadow: 0 0 16px 4px #a5b4fc66, 0 0 32px 8px #67e8f966; } }
          .fab-pop { animation: fabPop 0.7s cubic-bezier(.4,0,.2,1); }
          @keyframes fabPop { from { transform: scale(0.7);} to { transform: scale(1);} }
          .nav-pop { transition: box-shadow 0.2s, transform 0.2s; }
          .nav-pop:hover, .nav-pop:focus { box-shadow: 0 2px 8px 0 #a5b4fc33; }
          .sidebar-nav-scroll { scrollbar-width: none; -ms-overflow-style: none; }
          .sidebar-nav-scroll::-webkit-scrollbar { width: 0px; height: 0px; }
          .dropdown-flyout-scroll { scrollbar-width: none; -ms-overflow-style: none; }
          .dropdown-flyout-scroll::-webkit-scrollbar { width: 0px; height: 0px; }
        `}</style>
      </aside>
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4" onClick={() => setShowAdminModal(false)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Admin Profile</h2>
              <button
                className="text-gray-400 hover:text-red-500 text-2xl font-bold"
                onClick={() => setShowAdminModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <img src={admin.avatar} alt={admin.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-indigo-200 shadow" />
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold text-gray-700">Name:</span>
                      <span className="text-gray-900">{admin.name}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold text-gray-700">Job Title:</span>
                      <span className="text-gray-900">{admin.jobTitle}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold text-gray-700">Middle Name:</span>
                      <span className="text-gray-900">{admin.middleName}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold text-gray-700">Status:</span>
                      <span className={admin.status === "Active" ? "text-green-600" : "text-red-600"}>{admin.status}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="font-semibold text-gray-700">ID:</span>
                      <span className="text-gray-900">{admin.id}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Admin Documents Section */}
              {authUser?.role === 'ADMIN' && (
                <div className="border-t border-gray-200 pt-6">
                  <DocumentManagement userId={authUser?.id} readOnly={false} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 