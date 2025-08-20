import React from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

const DeleteConfirmationModal = ({
  showDeleteModal,
  setShowDeleteModal,
  deletingStage,
  setDeletingStage,
  handleConfirmDelete
}) => {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              Delete Stage
            </h3>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingStage(null);
              }}
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
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete "{deletingStage?.name}"? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingStage(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
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



