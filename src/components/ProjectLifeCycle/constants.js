// Constants for ProjectLifeCycle module

export const INITIAL_STAGES = [
  {
    id: 1,
    name: "Planning",
    description: "Project planning and requirements gathering",
    color: "#3B82F6",
    tasks: [
      { id: 1, name: "Define project scope", status: "completed", priority: "high", dueDate: "2024-02-15" },
      { id: 2, name: "Create project timeline", status: "in-progress", priority: "medium", dueDate: "2024-02-20" },
      { id: 3, name: "Identify stakeholders", status: "pending", priority: "low", dueDate: "2024-02-25" }
    ]
  },
  {
    id: 2,
    name: "Design",
    description: "UI/UX design and architecture planning",
    color: "#8B5CF6",
    tasks: [
      { id: 4, name: "Create wireframes", status: "completed", priority: "high", dueDate: "2024-03-01" },
      { id: 5, name: "Design user interface", status: "in-progress", priority: "high", dueDate: "2024-03-10" },
      { id: 6, name: "Plan database schema", status: "pending", priority: "medium", dueDate: "2024-03-15" }
    ]
  },
  {
    id: 3,
    name: "Development",
    description: "Core development and coding",
    color: "#10B981",
    tasks: [
      { id: 7, name: "Set up development environment", status: "completed", priority: "high", dueDate: "2024-03-20" },
      { id: 8, name: "Implement core features", status: "in-progress", priority: "high", dueDate: "2024-04-15" },
      { id: 9, name: "Write unit tests", status: "pending", priority: "medium", dueDate: "2024-04-20" }
    ]
  },
  {
    id: 4,
    name: "Testing",
    description: "Quality assurance and testing",
    color: "#F59E0B",
    tasks: [
      { id: 10, name: "Perform unit testing", status: "pending", priority: "high", dueDate: "2024-04-25" },
      { id: 11, name: "Conduct integration testing", status: "pending", priority: "medium", dueDate: "2024-05-01" },
      { id: 12, name: "User acceptance testing", status: "pending", priority: "low", dueDate: "2024-05-10" }
    ]
  },
  {
    id: 5,
    name: "Deployment",
    description: "Production deployment and launch",
    color: "#EF4444",
    tasks: [
      { id: 13, name: "Prepare production environment", status: "pending", priority: "high", dueDate: "2024-05-15" },
      { id: 14, name: "Deploy to production", status: "pending", priority: "high", dueDate: "2024-05-20" },
      { id: 15, name: "Monitor system performance", status: "pending", priority: "medium", dueDate: "2024-05-25" }
    ]
  }
];

export const STAGE_COLORS = [
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#EC4899", // Pink
  "#6366F1"  // Indigo
];

export const TASK_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#6B7280' },
  { value: 'in-progress', label: 'In Progress', color: '#F59E0B' },
  { value: 'completed', label: 'Completed', color: '#10B981' },
  { value: 'blocked', label: 'Blocked', color: '#EF4444' }
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#10B981' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
  { value: 'urgent', label: 'Urgent', color: '#DC2626' }
];

export const DEFAULT_NEW_STAGE = {
  name: '',
  description: '',
  color: STAGE_COLORS[0],
  tasks: []
};

export const DEFAULT_NEW_TASK = {
  name: '',
  status: 'pending',
  priority: 'medium',
  dueDate: ''
};

// Custom scrollbar styles
export const SCROLLBAR_STYLES = `
  .task-scroll-container {
    overflow-y: auto !important;
    max-height: 200px !important;
    scrollbar-width: thin;
    scrollbar-color: #94a3b8 #f1f5f9;
  }
  .task-scroll-container::-webkit-scrollbar {
    width: 12px !important;
    display: block !important;
  }
  .task-scroll-container::-webkit-scrollbar-track {
    background: #f1f5f9 !important;
    border-radius: 6px !important;
    margin: 2px !important;
  }
  .task-scroll-container::-webkit-scrollbar-thumb {
    background: #64748b !important;
    border-radius: 6px !important;
    border: 2px solid #f1f5f9 !important;
    min-height: 40px !important;
  }
  .task-scroll-container::-webkit-scrollbar-thumb:hover {
    background: #475569 !important;
  }
  .task-scroll-container::-webkit-scrollbar-corner {
    background: #f1f5f9 !important;
  }
`;


