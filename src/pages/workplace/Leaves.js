import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarDaysIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import {
  getLeaveBalance,
  listLeaves,
  createLeave,
  approveLeave,
  rejectLeave,
  rescheduleLeave,
  uploadLeaveDocuments,
  getLeaveDocuments,
  downloadLeaveDocument,
  listCertificatesForHR,
  getLeaveReportsSummary,
  getHRDashboard,
  getEmployeeBalances,
  getLeaveReportExport,
} from "../../services/leaveAPI";
import { formatLeaveWorkflowStatus } from "../../utils/leaveWorkflow";

const LEAVE_TYPES = [
  { value: "ANNUAL", label: "Annual Leave" },
  { value: "SICK", label: "Sick Leave" },
  { value: "UNPAID", label: "Unpaid Leave" },
  { value: "EMERGENCY", label: "Emergency Leave" },
  { value: "BEREAVEMENT", label: "Bereavement Leave" },
  { value: "PATERNITY", label: "Paternity Leave" },
  { value: "MATERNITY", label: "Maternity Leave" },
];

export default function Leaves() {
  const { user } = useAuth();
  /** Admin/HR only: org-wide list, dashboard, certificates, approve/reject. Managers use self-service leave only. */
  const isHrLeaveDashboard = ["ADMIN", "HR"].includes(user?.role || "");

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    annual: { total: 30, used: 0, remaining: 30, fromCarryForward: 0, display: "0/30" },
    sick: { total: 90, used: 0, remaining: 90, display: "0/90", note: "" },
    unpaid: { note: "" },
    emergency: { used: 0, note: "" },
    bereavement: { note: "" },
    paternity: { note: "" },
    maternity: { note: "" },
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
    relationOrContext: "",
  });
  const [toast, setToast] = useState(null);
  const [leaveDocuments, setLeaveDocuments] = useState([]);
  const [uploadDocLoading, setUploadDocLoading] = useState(false);
  const [hrView, setHrView] = useState("list"); // "list" | "certificates" | "reports"
  const [certificatesList, setCertificatesList] = useState([]);
  const [reportsData, setReportsData] = useState(null);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [hrDashboard, setHrDashboard] = useState(null);
  const [employeeBalances, setEmployeeBalances] = useState([]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDates, setRescheduleDates] = useState({ startDate: "", endDate: "" });
  const [requestValidationError, setRequestValidationError] = useState("");

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
        ...(isHrLeaveDashboard && employeeSearch?.trim() && { search: employeeSearch.trim() }),
      };
      const [balanceRes, listRes] = await Promise.all([
        getLeaveBalance(),
        listLeaves(params),
      ]);
      if (balanceRes?.success && balanceRes.data) {
        setLeaveBalance({
          annual: balanceRes.data.annual || { total: 30, used: 0, remaining: 30, fromCarryForward: 0, display: "0/30" },
          sick: balanceRes.data.sick || { total: 90, used: 0, remaining: 90, display: "0/90", note: "" },
          unpaid: balanceRes.data.unpaid || { note: "" },
          emergency: balanceRes.data.emergency || { used: 0, note: "" },
          bereavement: balanceRes.data.bereavement || { note: "" },
          paternity: balanceRes.data.paternity || { note: "" },
          maternity: balanceRes.data.maternity || { note: "" },
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
  }, [filterStatus, filterType, dateFrom, dateTo, employeeSearch, isHrLeaveDashboard]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isHrLeaveDashboard) {
      setHrView("list");
      return;
    }
    getHRDashboard().then((res) => {
      if (res?.success && res.data) {
        setHrDashboard(res.data);
        setEmployeeBalances(res.data.employeeBalances || []);
      }
    });
  }, [isHrLeaveDashboard]);

  const handleRequestLeave = async () => {
    if (!newRequest.type || !newRequest.fromDate || !newRequest.toDate || !newRequest.reason?.trim()) {
      setRequestValidationError("Please fill in all required fields.");
      return;
    }
    if (newRequest.type === "BEREAVEMENT" && !newRequest.relationOrContext) {
      setRequestValidationError("Please select relation for bereavement leave.");
      return;
    }
    setActionLoading(true);
    setToast(null);
    setRequestValidationError("");
    try {
      const res = await createLeave({
        type: newRequest.type,
        startDate: newRequest.fromDate,
        endDate: newRequest.toDate,
        reason: newRequest.reason.trim(),
        ...(newRequest.relationOrContext ? { relationOrContext: newRequest.relationOrContext } : {}),
      });
      if (res?.success) {
        setNewRequest({ type: "", fromDate: "", toDate: "", reason: "", relationOrContext: "" });
        setShowRequestModal(false);
        setToast({ message: "Leave request submitted successfully", type: "success" });
        loadData();
      } else {
        setRequestValidationError(res?.message || "Submit failed");
      }
    } catch (err) {
      setRequestValidationError(err.message || "Submit failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = async (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
    setLeaveDocuments([]);
    try {
      const res = await getLeaveDocuments(request.id);
      if (res?.success && res.data?.documents) setLeaveDocuments(res.data.documents);
    } catch (_) {}
  };

  const handleUploadDocuments = async (leaveId, files) => {
    if (!files?.length) return;
    setUploadDocLoading(true);
    setToast(null);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("documents", f));
      const res = await uploadLeaveDocuments(leaveId, formData);
      if (res?.success) {
        setToast({ message: "Documents uploaded successfully", type: "success" });
        if (selectedRequest?.id === leaveId) setLeaveDocuments(res.data?.documents || []);
        loadData();
      } else setToast({ message: res?.message || "Upload failed", type: "error" });
    } catch (err) {
      setToast({ message: err.message || "Upload failed", type: "error" });
    } finally {
      setUploadDocLoading(false);
    }
  };

  const handleDownloadDoc = async (leaveId, filename, displayName) => {
    try {
      await downloadLeaveDocument(leaveId, filename, displayName);
    } catch (err) {
      setToast({ message: err.message || "Download failed", type: "error" });
    }
  };

  const loadCertificates = async () => {
    const res = await listCertificatesForHR();
    if (res?.success && Array.isArray(res.data)) setCertificatesList(res.data);
  };

  const loadReports = async () => {
    const res = await getLeaveReportsSummary(reportYear);
    if (res?.success) setReportsData(res.data);
  };

  const handleRescheduleOpen = (request) => {
    setSelectedRequest(request);
    setRescheduleDates({
      startDate: request.startDate ? new Date(request.startDate).toISOString().slice(0, 10) : "",
      endDate: request.endDate ? new Date(request.endDate).toISOString().slice(0, 10) : "",
    });
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedRequest || !rescheduleDates.startDate || !rescheduleDates.endDate) {
      setToast({ message: "Please select both start and end dates", type: "error" });
      return;
    }
    setActionLoading(true);
    setToast(null);
    try {
      const res = await rescheduleLeave(selectedRequest.id, rescheduleDates.startDate, rescheduleDates.endDate);
      if (res?.success) {
        setShowRescheduleModal(false);
        setToast({ message: "Leave rescheduled successfully", type: "success" });
        loadData();
        if (showDetailsModal) setSelectedRequest(res.data);
      } else setToast({ message: res?.message || "Reschedule failed", type: "error" });
    } catch (err) {
      setToast({ message: err.message || "Reschedule failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    setToast(null);
    try {
      await getLeaveReportExport(reportYear, "csv");
      setToast({ message: "Report downloaded", type: "success" });
    } catch (err) {
      setToast({ message: err.message || "Download failed", type: "error" });
    }
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
      case "ANNUAL": return "bg-blue-100 text-blue-800";
      case "SICK": return "bg-red-100 text-red-800";
      case "UNPAID": return "bg-purple-100 text-purple-800";
      case "EMERGENCY": return "bg-amber-100 text-amber-800";
      case "BEREAVEMENT": return "bg-slate-100 text-slate-800";
      case "PATERNITY": return "bg-cyan-100 text-cyan-800";
      case "MATERNITY": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
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
            {isHrLeaveDashboard && hrDashboard?.totalEmployees != null && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                    <p className="text-2xl font-bold text-gray-900">{hrDashboard.totalEmployees}</p>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </div>
            )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Annual Leave</h3>
              <span className="text-xs text-gray-500">{leaveBalance.annual?.display ?? `${leaveBalance.annual?.used ?? 0}/${leaveBalance.annual?.total ?? 30}`} days</span>
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
            {leaveBalance.annual?.fromCarryForward > 0 && (
              <p className="text-xs text-indigo-600 mt-1">Incl. {leaveBalance.annual.fromCarryForward} days carry-forward</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Sick Leave</h3>
            <p className="text-sm text-gray-600">{leaveBalance.sick?.display ?? `${leaveBalance.sick?.used ?? 0}/90`} days</p>
            <p className="text-xs text-gray-500 mt-1">Remaining: {leaveBalance.sick?.remaining ?? 90} days</p>
            {leaveBalance.sick?.note && <p className="text-xs text-gray-500 mt-1">{leaveBalance.sick.note}</p>}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Emergency Leave</h3>
            <p className="text-sm text-gray-600">Used this year: {leaveBalance.emergency?.used ?? 0} days</p>
            {leaveBalance.emergency?.note && <p className="text-xs text-gray-500 mt-1">{leaveBalance.emergency.note}</p>}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Unpaid / Other</h3>
            <p className="text-sm text-gray-600">Unpaid: no limit</p>
            {leaveBalance.unpaid?.note && <p className="text-xs text-gray-500 mt-1">{leaveBalance.unpaid.note}</p>}
          </div>
        </div>
        {/* HR: Leave statistics and per-employee balance summary */}
        {isHrLeaveDashboard && hrDashboard?.stats && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">HR Leave Statistics ({hrDashboard.year})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div><span className="text-gray-600">Annual Leave taken (total):</span> <strong>{hrDashboard.stats.totalAnnualTaken}</strong> days</div>
              <div><span className="text-gray-600">Sick Leave taken:</span> <strong>{hrDashboard.stats.totalSickTaken}</strong> days</div>
              <div><span className="text-gray-600">Emergency taken:</span> <strong>{hrDashboard.stats.totalEmergencyTaken}</strong> days</div>
              <div><span className="text-gray-600">Special (Bereavement/Paternity/Maternity):</span> <strong>{hrDashboard.stats.totalBereavementTaken + hrDashboard.stats.totalPaternityTaken + hrDashboard.stats.totalMaternityTaken}</strong> days</div>
            </div>
            <p className="text-xs text-gray-500 mb-4">{hrDashboard.stats.sickBreakdown}</p>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Leave balance per employee (sample)</h3>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Employee</th>
                    <th className="text-left py-2">Annual (used/remaining/total)</th>
                    <th className="text-left py-2">Sick (used/remaining)</th>
                    <th className="text-left py-2">Emergency used</th>
                  </tr>
                </thead>
                <tbody>
                  {(employeeBalances || []).map((row) => (
                    <tr key={row.user?.id} className="border-b border-gray-100">
                      <td className="py-2">{row.user ? `${row.user.firstName} ${row.user.lastName}` : "-"}</td>
                      <td className="py-2">{row.annual?.used ?? 0} / {row.annual?.remaining ?? 0} / {row.annual?.total ?? 30}</td>
                      <td className="py-2">{row.sick?.used ?? 0} / {row.sick?.remaining ?? 90}</td>
                      <td className="py-2">{row.emergencyUsed ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {toast && !showRequestModal && (
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
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {isHrLeaveDashboard && (
                <>
                  <input
                    type="text"
                    placeholder="Search by employee name..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48"
                  />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    title="From date"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    title="To date"
                  />
                  <button
                    onClick={() => { setHrView(hrView === "certificates" ? "list" : "certificates"); if (hrView !== "certificates") loadCertificates(); }}
                    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${hrView === "certificates" ? "bg-indigo-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  >
                    View Certificates
                  </button>
                  <button
                    onClick={() => { setHrView(hrView === "reports" ? "list" : "reports"); if (hrView !== "reports") loadReports(); }}
                    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${hrView === "reports" ? "bg-indigo-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  >
                    Leave Report
                  </button>
                  <button
                    onClick={handleDownloadReport}
                    className="inline-flex items-center px-4 py-2 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Download Report
                  </button>
                </>
              )}
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

        {/* HR: Certificates view */}
        {isHrLeaveDashboard && hrView === "certificates" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All leave documents (certificates / proofs)</h2>
            {certificatesList.length === 0 ? (
              <p className="text-gray-500">No leave requests with documents yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Employee</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Dates</th>
                      <th className="text-left py-2">Submitted</th>
                      <th className="text-left py-2">Documents</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificatesList.map((row) => (
                      <tr key={row.id} className="border-b border-gray-100">
                        <td className="py-2">{row.user ? `${row.user.firstName} ${row.user.lastName}` : "-"}</td>
                        <td className="py-2">{getTypeLabel(row.type)}</td>
                        <td className="py-2">{row.status}</td>
                        <td className="py-2">{row.startDate && new Date(row.startDate).toLocaleDateString()} – {row.endDate && new Date(row.endDate).toLocaleDateString()}</td>
                        <td className="py-2">{row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}</td>
                        <td className="py-2">
                          {(row.documents || []).map((d, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleDownloadDoc(row.id, d.path?.split("/").pop(), d.fileName)}
                              className="text-indigo-600 hover:underline mr-2"
                            >
                              {d.fileName || "Document"}
                            </button>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* HR: Reports view */}
        {isHrLeaveDashboard && hrView === "reports" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave report</h2>
            <div className="flex items-center gap-2 mb-4">
              <label className="text-sm text-gray-700">Year</label>
              <select
                value={reportYear}
                onChange={(e) => { setReportYear(Number(e.target.value)); setReportsData(null); }}
                className="border rounded px-2 py-1"
              >
                {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <button onClick={loadReports} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Load</button>
            </div>
            {reportsData && (
              <div className="space-y-4">
                <p><strong>Total requests:</strong> {reportsData.totalRequests}</p>
                <p><strong>By type:</strong></p>
                <ul className="list-disc pl-6">
                  {reportsData.byType?.map((t) => (
                    <li key={t.type}>{t.type}: {t._count?.id ?? 0} requests, {t._sum?.days ?? 0} days</li>
                  ))}
                </ul>
                <p><strong>By status:</strong></p>
                <ul className="list-disc pl-6">
                  {reportsData.byStatus?.map((s) => (
                    <li key={s.status}>{s.status}: {s._count?.id ?? 0}</li>
                  ))}
                </ul>
                {reportsData.pendingRequiringDocs?.length > 0 && (
                  <p className="text-amber-700"><strong>Pending without documents:</strong> {reportsData.pendingRequiringDocs.length} (Sick/Maternity/Bereavement)</p>
                )}
              </div>
            )}
          </div>
        )}

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
                    const mas = request.managerApprovalStatus || "NOT_REQUIRED";
                    const hrCanAct =
                      isHrLeaveDashboard &&
                      isPending &&
                      mas !== "PENDING";
                    const workflowLabel = formatLeaveWorkflowStatus(request);
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
                            <span className="ml-1">{workflowLabel}</span>
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
                            {hrCanAct && (
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
                                <button
                                  onClick={() => handleRescheduleOpen(request)}
                                  disabled={actionLoading}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Reschedule"
                                >
                                  <ArrowPathIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {isHrLeaveDashboard && isPending && mas === "PENDING" && (
                              <span className="text-[10px] text-amber-700 max-w-[7rem] leading-tight" title="Waiting for line manager">
                                Awaiting manager
                              </span>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Request Leave</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {newRequest.type === "ANNUAL" && (
              <p className="mb-4 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                Annual leave must be submitted at least 30 days in advance.
              </p>
            )}

            {requestValidationError && (
              <p className="mb-4 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {requestValidationError}
              </p>
            )}

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
              
              {newRequest.type === "BEREAVEMENT" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relation *</label>
                  <select
                    value={newRequest.relationOrContext}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, relationOrContext: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select relation</option>
                    <option value="spouse">Spouse (5 days)</option>
                    <option value="first_degree">First-degree relative (3 days)</option>
                  </select>
                </div>
              )}
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
              {["SICK", "MATERNITY", "BEREAVEMENT"].includes(newRequest.type) && (
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                  After submitting, upload your medical certificate or supporting document in the leave details. Approval requires at least one document.
                </p>
              )}
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
                    <span className="ml-1">{formatLeaveWorkflowStatus(selectedRequest)}</span>
                  </span>
                </div>
              </div>
              {selectedRequest.managerApprovalStatus === "APPROVED" && selectedRequest.managerActionBy && (
                <div className="bg-indigo-50 p-3 rounded-lg text-sm">
                  <span className="font-medium text-indigo-800">Manager approved and forwarded to HR</span>
                  <p className="text-indigo-900 mt-1">
                    {selectedRequest.managerActionBy.firstName} {selectedRequest.managerActionBy.lastName}
                    {selectedRequest.managerActionAt &&
                      ` · ${new Date(selectedRequest.managerActionAt).toLocaleString()}`}
                  </p>
                </div>
              )}
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
              {selectedRequest.relationOrContext && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relation / Context</label>
                  <p className="text-sm text-gray-900">{selectedRequest.relationOrContext}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Documents</label>
                {leaveDocuments.length > 0 ? (
                  <ul className="space-y-1">
                    {leaveDocuments.map((d, i) => (
                      <li key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate">{d.fileName || d.path?.split("/").pop()}</span>
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(selectedRequest.id, d.path?.split("/").pop() || d.fileName, d.fileName)}
                          className="ml-2 text-indigo-600 hover:underline"
                        >
                          Download
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No documents uploaded</p>
                )}
                {(selectedRequest.status || "").toUpperCase() === "PENDING" && ["SICK", "MATERNITY", "BEREAVEMENT"].includes(selectedRequest.type) && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">Upload medical certificate / proof (required for approval)</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      multiple
                      disabled={uploadDocLoading}
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files?.length) handleUploadDocuments(selectedRequest.id, files);
                        e.target.value = "";
                      }}
                      className="text-sm"
                    />
                    {uploadDocLoading && <span className="text-xs text-gray-500">Uploading...</span>}
                  </div>
                )}
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

      {/* Reschedule Leave Modal (HR/Admin) */}
      {showRescheduleModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Reschedule Leave</h2>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">New dates (max 3 months from original end). Working days only.</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New start date *</label>
                <input
                  type="date"
                  value={rescheduleDates.startDate}
                  onChange={(e) => setRescheduleDates((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New end date *</label>
                <input
                  type="date"
                  value={rescheduleDates.endDate}
                  onChange={(e) => setRescheduleDates((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Rescheduling..." : "Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 