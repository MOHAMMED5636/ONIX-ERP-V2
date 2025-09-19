import React, { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  ChevronDownIcon, 
  ChevronRightIcon,
  PlusIcon,
  PaperClipIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  FlagIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ArrowPathIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import useTaskDetails from '../hooks/useTaskDetails';
import { formatDate, formatDateTime, getRelativeTime } from '../utils/formatDate';
import SubtaskDetailModal from './SubtaskDetailModal';

// API function to update project name
const updateProjectNameAPI = async (projectId, newName) => {
  // Simulate API call - replace with actual API endpoint
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Updating project ${projectId} name to: ${newName}`);
      resolve({ success: true });
    }, 500);
  });
};

const TaskDetailsDrawer = ({ open, taskId, task, onClose, onTaskUpdate }) => {
  const [expandedSubtasks, setExpandedSubtasks] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [subtaskStatus, setSubtaskStatus] = useState('');
  const [drawerWidth, setDrawerWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [editingLabels, setEditingLabels] = useState(false);
  const [editingParent, setEditingParent] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [editingStartDate, setEditingStartDate] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingReporter, setEditingReporter] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState('');
  const [newSubtaskPriority, setNewSubtaskPriority] = useState('Medium');
  const [localSubtasks, setLocalSubtasks] = useState([]);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState(null);
  const [editingSubtaskAssignee, setEditingSubtaskAssignee] = useState(null);
  const [editingSubtaskPriority, setEditingSubtaskPriority] = useState(null);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  
  // Project name editing state
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState('');
  
  // Editable values
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [labels, setLabels] = useState('');
  const [parent, setParent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [priority, setPriority] = useState('');
  const [reporter, setReporter] = useState('');
  
  const drawerRef = useRef(null);
  const commentInputRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  const resizeRef = useRef(null);

  const { task: fetchedTask, loading, error, addComment } = useTaskDetails(
    task || taskId
  );

  const currentTask = task || fetchedTask;

  // Initialize editable values when task loads
  useEffect(() => {
    if (currentTask) {
      setDescription(currentTask.description || '');
      setAssignee(currentTask.assignee?.name || '');
      setLabels(currentTask.labels || '');
      setParent(currentTask.parent || '');
      setDueDate(currentTask.dueDate || '');
      setStartDate(currentTask.startDate || '');
      setPriority(currentTask.priority || '');
      setReporter(currentTask.reporter || '');
      // Initialize subtasks from the main table task data
      setLocalSubtasks(currentTask.subtasks || []);
      console.log('Initializing drawer with task:', currentTask);
      console.log('Task name/title:', currentTask.name || currentTask.title);
      console.log('Subtasks from main table:', currentTask.subtasks);
    }
  }, [currentTask]);

  // Real-time sync: Update drawer when task data changes in main table
  useEffect(() => {
    if (currentTask && open) {
      // Update all editable values to reflect current task state
      setDescription(currentTask.description || '');
      setAssignee(currentTask.assignee?.name || '');
      setLabels(currentTask.labels || '');
      setParent(currentTask.parent || '');
      setDueDate(currentTask.dueDate || '');
      setStartDate(currentTask.startDate || '');
      setPriority(currentTask.priority || '');
      setReporter(currentTask.reporter || '');
      
      // Update subtasks to reflect any changes from main table
      const newSubtasks = currentTask.subtasks || [];
      setLocalSubtasks(newSubtasks);
      
      console.log('Drawer synced with updated task data:', currentTask);
      console.log('Current subtasks in drawer:', newSubtasks);
      console.log('Previous local subtasks:', localSubtasks);
    }
  }, [currentTask, open]);

  // Additional sync for subtasks specifically
  useEffect(() => {
    if (currentTask && currentTask.subtasks && open) {
      const currentSubtasks = currentTask.subtasks;
      const localSubtasksLength = localSubtasks.length;
      
      // If the number of subtasks changed, update local state
      if (currentSubtasks.length !== localSubtasksLength) {
        console.log('Subtask count changed, updating drawer:', {
          current: currentSubtasks.length,
          local: localSubtasksLength,
          subtasks: currentSubtasks
        });
        setLocalSubtasks(currentSubtasks);
      }
    }
  }, [currentTask?.subtasks, open, localSubtasks.length]);

  // Function to sync changes back to main table
  const syncToMainTable = (updatedTaskData) => {
    if (onTaskUpdate && currentTask) {
      const updatedTask = {
        ...currentTask,
        ...updatedTaskData
      };
      onTaskUpdate(updatedTask);
      console.log('Syncing changes back to main table:', updatedTask);
    }
  };

  // Focus management
  useEffect(() => {
    if (open && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements?.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Resize functionality
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 400;
      const maxWidth = Math.min(1200, window.innerWidth * 0.9);
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setDrawerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle resize start
  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Reset drawer width to default
  const resetDrawerWidth = () => {
    setDrawerWidth(600);
  };

  // Handle opening subtask modal
  const handleOpenSubtaskModal = (subtask) => {
    setSelectedSubtask(subtask);
    setShowSubtaskModal(true);
  };

  // Handle closing subtask modal
  const handleCloseSubtaskModal = () => {
    setShowSubtaskModal(false);
    setSelectedSubtask(null);
  };

  // Handle updating subtask from modal
  const handleUpdateSubtask = (updatedSubtask) => {
    const updatedSubtasks = localSubtasks.map(subtask => 
      subtask.id === updatedSubtask.id ? updatedSubtask : subtask
    );
    setLocalSubtasks(updatedSubtasks);
    
    // Sync back to main table
    syncToMainTable({
      subtasks: updatedSubtasks
    });
    
    console.log('Subtask updated from modal:', updatedSubtask);
  };

  // Handle updating project name
  const handleUpdateProjectName = async (projectId, newName) => {
    try {
      // Update the main task name
      const updatedTask = {
        ...task,
        name: newName
      };
      
      // Call the backend API
      await updateProjectNameAPI(projectId, newName);
      
      // Update local state
      syncToMainTable(updatedTask);
      
      console.log('Project name updated successfully');
    } catch (error) {
      console.error('Failed to update project name:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  // Project name editing handlers for drawer
  const handleStartEditingProjectName = () => {
    console.log('Starting to edit project name:', currentTask?.name || currentTask?.title);
    setIsEditingProjectName(true);
    setTempProjectName(currentTask?.name || currentTask?.title || '');
  };

  const handleSaveProjectName = async () => {
    if (tempProjectName.trim() && currentTask) {
      try {
        const updatedTask = {
          ...currentTask,
          name: tempProjectName.trim()
        };
        
        // Call the backend API
        await updateProjectNameAPI(currentTask.id, tempProjectName.trim());
        
        // Update local state
        syncToMainTable(updatedTask);
        
        setIsEditingProjectName(false);
        console.log('Project name updated successfully');
      } catch (error) {
        console.error('Failed to update project name:', error);
        // Reset to original name on error
        setTempProjectName(currentTask?.name || currentTask?.title || '');
      }
    }
  };

  const handleCancelProjectNameEdit = () => {
    setTempProjectName(currentTask?.name || currentTask?.title || '');
    setIsEditingProjectName(false);
  };

  const handleProjectNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveProjectName();
    } else if (e.key === 'Escape') {
      handleCancelProjectNameEdit();
    }
  };

  // Handle adding new subtask
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    
    const newSubtask = {
      id: `t${Date.now()}`,
      title: newSubtaskTitle,
      assignee: newSubtaskAssignee || 'Unassigned',
      status: 'To Do',
      priority: newSubtaskPriority
    };
    
    // Add to local subtasks state
    const updatedSubtasks = [...localSubtasks, newSubtask];
    setLocalSubtasks(updatedSubtasks);
    
    // Sync back to main table
    syncToMainTable({
      subtasks: updatedSubtasks
    });
    
    console.log('Added subtask:', newSubtask);
    console.log('Updated subtasks:', updatedSubtasks);
    
    // Reset form
    setNewSubtaskTitle('');
    setNewSubtaskAssignee('');
    setNewSubtaskPriority('Medium');
    setShowAddSubtask(false);
  };

  // Handle canceling subtask addition
  const handleCancelSubtask = () => {
    setNewSubtaskTitle('');
    setNewSubtaskAssignee('');
    setNewSubtaskPriority('Medium');
    setShowAddSubtask(false);
  };

  // Handle editing subtask
  const handleEditSubtask = (subtaskId) => {
    console.log(`Editing subtask ${subtaskId}`);
    // In a real app, you would open an edit modal or inline editor
    alert(`Edit functionality for subtask ${subtaskId} would be implemented here`);
  };

  // Handle inline editing of subtask title
  const handleSubtaskTitleClick = (subtaskId) => {
    setEditingSubtaskTitle(subtaskId);
  };

  const handleSubtaskTitleSave = (subtaskId, newTitle) => {
    if (newTitle.trim()) {
      setLocalSubtasks(prevSubtasks => 
        prevSubtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, title: newTitle }
            : subtask
        )
      );
      
      // Also update the currentTask object
      if (currentTask && currentTask.subtasks) {
        currentTask.subtasks = currentTask.subtasks.map(subtask => 
          subtask.id === subtaskId 
            ? { ...subtask, title: newTitle }
            : subtask
        );
      }
    }
    setEditingSubtaskTitle(null);
  };

  // Handle inline editing of subtask assignee
  const handleSubtaskAssigneeClick = (subtaskId) => {
    setEditingSubtaskAssignee(subtaskId);
  };

  const handleSubtaskAssigneeSave = (subtaskId, newAssignee) => {
    setLocalSubtasks(prevSubtasks => 
      prevSubtasks.map(subtask => 
        subtask.id === subtaskId 
          ? { ...subtask, assignee: newAssignee || 'Unassigned' }
          : subtask
      )
    );
    
    // Also update the currentTask object
    if (currentTask && currentTask.subtasks) {
      currentTask.subtasks = currentTask.subtasks.map(subtask => 
        subtask.id === subtaskId 
          ? { ...subtask, assignee: newAssignee || 'Unassigned' }
          : subtask
      );
    }
    setEditingSubtaskAssignee(null);
  };

  // Handle inline editing of subtask priority
  const handleSubtaskPriorityClick = (subtaskId) => {
    setEditingSubtaskPriority(subtaskId);
  };

  const handleSubtaskPrioritySave = (subtaskId, newPriority) => {
    setLocalSubtasks(prevSubtasks => 
      prevSubtasks.map(subtask => 
        subtask.id === subtaskId 
          ? { ...subtask, priority: newPriority }
          : subtask
      )
    );
    
    // Also update the currentTask object
    if (currentTask && currentTask.subtasks) {
      currentTask.subtasks = currentTask.subtasks.map(subtask => 
        subtask.id === subtaskId 
          ? { ...subtask, priority: newPriority }
          : subtask
      );
    }
    setEditingSubtaskPriority(null);
  };

  // Handle comment submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentTask?.id) return;

    setIsAddingComment(true);
    try {
      await addComment(currentTask.id, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  // Handle subtask status change
  const handleSubtaskStatusChange = (subtaskId, newStatus) => {
    // Update local subtasks state
    const updatedSubtasks = localSubtasks.map(subtask => 
      subtask.id === subtaskId 
        ? { ...subtask, status: newStatus }
        : subtask
    );
    setLocalSubtasks(updatedSubtasks);
    
    // Sync back to main table
    syncToMainTable({
      subtasks: updatedSubtasks
    });
    
    console.log(`Updating subtask ${subtaskId} status to ${newStatus}`);
    setEditingSubtask(null);
    setSubtaskStatus('');
  };

  const getStatusColor = (status) => {
    const colors = {
      'To Do': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Done': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Blocked': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 transition-opacity duration-300" />
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className="absolute right-0 top-0 h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out"
        style={{ width: `${drawerWidth}px` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Resize Handle */}
        <div
          ref={resizeRef}
          className={`absolute left-0 top-0 h-full w-1 cursor-col-resize transition-colors duration-200 z-10 ${
            isResizing ? 'bg-indigo-500' : 'bg-gray-300 hover:bg-indigo-500'
          }`}
          onMouseDown={handleResizeStart}
          title="Drag to resize drawer"
        />
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-white/30 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/30 rounded w-1/2"></div>
              </div>
            ) : error ? (
              <div className="text-white">
                <h2 id="drawer-title" className="text-lg font-semibold">Error loading task</h2>
                <p className="text-sm text-white/80">{error}</p>
              </div>
            ) : currentTask ? (
              <>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {(currentTask.title || currentTask.name)?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {isEditingProjectName ? (
                        <input
                          type="text"
                          value={tempProjectName}
                          onChange={(e) => setTempProjectName(e.target.value)}
                          onBlur={handleSaveProjectName}
                          onKeyDown={handleProjectNameKeyDown}
                          className="text-2xl font-bold bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 w-full max-w-md"
                          placeholder="Project name"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <h2 
                            id="drawer-title" 
                            className="text-2xl font-bold text-white truncate drop-shadow-sm cursor-pointer hover:text-white/80 transition-colors"
                            onClick={handleStartEditingProjectName}
                          >
                            {currentTask.title || currentTask.name}
                          </h2>
                          <button
                            onClick={handleStartEditingProjectName}
                            className="text-white/70 hover:text-white transition-colors ml-2 px-3 py-1 rounded hover:bg-white/20 text-sm bg-white/10 border border-white/20 flex items-center gap-1"
                            title="Edit project name"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/80 font-medium">#{currentTask.id}</span>
                      <span className="text-xs text-white/60">•</span>
                      <span className="text-sm text-white/80">Last updated 2 hours ago</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white shadow-lg">
                    {currentTask.status}
                  </span>
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white shadow-lg">
                    {currentTask.priority} Priority
                  </span>
                  {currentTask.assignee && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
                      <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {currentTask.assignee.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm text-white font-semibold">{currentTask.assignee.name}</span>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetDrawerWidth}
              className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
              title="Reset drawer width"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
            <button
              ref={firstFocusableRef}
              onClick={onClose}
              className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm shadow-lg"
              aria-label="Close drawer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 max-h-[calc(100vh-80px)]">
          {loading ? (
            <div className="p-6 space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ) : currentTask ? (
            <div className="flex h-full">
              {/* Left Column - Main Content (70%) */}
              <div className="flex-1 min-w-0 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-200px)]">
                {/* Remarks */}
                <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                      Remarks
                    </h3>
                    <button
                      onClick={() => setEditingDescription(!editingDescription)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {editingDescription ? 'Save' : 'Edit'}
                    </button>
                  </div>
                  {editingDescription ? (
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      rows={4}
                      placeholder="Add remarks..."
                    />
                  ) : (
                    <div 
                      className="text-sm text-gray-600 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => setEditingDescription(true)}
                    >
                      {description || 'Add remarks...'}
                    </div>
                  )}
                </div>

                {/* Child Work Items */}
                <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                      Child Work Items
                    </h3>
                    <button 
                      onClick={() => setShowAddSubtask(!showAddSubtask)}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {showAddSubtask ? 'Cancel' : 'Add Subtask'}
                    </button>
                  </div>
                  
                  {/* Add Subtask Form */}
                  {showAddSubtask && (
                    <div className="mb-4 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 shadow-md">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                        Add New Subtask
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={newSubtaskTitle}
                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter subtask title"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Assignee</label>
                          <input
                            type="text"
                            value={newSubtaskAssignee}
                            onChange={(e) => setNewSubtaskAssignee(e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter assignee name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                          <select
                            value={newSubtaskPriority}
                            onChange={(e) => setNewSubtaskPriority(e.target.value)}
                            className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleAddSubtask}
                            disabled={!newSubtaskTitle.trim()}
                            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            Add Subtask
                          </button>
                          <button
                            onClick={handleCancelSubtask}
                            className="px-6 py-2 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded-lg hover:from-gray-400 hover:to-gray-500 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {localSubtasks && localSubtasks.length > 0 ? (
                    <div className="overflow-x-auto overflow-y-auto max-h-96 border border-orange-200 rounded-xl shadow-lg bg-white/50 backdrop-blur-sm">
                      <table className="w-full bg-white/80 backdrop-blur-sm">
                        <thead className="bg-gradient-to-r from-orange-100 to-red-100">
                          <tr>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">Work</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">Assignee</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">Status</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">Priority</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {localSubtasks.map((subtask, index) => (
                            <tr 
                              key={subtask.id} 
                              className="hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors duration-200"
                              onClick={() => handleOpenSubtaskModal(subtask)}
                            >
                              <td className="py-4 px-4 border-r border-gray-200">
                                <div className="flex items-center gap-3">
                                  <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                                      {index + 1}
                                    </div>
                                    {editingSubtaskTitle === subtask.id ? (
                                      <input
                                        type="text"
                                        defaultValue={subtask.title}
                                        onBlur={(e) => handleSubtaskTitleSave(subtask.id, e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleSubtaskTitleSave(subtask.id, e.target.value);
                                          } else if (e.key === 'Escape') {
                                            setEditingSubtaskTitle(null);
                                          }
                                        }}
                                        className="text-sm font-medium text-gray-900 bg-white border border-indigo-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        autoFocus
                                      />
                                    ) : (
                                      <span 
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors duration-200"
                                        onClick={() => handleSubtaskTitleClick(subtask.id)}
                                      >
                                        {subtask.title}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 border-r border-gray-200">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {subtask.assignee?.charAt(0) || 'U'}
                                  </div>
                                  {editingSubtaskAssignee === subtask.id ? (
                                    <input
                                      type="text"
                                      defaultValue={subtask.assignee || 'Unassigned'}
                                      onBlur={(e) => handleSubtaskAssigneeSave(subtask.id, e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleSubtaskAssigneeSave(subtask.id, e.target.value);
                                        } else if (e.key === 'Escape') {
                                          setEditingSubtaskAssignee(null);
                                        }
                                      }}
                                      className="text-sm text-gray-900 bg-white border border-indigo-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                      autoFocus
                                    />
                                  ) : (
                                    <span 
                                      className="text-sm text-gray-900 hover:text-blue-600 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors duration-200"
                                      onClick={() => handleSubtaskAssigneeClick(subtask.id)}
                                    >
                                      {subtask.assignee || 'Unassigned'}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-4 border-r border-gray-200">
                                <select 
                                  value={subtask.status}
                                  onChange={(e) => handleSubtaskStatusChange(subtask.id, e.target.value)}
                                  className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
                                >
                                  <option value="To Do">To Do</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Done">Done</option>
                                </select>
                              </td>
                              <td className="py-4 px-4 border-r border-gray-200">
                                {editingSubtaskPriority === subtask.id ? (
                                  <select
                                    defaultValue={subtask.priority || 'Medium'}
                                    onBlur={(e) => handleSubtaskPrioritySave(subtask.id, e.target.value)}
                                    onChange={(e) => handleSubtaskPrioritySave(subtask.id, e.target.value)}
                                    className="text-xs font-medium border border-indigo-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    autoFocus
                                  >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                  </select>
                                ) : (
                                  <span 
                                    className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity duration-200 ${getPriorityColor(subtask.priority || 'Medium')}`}
                                    onClick={() => handleSubtaskPriorityClick(subtask.id)}
                                  >
                                    {subtask.priority || 'Medium'}
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <button 
                                  onClick={() => handleEditSubtask(subtask.id)}
                                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 rounded hover:bg-indigo-50"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No subtasks yet</p>
                      <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-700">
                        Add first subtask
                      </button>
                    </div>
                  )}
                </div>

                {/* Activity */}
                <div className="bg-white shadow-sm rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900">Activity</h3>
                    <div className="flex space-x-1">
                      <button className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md">All</button>
                      <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">Comments</button>
                      <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md">History</button>
                    </div>
                  </div>
                  
                  {/* Comments List */}
                  <div className="space-y-4 mb-4">
                    {currentTask.comments && currentTask.comments.length > 0 ? (
                      currentTask.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 pb-4 border-b border-gray-200 last:border-b-0">
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {comment.author?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                              <span className="text-xs text-gray-500">{getRelativeTime(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-600">{comment.text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No comments yet</p>
                      </div>
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        U
                      </div>
                      <div className="flex-1">
                        <textarea
                          ref={commentInputRef}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || isAddingComment}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isAddingComment ? 'Adding...' : 'Add comment'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column - Project Details (30%) */}
              <div className="w-72 flex-shrink-0 border-l border-white/30 bg-gradient-to-b from-white/90 to-blue-50/90 backdrop-blur-sm overflow-y-auto max-h-[calc(100vh-200px)]">
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                    Project Details
                  </h3>
                  
                  {/* Project Name */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Project Name</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.name || currentTask.title || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Reference Number */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Reference Number</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.referenceNumber || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Owner */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Owner</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.owner || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Status</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        currentTask.status === 'done' ? 'bg-green-100 text-green-800' :
                        currentTask.status === 'working' ? 'bg-yellow-100 text-yellow-800' :
                        currentTask.status === 'stuck' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {currentTask.status || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Timeline</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {currentTask.timeline && currentTask.timeline[0] && currentTask.timeline[1] 
                          ? `${new Date(currentTask.timeline[0]).toLocaleDateString()} - ${new Date(currentTask.timeline[1]).toLocaleDateString()}`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Plan Days */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Plan Days</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.planDays || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Priority</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        currentTask.priority === 'High' ? 'bg-red-100 text-red-800' :
                        currentTask.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        currentTask.priority === 'Low' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {currentTask.priority || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Category</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.category || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Location</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.location || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Project Type */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Project Type</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.projectType || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Remarks</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900 text-sm">{currentTask.remarks || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Assignee Notes */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Assignee Notes</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900 text-sm">{currentTask.assigneeNotes || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Plot Number */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Plot Number</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.plotNumber || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Community */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Community</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.community || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Project Floor */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Project Floor</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.projectFloor || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Developer Project */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Developer Project</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.developerProject || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Auto Number */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Auto #</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.autoNumber || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Predecessors */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Predecessors</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.predecessors || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Checklist</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.checklist || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Link */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Link</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      {currentTask.link ? (
                        <a 
                          href={currentTask.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 underline"
                        >
                          {currentTask.link}
                        </a>
                      ) : (
                        <span className="font-medium text-gray-900">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Rating</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{currentTask.rating || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Progress</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${currentTask.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{currentTask.progress || 0}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Color</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">
                        {currentTask.color ? (
                          <>
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: currentTask.color }}
                            ></div>
                            <span className="font-medium text-gray-900">{currentTask.color}</span>
                          </>
                        ) : (
                          <span className="font-medium text-gray-900">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attachments */}
                  {currentTask.attachments && currentTask.attachments.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-600 block mb-2">Attachments</label>
                      <div className="space-y-2">
                        {currentTask.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 p-2 bg-gray-50 rounded-md hover:bg-gray-100"
                          >
                            <PaperClipIcon className="w-4 h-4" />
                            {attachment.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Subtask Detail Modal */}
      <SubtaskDetailModal
        isOpen={showSubtaskModal}
        subtask={selectedSubtask}
        onClose={handleCloseSubtaskModal}
        onUpdate={handleUpdateSubtask}
        onUpdateProjectName={handleUpdateProjectName}
      />
    </div>
  );
};

export default TaskDetailsDrawer;
