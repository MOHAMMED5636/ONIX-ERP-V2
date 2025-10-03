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
  
  // Determine if we're copying tasks/subtasks (need target) or projects (duplicate)
  const hasProjects = bulkCopiedItems.tasks.length > 0;
  const hasTasksOrSubtasks = bulkCopiedItems.subtasks.length > 0 || bulkCopiedItems.childTasks.length > 0;
  const needsTargetProject = hasTasksOrSubtasks && !hasProjects;

  const handlePaste = () => {
    if (needsTargetProject && !selectedTarget) {
      alert('Please select a target project to paste the tasks');
      return;
    }
    
    if (hasProjects) {
      // For project duplication, we don't need a target - just duplicate the projects
      onExecutePaste(null);
    } else {
      // For tasks/subtasks, use the selected target
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
                  <h2 className="text-xl font-bold">
                    {hasProjects ? 'Paste Projects' : 'Paste Tasks'}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {hasProjects 
                      ? 'Duplicate projects as new independent projects'
                      : 'Paste tasks/subtasks to selected target project'
                    }
                  </p>
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
                    <span className="font-medium">{bulkCopiedItems.tasks.length} project(s)</span>
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

            {/* Target Project Selection (for tasks/subtasks) */}
            {needsTargetProject && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-800 mb-3">Select Target Project:</h4>
                <select
                  value={selectedTarget?.id || ''}
                  onChange={handleTargetChange}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Choose a target project...</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.name} ({task.referenceNumber})
                    </option>
                  ))}
                </select>
                {selectedTarget && (
                  <p className="text-green-600 text-sm mt-2">
                    ✓ Will paste to: <strong>{selectedTarget.name}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Duplication/Transfer Info */}
            <div className={`rounded-lg p-4 ${hasProjects ? 'bg-blue-50' : 'bg-green-50'}`}>
              <h4 className={`text-sm font-semibold mb-2 ${hasProjects ? 'text-blue-800' : 'text-green-800'}`}>
                {hasProjects ? 'Duplication Preview:' : 'Transfer Preview:'}
              </h4>
              <div className={`text-sm ${hasProjects ? 'text-blue-700' : 'text-green-700'}`}>
                {bulkCopiedItems.tasks.length > 0 && (
                  <div>• {bulkCopiedItems.tasks.length} new project(s) will be created as duplicates</div>
                )}
                {bulkCopiedItems.subtasks.length > 0 && (
                  <div>• {bulkCopiedItems.subtasks.length} subtask(s) will be {hasProjects ? 'duplicated' : 'transferred'}</div>
                )}
                {bulkCopiedItems.childTasks.length > 0 && (
                  <div>• {bulkCopiedItems.childTasks.length} child task(s) will be {hasProjects ? 'duplicated' : 'transferred'}</div>
                )}
                <div className={`mt-2 font-medium ${hasProjects ? 'text-blue-600' : 'text-green-600'}`}>
                  {hasProjects 
                    ? 'Projects will be duplicated as new independent projects below the original ones.'
                    : selectedTarget 
                      ? `Tasks/subtasks will be added to "${selectedTarget.name}" project.`
                      : 'Please select a target project first.'
                  }
                </div>
              </div>
            </div>

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
              disabled={
                (bulkCopiedItems.tasks.length === 0 && bulkCopiedItems.subtasks.length === 0 && bulkCopiedItems.childTasks.length === 0) ||
                (needsTargetProject && !selectedTarget)
              }
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                (bulkCopiedItems.tasks.length > 0 || bulkCopiedItems.subtasks.length > 0 || bulkCopiedItems.childTasks.length > 0) &&
                (!needsTargetProject || selectedTarget)
                  ? hasProjects 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {hasProjects ? 'Duplicate Projects' : 'Paste Tasks'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkPasteModal;





