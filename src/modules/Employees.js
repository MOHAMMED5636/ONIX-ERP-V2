import React, { useState, createContext, useContext } from "react";
import { UserIcon, EnvelopeIcon, PhoneIcon, BriefcaseIcon, MapPinIcon, IdentificationIcon, DocumentPlusIcon, CheckCircleIcon, CalendarIcon, AcademicCapIcon, UsersIcon, ClipboardDocumentListIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Breadcrumbs from '../components/Breadcrumbs';

// Custom styles for PhoneInput integration
const phoneInputStyles = `
  .react-tel-input .form-control {
    width: 100% !important;
    height: 42px !important;
    border: 1px solid #d1d5db !important;
    border-radius: 0.375rem !important;
    padding-left: 50px !important;
    font-size: 0.875rem !important;
    background-color: white !important;
  }
  .react-tel-input .form-control:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 1px #3b82f6 !important;
    outline: none !important;
  }
  .react-tel-input .flag-dropdown {
    border: 1px solid #d1d5db !important;
    border-right: none !important;
    border-radius: 0.375rem 0 0 0.375rem !important;
    background-color: white !important;
  }
  .react-tel-input .flag-dropdown.open {
    border-color: #3b82f6 !important;
  }
  .react-tel-input .selected-flag {
    height: 42px !important;
    padding: 0 8px 0 12px !important;
    border-radius: 0.375rem 0 0 0.375rem !important;
  }
  .react-tel-input .country-list {
    border: 1px solid #d1d5db !important;
    border-radius: 0.375rem !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    max-height: 200px !important;
  }
  .react-tel-input .country-list .country {
    padding: 8px 12px !important;
    font-size: 0.875rem !important;
  }
  .react-tel-input .country-list .country:hover {
    background-color: #f3f4f6 !important;
  }
  .react-tel-input .country-list .country.highlight {
    background-color: #3b82f6 !important;
    color: white !important;
  }
`;

// Demo employee data
const demoEmployees = [
  { id: 1, name: "Ahmed Ali", department: "HR", email: "ahmed.ali@email.com", jobTitle: "Manager" },
  { id: 2, name: "Sara Youssef", department: "Finance", email: "sara.y@email.com", jobTitle: "Accountant" },
  { id: 3, name: "John Smith", department: "IT", email: "john.smith@email.com", jobTitle: "Developer" },
  { id: 4, name: "Fatima Noor", department: "Sales", email: "fatima.noor@email.com", jobTitle: "Sales Rep" },
];

// Form context for multi-step form state
const EmployeeFormContext = createContext();
function useEmployeeForm() { return useContext(EmployeeFormContext); }

const steps = [
  { label: "Personal Info", icon: UserIcon },
  { label: "Personal Details", icon: UserIcon },
  { label: "Contact Info", icon: PhoneIcon },
  { label: "Company Info", icon: BriefcaseIcon },
  { label: "Legal Info", icon: IdentificationIcon },
  { label: "Documents", icon: DocumentPlusIcon },
  { label: "Review & Submit", icon: CheckCircleIcon },
];

function EmployeeForm({ onBack }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    employeeType: "",
    firstName: "",
    lastName: "",
    employeeId: "",
    status: "",
    userAccount: false,
    personalImage: null,
    gender: "",
    maritalStatus: "",
    nationality: "",
    currentAddress: "",
    permanentAddress: "",
    childrenCount: "",
    birthday: "",
    contacts: [{ type: "phone", value: "", countryCode: "ae" }],
    emails: [""],
    department: "",
    jobTitle: "",
    location: "",
    manager: "",
    passport: "",
    id: "",
    visa: "",
    insurance: "",
    documents: [],
    company: "",
    attendanceProgram: "",
    joiningDate: "",
    exitDate: "",
    workingLocations: [],
    isLineManager: false,
    passportNumber: "",
    passportIssue: "",
    passportExpiry: "",
    nationalIdNumber: "",
    nationalIdExpiry: "",
    residencyNumber: "",
    residencyExpiry: "",
    insuranceNumber: "",
    insuranceExpiry: "",
    drivingNumber: "",
    drivingExpiry: "",
    labourNumber: "",
    labourExpiry: "",
    remarks: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userAccountFields, setUserAccountFields] = useState({ username: '', password: '', passwordConfirm: '' });
  const [openLegalSection, setOpenLegalSection] = useState('');

  // Context value
  const ctxValue = { form, setForm };

  // Helper function to format phone number for submission
  const formatPhoneForSubmission = (phoneNumber, countryCode) => {
    // Remove any non-digit characters except the + sign
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    // Ensure it starts with + if it doesn't already
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  };

  // Handlers
  const handleChange = (field, value) => setForm({ ...form, [field]: value });
  const handleContactChange = (idx, value, countryCode = null) => {
    const contacts = [...form.contacts];
    contacts[idx].value = value;
    if (countryCode) {
      contacts[idx].countryCode = countryCode;
    }
    setForm({ ...form, contacts });
  };
  const handleAddContact = () => setForm({ ...form, contacts: [...form.contacts, { type: "phone", value: "", countryCode: "ae" }] });
  const handleRemoveContact = (idx) => setForm({ ...form, contacts: form.contacts.filter((_, i) => i !== idx) });
  const handleEmailChange = (idx, value) => {
    const emails = [...form.emails];
    emails[idx] = value;
    setForm({ ...form, emails });
  };
  const handleAddEmail = () => setForm({ ...form, emails: [...form.emails, ""] });
  const handleRemoveEmail = (idx) => setForm({ ...form, emails: form.emails.filter((_, i) => i !== idx) });
  const handleFileChange = (e) => setForm({ ...form, documents: Array.from(e.target.files) });
  const handleImageChange = (e) => setForm({ ...form, personalImage: e.target.files[0] });
  const handleMultiSelect = (field, value) => {
    setForm((prev) => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const handleUserAccountSave = () => {
    setForm({ ...form, userAccount: true, userAccountFields });
    setShowUserModal(false);
  };

  // Validation (simple)
  const validateStep = () => {
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
      if (!form.permanentAddress) errs.permanentAddress = "Required";
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
      if (!form.workingLocations || form.workingLocations.length === 0) errs.workingLocations = "Required";
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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };
  const handlePrev = () => setStep((s) => s - 1);
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format phone numbers for submission
    const formattedContacts = form.contacts.map(contact => ({
      ...contact,
      value: formatPhoneForSubmission(contact.value, contact.countryCode)
    }));
    
    const submissionData = {
      ...form,
      contacts: formattedContacts
    };
    
    console.log('Submitting employee data:', submissionData);
    setSubmitted(true);
  };

  // Step content
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            {/* User Account Modal */}
            {showUserModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
                  <h3 className="text-lg font-bold mb-4">Create User Account</h3>
                  <div className="mb-4">
                    <label className="block font-medium mb-1">User Name</label>
                    <input className="input" placeholder="Enter user name" value={userAccountFields.username} onChange={e => setUserAccountFields(f => ({ ...f, username: e.target.value }))} />
                    {userAccountFields.username === '' && <div className="text-red-500 text-xs mt-1">Required</div>}
                  </div>
                  <div className="mb-4">
                    <label className="block font-medium mb-1">Password</label>
                    <input type="password" className="input" placeholder="Enter password" value={userAccountFields.password} onChange={e => setUserAccountFields(f => ({ ...f, password: e.target.value }))} />
                    {userAccountFields.password === '' && <div className="text-red-500 text-xs mt-1">Required</div>}
                  </div>
                  <div className="mb-4">
                    <label className="block font-medium mb-1">Password Confirm</label>
                    <input type="password" className="input" placeholder="Confirm password" value={userAccountFields.passwordConfirm} onChange={e => setUserAccountFields(f => ({ ...f, passwordConfirm: e.target.value }))} />
                    {userAccountFields.passwordConfirm === '' && <div className="text-red-500 text-xs mt-1">Required</div>}
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button type="button" className="btn" onClick={() => setShowUserModal(false)}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={() => {
                      if (userAccountFields.username && userAccountFields.password && userAccountFields.passwordConfirm) {
                        handleUserAccountSave();
                      }
                    }}>Save</button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-6 mb-8 flex-col sm:flex-row">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-400 flex items-center justify-center shadow-lg overflow-hidden">
                {form.personalImage ? (
                  <img src={URL.createObjectURL(form.personalImage)} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <UserIcon className="h-10 w-10 text-white" />
                )}
              </div>
              <div className="text-lg font-semibold text-gray-700 mt-2 sm:mt-0">Main Information</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-6 px-1 sm:px-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Employee Type<span className="text-red-500 ml-1">*</span></label>
                <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.employeeType} onChange={e => handleChange('employeeType', e.target.value)}>
                  <option value="">Select employee type</option>
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
                {errors.employeeType && <div className="text-red-500 text-xs">{errors.employeeType}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">First Name<span className="text-red-500 ml-1">*</span></label>
                <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter first name" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} />
                {errors.firstName && <div className="text-red-500 text-xs">{errors.firstName}</div>}
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Last Name<span className="text-red-500 ml-1">*</span></label>
                <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter last name" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} />
                {errors.lastName && <div className="text-red-500 text-xs">{errors.lastName}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Employee ID<span className="text-red-500 ml-1">*</span></label>
                <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter employee ID" value={form.employeeId} onChange={e => handleChange('employeeId', e.target.value)} />
                {errors.employeeId && <div className="text-red-500 text-xs">{errors.employeeId}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Status<span className="text-red-500 ml-1">*</span></label>
                <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="probation">Probation</option>
                </select>
                {errors.status && <div className="text-red-500 text-xs">{errors.status}</div>}
              </div>
              <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-2 md:gap-6 items-center mb-2">
                <button type="button" className={`btn ${form.userAccount ? 'btn-success' : 'btn-primary'} w-full md:w-auto`} onClick={() => setShowUserModal(true)}>
                  {form.userAccount ? 'User Account Created' : 'Create New User Account'}
                </button>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Personal Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" />
                </div>
              </div>
            </div>
                     </div>
         );
       case 1:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><UserIcon className="h-6 w-6 text-indigo-400" /> Personal Details</div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Gender<span className="text-red-500 ml-1">*</span></label>
                 <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.gender} onChange={e => handleChange('gender', e.target.value)}>
                   <option value="">Select gender</option>
                   <option value="male">Male</option>
                   <option value="female">Female</option>
                   <option value="other">Other</option>
                 </select>
                 {errors.gender && <div className="text-red-500 text-xs">{errors.gender}</div>}
               </div>
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Marital Status<span className="text-red-500 ml-1">*</span></label>
                 <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.maritalStatus} onChange={e => handleChange('maritalStatus', e.target.value)}>
                   <option value="">Select marital status</option>
                   <option value="single">Single</option>
                   <option value="married">Married</option>
                   <option value="divorced">Divorced</option>
                   <option value="widowed">Widowed</option>
                 </select>
                 {errors.maritalStatus && <div className="text-red-500 text-xs">{errors.maritalStatus}</div>}
               </div>
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Nationality<span className="text-red-500 ml-1">*</span></label>
                 <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter nationality" value={form.nationality} onChange={e => handleChange('nationality', e.target.value)} />
                 {errors.nationality && <div className="text-red-500 text-xs">{errors.nationality}</div>}
               </div>
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Children Count<span className="text-red-500 ml-1">*</span></label>
                 <input type="number" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter children count" value={form.childrenCount} onChange={e => handleChange('childrenCount', e.target.value)} min="0" />
                 {errors.childrenCount && <div className="text-red-500 text-xs">{errors.childrenCount}</div>}
               </div>
               <div className="w-full">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Birthday<span className="text-red-500 ml-1">*</span></label>
                 <input type="date" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.birthday} onChange={e => handleChange('birthday', e.target.value)} />
                 {errors.birthday && <div className="text-red-500 text-xs">{errors.birthday}</div>}
               </div>
               <div className="w-full col-span-1 md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Current Address<span className="text-red-500 ml-1">*</span></label>
                 <textarea className="w-full h-[80px] px-4 py-2 text-sm border rounded-md" placeholder="Enter current address" value={form.currentAddress} onChange={e => handleChange('currentAddress', e.target.value)} />
                 {errors.currentAddress && <div className="text-red-500 text-xs">{errors.currentAddress}</div>}
               </div>
               <div className="w-full col-span-1 md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Permanent Address<span className="text-red-500 ml-1">*</span></label>
                 <textarea className="w-full h-[80px] px-4 py-2 text-sm border rounded-md" placeholder="Enter permanent address" value={form.permanentAddress} onChange={e => handleChange('permanentAddress', e.target.value)} />
                 {errors.permanentAddress && <div className="text-red-500 text-xs">{errors.permanentAddress}</div>}
               </div>
             </div>
           </div>
         );
       case 2:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><PhoneIcon className="h-6 w-6 text-indigo-400" /> Contact Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Phone Numbers<span className="text-red-500 ml-1">*</span></label>
                {form.contacts.map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <PhoneInput
                      country={'ae'}
                      value={c.value}
                      onChange={(phone, country) => handleContactChange(i, phone, country.countryCode)}
                      placeholder="50 123 4567"
                      enableSearch={true}
                      searchPlaceholder="Search country..."
                      preferredCountries={['ae', 'sa', 'kw', 'bh', 'om', 'qa']}
                      autoFormat={true}
                      disableSearchIcon={true}
                      countryCodeEditable={false}
                    />
                    {form.contacts.length > 1 && <button type="button" className="text-red-500" onClick={() => handleRemoveContact(i)}>Remove</button>}
                  </div>
                ))}
                <button type="button" className="text-blue-600" onClick={handleAddContact}>+ Add Phone</button>
                {errors.contacts && <div className="text-red-500 text-xs">{errors.contacts}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Emails<span className="text-red-500 ml-1">*</span></label>
                {form.emails.map((em, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={em} onChange={e => handleEmailChange(i, e.target.value)} placeholder="Email" />
                    {form.emails.length > 1 && <button type="button" className="text-red-500" onClick={() => handleRemoveEmail(i)}>Remove</button>}
                  </div>
                ))}
                <button type="button" className="text-blue-600" onClick={handleAddEmail}>+ Add Email</button>
                {errors.emails && <div className="text-red-500 text-xs">{errors.emails}</div>}
              </div>
            </div>
          </div>
        );
             case 3:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><BriefcaseIcon className="h-6 w-6 text-indigo-400" /> Company Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Company<span className="text-red-500 ml-1">*</span></label>
                <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter company name" value={form.company} onChange={e => handleChange('company', e.target.value)} />
                {errors.company && <div className="text-red-500 text-xs">{errors.company}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Department<span className="text-red-500 ml-1">*</span></label>
                <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter department" value={form.department} onChange={e => handleChange('department', e.target.value)} />
                {errors.department && <div className="text-red-500 text-xs">{errors.department}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Job Title<span className="text-red-500 ml-1">*</span></label>
                <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter job title" value={form.jobTitle} onChange={e => handleChange('jobTitle', e.target.value)} />
                {errors.jobTitle && <div className="text-red-500 text-xs">{errors.jobTitle}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Attendance Program<span className="text-red-500 ml-1">*</span></label>
                <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter attendance program" value={form.attendanceProgram} onChange={e => handleChange('attendanceProgram', e.target.value)} />
                {errors.attendanceProgram && <div className="text-red-500 text-xs">{errors.attendanceProgram}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Joining Date<span className="text-red-500 ml-1">*</span></label>
                <input type="date" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.joiningDate} onChange={e => handleChange('joiningDate', e.target.value)} />
                {errors.joiningDate && <div className="text-red-500 text-xs">{errors.joiningDate}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Exit Date</label>
                <input type="date" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.exitDate} onChange={e => handleChange('exitDate', e.target.value)} />
                {errors.exitDate && <div className="text-red-500 text-xs">{errors.exitDate}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Company Location<span className="text-red-500 ml-1">*</span></label>
                <select className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" multiple value={form.workingLocations} onChange={e => handleMultiSelect('workingLocations', e.target.value)}>
                  <option value="">Select locations</option>
                  <option value="HQ">HQ</option>
                  <option value="Remote">Remote</option>
                  <option value="Branch 1">Branch 1</option>
                  <option value="Branch 2">Branch 2</option>
                </select>
                {errors.workingLocations && <div className="text-red-500 text-xs">{errors.workingLocations}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Line Manager<span className="text-red-500 ml-1">*</span></label>
                <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter line manager name" value={form.manager} onChange={e => handleChange('manager', e.target.value)} />
                {errors.manager && <div className="text-red-500 text-xs">{errors.manager}</div>}
              </div>
              <div className="w-full flex items-center gap-2 mt-6">
                <input type="checkbox" checked={form.isLineManager} onChange={e => handleChange('isLineManager', e.target.checked)} />
                <label className="block text-sm font-medium text-gray-700 mb-1">Is Line Manager</label>
              </div>
            </div>
          </div>
        );
             case 4:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><IdentificationIcon className="h-6 w-6 text-indigo-400" /> Legal Information</div>
            <div className="space-y-4 mb-6">
              {/* Collapsible Section Helper */}
              {[
                { key: 'passport', label: 'Passport Info', fields: [
                  { name: 'passportNumber', label: 'Passport Number', placeholder: 'Enter passport number' },
                  { name: 'passportIssue', label: 'Passport Issue Date', type: 'date' },
                  { name: 'passportExpiry', label: 'Passport Expiry Date', type: 'date' },
                ]},
                { key: 'nationalId', label: 'National ID', fields: [
                  { name: 'nationalIdNumber', label: 'National ID Number', placeholder: 'Enter national ID number' },
                  { name: 'nationalIdExpiry', label: 'National ID Expiry', type: 'date' },
                ]},
                { key: 'residency', label: 'Residency Info', fields: [
                  { name: 'residencyNumber', label: 'Residency Number', placeholder: 'Enter residency number' },
                  { name: 'residencyExpiry', label: 'Residency Expiry', type: 'date' },
                ]},
                { key: 'insurance', label: 'Insurance', fields: [
                  { name: 'insuranceNumber', label: 'Insurance Number', placeholder: 'Enter insurance number' },
                  { name: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date' },
                ]},
                { key: 'driving', label: 'Driving Licence', fields: [
                  { name: 'drivingNumber', label: 'Driving Licence Number', placeholder: 'Enter driving licence number' },
                  { name: 'drivingExpiry', label: 'Driving Licence Expiry', type: 'date' },
                ]},
                { key: 'labour', label: 'Labour ID', fields: [
                  { name: 'labourNumber', label: 'Labour ID Number', placeholder: 'Enter labour ID number' },
                  { name: 'labourExpiry', label: 'Labour ID Expiry', type: 'date' },
                ]},
              ].map(section => (
                <div key={section.key} className="border rounded-lg overflow-hidden">
                  <button type="button" className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-indigo-50 transition font-semibold text-left" onClick={() => setOpenLegalSection(openLegalSection === section.key ? '' : section.key)}>
                    {section.label}
                    <span>{openLegalSection === section.key ? '-' : '+'}</span>
                  </button>
                  {openLegalSection === section.key && (
                    <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                      {section.fields.map(field => (
                        <div key={field.name} className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                          <input
                            className="w-full h-[42px] px-4 py-2 text-sm border rounded-md"
                            type={field.type || 'text'}
                            placeholder={field.placeholder || field.label}
                            value={form[field.name] || ''}
                            onChange={e => handleChange(field.name, e.target.value)}
                          />
                          {errors[field.name] && <div className="text-red-500 text-xs">{errors[field.name]}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                                 </div>
               ))}
             </div>
           </div>
        );
             case 5:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><DocumentPlusIcon className="h-6 w-6 text-indigo-400" /> Upload Documents</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
              <div className="w-full col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Documents</label>
                <input type="file" multiple onChange={handleFileChange} className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" />
                                 {form.documents.length > 0 && (
                   <ul className="mt-2 text-sm text-gray-600">
                     {form.documents.map((f, i) => <li key={i}>{f.name}</li>)}
                   </ul>
                 )}
               </div>
             </div>
           </div>
        );
             case 6:
         return (
           <div>
             <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><CheckCircleIcon className="h-6 w-6 text-green-500" /> Review & Submit</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
              <div className="w-full"><b>Gender:</b> {form.gender}</div>
              <div className="w-full"><b>Marital Status:</b> {form.maritalStatus}</div>
              <div className="w-full"><b>Nationality:</b> {form.nationality}</div>
              <div className="w-full"><b>Birthday:</b> {form.birthday}</div>
              <div className="w-full"><b>Phones:</b> {form.contacts.map(c => c.value).join(", ")}</div>
              <div className="w-full"><b>Emails:</b> {form.emails.join(", ")}</div>
              <div className="w-full"><b>Department:</b> {form.department}</div>
              <div className="w-full"><b>Job Title:</b> {form.jobTitle}</div>
              <div className="w-full"><b>Location:</b> {form.location}</div>
              <div className="w-full"><b>Manager:</b> {form.manager}</div>
              <div className="w-full"><b>Passport:</b> {form.passport}</div>
              <div className="w-full"><b>ID:</b> {form.id}</div>
              <div className="w-full"><b>Visa:</b> {form.visa}</div>
              <div className="w-full"><b>Insurance:</b> {form.insurance}</div>
              <div className="w-full"><b>Documents:</b> {form.documents.map(f => f.name).join(", ")}</div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn btn-success flex items-center justify-center gap-2"><CheckCircleIcon className="h-5 w-5" /> Submit</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <EmployeeFormContext.Provider value={ctxValue}>
      <div className="w-full flex flex-col items-center animate-fade-in px-1 sm:px-2 md:px-4">
        {/* Mobile Stepper */}
        <div className="w-full lg:hidden mb-4 mt-2 px-1 overflow-x-auto">
          <div className="flex items-center justify-between mb-4 min-w-[400px]">
            <span className="text-xs font-medium text-gray-500">Step {step + 1} of {steps.length}</span>
            <span className="text-xs font-medium text-indigo-600">{steps[step].label}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop Stepper */}
        <div className="w-full relative mb-6 mt-6 px-2 sm:px-4 lg:px-10 hidden lg:block" style={{height: 60}}>
          {/* Progress line (background) */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-gray-300 rounded z-0" />
          {/* Progress line (active) */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-indigo-500 rounded z-0 transition-all duration-300"
            style={{ width: `${(step/(steps.length-1))*100}%`, right: 'auto' }}
          />
          {/* Stepper icons */}
          <div className="relative z-10 flex items-center justify-between w-full">
            {steps.map((s, i) => {
              const canGo = i === 0 || Array.from({length: i}).every((_, idx) => {
                // Simulate validation for each previous step
                let errs = {};
                if (idx === 0) {
                  if (!form.employeeType) errs.employeeType = 'Required';
                  if (!form.firstName) errs.firstName = 'Required';
                  if (!form.lastName) errs.lastName = 'Required';
                  if (!form.employeeId) errs.employeeId = 'Required';
                  if (!form.status) errs.status = 'Required';
                }
                                 if (idx === 1) {
                   if (!form.gender) errs.gender = 'Required';
                   if (!form.maritalStatus) errs.maritalStatus = 'Required';
                   if (!form.nationality) errs.nationality = 'Required';
                   if (!form.currentAddress) errs.currentAddress = 'Required';
                   if (!form.permanentAddress) errs.permanentAddress = 'Required';
                   if (!form.childrenCount) errs.childrenCount = 'Required';
                   if (!form.birthday) errs.birthday = 'Required';
                 }
                 if (idx === 2) {
                   if (!form.contacts[0].value) errs.contacts = 'At least one phone required';
                   if (!form.emails[0]) errs.emails = 'At least one email required';
                 }
                 if (idx === 3) {
                   if (!form.company) errs.company = 'Required';
                   if (!form.department) errs.department = 'Required';
                   if (!form.jobTitle) errs.jobTitle = 'Required';
                   if (!form.attendanceProgram) errs.attendanceProgram = 'Required';
                   if (!form.joiningDate) errs.joiningDate = 'Required';
                   if (!form.exitDate) errs.exitDate = 'Required';
                   if (!form.workingLocations || form.workingLocations.length === 0) errs.workingLocations = 'Required';
                   if (!form.manager) errs.manager = 'Required';
                 }
                 if (idx === 4) {
                   if (!form.passportNumber) errs.passportNumber = 'Required';
                   if (!form.passportIssue) errs.passportIssue = 'Required';
                   if (!form.passportExpiry) errs.passportExpiry = 'Required';
                   if (!form.nationalIdNumber) errs.nationalIdNumber = 'Required';
                   if (!form.nationalIdExpiry) errs.nationalIdExpiry = 'Required';
                   if (!form.residencyNumber) errs.residencyNumber = 'Required';
                   if (!form.residencyExpiry) errs.residencyExpiry = 'Required';
                   if (!form.insuranceNumber) errs.insuranceNumber = 'Required';
                   if (!form.insuranceExpiry) errs.insuranceExpiry = 'Required';
                   if (!form.drivingNumber) errs.drivingNumber = 'Required';
                   if (!form.drivingExpiry) errs.drivingExpiry = 'Required';
                   if (!form.labourNumber) errs.labourNumber = 'Required';
                   if (!form.labourExpiry) errs.labourExpiry = 'Required';
                 }
                return Object.keys(errs).length === 0;
              });
              const isCompleted = i < step;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center w-1/6 ${i === step ? 'text-indigo-600 font-bold' : canGo ? 'text-gray-400 cursor-pointer hover:text-indigo-500' : 'text-gray-300 cursor-not-allowed'}`}
                  onClick={() => canGo && setStep(i)}
                  title={canGo ? s.label : 'Complete previous steps first'}
                  style={{ pointerEvents: canGo ? 'auto' : 'none' }}
                >
                  <div className={`relative z-10 rounded-full w-10 h-10 flex items-center justify-center border-2 ${i === step ? 'border-indigo-600 bg-indigo-100' : isCompleted ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 bg-white'} transition-all duration-300`}>
                    {isCompleted ? (
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <s.icon className={`h-6 w-6 ${i === step ? 'text-indigo-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="text-xs mt-2 text-center whitespace-nowrap">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-2xl p-2 sm:p-4 lg:p-10 border border-indigo-100 mx-0">
          {renderStep()}
          <div className="flex flex-col sm:flex-row justify-between mt-6 gap-2 sm:gap-4">
            <button type="button" className="btn flex items-center justify-center gap-2 order-2 sm:order-1 w-full sm:w-auto" onClick={onBack}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to List
            </button>
            <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2 w-full sm:w-auto">
              {step > 0 && <button type="button" className="btn flex items-center justify-center gap-2 w-full sm:w-auto" onClick={handlePrev}><svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Previous</button>}
              {step < steps.length - 1 && <button type="button" className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto" onClick={handleNext}>Next <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>}
              {step === steps.length - 1 && <button type="submit" className="btn btn-success flex items-center justify-center gap-2 w-full sm:w-auto"><CheckCircleIcon className="h-5 w-5" /> Submit</button>}
            </div>
          </div>
          {submitted && <div className="mt-4 text-green-600 font-bold text-center">Employee submitted successfully!</div>}
        </form>
        <style>{`
          .input { @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200; }
          .btn { @apply px-4 py-2 rounded font-semibold transition bg-white border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm; }
          .btn-primary { @apply bg-indigo-600 text-white hover:bg-indigo-700 border-0; }
          .btn-success { @apply bg-green-600 text-white hover:bg-green-700 border-0; }
          .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(.4,0,.2,1); }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
          
          ${phoneInputStyles}
        `}</style>
      </div>
    </EmployeeFormContext.Provider>
  );
}

export default function Employees() {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleEmployeeClick = (employee) => {
    // Navigate to employee details or edit form
    console.log('Employee clicked:', employee);
    // You can add navigation here when needed
  };

  const handleBackToPositions = () => {
    // Navigate back to the positions page
    navigate(-1);
  };
  return (
    <div className="w-full h-full flex flex-col">
      <Breadcrumbs names={{}} />
      
      {/* Enhanced Top Section - Employee Directory */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 px-4 sm:px-6 lg:px-10 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToPositions}
            className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm"
            title="Back to Positions"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-500" /> 
            Employee Directory
          </h2>
        </div>
        <button
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 w-full sm:w-auto justify-center transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          onClick={() => setShowForm(true)}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          + Create Employee
        </button>
      </div>
      
      {/* Enhanced Section Header - Employees Management */}
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 relative overflow-hidden mb-8">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white opacity-10 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                <UsersIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-indigo-100 text-lg">View and manage all employees in your organization</p>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white bg-opacity-30 rounded-xl">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{demoEmployees.length}</div>
                    <div className="text-indigo-100 text-sm">Total Employees</div>
                  </div>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white bg-opacity-30 rounded-xl">
                    <BriefcaseIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">4</div>
                    <div className="text-indigo-100 text-sm">Departments</div>
                  </div>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white bg-opacity-30 rounded-xl">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{demoEmployees.length}</div>
                    <div className="text-indigo-100 text-sm">Active Employees</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-indigo-50 to-white min-h-[60vh] px-4 sm:px-6 lg:px-10">
        {!showForm ? (
          <div className="w-full mt-4 sm:mt-8">
            {/* Enhanced Mobile Cards View */}
            <div className="lg:hidden space-y-6">
              {demoEmployees.map(emp => (
                <div 
                  key={emp.id} 
                  className="group bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:border-indigo-300 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden"
                  onClick={() => handleEmployeeClick(emp)}
                  title="Click to view employee details"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative p-6">
                    {/* Header with enhanced styling */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                        <UserIcon className="h-6 w-6 text-white" />
                  </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-900 transition-colors">{emp.name}</h3>
                        <p className="text-gray-500 text-sm">Employee</p>
                    </div>
                    </div>
                    
                    {/* Enhanced info sections */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <BriefcaseIcon className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Department</span>
                          <div className="text-gray-900 font-semibold">{emp.department}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <ClipboardDocumentListIcon className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Job Title</span>
                          <div className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-sm">
                        {emp.jobTitle}
                    </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-indigo-50 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-indigo-100 rounded-lg flex items-center justify-center">
                          <EnvelopeIcon className="h-4 w-4 text-pink-600" />
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Email</span>
                          <div className="text-gray-900 font-semibold text-sm">{emp.email}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action indicator */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Click to view details</span>
                        <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                          <span>View Details</span>
                          <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Enhanced Desktop Table View */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                      <tr>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Employee</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Department</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Job Title</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Contact</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                  {demoEmployees.map(emp => (
                    <tr 
                      key={emp.id} 
                          className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 cursor-pointer group" 
                      onClick={() => handleEmployeeClick(emp)}
                      title="Click to view employee details"
                    >
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                                <UserIcon className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 text-base group-hover:text-indigo-900 transition-colors">{emp.name}</div>
                                <div className="text-gray-500 text-sm">Employee</div>
                              </div>
                            </div>
                      </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm">
                                <BriefcaseIcon className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <span className="text-gray-900 text-sm font-semibold">{emp.department}</span>
                                <div className="text-gray-500 text-xs">Department</div>
                              </div>
                            </div>
                      </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-sm">
                                <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-sm">
                                  {emp.jobTitle}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-indigo-100 rounded-full flex items-center justify-center shadow-sm">
                                <EnvelopeIcon className="h-5 w-5 text-pink-600" />
                              </div>
                              <div>
                                <span className="text-gray-900 text-sm font-semibold">{emp.email}</span>
                                <div className="text-gray-500 text-xs">Email</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEmployeeClick(emp);
                                }}
                                className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                title="View Employee"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle edit functionality
                                }}
                                className="p-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                                title="Edit Employee"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmployeeForm onBack={() => setShowForm(false)} />
        )}
      </div>

    </div>
  );
} 