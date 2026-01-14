import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import DocumentManagement from "../components/DocumentManagement";
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
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  FolderIcon,
  ComputerDesktopIcon,
  StarIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { key: "dashboard", icon: HomeIcon, label: { en: "Dashboard", ar: "لوحة التحكم" }, path: "/dashboard" },
  // Removed Workplace Hub dropdown (Employees, Departments, Working Locations) to avoid duplication
  // Company Resources dropdown menu
  {
    key: "company-resources-menu",
    icon: BuildingOfficeIcon,
    label: { en: "Company Resources", ar: "موارد الشركة" },
    dropdown: true,
    submenus: [
      { key: "companies", label: { en: "Companies", ar: "الشركات" }, path: "/companies" },
    ],
  },
  // Workplace Hub dropdown menu
  {
    key: "workplace-hub-menu",
    icon: FolderIcon,
    label: { en: "Workplace Hub", ar: "مركز العمل" },
    dropdown: true,
    submenus: [
      { key: "company-policy", label: { en: "Company Policy", ar: "سياسة الشركة" }, path: "/workplace/company-policy" },
      { key: "my-attendance", label: { en: "My Attendance", ar: "حضوري" }, path: "/workplace/my-attendance" },
      { key: "leaves", label: { en: "Leaves", ar: "الإجازات" }, path: "/workplace/leaves" },
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
      { key: "team-members", label: { en: "Team Members", ar: "أعضاء الفريق" }, path: "/team-project-tracker/members" },
      { key: "progress-tracking", label: { en: "Progress Tracking", ar: "تتبع التقدم" }, path: "/team-project-tracker/progress" },
      { key: "reports", label: { en: "Reports", ar: "التقارير" }, path: "/team-project-tracker/reports" },
    ],
  },
  { key: "companies", icon: BriefcaseIcon, label: { en: "Companies", ar: "الشركات" }, path: "/companies" },
  { key: "contractors", icon: UsersIcon, label: { en: "Contractors & Suppliers", ar: "المقاولون والموردون" }, path: "/contractors" },
  { key: "attendance", icon: CalendarDaysIcon, label: { en: "Attendance", ar: "الحضور" }, path: "/attendance" },
  { key: "leaves", icon: DocumentTextIcon, label: { en: "Leaves", ar: "الإجازات" }, path: "/leaves" },
  { key: "balance", icon: ChartPieIcon, label: { en: "Balance", ar: "الميزانية" }, path: "/balance" },
  { key: "bank-reconciliation", icon: BanknotesIcon, label: { en: "Bank Reconciliation", ar: "التوفيق المصرفي" }, path: "/bank-reconciliation" },
  { key: "it-support", icon: ComputerDesktopIcon, label: { en: "IT Support", ar: "دعم تكنولوجيا المعلومات" }, path: "/it-support" },
  { key: "ai-employee-evaluations", icon: StarIcon, label: { en: "AI Employee Evaluations", ar: "تقييم الموظفين بالذكاء الاصطناعي" }, path: "/ai-employee-evaluations" },
  { key: "settings", icon: Cog6ToothIcon, label: { en: "Settings", ar: "الإعدادات" }, path: "/settings" },
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
  'leaves': DocumentTextIcon,
  // Team Project Tracker nested submenu icons
  'project-overview': ChartPieIcon,
  'task-management': ClipboardDocumentListIcon,
  'team-members': UsersIcon,
  'progress-tracking': ChartPieIcon,
  'reports': DocumentTextIcon,
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
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-50 hidden lg:block">
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 280 });
  const profileButtonRef = useRef(null);
  const navigate = useNavigate();
  // Get user from AuthContext - MUST be called before any conditional returns
  const { user: authUser, logout: handleLogout } = useAuth();

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

  // Helper function to get photo URL with cache busting
  const getPhotoUrl = (photo) => {
    if (!photo) {
      return null;
    }
    // If it's already a full URL, add cache busting
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      const separator = photo.includes('?') ? '&' : '?';
      return `${photo}${separator}t=${Date.now()}`;
    }
    // If it's a relative path, construct full URL
    let fullUrl;
    if (photo.startsWith('/uploads/')) {
      fullUrl = `http://192.168.1.54:3001${photo}`;
    } else {
      // If it's just a filename, construct full URL
      fullUrl = `http://192.168.1.54:3001/uploads/photos/${photo}`;
    }
    // Add cache busting
    const separator = fullUrl.includes('?') ? '&' : '?';
    return `${fullUrl}${separator}t=${Date.now()}`;
  };

  // Dynamic user data for sidebar
  console.log('[Sidebar] authUser:', authUser);
  console.log('[Sidebar] authUser?.photo:', authUser?.photo);
  const photoUrl = authUser?.photo ? getPhotoUrl(authUser.photo) : null;
  console.log('[Sidebar] Final photoUrl:', photoUrl);
  const user = {
    name: getUserDisplayName().split(' ')[0], // First name only for sidebar
    avatar: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName())}&background=6366f1&color=fff`,
    status: "Online"
  };

  // Dynamic admin profile data
  const adminPhotoUrl = authUser?.photo ? getPhotoUrl(authUser.photo) : null;
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
      {/* Overlay for mobile */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 lg:hidden"
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
          ${isMobile ? 'w-[90vw] max-w-full transform ' + (collapsed ? '-translate-x-full' : 'translate-x-0') + ' lg:hidden' : (collapsed ? 'w-16 lg:w-16 xl:w-16' : 'w-28 lg:w-28 xl:w-28')}
          flex flex-col justify-between`}
        style={isMobile ? { transition: 'transform 0.3s' } : {}}
      >
        {/* Top: ONIX GROUP Logo */}
        <div className="flex flex-col items-center gap-2 pt-4 pb-2">
          <div className="flex flex-col items-center justify-center mb-1 px-2 bg-black/90 rounded-lg py-2 px-3">
            <div className="text-xs font-bold uppercase tracking-tight">
              <span className="text-red-600">ONIX</span>
              <span className="text-white"> GROUP</span>
            </div>
            <div className="w-full h-0.5 mt-1 bg-gradient-to-r from-white via-white to-red-600"></div>
          </div>
          {/* User Mini-Profile Card */}
          <div className="sidebar-profile w-full flex flex-col items-center mb-2 relative z-50" onClick={e => e.stopPropagation()}>
            <button 
              ref={profileButtonRef}
              onClick={() => setShowProfileMenu((v) => !v)} 
              className="flex flex-col items-center gap-1 w-full px-1 py-1 rounded-xl bg-white/80 shadow border border-indigo-100 hover:bg-indigo-50 transition relative z-10"
            >
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={user.name} 
                  className="h-7 w-7 rounded-full border-2 border-indigo-200 shadow object-cover"
                  onError={(e) => {
                    // Fallback to avatar if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {!photoUrl && (
                <div className="h-7 w-7 rounded-full border-2 border-indigo-200 shadow bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {getUserDisplayName().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              )}
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
                    {photoUrl ? (
                      <img src={photoUrl} alt={user.name} className="h-8 w-8 rounded-full border-2 border-indigo-200 object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {getUserDisplayName().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                    )}
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
                      setShowAdminModal(true);
                      setShowProfileMenu(false);
                    }}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <UserCircleIcon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-indigo-700">Admin Profile</span>
                  </button>

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
        <nav className="flex-1 flex flex-col gap-2 mt-2 px-2 lg:px-0 lg:items-center">
          <div className="mb-2 border-b border-indigo-100 w-full" />
          {navItems.map((item, idx) => {
            if (item.dropdown) {
              const Icon = item.icon;
              const isOpen = openDropdown === item.key;
              return (
                <div key={item.key} className="w-full flex flex-col items-center mb-2 relative sidebar-dropdown" onClick={e => e.stopPropagation()}>
                  <button
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
                        {item.submenus.map((submenu) => {
                          const SubIcon = submenuIcons[submenu.key] || FolderIcon;
                          if (submenu.dropdown && submenu.submenus) {
                            // Nested dropdown (like Departments under Company Resources)
                            return (
                              <div key={submenu.key} className="border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 font-semibold bg-gray-50">
                                  <SubIcon className="h-5 w-5 text-indigo-400" />
                                  <span>{submenu.label[lang]}</span>
                                </div>
                                {submenu.submenus.map((nestedSubmenu) => {
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
                                className={`flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-b border-gray-100 last:border-b-0 ${location.pathname === submenu.path ? "font-bold text-indigo-600 bg-indigo-50" : ""}`}
                                onClick={() => setOpenDropdown(null)}
                              >
                                <SubIcon className="h-5 w-5 text-indigo-400" />
                                <span>{submenu.label[lang]}</span>
                              </Link>
                            );
                          }
                        })}
                      </div>
                      {/* Desktop dropdown - floating */}
                      <div className="hidden lg:block absolute left-full top-0 ml-2 bg-white shadow-2xl rounded-xl w-64 z-50 border border-gray-100 flex flex-col py-2 animate-fade-in" onClick={e => e.stopPropagation()}>
                        {/* Arrow indicator */}
                        <div className="absolute left-0 top-6 -ml-1 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white shadow-lg z-50" />
                        {item.submenus.map((submenu) => {
                          const SubIcon = submenuIcons[submenu.key] || FolderIcon;
                          if (submenu.dropdown && submenu.submenus) {
                            // Nested dropdown (like Departments under Company Resources)
                            return (
                              <div key={submenu.key} className="border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 font-semibold bg-gray-50">
                                  <SubIcon className="h-5 w-5 text-indigo-400" />
                                  <span>{submenu.label[lang]}</span>
                                </div>
                                {submenu.submenus.map((nestedSubmenu) => {
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
                                className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 rounded-lg transition hover:bg-indigo-50 hover:text-indigo-600 ${location.pathname === submenu.path ? "font-bold text-indigo-600 bg-indigo-50" : ""}`}
                                onClick={() => setOpenDropdown(null)}
                              >
                                <SubIcon className="h-5 w-5 text-indigo-400" />
                                <span>{submenu.label[lang]}</span>
                              </Link>
                            );
                          }
                        })}
                      </div>
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
        {/* Bottom: Quick Action, Theme Toggle, Help */}
        <div className="flex flex-col items-center gap-4 pb-6 mt-4">
          {/* Quick Action + Button */}
          <button className="bg-gradient-to-br from-indigo-500 to-cyan-400 text-white rounded-full shadow-lg w-9 h-9 flex items-center justify-center text-2xl hover:scale-110 transition-all fab-pop mb-2" title="Quick Add">
            +
          </button>
          {/* Theme Toggle (placeholder) */}
          <button className="w-8 h-8 rounded-full bg-white/80 shadow border border-indigo-100 flex items-center justify-center hover:bg-indigo-50 transition" title="Toggle Theme">
            <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" /></svg>
          </button>
          {/* Help Button */}
          <button className="w-8 h-8 rounded-full bg-white/80 shadow border border-indigo-100 flex items-center justify-center hover:bg-indigo-50 transition" title="Help & Support">
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