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
} from "@heroicons/react/24/outline";
import onixLogo from "../assets/onix-logo.png";

const employeeNavItems = [
  { key: "dashboard", icon: HomeIcon, label: { en: "Dashboard", ar: "لوحة التحكم" }, path: "/employee/dashboard" },
  { key: "my-projects", icon: FolderIcon, label: { en: "My Projects", ar: "مشاريعي" }, path: "/employee/projects" },
  { key: "my-tasks", icon: ClipboardDocumentListIcon, label: { en: "My Tasks", ar: "مهامي" }, path: "/employee/tasks" },
  { key: "attendance", icon: CalendarDaysIcon, label: { en: "Attendance", ar: "الحضور" }, path: "/employee/attendance" },
  { key: "company-policy", icon: DocumentTextIcon, label: { en: "Company Policy", ar: "سياسة الشركة" }, path: "/employee/company-policy" },
  { key: "profile", icon: UserCircleIcon, label: { en: "Profile", ar: "الملف الشخصي" }, path: "/employee/profile" },
];

function Tooltip({ label, children }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-center justify-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getUserDisplayName = () => {
    if (!authUser) return "User";
    if (authUser.firstName && authUser.lastName) return `${authUser.firstName} ${authUser.lastName}`;
    if (authUser.firstName) return authUser.firstName;
    if (authUser.email) return authUser.email.split("@")[0];
    return "User";
  };

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      navigate("/login");
    } catch (err) {
      navigate("/login");
    }
  };

  if (isMobile && collapsed) return null;

  return (
    <>
      {showProfileMenu && (
        <div className="fixed inset-0 z-40" style={{ background: "transparent" }} onClick={() => setShowProfileMenu(false)} />
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
              className={`${collapsed ? 'h-10 w-10' : 'h-12 w-12'} object-contain rounded-lg shadow-md`}
            />
          </div>
          <div className="sidebar-profile w-full flex flex-col items-center mb-2 relative z-50">
            <button
              ref={profileButtonRef}
              onClick={() => setShowProfileMenu((v) => !v)}
              className="flex flex-col items-center gap-1 w-full px-1 py-1 rounded-xl bg-white/80 shadow border border-slate-200 hover:bg-slate-50 transition"
            >
              <div className="h-7 w-7 rounded-full border-2 border-slate-200 bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center text-white text-[10px] font-bold">
                {getUserDisplayName().split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
              </div>
              <span className="font-bold text-slate-700 text-xs mt-1">{getUserDisplayName().split(" ")[0]}</span>
              <span className="text-[10px] text-slate-500">Employee</span>
            </button>
            {showProfileMenu &&
              createPortal(
                <div
                  className="fixed bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] flex flex-col overflow-hidden"
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
                  <Link
                    to="/employee/profile"
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <UserCircleIcon className="w-5 h-5 text-slate-500" />
                    <span className="text-sm text-gray-700">Profile</span>
                  </Link>
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
          {employeeNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.key} label={item.label[lang]}>
                <Link
                  to={item.path}
                  className={`flex items-center justify-center w-full h-12 rounded-xl transition text-slate-600 mb-2 hover:bg-slate-100 ${isActive ? "bg-slate-200 font-semibold text-slate-800" : ""} ${collapsed ? "lg:flex-col" : "lg:flex-row lg:gap-2 lg:px-3"}`}
                  title={item.label[lang]}
                >
                  <Icon className="h-6 w-6 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium lg:hidden">{item.label[lang]}</span>}
                </Link>
              </Tooltip>
            );
          })}
        </nav>
        <style>{`.glass-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); }`}</style>
      </aside>
    </>
  );
}
