import React from 'react';
import { 
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  DocumentDuplicateIcon,
  ArrowUturnLeftIcon
} from "@heroicons/react/24/outline";
// import TaskCopyPasteManager from './TaskCopyPasteManager'; // Removed - using BulkPasteModal instead

const BulkActionBar = ({ 
  selectedTasks, 
  selectedSubtasks = [], 
  totalSelected = 0,
  selectionAnalysis,
  onEdit,
  onDelete,
  onView,
  onClearSelection,
  onShowToast,
  allTasks,
  filteredTasks = [],
  onTasksPasted,
  onCopy,
  onPaste,
  bulkCopiedItems,
  showBulkPasteModal,
  onUndo,
  hasDeletedItems = false
}) => {
  if (totalSelected < 1) return null;

  const handleEdit = () => {
    if (selectionAnalysis.canEdit) {
      onEdit(selectedTasks, selectedSubtasks);
    } else {
      // Show toast for invalid selection
      onShowToast(selectionAnalysis.reason, 'error');
    }
  };

  const handleDelete = () => {
    const taskNames = selectedTasks.map(task => task.name).join(', ');
    const subtaskNames = selectedSubtasks.map(subtask => subtask.name).join(', ');
    
    let message = `Are you sure you want to delete ${totalSelected} item(s)?\n\n`;
    if (selectedTasks.length > 0) {
      message += `Tasks: ${taskNames}\n`;
    }
    if (selectedSubtasks.length > 0) {
      message += `Subtasks: ${subtaskNames}\n`;
    }
    
    if (window.confirm(message)) {
      onDelete(selectedTasks, selectedSubtasks);
    }
  };

  const handleView = () => {
    onView(selectedTasks, selectedSubtasks);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-gray-700">
            {totalSelected} item(s) selected
            {!selectionAnalysis.canEdit && (
              <div className="text-xs text-red-500 mt-1">
                {selectionAnalysis.reason}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              disabled={!selectionAnalysis.canEdit}
              className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors text-sm ${
                selectionAnalysis.canEdit
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={selectionAnalysis.canEdit ? "Edit selected items" : selectionAnalysis.reason}
            >
              <PencilIcon className="w-4 h-4" />
              Edit
            </button>
            
            <button
              onClick={handleView}
              className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              title="View selected items"
            >
              <EyeIcon className="w-4 h-4" />
              View
            </button>

            {/* Copy Button */}
            <button
              onClick={onCopy}
              className="flex items-center gap-1 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
              title="Copy selected items"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              Copy
            </button>

            {/* Paste Button */}
            <button
              onClick={onPaste}
              disabled={!bulkCopiedItems || (bulkCopiedItems.tasks.length === 0 && bulkCopiedItems.subtasks.length === 0 && bulkCopiedItems.childTasks.length === 0)}
              className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors text-sm ${
                bulkCopiedItems && (bulkCopiedItems.tasks.length > 0 || bulkCopiedItems.subtasks.length > 0 || bulkCopiedItems.childTasks.length > 0)
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={bulkCopiedItems && (bulkCopiedItems.tasks.length > 0 || bulkCopiedItems.subtasks.length > 0 || bulkCopiedItems.childTasks.length > 0) ? "Paste copied items" : "No items to paste"}
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
              Paste
            </button>
            
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
              title="Delete selected items"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>

            {/* Undo Button */}
            <button
              onClick={onUndo}
              disabled={!hasDeletedItems}
              className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors text-sm ${
                hasDeletedItems
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={hasDeletedItems ? "Undo last deletion" : "No recent deletions to undo"}
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
              Undo
            </button>
            
            <button
              onClick={onClearSelection}
              className="flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
              title="Clear selection"
            >
              <XMarkIcon className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;


