/**
 * Human-readable workflow label for leave requests (manager → HR pipeline).
 */
export function formatLeaveWorkflowStatus(request) {
  const st = (request?.status || "").toUpperCase();
  const mas = request?.managerApprovalStatus || "NOT_REQUIRED";
  if (st === "REJECTED" && mas === "REJECTED") return "Rejected (Manager)";
  if (st === "REJECTED") return "Rejected (Admin/HR)";
  if (st === "APPROVED") return "Approved";
  if (st === "PENDING" && mas === "PENDING") return "Pending (Manager)";
  if (st === "PENDING" && (mas === "APPROVED" || mas === "NOT_REQUIRED")) {
    return "Pending (Admin/HR)";
  }
  return st || "—";
}

/** Annual & unpaid require manager first when employee has a line manager (backend sets managerApprovalStatus). */
export function leaveTypeNeedsManagerFirst(type) {
  return type === "ANNUAL" || type === "UNPAID";
}
