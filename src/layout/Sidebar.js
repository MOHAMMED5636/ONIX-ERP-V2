import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "@heroicons/react/24/outline";

const navItems = [
  { key: "dashboard", icon: HomeIcon, label: { en: "Dashboard", ar: "لوحة التحكم" }, path: "/dashboard" },
  // Employee dropdown menu
  {
    key: "employee-menu",
    icon: UsersIcon,
    label: { en: "", ar: "" },
    dropdown: true,
    submenus: [
      { key: "employees", label: { en: "Employees", ar: "الموظفون" }, path: "/employees" },
      { key: "departments", label: { en: "Departments", ar: "الأقسام" }, path: "/departments" },
      { key: "job-titles", label: { en: "Job Titles", ar: "المسميات الوظيفية" }, path: "/job-titles" },
      { key: "working-locations", label: { en: "Working Locations", ar: "أماكن العمل" }, path: "/working-locations" },
    ],
  },
  // Tasks dropdown menu with Contracts
  {
    key: "tasks-menu",
    icon: ClipboardDocumentListIcon,
    label: { en: "Tasks", ar: "المهام" },
    dropdown: true,
    submenus: [
      { key: "tasks", label: { en: "Task List", ar: "قائمة المهام" }, path: "/tasks" },
      { key: "contracts", label: { en: "Contracts", ar: "العقود" }, path: "/contracts" },
      { key: "create-contract", label: { en: "Create Contract", ar: "إنشاء عقد" }, path: "/contracts/create" },
    ],
  },
  { key: "attendance", icon: CalendarDaysIcon, label: { en: "Attendance", ar: "الحضور" }, path: "/attendance" },
  { key: "leaves", icon: DocumentTextIcon, label: { en: "Leaves", ar: "الإجازات" }, path: "/leaves" },
  { key: "balance", icon: ChartPieIcon, label: { en: "Balance", ar: "الميزانية" }, path: "/balance" },
  { key: "settings", icon: Cog6ToothIcon, label: { en: "Settings", ar: "الإعدادات" }, path: "/settings" },
];

const submenuIcons = {
  employees: UsersIcon,
  departments: ChartPieIcon,
  'job-titles': ClipboardDocumentListIcon,
  'working-locations': CalendarDaysIcon,
  tasks: ClipboardDocumentListIcon,
  contracts: ClipboardDocumentListIcon,
  'create-contract': ClipboardDocumentListIcon,
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

  // Close dropdown when clicking outside on mobile
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 1024 && openDropdown && !event.target.closest('.sidebar-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  return (
    <aside
      className={`fixed top-0 ${dir === "rtl" ? "right-0" : "left-0"} h-full bg-white shadow-lg border-r border-gray-100 z-50 transition-all duration-300 ${
        collapsed 
          ? "w-16 lg:w-16 xl:w-20" 
          : "w-64 lg:w-48 xl:w-64"
      } flex flex-col`}
    >
      {/* Mobile close button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden">
        <img src="/onix-bg.png" alt="Logo" className="h-8 w-8 rounded-full" />
        <button
          className="p-2 focus:outline-none hover:bg-indigo-50 rounded-lg"
          onClick={onToggle}
          aria-label="Close sidebar"
        >
          <XMarkIcon className="h-6 w-6 text-indigo-500" />
        </button>
      </div>

      {/* Desktop toggle button */}
      <button
        className="p-3 focus:outline-none hover:bg-indigo-50 rounded-full mx-auto mt-2 hidden lg:block"
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        {collapsed ? <Bars3Icon className="h-6 w-6 text-indigo-500" /> : <XMarkIcon className="h-6 w-6 text-indigo-500" />}
      </button>

      <nav className="flex-1 flex flex-col gap-2 mt-4 px-2 lg:px-0 lg:items-center">
        {navItems.map((item) => {
          if (item.dropdown) {
            const Icon = item.icon;
            const isOpen = openDropdown === item.key;
            return (
              <div key={item.key} className="w-full flex flex-col items-center mb-2 relative sidebar-dropdown">
                <button
                  className={`flex items-center justify-center w-full lg:w-12 h-12 rounded-xl transition text-indigo-500 hover:bg-indigo-50 hover:scale-105 ${
                    isOpen ? "text-indigo-600 font-bold bg-indigo-50" : ""
                  } ${collapsed ? "lg:flex-col" : "lg:flex-row lg:gap-2 lg:px-3"}`}
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
                    <div className="lg:hidden w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {item.submenus.map((submenu) => {
                        const SubIcon = submenuIcons[submenu.key];
                        return (
                          <Link
                            key={submenu.key}
                            to={submenu.path}
                            className={`flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-b border-gray-100 last:border-b-0 ${
                              location.pathname === submenu.path ? "font-bold text-indigo-600 bg-indigo-50" : ""
                            }`}
                            onClick={() => setOpenDropdown(null)}
                          >
                            <SubIcon className="h-5 w-5 text-indigo-400" />
                            <span>{submenu.label[lang]}</span>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Desktop dropdown - floating */}
                    <div className="hidden lg:block absolute left-full top-0 ml-2 bg-white shadow-2xl rounded-xl w-48 z-50 border border-gray-100 flex flex-col py-2 animate-fade-in">
                      {/* Arrow indicator */}
                      <div className="absolute left-0 top-6 -ml-1 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white shadow-lg z-50" />
                      {item.submenus.map((submenu) => {
                        const SubIcon = submenuIcons[submenu.key];
                        return (
                          <Link
                            key={submenu.key}
                            to={submenu.path}
                            className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 rounded-lg transition hover:bg-indigo-50 hover:text-indigo-600 ${
                              location.pathname === submenu.path ? "font-bold text-indigo-600 bg-indigo-50" : ""
                            }`}
                            onClick={() => setOpenDropdown(null)}
                          >
                            <SubIcon className="h-5 w-5 text-indigo-400" />
                            <span>{submenu.label[lang]}</span>
                          </Link>
                        );
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
                  className={`flex items-center justify-center w-full lg:w-12 h-12 rounded-xl transition text-indigo-500 mb-2 hover:bg-indigo-50 hover:scale-105 ${
                    location.pathname === item.path ? "text-indigo-600 font-bold bg-indigo-50" : ""
                  } ${collapsed ? "lg:flex-col" : "lg:flex-row lg:gap-2 lg:px-3"}`}
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
        
        <Tooltip label={t("Project Chat")}> 
          <Link
            to="/project-chat"
            className={`flex items-center justify-center w-full lg:w-12 h-12 rounded-xl transition mb-2 hover:bg-indigo-50 hover:scale-105 text-gray-500 hover:text-indigo-600 ${
              location.pathname === "/project-chat" ? "text-indigo-600 font-bold bg-indigo-50" : ""
            } ${collapsed ? "lg:flex-col" : "lg:flex-row lg:gap-2 lg:px-3"}`}
          >
            <ChatBubbleLeftRightIcon className="h-7 w-7" />
            {!collapsed && (
              <span className="text-sm font-medium lg:hidden">{t("Project Chat")}</span>
            )}
          </Link>
        </Tooltip>
      </nav>
    </aside>
  );
} 