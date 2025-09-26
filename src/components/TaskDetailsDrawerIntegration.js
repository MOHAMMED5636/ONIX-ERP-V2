// Integration snippet for main table component
import React, { useState } from 'react';
import TaskDetailsDrawer from './TaskDetailsDrawer';

// Example usage in your main table component:
const MainTableComponent = () => {
  const [drawerTask, setDrawerTask] = useState(null); // Can be task ID (string) or task object

  // Sample task data (replace with your actual data)
  const tasks = [
    {
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
    }
    // ... more tasks
  ];

  return (
    <div>
      {/* Your existing table */}
      <table className="w-full">
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Status</th>
            <th>Assignee</th>
            {/* ... other columns */}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr 
              key={task.id}
              onClick={() => setDrawerTask(task.id)} // Pass task ID
              className="cursor-pointer hover:bg-gray-50"
            >
              <td>{task.title}</td>
              <td>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'Done' ? 'bg-green-100 text-green-800' : 
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </td>
              <td>{task.assignee?.name}</td>
              {/* ... other cells */}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Drawer Component */}
      <TaskDetailsDrawer
        open={!!drawerTask}
        taskId={drawerTask}
        onClose={() => setDrawerTask(null)}
      />
    </div>
  );
};

export default MainTableComponent;



