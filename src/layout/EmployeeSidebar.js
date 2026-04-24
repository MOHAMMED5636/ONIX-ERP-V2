import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import {
  HomeIcon,
  FolderIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  UsersIcon,
  ComputerDesktopIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import onixLogo from "../assets/onix-logo.png";
import { resolveProfilePhotoUrl } from "../utils/profilePhotoUrl";

const employeeNavDashboard = {
  key: "dashboard",
  icon: HomeIcon,
  label: { en: "Dashboard", ar: "لوحة التحكم" },
  path: "/employee/dashboard",
};

/** Shown after Workplace Hub (3rd+ sidebar slots) */
const employeeNavTopItems = [
  { key: "my-projects", icon: BriefcaseIcon, label: { en: "My Projects", ar: "مشاريعي" }, path: "/employee/projects" },
  { key: "my-tasks", icon: ClipboardDocumentListIcon, label: { en: "My Tasks", ar: "مهامي" }, path: "/employee/tasks" },
  { key: "my-payroll", icon: CurrencyDollarIcon, label: { en: "My Payroll", ar: "رواتبي" }, path: "/employee/my-payroll" },
  {
    key: "contractors",
    icon: UsersIcon,
    label: { en: "Contractors & Suppliers", ar: "المقاولون والموردون" },
    path: "/employee/contractors",
  },
  {
    key: "it-support",
    icon: ComputerDesktopIcon,
    label: { en: "IT Support", ar: "دعم تكنولوجيا المعلومات" },
    path: "/employee/it-support",
  },
];

/** Same grouping as main ERP Workplace Hub — flyout on desktop, expandable on mobile */
const employeeWorkplaceHub = {
  key: "workplace-hub-menu",
  icon: FolderIcon,
  label: { en: "Workplace Hub", ar: "مركز العمل" },
  submenus: [
    { key: "company-policy", icon: DocumentTextIcon, label: { en: "Company Policy", ar: "سياسة الشركة" }, path: "/employee/company-policy" },
    { key: "my-attendance", icon: CalendarDaysIcon, label: { en: "My Attendance", ar: "حضوري" }, path: "/employee/attendance" },
    { key: "leaves", icon: DocumentTextIcon, label: { en: "Leaves", ar: "الإجازات" }, path: "/employee/leave-request" },
    { key: "feedbacks-survey", icon: ChatBubbleLeftRightIcon, label: { en: "Feedbacks & Survey", ar: "التغذية الراجعة والاستبيان" }, path: "/employee/feedbacks-survey" },
  ],
};

function Tooltip({ label, enabled = true, children }) {
  // When the sidebar is expanded we already render the label next to the icon,
  // so showing a tooltip duplicates the same “Profile” text visually.
  const [show, setShow] = useState(false);
  if (!enabled) return <>{children}</>;
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

export default function EmployeeSidebar({ collapsed, onToggle }) {
  const { lang } = useLanguage();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileButtonRef = useRef(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { user: authUser, logout: handleLogout } = useAuth();
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [authUser?.photo]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && openDropdown && !event.target.closest(".employee-sidebar-dropdown")) {
        setOpenDropdown(null);
      }
      if (showProfileMenu && !event.target.closest(".sidebar-profile") && !event.target.closest(".profile-dropdown-portal")) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobile, openDropdown, showProfileMenu]);

  const getUserDisplayName = () => {
    if (!authUser) return "User";
    if (authUser.firstName && authUser.lastName) return `${authUser.firstName} ${authUser.lastName}`;
    if (authUser.firstName) return authUser.firstName;
    if (authUser.email) return authUser.email.split("@")[0];
    return "User";
  };

  const sidebarPhotoUrl = authUser?.photo ? resolveProfilePhotoUrl(authUser.photo) : null;
  const showSidebarPhoto = Boolean(sidebarPhotoUrl && !avatarLoadError);

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      navigate("/login");
    } catch (err) {
      navigate("/login");
    }
  };

  const handleToggleDarkMode = () => {
    const root = document.documentElement;
    const nextDark = !root.classList.contains("dark");
    if (nextDark) {
      root.classList.add("dark");
      try {
        localStorage.setItem("onix-theme", "dark");
      } catch (_) {}
    } else {
      root.classList.remove("dark");
      try {
        localStorage.setItem("onix-theme", "light");
      } catch (_) {}
    }
  };

  if (isMobile && collapsed) return null;

  return (
    <>
      {(showProfileMenu || openDropdown) && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "transparent" }}
          onClick={() => {
            setShowProfileMenu(false);
            setOpenDropdown(null);
          }}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full glass-card bg-gradient-to-br from-slate-50 via-white to-blue-50 shadow-xl border-r border-slate-200 z-50 transition-all duration-300
          ${isMobile ? "w-[90vw] max-w-full " + (collapsed ? "-translate-x-full" : "translate-x-0") + " lg:hidden" : collapsed ? "w-16" : "w-28"}
          flex flex-col justify-between`}
      >
        <div className="flex flex-col items-center gap-2 pt-4 pb-2">
          <div className="flex flex-col items-center justify-center mb-1 px-2">
            <img
              src={onixLogo}
              alt="Onix Group"
              className={`${collapsed ? "h-10 w-10" : "h-12 w-12"} object-contain rounded-lg shadow-md`}
            />
          </div>
          <div className="sidebar-profile w-full flex flex-col items-center mb-2 relative z-50">
            <button
              ref={profileButtonRef}
              onClick={() => setShowProfileMenu((v) => !v)}
              className="flex flex-col items-center gap-1 w-full px-1 py-1 rounded-xl bg-white/80 shadow border border-slate-200 hover:bg-slate-50 transition"
            >
              <div
                className={`rounded-full border-2 border-slate-200 bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden shrink-0 ${collapsed ? "h-7 w-7" : "h-9 w-9"}`}
              >
                {showSidebarPhoto ? (
                  <img
                    key={authUser?.photo || "avatar"}
                    src={sidebarPhotoUrl}
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
              <span className="font-bold text-slate-700 text-xs mt-1">{getUserDisplayName().split(" ")[0]}</span>
              <span className="text-[10px] text-slate-500">Employee</span>
            </button>
            {showProfileMenu &&
              createPortal(
                <div
                  className="profile-dropdown-portal fixed bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] flex flex-col overflow-hidden"
                  style={{
                    top: profileButtonRef.current ? profileButtonRef.current.getBoundingClientRect().bottom + 8 : 80,
                    left: profileButtonRef.current ? profileButtonRef.current.getBoundingClientRect().left : 16,
                    width: 280,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900 text-sm">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500">{authUser?.email}</p>
                  </div>
                  <div className="py-2">
                    <button
                      type="button"
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-indigo-50 transition-all duration-200 text-left group"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/employee/profile");
                      }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <UserCircleIcon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-indigo-700">Profile</span>
                    </button>

                    <button
                      type="button"
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-indigo-50 transition-all duration-200 text-left group"
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate("/employee/preferences");
                      }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                        <Cog6ToothIcon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-indigo-700">Customization & Preferences</span>
                    </button>
                  </div>

                  <div className="p-2 border-t border-gray-200">
                    <button
                      className="w-full px-4 py-3 flex items-center gap-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 font-medium text-sm"
                      onClick={handleLogoutClick}
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                </div>,
                document.body
              )}
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2 mt-2 px-2">
          <div className="mb-2 border-b border-slate-200 w-full" />
          {/* 1) Dashboard */}
          {(() => {
            const item = employeeNavDashboard;
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.key} label={item.label[lang]} enabled={collapsed}>
                <Link
                  to={item.path}
                  className={`group flex items-center justify-center w-full h-12 rounded-xl transition mb-2 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600 ${isActive ? "bg-indigo-100 font-semibold text-indigo-700" : ""} ${collapsed ? "lg:flex-col" : "lg:flex-row lg:gap-2 lg:px-3"}`}
                  title={item.label[lang]}
                >
                  <Icon className={`h-6 w-6 flex-shrink-0 ${isActive ? "text-indigo-600" : "text-indigo-400 group-hover:text-indigo-500"}`} />
                  {!collapsed && <span className="text-sm font-medium lg:hidden">{item.label[lang]}</span>}
                </Link>
              </Tooltip>
            );
          })()}

          {/* 2) Workplace Hub */}
          {(() => {
            const hub = employeeWorkplaceHub;
            const HubIcon = hub.icon;
            const isOpen = openDropdown === hub.key;
            const hubActive = hub.submenus.some((s) => location.pathname === s.path);
            return (
              <div
                key={hub.key}
                className="w-full flex flex-col items-center mb-2 relative employee-sidebar-dropdown z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip label={hub.label[lang]} enabled={collapsed}>
                  <button
                    type="button"
                    className={`flex items-center justify-center w-full h-12 rounded-xl transition text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600 ${isOpen || hubActive ? "bg-indigo-100 font-semibold text-indigo-700" : ""} ${collapsed ? "lg:flex-col" : "lg:flex-row lg:gap-2 lg:px-3"}`}
                    title={hub.label[lang]}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setOpenDropdown(isOpen ? null : hub.key)}
                  >
                    <HubIcon
                      className={`h-6 w-6 flex-shrink-0 ${isOpen || hubActive ? "text-indigo-600" : "text-indigo-400"}`}
                    />
                    {!collapsed && <span className="text-sm font-medium lg:hidden">{hub.label[lang]}</span>}
                  </button>
                </Tooltip>
                {isOpen && (
                  <>
                    <div
                      className="lg:hidden w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {hub.submenus.map((sub) => {
                        const SubIcon = sub.icon;
                        const subActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={sub.key}
                            to={sub.path}
                            className={`flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-b border-gray-100 last:border-b-0 ${subActive ? "font-bold text-indigo-600 bg-indigo-50" : ""}`}
                            onClick={() => setOpenDropdown(null)}
                          >
                            <SubIcon className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                            <span>{sub.label[lang]}</span>
                          </Link>
                        );
                      })}
                    </div>
                    <div
                      className="hidden lg:block absolute left-full top-0 ml-2 bg-white shadow-2xl rounded-xl w-64 z-50 border border-gray-100 flex flex-col py-2 animate-fade-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="absolute left-0 top-6 -ml-1 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white shadow-lg z-50" />
                      {hub.submenus.map((sub) => {
                        const SubIcon = sub.icon;
                        const subActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={sub.key}
                            to={sub.path}
                            className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 rounded-lg transition hover:bg-indigo-50 hover:text-indigo-600 ${subActive ? "font-bold text-indigo-600 bg-indigo-50" : ""}`}
                            onClick={() => setOpenDropdown(null)}
                          >
                            <SubIcon className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                            <span>{sub.label[lang]}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* 3+) My Projects, My Tasks, Contractors */}
          {employeeNavTopItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/employee/tasks" || item.path === "/employee/contractors"
                ? location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                : location.pathname === item.path;
            return (
              <Tooltip key={item.key} label={item.label[lang]} enabled={collapsed}>
                <Link
                  to={item.path}
                  className={`group flex items-center justify-center w-full h-12 rounded-xl transition mb-2 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600 ${isActive ? "bg-indigo-100 font-semibold text-indigo-700" : ""} ${collapsed ? "lg:flex-col" : "lg:flex-row lg:gap-2 lg:px-3"}`}
                  title={item.label[lang]}
                >
                  <Icon className={`h-6 w-6 flex-shrink-0 ${isActive ? "text-indigo-600" : "text-indigo-400 group-hover:text-indigo-500"}`} />
                  {!collapsed && <span className="text-sm font-medium lg:hidden">{item.label[lang]}</span>}
                </Link>
              </Tooltip>
            );
          })}
        </nav>
        {/* Bottom quick options (same style as manager sidebar) */}
        <div className="flex flex-col items-center gap-3 pb-6 mt-2">
          <button
            type="button"
            onClick={handleToggleDarkMode}
            className="w-8 h-8 rounded-full bg-white/80 shadow border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition"
            title="Dark Mode"
          >
            <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="w-8 h-8 rounded-full bg-white/80 shadow border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition"
            title="Help & Support"
          >
            <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 14v.01M12 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 0v4m0 4h.01" />
            </svg>
          </button>
        </div>
        <style>{`.glass-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); }`}</style>
      </aside>
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowHelpModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Help & Support</h3>
            <p className="text-sm text-slate-600 mb-4">
              For attendance, leave, profile, or task support, please contact HR or IT support team.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
