import React from "react";
import { MagnifyingGlassIcon, UserCircleIcon, FunnelIcon, ChevronUpDownIcon, EyeSlashIcon, Squares2X2Icon, PlusIcon } from "@heroicons/react/24/outline";

export default function ActionControls() {
  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-white border-b border-gray-100">
      <div className="flex items-center gap-2">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow text-sm flex items-center gap-1">
          <PlusIcon className="h-5 w-5" /> New Task
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-2 top-2.5" />
          <input
            type="text"
            placeholder="Search"
            className="pl-8 pr-2 py-2 border border-gray-200 rounded bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ minWidth: 120 }}
          />
        </div>
        <button className="flex items-center gap-1 px-3 py-2 rounded text-gray-600 hover:bg-gray-100 text-sm border border-gray-200">
          <UserCircleIcon className="h-5 w-5" /> Person
        </button>
        <button className="flex items-center gap-1 px-3 py-2 rounded text-gray-600 hover:bg-gray-100 text-sm border border-gray-200">
          <FunnelIcon className="h-5 w-5" /> Filter
        </button>
        <button className="flex items-center gap-1 px-3 py-2 rounded text-gray-600 hover:bg-gray-100 text-sm border border-gray-200">
          <ChevronUpDownIcon className="h-5 w-5" /> Sort
        </button>
        <button className="flex items-center gap-1 px-3 py-2 rounded text-gray-600 hover:bg-gray-100 text-sm border border-gray-200">
          <EyeSlashIcon className="h-5 w-5" /> Hide
        </button>
        <button className="flex items-center gap-1 px-3 py-2 rounded text-gray-600 hover:bg-gray-100 text-sm border border-gray-200">
          <Squares2X2Icon className="h-5 w-5" /> Group By
        </button>
      </div>
    </div>
  );
} 