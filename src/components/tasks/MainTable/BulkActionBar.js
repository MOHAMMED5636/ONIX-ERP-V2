import React from 'react';
import { 
  PencilIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

const BulkActionBar = ({ 
  selectedTasks, 
  onEdit, 
  onDelete, 
  onCopy, 
  onView, 
  onClearSelection 
}) => {
  if (selectedTasks.length < 2) return null;

  const handleEdit = () => {
    onEdit(selectedTasks);
  };

  const handleDelete = () => {
    const taskNames = selectedTasks.map(task => task.name).join(', ');
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} projects?\n\n${taskNames}`)) {
      onDelete(selectedTasks);
    }
  };

  const handleCopy = () => {
    const contentToCopy = selectedTasks.map(task => ({
      id: task.id,
      name: task.name,
      referenceNumber: task.referenceNumber,
      status: task.status,
      owner: task.owner,
      priority: task.priority,
      category: task.category,
      location: task.location,
      remarks: task.remarks,
      assigneeNotes: task.assigneeNotes
    }));
    onCopy(contentToCopy);
  };

  const handleView = () => {
    onView(selectedTasks);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-gray-700">
            {selectedTasks.length} projects selected
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              title="Edit selected projects"
            >
              <PencilIcon className="w-4 h-4" />
              Edit
            </button>
            
            <button
              onClick={handleView}
              className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              title="View selected projects"
            >
              <EyeIcon className="w-4 h-4" />
              View
            </button>
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
              title="Copy selected projects to clipboard"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              Copy
            </button>
            
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
              title="Delete selected projects"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
            
            <button
              onClick={onClearSelection}
              className="flex items-center gap-1 px-2 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
              title="Clear selection"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;
