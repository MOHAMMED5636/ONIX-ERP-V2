import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cog6ToothIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import PayrollAPI from '../../services/payrollAPI';

const PayrollSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    gracePeriodMinutes: 15,
    lateDeductionPerMinute: 0.5,
    absenceDeductionType: 'DAILY',
    absenceDeductionValue: 1.0,
    unpaidLeaveDeductionType: 'DAILY',
    unpaidLeaveDeductionValue: 1.0,
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await PayrollAPI.getSettings();
      if (response?.success && response?.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      alert('Error loading settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
    setSuccessMessage('');
  };

  const validate = () => {
    const newErrors = {};
    
    if (!settings.gracePeriodMinutes || settings.gracePeriodMinutes < 0) {
      newErrors.gracePeriodMinutes = 'Grace period must be 0 or greater';
    }
    
    if (!settings.lateDeductionPerMinute || settings.lateDeductionPerMinute < 0) {
      newErrors.lateDeductionPerMinute = 'Late deduction per minute must be 0 or greater';
    }
    
    if (!settings.absenceDeductionValue || settings.absenceDeductionValue < 0) {
      newErrors.absenceDeductionValue = 'Absence deduction value must be 0 or greater';
    }
    
    if (settings.absenceDeductionType === 'PERCENTAGE' && settings.absenceDeductionValue > 100) {
      newErrors.absenceDeductionValue = 'Percentage cannot exceed 100%';
    }
    
    if (!settings.unpaidLeaveDeductionValue || settings.unpaidLeaveDeductionValue < 0) {
      newErrors.unpaidLeaveDeductionValue = 'Unpaid leave deduction value must be 0 or greater';
    }
    
    if (settings.unpaidLeaveDeductionType === 'PERCENTAGE' && settings.unpaidLeaveDeductionValue > 100) {
      newErrors.unpaidLeaveDeductionValue = 'Percentage cannot exceed 100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      const response = await PayrollAPI.updateSettings(settings);
      if (response?.success) {
        setSuccessMessage('Settings saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      alert('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/payroll')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
              </button>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Cog6ToothIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payroll Settings</h1>
                <p className="text-gray-600 mt-1">Configure deduction rules and payroll parameters</p>
              </div>
            </div>
          </div>

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          )}
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-8">
          {/* Late Deduction Settings */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Late Deduction Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  value={settings.gracePeriodMinutes}
                  onChange={(e) => handleChange('gracePeriodMinutes', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.gracePeriodMinutes ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="0"
                />
                {errors.gracePeriodMinutes && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {errors.gracePeriodMinutes}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Minutes before late deduction applies (e.g., 15 minutes grace period)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Late Deduction Per Minute (AED)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.lateDeductionPerMinute}
                  onChange={(e) => handleChange('lateDeductionPerMinute', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.lateDeductionPerMinute ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="0"
                />
                {errors.lateDeductionPerMinute && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {errors.lateDeductionPerMinute}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Amount deducted per minute of lateness (after grace period)
                </p>
              </div>
            </div>
          </div>

          {/* Absence Deduction Settings */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Absence Deduction Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deduction Type
                </label>
                <select
                  value={settings.absenceDeductionType}
                  onChange={(e) => handleChange('absenceDeductionType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="DAILY">Daily Rate</option>
                  <option value="PERCENTAGE">Percentage of Gross</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  How absence deductions are calculated
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deduction Value
                  {settings.absenceDeductionType === 'PERCENTAGE' ? ' (%)' : ' (Multiplier)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.absenceDeductionValue}
                  onChange={(e) => handleChange('absenceDeductionValue', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.absenceDeductionValue ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="0"
                  max={settings.absenceDeductionType === 'PERCENTAGE' ? 100 : undefined}
                />
                {errors.absenceDeductionValue && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {errors.absenceDeductionValue}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {settings.absenceDeductionType === 'PERCENTAGE'
                    ? 'Percentage of gross salary deducted per absent day'
                    : 'Multiplier for daily rate (1.0 = full daily rate)'}
                </p>
              </div>
            </div>
          </div>

          {/* Unpaid Leave Deduction Settings */}
          <div className="pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Unpaid Leave Deduction Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deduction Type
                </label>
                <select
                  value={settings.unpaidLeaveDeductionType}
                  onChange={(e) => handleChange('unpaidLeaveDeductionType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="DAILY">Daily Rate</option>
                  <option value="PERCENTAGE">Percentage of Gross</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  How unpaid leave deductions are calculated
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deduction Value
                  {settings.unpaidLeaveDeductionType === 'PERCENTAGE' ? ' (%)' : ' (Multiplier)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.unpaidLeaveDeductionValue}
                  onChange={(e) => handleChange('unpaidLeaveDeductionValue', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.unpaidLeaveDeductionValue ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="0"
                  max={settings.unpaidLeaveDeductionType === 'PERCENTAGE' ? 100 : undefined}
                />
                {errors.unpaidLeaveDeductionValue && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {errors.unpaidLeaveDeductionValue}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {settings.unpaidLeaveDeductionType === 'PERCENTAGE'
                    ? 'Percentage of gross salary deducted per unpaid leave day'
                    : 'Multiplier for daily rate (1.0 = full daily rate)'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/payroll')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollSettings;
