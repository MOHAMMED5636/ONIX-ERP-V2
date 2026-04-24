import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import PayrollAPI from '../../services/payrollAPI';

const CreatePayrollRun = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/employee/payroll') ? '/employee/payroll' : '/payroll';
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.periodMonth || formData.periodMonth < 1 || formData.periodMonth > 12) {
      newErrors.periodMonth = 'Please select a valid month';
    }
    
    if (!formData.periodYear || formData.periodYear < 2020 || formData.periodYear > 2100) {
      newErrors.periodYear = 'Please enter a valid year';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPeriodDates = (month, year) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setCreating(true);
      const dates = getPeriodDates(formData.periodMonth, formData.periodYear);
      
      const response = await PayrollAPI.createPayrollRun({
        periodStart: dates.start,
        periodEnd: dates.end,
        periodMonth: formData.periodMonth,
        periodYear: formData.periodYear,
      });

      if (response?.success) {
        alert('Payroll run created successfully!');
        navigate(`${basePath}/runs/${response.data.id}`);
      } else {
        alert('Error creating payroll run: ' + (response?.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Error creating payroll run: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  const dates = getPeriodDates(formData.periodMonth, formData.periodYear);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
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
              <h1 className="text-3xl font-bold text-gray-900">Create Payroll Run</h1>
              <p className="text-gray-600 mt-1">Generate payroll for a specific period</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Period Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payroll Period
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Month</label>
                  <select
                    value={formData.periodMonth}
                    onChange={(e) => handleChange('periodMonth', parseInt(e.target.value))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.periodMonth ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  {errors.periodMonth && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.periodMonth}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.periodYear}
                    onChange={(e) => handleChange('periodYear', parseInt(e.target.value))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.periodYear ? 'border-red-300' : 'border-gray-300'
                    }`}
                    min="2020"
                    max="2100"
                  />
                  {errors.periodYear && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.periodYear}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Period Preview */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-indigo-900">Payroll Period</p>
                  <p className="text-sm text-indigo-700">
                    {new Date(dates.start).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })} - {new Date(dates.end).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    <li>System will fetch all active employees</li>
                    <li>Calculate attendance summaries for the period</li>
                    <li>Calculate leave summaries</li>
                    <li>Apply deduction rules from settings</li>
                    <li>Generate payroll lines for each employee</li>
                    <li>Create a draft payroll run for review</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/payroll')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Payroll Run'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePayrollRun;
