import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

const BulkEditDrawer = ({ 
  isOpen, 
  selectedTasks, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when drawer opens
  useEffect(() => {
    if (isOpen && selectedTasks.length > 0) {
      // Find common values across selected tasks
      const commonData = {};
      const fields = ['status', 'owner', 'priority', 'category', 'location', 'remarks', 'assigneeNotes'];
      
      fields.forEach(field => {
        const values = selectedTasks.map(task => task[field]).filter(Boolean);
        const uniqueValues = [...new Set(values)];
        
        if (uniqueValues.length === 1) {
          commonData[field] = uniqueValues[0];
        } else {
          commonData[field] = ''; // Mixed values
        }
      });
      
      setFormData(commonData);
      setHasChanges(false);
    }
  }, [isOpen, selectedTasks]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(selectedTasks, formData);
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleCancel}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bulk Edit Projects</h2>
              <p className="text-sm text-gray-600">{selectedTasks.length} projects selected</p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Selected Projects List */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Projects:</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedTasks.map(task => (
                    <div key={task.id} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {task.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Keep current values</option>
                    <option value="done">Done</option>
                    <option value="working">Working</option>
                    <option value="stuck">Stuck</option>
                    <option value="not started">Not Started</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                  <select
                    value={formData.owner || ''}
                    onChange={(e) => handleInputChange('owner', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Keep current values</option>
                    <option value="MN">MN</option>
                    <option value="SA">SA</option>
                    <option value="AH">AH</option>
                    <option value="MA">MA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority || ''}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Keep current values</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Keep current values</option>
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Review">Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter location"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    value={formData.remarks || ''}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    placeholder="Enter remarks"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee Notes</label>
                  <textarea
                    value={formData.assigneeNotes || ''}
                    onChange={(e) => handleInputChange('assigneeNotes', e.target.value)}
                    placeholder="Enter assignee notes"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckIcon className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditDrawer;

