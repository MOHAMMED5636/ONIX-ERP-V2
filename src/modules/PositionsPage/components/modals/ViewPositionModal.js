import React from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';

const ViewPositionModal = ({ 
  showViewModal, 
  setShowViewModal, 
  selectedPosition 
}) => {
  if (!showViewModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 px-4 sm:px-5 py-3 sm:py-4">
          <EyeIcon className="h-6 w-6 text-white" />
          <h3 className="text-base sm:text-lg font-bold text-white">View Position</h3>
        </div>
        {/* Modal Body */}
        <div className="p-3 sm:p-6 bg-gradient-to-br from-green-50 to-white">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
              <span className="font-medium text-gray-700">Position Name:</span>
              <span className="text-gray-900">{selectedPosition?.name}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
              <span className="font-medium text-gray-700">Description:</span>
              <span className="text-gray-900">{selectedPosition?.description}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
              <span className="font-medium text-gray-700">Manager:</span>
              <span className="text-gray-900">{selectedPosition?.manager}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
              <span className="font-medium text-gray-700">Employees:</span>
              <span className="text-gray-900">{selectedPosition?.employees}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
              <span className="font-medium text-gray-700">Requirements:</span>
              <span className="text-gray-900">{selectedPosition?.requirements}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
              <span className="font-medium text-gray-700">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                selectedPosition?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {selectedPosition?.status}
              </span>
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

export default ViewPositionModal;
