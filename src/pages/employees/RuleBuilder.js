import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  UserGroupIcon,
  CogIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useRules } from '../../context/RuleContext';

export default function RuleBuilder() {
  // Mock user data for testing
  const mockCurrentUser = {
    role: 'admin',
    department: 'IT',
    location: 'HQ - Main Office',
    permissions: ['view', 'edit', 'delete']
  };

  // Available roles
  const availableRoles = [
    'admin',
    'manager', 
    'supervisor',
    'employee',
    'hr_manager',
    'finance_manager',
    'department_head'
  ];

  // Available actions
  const availableActions = [
    'view',
    'edit', 
    'delete',
    'create'
  ];

  // Available fields
  const availableFields = [
    'name',
    'email',
    'phone',
    'salary',
    'department',
    'position',
    'hireDate',
    'manager',
    'location',
    'status',
    'employeeId',
    'passportNumber',
    'nationalId',
    'insurance',
    'bankDetails',
    'emergencyContact',
    'performanceRating',
    'attendance',
    'leaveBalance'
  ];

  // Available conditions
  const availableConditions = [
    'department',
    'location', 
    'role',
    'status',
    'manager',
    'hireDate',
    'salary_range'
  ];

  // Use the rules context
  const { 
    rules, 
    addRule, 
    updateRule, 
    deleteRule, 
    toggleRuleStatus, 
    getRulesStats 
  } = useRules();

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterAction, setFilterAction] = useState('');

  // New rule form state
  const [newRule, setNewRule] = useState({
    role: '',
    action: '',
    field: '',
    conditions: [{ key: '', operator: 'equals', value: '' }],
    description: '',
    isActive: true
  });

  // Edit rule form state
  const [editRule, setEditRule] = useState({
    role: '',
    action: '',
    field: '',
    conditions: [{ key: '', operator: 'equals', value: '' }],
    description: '',
    isActive: true
  });

  // Operators for conditions
  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'in_range', label: 'In Range' }
  ];

  // Filter rules based on search and filters
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.field.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || rule.role === filterRole;
    const matchesAction = !filterAction || rule.action === filterAction;
    
    return matchesSearch && matchesRole && matchesAction;
  });

  // Get stats from context
  const stats = getRulesStats();

  // Handle create rule
  const handleCreateRule = () => {
    addRule(newRule);
    setShowCreateModal(false);
    setNewRule({
      role: '',
      action: '',
      field: '',
      conditions: [{ key: '', operator: 'equals', value: '' }],
      description: '',
      isActive: true
    });
  };

  // Handle edit rule
  const handleEditRule = (rule) => {
    setSelectedRule(rule);
    setEditRule({
      role: rule.role,
      action: rule.action,
      field: rule.field,
      conditions: rule.conditions.length > 0 ? rule.conditions : [{ key: '', operator: 'equals', value: '' }],
      description: rule.description,
      isActive: rule.isActive
    });
    setShowEditModal(true);
  };

  // Handle update rule
  const handleUpdateRule = () => {
    updateRule(selectedRule.id, editRule);
    setShowEditModal(false);
    setSelectedRule(null);
  };

  // Handle delete rule
  const handleDeleteRule = (rule) => {
    setSelectedRule(rule);
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    deleteRule(selectedRule.id);
    setShowDeleteModal(false);
    setSelectedRule(null);
  };

  // Add condition to new rule
  const addCondition = () => {
    setNewRule({
      ...newRule,
      conditions: [...newRule.conditions, { key: '', operator: 'equals', value: '' }]
    });
  };

  // Remove condition from new rule
  const removeCondition = (index) => {
    const updatedConditions = newRule.conditions.filter((_, i) => i !== index);
    setNewRule({
      ...newRule,
      conditions: updatedConditions.length > 0 ? updatedConditions : [{ key: '', operator: 'equals', value: '' }]
    });
  };

  // Update condition in new rule
  const updateCondition = (index, field, value) => {
    const updatedConditions = newRule.conditions.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    );
    setNewRule({
      ...newRule,
      conditions: updatedConditions
    });
  };

  // Add condition to edit rule
  const addEditCondition = () => {
    setEditRule({
      ...editRule,
      conditions: [...editRule.conditions, { key: '', operator: 'equals', value: '' }]
    });
  };

  // Remove condition from edit rule
  const removeEditCondition = (index) => {
    const updatedConditions = editRule.conditions.filter((_, i) => i !== index);
    setEditRule({
      ...editRule,
      conditions: updatedConditions.length > 0 ? updatedConditions : [{ key: '', operator: 'equals', value: '' }]
    });
  };

  // Update condition in edit rule
  const updateEditCondition = (index, field, value) => {
    const updatedConditions = editRule.conditions.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    );
    setEditRule({
      ...editRule,
      conditions: updatedConditions
    });
  };

  // Toggle rule active status
  const handleToggleRuleStatus = (ruleId) => {
    toggleRuleStatus(ruleId);
  };

  // Get action color
  const getActionColor = (action) => {
    switch (action) {
      case 'view': return 'bg-blue-100 text-blue-800';
      case 'edit': return 'bg-yellow-100 text-yellow-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'create': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-indigo-100 text-indigo-800';
      case 'hr_manager': return 'bg-pink-100 text-pink-800';
      case 'finance_manager': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Rule Builder
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Define dynamic field-level access rules for employee data
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rules</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRules}</p>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeRules}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Rules</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactiveRules}</p>
              </div>
              <XCircleIcon className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">View Rules</p>
                <p className="text-2xl font-bold text-blue-600">{stats.viewRules}</p>
              </div>
              <EyeIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Edit Rules</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.editRules}</p>
              </div>
              <PencilIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Enhanced Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Roles</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Actions</option>
                  {availableActions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Create Rule</span>
            </button>
          </div>
        </div>

        {/* Rules Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Access Rules ({filteredRules.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conditions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900">{rule.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(rule.role)}`}>
                        {rule.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(rule.action)}`}>
                        {rule.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium">{rule.field}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {rule.conditions.map((condition, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {condition.key} {condition.operator} {condition.value}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                                             <button
                         onClick={() => handleToggleRuleStatus(rule.id)}
                         className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                           rule.isActive 
                             ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                             : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                         }`}
                       >
                         {rule.isActive ? 'Active' : 'Inactive'}
                       </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit rule"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete rule"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRules.length === 0 && (
            <div className="text-center py-12">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No rules found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterRole || filterAction 
                  ? 'Try adjusting your search or filters.' 
                  : 'Get started by creating your first access rule.'}
              </p>
            </div>
          )}
        </div>

        {/* Create Rule Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Create New Rule</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        value={newRule.role}
                        onChange={(e) => setNewRule({...newRule, role: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Role</option>
                        {availableRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                      <select
                        value={newRule.action}
                        onChange={(e) => setNewRule({...newRule, action: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Action</option>
                        {availableActions.map(action => (
                          <option key={action} value={action}>{action}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
                      <select
                        value={newRule.field}
                        onChange={(e) => setNewRule({...newRule, field: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Field</option>
                        {availableFields.map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={newRule.description}
                        onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                        placeholder="Enter rule description..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <CogIcon className="h-5 w-5 text-green-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Conditions</h4>
                    </div>
                    <button
                      onClick={addCondition}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      Add Condition
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {newRule.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center space-x-2 p-4 bg-white rounded-lg border border-green-200">
                        <select
                          value={condition.key}
                          onChange={(e) => updateCondition(index, 'key', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Select Field</option>
                          {availableConditions.map(cond => (
                            <option key={cond} value={cond}>{cond}</option>
                          ))}
                        </select>
                        
                        <select
                          value={condition.operator}
                          onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          {operators.map(op => (
                            <option key={op.value} value={op.value}>{op.label}</option>
                          ))}
                        </select>
                        
                        <input
                          type="text"
                          value={condition.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        
                        {newRule.conditions.length > 1 && (
                          <button
                            onClick={() => removeCondition(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newRule.isActive}
                    onChange={(e) => setNewRule({...newRule, isActive: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Rule is active
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRule}
                  disabled={!newRule.role || !newRule.action || !newRule.field || !newRule.description}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Rule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Rule Modal */}
        {showEditModal && selectedRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Edit Rule</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        value={editRule.role}
                        onChange={(e) => setEditRule({...editRule, role: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Role</option>
                        {availableRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                      <select
                        value={editRule.action}
                        onChange={(e) => setEditRule({...editRule, action: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Action</option>
                        {availableActions.map(action => (
                          <option key={action} value={action}>{action}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Field</label>
                      <select
                        value={editRule.field}
                        onChange={(e) => setEditRule({...editRule, field: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Field</option>
                        {availableFields.map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={editRule.description}
                        onChange={(e) => setEditRule({...editRule, description: e.target.value})}
                        placeholder="Enter rule description..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <CogIcon className="h-5 w-5 text-green-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Conditions</h4>
                    </div>
                    <button
                      onClick={addEditCondition}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      Add Condition
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {editRule.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center space-x-2 p-4 bg-white rounded-lg border border-green-200">
                        <select
                          value={condition.key}
                          onChange={(e) => updateEditCondition(index, 'key', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Select Field</option>
                          {availableConditions.map(cond => (
                            <option key={cond} value={cond}>{cond}</option>
                          ))}
                        </select>
                        
                        <select
                          value={condition.operator}
                          onChange={(e) => updateEditCondition(index, 'operator', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          {operators.map(op => (
                            <option key={op.value} value={op.value}>{op.label}</option>
                          ))}
                        </select>
                        
                        <input
                          type="text"
                          value={condition.value}
                          onChange={(e) => updateEditCondition(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        
                        {editRule.conditions.length > 1 && (
                          <button
                            onClick={() => removeEditCondition(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editRule.isActive}
                    onChange={(e) => setEditRule({...editRule, isActive: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editIsActive" className="text-sm font-medium text-gray-700">
                    Rule is active
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRule}
                  disabled={!editRule.role || !editRule.action || !editRule.field || !editRule.description}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Rule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  <h3 className="text-xl font-bold text-gray-900">Delete Rule</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete the rule "{selectedRule.description}"? This action cannot be undone.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Role:</strong> {selectedRule.role} | <strong>Action:</strong> {selectedRule.action} | <strong>Field:</strong> {selectedRule.field}
                  </p>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Rule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 