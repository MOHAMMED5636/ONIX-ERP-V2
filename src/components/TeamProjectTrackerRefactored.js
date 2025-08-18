// Refactored TeamProjectTracker component using modular task management
import React from 'react';
import { TaskProvider, TaskManager } from './tasks/modular';

const TeamProjectTrackerRefactored = () => {
  return (
    <TaskProvider>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Team Project Tracker</h1>
          <p className="text-gray-600 mt-2">Manage and track project tasks with your team</p>
        </div>
        <TaskManager />
      </div>
    </TaskProvider>
  );
};

export default TeamProjectTrackerRefactored;
