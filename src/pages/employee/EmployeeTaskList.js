import React, { useEffect, useState } from "react";
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { apiClient } from "../../utils/apiClient";
import { useAuth } from "../../contexts/AuthContext";

function statusColor(workflowStatus, status) {
  if (status === "COMPLETED" || workflowStatus === "COMPLETED") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (workflowStatus === "WAITING_FOR_PREDECESSOR") {
    return "bg-slate-100 text-slate-500 border-slate-200";
  }
  return "bg-sky-100 text-sky-700 border-sky-200";
}

export default function EmployeeTaskList() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get("/tasks?page=1&limit=200&sortBy=dueDate&sortOrder=asc");
        const tasks = Array.isArray(res.data) ? res.data : [];
        const myId = user?.id;

        const rows = [];
        tasks.forEach((t) => {
          // Main task directly assigned
          if (t.assignedEmployeeId === myId) {
            rows.push({
              id: t.id,
              title: t.title,
              project: t.project?.name || "",
              status: t.status,
              workflowStatus: t.workflowStatus,
              predecessorId: t.predecessorId,
            });
          }
          // Subtasks and child subtasks
          (t.subtasks || []).forEach((st) => {
            if (st.assignedEmployeeId === myId) {
              rows.push({
                id: st.id,
                title: st.title,
                project: t.project?.name || "",
                status: st.status,
                workflowStatus: st.workflowStatus,
                predecessorId: st.predecessorId,
              });
            }
            (st.subtasks || []).forEach((ct) => {
              if (ct.assignedEmployeeId === myId) {
                rows.push({
                  id: ct.id,
                  title: ct.title,
                  project: t.project?.name || "",
                  status: ct.status,
                  workflowStatus: ct.workflowStatus,
                  predecessorId: ct.predecessorId,
                });
              }
            });
          });
        });

        setRows(rows);
      } catch (err) {
        console.error("Failed to load employee tasks", err);
        setError(err.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const handleStatusChange = async (row, nextStatus) => {
    try {
      setUpdatingId(row.id);
      await apiClient.put(`/tasks/${row.id}`, { status: nextStatus });
      // Reload rows
      const updated = rows.map((r) =>
        r.id === row.id ? { ...r, status: nextStatus, workflowStatus: nextStatus === "COMPLETED" ? "COMPLETED" : r.workflowStatus } : r
      );
      setRows(updated);
    } catch (err) {
      // Handle lock error from backend
      if (err.message?.includes("locked until predecessor is completed")) {
        alert(err.message);
      } else {
        alert(err.message || "Failed to update task");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600 mb-2 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5" />
          {error}
        </p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="p-6">
        <p className="text-slate-600">You currently have no assigned tasks.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">My Tasks</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Project</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Task</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const locked = row.workflowStatus === "WAITING_FOR_PREDECESSOR";
              const canComplete = !locked && row.status !== "COMPLETED";
              return (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{row.project || "—"}</td>
                  <td className="px-4 py-3 text-slate-800">{row.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor(row.workflowStatus, row.status)}`}>
                      {locked ? <ClockIcon className="h-3.5 w-3.5" /> : <CheckCircleIcon className="h-3.5 w-3.5" />}
                      {locked ? "Locked (waiting for previous task)" : row.status || "PENDING"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={!canComplete || updatingId === row.id}
                      onClick={() => handleStatusChange(row, "COMPLETED")}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        canComplete
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      Mark Done
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

