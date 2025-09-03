import React, { useState, useEffect } from 'react';
import { 
  ClipboardDocumentIcon, 
  ClipboardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  copyTasks,
  pasteTasks,
  validateTaskSelection,
  saveClipboardData,
  getClipboardData,
  clearClipboardData,
  hasClipboardData
} from './taskCopyPaste';

const TaskCopyPasteManager = ({ 
  selectedTasks, 
  selectedSubtasks = [],
  allTasks, 
  onTasksPasted,
  onCopySuccess,
  onPasteSuccess 
}) => {
  const [clipboardData, setClipboardData] = useState(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState('');
  const [copyStatus, setCopyStatus] = useState(null);
  const [pasteStatus, setPasteStatus] = useState(null);

  // Load clipboard data on component mount
  useEffect(() => {
    const savedClipboardData = getClipboardData();
    if (savedClipboardData) {
      setClipboardData(savedClipboardData);
    }
  }, []);

  // Handle copy operation
  const handleCopy = () => {
    try {
      // If subtasks are selected, show error (only parent tasks can be copied)
      if (selectedSubtasks.length > 0 && selectedTasks.length === 0) {
        setCopyStatus({
          type: 'error',
          message: 'Cannot copy subtasks independently. Select parent tasks to copy with their subtasks.'
        });
        return;
      }

      // Validate selection
      const validation = validateTaskSelection(selectedTasks, allTasks);
      
      if (!validation.isValid) {
        setCopyStatus({
          type: 'error',
          message: validation.message
        });
        return;
      }

      // Copy tasks
      const copiedData = copyTasks(selectedTasks);
      
      // Save to clipboard
      saveClipboardData(copiedData);
      setClipboardData(copiedData);
      
      // Show success status
      setCopyStatus({
        type: 'success',
        message: `Successfully copied ${copiedData.totalTasks} parent task(s) with ${copiedData.totalSubtasks} subtask(s) and ${copiedData.totalChildSubtasks} child subtask(s)`
      });

      // Clear status after 3 seconds
      setTimeout(() => setCopyStatus(null), 3000);

      // Call success callback
      if (onCopySuccess) {
        onCopySuccess(copiedData);
      }

    } catch (error) {
      setCopyStatus({
        type: 'error',
        message: `Copy failed: ${error.message}`
      });
      
      // Clear status after 5 seconds
      setTimeout(() => setCopyStatus(null), 5000);
    }
  };

  // Handle paste operation
  const handlePaste = async () => {
    if (!targetProjectId) {
      setPasteStatus({
        type: 'error',
        message: 'Please select a target project'
      });
      return;
    }

    try {
      // Paste tasks
      const pasteResult = pasteTasks(clipboardData, targetProjectId, allTasks);
      
      // Call the callback to add pasted tasks
      if (onTasksPasted) {
        onTasksPasted(pasteResult.pastedTasks);
      }

      // Show success status
      setPasteStatus({
        type: 'success',
        message: `Successfully pasted ${pasteResult.totalPasted} task(s) with ${pasteResult.totalSubtasks} subtask(s) and ${pasteResult.totalChildSubtasks} child subtask(s)`
      });

      // Clear clipboard and close modal
      clearClipboardData();
      setClipboardData(null);
      setShowPasteModal(false);
      setTargetProjectId('');

      // Clear status after 3 seconds
      setTimeout(() => setPasteStatus(null), 3000);

      // Call success callback
      if (onPasteSuccess) {
        onPasteSuccess(pasteResult);
      }

    } catch (error) {
      setPasteStatus({
        type: 'error',
        message: `Paste failed: ${error.message}`
      });
      
      // Clear error status after 5 seconds
      setTimeout(() => setPasteStatus(null), 5000);
    }
  };

  // Get available projects for pasting
  const getAvailableProjects = () => {
    return allTasks.filter(task => !task.parentTaskId && !task.taskId);
  };

  // Check if copy is available (only parent tasks can be copied)
  const canCopy = selectedTasks && selectedTasks.length > 0 && selectedSubtasks.length === 0;
  
  // Check if paste is available
  const canPaste = clipboardData && clipboardData.copiedTasks && clipboardData.copiedTasks.length > 0;

  return (
    <>
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        disabled={!canCopy}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
          canCopy
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={canCopy ? 'Copy selected tasks' : 'Select parent tasks to copy'}
      >
        <ClipboardDocumentIcon className="w-4 h-4" />
        Copy
      </button>

      {/* Paste Button */}
      <button
        onClick={() => setShowPasteModal(true)}
        disabled={!canPaste}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
          canPaste
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={canPaste ? 'Paste copied tasks' : 'No tasks copied to clipboard'}
      >
        <ClipboardIcon className="w-4 h-4" />
        Paste
      </button>

      {/* Status Messages */}
      {copyStatus && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-lg ${
          copyStatus.type === 'success' 
            ? 'bg-green-500 text-white border-green-600' 
            : 'bg-red-500 text-white border-red-600'
        }`}>
          <div className="flex items-center gap-2">
            {copyStatus.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{copyStatus.message}</span>
            <button
              onClick={() => setCopyStatus(null)}
              className="ml-2 text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Paste Tasks</h3>
            
            {/* Clipboard Info */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Clipboard contains:</strong><br />
                {clipboardData?.totalTasks} parent task(s)<br />
                {clipboardData?.totalSubtasks} subtask(s)<br />
                {clipboardData?.totalChildSubtasks} child subtask(s)
              </p>
            </div>

            {/* Target Project Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Target Project
              </label>
              <select
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a project...</option>
                {getAvailableProjects().map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePaste}
                disabled={!targetProjectId}
                className={`px-4 py-2 rounded-md transition-colors ${
                  targetProjectId
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Paste Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paste Status Messages */}
      {pasteStatus && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-lg ${
          pasteStatus.type === 'success' 
            ? 'bg-green-500 text-white border-green-600' 
            : 'bg-red-500 text-white border-red-600'
        }`}>
          <div className="flex items-center gap-2">
            {pasteStatus.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{pasteStatus.message}</span>
            <button
              onClick={() => setPasteStatus(null)}
              className="ml-2 text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCopyPasteManager;
