import React, { useState } from 'react';
import { 
  PlusIcon,
  ClipboardDocumentIcon
} from "@heroicons/react/24/outline";

const Filters = ({
  search,
  setSearch,
  handleAddNewTask,
  handlePasteProject,
  resetColumnOrder,
  showAddColumnMenu,
  setShowAddColumnMenu,
  addColumnMenuPos,
  addColumnSearch,
  setAddColumnSearch,
  filteredColumnOptions,
  handleAddColumn,
  handleShowAddColumnMenu
}) => {
  // Demo data for dropdowns
  const demoPlans = ["All Plans", "Ref#1234", "Ref#5678", "Ref#9012", "Ref#3456", "Ref#7890"];
  const demoUsers = ["All Users", "MN", "SA", "AH", "MA"];
  const demoCategories = ["All Categories", "Design", "Development", "Testing", "Review"];
  const demoStatuses = ["All Statuses", "pending", "working", "done", "cancelled", "suspended"];
  const demoDates = [
    "2023-07-01",
    "2023-07-05",
    "2023-07-10",
    "2023-07-12",
    "2023-07-15",
    "2023-07-20",
    "2023-07-22",
    "2023-07-25",
  ];

  // Column type options for the add column menu
  const COLUMN_TYPE_OPTIONS = [
    { key: 'status', label: 'Status', icon: '🟢' },
    { key: 'text', label: 'Text', icon: '🔤' },
    { key: 'date', label: 'Date', icon: '📅' },
    { key: 'number', label: 'Number', icon: '🔢' },
    { key: 'dropdown', label: 'Dropdown', icon: '⬇️' },
    { key: 'files', label: 'Files', icon: '📎' },
    { key: 'priority', label: 'Priority', icon: '⚡' },
    { key: 'color', label: 'Color Picker', icon: '🎨' },
  ];

  return (
    <>
      {/* Enhanced Top Bar - Restructured for better alignment */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-lg border border-gray-200">
        {/* Top row with action buttons */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - New Project and Paste buttons */}
          <div className="flex items-center gap-3">
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              onClick={handleAddNewTask}
            >
              <PlusIcon className="w-5 h-5" /> New Project
            </button>
            <button
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              onClick={handlePasteProject}
              title="Paste Project"
            >
              <ClipboardDocumentIcon className="w-5 h-5" /> Paste
            </button>
          </div>
          
          {/* Right side - Add Column button */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                className="p-2.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5" 
                onClick={handleShowAddColumnMenu}
                title="Add column"
              >
                <PlusIcon className="w-5 h-5 text-blue-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Column Menu */}
      {showAddColumnMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72"
          style={{ left: addColumnMenuPos.x, top: addColumnMenuPos.y }}
        >
          <div className="mb-2">
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Search column types..."
              value={addColumnSearch}
              onChange={e => setAddColumnSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredColumnOptions.map(opt => (
              <button
                key={opt.key}
                className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-blue-50 text-left"
                onClick={() => handleAddColumn(opt.key)}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
            {filteredColumnOptions.length === 0 && (
              <div className="text-gray-400 text-sm px-2 py-4">No column types found.</div>
            )}
          </div>
          <button
            className="mt-2 w-full text-blue-600 hover:underline text-sm"
            onClick={() => alert('More column types coming soon!')}
          >
            More columns
          </button>
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
            onClick={() => setShowAddColumnMenu(false)}
            title="Close"
            type="button"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default Filters;



