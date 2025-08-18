import React, { useState, useEffect } from 'react';
import { useCompanySelection } from '../../../context/CompanySelectionContext';
import { initialFormState, steps, companyLocations } from '../constants';
import { validateStep, createFormHandlers, formatPhoneForSubmission } from '../utils';
import { EmployeeFormProvider } from '../context';
import FormStep0 from './FormStep0';

const EmployeeForm = ({ onBack, onSaveEmployee, jobTitles, attendancePrograms, employeesList }) => {
  const [step, setStep] = useState(0);
  const { selectedCompany, selectedDepartment } = useCompanySelection();
  
  const [form, setForm] = useState({
    ...initialFormState,
    department: selectedDepartment || "",
    company: selectedCompany || "",
  });
  
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userAccountFields, setUserAccountFields] = useState({ username: '', password: '', passwordConfirm: '' });
  const [openLegalSection, setOpenLegalSection] = useState('');
  const [nationalityDropdownOpen, setNationalityDropdownOpen] = useState(false);

  // Context value
  const ctxValue = { form, setForm };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nationalityDropdownOpen && !event.target.closest('.nationality-dropdown')) {
        setNationalityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [nationalityDropdownOpen]);

  // Update form when selected company or department changes
  useEffect(() => {
    if (selectedCompany) {
      setForm(prev => ({ ...prev, company: selectedCompany }));
    }
    if (selectedDepartment) {
      setForm(prev => ({ ...prev, department: selectedDepartment }));
    }
  }, [selectedCompany, selectedDepartment]);

  const handlers = createFormHandlers(form, setForm);

  const handleUserAccountSave = () => {
    setForm({ ...form, userAccount: true, userAccountFields });
    setShowUserModal(false);
  };

  const handleNext = () => {
    const stepErrors = validateStep(step, form);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setStep((s) => s + 1);
    }
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
    
    // Save the employee to the list
    if (onSaveEmployee) {
      onSaveEmployee(submissionData);
    }
  };

  // Step content
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <FormStep0 
            form={form}
            errors={errors}
            handlers={handlers}
            showUserModal={showUserModal}
            setShowUserModal={setShowUserModal}
            userAccountFields={userAccountFields}
            setUserAccountFields={setUserAccountFields}
            handleUserAccountSave={handleUserAccountSave}
          />
        );
      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.gender} 
                  onChange={e => handlers.handleChange('gender', e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <div className="text-red-500 text-xs">{errors.gender}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.maritalStatus} 
                  onChange={e => handlers.handleChange('maritalStatus', e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
                {errors.maritalStatus && <div className="text-red-500 text-xs">{errors.maritalStatus}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  placeholder="Enter nationality" 
                  value={form.nationality} 
                  onChange={e => handlers.handleChange('nationality', e.target.value)} 
                />
                {errors.nationality && <div className="text-red-500 text-xs">{errors.nationality}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                <input 
                  type="date" 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.birthday} 
                  onChange={e => handlers.handleChange('birthday', e.target.value)} 
                />
                {errors.birthday && <div className="text-red-500 text-xs">{errors.birthday}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Children Count</label>
                <input 
                  type="number" 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  placeholder="Number of children" 
                  value={form.childrenCount} 
                  onChange={e => handlers.handleChange('childrenCount', e.target.value)} 
                />
                {errors.childrenCount && <div className="text-red-500 text-xs">{errors.childrenCount}</div>}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
              <textarea 
                className="w-full px-4 py-2 text-sm border rounded-md" 
                rows={3} 
                placeholder="Enter current address" 
                value={form.currentAddress} 
                onChange={e => handlers.handleChange('currentAddress', e.target.value)} 
              />
              {errors.currentAddress && <div className="text-red-500 text-xs">{errors.currentAddress}</div>}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Numbers</label>
                {form.contacts.map((contact, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input 
                      className="flex-1 h-[42px] px-4 py-2 text-sm border rounded-md" 
                      placeholder="Phone number" 
                      value={contact.value} 
                      onChange={e => handlers.handleContactChange(idx, e.target.value)} 
                    />
                    <button 
                      type="button" 
                      onClick={() => handlers.handleRemoveContact(idx)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={handlers.handleAddContact}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add Phone Number
                </button>
                {errors.contacts && <div className="text-red-500 text-xs">{errors.contacts}</div>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Addresses</label>
                {form.emails.map((email, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input 
                      type="email" 
                      className="flex-1 h-[42px] px-4 py-2 text-sm border rounded-md" 
                      placeholder="Email address" 
                      value={email} 
                      onChange={e => handlers.handleEmailChange(idx, e.target.value)} 
                    />
                    <button 
                      type="button" 
                      onClick={() => handlers.handleRemoveEmail(idx)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={handlers.handleAddEmail}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add Email Address
                </button>
                {errors.emails && <div className="text-red-500 text-xs">{errors.emails}</div>}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  placeholder="Enter company" 
                  value={form.company} 
                  onChange={e => handlers.handleChange('company', e.target.value)} 
                />
                {errors.company && <div className="text-red-500 text-xs">{errors.company}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.department} 
                  onChange={e => handlers.handleChange('department', e.target.value)}
                >
                  <option value="">Select department</option>
                  <option value="HR">HR</option>
                  <option value="IT">IT</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                </select>
                {errors.department && <div className="text-red-500 text-xs">{errors.department}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <select 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.jobTitle} 
                  onChange={e => handlers.handleChange('jobTitle', e.target.value)}
                >
                  <option value="">Select job title</option>
                  {jobTitles?.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
                {errors.jobTitle && <div className="text-red-500 text-xs">{errors.jobTitle}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                <select 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.manager} 
                  onChange={e => handlers.handleChange('manager', e.target.value)}
                >
                  <option value="">Select manager</option>
                  {employeesList?.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
                  ))}
                </select>
                {errors.manager && <div className="text-red-500 text-xs">{errors.manager}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                <input 
                  type="date" 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.joiningDate} 
                  onChange={e => handlers.handleChange('joiningDate', e.target.value)} 
                />
                {errors.joiningDate && <div className="text-red-500 text-xs">{errors.joiningDate}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Location</label>
                <select 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.companyLocation} 
                  onChange={e => handlers.handleChange('companyLocation', e.target.value)}
                >
                  <option value="">Select location</option>
                  {companyLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                {errors.companyLocation && <div className="text-red-500 text-xs">{errors.companyLocation}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Program</label>
                <select 
                  className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                  value={form.attendanceProgram} 
                  onChange={e => handlers.handleChange('attendanceProgram', e.target.value)}
                >
                  <option value="">Select program</option>
                  {attendancePrograms?.map(program => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
                {errors.attendanceProgram && <div className="text-red-500 text-xs">{errors.attendanceProgram}</div>}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal Documents</h3>
            <div className="space-y-6">
              {/* Passport Section */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Passport Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                    <input 
                      className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                      placeholder="Enter passport number" 
                      value={form.passportNumber} 
                      onChange={e => handlers.handleChange('passportNumber', e.target.value)} 
                    />
                    {errors.passportNumber && <div className="text-red-500 text-xs">{errors.passportNumber}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                    <input 
                      type="date" 
                      className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                      value={form.passportIssue} 
                      onChange={e => handlers.handleChange('passportIssue', e.target.value)} 
                    />
                    {errors.passportIssue && <div className="text-red-500 text-xs">{errors.passportIssue}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input 
                      type="date" 
                      className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                      value={form.passportExpiry} 
                      onChange={e => handlers.handleChange('passportExpiry', e.target.value)} 
                    />
                    {errors.passportExpiry && <div className="text-red-500 text-xs">{errors.passportExpiry}</div>}
                  </div>
                </div>
              </div>

              {/* National ID Section */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">National ID Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">National ID Number</label>
                    <input 
                      className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                      placeholder="Enter national ID number" 
                      value={form.nationalIdNumber} 
                      onChange={e => handlers.handleChange('nationalIdNumber', e.target.value)} 
                    />
                    {errors.nationalIdNumber && <div className="text-red-500 text-xs">{errors.nationalIdNumber}</div>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input 
                      type="date" 
                      className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
                      value={form.nationalIdExpiry} 
                      onChange={e => handlers.handleChange('nationalIdExpiry', e.target.value)} 
                    />
                    {errors.nationalIdExpiry && <div className="text-red-500 text-xs">{errors.nationalIdExpiry}</div>}
                  </div>
                </div>
              </div>

              {/* Additional legal documents would go here */}
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {form.firstName} {form.lastName}</div>
                <div><strong>Employee ID:</strong> {form.employeeId}</div>
                <div><strong>Employee Type:</strong> {form.employeeType}</div>
                <div><strong>Status:</strong> {form.status}</div>
              </div>
              
              <h4 className="font-medium mb-3 mt-6">Contact Information</h4>
              <div className="text-sm">
                <div><strong>Phone:</strong> {form.contacts[0]?.value}</div>
                <div><strong>Email:</strong> {form.emails[0]}</div>
              </div>
              
              <h4 className="font-medium mb-3 mt-6">Company Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Company:</strong> {form.company}</div>
                <div><strong>Department:</strong> {form.department}</div>
                <div><strong>Job Title:</strong> {form.jobTitle}</div>
                <div><strong>Joining Date:</strong> {form.joiningDate}</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <EmployeeFormProvider value={ctxValue}>
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((stepItem, idx) => (
            <div key={idx} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                idx <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {idx + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                idx <= step ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {stepItem.label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  idx < step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back
            </button>
            <div className="flex gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </EmployeeFormProvider>
  );
};

export default EmployeeForm;
