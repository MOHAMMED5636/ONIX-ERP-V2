import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useRules } from '../../context/RuleContext';

// Import modular components
import RuleStats from './RuleBuilder/components/RuleStats';
import RuleFilters from './RuleBuilder/components/RuleFilters';
import CreateRuleModal from './RuleBuilder/components/modals/CreateRuleModal';
import EditRuleModal from './RuleBuilder/components/modals/EditRuleModal';
import DeleteConfirmationModal from './RuleBuilder/components/modals/DeleteConfirmationModal';
import CopyRulesModal from './RuleBuilder/components/modals/CopyRulesModal';

// Import constants and utilities
import { 
  DEFAULT_NEW_RULE, 
  DEFAULT_EDIT_RULE, 
  MOCK_EMPLOYEES, 
  MOCK_EMPLOYEE_RULES 
} from './RuleBuilder/constants';
import { 
  filterRules, 
  getRulesStats, 
  getActionColor, 
  getRoleColor,
  simulateApiDelay,
  copyRulesFromEmployee
} from './RuleBuilder/utils';

const RuleBuilderRefactored = () => {
  const navigate = useNavigate();
  
  // Use the rules context
  const { 
    rules, 
    addRule, 
    updateRule, 
    deleteRule, 
    toggleRuleStatus 
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
  const [newRule, setNewRule] = useState(DEFAULT_NEW_RULE);

  // Edit rule form state
  const [editRule, setEditRule] = useState(DEFAULT_EDIT_RULE);

  // Filter rules based on search and filters
  const filteredRules = filterRules(rules, searchTerm, filterRole, filterAction);

  // Get stats from context
  const stats = getRulesStats(rules);

  // Handle create rule
  const handleCreateRule = () => {
    addRule(newRule);
    setShowCreateModal(false);
    setNewRule(DEFAULT_NEW_RULE);
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
      await simulateApiDelay(1000);
      setEmployees(MOCK_EMPLOYEES);
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
      await simulateApiDelay(800);
      const employeeRules = MOCK_EMPLOYEE_RULES[employeeId] || [];
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
      await simulateApiDelay(1500);
      
      // Add the copied rules to the current rules list
      const newRules = copyRulesFromEmployee(sourceEmployeeRules, selectedSourceEmployee.name);
      
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
        <RuleStats stats={stats} />

        {/* Enhanced Action Bar */}
        <RuleFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterRole={filterRole}
          setFilterRole={setFilterRole}
          filterAction={filterAction}
          setFilterAction={setFilterAction}
          onOpenCopyRulesModal={handleOpenCopyRulesModal}
          onCreateRule={() => setShowCreateModal(true)}
        />

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
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-white/80 transition-all duration-300 transform hover:scale-[1.01] group">
                    <td className="px-8 py-6">
                      <div className="max-w-xs">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{rule.description}</p>
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
                          <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border-l-2 border-green-300">
                            <span className="font-semibold">{condition.key}</span> {condition.operator} <span className="font-semibold text-green-600">{condition.value}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => handleToggleRuleStatus(rule.id)}
                        className={`px-3 py-2 rounded-full text-xs font-bold shadow-lg transition-all duration-300 transform hover:scale-105 ${
                          rule.isActive 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600' 
                            : 'bg-gradient-to-r from-gray-500 to-slate-500 text-white hover:from-gray-600 hover:to-slate-600'
                        }`}
                      >
                        {rule.isActive ? '✓ Active' : '✗ Inactive'}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-300 transform hover:scale-110"
                          title="Edit Rule"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-300 transform hover:scale-110"
                          title="Delete Rule"
                        >
                          <TrashIcon className="w-4 h-4" />
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
              <div className="relative">
                <ShieldCheckIcon className="mx-auto h-16 w-16 text-gray-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">No rules found</h3>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">
                {searchTerm || filterRole || filterAction 
                  ? 'Try adjusting your search or filters to find more rules.'
                  : 'Get started by creating your first access rule.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateRuleModal
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        newRule={newRule}
        setNewRule={setNewRule}
        onSave={handleCreateRule}
      />

      <EditRuleModal
        showModal={showEditModal}
        setShowModal={setShowEditModal}
        editRule={editRule}
        setEditRule={setEditRule}
        onSave={handleUpdateRule}
      />

      <DeleteConfirmationModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        selectedRule={selectedRule}
        onConfirm={handleConfirmDelete}
      />

      <CopyRulesModal
        showModal={showCopyRulesModal}
        setShowModal={setShowCopyRulesModal}
        employees={employees}
        selectedSourceEmployee={selectedSourceEmployee}
        setSelectedSourceEmployee={setSelectedSourceEmployee}
        sourceEmployeeRules={sourceEmployeeRules}
        isLoadingEmployees={isLoadingEmployees}
        isLoadingRules={isLoadingRules}
        isCopyingRules={isCopyingRules}
        onEmployeeSelect={handleEmployeeSelect}
        onCopyRules={handleCopyRules}
      />
    </div>
  );
};

export default RuleBuilderRefactored;


