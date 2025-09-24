import React, { useState } from 'react';
import { XMarkIcon, ClipboardDocumentIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const BulkPasteModal = ({ 
  isOpen, 
  onClose, 
  bulkCopiedItems, 
  tasks, 
  onExecutePaste, 
  onSetPasteTarget 
}) => {
  const [selectedTarget, setSelectedTarget] = useState(null);

  if (!isOpen) return null;

  const totalItems = bulkCopiedItems.tasks.length + bulkCopiedItems.subtasks.length + bulkCopiedItems.childTasks.length;

  const handlePaste = () => {
    if (selectedTarget) {
      onExecutePaste(selectedTarget);
    }
  };

  const handleTargetChange = (e) => {
    const targetId = e.target.value;
    const target = tasks.find(task => task.id === parseInt(targetId));
    setSelectedTarget(target);
    onSetPasteTarget(target);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <ClipboardDocumentIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Paste Tasks</h2>
                  <p className="text-white/80 text-sm">Select target for pasting</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Clipboard Contents */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <DocumentDuplicateIcon className="w-5 h-5 text-blue-500" />
                Clipboard contains:
              </h3>
              <div className="space-y-2">
                {bulkCopiedItems.tasks.length > 0 && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">{bulkCopiedItems.tasks.length} parent task(s)</span>
                  </div>
                )}
                {bulkCopiedItems.subtasks.length > 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">{bulkCopiedItems.subtasks.length} subtask(s)</span>
                  </div>
                )}
                {bulkCopiedItems.childTasks.length > 0 && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">{bulkCopiedItems.childTasks.length} child subtask(s)</span>
                  </div>
                )}
                {totalItems === 0 && (
                  <div className="text-gray-500 italic">No items in clipboard</div>
                )}
              </div>
            </div>

            {/* Target Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Target Project
              </label>
              <select
                value={selectedTarget?.id || ''}
                onChange={handleTargetChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Choose a project...</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.name} ({task.referenceNumber})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {bulkCopiedItems.subtasks.length > 0 || bulkCopiedItems.childTasks.length > 0 
                  ? "Subtasks and child tasks will be pasted into the selected project"
                  : "Tasks will be created as new projects"
                }
              </p>
            </div>

            {/* Preview */}
            {selectedTarget && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Paste Preview:</h4>
                <div className="text-sm text-blue-700">
                  {bulkCopiedItems.tasks.length > 0 && (
                    <div>• {bulkCopiedItems.tasks.length} new project(s) will be created</div>
                  )}
                  {bulkCopiedItems.subtasks.length > 0 && (
                    <div>• {bulkCopiedItems.subtasks.length} subtask(s) will be added to "{selectedTarget.name}"</div>
                  )}
                  {bulkCopiedItems.childTasks.length > 0 && (
                    <div>• {bulkCopiedItems.childTasks.length} child task(s) will be added to their parent subtasks</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handlePaste}
              disabled={!selectedTarget && bulkCopiedItems.tasks.length === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedTarget || bulkCopiedItems.tasks.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Paste Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkPasteModal;


