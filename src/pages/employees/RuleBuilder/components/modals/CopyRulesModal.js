import React from 'react';
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { MOCK_EMPLOYEES, MOCK_EMPLOYEE_RULES } from '../../constants';
import { getActionColor, getRoleColor } from '../../utils';

const CopyRulesModal = ({
  showModal,
  setShowModal,
  employees,
  selectedSourceEmployee,
  setSelectedSourceEmployee,
  sourceEmployeeRules,
  isLoadingEmployees,
  isLoadingRules,
  isCopyingRules,
  onEmployeeSelect,
  onCopyRules
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Copy Rules from Employee</h3>
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedSourceEmployee(null);
              }}
              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Employee Selection */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Select Source Employee</h4>
              
              {isLoadingEmployees ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading employees...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => onEmployeeSelect(employee.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        selectedSourceEmployee?.id === employee.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-gray-900">{employee.name}</h5>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                          <p className="text-xs text-gray-500">{employee.department} • {employee.jobTitle}</p>
                        </div>
                        {selectedSourceEmployee?.id === employee.id && (
                          <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rules Preview */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Rules to Copy
                {selectedSourceEmployee && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    from {selectedSourceEmployee.name}
                  </span>
                )}
              </h4>
              
              {!selectedSourceEmployee ? (
                <div className="text-center py-12">
                  <ShieldCheckIcon className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-lg font-bold text-gray-900">Select an employee</h3>
                  <p className="mt-2 text-gray-600 max-w-md mx-auto">
                    Choose an employee from the list to view their rules and copy them.
                  </p>
                </div>
              ) : isLoadingRules ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading rules...</p>
                </div>
              ) : sourceEmployeeRules.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-white/50 rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200/50">
                      <thead className="bg-gradient-to-r from-indigo-100/50 via-purple-100/50 to-pink-100/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rule</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Field</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
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
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/50 flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedSourceEmployee(null);
              }}
              className="px-6 py-3 text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl hover:bg-white hover:border-gray-300 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Cancel
            </button>
            <button
              onClick={onCopyRules}
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
                  <svg className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="relative z-10">Copy Rules</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyRulesModal;


