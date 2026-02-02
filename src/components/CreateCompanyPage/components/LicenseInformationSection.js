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
            title="Select the type of business license category (e.g., Commercial, Industrial, Professional, Trading, Construction, Consulting)"
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
            title="Select the legal structure of your company (e.g., LLC, Corporation, Partnership, Sole Proprietorship, Branch, Representative Office)"
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
            title="Enter the expiration date of your trade license (format: dd/mm/yyyy). This is the date when your license will expire and needs renewal."
            placeholder="Select license expiry date"
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
            placeholder="Enter D&B D-U-N-S Number from trade license"
            title="Enter your D&B (Dun & Bradstreet) D-U-N-S Number. This is a unique 9-digit identifier found on your trade license. It's used for business credit reporting and identification."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commercial License Number
          </label>
          <input
            type="text"
            value={form.registerNo}
            onChange={(e) => setForm(prev => ({ ...prev, registerNo: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Enter Commercial License Number from trade license"
            title="Enter the commercial license number issued by the licensing authority. This number is typically found on your trade license document and identifies your company's commercial registration with the government."
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
            title="Enter the date when your trade license was issued (format: dd/mm/yyyy). This is the date printed on your license document when it was first issued."
            placeholder="Select license issue date"
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
            placeholder="Enter Main License Number from trade license"
            title="Enter the primary license number issued by the licensing authority. This is the main license number displayed prominently on your trade license document. It's required for all business operations."
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
            placeholder="Enter DCCI (Dubai Chamber) Number"
            title="Enter your Dubai Chamber of Commerce and Industry (DCCI) membership number, if applicable. This number is issued when your company becomes a member of the Dubai Chamber."
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
            placeholder="Enter TRN (Tax Registration Number) / ESBN"
            title="Enter your Tax Registration Number (TRN) or Economic Substance Business Number (ESBN). This is a unique identifier issued by the tax authority for VAT and tax purposes. It's mandatory for companies registered for VAT."
          />
        </div>
      </div>
    </div>
  );
};

export default LicenseInformationSection;

