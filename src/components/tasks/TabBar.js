import React from "react";
import { 
  TableCellsIcon, 
  Squares2X2Icon, 
  RectangleGroupIcon, 
  ChartBarIcon, 
  PhotoIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon, 
  DocumentPlusIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const tabs = [
  { key: "main-table", label: "Main Table", icon: TableCellsIcon },
  { key: "cards", label: "Cards", icon: Squares2X2Icon },
  { key: "kanban", label: "Kanban", icon: RectangleGroupIcon },
  { key: "chart", label: "Chart", icon: ChartBarIcon },
  { key: "file-gallery", label: "File Gallery", icon: PhotoIcon },
  { key: "doc", label: "Doc", icon: DocumentTextIcon },
  { key: "custom-view", label: "Customizable View", icon: Cog6ToothIcon },
  { key: "form", label: "Form", icon: DocumentPlusIcon },
  { key: "project-lifecycle", label: "Project Life Cycle", icon: ArrowPathIcon },
];

export default function TabBar({ activeTab, setActiveTab }) {
  return (
    <nav className="w-full px-6 py-2 overflow-x-auto">
      <ul className="flex gap-2 whitespace-nowrap">
        {tabs.map((tab, idx) => {
          const IconComponent = tab.icon;
          return (
            <li key={tab.key} className={idx === 0 ? 'ml-0' : ''}>
              <button
                className={`group flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 relative overflow-hidden ${
                  activeTab === tab.key
                    ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-blue-600 hover:bg-white/80 hover:shadow-md hover:scale-105"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {/* Background animation for active tab */}
                {activeTab === tab.key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
                )}
                
                <IconComponent className={`h-5 w-5 transition-all duration-300 ${
                  activeTab === tab.key 
                    ? "text-white" 
                    : "text-gray-500 group-hover:text-blue-500"
                }`} />
                
                <span className="relative z-10">{tab.label}</span>
                
                {/* Hover effect */}
                <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                  activeTab === tab.key 
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20" 
                    : "bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10"
                }`}></div>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
} 
