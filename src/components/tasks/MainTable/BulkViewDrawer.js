import React from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";

const BulkViewDrawer = ({ 
  isOpen, 
  selectedTasks, 
  onClose 
}) => {
  if (!isOpen) return null;

  const formatValue = (value) => {
    if (!value) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    return value.toString();
  };

  const getStatusColor = (status) => {
    const colors = {
      'done': 'bg-green-100 text-green-800',
      'working': 'bg-yellow-100 text-yellow-800',
      'stuck': 'bg-red-100 text-red-800',
      'not started': 'bg-gray-100 text-gray-800',
      'pending': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-[800px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">View Selected Projects</h2>
              <p className="text-sm text-gray-600">{selectedTasks.length} projects selected</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {selectedTasks.map((task, index) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {index + 1}. {task.name}
                    </h3>
                    <span className="text-sm text-gray-500">ID: {task.id}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                      <p className="text-sm text-gray-900">{formatValue(task.referenceNumber)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {formatValue(task.status)}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                      <p className="text-sm text-gray-900">{formatValue(task.owner)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <p className="text-sm text-gray-900">{formatValue(task.priority)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <p className="text-sm text-gray-900">{formatValue(task.category)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <p className="text-sm text-gray-900">{formatValue(task.location)}</p>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                      <p className="text-sm text-gray-900">
                        {task.timeline && task.timeline[0] && task.timeline[1] 
                          ? `${new Date(task.timeline[0]).toLocaleDateString()} – ${new Date(task.timeline[1]).toLocaleDateString()}`
                          : 'Not set'
                        }
                      </p>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {formatValue(task.remarks)}
                      </p>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assignee Notes</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {formatValue(task.assigneeNotes)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plan Days</label>
                      <p className="text-sm text-gray-900">{formatValue(task.planDays)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pinned</label>
                      <p className="text-sm text-gray-900">{task.pinned ? 'Yes' : 'No'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plot Number</label>
                      <p className="text-sm text-gray-900">{formatValue(task.plotNumber)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Community</label>
                      <p className="text-sm text-gray-900">{formatValue(task.community)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                      <p className="text-sm text-gray-900">{formatValue(task.projectType)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Floor</label>
                      <p className="text-sm text-gray-900">{formatValue(task.projectFloor)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Developer Project</label>
                      <p className="text-sm text-gray-900">{formatValue(task.developerProject)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            className={`text-lg ${task.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{task.progress || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkViewDrawer;


