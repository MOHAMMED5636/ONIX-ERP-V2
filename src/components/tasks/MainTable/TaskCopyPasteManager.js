import React, { useState, useEffect } from 'react';
import { 
  ClipboardDocumentIcon, 
  ClipboardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  DocumentDuplicateIcon
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
  filteredTasks = [], // Add filteredTasks as a prop
  onTasksPasted,
  onCopySuccess,
  onPasteSuccess 
}) => {
  const [clipboardData, setClipboardData] = useState(null);
  const [copyStatus, setCopyStatus] = useState(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState('');

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
      // Check if we have any selection
      if (selectedTasks.length === 0 && selectedSubtasks.length === 0) {
        setCopyStatus({
          type: 'error',
          message: 'Please select tasks or subtasks to copy.'
        });
        return;
      }

      let copiedData;
      let successMessage;

      if (selectedTasks.length > 0) {
        // Copy parent tasks with their subtasks
        const validation = validateTaskSelection(selectedTasks, allTasks);
        
        if (!validation.isValid) {
          setCopyStatus({
            type: 'error',
            message: validation.message
          });
          return;
        }

        copiedData = copyTasks(selectedTasks);
        successMessage = `Successfully copied ${copiedData.totalTasks} parent task(s) with ${copiedData.totalSubtasks} subtask(s) and ${copiedData.totalChildSubtasks} child subtask(s)`;
      } else if (selectedSubtasks.length > 0) {
        // Copy selected subtasks and child tasks
        copiedData = {
          copiedTasks: selectedSubtasks,
          totalTasks: selectedSubtasks.length,
          totalSubtasks: selectedSubtasks.filter(task => task.type === 'subtask').length,
          totalChildSubtasks: selectedSubtasks.filter(task => task.type === 'childSubtask').length,
          copyType: 'subtasks'
        };
        successMessage = `Successfully copied ${copiedData.totalTasks} task(s) (${copiedData.totalSubtasks} subtasks, ${copiedData.totalChildSubtasks} child tasks)`;
      }
      
      // Save to clipboard
      saveClipboardData(copiedData);
      setClipboardData(copiedData);
      
      // Show success status
      setCopyStatus({
        type: 'success',
        message: successMessage
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
    // Show project selection modal
    setShowPasteModal(true);
    setTargetProjectId('');
  };

  const handleConfirmPaste = () => {
    if (!targetProjectId) {
      alert('Please select a target project to paste the tasks.');
      return;
    }

    try {
      // Find the target project
      console.log('Looking for target project with ID:', targetProjectId);
      console.log('Available tasks:', allTasks.map(t => ({ id: t.id, name: t.name })));
      
      let targetProject = allTasks.find(task => task.id === targetProjectId);
      
      // If not found in allTasks, try to find in filteredTasks or available projects list
      if (!targetProject) {
        targetProject = filteredTasks.find(task => task.id === targetProjectId);
      }
      
      if (!targetProject) {
        const availableProjects = getAvailableProjects();
        targetProject = availableProjects.find(project => project.id === targetProjectId);
      }
      
      if (!targetProject) {
        console.error('Target project not found. Available projects:', allTasks);
        console.error('Selected targetProjectId:', targetProjectId);
        alert(`Target project not found. Please try selecting a different project.`);
        return;
      }
      
      console.log('Found target project:', targetProject);

      let duplicatedTasks;
      let successMessage;

      if (clipboardData.copyType === 'subtasks') {
        // Paste subtasks and child tasks into the target project
        duplicatedTasks = clipboardData.copiedTasks.map(task => ({
          ...task,
          id: Date.now() + Math.random(), // Generate new ID
          name: `${task.name} (Copy)`, // Add (Copy) to name
          referenceNumber: `${task.referenceNumber}-COPY`, // Add -COPY to reference
          parentTaskId: targetProjectId, // Set target project as parent
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        successMessage = `Successfully pasted ${duplicatedTasks.length} task(s) into "${targetProject.name}"!`;
      } else {
        // Paste parent tasks as new projects
        duplicatedTasks = clipboardData.copiedTasks.map(task => ({
          ...task,
          id: Date.now() + Math.random(), // Generate new ID
          name: `${task.name} (Copy)`, // Add (Copy) to name
          referenceNumber: `${task.referenceNumber}-COPY`, // Add -COPY to reference
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        successMessage = `Successfully duplicated ${duplicatedTasks.length} project(s)!`;
      }
      
      // Call the callback to add duplicated tasks
      if (onTasksPasted) {
        onTasksPasted(duplicatedTasks);
      }
      
      // Clear clipboard after successful paste
      clearClipboardData();
      setClipboardData(null);
      
      // Close modal
      setShowPasteModal(false);
      setTargetProjectId('');
      
      // Show success message
      alert(successMessage);
      
      // Call success callback
      if (onPasteSuccess) {
        onPasteSuccess({ pastedTasks: duplicatedTasks });
      }
      
    } catch (error) {
      alert(`Error pasting tasks: ${error.message}`);
    }
  };

  const handleCancelPaste = () => {
    setShowPasteModal(false);
    setTargetProjectId('');
  };

  // Get available projects for pasting
  const getAvailableProjects = () => {
    const availableProjects = allTasks.filter(task => !task.parentTaskId && !task.taskId);
    console.log('Available projects for pasting:', availableProjects.map(p => ({ id: p.id, name: p.name, referenceNumber: p.referenceNumber })));
    return availableProjects;
  };


  // Check if copy is available (main tasks or subtasks can be copied)
  const canCopy = (selectedTasks && selectedTasks.length > 0) || (selectedSubtasks && selectedSubtasks.length > 0);
  
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
        title={canCopy ? 'Copy selected tasks' : 'Select tasks to copy'}
      >
        <ClipboardDocumentIcon className="w-4 h-4" />
        Copy
      </button>

      {/* Paste Button */}
      <button
        onClick={handlePaste}
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

      {/* Project Selection Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ClipboardIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {clipboardData?.copyType === 'subtasks' ? 'Paste Tasks' : 'Paste Projects'}
              </h3>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                {clipboardData?.copyType === 'subtasks' 
                  ? `You are about to paste ${clipboardData?.totalTasks || 0} task(s) (${clipboardData?.totalSubtasks || 0} subtasks, ${clipboardData?.totalChildSubtasks || 0} child tasks).`
                  : `You are about to paste ${clipboardData?.totalTasks || 0} project(s).`
                }
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {clipboardData?.copyType === 'subtasks' 
                  ? 'Select the target project where you want to paste these tasks:'
                  : 'Projects will be duplicated as new independent projects.'
                }
              </p>
              
              {clipboardData?.copyType === 'subtasks' && (
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Choose a target project...</option>
                  {getAvailableProjects().map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.referenceNumber})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelPaste}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPaste}
                disabled={clipboardData?.copyType === 'subtasks' && !targetProjectId}
                className={`px-4 py-2 rounded-md transition-colors ${
                  (clipboardData?.copyType === 'subtasks' ? targetProjectId : true)
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {clipboardData?.copyType === 'subtasks' ? 'Paste Tasks' : 'Duplicate Projects'}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default TaskCopyPasteManager;
