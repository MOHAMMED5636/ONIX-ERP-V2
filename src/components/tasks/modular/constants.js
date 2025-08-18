// Task management constants and configurations

// Initial task data
export const initialTasks = [
  {
    id: 1,
    name: "Building construction",
    referenceNumber: "REF-001",
    category: "Development",
    status: "done",
    owner: "MN",
    timeline: [null, null],
    planDays: 10,
    remarks: "",
    assigneeNotes: "",
    attachments: [],
    priority: "Low",
    location: "Onix engineering co.",
    plotNumber: "PLOT-001",
    community: "Downtown District",
    projectType: "Residential",
    projectFloor: "5",
    developerProject: "Onix Development",
    checklist: false,
    rating: 3,
    progress: 50,
    color: "#60a5fa",
    subtasks: [
      {
        id: 11,
        name: "Subitem 1",
        referenceNumber: "REF-001-1",
        category: "Design",
        status: "done",
        owner: "SA",
        timeline: [null, null],
        remarks: "",
        assigneeNotes: "",
        attachments: [],
        priority: "Low",
        location: "",
        plotNumber: "PLOT-001-1",
        community: "Downtown District",
        projectType: "Residential",
        projectFloor: "5",
        developerProject: "Onix Development",
        completed: false,
        checklist: false,
        rating: 2,
        progress: 20,
        color: "#f59e42"
      },
      {
        id: 12,
        name: "Subitem 2",
        category: "Development",
        status: "working",
        owner: "MN",
        due: "2024-07-19",
        priority: "Medium",
        timeline: "2024-07-19 – 2024-07-20",
        location: "",
        completed: false,
        checklist: false,
        rating: 4,
        progress: 60,
        color: "#10b981"
      },
      {
        id: 13,
        name: "Subitem 3",
        category: "Testing",
        status: "not started",
        owner: "AL",
        due: "2024-07-20",
        priority: "High",
        timeline: "2024-07-20 – 2024-07-21",
        location: "",
        completed: false,
        checklist: false,
        rating: 1,
        progress: 0,
        color: "#6366f1"
      },
      {
        id: 14,
        name: "Subitem 4",
        category: "Review",
        status: "stuck",
        owner: "SA",
        due: "2024-07-21",
        priority: "Low",
        timeline: "2024-07-21 – 2024-07-22",
        location: "",
        completed: false,
        checklist: false,
        rating: 5,
        progress: 80,
        color: "#ef4444"
      }
    ],
    expanded: true
  }
];

// Status color mappings
export const statusColors = {
  done: "bg-green-500 text-white",
  working: "bg-yellow-500 text-white",
  stuck: "bg-red-500 text-white",
  "not started": "bg-gray-400 text-white"
};

// Available categories
export const taskCategories = [
  "Design",
  "Development", 
  "Testing",
  "Review",
  "Planning",
  "Documentation",
  "Research",
  "Analysis"
];

// Available priorities
export const taskPriorities = [
  "Low",
  "Medium", 
  "High",
  "Critical"
];

// Available statuses
export const taskStatuses = [
  "not started",
  "working",
  "stuck",
  "done"
];

// Available owners
export const taskOwners = [
  "MN",
  "SA", 
  "AL",
  "JD",
  "RK"
];

// Project types
export const projectTypes = [
  "Residential",
  "Commercial",
  "Industrial",
  "Infrastructure",
  "Mixed-use"
];

// Default new subtask template
export const defaultNewSubtask = {
  name: "",
  referenceNumber: "",
  category: "Design",
  status: "not started",
  owner: "",
  timeline: [null, null],
  planDays: 0,
  remarks: "",
  assigneeNotes: "",
  attachments: [],
  priority: "Low",
  location: ""
};

// Default new task template
export const defaultNewTask = {
  id: null,
  name: "",
  referenceNumber: "",
  category: "Design",
  status: "not started",
  owner: "AL",
  timeline: [null, null],
  planDays: 0,
  remarks: "",
  assigneeNotes: "",
  attachments: [],
  priority: "Low",
  location: "",
  plotNumber: "",
  community: "",
  projectType: "Residential",
  projectFloor: "",
  developerProject: "",
  notes: "",
  autoNumber: 0,
  predecessors: "",
  checklist: false,
  link: "",
  rating: 0,
  progress: 0,
  color: "#60a5fa",
  subtasks: []
};

// Table columns configuration
export const tableColumns = [
  { key: 'name', label: 'Project Name', sortable: true, editable: true },
  { key: 'referenceNumber', label: 'Reference', sortable: true, editable: true },
  { key: 'category', label: 'Category', sortable: true, editable: true },
  { key: 'status', label: 'Status', sortable: true, editable: true },
  { key: 'owner', label: 'Owner', sortable: true, editable: true },
  { key: 'timeline', label: 'Timeline', sortable: true, editable: true },
  { key: 'planDays', label: 'Plan Days', sortable: true, editable: true },
  { key: 'priority', label: 'Priority', sortable: true, editable: true },
  { key: 'location', label: 'Location', sortable: true, editable: true },
  { key: 'progress', label: 'Progress', sortable: true, editable: true },
  { key: 'rating', label: 'Rating', sortable: true, editable: true }
];

// Map picker configuration
export const mapPickerConfig = {
  defaultCenter: { lat: 25.276987, lng: 55.296249 },
  defaultZoom: 10,
  apiKey: "AIzaSyD-EXAMPLE-KEY" // Replace with actual API key
};

// Authentication settings (temporary)
export const isAdmin = true; // TODO: Replace with real authentication logic
