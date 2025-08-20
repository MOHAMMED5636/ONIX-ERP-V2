import React from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";

const DeleteConfirmationModal = ({
  showDeleteModal,
  setShowDeleteModal,
  selectedSurveyForDelete,
  onDeleteSurvey
}) => {
  if (!showDeleteModal || !selectedSurveyForDelete) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Delete Survey</h2>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{selectedSurveyForDelete.title}"? This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDeleteSurvey}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;



