import React, { useEffect, useMemo, useState } from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import salaryAPI from '../../services/salaryAPI';
import payrollSelfAPI from '../../services/payrollSelfAPI';

function safeNum(n) {
  const v = n == null ? 0 : Number(n);
  return Number.isFinite(v) ? v : 0;
}

function safeMoneyText(v) {
  const n = v == null ? null : Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : '—';
}

function parseTotalFinalSalary(latest) {
  const raw = latest?.notes;
  if (raw == null) return null;
  const n = Number(String(raw).trim());
  return Number.isFinite(n) ? n : null;
}

function toMonthLabel(periodMonth, periodYear) {
  const m = Number(periodMonth);
  const y = Number(periodYear);
  if (!Number.isFinite(m) || !Number.isFinite(y)) return 'N/A';
  const date = new Date(Date.UTC(y, m - 1, 1, 12, 0, 0));
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function SelfServiceSalary({ title = 'My Salary' }) {
  const { user } = useAuth();

  const [salaryDetails, setSalaryDetails] = useState(null);
  const [payslipLines, setPayslipLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const latest = salaryDetails?.latest || null;

  const monthOptions = useMemo(() => {
    const list = (payslipLines || [])
      .map((l) => l.payrollRun)
      .filter(Boolean)
      .map((run) => ({
        runId: run.id,
        periodMonth: run.periodMonth,
        periodYear: run.periodYear,
        status: run.status,
      }));

    // Deduplicate by runId
    const byRunId = new Map();
    for (const x of list) byRunId.set(x.runId, x);

    const deduped = Array.from(byRunId.values());
    deduped.sort((a, b) => (b.periodYear - a.periodYear) || (b.periodMonth - a.periodMonth));
    return deduped;
  }, [payslipLines]);

  const [selectedRunId, setSelectedRunId] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError('');
      try {
        const [salaryResp, payrollResp] = await Promise.all([
          salaryAPI.getSelfSalaryDetails(),
          payrollSelfAPI.getSelfPayslips(),
        ]);

        if (!mounted) return;
        setSalaryDetails(salaryResp?.data || null);
        setPayslipLines(payrollResp?.data?.lines || []);
      } catch (e) {
        console.error('SelfServiceSalary load error:', e);
        if (!mounted) return;
        setSalaryDetails(null);
        setPayslipLines([]);
        setError(e?.message || 'Failed to load salary details');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (selectedRunId) return;
    if (monthOptions.length > 0) setSelectedRunId(monthOptions[0].runId);
  }, [monthOptions, selectedRunId]);

  const selectedLine = useMemo(() => {
    if (!selectedRunId) return null;
    return (payslipLines || []).find((l) => l.payrollRun?.id === selectedRunId) || null;
  }, [payslipLines, selectedRunId]);

  const selectedPeriodLabel = useMemo(() => {
    const run = monthOptions.find((m) => m.runId === selectedRunId);
    if (!run) return 'N/A';
    return toMonthLabel(run.periodMonth, run.periodYear);
  }, [monthOptions, selectedRunId]);

  const contractBasic = safeNum(latest?.basicSalary);
  const contractAllowances = (latest?.allowances || []).reduce((sum, a) => sum + safeNum(a.amount), 0);
  const contractTotal = contractBasic + contractAllowances;
  const perHourRate = safeNum(latest?.perHourRate);
  const contractSalaryAmount = latest?.contractSalaryAmount ?? null;
  const totalFinalSalary = parseTotalFinalSalary(latest);

  const selectedAllowances = safeNum(selectedLine?.snapshotTotalAllowances);
  const selectedDeductions = safeNum(selectedLine?.totalDeductions);
  const selectedNet = safeNum(selectedLine?.netSalary);
  const selectedGross = safeNum(selectedLine?.grossSalary);

  const leaveDeduction = safeNum(selectedLine?.absenceDeduction);
  const unpaidLeaveDeduction = safeNum(selectedLine?.unpaidLeaveDeduction);
  const lateDeduction = safeNum(selectedLine?.lateDeduction);
  const manualAdjustments = safeNum(selectedLine?.manualAdjustments);

  const handleDownloadPayslip = async () => {
    if (!selectedRunId || !user?.id) return;
    try {
      await payrollSelfAPI.downloadPayslip(selectedRunId, user.id);
    } catch (e) {
      alert('Error downloading payslip: ' + (e?.message || e));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <p className="mt-4 text-gray-600">Loading salary details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-1">Read-only salary breakdown and payslip download</p>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={selectedRunId}
                  onChange={(e) => setSelectedRunId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  disabled={monthOptions.length === 0}
                >
                  {monthOptions.length === 0 ? <option value="">No finalized payroll</option> : null}
                  {monthOptions.map((m) => (
                    <option key={m.runId} value={m.runId}>
                      {toMonthLabel(m.periodMonth, m.periodYear)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleDownloadPayslip}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-50"
                disabled={!selectedRunId}
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                Download Payslip
              </button>
            </div>
          </div>

          {error ? <div className="mt-4 text-red-600 text-sm">{error}</div> : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contract Salary</h2>

            {latest ? (
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between gap-3">
                  <span>Effective From</span>
                  <span className="font-semibold text-gray-900">
                    {latest.effectiveFrom ? new Date(latest.effectiveFrom).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Basic Salary</span>
                  <span className="font-semibold text-gray-900">{contractBasic.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Allowances Total</span>
                  <span className="font-semibold text-gray-900">{contractAllowances.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-3 pt-2 border-t border-gray-100">
                  <span className="font-semibold">Total Contract Salary</span>
                  <span className="font-bold text-indigo-700">{contractTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Per Hour Rate</span>
                  <span className="font-semibold text-gray-900">{perHourRate ? perHourRate.toFixed(2) : '—'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Contract Salary Amount</span>
                  <span className="font-semibold text-gray-900">{safeMoneyText(contractSalaryAmount)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Total Final Salary</span>
                  <span className="font-semibold text-gray-900">
                    {totalFinalSalary != null ? totalFinalSalary.toFixed(2) : '—'}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Increment History</h3>
                  {Array.isArray(latest.increments) && latest.increments.length > 0 ? (
                    <div className="space-y-2">
                      {latest.increments
                        .slice()
                        .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate))
                        .map((inc) => (
                          <div key={inc.id} className="flex justify-between gap-3 text-sm">
                            <span className="text-gray-700">
                              {inc.effectiveDate ? new Date(inc.effectiveDate).toLocaleDateString() : '—'}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {inc.amount != null ? safeNum(inc.amount).toFixed(2) : '0.00'}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm">No increments recorded.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-600 text-sm">No salary configuration found.</div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Monthly Breakdown</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-sm font-semibold text-indigo-800">Allowances</p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">{selectedAllowances.toFixed(2)}</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <p className="text-sm font-semibold text-rose-800">Deductions</p>
                <p className="text-2xl font-bold text-rose-900 mt-1">{selectedDeductions.toFixed(2)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 sm:col-span-2">
                <p className="text-sm font-semibold text-slate-800">Net Salary ({selectedPeriodLabel})</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{selectedNet.toFixed(2)} AED</p>
              </div>
            </div>

            {!selectedLine ? (
              <div className="mt-4 text-gray-600 text-sm">No finalized payroll for this user.</div>
            ) : (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Deductions (Details)</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between gap-3">
                      <span>Leave</span>
                      <span className="font-semibold text-red-600">{leaveDeduction.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Unpaid Leave</span>
                      <span className="font-semibold text-red-600">{unpaidLeaveDeduction.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Late Penalties</span>
                      <span className="font-semibold text-red-600">{lateDeduction.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Other/Manual</span>
                      <span className="font-semibold text-red-600">{manualAdjustments.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 md:col-span-2">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Salary Snapshot</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="text-sm text-gray-700">
                      <div className="flex justify-between gap-3">
                        <span>Basic</span>
                        <span className="font-semibold text-gray-900">{safeNum(selectedLine?.snapshotBasicSalary).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-3 mt-2">
                        <span>Gross</span>
                        <span className="font-semibold text-gray-900">{selectedGross.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="flex justify-between gap-3">
                        <span>Total Allowances</span>
                        <span className="font-semibold text-gray-900">{selectedAllowances.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-3 mt-2">
                        <span>Total Deductions</span>
                        <span className="font-semibold text-gray-900">{selectedDeductions.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    Status:{' '}
                    <span className="font-semibold text-gray-700">
                      {selectedLine?.payrollRun?.status?.replace(/_/g, ' ') || '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

