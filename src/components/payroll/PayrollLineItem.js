import React, { useState } from 'react';
import {
  UserIcon,
  CurrencyDollarIcon,
  PencilIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const PayrollLineItem = ({ line, canEdit, onAdjustment, onGeneratePayslip }) => {
  const [expanded, setExpanded] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const employeeName = line.employee
    ? `${line.employee.firstName || ''} ${line.employee.lastName || ''}`.trim() || line.employee.email
    : line.snapshotEmployeeId || 'Unknown Employee';

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {expanded ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-600" />
              )}
            </button>
            <UserIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{employeeName}</p>
              <p className="text-xs text-gray-500">{line.snapshotEmployeeId || '—'}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
          {formatCurrency(line.grossSalary)}
        </td>
        <td className="px-6 py-4 text-sm font-semibold text-red-600">
          {formatCurrency(line.totalDeductions)}
        </td>
        <td className="px-6 py-4 text-sm font-bold text-green-600">
          {formatCurrency(line.netSalary)}
        </td>
        <td className="px-6 py-4">
          <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
            Calculated
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={onAdjustment}
                className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                title="Add Adjustment"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onGeneratePayslip}
              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
              title="Generate Payslip"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
      
      {/* Expanded Details */}
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan="6" className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Salary Breakdown */}
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Salary</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Basic:</span>
                    <span className="font-medium">{formatCurrency(line.snapshotBasicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Allowances:</span>
                    <span className="font-medium">{formatCurrency(line.snapshotTotalAllowances)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-300">
                    <span className="font-semibold text-gray-900">Gross:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(line.grossSalary)}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Summary */}
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Attendance</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Working Days:</span>
                    <span className="font-medium">{line.totalWorkingDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Absent Days:</span>
                    <span className="font-medium text-red-600">{line.totalAbsentDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Late Instances:</span>
                    <span className="font-medium text-orange-600">{line.totalLateInstances}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Late Minutes:</span>
                    <span className="font-medium text-orange-600">{line.totalLateMinutes}</span>
                  </div>
                </div>
              </div>

              {/* Leave Summary */}
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Leaves</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid Leave:</span>
                    <span className="font-medium text-green-600">{line.paidLeaveDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unpaid Leave:</span>
                    <span className="font-medium text-red-600">{line.unpaidLeaveDays} days</span>
                  </div>
                </div>
              </div>

              {/* Deduction Breakdown */}
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Deductions</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Absence:</span>
                    <span className="font-medium text-red-600">{formatCurrency(line.absenceDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Late:</span>
                    <span className="font-medium text-red-600">{formatCurrency(line.lateDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unpaid Leave:</span>
                    <span className="font-medium text-red-600">{formatCurrency(line.unpaidLeaveDeduction)}</span>
                  </div>
                  {line.manualAdjustments !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Adjustments:</span>
                      <span className={`font-medium ${line.manualAdjustments > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(line.manualAdjustments)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-gray-300">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-red-600">{formatCurrency(line.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {line.adjustmentNotes && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-xs font-semibold text-gray-700 uppercase mb-1">Adjustment Notes</p>
                <p className="text-sm text-gray-600">{line.adjustmentNotes}</p>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
};

export default PayrollLineItem;
