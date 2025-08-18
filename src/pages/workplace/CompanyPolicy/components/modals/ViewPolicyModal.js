import React from 'react';
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  DocumentIcon, 
  ClockIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';
import { getStatusColor, getFileTypeColor } from '../../utils';

const ViewPolicyModal = ({
  showViewModal,
  policyToView,
  onClose,
  onDownload,
  onAcknowledge
}) => {
  if (!showViewModal || !policyToView) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative flex items-center justify-between p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                <DocumentTextIcon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Policy Details</h3>
                <p className="text-indigo-100 text-sm font-medium">{policyToView.title}</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Policy Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                  <DocumentTextIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{policyToView.title}</h4>
                  <p className="text-gray-600 mb-2">{policyToView.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {policyToView.department}
                    </span>
                    <span className={`px-3 py-1 rounded-full font-medium ${getStatusColor(policyToView.status)}`}>
                      {policyToView.status === 'acknowledged' ? 'Acknowledged' : 'Pending'}
                    </span>
                    <span className="text-gray-500">ID: {policyToView.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* File Information */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <DocumentIcon className="h-5 w-5 text-white" />
                </div>
                <h5 className="text-lg font-bold text-gray-900">File Information</h5>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getFileTypeColor(policyToView.fileType)}`}>
                    {policyToView.fileType}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                  <p className="text-gray-900 font-medium">{policyToView.fileSize}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-gray-900 font-medium">{policyToView.lastUpdated}</p>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-white" />
                </div>
                <h5 className="text-lg font-bold text-gray-900">Status Information</h5>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(policyToView.status)}`}>
                    {policyToView.status === 'acknowledged' ? 'Acknowledged' : 'Pending'}
                  </span>
                </div>
                {policyToView.status === 'acknowledged' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Acknowledged On</label>
                    <p className="text-gray-900 font-medium">{policyToView.acknowledgedAt}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy ID</label>
                  <p className="text-gray-900 font-medium">#{policyToView.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Content Preview */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <EyeIcon className="h-5 w-5 text-white" />
              </div>
              <h5 className="text-lg font-bold text-gray-900">Policy Content Preview</h5>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="prose max-w-none">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{policyToView.title}</h3>
                <p className="text-gray-700 mb-4">{policyToView.description}</p>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Sample Policy Content:</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    This is a preview of the {policyToView.title}. In a real application, this would display the actual policy document content, including all sections, guidelines, and procedures that employees need to follow.
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mt-3">
                    The policy covers important aspects such as workplace conduct, data protection, health and safety protocols, and compliance requirements. All employees are required to review and acknowledge this policy to ensure understanding and compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Policy ID:</span> #{policyToView.id}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onDownload(policyToView)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📥 Download Policy
              </button>
              {policyToView.status === 'pending' && (
                <button
                  onClick={() => {
                    onAcknowledge(policyToView.id);
                    onClose();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  ✅ Acknowledge Policy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPolicyModal;
