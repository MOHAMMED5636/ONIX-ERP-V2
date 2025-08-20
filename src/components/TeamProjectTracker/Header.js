import React from 'react';
import { PlusIcon, CalendarIcon } from "@heroicons/react/24/outline";

const Header = ({ projectStartDate, handleProjectStartDateChange, handleAddNewTask, setShowNewTask }) => {
  return (
    <div className="glass-card rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Team Project Tracker
          </h1>
          <p className="text-gray-600 text-lg">Manage and track your team's projects with real-time collaboration</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/50 rounded-lg px-4 py-2 border border-white/20">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <input
              type="date"
              value={projectStartDate.toISOString().split('T')[0]}
              onChange={e => handleProjectStartDateChange(new Date(e.target.value))}
              className="bg-transparent border-none outline-none text-gray-700 font-medium"
            />
          </div>
          <button
            onClick={() => { handleAddNewTask(); setShowNewTask(true); }}
            className="fab-pop bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;

