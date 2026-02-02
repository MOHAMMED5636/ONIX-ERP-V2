import React from 'react';
import { BriefcaseIcon, PlusIcon } from '@heroicons/react/24/outline';

const CreatePositionModal = ({ 
  showCreateModal, 
  setShowCreateModal, 
  newPosition, 
  setNewPosition, 
  subDepartmentName, 
  handleCreatePosition 
}) => {
  if (!showCreateModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-1 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md relative animate-fade-in overflow-hidden border border-gray-100">
        {/* Modal Header with enhanced styling */}
        <div className="relative overflow-hidden">
          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 px-6 py-4">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <BriefcaseIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add Position</h3>
              <p className="text-purple-100 text-sm">Create a new position under {subDepartmentName}</p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>
        </div>
        
        {/* Modal Body with enhanced styling */}
        <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-purple-50">
          <div className="space-y-5">
            {/* Position Name Field */}
            <div className="group">
              <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Position Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-sm bg-white shadow-sm" 
                  placeholder="e.g., Chief Executive Officer" 
                  value={newPosition.name} 
                  onChange={e => setNewPosition(f => ({ ...f, name: e.target.value }))} 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <div className="w-2 h-2 bg-purple-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
            </div>

            {/* Description Field */}
            <div className="group">
              <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-200 text-sm bg-white shadow-sm resize-none" 
                  rows="3"
                  placeholder="Describe the position's role and responsibilities..." 
                  value={newPosition.description} 
                  onChange={e => setNewPosition(f => ({ ...f, description: e.target.value }))} 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <div className="w-2 h-2 bg-pink-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
            </div>

            {/* Manager Field */}
            <div className="group">
              <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                Manager <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 text-sm bg-white shadow-sm" 
                  placeholder="e.g., John Smith" 
                  value={newPosition.manager} 
                  onChange={e => setNewPosition(f => ({ ...f, manager: e.target.value }))} 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <div className="w-2 h-2 bg-rose-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
            </div>

            {/* Requirements Field */}
            <div className="group">
              <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Requirements
              </label>
              <div className="relative">
                <textarea 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm resize-none" 
                  rows="2"
                  placeholder="Enter job requirements and qualifications..." 
                  value={newPosition.requirements} 
                  onChange={e => setNewPosition(f => ({ ...f, requirements: e.target.value }))} 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
            </div>

            {/* Status Field */}
            <div className="group">
              <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                Status
              </label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all duration-200 text-sm bg-white shadow-sm appearance-none" 
                  value={newPosition.status} 
                  onChange={e => setNewPosition(f => ({ ...f, status: e.target.value }))} 
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button 
              type="button" 
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5" 
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-0" 
              onClick={handleCreatePosition}
            >
              <span className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Create Position
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePositionModal;
