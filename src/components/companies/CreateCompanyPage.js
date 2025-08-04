import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function CreateCompanyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.company;
  
  const [form, setForm] = useState({
    name: "",
    tag: "",
    address: "",
    contact: "",
    logo: null,
    header: null,
    footer: null
  });
  
  const [contacts, setContacts] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", phone: "+971-50-123-4567", extension: "101" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+971-50-987-6543", extension: "102" },
  ]);

  // Contact modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    extension: ""
  });
  const [editingContactId, setEditingContactId] = useState(null);

  // File upload state
  const [fileErrors, setFileErrors] = useState({});

  // Initialize form with company data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setForm({
        name: isEditMode.name || "",
        tag: isEditMode.tag || "",
        address: isEditMode.address || "",
        contact: isEditMode.contact || "",
        logo: isEditMode.logo || null,
        header: isEditMode.header || null,
        footer: isEditMode.footer || null
      });
    }
  }, [isEditMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get existing companies from localStorage or use empty array
    const existingCompanies = JSON.parse(localStorage.getItem('companies') || '[]');
    
    if (isEditMode) {
      // Update existing company
      const updatedCompanies = existingCompanies.map(company => 
        company.id === isEditMode.id ? { ...company, ...form } : company
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
    
    // Redirect to companies page
    navigate('/companies');
  };

  const handleFileChange = (field, files) => {
    const fileArray = Array.from(files);
    const errors = {};
    const validFiles = [];

    fileArray.forEach((file, index) => {
      // Check file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        errors[`${field}_${index}`] = "Only PNG, JPG, JPEG, PDF files are allowed";
        return;
      }

      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        errors[`${field}_${index}`] = "File size must be under 5MB";
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

  const handleAddContact = () => {
    setContactForm({
      name: "",
      email: "",
      phone: "",
      extension: ""
    });
    setEditingContactId(null);
    setShowContactModal(true);
  };

  const handleEditContact = (contact) => {
    setContactForm({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || "",
      extension: contact.extension || ""
    });
    setEditingContactId(contact.id);
    setShowContactModal(true);
  };

  const handleSaveContact = () => {
    if (!contactForm.name.trim() || !contactForm.email.trim()) {
      alert("Name and Email are required");
      return;
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

    setShowContactModal(false);
    setContactForm({ name: "", email: "", phone: "", extension: "" });
    setEditingContactId(null);
  };

  const handleDeleteContact = (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    }
  };

  const removeFile = (field, index) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              to="/companies"
              className="text-indigo-600 hover:text-indigo-800 mr-4"
            >
              ← Back to Companies
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditMode ? "Edit Company" : "Create New Company"}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? "Update company information" : "Add a new company to your system"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Tag *
                </label>
                <input
                  type="text"
                  required
                  value={form.tag}
                  onChange={(e) => setForm(prev => ({ ...prev, tag: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="e.g., ONIX"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter company address"
              />
            </div>

            {/* Contact Management */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Primary Contact
                </label>
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  + Add Contact
                </button>
              </div>
              
              {/* Contact List */}
              <div className="space-y-2 mb-4">
                {contacts.map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-600">
                        {contact.email} • {contact.phone} {contact.extension && `(Ext: ${contact.extension})`}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditContact(contact)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Selection */}
              <select
                value={form.contact}
                onChange={(e) => setForm(prev => ({ ...prev, contact: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">Select a contact</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.name}>
                    {contact.name} ({contact.email})
                  </option>
                ))}
              </select>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(e) => handleFileChange('logo', e.target.files)}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">Upload logo</p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG, PDF under 5MB</p>
                  </label>
                  {form.logo && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                        <span className="text-xs text-blue-700">{form.logo.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('logo', 0)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  {fileErrors.logo && Object.values(fileErrors.logo).map((error, index) => (
                    <p key={index} className="mt-1 text-xs text-red-600">{error}</p>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Header Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(e) => handleFileChange('header', e.target.files)}
                    className="hidden"
                    id="header-upload"
                  />
                  <label htmlFor="header-upload" className="cursor-pointer">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">Upload header</p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG, PDF under 5MB</p>
                  </label>
                  {form.header && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                        <span className="text-xs text-blue-700">{form.header.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('header', 0)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  {fileErrors.header && Object.values(fileErrors.header).map((error, index) => (
                    <p key={index} className="mt-1 text-xs text-red-600">{error}</p>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Footer Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(e) => handleFileChange('footer', e.target.files)}
                    className="hidden"
                    id="footer-upload"
                  />
                  <label htmlFor="footer-upload" className="cursor-pointer">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">Upload footer</p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG, PDF under 5MB</p>
                  </label>
                  {form.footer && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
                        <span className="text-xs text-blue-700">{form.footer.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('footer', 0)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                  {fileErrors.footer && Object.values(fileErrors.footer).map((error, index) => (
                    <p key={index} className="mt-1 text-xs text-red-600">{error}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                to="/companies"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                {isEditMode ? "Update Company" : "Create Company"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingContactId ? "Edit Contact" : "Add New Contact"}
                </h2>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter contact name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extension
                  </label>
                  <input
                    type="text"
                    value={contactForm.extension}
                    onChange={(e) => setContactForm(prev => ({ ...prev, extension: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter extension"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveContact}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingContactId ? "Update Contact" : "Add Contact"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 