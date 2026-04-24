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

/** Office window on the attendance calendar day (local timezone). */
const OFFICE_START_HOUR = 8;
const OFFICE_START_MINUTE = 0;
const OFFICE_END_HOUR = 18;
const OFFICE_END_MINUTE = 30;

/**
 * @param {string} ymd - YYYY-MM-DD
 * @returns {{ officeStart: Date, officeEnd: Date }}
 */
function officeWindowLocal(ymd) {
  const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  const officeStart = new Date(y, m - 1, d, OFFICE_START_HOUR, OFFICE_START_MINUTE, 0, 0);
  const officeEnd = new Date(y, m - 1, d, OFFICE_END_HOUR, OFFICE_END_MINUTE, 0, 0);
  return { officeStart, officeEnd };
}

/**
 * Extra time = minutes before 8:00 AM (early check-in) + minutes after 6:30 PM (late stay).
 * Uses the same local calendar day as the admin date filter.
 */
function computeExtraTimeMinutes(checkInIso, checkOutIso, ymd) {
  const win = officeWindowLocal(ymd);
  if (!win) return null;
  const { officeStart, officeEnd } = win;
  const ci = checkInIso ? new Date(checkInIso) : null;
  const co = checkOutIso ? new Date(checkOutIso) : null;
  let extraMs = 0;
  if (ci && !Number.isNaN(ci.getTime()) && ci < officeStart) {
    extraMs += officeStart.getTime() - ci.getTime();
  }
  if (co && !Number.isNaN(co.getTime()) && co > officeEnd) {
    extraMs += co.getTime() - officeEnd.getTime();
  }
  return extraMs / 60000;
}

function formatExtraTime(minutes) {
  if (minutes == null || minutes <= 0) return "—";
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/** Admin date picker value must match employee local calendar days (not UTC from toISOString). */
function localDateYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AdminAttendance() {
  const [selectedDate, setSelectedDate] = useState(() => localDateYYYYMMDD());
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
            <p className="text-xs text-slate-500 mt-3 leading-relaxed border-t border-slate-100 pt-3">
              Standard office hours:{" "}
              <span className="font-medium text-slate-700">8:00 AM – 6:30 PM</span>.
              Extra time in the table counts early check-in before 8:00 AM and any time
              worked after 6:30 PM (based on check-out).
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
                Extra time uses office hours 8:00 AM–6:30 PM on the selected date (see sidebar).
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
                        Extra Time
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Attendance Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">
                          No attendance records for this date.
                        </td>
                      </tr>
                    ) : (
                      data.map((row, idx) => {
                        const extraMin = computeExtraTimeMinutes(
                          row.checkInTime,
                          row.checkOutTime,
                          selectedDate
                        );
                        return (
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
                          <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap font-medium">
                            {formatExtraTime(extraMin)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                            {formatDate(row.attendanceDate)}
                          </td>
                        </tr>
                        );
                      })
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
