import React, { useState } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import PayrollAPI from '../../services/payrollAPI';

const ApprovalWorkflow = ({ payrollRun, onApprovalChange }) => {
  const [approving, setApproving] = useState(false);
  const [comments, setComments] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentStage, setCurrentStage] = useState(null);

  const stages = [
    {
      id: 'HR_REVIEW',
      name: 'HR Review',
      status: payrollRun.status === 'HR_PENDING' || payrollRun.status === 'HR_APPROVED' ? 'active' : 'pending',
      approved: payrollRun.hrApprovedAt ? true : false,
      approvedBy: payrollRun.hrApprovedBy,
      approvedAt: payrollRun.hrApprovedAt,
    },
    {
      id: 'FINANCE_REVIEW',
      name: 'Finance Review',
      status: payrollRun.status === 'FINANCE_PENDING' || payrollRun.status === 'FINANCE_APPROVED' ? 'active' : 'pending',
      approved: payrollRun.financeApprovedAt ? true : false,
      approvedBy: payrollRun.financeApprovedBy,
      approvedAt: payrollRun.financeApprovedAt,
    },
    {
      id: 'FINAL_APPROVAL',
      name: 'Final Approval',
      status: payrollRun.status === 'FINAL_APPROVED' ? 'active' : 'pending',
      approved: payrollRun.finalApprovedAt ? true : false,
      approvedBy: payrollRun.finalApprovedBy,
      approvedAt: payrollRun.finalApprovedAt,
    },
  ];

  const getCurrentActionableStage = () => {
    if (payrollRun.status === 'DRAFT') return 'HR_REVIEW';
    if (payrollRun.status === 'HR_APPROVED') return 'FINANCE_REVIEW';
    if (payrollRun.status === 'FINANCE_APPROVED') return 'FINAL_APPROVAL';
    return null;
  };

  const handleApprove = async (stage) => {
    setCurrentStage(stage);
    setShowCommentModal(true);
  };

  const confirmApprove = async () => {
    try {
      setApproving(true);
      let response;
      
      if (currentStage === 'HR_REVIEW') {
        response = await PayrollAPI.approveHR(payrollRun.id, comments);
      } else if (currentStage === 'FINANCE_REVIEW') {
        response = await PayrollAPI.approveFinance(payrollRun.id, comments);
      } else if (currentStage === 'FINAL_APPROVAL') {
        response = await PayrollAPI.approveFinal(payrollRun.id, comments);
      }

      if (response?.success) {
        setShowCommentModal(false);
        setComments('');
        onApprovalChange();
      }
    } catch (error) {
      alert('Error approving: ' + error.message);
    } finally {
      setApproving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const actionableStage = getCurrentActionableStage();

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Approval Workflow</h2>
        
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200">
            <div
              className="absolute top-0 left-0 w-0.5 bg-indigo-600 transition-all duration-500"
              style={{
                height: `${(stages.filter(s => s.approved).length / stages.length) * 100}%`,
              }}
            />
          </div>

          {/* Stages */}
          <div className="space-y-6">
            {stages.map((stage, index) => (
              <div key={stage.id} className="relative flex items-start gap-4">
                {/* Stage Icon */}
                <div
                  className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                    stage.approved
                      ? 'bg-green-100 border-green-500'
                      : stage.status === 'active'
                      ? 'bg-indigo-100 border-indigo-500'
                      : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  {stage.approved ? (
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  ) : (
                    <ClockIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                {/* Stage Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
                    {actionableStage === stage.id && (
                      <button
                        onClick={() => handleApprove(stage.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                  
                  {stage.approved ? (
                    <div className="space-y-1">
                      <p className="text-sm text-green-700 font-medium">✓ Approved</p>
                      <p className="text-xs text-gray-600">
                        {formatDate(stage.approvedAt)}
                      </p>
                      {stage.approvedBy && (
                        <p className="text-xs text-gray-500">
                          By: {stage.approvedBy.firstName} {stage.approvedBy.lastName}
                        </p>
                      )}
                    </div>
                  ) : stage.status === 'active' ? (
                    <div>
                      <p className="text-sm text-indigo-700 font-medium">⏳ Pending Approval</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Waiting for {stage.name.toLowerCase()}...
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500">Not started</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lock Button (after final approval) */}
        {payrollRun.status === 'FINAL_APPROVED' && !payrollRun.lockedAt && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to lock this payroll? It cannot be edited after locking.')) {
                  try {
                    await PayrollAPI.lockPayroll(payrollRun.id);
                    onApprovalChange();
                  } catch (error) {
                    alert('Error locking payroll: ' + error.message);
                  }
                }
              }}
              className="w-full px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Lock Payroll Run
            </button>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Approval Comments</h3>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
              placeholder="Optional comments for this approval..."
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setComments('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={approving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {approving ? 'Approving...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApprovalWorkflow;
