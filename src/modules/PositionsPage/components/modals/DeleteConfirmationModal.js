import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

const DeleteConfirmationModal = ({ 
  showDeleteModal, 
  setShowDeleteModal, 
  selectedPosition, 
  confirmDeletePosition 
}) => {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 px-4 sm:px-5 py-3 sm:py-4">
          <TrashIcon className="h-6 w-6 text-white" />
          <h3 className="text-base sm:text-lg font-bold text-white">Delete Position</h3>
        </div>
        {/* Modal Body */}
        <div className="p-3 sm:p-6 bg-gradient-to-br from-red-50 to-white">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <TrashIcon className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h4>
              <p className="text-gray-600 text-sm">
                You are about to delete the position <strong>"{selectedPosition?.name}"</strong>. 
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
            <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 w-full sm:w-auto" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-0 w-full sm:w-auto" onClick={confirmDeletePosition}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
