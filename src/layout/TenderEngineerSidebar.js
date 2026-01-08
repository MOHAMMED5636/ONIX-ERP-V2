import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Tender Engineer specific navigation items
const tenderEngineerNavItems = [
  { 
    key: "dashboard", 
    icon: HomeIcon, 
    label: { en: "Dashboard", ar: "لوحة التحكم" }, 
    path: "/erp/tender/dashboard" 
  },
  { 
    key: "my-tenders", 
    icon: ClipboardDocumentListIcon, 
    label: { en: "My Tenders", ar: "مناقصاتي" }, 
    path: "/erp/tender/dashboard" 
  },
  { 
    key: "submissions", 
    icon: DocumentTextIcon, 
    label: { en: "Submissions", ar: "التقديمات" }, 
    path: "/erp/tender/submissions" 
  },
  { 
    key: "settings", 
    icon: Cog6ToothIcon, 
    label: { en: "Settings", ar: "الإعدادات" }, 
    path: "/erp/tender/settings" 
  },
];

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

export default function TenderEngineerSidebar({ collapsed, onToggle }) {
  const { t, lang } = useLanguage();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { user: authUser, logout: handleLogout } = useAuth();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown when clicking outside on mobile
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.sidebar-profile')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

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

  // Helper function to get photo URL
  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }
    if (photo.startsWith('/uploads/')) {
      return `http://192.168.1.151:3001${photo}`;
    }
    return `http://192.168.1.151:3001/uploads/photos/${photo}`;
  };

  const photoUrl = authUser?.photo ? getPhotoUrl(authUser.photo) : null;
  const user = {
    name: getUserDisplayName().split(' ')[0],
    avatar: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName())}&background=6366f1&color=fff`,
    status: "Online"
  };

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      navigate("/login/tender-engineer");
    } catch (error) {
      console.error('Logout error:', error);
      navigate("/login/tender-engineer");
    }
  };

  // Hide sidebar on mobile if collapsed
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
      {/* Overlay for profile menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'transparent' }}
          onClick={() => setShowProfileMenu(false)}
        />
      )}
      <aside
        className={`fixed top-0 ${dir === "rtl" ? "right-0" : "left-0"} h-full glass-card bg-gradient-to-br from-indigo-50 via-white to-cyan-50 shadow-xl border-r border-indigo-100 z-50 transition-all duration-300
          ${isMobile ? 'w-[90vw] max-w-full transform ' + (collapsed ? '-translate-x-full' : 'translate-x-0') + ' lg:hidden' : (collapsed ? 'w-16 lg:w-16 xl:w-16' : 'w-28 lg:w-28 xl:w-28')}
          flex flex-col justify-between`}
        style={isMobile ? { transition: 'transform 0.3s' } : {}}
      >
        {/* Top: Logo and User Profile */}
        <div className="flex flex-col items-center gap-2 pt-4 pb-2">
          <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center animate-logo-glow mb-1">
            <img src="/onix-bg.png" alt="Logo" className="h-7 w-7 rounded-full" />
          </div>
          {/* User Mini-Profile Card */}
          <div className="sidebar-profile w-full flex flex-col items-center mb-2 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowProfileMenu((v) => !v)} className="flex flex-col items-center gap-1 w-full px-1 py-1 rounded-xl bg-white/80 shadow border border-indigo-100 hover:bg-indigo-50 transition relative">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={user.name} 
                  className="h-7 w-7 rounded-full border-2 border-indigo-200 shadow object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {!photoUrl && (
                <div className="h-7 w-7 rounded-full border-2 border-indigo-200 shadow bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {getUserDisplayName().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-bold text-indigo-700 text-xs mt-1">{user.name}</span>
              <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> {user.status}
              </span>
              <svg className="h-3 w-3 text-indigo-400 absolute right-1 top-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showProfileMenu && (
              <div className="absolute left-0 right-0 mt-14 bg-white rounded-xl shadow-lg border border-indigo-100 z-50 flex flex-col text-sm animate-fade-in" onClick={e => e.stopPropagation()}>
                <button className="px-4 py-2 hover:bg-indigo-50 text-left" onClick={() => setShowAdminModal(true)}>
                  <UserCircleIcon className="inline-block w-5 h-5 mr-2 text-indigo-400" /> Profile
                </button>
                <Link to="/erp/tender/settings" className="px-4 py-2 hover:bg-indigo-50 text-left" onClick={() => setShowProfileMenu(false)}>
                  <Cog6ToothIcon className="inline-block w-5 h-5 mr-2 text-indigo-400" /> Settings
                </Link>
                <button className="px-4 py-2 hover:bg-red-50 text-left text-red-600" onClick={handleLogoutClick}>
                  <ArrowRightOnRectangleIcon className="inline-block w-5 h-5 mr-2 text-red-400" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 mt-2 px-2 lg:px-0 lg:items-center">
          <div className="mb-2 border-b border-indigo-100 w-full" />
          {tenderEngineerNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path === "/erp/tender/dashboard" && location.pathname.startsWith("/erp/tender") && location.pathname === "/erp/tender/dashboard");
            return (
              <Tooltip key={item.key} label={item.label[lang]}>
                <Link
                  to={item.path}
                  className={`flex items-center justify-center w-full lg:w-12 h-12 rounded-xl transition text-indigo-500 mb-2 hover:bg-indigo-100 hover:scale-105 nav-pop ${isActive ? "text-indigo-600 font-bold bg-indigo-100" : ""} ${collapsed ? "lg:flex-col" : "lg:flex-row lg:gap-2 lg:px-3"}`}
                  title={item.label[lang]}
                >
                  <Icon className="h-6 w-6" />
                  {!collapsed && (
                    <span className="text-sm font-medium lg:hidden">{item.label[lang]}</span>
                  )}
                </Link>
              </Tooltip>
            );
          })}
        </nav>
        
        {/* Bottom: Quick Actions */}
        <div className="flex flex-col items-center gap-4 pb-6 mt-4">
          <button className="bg-gradient-to-br from-indigo-500 to-cyan-400 text-white rounded-full shadow-lg w-9 h-9 flex items-center justify-center text-2xl hover:scale-110 transition-all fab-pop mb-2" title="Quick Actions">
            +
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
          .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </aside>
      
      {/* Profile Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4" onClick={() => setShowAdminModal(false)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Tender Engineer Profile</h2>
              <button
                className="text-gray-400 hover:text-red-500 text-2xl font-bold"
                onClick={() => setShowAdminModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col items-center gap-4">
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt={getUserDisplayName()} 
                    className="w-24 h-24 rounded-full border-4 border-indigo-200 shadow object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-indigo-200 shadow bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {getUserDisplayName().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">{getUserDisplayName()}</h3>
                  <p className="text-sm text-gray-600">Tender Engineer</p>
                  <p className="text-sm text-gray-500 mt-1">{authUser?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

