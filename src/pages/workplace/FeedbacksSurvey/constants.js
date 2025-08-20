// Constants for FeedbacksSurvey module

export const INITIAL_SURVEYS = [
  {
    id: 1,
    title: "Employee Satisfaction Survey 2024",
    description: "Annual survey to measure employee satisfaction and identify areas for improvement",
    questions: 15,
    dueDate: "2024-03-15",
    responses: 45,
    totalEmployees: 60,
    status: "active",
    completed: false
  },
  {
    id: 2,
    title: "Workplace Environment Feedback",
    description: "Gather feedback about the workplace environment and facilities",
    questions: 8,
    dueDate: "2024-02-28",
    responses: 52,
    totalEmployees: 60,
    status: "completed",
    completed: true
  },
  {
    id: 3,
    title: "Training Program Evaluation",
    description: "Evaluate the effectiveness of recent training programs",
    questions: 12,
    dueDate: "2024-03-20",
    responses: 28,
    totalEmployees: 60,
    status: "active",
    completed: false
  },
  {
    id: 4,
    title: "Remote Work Experience",
    description: "Survey about remote work experience and preferences",
    questions: 10,
    dueDate: "2024-02-15",
    responses: 60,
    totalEmployees: 60,
    status: "completed",
    completed: true
  }
];

export const INITIAL_EMPLOYEES = [
  { id: 1, name: "John Doe", email: "john.doe@company.com", whatsapp: "+1234567890", department: "Engineering" },
  { id: 2, name: "Jane Smith", email: "jane.smith@company.com", whatsapp: "+1234567891", department: "Marketing" },
  { id: 3, name: "Mike Johnson", email: "mike.johnson@company.com", whatsapp: "+1234567892", department: "Sales" },
  { id: 4, name: "Sarah Wilson", email: "sarah.wilson@company.com", whatsapp: "+1234567893", department: "HR" },
  { id: 5, name: "David Brown", email: "david.brown@company.com", whatsapp: "+1234567894", department: "Finance" }
];

export const INITIAL_CLIENTS = [
  { id: 1, name: "ABC Corp", email: "contact@abccorp.com", whatsapp: "+1987654321", company: "ABC Corporation" },
  { id: 2, name: "XYZ Ltd", email: "info@xyzltd.com", whatsapp: "+1987654322", company: "XYZ Limited" },
  { id: 3, name: "DEF Inc", email: "hello@definc.com", whatsapp: "+1987654323", company: "DEF Incorporated" }
];

export const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'text', label: 'Text Input' },
  { value: 'rating', label: 'Rating Scale' },
  { value: 'yes_no', label: 'Yes/No' }
];

export const SURVEY_STATUS_OPTIONS = [
  { value: 'all', label: 'All Surveys' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'draft', label: 'Draft' }
];

export const DELIVERY_OPTIONS = {
  employee: {
    email: 'employeeSendViaEmail',
    whatsapp: 'employeeSendViaWhatsApp'
  },
  client: {
    email: 'clientSendViaEmail',
    whatsapp: 'clientSendViaWhatsApp'
  }
};

export const DEFAULT_NEW_SURVEY = {
  title: '',
  description: '',
  questions: []
};

export const DEFAULT_NEW_QUESTION = {
  question: '',
  type: 'multiple_choice',
  options: [''],
  placeholder: ''
};

export const DEFAULT_DELIVERY_OPTIONS = {
  employeeSendViaEmail: false,
  employeeSendViaWhatsApp: false,
  clientSendViaEmail: false,
  clientSendViaWhatsApp: false,
  sendViaEmail: false,
  sendViaWhatsApp: false,
  recipientEmail: '',
  recipientWhatsApp: '',
  selectedClient: ''
};



