import React from 'react';
import { handleFileChange, removeFile } from '../utils';
import { fileUploadConfig } from '../constants';

const FileUploadSection = ({ form, setForm, fileErrors, setFileErrors }) => {
  const handleFileUpload = (field, files) => {
    handleFileChange(field, files, setForm, setFileErrors);
  };

  const handleRemoveFile = (field, index) => {
    removeFile(field, index, form, setForm, setFileErrors);
  };

  const renderFileUpload = (field, label) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={(e) => handleFileUpload(field, e.target.files)}
          className="hidden"
          id={`${field}-upload`}
        />
        <label htmlFor={`${field}-upload`} className="cursor-pointer">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-1 text-sm text-gray-600">Upload {label.toLowerCase()}</p>
          <p className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG, PDF under {fileUploadConfig.maxSizeText}</p>
        </label>
        {form[field] && (
          <div className="mt-2">
            <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
              <span className="text-xs text-blue-700">{form[field].name}</span>
              <button
                type="button"
                onClick={() => handleRemoveFile(field, 0)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                ×
              </button>
            </div>
          </div>
        )}
        {fileErrors[field] && Object.values(fileErrors[field]).map((error, index) => (
          <p key={index} className="mt-1 text-xs text-red-600">{error}</p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-500 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Company Assets</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderFileUpload('logo', 'Company Logo')}
        {renderFileUpload('header', 'Header Image')}
        {renderFileUpload('footer', 'Footer Image')}
      </div>
    </div>
  );
};

export default FileUploadSection;

