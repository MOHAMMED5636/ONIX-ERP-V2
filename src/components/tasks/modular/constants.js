// Task management constants and configurations

// Initial task data
export const initialTasks = [];

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



