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
    <nav className="w-full border-b border-gray-200 bg-white px-4 pt-4 pb-0 overflow-x-auto">
      <ul className="flex gap-2 sm:gap-4 whitespace-nowrap">
        {tabs.map((tab) => (
          <li key={tab.key}>
            <button
              className={`px-4 py-2 rounded-t-md font-medium text-[15px] transition-all duration-150 focus:outline-none ${
                activeTab === tab.key
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
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