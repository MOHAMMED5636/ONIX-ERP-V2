// Helper function to format phone number for submission
export const formatPhoneForSubmission = (phoneNumber, countryCode) => {
  // Remove any non-digit characters except the + sign
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  // Ensure it starts with + if it doesn't already
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

// Validation functions
export const validateStep = (step, form) => {
  let errs = {};
  
  if (step === 0) {
    if (!form.employeeType) errs.employeeType = "Required";
    if (!form.firstName) errs.firstName = "Required";
    if (!form.lastName) errs.lastName = "Required";
    if (!form.employeeId) errs.employeeId = "Required";
    if (!form.status) errs.status = "Required";
  }
  
  if (step === 1) {
    if (!form.gender) errs.gender = "Required";
    if (!form.maritalStatus) errs.maritalStatus = "Required";
    if (!form.nationality) errs.nationality = "Required";
    if (!form.currentAddress) errs.currentAddress = "Required";
    if (!form.childrenCount) errs.childrenCount = "Required";
    if (!form.birthday) errs.birthday = "Required";
  }
  
  if (step === 2) {
    if (!form.contacts[0].value) errs.contacts = "At least one phone required";
    if (form.contacts[0].value && form.contacts[0].value.length < 8) errs.contacts = "Phone number must be at least 8 digits";
    if (!form.emails[0]) errs.emails = "At least one email required";
  }
  
  if (step === 3) {
    if (!form.company) errs.company = "Required";
    if (!form.department) errs.department = "Required";
    if (!form.jobTitle) errs.jobTitle = "Required";
    if (!form.attendanceProgram) errs.attendanceProgram = "Required";
    if (!form.joiningDate) errs.joiningDate = "Required";
    if (!form.companyLocation) errs.companyLocation = "Required";
    if (!form.manager) errs.manager = "Required";
  }
  
  if (step === 4) {
    // Passport
    if (!form.passportNumber) errs.passportNumber = "Required";
    if (!form.passportIssue) errs.passportIssue = "Required";
    if (!form.passportExpiry) errs.passportExpiry = "Required";
    // National ID
    if (!form.nationalIdNumber) errs.nationalIdNumber = "Required";
    if (!form.nationalIdExpiry) errs.nationalIdExpiry = "Required";
    // Residency
    if (!form.residencyNumber) errs.residencyNumber = "Required";
    if (!form.residencyExpiry) errs.residencyExpiry = "Required";
    // Insurance
    if (!form.insuranceNumber) errs.insuranceNumber = "Required";
    if (!form.insuranceExpiry) errs.insuranceExpiry = "Required";
    // Driving
    if (!form.drivingNumber) errs.drivingNumber = "Required";
    if (!form.drivingExpiry) errs.drivingExpiry = "Required";
    // Labour
    if (!form.labourNumber) errs.labourNumber = "Required";
    if (!form.labourExpiry) errs.labourExpiry = "Required";
  }
  
  return errs;
};

// Form handlers
export const createFormHandlers = (form, setForm) => {
  const handleChange = (field, value) => setForm({ ...form, [field]: value });
  
  const handleContactChange = (idx, value, countryCode = null) => {
    const contacts = [...form.contacts];
    contacts[idx].value = value;
    if (countryCode) {
      contacts[idx].countryCode = countryCode;
    }
    setForm({ ...form, contacts });
  };
  
  const handleAddContact = () => setForm({ 
    ...form, 
    contacts: [...form.contacts, { type: "phone", value: "", countryCode: "ae" }] 
  });
  
  const handleRemoveContact = (idx) => setForm({ 
    ...form, 
    contacts: form.contacts.filter((_, i) => i !== idx) 
  });
  
  const handleEmailChange = (idx, value) => {
    const emails = [...form.emails];
    emails[idx] = value;
    setForm({ ...form, emails });
  };
  
  const handleAddEmail = () => setForm({ ...form, emails: [...form.emails, ""] });
  
  const handleRemoveEmail = (idx) => setForm({ 
    ...form, 
    emails: form.emails.filter((_, i) => i !== idx) 
  });
  
  const handleFileChange = (e) => setForm({ ...form, documents: Array.from(e.target.files) });
  
  const handleImageChange = (e) => setForm({ ...form, personalImage: e.target.files[0] });
  
  const handleLegalDocumentChange = (field, file) => setForm({ ...form, [field]: file });
  
  const handleMultiSelect = (field, value) => {
    setForm((prev) => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  return {
    handleChange,
    handleContactChange,
    handleAddContact,
    handleRemoveContact,
    handleEmailChange,
    handleAddEmail,
    handleRemoveEmail,
    handleFileChange,
    handleImageChange,
    handleLegalDocumentChange,
    handleMultiSelect
  };
};

// Search and filter utilities
export const filterEmployees = (employees, searchTerm, filters) => {
  return employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = !filters.department || employee.department === filters.department;
    
    return matchesSearch && matchesFilters;
  });
};

// Document utilities
export const handleUploadDocument = async (employeeId, documentData) => {
  // Simulate API call
  console.log('Uploading document for employee:', employeeId, documentData);
  return new Promise(resolve => setTimeout(resolve, 1000));
};

export const handleViewDocument = (doc) => {
  console.log('Viewing document:', doc);
  // Implementation for viewing document
};

export const handleDownloadDocument = (doc) => {
  console.log('Downloading document:', doc);
  // Implementation for downloading document
};

export const handleDeleteDocument = async (employeeId, docId) => {
  console.log('Deleting document:', employeeId, docId);
  // Implementation for deleting document
  return new Promise(resolve => setTimeout(resolve, 500));
};

// Date utilities
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

export const isDateExpired = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

// Status utilities
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'inactive':
      return 'text-red-600 bg-red-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return '🟢';
    case 'inactive':
      return '🔴';
    case 'pending':
      return '🟡';
    default:
      return '⚪';
  }
};

