import React, { useState } from 'react';
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const AmendmentForm = ({ isOpen, onClose, originalContract, onCreateAmendment }) => {
  const [formData, setFormData] = useState({
    amendmentReason: '',
    amendmentType: '',
    financialImpact: '',
    amendmentAmount: '',
    effectiveDate: '',
    approvalRequired: false,
    approvedBy: '',
    approvalDate: '',
    description: '',
    changes: [
      {
        field: '',
        originalValue: '',
        newValue: '',
        reason: ''
      }
    ]
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !originalContract) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleChangeAdd = () => {
    setFormData(prev => ({
      ...prev,
      changes: [...prev.changes, { field: '', originalValue: '', newValue: '', reason: '' }]
    }));
  };

  const handleChangeRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      changes: prev.changes.filter((_, i) => i !== index)
    }));
  };

  const handleChangeUpdate = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      changes: prev.changes.map((change, i) => 
        i === index ? { ...change, [field]: value } : change
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amendmentReason.trim()) {
      newErrors.amendmentReason = 'Amendment reason is required';
    }
    
    if (!formData.amendmentType.trim()) {
      newErrors.amendmentType = 'Amendment type is required';
    }
    
    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Validate changes
    formData.changes.forEach((change, index) => {
      if (!change.field.trim()) {
        newErrors[`change_${index}_field`] = 'Field is required';
      }
      if (!change.reason.trim()) {
        newErrors[`change_${index}_reason`] = 'Reason is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create new contract version
      const amendmentNumber = `AM-${Date.now()}`;
      const newContract = {
        ...originalContract,
        id: Date.now(),
        ref: `${originalContract.ref}-${amendmentNumber}`,
        originalContractId: originalContract.id || originalContract.ref,
        amendmentNumber,
        amendmentData: formData,
        status: formData.approvalRequired ? 'Pending Approval' : 'Active',
        createdAt: new Date().toISOString(),
        version: '2.0'
      };

      // Call the parent handler
      await onCreateAmendment(newContract, formData);
      
      // Reset form
      setFormData({
        amendmentReason: '',
        amendmentType: '',
        financialImpact: '',
        amendmentAmount: '',
        effectiveDate: '',
        approvalRequired: false,
        approvedBy: '',
        approvalDate: '',
        description: '',
        changes: [{ field: '', originalValue: '', newValue: '', reason: '' }]
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating amendment:', error);
      alert('Failed to create amendment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const amendmentTypes = [
    'Financial Adjustment',
    'Scope Change',
    'Timeline Extension',
    'Terms Modification',
    'Additional Work',
    'Cost Reduction',
    'Other'
  ];

  const commonFields = [
    'Contract Value',
    'Start Date',
    'End Date',
    'Payment Terms',
    'Scope of Work',
    'Deliverables',
    'Terms and Conditions',
    'Penalty Clauses',
    'Warranty Period',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"></div>
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative flex items-center justify-between p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                <DocumentTextIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Create Contract Amendment</h2>
                <p className="text-green-100 text-lg font-medium">{originalContract.ref}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Amendment Details */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <ExclamationTriangleIcon className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Amendment Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Amendment Reason *
                  </label>
                  <input
                    type="text"
                    value={formData.amendmentReason}
                    onChange={(e) => handleInputChange('amendmentReason', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 ${
                      errors.amendmentReason ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter reason for amendment"
                  />
                  {errors.amendmentReason && (
                    <p className="text-red-500 text-sm mt-1">{errors.amendmentReason}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Amendment Type *
                  </label>
                  <select
                    value={formData.amendmentType}
                    onChange={(e) => handleInputChange('amendmentType', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 ${
                      errors.amendmentType ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select amendment type</option>
                    {amendmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.amendmentType && (
                    <p className="text-red-500 text-sm mt-1">{errors.amendmentType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Effective Date *
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 ${
                      errors.effectiveDate ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.effectiveDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.effectiveDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Financial Impact
                  </label>
                  <select
                    value={formData.financialImpact}
                    onChange={(e) => handleInputChange('financialImpact', e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 border-gray-200"
                  >
                    <option value="">Select financial impact</option>
                    <option value="Increase">Increase</option>
                    <option value="Decrease">Decrease</option>
                    <option value="No Change">No Change</option>
                    <option value="Redistribution">Redistribution</option>
                  </select>
                </div>

                {formData.financialImpact && formData.financialImpact !== 'No Change' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Amendment Amount (AED)
                    </label>
                    <input
                      type="number"
                      value={formData.amendmentAmount}
                      onChange={(e) => handleInputChange('amendmentAmount', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 border-gray-200"
                      placeholder="Enter amendment amount"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Changes Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Contract Changes</h3>
                </div>
                <button
                  type="button"
                  onClick={handleChangeAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Change
                </button>
              </div>

              <div className="space-y-4">
                {formData.changes.map((change, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800">Change #{index + 1}</h4>
                      {formData.changes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleChangeRemove(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field *
                        </label>
                        <select
                          value={change.field}
                          onChange={(e) => handleChangeUpdate(index, 'field', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`change_${index}_field`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select field</option>
                          {commonFields.map(field => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                        {errors[`change_${index}_field`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`change_${index}_field`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason *
                        </label>
                        <input
                          type="text"
                          value={change.reason}
                          onChange={(e) => handleChangeUpdate(index, 'reason', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors[`change_${index}_reason`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Reason for change"
                        />
                        {errors[`change_${index}_reason`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`change_${index}_reason`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Original Value
                        </label>
                        <input
                          type="text"
                          value={change.originalValue}
                          onChange={(e) => handleChangeUpdate(index, 'originalValue', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Original value"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Value
                        </label>
                        <input
                          type="text"
                          value={change.newValue}
                          onChange={(e) => handleChangeUpdate(index, 'newValue', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="New value"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Section */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircleIcon className="h-6 w-6 text-amber-600" />
                <h3 className="text-xl font-bold text-gray-900">Approval Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="approvalRequired"
                    checked={formData.approvalRequired}
                    onChange={(e) => handleInputChange('approvalRequired', e.target.checked)}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="approvalRequired" className="ml-2 text-sm font-medium text-gray-700">
                    Approval Required
                  </label>
                </div>

                {formData.approvalRequired && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Approved By
                      </label>
                      <input
                        type="text"
                        value={formData.approvedBy}
                        onChange={(e) => handleInputChange('approvedBy', e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-300 border-gray-200"
                        placeholder="Enter approver name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Approval Date
                      </label>
                      <input
                        type="date"
                        value={formData.approvalDate}
                        onChange={(e) => handleInputChange('approvalDate', e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-300 border-gray-200"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <UserIcon className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Description</h3>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Amendment Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-200'
                  }`}
                  rows="4"
                  placeholder="Provide a detailed description of the amendment..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Amendment...' : 'Create Amendment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AmendmentForm;
