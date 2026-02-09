import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  getOfficeLocation,
  getTodayAttendance,
  getAttendanceStats,
  getMyAttendance,
  markAttendance,
} from "../../services/attendanceAPI";

// Haversine formula: distance in meters between two coordinates
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const RADIUS_METERS = 200;

export default function MyAttendance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Location & proximity state
  const [locationStatus, setLocationStatus] = useState("loading"); // loading | allowed | denied | error | unsupported
  const [locationError, setLocationError] = useState("");
  const [userCoords, setUserCoords] = useState(null); // { latitude, longitude, accuracy }
  const [officeLocation, setOfficeLocation] = useState(null); // { latitude, longitude, radius }
  const [distanceFromOffice, setDistanceFromOffice] = useState(null); // meters
  const [isWithinRadius, setIsWithinRadius] = useState(false);

  // API data
  const [todayData, setTodayData] = useState(null);
  const [stats, setStats] = useState({
    thisWeek: "0.0",
    present: 0,
    absent: 0,
    onLeave: 0,
    workedUpHours: "0.0",
  });
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch office location
  const fetchOfficeLocation = useCallback(async () => {
    try {
      const res = await getOfficeLocation();
      if (res.success && res.data) {
        setOfficeLocation({
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          radius: res.data.radius ?? RADIUS_METERS,
        });
        return res.data;
      }
    } catch (err) {
      console.error("Office location error:", err);
      setLocationStatus("error");
      setLocationError(err.message || "Could not load office location. Contact administrator.");
    }
    return null;
  }, []);

  // Get user's position (GPS)
  const fetchUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      setLocationError("Location is not supported by your browser.");
      return Promise.resolve(null);
    }

    setLocationStatus("loading");
    setLocationError("");

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy ?? null,
          };
          setUserCoords(coords);
          setLocationStatus("allowed");
          setLocationError("");
          resolve(coords);
        },
        (err) => {
          let msg = "Could not get your location.";
          if (err.code === 1) msg = "Location permission denied. Enable location access to mark attendance.";
          else if (err.code === 2) msg = "Location unavailable. Check your GPS/network.";
          else if (err.code === 3) msg = "Location request timed out. Please try again.";
          setLocationError(msg);
          setLocationStatus("denied");
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, []);

  // Check proximity: fetch office, then user location, then compute distance
  const checkProximity = useCallback(async () => {
    const office = officeLocation || (await fetchOfficeLocation());
    if (!office) return;

    const coords = userCoords || (await fetchUserLocation());
    if (!coords) return;

    const distance = getDistanceMeters(
      coords.latitude,
      coords.longitude,
      office.latitude,
      office.longitude
    );
    const radius = office.radius ?? RADIUS_METERS;
    setDistanceFromOffice(distance);
    setIsWithinRadius(distance <= radius);
  }, [officeLocation, userCoords, fetchOfficeLocation, fetchUserLocation]);

  // Load office location and user location on mount, then proximity
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const office = await fetchOfficeLocation();
      if (cancelled || !office) return;
      await fetchUserLocation();
    }

    init();
    return () => { cancelled = true; };
  }, [fetchOfficeLocation, fetchUserLocation]);

  useEffect(() => {
    if (officeLocation && userCoords) {
      const distance = getDistanceMeters(
        userCoords.latitude,
        userCoords.longitude,
        officeLocation.latitude,
        officeLocation.longitude
      );
      const radius = officeLocation.radius ?? RADIUS_METERS;
      setDistanceFromOffice(distance);
      setIsWithinRadius(distance <= radius);
    }
  }, [officeLocation, userCoords]);

  // Fetch today's attendance and stats
  const loadAttendanceData = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, statsRes, logsRes] = await Promise.all([
        getTodayAttendance(),
        getAttendanceStats(),
        getMyAttendance({ limit: 100 }),
      ]);

      if (todayRes?.success && todayRes.data) {
        setTodayData(todayRes.data);
        const hasCheckIn = !!todayRes.data.checkIn;
        const hasCheckOut = !!todayRes.data.checkOut;
        setIsClockedIn(hasCheckIn && !hasCheckOut);
        if (todayRes.data.checkIn?.time) {
          setClockInTime(new Date(todayRes.data.checkIn.time));
        }
      }

      if (statsRes?.success && statsRes.data) {
        setStats({
          thisWeek: statsRes.data.thisWeek?.hours ?? "0.0",
          present: statsRes.data.present ?? 0,
          absent: statsRes.data.absent ?? 0,
          onLeave: statsRes.data.onLeave ?? 0,
          workedUpHours: statsRes.data.workedUpHours ?? "0.0",
        });
      }

      if (logsRes?.success && Array.isArray(logsRes.data)) {
        setAttendanceLogs(logsRes.data);
      }
    } catch (err) {
      console.error("Load attendance error:", err);
      setToast({ message: err.message || "Failed to load attendance", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  const handleClockIn = async () => {
    if (!userCoords || !isWithinRadius) return;
    setActionLoading(true);
    setToast(null);
    try {
      const res = await markAttendance(
        "CHECK_IN",
        userCoords.latitude,
        userCoords.longitude,
        userCoords.accuracy
      );
      if (res.success) {
        setIsClockedIn(true);
        setClockInTime(new Date());
        setToast({ message: "Check-in recorded successfully", type: "success" });
        loadAttendanceData();
      } else {
        setToast({ message: res.message || "Check-in failed", type: "error" });
      }
    } catch (err) {
      setToast({ message: err.message || "Check-in failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!userCoords || !isWithinRadius) return;
    setActionLoading(true);
    setToast(null);
    try {
      const res = await markAttendance(
        "CHECK_OUT",
        userCoords.latitude,
        userCoords.longitude,
        userCoords.accuracy
      );
      if (res.success) {
        setIsClockedIn(false);
        setClockInTime(null);
        setToast({ message: "Check-out recorded successfully", type: "success" });
        loadAttendanceData();
      } else {
        setToast({ message: res.message || "Check-out failed", type: "error" });
      }
    } catch (err) {
      setToast({ message: err.message || "Check-out failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryLocation = () => {
    setUserCoords(null);
    fetchUserLocation();
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
      case "PRESENT":
        return "bg-green-100 text-green-800 border-green-200";
      case "absent":
      case "ABSENT":
        return "bg-red-100 text-red-800 border-red-200";
      case "leave":
      case "ON_LEAVE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "present") return <CheckCircleIcon className="h-4 w-4" />;
    if (s === "absent") return <XCircleIcon className="h-4 w-4" />;
    if (s === "leave" || s === "on_leave") return <CalendarDaysIcon className="h-4 w-4" />;
    return null;
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const canMarkAttendance =
    locationStatus === "allowed" &&
    isWithinRadius &&
    userCoords &&
    !actionLoading;

  const proximityMessage =
    locationStatus === "allowed" &&
    !isWithinRadius &&
    distanceFromOffice != null &&
    `You must be within ${officeLocation?.radius ?? RADIUS_METERS} meters of the office to mark attendance. You are ${distanceFromOffice.toFixed(0)} m away.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <CalendarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Attendance
              </h1>
              <p className="text-gray-600 mt-1">Track your daily attendance and working hours</p>
            </div>
          </div>

          {/* Proximity / Location status */}
          {locationStatus === "loading" && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span className="text-blue-800">Checking your location...</span>
            </div>
          )}
          {(locationStatus === "denied" || locationStatus === "error" || locationStatus === "unsupported") && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">{locationError}</p>
                {(locationStatus === "denied" || locationStatus === "error") && (
                  <button
                    type="button"
                    onClick={handleRetryLocation}
                    className="mt-2 text-sm text-red-600 hover:underline"
                  >
                    Retry location
                  </button>
                )}
              </div>
            </div>
          )}
          {proximityMessage && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <MapPinIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800">{proximityMessage}</p>
              <button
                type="button"
                onClick={checkProximity}
                className="ml-auto text-sm text-amber-700 hover:underline"
              >
                Recheck
              </button>
            </div>
          )}
          {locationStatus === "allowed" && isWithinRadius && distanceFromOffice != null && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-green-800">
                Within office range ({distanceFromOffice.toFixed(0)} m). You can mark attendance.
              </span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}h</p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircleIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On Leave</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.onLeave}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Worked Up Hours</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.workedUpHours}h</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <button
                onClick={() => setShowLogsModal(true)}
                className="inline-flex items-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <EyeIcon className="h-5 w-5 mr-2" />
                View Logs
              </button>
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                <ClockIcon className="h-5 w-5 text-gray-600" />
                <span className="text-lg font-mono font-semibold text-gray-900">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
                  }
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ←
                </button>
                <span className="text-lg font-semibold text-gray-900 px-4">{monthName}</span>
                <button
                  onClick={() =>
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
                  }
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  →
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {canMarkAttendance ? (
                <button
                  onClick={isClockedIn ? handleClockOut : handleClockIn}
                  disabled={actionLoading}
                  className={`inline-flex items-center px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 ${
                    isClockedIn
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                  }`}
                >
                  <ClockIcon className="h-5 w-5 mr-2" />
                  {actionLoading ? "..." : isClockedIn ? "Check Out" : "Check In"}
                </button>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center px-6 py-3 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                  title={
                    !isWithinRadius
                      ? "You must be within 200 meters of the office to mark attendance."
                      : "Enable location and allow access to mark attendance."
                  }
                >
                  <ClockIcon className="h-5 w-5 mr-2" />
                  {isClockedIn ? "Check Out" : "Check In"}
                </button>
              )}
            </div>
          </div>
          {toast && (
            <div
              className={`mt-4 p-3 rounded-lg ${
                toast.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
              }`}
            >
              {toast.message}
            </div>
          )}
        </div>

        {/* Calendar - build from logs for the month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg"
                >
                  {day}
                </div>
              ))}
              {Array.from({ length: startingDay }, (_, i) => (
                <div key={`empty-${i}`} className="p-3" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dateStr = date.toISOString().split("T")[0];
                const dateMatch = (d) => d && String(d).slice(0, 10) === dateStr;
                const checkInLog = attendanceLogs.find(
                  (a) => a.type === "CHECK_IN" && dateMatch(a.date)
                );
                const checkOutLog = attendanceLogs.find(
                  (a) => a.type === "CHECK_OUT" && dateMatch(a.date)
                );
                const isToday = date.toDateString() === new Date().toDateString();
                const status = checkInLog ? "present" : null;
                const clockIn = checkInLog?.checkInTime
                  ? new Date(checkInLog.checkInTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null;
                const clockOut = checkOutLog?.checkOutTime
                  ? new Date(checkOutLog.checkOutTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null;
                const hours =
                  checkInLog?.checkInTime && checkOutLog?.checkOutTime
                    ? (
                        (new Date(checkOutLog.checkOutTime) - new Date(checkInLog.checkInTime)) /
                        (1000 * 60 * 60)
                      ).toFixed(1)
                    : null;

                return (
                  <div
                    key={day}
                    className={`p-3 min-h-[80px] border border-gray-100 rounded-lg ${
                      isToday ? "ring-2 ring-indigo-500 ring-opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-medium ${
                          isToday ? "text-indigo-600" : "text-gray-900"
                        }`}
                      >
                        {day}
                      </span>
                      {isToday && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
                    </div>
                    {status && (
                      <div className="space-y-1">
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                            status
                          )}`}
                        >
                          {getStatusIcon(status)}
                          <span className="capitalize">{status}</span>
                        </div>
                        {clockIn && (
                          <div className="text-xs text-gray-600">
                            {clockIn} - {clockOut || "..."}
                          </div>
                        )}
                        {hours && (
                          <div className="text-xs font-medium text-gray-700">{hours}h</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Attendance Logs</h2>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No attendance records yet.
                      </td>
                    </tr>
                  ) : (
                    attendanceLogs
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {row.date ? new Date(row.date).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.type === "CHECK_IN" ? "Check In" : "Check Out"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.checkInTime
                              ? new Date(row.checkInTime).toLocaleTimeString()
                              : row.checkOutTime
                              ? new Date(row.checkOutTime).toLocaleTimeString()
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.distanceFromOffice != null
                              ? `${row.distanceFromOffice.toFixed(0)} m`
                              : "-"}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
