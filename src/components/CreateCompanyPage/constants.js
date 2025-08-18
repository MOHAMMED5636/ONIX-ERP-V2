// License category options
export const licenseCategoryOptions = [
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "professional", label: "Professional" },
  { value: "trading", label: "Trading" },
  { value: "construction", label: "Construction" },
  { value: "consulting", label: "Consulting" }
];

// Legal type options
export const legalTypeOptions = [
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corporation", label: "Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "sole-proprietorship", label: "Sole Proprietorship" },
  { value: "branch", label: "Branch" },
  { value: "representative-office", label: "Representative Office" }
];

// File upload configuration
export const fileUploadConfig = {
  allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
  maxSize: 5 * 1024 * 1024, // 5MB
  maxSizeText: "5MB"
};

// Default form state
export const defaultFormState = {
  name: "",
  tag: "",
  address: "",
  contact: "",
  logo: null,
  header: null,
  footer: null,
  licenseCategory: "",
  legalType: "",
  expiryDate: "",
  dunsNumber: "",
  registerNo: "",
  issueDate: "",
  mainLicenseNo: "",
  dcciNo: "",
  trnNumber: ""
};

// Default contact form state
export const defaultContactFormState = {
  name: "",
  email: "",
  phone: "",
  extension: ""
};

// Initial contacts
export const initialContacts = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+971-50-123-4567", extension: "101" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+971-50-987-6543", extension: "102" },
];
