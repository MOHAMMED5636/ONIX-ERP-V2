import { fileUploadConfig } from './constants';

// Handle file upload validation and processing
export const handleFileChange = (field, files, setForm, setFileErrors) => {
  const fileArray = Array.from(files);
  const errors = {};
  const validFiles = [];

  fileArray.forEach((file, index) => {
    // Check file type
    if (!fileUploadConfig.allowedTypes.includes(file.type)) {
      errors[`${field}_${index}`] = "Only PNG, JPG, JPEG, PDF files are allowed";
      return;
    }

    // Check file size
    if (file.size > fileUploadConfig.maxSize) {
      errors[`${field}_${index}`] = `File size must be under ${fileUploadConfig.maxSizeText}`;
      return;
    }

    validFiles.push(file);
  });

  setFileErrors(prev => ({ ...prev, [field]: errors }));

  if (validFiles.length > 0) {
    setForm(prev => ({ 
      ...prev, 
      [field]: field === 'logo' || field === 'header' || field === 'footer' 
        ? validFiles[0] // Single file for logo, header, footer
        : validFiles // Multiple files for other fields
    }));
  }
};

// Remove file from form
export const removeFile = (field, index, form, setForm, setFileErrors) => {
  if (Array.isArray(form[field])) {
    const updatedFiles = form[field].filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, [field]: updatedFiles }));
  } else {
    setForm(prev => ({ ...prev, [field]: null }));
  }
  
  // Clear error for this file
  setFileErrors(prev => {
    const newErrors = { ...prev };
    if (newErrors[field]) {
      delete newErrors[field][`${field}_${index}`];
    }
    return newErrors;
  });
};

// Save company to localStorage
export const saveCompany = (form, isEditMode, companyId) => {
  const existingCompanies = JSON.parse(localStorage.getItem('companies') || '[]');
  
  if (isEditMode) {
    // Update existing company
    const updatedCompanies = existingCompanies.map(company => 
      company.id === companyId ? { ...company, ...form } : company
    );
    localStorage.setItem('companies', JSON.stringify(updatedCompanies));
  } else {
    // Add new company
    const newCompany = {
      ...form,
      id: Date.now()
    };
    const updatedCompanies = [...existingCompanies, newCompany];
    localStorage.setItem('companies', JSON.stringify(updatedCompanies));
  }
};

// Initialize form with company data for edit mode
export const initializeFormForEdit = (company) => {
  return {
    name: company.name || "",
    tag: company.tag || "",
    address: company.address || "",
    contact: company.contact || "",
    logo: company.logo || null,
    header: company.header || null,
    footer: company.footer || null,
    licenseCategory: company.licenseCategory || "",
    legalType: company.legalType || "",
    expiryDate: company.expiryDate || "",
    dunsNumber: company.dunsNumber || "",
    registerNo: company.registerNo || "",
    issueDate: company.issueDate || "",
    mainLicenseNo: company.mainLicenseNo || "",
    dcciNo: company.dcciNo || "",
    trnNumber: company.trnNumber || ""
  };
};

// Validate contact form
export const validateContactForm = (contactForm) => {
  if (!contactForm.name.trim() || !contactForm.email.trim()) {
    return { isValid: false, message: "Name and Email are required" };
  }
  return { isValid: true };
};

// Save contact
export const saveContact = (contactForm, editingContactId, contacts, setContacts) => {
  const validation = validateContactForm(contactForm);
  if (!validation.isValid) {
    alert(validation.message);
    return false;
  }

  if (editingContactId) {
    // Update existing contact
    setContacts(prev => prev.map(contact => 
      contact.id === editingContactId 
        ? { ...contact, ...contactForm }
        : contact
    ));
  } else {
    // Add new contact
    const newContact = {
      ...contactForm,
      id: Date.now()
    };
    setContacts(prev => [...prev, newContact]);
  }
  
  return true;
};

// Delete contact
export const deleteContact = (contactId, contacts, setContacts) => {
  if (window.confirm("Are you sure you want to delete this contact?")) {
    setContacts(prev => prev.filter(contact => contact.id !== contactId));
  }
};

