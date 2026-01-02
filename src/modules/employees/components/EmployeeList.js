import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  Cog6ToothIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { filterEmployees, getStatusColor, getStatusIcon } from '../utils';

const EmployeeList = ({ 
  employees, 
  onViewEmployee, 
  onEditEmployee, 
  onDeleteEmployee, 
  onAddEmployee,
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  onRuleButton,
  onHistoryButton,
  onPayrollButton,
  canCreateEmployee = true  // Show button by default, can be controlled by parent
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const filteredEmployees = filterEmployees(employees, searchTerm, filters);

  const handleDelete = (employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      onDeleteEmployee(employee.id);
    }
  };

  const clearFilters = () => {
    setFilters({ department: '' });
    setSearchTerm('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = '/employees/rule-builder'}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              title="Rule Builder"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              Rules
            </button>
            <button
              onClick={() => window.open('#', '_blank')}
              className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              title="Import/Export"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Import/Export
            </button>
            {canCreateEmployee && (
              <button
                onClick={onAddEmployee}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Add Employee
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>
            
            {(searchTerm || filters.department) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  <option value="HR">HR</option>
                  <option value="IT">IT</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {employee.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">ID: {employee.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.jobTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {getStatusIcon(employee.status)} {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.email}</div>
                    <div className="text-sm text-gray-500">{employee.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewEmployee(employee)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditEmployee(employee)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {onRuleButton && (
                        <button
                          onClick={() => onRuleButton(employee)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                          title="Rules"
                        >
                          <Cog6ToothIcon className="h-4 w-4" />
                        </button>
                      )}
                      {onHistoryButton && (
                        <button
                          onClick={() => onHistoryButton(employee)}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                          title="History"
                        >
                          <ClockIcon className="h-4 w-4" />
                        </button>
                      )}
                      {onPayrollButton && (
                        <button
                          onClick={() => onPayrollButton(employee)}
                          className="text-emerald-600 hover:text-emerald-900 p-1 rounded hover:bg-emerald-50"
                          title="Payroll"
                        >
                          <CurrencyDollarIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(employee)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p className="mt-2 text-sm font-medium">No employees found</p>
                    <p className="mt-1 text-sm text-gray-400">
                      {searchTerm || filters.department ? 'Try adjusting your search or filters.' : 'Get started by adding your first employee.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {filteredEmployees.length} of {employees.length} employees
          </span>
          <span>
            {searchTerm && `Search results for "${searchTerm}"`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;

