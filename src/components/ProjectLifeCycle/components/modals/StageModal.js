import React from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { STAGE_COLORS } from '../../constants';

const StageModal = ({
  showEditModal,
  showAddModal,
  setShowEditModal,
  setShowAddModal,
  setEditingStage,
  formData,
  setFormData,
  updateTask,
  removeTask,
  addTask,
  handleSaveEdit,
  handleSaveAdd
}) => {
  const colorOptions = STAGE_COLORS.map(color => ({ value: color, label: color }));

  if (!showEditModal && !showAddModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {showEditModal ? 'Edit Stage' : 'Add New Stage'}
            </h3>
            <button
              onClick={() => {
                setShowEditModal(false);
                setShowAddModal(false);
                setEditingStage(null);
              }}
              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stage Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter stage name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Enter stage description"
              />
            </div>

            {/* Date Range Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Theme
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      formData.color === color.value 
                        ? 'border-gray-400 scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    <div className="w-full h-1 bg-white rounded opacity-80"></div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tasks
                </label>
                <span className="text-xs text-gray-500">({formData.tasks.length} tasks)</span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {formData.tasks.map((task, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => updateTask(index, e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Task ${index + 1}`}
                    />
                    <button
                      onClick={() => removeTask(index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Remove task"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTask}
                  className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors text-sm"
                >
                  <PlusIcon className="w-4 h-4 inline mr-2" />
                  Add Task
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowEditModal(false);
                setShowAddModal(false);
                setEditingStage(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={showEditModal ? handleSaveEdit : handleSaveAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showEditModal ? 'Update Stage' : 'Add Stage'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageModal;



