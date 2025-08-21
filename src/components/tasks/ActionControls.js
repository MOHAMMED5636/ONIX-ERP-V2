import React, { useState } from "react";
import { 
  PlusIcon, 
  FunnelIcon, 
  ArrowDownTrayIcon, 
  Cog6ToothIcon,
  ViewColumnsIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";

export default function ActionControls() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-4 px-6 py-4">
      {/* Left side controls */}
      <div className="flex items-center gap-3">
        {/* Add Task Button */}
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <PlusIcon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Add Task</span>
        </button>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white/80 rounded-xl transition-all duration-200 hover:scale-105" title="Filter">
            <FunnelIcon className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white/80 rounded-xl transition-all duration-200 hover:scale-105" title="Export">
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white/80 rounded-xl transition-all duration-200 hover:scale-105" title="Settings">
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* View Options */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-md">
          <button className="p-2 text-blue-600 bg-blue-100 rounded-lg transition-all duration-200" title="Table View">
            <ViewColumnsIcon className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-all duration-200" title="Grid View">
            <MagnifyingGlassIcon className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-blue-600 rounded-lg transition-all duration-200" title="List View">
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-xl font-medium text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>All Systems Online</span>
        </div>
      </div>
    </div>
  );
} 