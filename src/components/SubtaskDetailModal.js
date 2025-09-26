import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  CalendarIcon,
  FlagIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import EngineerInviteModal from './tasks/MainTable/EngineerInviteModal';

const SubtaskDetailModal = ({ 
  isOpen, 
  subtask, 
  onClose, 
  onUpdate,
  onUpdateProjectName 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAssignee, setEditedAssignee] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const [editedPriority, setEditedPriority] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  
  
  // Project name editing state
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState('');
  
  // Engineer invite modal state
  const [engineerInviteModalOpen, setEngineerInviteModalOpen] = useState(false);

  // Initialize form data when subtask changes
  useEffect(() => {
    if (subtask) {
      setEditedTitle(subtask.title || '');
      setEditedAssignee(subtask.assignee || '');
      setEditedStatus(subtask.status || 'To Do');
      setEditedPriority(subtask.priority || 'Medium');
      setEditedDescription(subtask.description || '');
      setTempProjectName(subtask.projectName || subtask.name || '');
    }
  }, [subtask]);

  const handleSave = () => {
    if (onUpdate) {
      const updatedSubtask = {
        ...subtask,
        title: editedTitle,
        assignee: editedAssignee,
        status: editedStatus,
        priority: editedPriority,
        description: editedDescription
      };
      onUpdate(updatedSubtask);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(subtask.title || '');
    setEditedAssignee(subtask.assignee || '');
    setEditedStatus(subtask.status || 'To Do');
    setEditedPriority(subtask.priority || 'Medium');
    setEditedDescription(subtask.description || '');
    setIsEditing(false);
  };

  // Project name editing handlers
  const handleStartEditingProjectName = () => {
    setIsEditingProjectName(true);
    setTempProjectName(subtask.projectName || subtask.name || '');
  };

  const handleSaveProjectName = async () => {
    if (tempProjectName.trim() && onUpdateProjectName) {
      try {
        // Call the parent function to update project name
        await onUpdateProjectName(subtask.id, tempProjectName.trim());
        setIsEditingProjectName(false);
      } catch (error) {
        console.error('Failed to update project name:', error);
        // Reset to original name on error
        setTempProjectName(subtask.projectName || subtask.name || '');
      }
    }
  };

  const handleCancelProjectNameEdit = () => {
    setTempProjectName(subtask.projectName || subtask.name || '');
    setIsEditingProjectName(false);
  };

  const handleProjectNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveProjectName();
    } else if (e.key === 'Escape') {
      handleCancelProjectNameEdit();
    }
  };


  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        author: 'Current User',
        timestamp: new Date().toISOString()
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  // Handle engineer invitation
  const handleInviteEngineer = (inviteData) => {
    console.log('Inviting engineer to subtask:', inviteData);
    alert(`Engineer ${inviteData.engineerName} has been invited to work on "${inviteData.taskName}"!`);
    
    // Update the subtask assignee
    if (onUpdate) {
      const updatedSubtask = {
        ...subtask,
        assignee: inviteData.engineerName,
        owner: inviteData.engineerId
      };
      onUpdate(updatedSubtask);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'To Do': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !subtask) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {subtask.title?.charAt(0) || 'S'}
                </div>
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-2xl font-bold bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Subtask title"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold">{subtask.title}</h2>
                  )}
                  <p className="text-white/80 text-sm mt-1">
                    Subtask #{subtask.id} • Created {new Date().toLocaleDateString()}
                  </p>
                  
                  {/* Project Name Section */}
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 text-sm">Project:</span>
                      {isEditingProjectName ? (
                        <input
                          type="text"
                          value={tempProjectName}
                          onChange={(e) => setTempProjectName(e.target.value)}
                          onBlur={handleSaveProjectName}
                          onKeyDown={handleProjectNameKeyDown}
                          className="px-2 py-1 rounded text-black w-full max-w-sm text-sm"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-lg font-semibold cursor-pointer text-white hover:text-white/80 transition-colors"
                            onClick={handleStartEditingProjectName}
                          >
                            {subtask.projectName || subtask.name || 'Untitled Project'}
                          </span>
                          <button
                            onClick={handleStartEditingProjectName}
                            className="text-white/70 hover:text-white transition-colors ml-2"
                            title="Edit project name"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-200 font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-200 font-medium"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[calc(90vh-120px)] bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Left Column - Main Content (70%) */}
            <div className="flex-1 min-w-0 overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-120px)]">
              {/* Remarks */}
              <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-800">Remarks</h3>
                  </div>
                </div>
                {isEditing ? (
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows="4"
                    placeholder="Add remarks..."
                  />
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">
                      {subtask.description || 'No remarks provided'}
                    </p>
                  </div>
                )}
              </div>

              {/* Activity */}
              <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-800">Activity</h3>
                  </div>
                </div>
                
                {/* Activity Tabs */}
                <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md transition-colors duration-200">
                    All
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm font-medium bg-white text-indigo-600 shadow-sm rounded-md transition-colors duration-200">
                    Comments
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md transition-colors duration-200">
                    History
                  </button>
                </div>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {comment.author.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.author}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Comment */}
                  <div className="flex gap-3 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      U
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        rows="2"
                        placeholder="Add a comment..."
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Add Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details (30%) */}
            <div className="w-80 flex-shrink-0 border-l border-white/30 bg-gradient-to-b from-white/90 to-blue-50/90 backdrop-blur-sm overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  Subtask Details
                </h3>
              
                <div className="space-y-4">
                  {/* Assignee */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Assignee</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedAssignee}
                        onChange={(e) => setEditedAssignee(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter assignee"
                      />
                    ) : (
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">{subtask.assignee || 'Unassigned'}</span>
                    </div>
                    )}
                  </div>

                  {/* Who is doing the task */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Who is doing the task</label>
                    <button
                      onClick={() => setEngineerInviteModalOpen(true)}
                      className="w-full p-2 bg-gray-50 rounded-md hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 text-left"
                      title="Click to invite engineer to this task"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {(subtask.assignee || 'U').charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{subtask.assignee || 'Unassigned'}</span>
                        <span className="text-xs text-blue-500 ml-auto">👤</span>
                      </div>
                    </button>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Status</label>
                    {isEditing ? (
                      <select
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subtask.status)}`}>
                          {subtask.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Priority</label>
                    {isEditing ? (
                      <select
                        value={editedPriority}
                        onChange={(e) => setEditedPriority(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(subtask.priority)}`}>
                          {subtask.priority}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Created Date */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Created</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Last Updated</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Category</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {subtask.category || 'Development'}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Location</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {subtask.location || 'Remote'}
                      </span>
                    </div>
                  </div>

                  {/* Project Type */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Project Type</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {subtask.projectType || 'Commercial'}
                      </span>
                    </div>
                  </div>

                  {/* Assignee Notes */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Assignee Notes</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {subtask.assigneeNotes || 'Need to complete by end of month'}
                      </span>
                    </div>
                  </div>

                  {/* Plot Number */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Plot Number</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {subtask.plotNumber || 'PLOT-002'}
                      </span>
                    </div>
                  </div>

                  {/* Community */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Community</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {subtask.community || 'Tech District'}
                      </span>
                    </div>
                  </div>

                  {/* Project Floor */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Project Floor</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {subtask.projectFloor || '3'}
                      </span>
                    </div>
                  </div>

                  {/* Developer Project */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Developer Project</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {subtask.developerProject || 'Tech Solutions Inc'}
                      </span>
                    </div>
                  </div>

                  {/* Auto # */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Auto #</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {subtask.autoNumber || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Predecessors */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Predecessors</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {subtask.predecessors || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Checklist</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {subtask.checklist || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Link */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Link</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {subtask.link || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Rating</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <span className="font-medium text-gray-900">
                        {subtask.rating || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Progress</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${subtask.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {subtask.progress || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Section */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-500" />
                      Timeline
                    </h4>
                    
                    {/* Planned Dates */}
                    <div className="mb-3">
                      <label className="text-xs text-blue-600 font-medium block mb-1">Planned Start</label>
                      <div className="p-2 bg-blue-50 rounded-md">
                        <span className="text-sm font-medium text-blue-900">
                          {subtask.plannedStart || '16 Sep 2025'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="text-xs text-blue-600 font-medium block mb-1">Planned Deadline</label>
                      <div className="p-2 bg-blue-50 rounded-md">
                        <span className="text-sm font-medium text-blue-900">
                          {subtask.plannedDeadline || '24 Sep 2025'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="text-xs text-blue-600 font-medium block mb-1">Duration</label>
                      <div className="p-2 bg-blue-50 rounded-md">
                        <span className="text-sm font-medium text-blue-900">
                          {subtask.plannedDuration || '8 Days'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actual Dates Section */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      Actual Dates
                    </h4>
                    
                    <div className="mb-3">
                      <label className="text-xs text-green-600 font-medium block mb-1">Actual Start</label>
                      <div className="p-2 bg-green-50 rounded-md">
                        <span className="text-sm font-medium text-green-900">
                          {subtask.actualStart || '10 Jun 2025'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="text-xs text-green-600 font-medium block mb-1">Actual Complete</label>
                      <div className="p-2 bg-green-50 rounded-md">
                        <span className="text-sm font-medium text-green-900">
                          {subtask.actualComplete || '10 Jun 2025'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="text-xs text-green-600 font-medium block mb-1">Actual Duration</label>
                      <div className="p-2 bg-green-50 rounded-md">
                        <span className="text-sm font-medium text-green-900">
                          {subtask.actualDuration || '0 Days'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Status */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-purple-500" />
                      Schedule Status
                    </h4>
                    
                    <div className="mb-3">
                      <label className="text-xs text-purple-600 font-medium block mb-1">Expected Start</label>
                      <div className="p-2 bg-purple-50 rounded-md">
                        <span className="text-sm font-medium text-purple-900">
                          {subtask.expectedStart || '3 Jun 2025'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="text-xs text-purple-600 font-medium block mb-1">Schedule Status</label>
                      <div className="p-2 bg-purple-50 rounded-md">
                        <span className="text-sm font-medium text-purple-900">
                          {subtask.scheduleStatus || '106 Days - Ahead of Schedule'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Completion Percentage */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                      Completion
                    </h4>
                    
                    <div className="mb-3">
                      <label className="text-xs text-orange-600 font-medium block mb-1">Completion Percentage</label>
                      <div className="p-2 bg-orange-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${subtask.completionPercentage || 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-orange-900">
                            {subtask.completionPercentage || 100}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Color</label>
                    <div className="p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: subtask.color || '#3B82F6' }}
                        ></div>
                        <span className="font-medium text-gray-900">
                          {subtask.color || '#3B82F6'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Engineer Invite Modal */}
      <EngineerInviteModal
        isOpen={engineerInviteModalOpen}
        onClose={() => setEngineerInviteModalOpen(false)}
        taskId={subtask?.id}
        taskName={subtask?.title || subtask?.name}
        currentAssignee={subtask?.assignee}
        onInviteEngineer={handleInviteEngineer}
      />

    </div>
  );
};

export default SubtaskDetailModal;
