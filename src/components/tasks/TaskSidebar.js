import React, { useState } from "react";
import { 
  HomeIcon, 
  DocumentTextIcon, 
  FolderIcon, 
  CogIcon,
  PlusIcon,
  UserIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function TaskSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { icon: HomeIcon, label: "Dashboard", path: "/dashboard", active: false },
    { icon: ClipboardDocumentListIcon, label: "Tasks", path: "/tasks", active: true },
    { icon: FolderIcon, label: "Projects", path: "/projects", active: false },
    { icon: DocumentTextIcon, label: "Reports", path: "/reports", active: false },
    { icon: CalendarIcon, label: "Calendar", path: "/calendar", active: false },
    { icon: ChartBarIcon, label: "Analytics", path: "/analytics", active: false },
    { icon: ChatBubbleLeftRightIcon, label: "Chat", path: "/project-chat", active: false },
    { icon: BellIcon, label: "Notifications", path: "/notifications", active: false },
  ];

  const quickActions = [
    { icon: PlusIcon, label: "Add Task", action: () => console.log("Add Task") },
    { icon: PlusIcon, label: "Add Project", action: () => console.log("Add Project") },
    { icon: PlusIcon, label: "Add Employee", action: () => console.log("Add Employee") },
  ];

  return (
    <div className={`${isExpanded ? 'w-64' : 'w-16'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col h-full relative group`}>
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            K
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Kaddour</p>
              <p className="text-xs text-green-600 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Online
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                item.active
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={!isExpanded ? item.label : ''}
            >
              <item.icon className={`w-5 h-5 ${isExpanded ? 'mr-3' : 'mx-auto'}`} />
              {isExpanded && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Quick Actions */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200"
              >
                <action.icon className="w-4 h-4 mr-3" />
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => navigate("/settings")}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200 group"
          title={!isExpanded ? 'Settings' : ''}
        >
          <CogIcon className={`w-5 h-5 ${isExpanded ? 'mr-3' : 'mx-auto'}`} />
          {isExpanded && <span>Settings</span>}
        </button>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-all duration-200"
      >
        <svg 
          className={`w-3 h-3 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

