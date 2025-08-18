import React, { useState } from "react";
import { 
  CalendarDaysIcon, 
  PlusIcon 
} from "@heroicons/react/24/outline";

// Import modular components and utilities
import {
  initialLeaveRequests,
  initialLeaveBalance,
  defaultNewRequest
} from './Leaves/index';
import {
  filterLeaveRequests,
  calculateLeaveStats,
  validateNewRequest,
  createNewRequest,
  cancelLeaveRequest,
  deleteLeaveRequest,
  resetNewRequest
} from './Leaves/index';
import {
  LeaveBalanceCard,
  LeaveRequestRow,
  LeaveFilters,
  LeaveStats
} from './Leaves/index';
import {
  RequestLeaveModal,
  ViewDetailsModal,
  DeleteConfirmationModal
} from './Leaves/index';

export default function LeavesRefactored() {
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [leaveBalance, setLeaveBalance] = useState(initialLeaveBalance);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newRequest, setNewRequest] = useState(defaultNewRequest);

  // Calculate filtered requests and stats
  const filteredRequests = filterLeaveRequests(leaveRequests, searchTerm, filterStatus, filterType);
  const stats = calculateLeaveStats(leaveRequests);

  // Event handlers
  const handleRequestLeave = () => {
    const validation = validateNewRequest(newRequest);
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }

    const request = createNewRequest(newRequest);
    setLeaveRequests(prev => [request, ...prev]);
    setNewRequest(resetNewRequest());
    setShowRequestModal(false);
  };

  const handleCancelRequest = (requestId) => {
    setLeaveRequests(prev => cancelLeaveRequest(prev, requestId));
  };

  const handleDeleteRequest = () => {
    if (selectedRequest) {
      setLeaveRequests(prev => deleteLeaveRequest(prev, selectedRequest.id));
      setShowDeleteModal(false);
      setSelectedRequest(null);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleDeleteRequestClick = (request) => {
    setSelectedRequest(request);
    setShowDeleteModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <CalendarDaysIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Leave Management
              </h1>
              <p className="text-gray-600 mt-1">Request and manage your leave applications</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <LeaveStats stats={stats} />
        </div>

        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(leaveBalance).map(([type, balance]) => (
            <LeaveBalanceCard key={type} type={type} balance={balance} />
          ))}
        </div>

        {/* Enhanced Action Bar */}
        <LeaveFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterType={filterType}
          setFilterType={setFilterType}
          onRequestLeave={() => setShowRequestModal(true)}
        />

        {/* Leave Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Leave Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <LeaveRequestRow
                    key={request.id}
                    request={request}
                    onViewDetails={handleViewDetails}
                    onCancelRequest={handleCancelRequest}
                    onDeleteRequest={handleDeleteRequestClick}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <CalendarDaysIcon className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all" || filterType !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by requesting your first leave."
              }
            </p>
            {!searchTerm && filterStatus === "all" && filterType === "all" && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Request Leave
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <RequestLeaveModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        newRequest={newRequest}
        setNewRequest={setNewRequest}
        onSubmit={handleRequestLeave}
      />

      <ViewDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        selectedRequest={selectedRequest}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRequest}
      />
    </div>
  );
}
