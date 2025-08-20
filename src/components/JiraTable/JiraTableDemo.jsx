import React from 'react';
import { JiraProjectTable } from './JiraProjectTable';

export const JiraTableDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section - Matching Team Project Tracker */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Jira-like Project Management Table
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Advanced project tracking with drag-and-drop, inline editing, and expandable subtasks
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - True Edge-to-Edge Layout */}
      <main className="flex-1">
        {/* Table Container - Full Browser Width */}
        <div className="bg-white shadow-xl border border-gray-200 overflow-hidden w-full">
          <JiraProjectTable />
        </div>
      </main>
    </div>
  );
};

