import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  LockClosedIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import PayrollAPI from '../../services/payrollAPI';
import PayrollLineItem from './PayrollLineItem';
import ApprovalWorkflow from './ApprovalWorkflow';
import { useAuth } from '../../contexts/AuthContext';

const PayrollRunDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role;
  const canManagePayroll = role === 'ADMIN' || role === 'HR';
  const basePath = location.pathname.startsWith('/employee/payroll') ? '/employee/payroll' : '/payroll';
  const [payrollRun, setPayrollRun] = useState(null);
  const [payrollLines, setPayrollLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentNotes, setAdjustmentNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadPayrollRun();
      loadPayrollLines();
    }
  }, [id]);

  const loadPayrollRun = async () => {
    try {
      const response = await PayrollAPI.getPayrollRun(id);
      if (response?.success && response?.data) {
        setPayrollRun(response.data);
      }
    } catch (error) {
      console.error('Error loading payroll run:', error);
      alert('Error loading payroll run: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPayrollLines = async () => {
    try {
      const response = await PayrollAPI.getPayrollLines(id);
      if (response?.success && response?.data) {
        setPayrollLines(Array.isArray(response.data) ? response.data : response.data.lines || []);
      }
    } catch (error) {
      console.error('Error loading payroll lines:', error);
    }
  };

  const handleAdjustment = (line) => {
    setSelectedLine(line);
    setAdjustmentAmount(0);
    setAdjustmentNotes('');
    setShowAdjustmentModal(true);
  };

  const handleSaveAdjustment = async () => {
    if (!selectedLine) return;

    try {
      await PayrollAPI.updatePayrollLine(id, selectedLine.id, {
        manualAdjustments: Number(adjustmentAmount),
        adjustmentNotes: adjustmentNotes,
      });
      setShowAdjustmentModal(false);
      loadPayrollLines();
      loadPayrollRun();
    } catch (error) {
      alert('Error saving adjustment: ' + error.message);
    }
  };

  const handleGeneratePayslip = async (employeeId) => {
    try {
      await PayrollAPI.generatePayslip(id, employeeId);
    } catch (error) {
      alert('Error generating payslip: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800 border-gray-300',
      HR_PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      HR_APPROVED: 'bg-blue-100 text-blue-800 border-blue-300',
      FINANCE_PENDING: 'bg-orange-100 text-orange-800 border-orange-300',
      FINANCE_APPROVED: 'bg-purple-100 text-purple-800 border-purple-300',
      FINAL_APPROVED: 'bg-green-100 text-green-800 border-green-300',
      LOCKED: 'bg-slate-100 text-slate-800 border-slate-300',
    };
    return colors[status] || colors.DRAFT;
  };

  const isLocked = payrollRun?.status === 'LOCKED';
  const canEditStatus =
    payrollRun?.status === 'DRAFT' ||
    payrollRun?.status === 'HR_APPROVED' ||
    payrollRun?.status === 'FINANCE_APPROVED';
  const canEdit = canEditStatus && canManagePayroll;

  const visiblePayrollLines =
    role === 'EMPLOYEE'
      ? payrollLines.filter((line) => {
          const empId = line.employeeId || line.employee?.id || line.snapshotEmployeeId;
          return empId === user?.id;
        })
      : payrollLines;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading payroll run...</p>
        </div>
      </div>
    );
  }

  if (!payrollRun) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-600">Payroll run not found</p>
          <button
            onClick={() => navigate(basePath)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Payroll List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(basePath)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
              </button>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <DocumentTextIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payroll Run Details</h1>
                <p className="text-gray-600 mt-1">
                  {formatDate(payrollRun.periodStart)} - {formatDate(payrollRun.periodEnd)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(payrollRun.status)}`}>
                {payrollRun.status.replace(/_/g, ' ')}
              </span>
              {(payrollRun.status === 'FINAL_APPROVED' || payrollRun.status === 'LOCKED') && (
                <button
                  onClick={() => PayrollAPI.generateRegister(id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  Download Register
                </button>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">Employees</p>
                  <p className="text-2xl font-bold text-blue-900">{payrollRun.totalEmployees || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-700 font-medium">Gross Salary</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(payrollRun.totalGross)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-700 font-medium">Total Deductions</p>
                  <p className="text-2xl font-bold text-red-900">{formatCurrency(payrollRun.totalDeductions)}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
              <div className="flex items-center gap-3">
                <CurrencyDollarIcon className="h-8 w-8 text-indigo-600" />
                <div>
                  <p className="text-sm text-indigo-700 font-medium">Net Salary</p>
                  <p className="text-2xl font-bold text-indigo-900">{formatCurrency(payrollRun.totalNet)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Workflow */}
        {canManagePayroll && payrollRun.status !== 'LOCKED' && (
          <ApprovalWorkflow
            payrollRun={payrollRun}
            onApprovalChange={loadPayrollRun}
          />
        )}

        {/* Payroll Lines Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Employee Payroll Lines</h2>
            <p className="text-sm text-gray-600 mt-1">
              {visiblePayrollLines.length} employee{visiblePayrollLines.length !== 1 ? 's' : ''} in this payroll run
            </p>
          </div>

          {visiblePayrollLines.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No payroll lines found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Gross</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Deductions</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Net</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visiblePayrollLines.map((line) => (
                    <PayrollLineItem
                      key={line.id}
                      line={line}
                      canEdit={canEdit && !isLocked}
                      onAdjustment={() => handleAdjustment(line)}
                      onGeneratePayslip={() => handleGeneratePayslip(line.employeeId)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Adjustment Modal */}
        {showAdjustmentModal && selectedLine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Manual Adjustment</h3>
                <button
                  onClick={() => setShowAdjustmentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee: {selectedLine.employee?.firstName} {selectedLine.employee?.lastName}
                  </label>
                  <p className="text-xs text-gray-500">Current Net: {formatCurrency(selectedLine.netSalary)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjustment Amount (AED)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Positive = addition, Negative = deduction
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={adjustmentNotes}
                    onChange={(e) => setAdjustmentNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Reason for adjustment..."
                  />
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowAdjustmentModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAdjustment}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                  >
                    Save Adjustment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollRunDetails;
