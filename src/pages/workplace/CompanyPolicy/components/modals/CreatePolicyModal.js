import React from 'react';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { fileTypeOptions } from '../../constants';

const CreatePolicyModal = ({
  showCreateModal,
  newPolicy,
  setNewPolicy,
  departments,
  onClose,
  onSave
}) => {
  if (!showCreateModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"></div>
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative flex items-center justify-between p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                <DocumentTextIcon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Create New Policy</h3>
                <p className="text-purple-100 text-sm font-medium">Add a new company policy</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Policy Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Title *
              </label>
              <input
                type="text"
                value={newPolicy.title}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter policy title"
              />
            </div>

            {/* Policy Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={newPolicy.description}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Enter policy description"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                value={newPolicy.department}
                onChange={(e) => setNewPolicy(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.filter(dept => dept !== "All Departments").map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy File (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, file: e.target.files[0] }))}
                  className="hidden"
                  id="policy-file"
                  accept=".pdf,.docx,.xlsx,.pptx,.txt"
                />
                <label htmlFor="policy-file" className="cursor-pointer">
                  <div className="space-y-2">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {newPolicy.file ? newPolicy.file.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOCX, XLSX, PPTX, TXT up to 10MB</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Required fields:</span> Title, Description, Department
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-semibold border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ✅ Create Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePolicyModal;
