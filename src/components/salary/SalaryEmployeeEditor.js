import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as EmployeeAPI from '../../services/employeeAPI';
import salaryAPI from '../../services/salaryAPI';

const ALLOWANCE_TYPES = ['HRA', 'TRAVEL', 'BONUS', 'OTHER'];
const DEDUCTION_TYPES = ['LEAVE', 'LATE_PENALTY', 'LOAN', 'OTHER_MANUAL'];
const DEDUCTION_MODES = ['FIXED', 'PER_DAY', 'PER_MINUTE', 'PERCENTAGE'];
const INCREMENT_TYPES = ['MONTHLY', 'YEARLY', 'MANUAL', 'OTHER'];

function parseYmdToDateInput(value) {
  if (!value) return '';
  // Backend returns Date objects serialized as ISO strings
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function formatCurrencyInput(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return String(value);
  return value;
}

export default function SalaryEmployeeEditor({ initialTab = 'base' }) {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const queryEmployeeId = searchParams.get('employeeId');

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(queryEmployeeId || '');

  const [structures, setStructures] = useState([]);
  const [structuresLoading, setStructuresLoading] = useState(false);

  const [selectedMode, setSelectedMode] = useState('existing'); // 'existing' | 'new'
  const [selectedStructureId, setSelectedStructureId] = useState('');

  const selectedStructure = useMemo(() => {
    if (!selectedStructureId) return null;
    return structures.find((s) => s.id === selectedStructureId) || null;
  }, [selectedStructureId, structures]);

  const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => setActiveTab(initialTab), [initialTab]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    effectiveFrom: '',
    basicSalary: '',
    perHourRate: '',
    contractSalaryAmount: '',
    notes: '',
    allowances: [],
    deductions: [],
    increments: [],
  });

  useEffect(() => {
    let mounted = true;
    const loadEmployees = async () => {
      setEmployeesLoading(true);
      try {
        const response = await EmployeeAPI.getEmployees({ limit: 200, page: 1 });
        if (!mounted) return;
        setEmployees(response?.data || []);
      } finally {
        if (mounted) setEmployeesLoading(false);
      }
    };
    loadEmployees();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) return;
    loadStructures(selectedEmployeeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeId]);

  const loadStructures = async (employeeId) => {
    setStructuresLoading(true);
    try {
      const response = await salaryAPI.getEmployeeStructures(employeeId);
      let structs = response?.data?.structures;
      if ((!structs || structs.length === 0) && response?.data?.latest) {
        structs = [response.data.latest];
      }
      if (!Array.isArray(structs)) structs = [];
      setStructures(structs);
      // Default selection to latest if exists
      if (Array.isArray(structs) && structs.length > 0) {
        setSelectedMode('existing');
        setSelectedStructureId(structs[0].id);
      } else {
        setSelectedMode('new');
        setSelectedStructureId('');
      }
    } catch (e) {
      console.error('loadStructures error:', e);
      setStructures([]);
      setSelectedMode('new');
      setSelectedStructureId('');
    } finally {
      setStructuresLoading(false);
    }
  };

  // Populate editor form from selected structure (or reset for "new")
  useEffect(() => {
    if (selectedMode === 'new' || !selectedStructure) {
      setForm({
        effectiveFrom: '',
        basicSalary: '',
        perHourRate: '',
        contractSalaryAmount: '',
        notes: '',
        allowances: [],
        deductions: [],
        increments: [],
      });
      return;
    }

    setForm({
      effectiveFrom: parseYmdToDateInput(selectedStructure.effectiveFrom),
      basicSalary: formatCurrencyInput(selectedStructure.basicSalary),
      perHourRate: formatCurrencyInput(selectedStructure.perHourRate),
      contractSalaryAmount: formatCurrencyInput(selectedStructure.contractSalaryAmount),
      notes: selectedStructure.notes || '',
      allowances: (selectedStructure.allowances || []).map((a) => ({
        id: a.id,
        allowanceType: a.allowanceType,
        amount: a.amount != null ? String(a.amount) : '',
        notes: a.notes || '',
      })),
      deductions: (selectedStructure.deductions || []).map((d) => ({
        id: d.id,
        deductionType: d.deductionType,
        mode: d.mode,
        value: d.value != null ? String(d.value) : '',
        notes: d.notes || '',
      })),
      increments: (selectedStructure.increments || []).map((i) => ({
        id: i.id,
        effectiveDate: parseYmdToDateInput(i.effectiveDate),
        incrementType: i.incrementType,
        amount: i.amount != null ? String(i.amount) : '',
        note: i.note || '',
      })),
    });
  }, [selectedMode, selectedStructure]);

  const setField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      // Per-hour calculator: monthly Total Final Salary → hourly rate.
      // Rule: assume 30 days/month and 8 working hours/day => hourly = total / (30 * 8).
      // We store Total Final Salary in `notes` to avoid backend schema changes.
      if (key === 'notes') {
        const raw = String(value ?? '').trim();
        const total = raw ? Number(raw) : NaN;
        if (Number.isFinite(total) && total > 0) {
          const hourly = total / (30 * 8);
          next.perHourRate = String(Math.round(hourly * 100) / 100);
        }
      }

      return next;
    });
    setMessage('');
  };

  const handleAllowanceChange = (idx, key, value) => {
    setForm((prev) => ({
      ...prev,
      allowances: prev.allowances.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    }));
  };
  const handleDeductionChange = (idx, key, value) => {
    setForm((prev) => ({
      ...prev,
      deductions: prev.deductions.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    }));
  };
  const handleIncrementChange = (idx, key, value) => {
    setForm((prev) => ({
      ...prev,
      increments: prev.increments.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    }));
  };

  const addAllowanceRow = () => {
    setForm((prev) => ({
      ...prev,
      allowances: [
        ...prev.allowances,
        { allowanceType: 'HRA', amount: '', notes: '' },
      ],
    }));
  };
  const addDeductionRow = () => {
    setForm((prev) => ({
      ...prev,
      deductions: [
        ...prev.deductions,
        { deductionType: 'LEAVE', mode: 'FIXED', value: '', notes: '' },
      ],
    }));
  };
  const addIncrementRow = () => {
    setForm((prev) => ({
      ...prev,
      increments: [
        ...prev.increments,
        { effectiveDate: '', incrementType: 'MONTHLY', amount: '', note: '' },
      ],
    }));
  };

  const removeAllowanceRow = (idx) => setForm((prev) => ({ ...prev, allowances: prev.allowances.filter((_, i) => i !== idx) }));
  const removeDeductionRow = (idx) => setForm((prev) => ({ ...prev, deductions: prev.deductions.filter((_, i) => i !== idx) }));
  const removeIncrementRow = (idx) => setForm((prev) => ({ ...prev, increments: prev.increments.filter((_, i) => i !== idx) }));

  const toNumberOrNull = (v) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const buildPayload = () => {
    return {
      effectiveFrom: form.effectiveFrom || null,
      basicSalary: toNumberOrNull(form.basicSalary),
      perHourRate: toNumberOrNull(form.perHourRate),
      contractSalaryAmount: toNumberOrNull(form.contractSalaryAmount),
      notes: form.notes || null,
      allowances: (form.allowances || []).map((a) => ({
        allowanceType: a.allowanceType,
        amount: toNumberOrNull(a.amount),
        notes: a.notes || null,
      })),
      deductions: (form.deductions || []).map((d) => ({
        deductionType: d.deductionType,
        mode: d.mode,
        value: toNumberOrNull(d.value),
        notes: d.notes || null,
      })),
      increments: (form.increments || []).map((i) => ({
        effectiveDate: i.effectiveDate,
        incrementType: i.incrementType,
        amount: toNumberOrNull(i.amount),
        note: i.note || null,
      })),
    };
  };

  const handleSave = async () => {
    setMessage('');
    if (!selectedEmployeeId) {
      setMessage('Please select an employee.');
      return;
    }
    if (!form.effectiveFrom) {
      setMessage('effectiveFrom is required.');
      return;
    }

    const payload = buildPayload();

    try {
      setSaving(true);
      let response;
      if (selectedMode === 'new') {
        response = await salaryAPI.createSalaryStructure(selectedEmployeeId, payload);
      } else {
        response = await salaryAPI.updateSalaryStructure(selectedEmployeeId, selectedStructureId, payload);
      }

      if (response?.success) {
        setMessage('Saved successfully.');
        await loadStructures(selectedEmployeeId);
      } else {
        setMessage(response?.message || 'Failed to save.');
      }
    } catch (e) {
      console.error('saveSalaryStructure error:', e);
      setMessage(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const employeeLabel = (emp) => `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.email || emp.employeeId || emp.id;
  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId) || null,
    [employees, selectedEmployeeId],
  );

  // When creating a NEW structure, default Effective From to the employee's Joining Date.
  useEffect(() => {
    if (selectedMode !== 'new') return;
    if (!selectedEmployee) return;
    if (form.effectiveFrom) return;
    const joining = selectedEmployee.joiningDate;
    const ymd = parseYmdToDateInput(joining);
    if (ymd) setForm((prev) => ({ ...prev, effectiveFrom: ymd }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMode, selectedEmployeeId, selectedEmployee]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Salary Setup</h1>
              <p className="text-gray-600 mt-1">Create and maintain employee salary structures</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving || employeesLoading || structuresLoading}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          {message && <div className="mt-4 text-sm text-gray-700">{message}</div>}
        </div>

        {/* Employee + Structure selector */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  setSelectedMode('existing');
                  setSelectedStructureId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled={employeesLoading}
              >
                <option value="">{employeesLoading ? 'Loading...' : 'Select employee'}</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {employeeLabel(emp)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Structure</label>
              <select
                value={selectedMode === 'existing' ? selectedStructureId : 'new'}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setSelectedMode('new');
                    setSelectedStructureId('');
                  } else {
                    setSelectedMode('existing');
                    setSelectedStructureId(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled={!selectedEmployeeId || structuresLoading}
              >
                {selectedMode === 'existing' && structures.length > 0 && (
                  <option value="">{'Select structure'}</option>
                )}
                {structures
                  .slice()
                  .sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {parseYmdToDateInput(s.effectiveFrom)} - {s.basicSalary ?? '—'}
                    </option>
                  ))}
                <option value="new">Create new structure</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Active Section</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'base', label: 'Base' },
                  { key: 'allowances', label: 'Allowances' },
                  { key: 'deductions', label: 'Deductions' },
                  { key: 'increments', label: 'Increments' },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      activeTab === t.key ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Editor sections */}
        {!selectedEmployeeId ? (
          <div className="text-center text-gray-600">Select an employee to begin.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {activeTab === 'base' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Base Salary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Effective From</label>
                    <input
                      type="date"
                      value={form.effectiveFrom}
                      onChange={(e) => setField('effectiveFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary (AED)</label>
                    <input
                      type="number"
                      value={form.basicSalary}
                      onChange={(e) => setField('basicSalary', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Per Hour Rate (AED)</label>
                    <input
                      type="number"
                      value={form.perHourRate}
                      onChange={(e) => setField('perHourRate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contract Salary Amount (AED)</label>
                    <input
                      type="number"
                      value={form.contractSalaryAmount}
                      onChange={(e) => setField('contractSalaryAmount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Final Salary</label>
                    <input
                      type="number"
                      value={form.notes}
                      onChange={(e) => setField('notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g. 5000"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'allowances' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Allowances</h2>
                  <button type="button" onClick={addAllowanceRow} className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100">
                    + Add
                  </button>
                </div>
                {form.allowances.length === 0 ? (
                  <div className="text-sm text-gray-600">No allowances yet.</div>
                ) : (
                  <div className="space-y-3">
                    {form.allowances.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={row.allowanceType}
                            onChange={(e) => handleAllowanceChange(idx, 'allowanceType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            {ALLOWANCE_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Amount (AED)</label>
                          <input
                            type="number"
                            value={row.amount}
                            onChange={(e) => handleAllowanceChange(idx, 'amount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            step="0.01"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                            <input
                              type="text"
                              value={row.notes}
                              onChange={(e) => handleAllowanceChange(idx, 'notes', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAllowanceRow(idx)}
                            className="px-3 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'deductions' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Deductions</h2>
                  <button type="button" onClick={addDeductionRow} className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100">
                    + Add
                  </button>
                </div>
                {form.deductions.length === 0 ? (
                  <div className="text-sm text-gray-600">No deductions yet.</div>
                ) : (
                  <div className="space-y-3">
                    {form.deductions.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Deduction Type</label>
                          <select
                            value={row.deductionType}
                            onChange={(e) => handleDeductionChange(idx, 'deductionType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            {DEDUCTION_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Mode</label>
                          <select
                            value={row.mode}
                            onChange={(e) => handleDeductionChange(idx, 'mode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            {DEDUCTION_MODES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
                          <input
                            type="number"
                            value={row.value}
                            onChange={(e) => handleDeductionChange(idx, 'value', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            step="0.01"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                            <input
                              type="text"
                              value={row.notes}
                              onChange={(e) => handleDeductionChange(idx, 'notes', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDeductionRow(idx)}
                            className="px-3 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'increments' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Increments</h2>
                  <button type="button" onClick={addIncrementRow} className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100">
                    + Add
                  </button>
                </div>
                {form.increments.length === 0 ? (
                  <div className="text-sm text-gray-600">No increments yet.</div>
                ) : (
                  <div className="space-y-3">
                    {form.increments.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Effective Date</label>
                          <input
                            type="date"
                            value={row.effectiveDate}
                            onChange={(e) => handleIncrementChange(idx, 'effectiveDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Increment Type</label>
                          <select
                            value={row.incrementType}
                            onChange={(e) => handleIncrementChange(idx, 'incrementType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            {INCREMENT_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                          <input
                            type="number"
                            value={row.amount}
                            onChange={(e) => handleIncrementChange(idx, 'amount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            step="0.01"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
                            <input
                              type="text"
                              value={row.note}
                              onChange={(e) => handleIncrementChange(idx, 'note', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeIncrementRow(idx)}
                            className="px-3 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

