import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
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
      { key: "task-management", label: { en: "Task Management", ar: "إدارة المهام" }, path: "/team-project-tracker/tasks" },
      { key: "team-members", label: { en: "Team Members", ar: "أعضاء الفريق" }, path: "/team-project-tracker/members" },
      { key: "progress-tracking", label: { en: "Progress Tracking", ar: "تتبع التقدم" }, path: "/team-project-tracker/progress" },
      { key: "reports", label: { en: "Reports", ar: "التقارير" }, path: "/team-project-tracker/reports" },
    ],
  },
  { key: "companies", icon: BriefcaseIcon, label: { en: "Companies", ar: "الشركات" }, path: "/companies" },
  { key: "attendance", icon: CalendarDaysIcon, label: { en: "Attendance", ar: "الحضور" }, path: "/attendance" },
  { key: "leaves", icon: DocumentTextIcon, label: { en: "Leaves", ar: "الإجازات" }, path: "/leaves" },
  { key: "balance", icon: ChartPieIcon, label: { en: "Balance", ar: "الميزانية" }, path: "/balance" },
  { key: "it-support", icon: ComputerDesktopIcon, label: { en: "IT Support", ar: "دعم تكنولوجيا المعلومات" }, path: "/it-support" },
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
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside on mobile
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && openDropdown && !event.target.closest('.sidebar-dropdown')) {
        setOpenDropdown(null);
      }
      if (showProfileMenu && !event.target.closest('.sidebar-profile')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown, isMobile, showProfileMenu]);

  // Hide sidebar on mobile if collapsed
  if (isMobile && collapsed) return null;

  // Mock user data
  const user = {
    name: "Kaddour",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "Online"
  };

  // Mock admin profile data (copied from Navbar)
  const admin = {
    name: "Kaddour Alksadour",
    jobTitle: "Building Architect",
    middleName: "Ahmed",
    status: "Active",
    id: "021002",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    contacts: {
      mobile: "+971-5034-859",
      email: "archkadd@hotmail.com"
    },
    company: {
      department: "Architecture Department",
      manager: "John Doe",
      joiningDate: "2/8/2021",
      exitDate: "",
      yearsOfService: "4.45",
      attendance: "ONIX TIMING"
    },
    personal: {
      gender: "M",
      nationality: "Syrian Arab Republic",
      birthDay: "1/21/1991",
      maritalStatus: "Married",
      children: 2,
      currentAddress: "Dubai",
      permanentAddress: "Dubai"
    },
    passport: {
      number: "N015340713",
      issueDate: "4/16/2022",
      expiryDate: "10/15/2024"
    },
    residency: {
      sponsorCompany: "ONIX",
      issueDate: "3/9/2023",
      expiryDate: "3/8/2025",
      visaNumber: "784-1991-183517-2",
      employmentSponsor: "ONIX",
      nationalId: "784-1991-183517-2",
      nationalIdExpiry: "3/8/2025",
      insuranceCompany: "MED NET",
      insuranceCard: "097110119351793801",
      insuranceExpiry: "8/14/2025",
      drivingLicenceNumber: "",
      drivingLicenceIssue: "",
      drivingLicenceExpiry: "",
      labourId: "",
      labourIdExpiry: ""
    },
    documents: [
      { name: "PID 2025.pdf", type: "PDF", date: "01/01/2025" },
      { name: "VISA 2023.pdf", type: "PDF", date: "01/01/2023" },
      { name: "PASSPORT 2027.pdf", type: "PDF", date: "01/01/2027" },
      { name: "GRADUATION CERT.pdf", type: "PDF", date: "01/01/2020" }
    ],
    policyAcknowledgements: [
      { name: "DRESS CODE", acknowledged: false }
    ]
  };
  const handleLogout = () => {
    navigate("/login");
  };

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
        {/* Top: Animated/Glowing Logo */}
        <div className="flex flex-col items-center gap-2 pt-4 pb-2">
          <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center animate-logo-glow mb-1">
            <img src="/onix-bg.png" alt="Logo" className="h-7 w-7 rounded-full" />
          </div>
          {/* User Mini-Profile Card */}
          <div className="sidebar-profile w-full flex flex-col items-center mb-2 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowProfileMenu((v) => !v)} className="flex flex-col items-center gap-1 w-full px-1 py-1 rounded-xl bg-white/80 shadow border border-indigo-100 hover:bg-indigo-50 transition relative">
              <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full border-2 border-indigo-200 shadow" />
              <span className="font-bold text-indigo-700 text-xs mt-1">{user.name}</span>
              <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold"><span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> {user.status}</span>
              <svg className="h-3 w-3 text-indigo-400 absolute right-1 top-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showProfileMenu && (
              <div className="absolute left-0 right-0 mt-14 bg-white rounded-xl shadow-lg border border-indigo-100 z-50 flex flex-col text-sm animate-fade-in" onClick={e => e.stopPropagation()}>
                <button className="px-4 py-2 hover:bg-indigo-50 text-left" onClick={() => setShowAdminModal(true)}>
                  <UserCircleIcon className="inline-block w-5 h-5 mr-2 text-indigo-400" /> Admin
                </button>
                <button className="px-4 py-2 hover:bg-red-50 text-left text-red-600" onClick={handleLogout}>
                  <ArrowRightOnRectangleIcon className="inline-block w-5 h-5 mr-2 text-red-400" /> Logout
                </button>
              </div>
            )}
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
              {/* ...rest of the admin modal content as in Navbar... */}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 