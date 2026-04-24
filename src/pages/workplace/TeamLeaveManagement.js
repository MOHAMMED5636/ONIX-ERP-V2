import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UsersIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import {
  listTeamLeaves,
  managerApproveLeave,
  managerRejectLeave,
  getLeaveDocuments,
  downloadLeaveDocument,
} from "../../services/leaveAPI";
import { formatLeaveWorkflowStatus, leaveTypeNeedsManagerFirst } from "../../utils/leaveWorkflow";

const LEAVE_TYPES = [
  { value: "ANNUAL", label: "Annual Leave" },
  { value: "SICK", label: "Sick Leave" },
  { value: "UNPAID", label: "Unpaid Leave" },
  { value: "EMERGENCY", label: "Emergency Leave" },
  { value: "BEREAVEMENT", label: "Bereavement Leave" },
  { value: "PATERNITY", label: "Paternity Leave" },
  { value: "MATERNITY", label: "Maternity Leave" },
];

export default function TeamLeaveManagement() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [workflowFilter, setWorkflowFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [leaveDocuments, setLeaveDocuments] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 100,
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(filterType !== "all" && { type: filterType }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      };
      const res = await listTeamLeaves(params);
      if (res?.success && Array.isArray(res.data)) {
        setRows(res.data);
      } else {
        setRows([]);
        if (res?.message) setToast({ message: res.message, type: "error" });
      }
    } catch (err) {
      setToast({ message: err.message || "Failed to load team leaves", type: "error" });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType, dateFrom, dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getTypeLabel = (type) => LEAVE_TYPES.find((t) => t.value === type)?.label || type;

  /** Approve/reject: normal manager queue, or misrouted annual/unpaid still pending HR (backend checks resolved line manager). */
  const canManagerAct = (r) => {
    const st = (r.status || "").toUpperCase();
    const mas = r.managerApprovalStatus || "NOT_REQUIRED";
    if (st !== "PENDING" || !leaveTypeNeedsManagerFirst(r.type)) return false;
    return mas === "PENDING" || mas === "NOT_REQUIRED";
  };

  const matchesWorkflow = (r) => {
    if (workflowFilter === "all") return true;
    const st = (r.status || "").toUpperCase();
    const mas = r.managerApprovalStatus || "NOT_REQUIRED";
    if (workflowFilter === "awaiting_me") {
      return canManagerAct(r);
    }
    if (workflowFilter === "awaiting_hr") {
      return st === "PENDING" && mas !== "PENDING";
    }
    if (workflowFilter === "view_only") {
      return st === "PENDING" && mas === "NOT_REQUIRED" && !leaveTypeNeedsManagerFirst(r.type);
    }
    return true;
  };

  const filteredRows = rows.filter((r) => {
    const name = r.user
      ? `${r.user.firstName || ""} ${r.user.lastName || ""}`.toLowerCase()
      : "";
    const reason = (r.reason || "").toLowerCase();
    const matchSearch =
      !searchTerm ||
      name.includes(searchTerm.toLowerCase()) ||
      reason.includes(searchTerm.toLowerCase());
    return matchSearch && matchesWorkflow(r);
  });

  const handleView = async (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
    setLeaveDocuments([]);
    try {
      const res = await getLeaveDocuments(request.id);
      if (res?.success && res.data?.documents) setLeaveDocuments(res.data.documents);
    } catch (_) {}
  };

  const handleApprove = async (request) => {
    setActionLoading(true);
    setToast(null);
    try {
      const res = await managerApproveLeave(request.id);
      if (res?.success) {
        setToast({ message: "Forwarded to HR for final approval", type: "success" });
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

  const openReject = (request) => {
    setSelectedRequest(request);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setToast({ message: "A rejection comment is required", type: "error" });
      return;
    }
    setActionLoading(true);
    setToast(null);
    try {
      const res = await managerRejectLeave(selectedRequest.id, trimmed);
      if (res?.success) {
        setShowRejectModal(false);
        setToast({ message: "Leave rejected", type: "success" });
        loadData();
      } else {
        setToast({ message: res?.message || "Reject failed", type: "error" });
      }
    } catch (err) {
      setToast({ message: err.message || "Reject failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadDoc = async (leaveId, filename, displayName) => {
    try {
      await downloadLeaveDocument(leaveId, filename, displayName);
    } catch (err) {
      setToast({ message: err.message || "Download failed", type: "error" });
    }
  };

  if (!["MANAGER", "PROJECT_MANAGER"].includes(user?.role || "")) {
    return (
      <div className="p-6">
        <p className="text-gray-600">You do not have access to Team Leave Management.</p>
        <Link to="/workplace/leaves" className="text-indigo-600 mt-2 inline-block">
          Back to My Leaves
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Link
            to="/workplace/leaves"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            My Leaves
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl shadow-lg">
              <UsersIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Team Leave Management
              </h1>
              <p className="text-gray-600 text-sm mt-0.5">
                View leave requests from your direct reports (line manager on profile, or same Department / Position as in
                Company Resources). Approve or reject Annual / Unpaid before HR; other types are view-only here. If someone is
                missing, set their Line manager in the employee directory or align their Department name with the department you
                manage.
              </p>
            </div>
          </div>
        </div>

        {toast && (
          <div
            className={`mb-4 p-3 rounded-lg ${toast.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
          >
            {toast.message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All types</option>
              {LEAVE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={workflowFilter}
              onChange={(e) => setWorkflowFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-indigo-100 rounded-lg bg-indigo-50/50"
            >
              <option value="all">All workflow</option>
              <option value="awaiting_me">Awaiting my action</option>
              <option value="awaiting_hr">Awaiting HR</option>
              <option value="view_only">HR-only types (view)</option>
            </select>
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400 hidden sm:block" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2 py-2 border rounded-lg text-sm"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2 py-2 border rounded-lg text-sm"
              />
            </div>
            <button
              type="button"
              onClick={loadData}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-violet-50 to-indigo-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Days</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Loading…
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No team leave requests match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {r.user ? `${r.user.firstName} ${r.user.lastName}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm">{getTypeLabel(r.type)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {r.startDate && new Date(r.startDate).toLocaleDateString()} –{" "}
                        {r.endDate && new Date(r.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">{r.days}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={r.reason}>
                        {r.reason}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
                          {formatLeaveWorkflowStatus(r)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {r.createdAt && new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleView(r)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 rounded"
                            title="View"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {canManagerAct(r) && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(r)}
                                disabled={actionLoading}
                                className="p-1.5 text-gray-500 hover:text-green-600 rounded disabled:opacity-50"
                                title="Approve & forward to HR"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openReject(r)}
                                disabled={actionLoading}
                                className="p-1.5 text-gray-500 hover:text-red-600 rounded disabled:opacity-50"
                                title="Reject"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-gray-900">Leave details</h2>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Employee</dt>
                <dd className="font-medium">
                  {selectedRequest.user
                    ? `${selectedRequest.user.firstName} ${selectedRequest.user.lastName}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Type</dt>
                <dd>{getTypeLabel(selectedRequest.type)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Dates / days</dt>
                <dd>
                  {selectedRequest.startDate && new Date(selectedRequest.startDate).toLocaleDateString()} –{" "}
                  {selectedRequest.endDate && new Date(selectedRequest.endDate).toLocaleDateString()} ({selectedRequest.days}{" "}
                  days)
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Workflow status</dt>
                <dd className="font-medium text-indigo-700">{formatLeaveWorkflowStatus(selectedRequest)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Reason</dt>
                <dd className="text-gray-800 whitespace-pre-wrap">{selectedRequest.reason}</dd>
              </div>
              {!leaveTypeNeedsManagerFirst(selectedRequest.type) && (
                <p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-2 mt-2">
                  This leave type is approved by HR only. You can view details but cannot approve or reject here.
                </p>
              )}
            </dl>
            {leaveDocuments.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Attachments</p>
                <ul className="text-sm space-y-1">
                  {leaveDocuments.map((d, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        className="text-indigo-600 hover:underline"
                        onClick={() =>
                          handleDownloadDoc(selectedRequest.id, d.path?.split("/").pop(), d.fileName)
                        }
                      >
                        {d.fileName || "Document"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Reject leave</h2>
            <p className="text-sm text-gray-600 mb-4">A comment is required for the employee record.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-4"
              placeholder="Reason for rejection…"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
