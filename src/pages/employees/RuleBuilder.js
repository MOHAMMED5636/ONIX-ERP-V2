import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FunnelIcon,
  ArrowLeftIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { useRules } from '../../context/RuleContext';

export default function RuleBuilder() {
  const navigate = useNavigate();
  
  // Mock user data for testing
  const mockCurrentUser = {
    role: 'admin',
    department: 'IT',
    location: 'HQ - Main Office',
    permissions: ['view', 'edit', 'delete']
  };

  // Mock employees data
  const mockEmployees = [
    { id: 1, name: 'Ahmed Ali', email: 'ahmed.ali@email.com', department: 'HR', jobTitle: 'Manager' },
    { id: 2, name: 'Sara Youssef', email: 'sara.y@email.com', department: 'Finance', jobTitle: 'Accountant' },
    { id: 3, name: 'John Smith', email: 'john.smith@email.com', department: 'IT', jobTitle: 'Developer' },
    { id: 4, name: 'Fatima Noor', email: 'fatima.noor@email.com', department: 'Sales', jobTitle: 'Sales Rep' }
  ];

  // Mock employee rules data
  const mockEmployeeRules = {
    1: [
      { id: 1, role: 'manager', action: 'view', field: 'salary', conditions: [{ key: 'department', operator: 'equals', value: 'IT' }], description: 'Managers can view salary only for IT department employees', isActive: true },
      { id: 2, role: 'manager', action: 'edit', field: 'phone', conditions: [{ key: 'department', operator: 'equals', value: 'HR' }], description: 'Managers can edit phone numbers for HR department', isActive: true }
    ],
    2: [
      { id: 3, role: 'employee', action: 'view', field: 'phone', conditions: [{ key: 'department', operator: 'equals', value: 'HR' }], description: 'Employees can view phone numbers only for HR department', isActive: true }
    ],
    3: [
      { id: 4, role: 'hr_manager', action: 'edit', field: 'salary', conditions: [{ key: 'role', operator: 'not_equals', value: 'admin' }], description: 'HR managers can edit salary for non admin employees', isActive: true },
      { id: 5, role: 'hr_manager', action: 'view', field: 'performanceRating', conditions: [{ key: 'department', operator: 'equals', value: 'IT' }], description: 'HR managers can view performance ratings for IT department', isActive: true }
    ],
    4: [
      { id: 6, role: 'employee', action: 'view', field: 'email', conditions: [{ key: 'department', operator: 'equals', value: 'Sales' }], description: 'Employees can view emails for Sales department', isActive: true }
    ]
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
  const [showCopyRulesModal, setShowCopyRulesModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterAction, setFilterAction] = useState('');
  
  // Copy Rules states
  const [employees, setEmployees] = useState([]);
  const [selectedSourceEmployee, setSelectedSourceEmployee] = useState(null);
  const [sourceEmployeeRules, setSourceEmployeeRules] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [isCopyingRules, setIsCopyingRules] = useState(false);

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

  // Copy Rules functions
  const handleOpenCopyRulesModal = async () => {
    setShowCopyRulesModal(true);
    setIsLoadingEmployees(true);
    
    try {
      // Simulate API call to fetch employees
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmployees(mockEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleEmployeeSelect = async (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setSelectedSourceEmployee(employee);
    setIsLoadingRules(true);
    
    try {
      // Simulate API call to fetch employee rules
      await new Promise(resolve => setTimeout(resolve, 800));
      const employeeRules = mockEmployeeRules[employeeId] || [];
      setSourceEmployeeRules(employeeRules);
    } catch (error) {
      console.error('Error fetching employee rules:', error);
      setSourceEmployeeRules([]);
    } finally {
      setIsLoadingRules(false);
    }
  };

  const handleCopyRules = async () => {
    if (!selectedSourceEmployee) return;
    
    setIsCopyingRules(true);
    
    try {
      // Simulate API call to copy rules
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add the copied rules to the current rules list
      const newRules = sourceEmployeeRules.map(rule => ({
        ...rule,
        id: Date.now() + Math.random(), // Generate new ID
        description: `${rule.description} (Copied from ${selectedSourceEmployee.name})`
      }));
      
      // Add rules to context
      newRules.forEach(rule => addRule(rule));
      
      // Show success notification (you can implement a toast system)
      alert(`Successfully copied ${newRules.length} rules from ${selectedSourceEmployee.name}`);
      
      // Close modal and reset state
      setShowCopyRulesModal(false);
      setSelectedSourceEmployee(null);
      setSourceEmployeeRules([]);
    } catch (error) {
      console.error('Error copying rules:', error);
      alert('Error copying rules. Please try again.');
    } finally {
      setIsCopyingRules(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className="mb-8">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/employees')}
              className="group inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-700 hover:bg-white hover:border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-semibold">Back to Employee Directory</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              <div className="p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <ShieldCheckIcon className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Rule Builder
              </h1>
              <p className="text-gray-600 text-xl font-medium leading-relaxed">
                Define dynamic field-level access rules for employee data with precision and control
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Rules</p>
                <p className="text-3xl font-black text-gray-900">{stats.totalRules}</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Rules</p>
                <p className="text-3xl font-black text-green-600">{stats.activeRules}</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <XCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Inactive Rules</p>
                <p className="text-3xl font-black text-gray-600">{stats.inactiveRules}</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full"></div>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <EyeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">View Rules</p>
                <p className="text-3xl font-black text-blue-600">{stats.viewRules}</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <PencilIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Edit Rules</p>
                <p className="text-3xl font-black text-yellow-600">{stats.editRules}</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
          </div>
        </div>

        {/* Enhanced Action Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-6 flex-1">
              {/* Enhanced Search */}
              <div className="relative flex-1 max-w-md group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder="Search rules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  />
                </div>
              </div>

              {/* Enhanced Filters */}
              <div className="flex gap-3">
                <div className="relative group">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-300 shadow-lg hover:shadow-xl appearance-none pr-10"
                  >
                    <option value="">All Roles</option>
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                <div className="relative group">
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="px-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-300 shadow-lg hover:shadow-xl appearance-none pr-10"
                  >
                    <option value="">All Actions</option>
                    {availableActions.map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-4">
              {/* Copy Rules Button */}
              <button
                onClick={handleOpenCopyRulesModal}
                className="group px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-2xl hover:bg-purple-600 hover:text-white transition-all duration-300 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center space-x-3"
              >
                <ClipboardDocumentIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                <span>Copy Rules</span>
              </button>
              
              {/* Create Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="group px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center space-x-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <PlusIcon className="h-6 w-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <span className="relative z-10">Create Rule</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Rules Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Access Rules ({filteredRules.length})</h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 font-medium">Live Updates</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-gradient-to-r from-indigo-100/50 via-purple-100/50 to-pink-100/50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rule</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Field</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Conditions</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200/50">
                {filteredRules.map((rule, index) => (
                  <tr key={rule.id} className="hover:bg-white/80 transition-all duration-300 transform hover:scale-[1.01] group">
                    <td className="px-8 py-6">
                      <div className="max-w-xs">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">{rule.description}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-2 rounded-full text-xs font-bold shadow-lg ${getRoleColor(rule.role)}`}>
                        {rule.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-2 rounded-full text-xs font-bold shadow-lg ${getActionColor(rule.action)}`}>
                        {rule.action}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-lg">{rule.field}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        {rule.conditions.map((condition, index) => (
                          <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border-l-2 border-indigo-300">
                            <span className="font-semibold">{condition.key}</span> {condition.operator} <span className="font-semibold text-indigo-600">{condition.value}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => handleToggleRuleStatus(rule.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                          rule.isActive 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600' 
                            : 'bg-gradient-to-r from-gray-500 to-slate-500 text-white hover:from-gray-600 hover:to-slate-600'
                        }`}
                      >
                        {rule.isActive ? '✓ Active' : '✗ Inactive'}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-3 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                          title="Edit rule"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule)}
                          className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                          title="Delete rule"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRules.length === 0 && (
            <div className="text-center py-16">
              <div className="relative">
                <ShieldCheckIcon className="mx-auto h-16 w-16 text-gray-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">No rules found</h3>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">
                {searchTerm || filterRole || filterAction 
                  ? 'Try adjusting your search or filters to find what you\'re looking for.' 
                  : 'Get started by creating your first access rule to secure your employee data.'}
              </p>
              {!searchTerm && !filterRole && !filterAction && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Create Your First Rule
                </button>
              )}
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

        {/* Enhanced Copy Rules Modal */}
        {showCopyRulesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
              {/* Enhanced Header */}
              <div className="p-8 border-b border-gray-200/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <ClipboardDocumentIcon className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">Copy Rules from Employee</h3>
                      <p className="text-gray-600 text-lg font-medium mt-2">Select an employee to copy their access rules</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCopyRulesModal(false);
                      setSelectedSourceEmployee(null);
                      setSourceEmployeeRules([]);
                    }}
                    className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-300 transform hover:scale-110"
                  >
                    <XCircleIcon className="h-7 w-7" />
                  </button>
                </div>
              </div>

              {/* Enhanced Content */}
              <div className="p-8 space-y-8">
                {/* Enhanced Employee Selection */}
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/50 shadow-xl">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                      <UserGroupIcon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Select Source Employee</h4>
                  </div>
                  
                  <div className="relative">
                    {isLoadingEmployees ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-ping"></div>
                        </div>
                        <span className="ml-4 text-gray-600 font-medium text-lg">Loading employees...</span>
                      </div>
                    ) : (
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <select
                          onChange={(e) => handleEmployeeSelect(parseInt(e.target.value))}
                          className="relative w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300"
                          defaultValue=""
                        >
                          <option value="" disabled>Select an employee to copy rules from</option>
                          {employees.map(employee => (
                            <option key={employee.id} value={employee.id}>
                              {employee.name} - {employee.jobTitle} ({employee.department})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Employee Rules Table */}
                {selectedSourceEmployee && (
                  <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl p-8 border border-green-200/50 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                          <ShieldCheckIcon className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">
                          Rules for <span className="text-green-600">{selectedSourceEmployee.name}</span>
                        </h4>
                      </div>
                      {isLoadingRules && (
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-200 border-t-green-600"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-400 animate-ping"></div>
                          </div>
                          <span className="text-sm text-gray-600 font-medium">Loading rules...</span>
                        </div>
                      )}
                    </div>
                    
                    {isLoadingRules ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-400 animate-ping"></div>
                        </div>
                        <span className="ml-4 text-gray-600 font-medium text-lg">Loading rules...</span>
                      </div>
                    ) : sourceEmployeeRules.length > 0 ? (
                      <div className="overflow-x-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                        <table className="min-w-full divide-y divide-gray-200/50">
                          <thead className="bg-gradient-to-r from-green-100/50 to-emerald-100/50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rule</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Field</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Conditions</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white/50 divide-y divide-gray-200/50">
                            {sourceEmployeeRules.map((rule) => (
                              <tr key={rule.id} className="hover:bg-white/80 transition-all duration-300 transform hover:scale-[1.01] group">
                                <td className="px-6 py-4">
                                  <div className="max-w-xs">
                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{rule.description}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-2 rounded-full text-xs font-bold shadow-lg ${getRoleColor(rule.role)}`}>
                                    {rule.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-2 rounded-full text-xs font-bold shadow-lg ${getActionColor(rule.action)}`}>
                                    {rule.action}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-lg">{rule.field}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-2">
                                    {rule.conditions.map((condition, index) => (
                                      <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border-l-2 border-green-300">
                                        <span className="font-semibold">{condition.key}</span> {condition.operator} <span className="font-semibold text-green-600">{condition.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-2 rounded-full text-xs font-bold shadow-lg ${
                                    rule.isActive 
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                      : 'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
                                  }`}>
                                    {rule.isActive ? '✓ Active' : '✗ Inactive'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="relative">
                          <ShieldCheckIcon className="mx-auto h-16 w-16 text-gray-300" />
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-gray-900">No rules found</h3>
                        <p className="mt-2 text-gray-600 max-w-md mx-auto">
                          This employee doesn't have any access rules defined yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Enhanced Footer */}
              <div className="p-8 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowCopyRulesModal(false);
                    setSelectedSourceEmployee(null);
                    setSourceEmployeeRules([]);
                  }}
                  className="px-6 py-3 text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl hover:bg-white hover:border-gray-300 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCopyRules}
                  disabled={!selectedSourceEmployee || sourceEmployeeRules.length === 0 || isCopyingRules}
                  className="group px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-2xl hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center space-x-3 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {isCopyingRules ? (
                    <>
                      <div className="relative z-10">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      </div>
                      <span className="relative z-10">Copying Rules...</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                      <span className="relative z-10">Copy Rules</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 