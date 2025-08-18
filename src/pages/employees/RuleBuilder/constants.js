// Constants for RuleBuilder module

// Available roles
export const AVAILABLE_ROLES = [
  'admin',
  'manager', 
  'supervisor',
  'employee',
  'hr_manager',
  'finance_manager',
  'department_head'
];

// Available actions
export const AVAILABLE_ACTIONS = [
  'view',
  'edit', 
  'delete',
  'create'
];

// Available fields
export const AVAILABLE_FIELDS = [
  'name',
  'email',
  'phone',
  'salary',
  'department',
  'position',
  'hireDate',
  'manager',
  'location',
  'status',
  'employeeId',
  'passportNumber',
  'nationalId',
  'insurance',
  'bankDetails',
  'emergencyContact',
  'performanceRating',
  'attendance',
  'leaveBalance'
];

// Available conditions
export const AVAILABLE_CONDITIONS = [
  'department',
  'location', 
  'role',
  'status',
  'manager',
  'hireDate',
  'salary_range'
];

// Operators for conditions
export const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'in_range', label: 'In Range' }
];

// Mock user data for testing
export const MOCK_CURRENT_USER = {
  role: 'admin',
  department: 'IT',
  location: 'HQ - Main Office',
  permissions: ['view', 'edit', 'delete']
};

// Mock employees data
export const MOCK_EMPLOYEES = [
  { id: 1, name: 'Ahmed Ali', email: 'ahmed.ali@email.com', department: 'HR', jobTitle: 'Manager' },
  { id: 2, name: 'Sara Youssef', email: 'sara.y@email.com', department: 'Finance', jobTitle: 'Accountant' },
  { id: 3, name: 'John Smith', email: 'john.smith@email.com', department: 'IT', jobTitle: 'Developer' },
  { id: 4, name: 'Fatima Noor', email: 'fatima.noor@email.com', department: 'Sales', jobTitle: 'Sales Rep' }
];

// Mock employee rules data
export const MOCK_EMPLOYEE_RULES = {
  1: [
    { id: 1, role: 'manager', action: 'view', field: 'salary', conditions: [{ key: 'department', operator: 'equals', value: 'IT' }], description: 'Managers can view salary only for IT department employees', isActive: true },
    { id: 2, role: 'manager', action: 'edit', field: 'phone', conditions: [{ key: 'department', operator: 'equals', value: 'HR' }], description: 'Managers can edit phone numbers for HR department', isActive: true }
  ],
  2: [
    { id: 3, role: 'employee', action: 'view', field: 'phone', conditions: [{ key: 'department', operator: 'equals', value: 'HR' }], description: 'Employees can view phone numbers only for HR department', isActive: true }
  ],
  3: [
    { id: 4, role: 'hr_manager', action: 'edit', field: 'salary', conditions: [{ key: 'role', operator: 'not_equals', value: 'admin' }], description: 'HR managers can edit salary for non admin employees', isActive: true },
    { id: 5, role: 'hr_manager', action: 'view', field: 'performanceRating', conditions: [{ key: 'department', operator: 'equals', value: 'IT' }], description: 'HR managers can view performance ratings for IT department', isActive: true }
  ],
  4: [
    { id: 6, role: 'employee', action: 'view', field: 'email', conditions: [{ key: 'department', operator: 'equals', value: 'Sales' }], description: 'Employees can view emails for Sales department', isActive: true }
  ]
};

// Default new rule template
export const DEFAULT_NEW_RULE = {
  role: '',
  action: '',
  field: '',
  conditions: [{ key: '', operator: 'equals', value: '' }],
  description: '',
  isActive: true
};

// Default edit rule template
export const DEFAULT_EDIT_RULE = {
  role: '',
  action: '',
  field: '',
  conditions: [{ key: '', operator: 'equals', value: '' }],
  description: '',
  isActive: true
};


