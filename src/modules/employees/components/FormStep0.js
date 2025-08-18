import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

const FormStep0 = ({ form, errors, handlers, showUserModal, setShowUserModal, userAccountFields, setUserAccountFields, handleUserAccountSave }) => {
  const { handleChange, handleImageChange } = handlers;

  return (
    <div>
      {/* User Account Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
            <h3 className="text-lg font-bold mb-4">Create User Account</h3>
            <div className="mb-4">
              <label className="block font-medium mb-1">User Name</label>
              <input 
                className="input" 
                placeholder="Enter user name" 
                value={userAccountFields.username} 
                onChange={e => setUserAccountFields(f => ({ ...f, username: e.target.value }))} 
              />
              {userAccountFields.username === '' && <div className="text-red-500 text-xs mt-1">Required</div>}
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Password</label>
              <input 
                type="password" 
                className="input" 
                placeholder="Enter password" 
                value={userAccountFields.password} 
                onChange={e => setUserAccountFields(f => ({ ...f, password: e.target.value }))} 
              />
              {userAccountFields.password === '' && <div className="text-red-500 text-xs mt-1">Required</div>}
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Password Confirm</label>
              <input 
                type="password" 
                className="input" 
                placeholder="Confirm password" 
                value={userAccountFields.passwordConfirm} 
                onChange={e => setUserAccountFields(f => ({ ...f, passwordConfirm: e.target.value }))} 
              />
              {userAccountFields.passwordConfirm === '' && <div className="text-red-500 text-xs mt-1">Required</div>}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button 
                type="button" 
                className="btn" 
                onClick={() => setShowUserModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  if (userAccountFields.username && userAccountFields.password && userAccountFields.passwordConfirm) {
                    handleUserAccountSave();
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-6 mb-8 flex-col sm:flex-row">
        <div className="relative">
          <div 
            className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-200 to-indigo-400 flex items-center justify-center shadow-lg overflow-hidden cursor-pointer" 
            onClick={() => document.getElementById('personalImageInput').click()}
          >
            {form.personalImage ? (
              <img 
                src={URL.createObjectURL(form.personalImage)} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full" 
              />
            ) : (
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>
          <input
            id="personalImageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          {form.personalImage && (
            <p className="text-xs text-green-600 font-medium mt-1">{form.personalImage.name}</p>
          )}
        </div>
        <div className="text-lg font-semibold text-gray-700 mt-2 sm:mt-0">Main Information</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 mb-6 px-1 sm:px-2">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            Employee Type<span className="text-red-500 ml-1">*</span>
          </label>
          <select 
            className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
            value={form.employeeType} 
            onChange={e => handleChange('employeeType', e.target.value)}
          >
            <option value="">Select employee type</option>
            <option value="permanent">Permanent</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </select>
          {errors.employeeType && <div className="text-red-500 text-xs">{errors.employeeType}</div>}
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            First Name<span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
            placeholder="Enter first name" 
            value={form.firstName} 
            onChange={e => handleChange('firstName', e.target.value)} 
          />
          {errors.firstName && <div className="text-red-500 text-xs">{errors.firstName}</div>}
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            Last Name<span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
            placeholder="Enter last name" 
            value={form.lastName} 
            onChange={e => handleChange('lastName', e.target.value)} 
          />
          {errors.lastName && <div className="text-red-500 text-xs">{errors.lastName}</div>}
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            Employee ID<span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
            placeholder="Enter employee ID" 
            value={form.employeeId} 
            onChange={e => handleChange('employeeId', e.target.value)} 
          />
          {errors.employeeId && <div className="text-red-500 text-xs">{errors.employeeId}</div>}
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            Status<span className="text-red-500 ml-1">*</span>
          </label>
          <select 
            className="w-full h-[42px] px-4 py-2 text-sm border rounded-md" 
            value={form.status} 
            onChange={e => handleChange('status', e.target.value)}
          >
            <option value="">Select status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          {errors.status && <div className="text-red-500 text-xs">{errors.status}</div>}
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            User Account
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.userAccount}
              onChange={e => handleChange('userAccount', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Create user account</span>
            {form.userAccount && (
              <button
                type="button"
                onClick={() => setShowUserModal(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Configure
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep0;
