import React from "react";

const tabs = [
  { key: "main-table", label: "Main Table" },
  { key: "cards", label: "Cards" },
  { key: "table", label: "Table" },
  { key: "kanban", label: "Kanban" },
  { key: "chart", label: "Chart" },
  { key: "file-gallery", label: "File Gallery" },
  { key: "doc", label: "Doc" },
  { key: "custom-view", label: "Customizable View" },
  { key: "form", label: "Form" },
];

export default function TabBar({ activeTab, setActiveTab }) {
  return (
    <nav className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm px-6 pb-0 overflow-x-auto shadow-sm">
      <ul className="flex gap-1 sm:gap-2 whitespace-nowrap">
        {tabs.map((tab, idx) => (
          <li key={tab.key} className={idx === 0 ? 'ml-0' : ''}>
            <button
              className={`px-4 py-3 rounded-t-lg font-semibold text-[15px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                activeTab === tab.key
                  ? "text-blue-700 border-b-2 border-blue-600 bg-gradient-to-b from-blue-50 to-white shadow-sm transform -translate-y-px"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gradient-to-b hover:from-gray-50 hover:to-white hover:border-b-2 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
} 
