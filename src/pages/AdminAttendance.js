import React, { useState, useEffect, useCallback } from "react";
import { CalendarDaysIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { getAllAttendanceForAdmin } from "../services/attendanceAPI";

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function formatHours(hours) {
  if (hours == null) return "—";
  return `${Number(hours).toFixed(1)}h`;
}

export default function AdminAttendance() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllAttendanceForAdmin(selectedDate);
      if (res && res.success && Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load attendance");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-4 lg:p-6 max-w-full">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left: Attendance list / date selector */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-indigo-600" />
              Attendance List
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a date to view that day&apos;s attendance.
            </p>
            <label className="block mt-4 text-sm font-medium text-slate-700">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Right: Detailed attendance panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-800">
                Employee Attendance — {selectedDate}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Data from Employee module. Refreshes when you change the date or click Refresh.
              </p>
            </div>
            <div className="overflow-x-auto">
              {error && (
                <div className="mx-4 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              )}
              {!loading && !error && (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Employee Name
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Check-in Time
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Check-out Time
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Total Working Hours
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Attendance Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">
                          No attendance records for this date.
                        </td>
                      </tr>
                    ) : (
                      data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-800 whitespace-nowrap">
                            {row.employeeName || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                            {row.employeeId || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                            {formatTime(row.checkInTime)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                            {formatTime(row.checkOutTime)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                            {formatHours(row.totalWorkingHours)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                            {formatDate(row.attendanceDate)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
