import React, { useCallback, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import { format, startOfMonth, endOfMonth, endOfDay, isSameDay } from "date-fns";
import { ClockIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import "react-calendar/dist/Calendar.css";
import "../modules/calendar-custom.css";
import { listActivityEvents } from "../services/activityAPI";
import { getEmployees } from "../services/employeeAPI";

function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function actionDetailText(row) {
  if (!row) return "—";
  if (row.action && String(row.action).trim()) return String(row.action).trim();
  // For PAGE_VIEW entries where action wasn't recorded in older logs:
  if (row.eventType === "PAGE_VIEW" && row.module) return "VIEW";
  if (row.eventType === "ACTION") return "(action)";
  return "—";
}

function metadataSummary(row) {
  const md = row?.metadata;
  if (!md || typeof md !== "object") return "";
  const title = typeof md.title === "string" ? md.title.trim() : "";
  const parts = [];
  if (title) parts.push(title);
  // Show a small hint for common keys without dumping full JSON
  const keys = ["id", "employeeId", "clientId", "projectId", "taskId", "status"];
  for (const k of keys) {
    const v = md[k];
    if (v == null) continue;
    const s = String(v);
    if (s.trim()) parts.push(`${k}=${s}`);
  }
  return parts.length ? parts.join(" · ") : "";
}

/** Pair LOGIN/LOGOUT chronologically; sum session length in minutes (same user, same day). */
function sessionMinutesFromEvents(dayEvents) {
  const auth = dayEvents
    .filter((e) => e.eventType === "LOGIN" || e.eventType === "LOGOUT")
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const stack = [];
  let ms = 0;
  for (const e of auth) {
    const t = new Date(e.createdAt).getTime();
    if (e.eventType === "LOGIN") stack.push(t);
    else if (e.eventType === "LOGOUT" && stack.length) {
      const login = stack.pop();
      ms += Math.max(0, t - login);
    }
  }
  return Math.round(ms / 60000);
}

export default function EmployeeActivityCalendar() {
  const [activeMonth, setActiveMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [filterUserId, setFilterUserId] = useState("");
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getEmployees({ limit: 500, page: 1 });
      if (!cancelled && res.success && Array.isArray(res.data)) {
        setEmployees(res.data);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const range = useMemo(() => {
    const start = startOfMonth(activeMonth);
    const end = endOfDay(endOfMonth(activeMonth));
    return { from: start.toISOString(), to: end.toISOString() };
  }, [activeMonth]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listActivityEvents({
        from: range.from,
        to: range.to,
        userId: filterUserId || undefined,
      });
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message || "Failed to load activity");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to, filterUserId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const countsByDay = useMemo(() => {
    const map = {};
    for (const e of events) {
      const key = format(new Date(e.createdAt), "yyyy-MM-dd");
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [events]);

  const dayEvents = useMemo(() => {
    return events.filter((e) => isSameDay(new Date(e.createdAt), selectedDate));
  }, [events, selectedDate]);

  const sortedDayEvents = useMemo(() => {
    return [...dayEvents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [dayEvents]);

  const approxSessionMinutes = useMemo(
    () => sessionMinutesFromEvents(dayEvents),
    [dayEvents]
  );

  const moduleHits = useMemo(() => {
    const m = {};
    for (const e of dayEvents) {
      if (e.eventType !== "PAGE_VIEW" && e.eventType !== "ACTION") continue;
      const key = e.module || "(unknown)";
      m[key] = (m[key] || 0) + 1;
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [dayEvents]);

  return (
    <div className="p-4 lg:p-6 max-w-full activity-calendar-scope">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <ClockIcon className="h-7 w-7 text-indigo-600" />
            Employee Activity Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Login and logout times, navigation (modules), and actions — separate from attendance and leave.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadEvents()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
        <div className="w-full xl:w-auto xl:min-w-[320px] shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 calendar-attractive">
            <label className="block text-sm font-medium text-slate-700 mb-2">Employee filter</label>
            <select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 text-sm mb-4"
            >
              <option value="">All employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {(emp.firstName || "") + " " + (emp.lastName || "")} ({emp.email || emp.id})
                </option>
              ))}
            </select>
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              onActiveStartDateChange={({ activeStartDate }) => {
                if (activeStartDate) setActiveMonth(activeStartDate);
              }}
              tileClassName={({ date, view }) => {
                if (view !== "month") return null;
                const key = format(date, "yyyy-MM-dd");
                return countsByDay[key] ? "activity-calendar-has-events" : null;
              }}
            />
            {error && (
              <p className="text-sm text-red-600 mt-3">{error}</p>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:p-6">
            <h2 className="text-lg font-semibold text-slate-800">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h2>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
              <span>
                <strong className="text-slate-800">{sortedDayEvents.length}</strong> events
              </span>
              <span>
                Approx. session time (from login/logout pairs):{" "}
                <strong className="text-slate-800">{approxSessionMinutes} min</strong>
              </span>
            </div>

            {moduleHits.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-700">Modules / routes (PAGE_VIEW and ACTION)</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {moduleHits.slice(0, 12).map(([mod, n]) => (
                    <li
                      key={mod}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                    >
                      {mod} <span className="text-slate-500">×{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2 pr-4 font-medium">Time</th>
                    <th className="py-2 pr-4 font-medium">User</th>
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 pr-4 font-medium">Module</th>
                    <th className="py-2 font-medium">Action / detail</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDayEvents.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No activity recorded for this day in the selected range.
                      </td>
                    </tr>
                  )}
                  {sortedDayEvents.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                      <td className="py-2 pr-4 whitespace-nowrap text-slate-700">
                        {formatTime(row.createdAt)}
                      </td>
                      <td className="py-2 pr-4 text-slate-700">
                        {row.user
                          ? `${row.user.firstName || ""} ${row.user.lastName || ""}`.trim() || row.user.email
                          : "—"}
                      </td>
                      <td className="py-2 pr-4">
                        <span className="rounded bg-indigo-50 text-indigo-800 px-2 py-0.5 text-xs font-medium">
                          {row.eventType}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-slate-600 max-w-[200px] truncate" title={row.module || ""}>
                        {row.module || "—"}
                      </td>
                      <td
                        className="py-2 text-slate-700 max-w-md"
                        title={[
                          actionDetailText(row),
                          metadataSummary(row),
                        ].filter(Boolean).join(" | ")}
                      >
                        <div className="truncate">
                          {actionDetailText(row)}
                          {row.durationSeconds != null ? ` (${row.durationSeconds}s)` : ""}
                        </div>
                        {metadataSummary(row) ? (
                          <div className="text-xs text-slate-500 truncate mt-0.5">
                            {metadataSummary(row)}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .activity-calendar-scope .react-calendar__tile.activity-calendar-has-events {
          background: #e0e7ff;
          font-weight: 600;
        }
        .activity-calendar-scope .react-calendar__tile.activity-calendar-has-events:enabled:hover,
        .activity-calendar-scope .react-calendar__tile.activity-calendar-has-events:enabled:focus {
          background: #c7d2fe;
        }
      `}</style>
    </div>
  );
}
