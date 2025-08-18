// Initial policies data
export const initialPolicies = [
  {
    id: 1,
    title: "Employee Handbook 2024",
    description: "Comprehensive guide covering company policies, procedures, and employee rights",
    department: "HR",
    fileType: "PDF",
    fileSize: "2.5 MB",
    lastUpdated: "2024-01-15",
    status: "acknowledged",
    acknowledgedAt: "2024-01-20"
  },
  {
    id: 2,
    title: "Data Protection Policy",
    description: "Guidelines for handling sensitive company and customer data",
    department: "IT",
    fileType: "PDF",
    fileSize: "1.8 MB",
    lastUpdated: "2024-02-01",
    status: "pending"
  },
  {
    id: 3,
    title: "Remote Work Guidelines",
    description: "Policies and procedures for remote work arrangements",
    department: "HR",
    fileType: "DOCX",
    fileSize: "950 KB",
    lastUpdated: "2024-01-30",
    status: "acknowledged",
    acknowledgedAt: "2024-02-05"
  },
  {
    id: 4,
    title: "Health and Safety Protocol",
    description: "Workplace safety guidelines and emergency procedures",
    department: "Operations",
    fileType: "PDF",
    fileSize: "3.2 MB",
    lastUpdated: "2024-02-10",
    status: "pending"
  }
];

// Initial departments
export const initialDepartments = [
  "HR", "IT", "Finance", "Sales", "Marketing", "Operations", 
  "Legal", "Customer Support", "Research & Development", "All Departments"
];

// Status options for filtering
export const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "acknowledged", label: "Acknowledged" }
];

// Department options for filtering
export const departmentOptions = [
  { value: "all", label: "All Departments" },
  { value: "HR", label: "HR" },
  { value: "IT", label: "IT" },
  { value: "Finance", label: "Finance" },
  { value: "Sales", label: "Sales" },
  { value: "Marketing", label: "Marketing" },
  { value: "Operations", label: "Operations" },
  { value: "Legal", label: "Legal" },
  { value: "Customer Support", label: "Customer Support" },
  { value: "Research & Development", label: "Research & Development" }
];

// File type options
export const fileTypeOptions = [
  { value: "PDF", label: "PDF" },
  { value: "DOCX", label: "DOCX" },
  { value: "XLSX", label: "XLSX" },
  { value: "PPTX", label: "PPTX" },
  { value: "TXT", label: "TXT" }
];

// Default form data
export const defaultNewPolicy = {
  title: '',
  description: '',
  department: '',
  file: null
};

export const defaultNewDepartment = {
  name: '',
  description: '',
  manager: ''
};
