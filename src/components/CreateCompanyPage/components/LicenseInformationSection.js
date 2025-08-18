import React from 'react';
import { licenseCategoryOptions, legalTypeOptions } from '../constants';

const LicenseInformationSection = ({ form, setForm }) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">License & Legal Information</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            License Category *
          </label>
          <select
            required
            value={form.licenseCategory}
            onChange={(e) => setForm(prev => ({ ...prev, licenseCategory: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="">Select License Category</option>
            {licenseCategoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Legal Type *
          </label>
          <select
            required
            value={form.legalType}
            onChange={(e) => setForm(prev => ({ ...prev, legalType: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="">Select Legal Type</option>
            {legalTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date *
          </label>
          <input
            type="date"
            required
            value={form.expiryDate}
            onChange={(e) => setForm(prev => ({ ...prev, expiryDate: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            D&B D-U-N-S Number
          </label>
          <input
            type="text"
            value={form.dunsNumber}
            onChange={(e) => setForm(prev => ({ ...prev, dunsNumber: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Enter D&B D-U-N-S Number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Register Number
          </label>
          <input
            type="text"
            value={form.registerNo}
            onChange={(e) => setForm(prev => ({ ...prev, registerNo: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Enter Register Number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Date
          </label>
          <input
            type="date"
            value={form.issueDate}
            onChange={(e) => setForm(prev => ({ ...prev, issueDate: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main License Number *
          </label>
          <input
            type="text"
            required
            value={form.mainLicenseNo}
            onChange={(e) => setForm(prev => ({ ...prev, mainLicenseNo: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Enter Main License Number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            DCCI Number
          </label>
          <input
            type="text"
            value={form.dcciNo}
            onChange={(e) => setForm(prev => ({ ...prev, dcciNo: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Enter DCCI Number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            TRN Number *
          </label>
          <input
            type="text"
            required
            value={form.trnNumber}
            onChange={(e) => setForm(prev => ({ ...prev, trnNumber: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Enter TRN Number"
          />
        </div>
      </div>
    </div>
  );
};

export default LicenseInformationSection;
