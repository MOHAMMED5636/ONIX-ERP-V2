import React, { useState, useEffect } from 'react';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../contexts/AuthContext';
import { updatePreferences as updatePreferencesAPI } from '../services/authAPI';

const CONFIRM_MESSAGE = 'Changing currency or measurement units will recalculate all contract and project values.';

export default function CustomizationPreferencesSection() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { preferences, options, loading, error, refreshPreferences } = usePreferences();

  const [form, setForm] = useState({
    defaultCurrency: 'AED',
    lengthUnit: 'meter',
    areaUnit: 'sqm',
    volumeUnit: 'm3',
    heightUnit: 'meter',
    weightUnit: 'kg',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (preferences) {
      setForm({
        defaultCurrency: preferences.defaultCurrency || 'AED',
        lengthUnit: preferences.lengthUnit || 'meter',
        areaUnit: preferences.areaUnit || 'sqm',
        volumeUnit: preferences.volumeUnit || 'm3',
        heightUnit: preferences.heightUnit || 'meter',
        weightUnit: preferences.weightUnit || 'kg',
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    setShowConfirmModal(false);
    setSaving(true);
    setSaveError(null);
    try {
      await updatePreferencesAPI(form);
      await refreshPreferences();
    } catch (err) {
      setSaveError(err.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Customization & Preferences</h2>
      <p className="text-sm text-gray-600 mb-6">
        Currency and measurement units applied app-wide (projects, buildings, contracts, BOQ, reports). Values are stored in base units; conversion is used for display and calculations.
      </p>
      {!isAdmin && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
          Only Admin can edit these settings. You have read-only access.
        </p>
      )}
      {loading && (
        <div className="flex items-center gap-2 text-gray-600 mb-6">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
          Loading preferences...
        </div>
      )}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          {error}
        </div>
      )}
      {saveError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          {saveError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={form.defaultCurrency}
            onChange={(e) => setForm((prev) => ({ ...prev, defaultCurrency: e.target.value }))}
            disabled={!isAdmin}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {(options.currencies || ['AED', 'USD', 'EUR', 'INR', 'SAR']).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
          <select
            value={form.lengthUnit}
            onChange={(e) => setForm((prev) => ({ ...prev, lengthUnit: e.target.value }))}
            disabled={!isAdmin}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="meter">Meter (m)</option>
            <option value="feet">Feet (ft)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
          <select
            value={form.areaUnit}
            onChange={(e) => setForm((prev) => ({ ...prev, areaUnit: e.target.value }))}
            disabled={!isAdmin}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="sqm">Square meter (sqm)</option>
            <option value="sqft">Square feet (sqft)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
          <select
            value={form.volumeUnit}
            onChange={(e) => setForm((prev) => ({ ...prev, volumeUnit: e.target.value }))}
            disabled={!isAdmin}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="m3">Cubic meter (m³)</option>
            <option value="ft3">Cubic feet (ft³)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
          <select
            value={form.heightUnit}
            onChange={(e) => setForm((prev) => ({ ...prev, heightUnit: e.target.value }))}
            disabled={!isAdmin}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="meter">Meter</option>
            <option value="feet">Feet</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight (optional)</label>
          <select
            value={form.weightUnit}
            onChange={(e) => setForm((prev) => ({ ...prev, weightUnit: e.target.value }))}
            disabled={!isAdmin}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="kg">kg</option>
            <option value="ton">ton</option>
          </select>
        </div>
      </div>
      {isAdmin && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={loading || saving}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}

      {/* Confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirm change</h3>
            <p className="text-gray-600 mb-6">{CONFIRM_MESSAGE}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
