import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { createCompany, updateCompany, getCompanyById } from "../../services/companiesAPI";

export default function CreateCompanyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [isEditMode, setIsEditMode] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(false);
  
  const [form, setForm] = useState({
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
  });
  
  const [contacts, setContacts] = useState([]);

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

  // Fetch company data when in edit mode
  useEffect(() => {
    const loadCompanyData = async () => {
      // Check if we have company data from navigation state
      const companyFromState = location.state?.company;
      
      // Check if we have company ID from URL params or from state company
      const companyId = params.id || params.companyId || companyFromState?.id;
      
      // Always fetch fresh data from API to ensure we have all fields including license info
      if (companyId) {
        setLoadingCompany(true);
        try {
          console.log('📡 Fetching company data for ID:', companyId);
          const response = await getCompanyById(companyId);
          if (response.success && response.data) {
            console.log('✅ Loaded company data for editing:', response.data);
            console.log('📋 License fields in response:', {
              licenseCategory: response.data.licenseCategory,
              legalType: response.data.legalType,
              dunsNumber: response.data.dunsNumber,
              registerNo: response.data.registerNo,
              issueDate: response.data.issueDate,
              mainLicenseNo: response.data.mainLicenseNo,
              dcciNo: response.data.dcciNo,
              trnNumber: response.data.trnNumber
            });
            setIsEditMode(response.data);
          } else {
            console.error('❌ Failed to load company data');
            alert('Failed to load company data. Please try again.');
            navigate('/companies');
          }
        } catch (error) {
          console.error('❌ Error loading company:', error);
          alert('Failed to load company data: ' + error.message);
          navigate('/companies');
        } finally {
          setLoadingCompany(false);
        }
      } else if (companyFromState) {
        // Fallback: use company from state if no ID available (shouldn't happen in edit mode)
        console.log('⚠️ Using company from state (may be incomplete):', companyFromState);
        setIsEditMode(companyFromState);
      }
    };

    loadCompanyData();
  }, [location.state, params.id, params.companyId, navigate]);

  // Initialize form with company data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      console.log('📝 Loading form with company data:', isEditMode);
      console.log('📝 License fields check:', {
        licenseCategory: isEditMode.licenseCategory,
        legalType: isEditMode.legalType,
        dunsNumber: isEditMode.dunsNumber,
        registerNo: isEditMode.registerNo,
        issueDate: isEditMode.issueDate,
        mainLicenseNo: isEditMode.mainLicenseNo,
        dcciNo: isEditMode.dcciNo,
        trnNumber: isEditMode.trnNumber,
        licenseExpiry: isEditMode.licenseExpiry
      });
      
      // Format date fields if they exist
      const formatDate = (dateValue) => {
        if (!dateValue) return "";
        if (typeof dateValue === 'string') {
          // If it's already a string in YYYY-MM-DD format, return as is
          if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) return dateValue;
          // Try to parse and format
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
        if (dateValue instanceof Date) {
          return dateValue.toISOString().split('T')[0];
        }
        return "";
      };

      const formData = {
        name: isEditMode.name || "",
        tag: isEditMode.tag || "",
        address: isEditMode.address || "",
        contact: isEditMode.contact || isEditMode.contactName || "",
        logo: isEditMode.logo || null, // Keep as string URL for existing images
        header: isEditMode.header || null,
        footer: isEditMode.footer || null,
        licenseCategory: isEditMode.licenseCategory || "",
        legalType: isEditMode.legalType || "",
        expiryDate: formatDate(isEditMode.expiryDate || isEditMode.licenseExpiry),
        dunsNumber: isEditMode.dunsNumber || "",
        registerNo: isEditMode.registerNo || "",
        issueDate: formatDate(isEditMode.issueDate),
        mainLicenseNo: isEditMode.mainLicenseNo || "",
        dcciNo: isEditMode.dcciNo || "",
        trnNumber: isEditMode.trnNumber || ""
      };

      console.log('📝 Setting form data:', formData);
      setForm(formData);
      
      // Also load contacts if they exist
      if (isEditMode.contactName || isEditMode.contactEmail) {
        setContacts([{
          id: 1,
          name: isEditMode.contactName || "",
          email: isEditMode.contactEmail || "",
          phone: isEditMode.contactPhone || "",
          extension: isEditMode.contactExtension || ""
        }]);
      }
    }
  }, [isEditMode]);

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    const objectUrls = [];
    
    // Create object URLs for File objects
    if (form.logo instanceof File) {
      objectUrls.push(URL.createObjectURL(form.logo));
    }
    if (form.header instanceof File) {
      objectUrls.push(URL.createObjectURL(form.header));
    }
    if (form.footer instanceof File) {
      objectUrls.push(URL.createObjectURL(form.footer));
    }
    
    // Cleanup function
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [form.logo, form.header, form.footer]);

  // Helper function to get file value for API submission
  const getFileValue = (file) => {
    if (!file) return null;
    // If it's already a string (URL or path), return it (for existing files)
    if (typeof file === 'string') return file;
    // If it's a File object, return it as-is (will be sent via FormData)
    if (file instanceof File) return file;
    return null;
  };

  // Helper function to get image URL for display
  const getImageUrl = (file) => {
    if (!file) return null;
    // If it's a string (URL), return it
    if (typeof file === 'string') {
      // If it's already a full URL, return as is
      if (file.startsWith('http://') || file.startsWith('https://')) {
        return file;
      }
      // If it's a relative path, construct full URL
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      return `${baseUrl}${file}`;
    }
    // If it's a File object, create object URL for preview
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.name || form.name.trim() === '') {
      alert('Company name is required');
      return;
    }
    
    try {
      // Map form data to API format
      // Note: File uploads (logo, header, footer) should be handled separately
      // For now, we'll send null and handle file uploads in a separate step
      const companyData = {
        name: form.name.trim(),
        tag: form.tag?.trim() || null,
        address: form.address?.trim() || null,
        industry: form.industry?.trim() || null,
        founded: form.founded || null,
        status: 'ACTIVE', // Default to active
        contactName: form.contact?.trim() || contacts[0]?.name || null,
        contactEmail: contacts[0]?.email || null,
        contactPhone: contacts[0]?.phone || null,
        contactExtension: contacts[0]?.extension || null,
        licenseCategory: form.licenseCategory || null,
        legalType: form.legalType || null,
        licenseExpiry: form.expiryDate || null,
        licenseStatus: form.expiryDate && new Date(form.expiryDate) > new Date() ? 'ACTIVE' : 'EXPIRED',
        dunsNumber: form.dunsNumber || null,
        registerNo: form.registerNo || null,
        issueDate: form.issueDate || null,
        mainLicenseNo: form.mainLicenseNo || null,
        dcciNo: form.dcciNo || null,
        trnNumber: form.trnNumber || null,
        logo: getFileValue(form.logo), // Returns File object or string URL
        header: getFileValue(form.header),
        footer: getFileValue(form.footer),
        employees: 0, // Default, can be updated later
      };
      
      console.log('📝 Submitting company data:', {
        ...companyData,
        logo: companyData.logo ? 'File/URL present' : 'null',
        header: companyData.header ? 'File/URL present' : 'null',
        footer: companyData.footer ? 'File/URL present' : 'null',
      });
      
      if (isEditMode && isEditMode.id) {
        // Update existing company via API
        console.log('📝 Updating company:', isEditMode.id);
        await updateCompany(isEditMode.id, companyData);
      } else {
        // Create new company via API
        console.log('📝 Creating company via API');
        const response = await createCompany(companyData);
        console.log('✅ Company created:', response);
      }
      
      // Redirect to companies page
      navigate('/companies');
    } catch (error) {
      console.error('❌ Error saving company:', error);
      const errorMessage = error.message || 'Unknown error';
      console.error('   Full error:', error);
      alert('Failed to save company: ' + errorMessage);
    }
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

  // Show loading state while fetching company data
  if (loadingCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link
              to="/companies"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-all duration-200 mr-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Companies
            </Link>
          </div>
          
          {/* Enhanced Title Section */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {isEditMode ? "Edit Company" : "Create New Company"}
                </h1>
                <p className="text-indigo-100 text-lg">
                  {isEditMode ? "Update company information" : "Add a new company to your system"}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">1</div>
                <div className="text-indigo-100 text-sm">Company</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">Complete</div>
                <div className="text-indigo-100 text-sm">Form</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">Secure</div>
                <div className="text-indigo-100 text-sm">Data</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
            <p className="text-gray-600 mt-2">Fill in the details below to create your company profile</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-blue-600 transition-colors">
                    Company Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      placeholder="Enter company name"
                      title="Enter the full legal name of your company as it appears on your trade license and official documents."
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-blue-600 transition-colors">
                    Company Tag *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={form.tag}
                      onChange={(e) => setForm(prev => ({ ...prev, tag: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      placeholder="e.g., ONIX"
                      title="Enter a short tag or abbreviation for your company (e.g., ONIX, ABC). This is used for quick identification and display purposes throughout the system."
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mt-6 group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-blue-600 transition-colors">
                  Address *
                </label>
                <div className="relative">
                  <textarea
                    required
                    value={form.address}
                    onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                    placeholder="Enter company address"
                    title="Enter the complete physical address of your company including building name, street, area, city, and country. This should match the address on your trade license."
                  />
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* License Information Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">License & Legal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     License Category *
                   </label>
                                     <select
                     required
                     value={form.licenseCategory}
                     onChange={(e) => setForm(prev => ({ ...prev, licenseCategory: e.target.value }))}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                     title="Select the type of business license category (e.g., Commercial, Industrial, Professional, Trading, Construction, Consulting)"
                   >
                    <option value="">Select License Category</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="professional">Professional</option>
                    <option value="trading">Trading</option>
                    <option value="construction">Construction</option>
                    <option value="consulting">Consulting</option>
                  </select>
                </div>
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Legal Type *
                   </label>
                                     <select
                     required
                     value={form.legalType}
                     onChange={(e) => setForm(prev => ({ ...prev, legalType: e.target.value }))}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                     title="Select the legal structure of your company (e.g., LLC, Corporation, Partnership, Sole Proprietorship, Branch, Representative Office)"
                   >
                    <option value="">Select Legal Type</option>
                    <option value="llc">Limited Liability Company (LLC)</option>
                    <option value="corporation">Corporation</option>
                    <option value="partnership">Partnership</option>
                    <option value="sole-proprietorship">Sole Proprietorship</option>
                    <option value="branch">Branch</option>
                    <option value="representative-office">Representative Office</option>
                  </select>
                </div>
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Expiry Date *
                   </label>
                                     <input
                     type="date"
                     required
                     value={form.expiryDate}
                     onChange={(e) => setForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                     title="Enter the expiration date of your trade license (format: dd/mm/yyyy). This is the date when your license will expire and needs renewal."
                     placeholder="Select license expiry date"
                   />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    D&B D-U-N-S Number
                  </label>
                  <input
                    type="text"
                    value={form.dunsNumber}
                    onChange={(e) => setForm(prev => ({ ...prev, dunsNumber: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter D&B D-U-N-S Number from trade license"
                    title="Enter your D&B (Dun & Bradstreet) D-U-N-S Number. This is a unique 9-digit identifier found on your trade license. It's used for business credit reporting and identification."
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commercial License Number
                    </label>
                    <input
                      type="text"
                      value={form.registerNo}
                      onChange={(e) => setForm(prev => ({ ...prev, registerNo: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter Commercial License Number from trade license"
                      title="Enter the commercial license number issued by the licensing authority. This number is typically found on your trade license document and identifies your company's commercial registration with the government."
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    title="Enter the date when your trade license was issued (format: dd/mm/yyyy). This is the date printed on your license document when it was first issued."
                    placeholder="Select license issue date"
                  />
                </div>
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Main License Number *
                   </label>
                                     <input
                     type="text"
                     required
                     value={form.mainLicenseNo}
                     onChange={(e) => setForm(prev => ({ ...prev, mainLicenseNo: e.target.value }))}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                     placeholder="Enter Main License Number from trade license"
                     title="Enter the primary license number issued by the licensing authority. This is the main license number displayed prominently on your trade license document. It's required for all business operations."
                   />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DCCI Number
                  </label>
                  <input
                    type="text"
                    value={form.dcciNo}
                    onChange={(e) => setForm(prev => ({ ...prev, dcciNo: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter DCCI (Dubai Chamber) Number"
                    title="Enter your Dubai Chamber of Commerce and Industry (DCCI) membership number, if applicable. This number is issued when your company becomes a member of the Dubai Chamber."
                  />
                </div>
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     TRN Number *
                   </label>
                                     <input
                     type="text"
                     required
                     value={form.trnNumber}
                     onChange={(e) => setForm(prev => ({ ...prev, trnNumber: e.target.value }))}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                     placeholder="Enter TRN (Tax Registration Number) / ESBN"
                     title="Enter your Tax Registration Number (TRN) or Economic Substance Business Number (ESBN). This is a unique identifier issued by the tax authority for VAT and tax purposes. It's mandatory for companies registered for VAT."
                   />
                </div>
              </div>
            </div>

            {/* Contact Management Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Primary Contact</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Contact
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

            {/* File Uploads Section */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Company Assets</h3>
              </div>
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
                  {getImageUrl(form.logo) ? (
                    <div className="relative">
                      <img 
                        src={getImageUrl(form.logo)} 
                        alt="Company Logo" 
                        className="max-w-full max-h-48 mx-auto rounded-lg object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-1 text-sm text-gray-600">Upload logo</p>
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <label htmlFor="logo-upload" className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 underline">
                          Change Logo
                        </label>
                        {form.logo && (
                          <button
                            type="button"
                            onClick={() => removeFile('logo', 0)}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-1 text-sm text-gray-600">Upload logo</p>
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG, PDF under 5MB</p>
                    </label>
                  )}
                  {form.logo && form.logo instanceof File && (
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
                  {getImageUrl(form.header) ? (
                    <div className="relative">
                      <img 
                        src={getImageUrl(form.header)} 
                        alt="Header Image" 
                        className="max-w-full max-h-48 mx-auto rounded-lg object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-1 text-sm text-gray-600">Upload header</p>
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <label htmlFor="header-upload" className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 underline">
                          Change Header
                        </label>
                        {form.header && (
                          <button
                            type="button"
                            onClick={() => removeFile('header', 0)}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="header-upload" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-1 text-sm text-gray-600">Upload header</p>
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG, PDF under 5MB</p>
                    </label>
                  )}
                  {form.header && form.header instanceof File && (
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
                  {getImageUrl(form.footer) ? (
                    <div className="relative">
                      <img 
                        src={getImageUrl(form.footer)} 
                        alt="Footer Image" 
                        className="max-w-full max-h-48 mx-auto rounded-lg object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="hidden text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-1 text-sm text-gray-600">Upload footer</p>
                      </div>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <label htmlFor="footer-upload" className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 underline">
                          Change Footer
                        </label>
                        {form.footer && (
                          <button
                            type="button"
                            onClick={() => removeFile('footer', 0)}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="footer-upload" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-1 text-sm text-gray-600">Upload footer</p>
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG, PDF under 5MB</p>
                    </label>
                  )}
                  {form.footer && form.footer instanceof File && (
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
          </div>

                      {/* Submit Button */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <Link
                  to="/companies"
                  className="flex items-center gap-2 px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {isEditMode ? "Update Company" : "Create Company"}
                </button>
              </div>
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