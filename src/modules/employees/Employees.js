import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployees, createEmployee, updateEmployee } from '../../services/employeeAPI';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BriefcaseIcon, 
  MapPinIcon, 
  IdentificationIcon, 
  DocumentPlusIcon, 
  CheckCircleIcon, 
  CalendarIcon, 
  AcademicCapIcon, 
  UsersIcon, 
  ClipboardDocumentListIcon, 
  ArrowLeftIcon, 
  CheckIcon, 
  Cog6ToothIcon, 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  ClockIcon, 
  XMarkIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon, 
  BanknotesIcon, 
  CalculatorIcon 
} from '@heroicons/react/24/outline';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useCompanySelection } from '../../context/CompanySelectionContext';
import { demoEmployees, phoneInputStyles } from './constants';
import { 
  handleUploadDocument, 
  handleViewDocument, 
  handleDownloadDocument, 
  handleDeleteDocument,
  formatDate,
  isDateExpired 
} from './utils';
import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';

const Employees = () => {
  const navigate = useNavigate();
  const { selectedCompany, selectedDepartment } = useCompanySelection();
  const { user } = useAuth();
  
  // Check if user can create employees
  const canCreateEmployee = user?.role === 'ADMIN' || user?.role === 'HR';
  
  // State management
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ department: '' });
  const [employeeDocuments, setEmployeeDocuments] = useState({});
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [documentUploadData, setDocumentUploadData] = useState({
    name: '',
    type: '',
    expiryDate: '',
    file: null
  });

  // Sample data
  const jobTitles = ["Manager", "Developer", "Accountant", "Sales Rep", "Designer", "Analyst"];
  const attendancePrograms = ["Standard 9-5", "Flexible Hours", "Shift Work", "Remote"];

  // Add phone input styles to document
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = phoneInputStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Load employees from backend
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const response = await getEmployees();
        if (response.success && response.data) {
          // Transform backend data to match frontend format
          const employeesList = response.data.map(emp => {
            // Parse JSON strings for contacts and emails
            let phoneNumbers = [];
            let emailAddresses = [];
            try {
              phoneNumbers = emp.phoneNumbers ? JSON.parse(emp.phoneNumbers) : [];
              emailAddresses = emp.emailAddresses ? JSON.parse(emp.emailAddresses) : [];
            } catch (e) {
              console.error('Error parsing contacts/emails:', e);
            }

            // Get manager name
            let managerName = '';
            if (emp.manager) {
              managerName = `${emp.manager.firstName} ${emp.manager.lastName}`;
            }

            return {
              id: emp.id,
              name: `${emp.firstName} ${emp.lastName}`,
              email: emp.email || (emailAddresses.length > 0 ? emailAddresses[0] : ''),
              phone: emp.phone || (phoneNumbers.length > 0 ? phoneNumbers[0]?.value : ''),
              department: emp.department || '',
              jobTitle: emp.jobTitle || '',
              status: emp.status || (emp.isActive ? 'active' : 'inactive'),
              employeeId: emp.employeeId || emp.id,
              // Include all backend data for editing
              ...emp,
              contacts: phoneNumbers,
              emails: emailAddresses,
              manager: managerName,
            };
          });
          setEmployees(employeesList);
        } else {
          // Fallback to demo data if API fails
          setEmployees(demoEmployees);
        }
      } catch (error) {
        console.error('Error loading employees:', error);
        // Fallback to demo data on error
        setEmployees(demoEmployees);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  // Event handlers
  const handleAddEmployee = () => {
    // Navigate to new employee creation page (uses backend API)
    if (canCreateEmployee) {
      navigate('/employees/create');
    } else {
      // Fallback to old form if not admin/hr (for backward compatibility)
      setShowForm(true);
    }
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      // Prepare data for backend
      const backendData = {
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        employeeId: employeeData.employeeId,
        employeeType: employeeData.employeeType,
        status: employeeData.status,
        userAccount: employeeData.userAccount || false,
        
        // Personal Details
        gender: employeeData.gender,
        maritalStatus: employeeData.maritalStatus,
        nationality: employeeData.nationality,
        birthday: employeeData.birthday,
        childrenCount: employeeData.childrenCount,
        currentAddress: employeeData.currentAddress,
        
        // Contact Info
        contacts: employeeData.contacts || [],
        emails: employeeData.emails || [],
        
        // Company Info
        company: employeeData.company,
        department: employeeData.department,
        jobTitle: employeeData.jobTitle,
        companyLocation: employeeData.companyLocation,
        managerId: employeeData.manager || null, // manager field contains the managerId from dropdown
        attendanceProgram: employeeData.attendanceProgram,
        joiningDate: employeeData.joiningDate,
        exitDate: employeeData.exitDate,
        isLineManager: employeeData.isLineManager || false,
        
        // Legal Documents (include File objects if they exist)
        passportNumber: employeeData.passportNumber,
        passportIssueDate: employeeData.passportIssue,
        passportExpiryDate: employeeData.passportExpiry,
        passportAttachment: employeeData.passportAttachment, // File object if uploaded
        
        nationalIdNumber: employeeData.nationalIdNumber,
        nationalIdExpiryDate: employeeData.nationalIdExpiry,
        nationalIdAttachment: employeeData.nationalIdAttachment, // File object if uploaded
        
        residencyNumber: employeeData.residencyNumber,
        residencyExpiryDate: employeeData.residencyExpiry,
        residencyAttachment: employeeData.residencyAttachment, // File object if uploaded
        
        insuranceNumber: employeeData.insuranceNumber,
        insuranceExpiryDate: employeeData.insuranceExpiry,
        insuranceAttachment: employeeData.insuranceAttachment, // File object if uploaded
        
        drivingLicenseNumber: employeeData.drivingNumber,
        drivingLicenseExpiryDate: employeeData.drivingExpiry,
        drivingLicenseAttachment: employeeData.drivingAttachment, // File object if uploaded
        
        labourIdNumber: employeeData.labourNumber,
        labourIdExpiryDate: employeeData.labourExpiry,
        labourIdAttachment: employeeData.labourAttachment, // File object if uploaded
        
        remarks: employeeData.remarks,
        
        // Basic fields
        role: 'EMPLOYEE',
        phone: employeeData.contacts?.[0]?.value || '',
        
        // Include personalImage/photo if it's a File
        personalImage: employeeData.personalImage, // File object if uploaded
      };

      const response = await createEmployee(backendData);
      
      if (response.success) {
        // Reload employees list
        const employeesResponse = await getEmployees();
        if (employeesResponse.success && employeesResponse.data) {
          const employeesList = employeesResponse.data.map(emp => {
            let phoneNumbers = [];
            let emailAddresses = [];
            try {
              phoneNumbers = emp.phoneNumbers ? JSON.parse(emp.phoneNumbers) : [];
              emailAddresses = emp.emailAddresses ? JSON.parse(emp.emailAddresses) : [];
            } catch (e) {}
            
            let managerName = '';
            if (emp.manager) {
              managerName = `${emp.manager.firstName} ${emp.manager.lastName}`;
            }

            return {
              id: emp.id,
              name: `${emp.firstName} ${emp.lastName}`,
              email: emp.email || (emailAddresses.length > 0 ? emailAddresses[0] : ''),
              phone: emp.phone || (phoneNumbers.length > 0 ? phoneNumbers[0]?.value : ''),
              department: emp.department || '',
              jobTitle: emp.jobTitle || '',
              status: emp.status || (emp.isActive ? 'active' : 'inactive'),
              employeeId: emp.employeeId || emp.id,
              ...emp,
              contacts: phoneNumbers,
              emails: emailAddresses,
              manager: managerName,
            };
          });
          setEmployees(employeesList);
        }
        
        setShowForm(false);
        
        // Show success message
        alert('Employee created successfully!');
      } else {
        alert(`Failed to create employee: ${response.message}`);
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      alert(`Error creating employee: ${error.message}`);
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployeeForEdit(employee);
    setShowEditModal(true);
  };

  const handleDeleteEmployee = (employeeId) => {
    setEmployees(employees.filter(emp => emp.id !== employeeId));
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployeeForEdit) return;
    
    try {
      // Prepare data for backend
      const backendData = {
        firstName: selectedEmployeeForEdit.firstName || selectedEmployeeForEdit.name?.split(' ')[0],
        lastName: selectedEmployeeForEdit.lastName || selectedEmployeeForEdit.name?.split(' ')[1],
        email: selectedEmployeeForEdit.email,
        phone: selectedEmployeeForEdit.phone,
        department: selectedEmployeeForEdit.department,
        jobTitle: selectedEmployeeForEdit.jobTitle,
        employeeId: selectedEmployeeForEdit.employeeId,
        status: selectedEmployeeForEdit.status,
        isActive: selectedEmployeeForEdit.status === 'active' || selectedEmployeeForEdit.status === 'Active',
      };

      const response = await updateEmployee(selectedEmployeeForEdit.id, backendData);
      
      if (response.success) {
        // Reload employees list
        const employeesResponse = await getEmployees();
        if (employeesResponse.success && employeesResponse.data) {
          const employeesList = employeesResponse.data.map(emp => {
            let phoneNumbers = [];
            let emailAddresses = [];
            try {
              phoneNumbers = emp.phoneNumbers ? JSON.parse(emp.phoneNumbers) : [];
              emailAddresses = emp.emailAddresses ? JSON.parse(emp.emailAddresses) : [];
            } catch (e) {}
            
            let managerName = '';
            if (emp.manager) {
              managerName = `${emp.manager.firstName} ${emp.manager.lastName}`;
            }

            return {
              id: emp.id,
              name: `${emp.firstName} ${emp.lastName}`,
              email: emp.email || (emailAddresses.length > 0 ? emailAddresses[0] : ''),
              phone: emp.phone || (phoneNumbers.length > 0 ? phoneNumbers[0]?.value : ''),
              department: emp.department || '',
              jobTitle: emp.jobTitle || '',
              status: emp.status || (emp.isActive ? 'active' : 'inactive'),
              employeeId: emp.employeeId || emp.id,
              ...emp,
              contacts: phoneNumbers,
              emails: emailAddresses,
              manager: managerName,
            };
          });
          setEmployees(employeesList);
        }
        
        setShowEditModal(false);
        setSelectedEmployeeForEdit(null);
        
        alert('Employee updated successfully!');
      } else {
        alert(`Failed to update employee: ${response.message}`);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert(`Error updating employee: ${error.message}`);
    }
  };

  const handleEditFieldChange = (field, value) => {
    setSelectedEmployeeForEdit(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocumentUpload = async () => {
    if (selectedEmployeeForEdit && documentUploadData.name && documentUploadData.type && documentUploadData.file) {
      const documentData = {
        id: Date.now(),
        name: documentUploadData.name,
        type: documentUploadData.type,
        expiryDate: documentUploadData.expiryDate,
        uploadDate: new Date().toISOString(),
        fileSize: `${(documentUploadData.file.size / 1024).toFixed(1)} KB`
      };

      await handleUploadDocument(selectedEmployeeForEdit.id, documentData);
      
      setEmployeeDocuments(prev => ({
        ...prev,
        [selectedEmployeeForEdit.id]: [
          ...(prev[selectedEmployeeForEdit.id] || []),
          documentData
        ]
      }));

      setDocumentUploadData({
        name: '',
        type: '',
        expiryDate: '',
        file: null
      });
      setShowDocumentUpload(false);
    }
  };

  const handleDeleteDocumentFromList = async (employeeId, docId) => {
    await handleDeleteDocument(employeeId, docId);
    setEmployeeDocuments(prev => ({
      ...prev,
      [employeeId]: prev[employeeId]?.filter(doc => doc.id !== docId) || []
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Breadcrumbs />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showForm ? (
          <EmployeeList
            canCreateEmployee={canCreateEmployee}
            employees={employees}
            onViewEmployee={handleViewEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onAddEmployee={handleAddEmployee}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
              <button
                onClick={() => setShowForm(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Back to List
              </button>
            </div>
            <EmployeeForm
              onBack={() => setShowForm(false)}
              onSaveEmployee={handleSaveEmployee}
              jobTitles={jobTitles}
              attendancePrograms={attendancePrograms}
              employeesList={employees}
            />
          </div>
        )}
      </div>

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="relative flex items-center justify-between p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                    <UserIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Employee Details</h3>
                    <p className="text-blue-100 text-sm font-medium">{selectedEmployee.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setShowEditModal(true);
                      setSelectedEmployeeForEdit(selectedEmployee);
                    }}
                    className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
                    title="Edit Employee"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <span className="text-sm text-gray-900">{selectedEmployee.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Employee ID:</span>
                      <span className="text-sm text-gray-900">{selectedEmployee.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <span className="text-sm text-gray-900">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Phone:</span>
                      <span className="text-sm text-gray-900">{selectedEmployee.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BriefcaseIcon className="h-5 w-5 text-green-600" />
                    Work Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Department:</span>
                      <span className="text-sm text-gray-900">{selectedEmployee.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Job Title:</span>
                      <span className="text-sm text-gray-900">{selectedEmployee.jobTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className="text-sm text-gray-900">{selectedEmployee.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployeeForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col">
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"></div>
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="relative flex items-center justify-between p-6 text-white">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setShowViewModal(true);
                    }}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110 mr-2"
                    title="Back to View"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Edit Employee</h3>
                    <p className="text-purple-100 text-sm font-medium">{selectedEmployeeForEdit.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-purple-600" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={selectedEmployeeForEdit.firstName || selectedEmployeeForEdit.name?.split(' ')[0] || ''}
                        onChange={(e) => handleEditFieldChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={selectedEmployeeForEdit.lastName || selectedEmployeeForEdit.name?.split(' ')[1] || ''}
                        onChange={(e) => handleEditFieldChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={selectedEmployeeForEdit.email}
                        onChange={(e) => handleEditFieldChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={selectedEmployeeForEdit.phone || ''}
                        onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BriefcaseIcon className="h-5 w-5 text-blue-600" />
                    Work Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                      <input
                        type="text"
                        value={selectedEmployeeForEdit.employeeId || selectedEmployeeForEdit.id || ''}
                        onChange={(e) => handleEditFieldChange('employeeId', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter employee ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                      <select
                        value={selectedEmployeeForEdit.jobTitle}
                        onChange={(e) => handleEditFieldChange('jobTitle', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select job title</option>
                        {jobTitles.map(title => (
                          <option key={title} value={title}>{title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select
                        value={selectedEmployeeForEdit.department}
                        onChange={(e) => handleEditFieldChange('department', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select department</option>
                        <option value="HR">HR</option>
                        <option value="IT">IT</option>
                        <option value="Finance">Finance</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={selectedEmployeeForEdit.status}
                        onChange={(e) => handleEditFieldChange('status', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Employee ID:</span> {selectedEmployeeForEdit.id}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-semibold border border-gray-300 rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateEmployee}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    ✅ Update Employee
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;



