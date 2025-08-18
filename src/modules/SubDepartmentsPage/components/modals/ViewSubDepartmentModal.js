import React from 'react';
import { EyeIcon, ChartPieIcon } from '@heroicons/react/24/outline';

const ViewSubDepartmentModal = ({ 
  showViewModal, 
  setShowViewModal, 
  selectedSubDepartment 
}) => {
  if (!showViewModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 px-4 sm:px-5 py-3 sm:py-4">
          <EyeIcon className="h-6 w-6 text-white" />
          <h3 className="text-base sm:text-lg font-bold text-white">View Sub Department</h3>
        </div>
        {/* Modal Body */}
        <div className="p-3 sm:p-6 bg-gradient-to-br from-green-50 to-white">
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <ChartPieIcon className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedSubDepartment?.name}</h4>
              <p className="text-gray-600 text-sm mb-4">{selectedSubDepartment?.description}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <span className="font-medium text-gray-700">Manager:</span>
                <span className="text-gray-900">{selectedSubDepartment?.manager}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <span className="font-medium text-gray-700">Employees:</span>
                <span className="text-gray-900">{selectedSubDepartment?.employees}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  selectedSubDepartment?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedSubDepartment?.status}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <span className="font-medium text-gray-700">Location:</span>
                <span className="text-gray-900">{selectedSubDepartment?.location}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                <span className="font-medium text-gray-700">Budget:</span>
                <span className="text-gray-900">{selectedSubDepartment?.budget}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={() => setShowViewModal(false)}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSubDepartmentModal;
