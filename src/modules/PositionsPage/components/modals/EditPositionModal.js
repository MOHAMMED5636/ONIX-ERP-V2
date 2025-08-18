import React from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';

const EditPositionModal = ({ 
  showEditModal, 
  setShowEditModal, 
  editPosition, 
  setEditPosition, 
  handleUpdatePosition 
}) => {
  if (!showEditModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 px-4 sm:px-5 py-3 sm:py-4">
          <PencilIcon className="h-6 w-6 text-white" />
          <h3 className="text-base sm:text-lg font-bold text-white">Edit Position</h3>
        </div>
        {/* Modal Body */}
        <div className="p-3 sm:p-6 bg-gradient-to-br from-blue-50 to-white">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block font-medium mb-1 text-gray-700 text-sm">Position Name <span className="text-red-500">*</span></label>
              <input 
                className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                placeholder="Enter position name" 
                value={editPosition.name} 
                onChange={e => setEditPosition(f => ({ ...f, name: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 text-sm">Description <span className="text-red-500">*</span></label>
              <textarea 
                className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                rows="3"
                placeholder="Enter position description" 
                value={editPosition.description} 
                onChange={e => setEditPosition(f => ({ ...f, description: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 text-sm">Manager <span className="text-red-500">*</span></label>
              <input 
                className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                placeholder="Enter manager name" 
                value={editPosition.manager} 
                onChange={e => setEditPosition(f => ({ ...f, manager: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 text-sm">Salary</label>
              <input 
                className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                placeholder="Enter salary" 
                value={editPosition.salary} 
                onChange={e => setEditPosition(f => ({ ...f, salary: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 text-sm">Requirements</label>
              <textarea 
                className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                rows="2"
                placeholder="Enter job requirements" 
                value={editPosition.requirements} 
                onChange={e => setEditPosition(f => ({ ...f, requirements: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 text-sm">Status</label>
              <select 
                className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                value={editPosition.status} 
                onChange={e => setEditPosition(f => ({ ...f, status: e.target.value }))} 
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
            <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 w-full sm:w-auto" onClick={() => setShowEditModal(false)}>Cancel</button>
            <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-0 w-full sm:w-auto" onClick={handleUpdatePosition}>Update</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPositionModal;
