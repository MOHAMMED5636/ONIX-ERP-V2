// Refactored MainTable component using modular task management
import React from 'react';
import { TaskProvider, TaskManager } from './modular';

const MainTableRefactored = () => {
  return (
    <TaskProvider>
      <div className="p-6">
        <TaskManager />
      </div>
    </TaskProvider>
  );
};

export default MainTableRefactored;
