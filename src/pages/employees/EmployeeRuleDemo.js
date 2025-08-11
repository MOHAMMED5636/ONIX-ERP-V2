import React, { useState } from 'react';
import { 
  UserIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useRules } from '../../context/RuleContext';
import { filterEmployeeData, evaluateFieldAccess } from '../../utils/ruleEvaluator';

export default function EmployeeRuleDemo() {
  // Mock employee data
  const mockEmployees = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@company.com",
      phone: "+1-555-0123",
      salary: "$75,000",
      department: "IT",
      position: "Senior Developer",
      hireDate: "2023-01-15",
      manager: "Sarah Johnson",
      location: "HQ - Main Office",
      status: "Active",
      employeeId: "EMP001",
      passportNumber: "A12345678",
      nationalId: "123456789",
      insurance: "INS-001",
      bankDetails: "**** **** **** 1234",
      emergencyContact: "Jane Smith - +1-555-9999",
      performanceRating: "4.5/5",
      attendance: "95%",
      leaveBalance: "15 days"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      phone: "+1-555-0124",
      salary: "$85,000",
      department: "IT",
      position: "Team Lead",
      hireDate: "2023-03-20",
      manager: "Mike Brown",
      location: "HQ - Main Office",
      status: "Active",
      employeeId: "EMP002",
      passportNumber: "B87654321",
      nationalId: "987654321",
      insurance: "INS-002",
      bankDetails: "**** **** **** 5678",
      emergencyContact: "Tom Johnson - +1-555-8888",
      performanceRating: "4.8/5",
      attendance: "98%",
      leaveBalance: "12 days"
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.davis@company.com",
      phone: "+1-555-0126",
      salary: "$65,000",
      department: "HR",
      position: "HR Specialist",
      hireDate: "2023-01-05",
      manager: "Lisa Anderson",
      location: "Branch 1 - Downtown",
      status: "Active",
      employeeId: "EMP003",
      passportNumber: "C11223344",
      nationalId: "112233445",
      insurance: "INS-003",
      bankDetails: "**** **** **** 9012",
      emergencyContact: "David Davis - +1-555-7777",
      performanceRating: "4.2/5",
      attendance: "92%",
      leaveBalance: "18 days"
    }
  ];

  // Mock user roles for testing
  const userRoles = [
    { role: 'admin', department: 'IT', location: 'HQ - Main Office' },
    { role: 'manager', department: 'IT', location: 'HQ - Main Office' },
    { role: 'hr_manager', department: 'HR', location: 'Branch 1 - Downtown' },
    { role: 'employee', department: 'IT', location: 'HQ - Main Office' },
    { role: 'finance_manager', department: 'Finance', location: 'HQ - Main Office' }
  ];

  const { rules } = useRules();
  const [selectedUser, setSelectedUser] = useState(userRoles[0]);
  const [selectedEmployee, setSelectedEmployee] = useState(mockEmployees[0]);
  const [showAccessInfo, setShowAccessInfo] = useState(false);

  // Filter employee data based on current user and rules
  const filteredEmployeeData = filterEmployeeData(selectedEmployee, rules, selectedUser);

  // Get access information for each field
  const getFieldAccessInfo = (field) => {
    return evaluateFieldAccess(
      rules,
      selectedUser.role,
      'view',
      field,
      selectedUser,
      selectedEmployee
    );
  };

  // Check if field is visible
  const isFieldVisible = (field) => {
    const accessInfo = getFieldAccessInfo(field);
    return accessInfo.hasAccess;
  };

  // Get field display value
  const getFieldValue = (field) => {
    if (isFieldVisible(field)) {
      return selectedEmployee[field];
    }
    return filteredEmployeeData[field];
  };

  // Get field access reason
  const getFieldAccessReason = (field) => {
    const accessInfo = getFieldAccessInfo(field);
    return accessInfo.reason;
  };

  // Get field access rule
  const getFieldAccessRule = (field) => {
    const accessInfo = getFieldAccessInfo(field);
    return accessInfo.rule;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Rule-Based Access Demo
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                See how access rules dynamically control field visibility
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Role Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <UserGroupIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Current User</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser(userRoles.find(u => u.role === e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {userRoles.map(user => (
                    <option key={user.role} value={user.role}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)} ({user.department})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-700">
                    {selectedUser.department}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-700">
                    {selectedUser.location}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <UserIcon className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Employee Data</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
              <select
                value={selectedEmployee.id}
                onChange={(e) => setSelectedEmployee(mockEmployees.find(emp => emp.id === parseInt(e.target.value)))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {mockEmployees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.department}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Employee Data Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Employee: {selectedEmployee.name}
              </h2>
              <button
                onClick={() => setShowAccessInfo(!showAccessInfo)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
              >
                <InformationCircleIcon className="h-4 w-4" />
                <span>{showAccessInfo ? 'Hide' : 'Show'} Access Info</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(filteredEmployeeData).map(([field, value]) => (
                <div key={field} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="flex items-center space-x-1">
                      {isFieldVisible(field) ? (
                        <EyeIcon className="h-4 w-4 text-green-500" title="Visible" />
                      ) : (
                        <EyeSlashIcon className="h-4 w-4 text-red-500" title="Hidden" />
                      )}
                    </div>
                  </div>
                  
                  <div className={`px-4 py-3 border rounded-lg ${
                    isFieldVisible(field) 
                      ? 'bg-white border-gray-300 text-gray-900' 
                      : 'bg-gray-100 border-gray-200 text-gray-500'
                  }`}>
                    {getFieldValue(field)}
                  </div>

                  {showAccessInfo && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <div><strong>Access:</strong> {isFieldVisible(field) ? 'Granted' : 'Denied'}</div>
                      <div><strong>Reason:</strong> {getFieldAccessReason(field)}</div>
                      {getFieldAccessRule(field) && (
                        <div><strong>Rule:</strong> {getFieldAccessRule(field).description}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rules Summary */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CogIcon className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Active Rules Summary</h3>
          </div>
          
          <div className="space-y-3">
            {rules.filter(rule => rule.isActive).map(rule => (
              <div key={rule.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{rule.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span><strong>Role:</strong> {rule.role}</span>
                      <span><strong>Action:</strong> {rule.action}</span>
                      <span><strong>Field:</strong> {rule.field}</span>
                    </div>
                    {rule.conditions.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Conditions:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          {rule.conditions.map((condition, index) => (
                            <li key={index}>
                              {condition.key} {condition.operator} {condition.value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rule.role === selectedUser.role ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {rule.role === selectedUser.role ? 'Applicable' : 'Not Applicable'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 