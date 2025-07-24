import React, { useState, createContext, useContext } from "react";
import { UserIcon, EnvelopeIcon, PhoneIcon, BriefcaseIcon, MapPinIcon, IdentificationIcon, DocumentPlusIcon, CheckCircleIcon, CalendarIcon, AcademicCapIcon, UsersIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

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
    middleName: "",
    lastName: "",
    employeeId: "",
    status: "",
    userAccount: false,
    personalImage: null,
    gender: "",
    maritalStatus: "",
    nationality: "",
    birthday: "",
    contacts: [{ type: "phone", value: "" }],
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

  // Handlers
  const handleChange = (field, value) => setForm({ ...form, [field]: value });
  const handleContactChange = (idx, value) => {
    const contacts = [...form.contacts];
    contacts[idx].value = value;
    setForm({ ...form, contacts });
  };
  const handleAddContact = () => setForm({ ...form, contacts: [...form.contacts, { type: "phone", value: "" }] });
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
      if (!form.middleName) errs.middleName = "Required";
      if (!form.lastName) errs.lastName = "Required";
      if (!form.employeeId) errs.employeeId = "Required";
      if (!form.status) errs.status = "Required";
    }
    if (step === 1) {
      if (!form.contacts[0].value) errs.contacts = "At least one phone required";
      if (!form.emails[0]) errs.emails = "At least one email required";
    }
    if (step === 2) {
      if (!form.company) errs.company = "Required";
      if (!form.department) errs.department = "Required";
      if (!form.jobTitle) errs.jobTitle = "Required";
      if (!form.attendanceProgram) errs.attendanceProgram = "Required";
      if (!form.joiningDate) errs.joiningDate = "Required";
      if (!form.exitDate) errs.exitDate = "Required";
      if (!form.workingLocations || form.workingLocations.length === 0) errs.workingLocations = "Required";
      if (!form.manager) errs.manager = "Required";
    }
    if (step === 3) {
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" placeholder="Enter middle name" value={form.middleName} onChange={e => handleChange('middleName', e.target.value)} />
                {errors.middleName && <div className="text-red-500 text-xs">{errors.middleName}</div>}
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
            <div className="flex justify-end">
              <button type="button" className="btn btn-primary" onClick={handleNext}>Next</button>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <div className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-2"><PhoneIcon className="h-6 w-6 text-indigo-400" /> Contact Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-6 px-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Phone Numbers<span className="text-red-500 ml-1">*</span></label>
                {form.contacts.map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={c.value} onChange={e => handleContactChange(i, e.target.value)} placeholder="Phone" />
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
            <div className="flex justify-end">
              <button type="button" className="btn btn-primary" onClick={handleNext}>Next</button>
            </div>
          </div>
        );
      case 2:
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
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Exit Date<span className="text-red-500 ml-1">*</span></label>
                <input type="date" className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" value={form.exitDate} onChange={e => handleChange('exitDate', e.target.value)} />
                {errors.exitDate && <div className="text-red-500 text-xs">{errors.exitDate}</div>}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">Working Locations<span className="text-red-500 ml-1">*</span></label>
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
            <div className="flex justify-end">
              <button type="button" className="btn btn-primary" onClick={handleNext}>Next</button>
            </div>
          </div>
        );
      case 3:
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
            <div className="flex justify-end">
              <button type="button" className="btn btn-primary" onClick={handleNext}>Next</button>
            </div>
          </div>
        );
      case 4:
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
            <div className="flex justify-end">
              <button type="button" className="btn btn-primary" onClick={handleNext}>Next</button>
            </div>
          </div>
        );
      case 5:
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
                  if (!form.middleName) errs.middleName = 'Required';
                  if (!form.lastName) errs.lastName = 'Required';
                  if (!form.employeeId) errs.employeeId = 'Required';
                  if (!form.status) errs.status = 'Required';
                }
                if (idx === 1) {
                  if (!form.contacts[0].value) errs.contacts = 'At least one phone required';
                  if (!form.emails[0]) errs.emails = 'At least one email required';
                }
                if (idx === 2) {
                  if (!form.company) errs.company = 'Required';
                  if (!form.department) errs.department = 'Required';
                  if (!form.jobTitle) errs.jobTitle = 'Required';
                  if (!form.attendanceProgram) errs.attendanceProgram = 'Required';
                  if (!form.joiningDate) errs.joiningDate = 'Required';
                  if (!form.exitDate) errs.exitDate = 'Required';
                  if (!form.workingLocations || form.workingLocations.length === 0) errs.workingLocations = 'Required';
                  if (!form.manager) errs.manager = 'Required';
                }
                if (idx === 3) {
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
        `}</style>
      </div>
    </EmployeeFormContext.Provider>
  );
}

export default function Employees() {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-10 border-b bg-white shadow-sm gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-500" /> 
          Employees
        </h1>
        <button
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => setShowForm(true)}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Employee
        </button>
      </div>
      
      {/* Attractive Section Header */}
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 mt-6 sm:mt-8 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-lg px-4 sm:px-6 py-3 sm:py-4 border-l-4 border-blue-500 shadow-sm">
          <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Employees</h2>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-indigo-50 to-white min-h-[60vh] px-4 sm:px-6 lg:px-10">
        {!showForm ? (
          <div className="w-full mt-4 sm:mt-8">
            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-3 sm:space-y-4 px-2">
              {demoEmployees.map(emp => (
                <div key={emp.id} className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-200 hover:shadow-lg transition">
                  <div className="flex items-center gap-3 mb-2 sm:mb-3">
                    <UserIcon className="h-5 w-5 text-indigo-400" />
                    <h3 className="font-semibold text-gray-800 text-sm flex-1">{emp.name}</h3>
                  </div>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{emp.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClipboardDocumentListIcon className="h-4 w-4 text-gray-400" />
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                        {emp.jobTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{emp.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto rounded-2xl shadow-2xl bg-white border border-indigo-100 w-full">
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {demoEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-indigo-50 transition cursor-pointer">
                      <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-semibold flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-indigo-400" /> {emp.name}
                      </td>
                      <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">{emp.department}</td>
                      <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 shadow-sm">{emp.jobTitle}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap flex items-center gap-2">
                        <EnvelopeIcon className="h-4 w-4 text-indigo-300" /> {emp.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmployeeForm onBack={() => setShowForm(false)} />
        )}
      </div>
    </div>
  );
} 