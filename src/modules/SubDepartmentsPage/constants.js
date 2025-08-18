// Demo sub-departments data for each main department
export const demoSubDepartments = {
  "board-of-directors": [
    { id: 1, name: "Executive Committee", description: "High-level strategic decision making", manager: "Rameez Alkadour", employees: 3, status: "Active", location: "Floor 10", budget: "$500,000" },
    { id: 2, name: "Board Secretariat", description: "Administrative support for board activities", manager: "Sarah Johnson", employees: 2, status: "Active", location: "Floor 9", budget: "$200,000" },
  ],
  "project-management": [
    { id: 1, name: "Project Planning", description: "Project initiation and planning activities", manager: "Abd Aljabar Alabd", employees: 5, status: "Active", location: "Floor 5", budget: "$300,000" },
    { id: 2, name: "Project Execution", description: "Day-to-day project implementation", manager: "Mike Chen", employees: 4, status: "Active", location: "Floor 6", budget: "$400,000" },
    { id: 3, name: "Project Monitoring", description: "Progress tracking and quality control", manager: "Lisa Wang", employees: 3, status: "Active", location: "Floor 7", budget: "$250,000" },
  ],
  "design-management": [
    { id: 1, name: "UI/UX Design", description: "User interface and experience design", manager: "Kaddour Alkaodir", employees: 4, status: "Active", location: "Floor 3", budget: "$350,000" },
    { id: 2, name: "Graphic Design", description: "Visual design and branding", manager: "Emma Davis", employees: 3, status: "Active", location: "Floor 4", budget: "$280,000" },
    { id: 3, name: "Product Design", description: "Product concept and industrial design", manager: "Alex Rodriguez", employees: 2, status: "Active", location: "Floor 2", budget: "$220,000" },
  ]
};

// Department names mapping
export const departmentNames = {
  "board-of-directors": "Board of Directors",
  "project-management": "Project Management", 
  "design-management": "Design Management"
};

// Status options
export const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" }
];

// Default form data
export const defaultNewSubDepartment = {
  name: '',
  description: '',
  manager: '',
  status: 'Active',
  location: '',
  budget: ''
};

export const defaultEditSubDepartment = {
  name: '',
  description: '',
  manager: '',
  status: 'Active',
  location: '',
  budget: ''
};
