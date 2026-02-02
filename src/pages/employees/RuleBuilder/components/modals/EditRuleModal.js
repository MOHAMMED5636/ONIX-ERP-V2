import React from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { 
  AVAILABLE_ROLES, 
  AVAILABLE_ACTIONS, 
  AVAILABLE_FIELDS, 
  AVAILABLE_CONDITIONS, 
  OPERATORS 
} from '../../constants';
import { validateRule } from '../../utils';

const EditRuleModal = ({
  showModal,
  setShowModal,
  editRule,
  setEditRule,
  onSave
}) => {
  const [errors, setErrors] = React.useState([]);
  
  // Check if role is admin or manager (for multi-action selection)
  const isAdminOrManager = editRule.role === 'admin' || editRule.role === 'manager';
  
  // Initialize actions as array if it's admin/manager, otherwise keep as string
  const selectedActions = isAdminOrManager 
    ? (Array.isArray(editRule.actions) ? editRule.actions : (editRule.action ? editRule.action.split(',').map(a => a.trim()) : []))
    : [];
  
  const handleActionToggle = (action) => {
    if (isAdminOrManager) {
      const currentActions = Array.isArray(editRule.actions) ? editRule.actions : (editRule.action ? editRule.action.split(',').map(a => a.trim()) : []);
      const updatedActions = currentActions.includes(action)
        ? currentActions.filter(a => a !== action)
        : [...currentActions, action];
      setEditRule({ ...editRule, actions: updatedActions, action: updatedActions.join(',') });
    } else {
      setEditRule({ ...editRule, action: action, actions: [] });
    }
  };
  
  const handleSelectAllActions = () => {
    if (isAdminOrManager) {
      setEditRule({ ...editRule, actions: AVAILABLE_ACTIONS, action: AVAILABLE_ACTIONS.join(',') });
    }
  };
  
  const handleDeselectAllActions = () => {
    if (isAdminOrManager) {
      setEditRule({ ...editRule, actions: [], action: '' });
    }
  };

  const handleSave = () => {
    const validationErrors = validateRule(editRule);
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      onSave();
    }
  };

  const addCondition = () => {
    setEditRule({
      ...editRule,
      conditions: [...editRule.conditions, { key: '', operator: 'equals', value: '' }]
    });
  };

  const removeCondition = (index) => {
    const updatedConditions = editRule.conditions.filter((_, i) => i !== index);
    setEditRule({
      ...editRule,
      conditions: updatedConditions.length > 0 ? updatedConditions : [{ key: '', operator: 'equals', value: '' }]
    });
  };

  const updateCondition = (index, field, value) => {
    const updatedConditions = editRule.conditions.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    );
    setEditRule({
      ...editRule,
      conditions: updatedConditions
    });
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Edit Rule</h3>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-semibold text-red-800 mb-2">Please fix the following errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Rule Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={editRule.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    const isNewRoleAdminOrManager = newRole === 'admin' || newRole === 'manager';
                    // Reset actions when role changes
                    setEditRule({ 
                      ...editRule, 
                      role: newRole,
                      action: '',
                      actions: []
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Role</option>
                  {AVAILABLE_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isAdminOrManager ? 'Actions (Select Multiple)' : 'Action'}
                </label>
                {isAdminOrManager ? (
                  <div className="space-y-2">
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={handleSelectAllActions}
                        className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllActions}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Deselect All
                      </button>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                      {AVAILABLE_ACTIONS.map(action => (
                        <label key={action} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedActions.includes(action)}
                            onChange={() => handleActionToggle(action)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                    {selectedActions.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Selected: {selectedActions.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <select
                    value={editRule.action || ''}
                    onChange={(e) => setEditRule({ ...editRule, action: e.target.value, actions: [] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Action</option>
                    {AVAILABLE_ACTIONS.map(action => (
                      <option key={action} value={action}>
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
                <select
                  value={editRule.field}
                  onChange={(e) => setEditRule({ ...editRule, field: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Field</option>
                  {AVAILABLE_FIELDS.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editRule.description}
                  onChange={(e) => setEditRule({ ...editRule, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe what this rule does..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editRule.isActive}
                  onChange={(e) => setEditRule({ ...editRule, isActive: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active Rule
                </label>
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Conditions</h4>
                <button
                  onClick={addCondition}
                  className="flex items-center px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Condition
                </button>
              </div>

              <div className="space-y-3">
                {editRule.conditions.map((condition, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Condition {index + 1}</span>
                      {editRule.conditions.length > 1 && (
                        <button
                          onClick={() => removeCondition(index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={condition.key}
                        onChange={(e) => updateCondition(index, 'key', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Field</option>
                        {AVAILABLE_CONDITIONS.map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                      
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {OPERATORS.map(op => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                      
                      <input
                        type="text"
                        value={condition.value}
                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Update Rule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRuleModal;


