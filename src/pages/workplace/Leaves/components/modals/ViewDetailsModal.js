import React from 'react';
import { getStatusColor, getStatusIcon } from '../../utils';

const ViewDetailsModal = ({ 
  isOpen, 
  onClose, 
  selectedRequest 
}) => {
  if (!isOpen || !selectedRequest) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Leave Request Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <p className="text-sm text-gray-900">{selectedRequest.type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                {getStatusIcon(selectedRequest.status)}
                <span className="ml-1 capitalize">{selectedRequest.status}</span>
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <p className="text-sm text-gray-900">{new Date(selectedRequest.fromDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <p className="text-sm text-gray-900">{new Date(selectedRequest.toDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <p className="text-sm text-gray-900">{selectedRequest.reason}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Submitted Date</label>
            <p className="text-sm text-gray-900">{new Date(selectedRequest.submittedDate).toLocaleDateString()}</p>
          </div>
          
          {selectedRequest.status === 'approved' && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Approved By</label>
                  <p className="text-sm text-green-900">{selectedRequest.approvedBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">Approved Date</label>
                  <p className="text-sm text-green-900">{new Date(selectedRequest.approvedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          
          {selectedRequest.status === 'rejected' && (
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">Rejected By</label>
                  <p className="text-sm text-red-900">{selectedRequest.rejectedBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-1">Rejected Date</label>
                  <p className="text-sm text-red-900">{new Date(selectedRequest.rejectedDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-red-700 mb-1">Reason</label>
                <p className="text-sm text-red-900">{selectedRequest.rejectionReason}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsModal;
