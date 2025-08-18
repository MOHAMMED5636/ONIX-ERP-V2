import React from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

const DeleteConfirmationModal = ({
  showModal,
  setShowModal,
  selectedRule,
  onConfirm
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Delete Rule</h3>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <TrashIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Rule
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete the rule "{selectedRule?.description}"? This action cannot be undone.
            </p>
            
            {selectedRule && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Rule Details:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Role:</span> {selectedRule.role}</p>
                  <p><span className="font-medium">Action:</span> {selectedRule.action}</p>
                  <p><span className="font-medium">Field:</span> {selectedRule.field}</p>
                  <p><span className="font-medium">Status:</span> {selectedRule.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;


