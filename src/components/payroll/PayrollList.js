import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  LockClosedIcon,
  Cog6ToothIcon,
  PlusIcon,
  EyeIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import PayrollAPI from '../../services/payrollAPI';

const PayrollList = () => {
  const navigate = useNavigate();
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    year: new Date().getFullYear(),
    month: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadPayrollRuns();
  }, [filters, pagination.page]);

  const loadPayrollRuns = async () => {
    try {
      setLoading(true);
      const response = await PayrollAPI.getPayrollRuns({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      if (response?.success && response?.data) {
        setPayrollRuns(Array.isArray(response.data) ? response.data : response.data.payrollRuns || []);
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0,
          }));
        }
      } else {
        setPayrollRuns([]);
      }
    } catch (error) {
      console.error('Error loading payroll runs:', error);
      setPayrollRuns([]);
    } finally {
      setLoading(false);
    }
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

  const getStatusIcon = (status) => {
    if (status === 'LOCKED') return <LockClosedIcon className="h-4 w-4" />;
    if (status === 'FINAL_APPROVED') return <CheckCircleIcon className="h-4 w-4" />;
    return <ClockIcon className="h-4 w-4" />;
  };

  const formatStatus = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleViewDetails = (runId) => {
    navigate(`/payroll/runs/${runId}`);
  };

  const handleGenerateRegister = async (runId, e) => {
    e.stopPropagation();
    try {
      await PayrollAPI.generateRegister(runId);
    } catch (error) {
      alert('Error generating register: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <CurrencyDollarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
                <p className="text-gray-600 mt-1">Manage payroll runs, approvals, and reports</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/payroll/settings')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5" />
                Settings
              </button>
              <button
                onClick={() => navigate('/payroll/create')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <PlusIcon className="h-5 w-5" />
                New Payroll Run
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="HR_PENDING">HR Pending</option>
                <option value="HR_APPROVED">HR Approved</option>
                <option value="FINANCE_PENDING">Finance Pending</option>
                <option value="FINANCE_APPROVED">Finance Approved</option>
                <option value="FINAL_APPROVED">Final Approved</option>
                <option value="LOCKED">Locked</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search payroll runs..."
              />
            </div>
          </div>
        </div>

        {/* Payroll Runs List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading payroll runs...</p>
            </div>
          ) : payrollRuns.length === 0 ? (
            <div className="p-12 text-center">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No payroll runs found</p>
              <button
                onClick={() => navigate('/payroll/create')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create First Payroll Run
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employees</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Gross Salary</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Deductions</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Net Salary</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payrollRuns.map((run) => (
                      <tr
                        key={run.id}
                        onClick={() => handleViewDetails(run.id)}
                        className="hover:bg-indigo-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(run.periodStart)} - {formatDate(run.periodEnd)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {run.periodMonth}/{run.periodYear}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(run.status)}`}>
                            {getStatusIcon(run.status)}
                            {formatStatus(run.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <UserGroupIcon className="h-4 w-4 text-gray-400" />
                            {run.totalEmployees || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(run.totalGross)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                          {formatCurrency(run.totalDeductions)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                          {formatCurrency(run.totalNet)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(run.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleViewDetails(run.id)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100"
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            {(run.status === 'FINAL_APPROVED' || run.status === 'LOCKED') && (
                              <button
                                onClick={(e) => handleGenerateRegister(run.id, e)}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                                title="Download Register"
                              >
                                <DocumentArrowDownIcon className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollList;
