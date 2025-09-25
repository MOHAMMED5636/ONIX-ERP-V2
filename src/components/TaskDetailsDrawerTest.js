// Test component to verify TaskDetailsDrawer integration
import React, { useState } from 'react';
import TaskDetailsDrawer from './TaskDetailsDrawer';

const TaskDetailsDrawerTest = () => {
  const [drawerTask, setDrawerTask] = useState(null);

  // Sample task data for testing
  const sampleTask = {
    id: "ref-002",
    title: "Website Development",
    status: "Done",
    description: "High priority project — details here...",
    assignee: { id: "u1", name: "SA", avatar: "/avatars/sa.jpg" },
    priority: "High",
    startDate: "2025-09-01",
    dueDate: "2025-09-20",
    location: "Remote",
    planDays: 15,
    remarks: "Need to complete by ...",
    subtasks: [
      { id: "t1", title: "UI Design", status: "To Do", assignee: "Alice" },
      { id: "t2", title: "API Integration", status: "In Progress", assignee: "Bob" }
    ],
    comments: [
      { id: "c1", author: "Mohammed", text: "Started work on UI", createdAt: "2025-09-10T08:00:00Z" }
    ],
    attachments: [{ id: "a1", name: "spec.pdf", url: "/files/spec.pdf" }]
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Task Details Drawer Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={() => setDrawerTask(sampleTask)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Open Drawer with Sample Task
        </button>
        
        <button
          onClick={() => setDrawerTask("ref-002")}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Open Drawer with Task ID (will fetch)
        </button>
      </div>

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        open={!!drawerTask}
        task={drawerTask}
        onClose={() => setDrawerTask(null)}
      />
    </div>
  );
};

export default TaskDetailsDrawerTest;




