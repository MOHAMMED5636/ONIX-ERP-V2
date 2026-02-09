import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarDaysIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import {
  getLeaveBalance,
  listLeaves,
  createLeave,
  approveLeave,
  rejectLeave,
} from "../../services/leaveAPI";

const LEAVE_TYPES = [
  { value: "ANNUAL", label: "Annual Leave" },
  { value: "SICK", label: "Sick Leave" },
  { value: "UNPAID", label: "Unpaid Leave" },
];

export default function Leaves() {
  const { user } = useAuth();
  const isAdminOrManager = ["ADMIN", "HR", "PROJECT_MANAGER"].includes(user?.role || "");

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    annual: { total: 25, used: 0, remaining: 25 },
    sick: { used: 0, note: "" },
    unpaid: { note: "" },
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [newRequest, setNewRequest] = useState({
    type: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [toast, setToast] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [balanceRes, listRes] = await Promise.all([
        getLeaveBalance(),
        listLeaves({ page: 1, limit: 100, status: filterStatus !== "all" ? filterStatus : undefined, type: filterType !== "all" ? filterType : undefined }),
      ]);
      if (balanceRes?.success && balanceRes.data) {
        setLeaveBalance({
          annual: balanceRes.data.annual || { total: 25, used: 0, remaining: 25 },
          sick: balanceRes.data.sick || { used: 0, note: "" },
          unpaid: balanceRes.data.unpaid || { note: "" },
        });
      }
      if (listRes?.success && Array.isArray(listRes.data)) {
        setLeaveRequests(listRes.data);
      }
    } catch (err) {
      setToast({ message: err.message || "Failed to load leave data", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRequestLeave = async () => {
    if (!newRequest.type || !newRequest.fromDate || !newRequest.toDate || !newRequest.reason?.trim()) {
      setToast({ message: "Please fill in all required fields", type: "error" });
      return;
    }
    setActionLoading(true);
    setToast(null);
    try {
      const res = await createLeave({
        type: newRequest.type,
        startDate: newRequest.fromDate,
        endDate: newRequest.toDate,
        reason: newRequest.reason.trim(),
      });
      if (res?.success) {
        setNewRequest({ type: "", fromDate: "", toDate: "", reason: "" });
        setShowRequestModal(false);
        setToast({ message: "Leave request submitted successfully", type: "success" });
        loadData();
      } else {
        setToast({ message: res?.message || "Submit failed", type: "error" });
      }
    } catch (err) {
      setToast({ message: err.message || "Submit failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleApprove = async (request) => {
    setActionLoading(true);
    setToast(null);
    try {
      const res = await approveLeave(request.id);
      if (res?.success) {
        setToast({ message: "Leave approved", type: "success" });
        loadData();
        if (selectedRequest?.id === request.id) setSelectedRequest(res.data);
      } else {
        setToast({ message: res?.message || "Approve failed", type: "error" });
      }
    } catch (err) {
      setToast({ message: err.message || "Approve failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    setToast(null);
    try {
      const res = await rejectLeave(selectedRequest.id, rejectReason);
      if (res?.success) {
        setShowRejectModal(false);
        setToast({ message: "Leave rejected", type: "success" });
        loadData();
        setSelectedRequest(res.data);
      } else {
        setToast({ message: res?.message || "Reject failed", type: "error" });
      }
    } catch (err) {
      setToast({ message: err.message || "Reject failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const getTypeLabel = (type) => LEAVE_TYPES.find((t) => t.value === type)?.label || type;

  const filteredRequests = leaveRequests.filter((request) => {
    const reason = (request.reason || "").toLowerCase();
    const typeLabel = getTypeLabel(request.type).toLowerCase();
    const matchesSearch = !searchTerm || reason.includes(searchTerm.toLowerCase()) || typeLabel.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesType = filterType === "all" || request.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
      case "approved":
        return "bg-green-100 text-green-800";
      case "PENDING":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "ANNUAL":
        return "bg-blue-100 text-blue-800";
      case "SICK":
        return "bg-red-100 text-red-800";
      case "UNPAID":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "APPROVED") return <CheckCircleIcon className="h-4 w-4" />;
    if (s === "PENDING") return <ClockIcon className="h-4 w-4" />;
    if (s === "REJECTED") return <XMarkIcon className="h-4 w-4" />;
    return null;
  };

  const pendingCount = leaveRequests.filter((r) => (r.status || "").toUpperCase() === "PENDING").length;
  const approvedCount = leaveRequests.filter((r) => (r.status || "").toUpperCase() === "APPROVED").length;
  const totalRequests = leaveRequests.length;
  const totalDaysUsed = leaveRequests
    .filter((r) => (r.status || "").toUpperCase() === "APPROVED")
    .reduce((sum, r) => sum + (r.days || 0), 0);

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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <CalendarDaysIcon className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Days Used</p>
                  <p className="text-2xl font-bold text-purple-600">{totalDaysUsed}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalRequests > 0 ? Math.round((approvedCount / totalRequests) * 100) : 0}%
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <div className="h-6 w-6 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Annual Leave</h3>
              <span className="text-xs text-gray-500">{leaveBalance.annual?.used ?? 0}/{leaveBalance.annual?.total ?? 25}</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Remaining</span>
                <span className="font-semibold text-gray-900">{leaveBalance.annual?.remaining ?? 0} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${leaveBalance.annual?.total ? Math.min(100, (100 * (leaveBalance.annual.remaining || 0)) / leaveBalance.annual.total) : 0}%` }}
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Sick Leave</h3>
            <p className="text-sm text-gray-600">Used this year: {leaveBalance.sick?.used ?? 0} days</p>
            {leaveBalance.sick?.note && <p className="text-xs text-gray-500 mt-1">{leaveBalance.sick.note}</p>}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Unpaid Leave</h3>
            <p className="text-sm text-gray-600">No balance limit</p>
            {leaveBalance.unpaid?.note && <p className="text-xs text-gray-500 mt-1">{leaveBalance.unpaid.note}</p>}
          </div>
        </div>
        {toast && (
          <div className={`mb-4 p-3 rounded-lg ${toast.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
            {toast.message}
          </div>
        )}

        {/* Enhanced Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leave requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              {/* Status Filter */}
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              
              {/* Type Filter */}
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="ANNUAL">Annual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Request Leave Button */}
              <button
                onClick={() => setShowRequestModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Request Leave
              </button>
            </div>
          </div>
        </div>

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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => {
                    const status = (request.status || "").toUpperCase();
                    const isPending = status === "PENDING";
                    return (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                <CalendarDaysIcon className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.reason}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.user ? `${request.user.firstName} ${request.user.lastName}` : ""} · {request.days} day{request.days !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(request.type)}`}>
                            {getTypeLabel(request.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {request.startDate && new Date(request.startDate).toLocaleDateString()} - {request.endDate && new Date(request.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{status === "PENDING" ? "Pending" : status === "APPROVED" ? "Approved" : "Rejected"}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {request.createdAt && new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(request)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {isAdminOrManager && isPending && (
                              <>
                                <button
                                  onClick={() => handleApprove(request)}
                                  disabled={actionLoading}
                                  className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectClick(request)}
                                  disabled={actionLoading}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Reject"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
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

      {/* Request Leave Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Request Leave</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type *
                </label>
                <select
                  value={newRequest.type}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select leave type</option>
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date *
                  </label>
                  <input
                    type="date"
                    value={newRequest.fromDate}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, fromDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date *
                  </label>
                  <input
                    type="date"
                    value={newRequest.toDate}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, toDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason *
                </label>
                <textarea
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Please provide a reason for your leave request..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestLeave}
                disabled={actionLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Leave Request Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                  <p className="text-sm text-gray-900">{getTypeLabel(selectedRequest.type)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusIcon(selectedRequest.status)}
                    <span className="ml-1">{(selectedRequest.status || "").toUpperCase()}</span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <p className="text-sm text-gray-900">{selectedRequest.startDate && new Date(selectedRequest.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <p className="text-sm text-gray-900">{selectedRequest.endDate && new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <p className="text-sm text-gray-900">{selectedRequest.reason}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submitted</label>
                <p className="text-sm text-gray-900">{selectedRequest.createdAt && new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
              </div>
              {(selectedRequest.status || "").toUpperCase() === "APPROVED" && selectedRequest.approvedBy && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-green-700 mb-1">Approved By</label>
                  <p className="text-sm text-green-900">
                    {selectedRequest.approvedBy.firstName} {selectedRequest.approvedBy.lastName}
                    {selectedRequest.approvedAt && ` on ${new Date(selectedRequest.approvedAt).toLocaleDateString()}`}
                  </p>
                </div>
              )}
              {(selectedRequest.status || "").toUpperCase() === "REJECTED" && selectedRequest.rejectedBy && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-red-700 mb-1">Rejected By</label>
                  <p className="text-sm text-red-900">
                    {selectedRequest.rejectedBy.firstName} {selectedRequest.rejectedBy.lastName}
                    {selectedRequest.rejectedAt && ` on ${new Date(selectedRequest.rejectedAt).toLocaleDateString()}`}
                  </p>
                  {selectedRequest.rejectionReason && (
                    <>
                      <label className="block text-sm font-medium text-red-700 mb-1 mt-2">Reason</label>
                      <p className="text-sm text-red-900">{selectedRequest.rejectionReason}</p>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Leave Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Reject Leave Request</h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-2">Optional reason for rejection:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
              placeholder="Reason for rejection..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 