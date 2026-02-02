// Demo positions data for each sub-department
export const demoPositions = {
  "executive-committee": [
    { id: 1, name: "Chief Executive Officer", description: "Overall company leadership and strategic direction", manager: "Rameez Alkadour", employees: 1, status: "Active", salary: "$150,000", requirements: "MBA, 10+ years experience" },
    { id: 2, name: "Chief Financial Officer", description: "Financial planning and corporate finance", manager: "Sarah Johnson", employees: 1, status: "Active", salary: "$120,000", requirements: "CPA, 8+ years experience" },
  ],
  "board-secretariat": [
    { id: 1, name: "Board Secretary", description: "Administrative support and board coordination", manager: "Sarah Johnson", employees: 1, status: "Active", salary: "$80,000", requirements: "Bachelor's degree, 5+ years experience" },
    { id: 2, name: "Executive Assistant", description: "Support for board members and executives", manager: "Mike Chen", employees: 2, status: "Active", salary: "$60,000", requirements: "Associate's degree, 3+ years experience" },
  ],
  "project-planning": [
    { id: 1, name: "Project Manager", description: "Lead project planning and execution", manager: "Abd Aljabar Alabd", employees: 2, status: "Active", salary: "$90,000", requirements: "PMP certification, 5+ years experience" },
    { id: 2, name: "Project Coordinator", description: "Coordinate project activities and resources", manager: "Lisa Wang", employees: 3, status: "Active", salary: "$65,000", requirements: "Bachelor's degree, 3+ years experience" },
  ],
  "project-execution": [
    { id: 1, name: "Senior Developer", description: "Lead technical implementation and development", manager: "Mike Chen", employees: 2, status: "Active", salary: "$110,000", requirements: "Computer Science degree, 7+ years experience" },
    { id: 2, name: "Quality Assurance Engineer", description: "Ensure project quality and testing", manager: "Emma Davis", employees: 2, status: "Active", salary: "$75,000", requirements: "IT degree, 4+ years experience" },
  ],
  "project-monitoring": [
    { id: 1, name: "Project Analyst", description: "Monitor project progress and metrics", manager: "Lisa Wang", employees: 2, status: "Active", salary: "$70,000", requirements: "Business degree, 3+ years experience" },
    { id: 2, name: "Reporting Specialist", description: "Generate project reports and insights", manager: "Alex Rodriguez", employees: 1, status: "Active", salary: "$60,000", requirements: "Data analysis skills, 2+ years experience" },
  ],
  "ui-ux-design": [
    { id: 1, name: "Senior UX Designer", description: "Lead user experience design and research", manager: "Kaddour Alkaodir", employees: 2, status: "Active", salary: "$95,000", requirements: "Design degree, 6+ years experience" },
    { id: 2, name: "UI Designer", description: "Create user interface designs and prototypes", manager: "Emma Davis", employees: 2, status: "Active", salary: "$75,000", requirements: "Design degree, 3+ years experience" },
  ],
  "graphic-design": [
    { id: 1, name: "Creative Director", description: "Lead creative direction and brand strategy", manager: "Emma Davis", employees: 1, status: "Active", salary: "$85,000", requirements: "Art degree, 8+ years experience" },
    { id: 2, name: "Graphic Designer", description: "Create visual designs and marketing materials", manager: "Alex Rodriguez", employees: 2, status: "Active", salary: "$60,000", requirements: "Art degree, 2+ years experience" },
  ],
  "product-design": [
    { id: 1, name: "Product Designer", description: "Design product concepts and user flows", manager: "Alex Rodriguez", employees: 1, status: "Active", salary: "$80,000", requirements: "Design degree, 4+ years experience" },
    { id: 2, name: "Industrial Designer", description: "Design physical product concepts", manager: "Kaddour Alkaodir", employees: 1, status: "Active", salary: "$70,000", requirements: "Industrial design degree, 3+ years experience" },
  ]
};

// Sub-department names mapping
export const subDepartmentNames = {
  "executive-committee": "Executive Committee",
  "board-secretariat": "Board Secretariat",
  "project-planning": "Project Planning",
  "project-execution": "Project Execution",
  "project-monitoring": "Project Monitoring",
  "ui-ux-design": "UI/UX Design",
  "graphic-design": "Graphic Design",
  "product-design": "Product Design"
};

// Status options
export const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" }
];

// Default form data
export const defaultNewPosition = {
  name: '',
  description: '',
  manager: '',
  status: 'Active',
  requirements: ''
};

export const defaultEditPosition = {
  name: '',
  description: '',
  manager: '',
  status: 'Active',
  requirements: ''
};
