import React, { useState, useEffect } from "react";
import { 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  PlusIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  UserIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

export default function MyAttendance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    date: '',
    status: 'present',
    clockIn: '',
    clockOut: '',
    notes: ''
  });

  // Mock attendance data
  const [attendanceData, setAttendanceData] = useState({
    '2024-02-01': { status: 'present', clockIn: '09:00', clockOut: '17:00', hours: 8 },
    '2024-02-02': { status: 'present', clockIn: '08:45', clockOut: '17:15', hours: 8.5 },
    '2024-02-05': { status: 'present', clockIn: '09:15', clockOut: '17:30', hours: 8.25 },
    '2024-02-06': { status: 'absent' },
    '2024-02-07': { status: 'leave' },
    '2024-02-08': { status: 'present', clockIn: '08:30', clockOut: '16:45', hours: 8.25 },
    '2024-02-09': { status: 'present', clockIn: '09:00', clockOut: '17:00', hours: 8 },
    '2024-02-12': { status: 'present', clockIn: '08:45', clockOut: '17:15', hours: 8.5 },
    '2024-02-13': { status: 'present', clockIn: '09:00', clockOut: '17:00', hours: 8 },
    '2024-02-14': { status: 'present', clockIn: '08:30', clockOut: '16:30', hours: 8 },
    '2024-02-15': { status: 'present', clockIn: '09:15', clockOut: '17:30', hours: 8.25 },
    '2024-02-16': { status: 'present', clockIn: '08:45', clockOut: '17:00', hours: 8.25 },
    '2024-02-19': { status: 'present', clockIn: '09:00', clockOut: '17:00', hours: 8 },
    '2024-02-20': { status: 'present', clockIn: '08:30', clockOut: '16:45', hours: 8.25 },
    '2024-02-21': { status: 'present', clockIn: '09:00', clockOut: '17:15', hours: 8.25 },
    '2024-02-22': { status: 'present', clockIn: '08:45', clockOut: '17:00', hours: 8.25 },
    '2024-02-23': { status: 'present', clockIn: '09:00', clockOut: '17:00', hours: 8 },
    '2024-02-26': { status: 'present', clockIn: '08:30', clockOut: '16:30', hours: 8 },
    '2024-02-27': { status: 'present', clockIn: '09:15', clockOut: '17:30', hours: 8.25 },
    '2024-02-28': { status: 'present', clockIn: '08:45', clockOut: '17:00', hours: 8.25 },
    '2024-02-29': { status: 'present', clockIn: '09:00', clockOut: '17:00', hours: 8 }
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    setIsClockedIn(true);
    setClockInTime(currentTime);
    const today = currentTime.toISOString().split('T')[0];
    setAttendanceData(prev => ({
      ...prev,
      [today]: {
        ...prev[today],
        status: 'present',
        clockIn: currentTime.toTimeString().slice(0, 5),
        hours: 0
      }
    }));
  };

  const handleClockOut = () => {
    setIsClockedIn(false);
    const today = currentTime.toISOString().split('T')[0];
    const clockOutTime = currentTime.toTimeString().slice(0, 5);
    
    if (clockInTime) {
      const hours = ((currentTime - clockInTime) / (1000 * 60 * 60)).toFixed(2);
      setAttendanceData(prev => ({
        ...prev,
        [today]: {
          ...prev[today],
          status: 'present',
          clockIn: clockInTime.toTimeString().slice(0, 5),
          clockOut: clockOutTime,
          hours: parseFloat(hours)
        }
      }));
    }
    setClockInTime(null);
  };

  const handleManualEntry = () => {
    if (!manualEntry.date || !manualEntry.status) {
      alert("Please fill in all required fields");
      return;
    }

    setAttendanceData(prev => ({
      ...prev,
      [manualEntry.date]: {
        status: manualEntry.status,
        clockIn: manualEntry.clockIn || null,
        clockOut: manualEntry.clockOut || null,
        notes: manualEntry.notes || null,
        hours: manualEntry.clockIn && manualEntry.clockOut 
          ? ((new Date(`2000-01-01T${manualEntry.clockOut}`) - new Date(`2000-01-01T${manualEntry.clockIn}`)) / (1000 * 60 * 60)).toFixed(2)
          : null
      }
    }));

    setManualEntry({
      date: '',
      status: 'present',
      clockIn: '',
      clockOut: '',
      notes: ''
    });
    setShowManualEntryModal(false);
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
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'leave': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircleIcon className="h-4 w-4" />;
      case 'absent': return <XCircleIcon className="h-4 w-4" />;
      case 'leave': return <CalendarDaysIcon className="h-4 w-4" />;
      default: return null;
    }
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Calculate weekly hours
  const getCurrentWeekHours = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    let totalHours = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = attendanceData[dateStr];
      if (dayData && dayData.hours) {
        totalHours += dayData.hours;
      }
    }
    return totalHours.toFixed(1);
  };

  // Calculate monthly stats
  const getMonthlyStats = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    let present = 0, absent = 0, leave = 0, totalHours = 0;

    Object.entries(attendanceData).forEach(([date, data]) => {
      const [y, m] = date.split('-').map(Number);
      if (y === year && m === month) {
        if (data.status === 'present') present++;
        else if (data.status === 'absent') absent++;
        else if (data.status === 'leave') leave++;
        if (data.hours) totalHours += data.hours;
      }
    });

    return { present, absent, leave, totalHours: totalHours.toFixed(1) };
  };

  const monthlyStats = getMonthlyStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
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
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{getCurrentWeekHours()}h</p>
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
                  <p className="text-2xl font-bold text-green-600">{monthlyStats.present}</p>
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
                  <p className="text-2xl font-bold text-red-600">{monthlyStats.absent}</p>
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
                  <p className="text-2xl font-bold text-blue-600">{monthlyStats.leave}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Hours</p>
                  <p className="text-2xl font-bold text-purple-600">{monthlyStats.totalHours}h</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Current Time Display */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                <ClockIcon className="h-5 w-5 text-gray-600" />
                <span className="text-lg font-mono font-semibold text-gray-900">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
              
              {/* Month Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ←
                </button>
                <span className="text-lg font-semibold text-gray-900 px-4">{monthName}</span>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  →
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Clock In/Out Button */}
              <button
                onClick={isClockedIn ? handleClockOut : handleClockIn}
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                  isClockedIn
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                }`}
              >
                <ClockIcon className="h-5 w-5 mr-2" />
                {isClockedIn ? "Clock Out" : "Clock In"}
              </button>
              
              {/* Manual Entry Button */}
              <button
                onClick={() => setShowManualEntryModal(true)}
                className="inline-flex items-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Manual Entry
              </button>
              
              {/* View Logs Button */}
              <button
                onClick={() => setShowLogsModal(true)}
                className="inline-flex items-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <EyeIcon className="h-5 w-5 mr-2" />
                View Logs
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1">
              {/* Calendar Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before the first day of the month */}
              {Array.from({ length: startingDay }, (_, i) => (
                <div key={`empty-${i}`} className="p-3"></div>
              ))}
              
              {/* Calendar days */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dateStr = date.toISOString().split('T')[0];
                const dayData = attendanceData[dateStr];
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={day}
                    className={`p-3 min-h-[80px] border border-gray-100 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer ${
                      isToday ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isToday ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {day}
                      </span>
                      {isToday && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      )}
                    </div>
                    
                    {dayData && (
                      <div className="space-y-1">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(dayData.status)}`}>
                          {getStatusIcon(dayData.status)}
                          <span className="capitalize">{dayData.status}</span>
                        </div>
                        {dayData.clockIn && (
                          <div className="text-xs text-gray-600">
                            {dayData.clockIn} - {dayData.clockOut || '...'}
                          </div>
                        )}
                        {dayData.hours && (
                          <div className="text-xs font-medium text-gray-700">
                            {dayData.hours}h
                          </div>
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

      {/* Manual Entry Modal */}
      {showManualEntryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create Manual Entry</h2>
              <button
                onClick={() => setShowManualEntryModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={manualEntry.date}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={manualEntry.status}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
              
              {manualEntry.status === 'present' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clock In Time
                    </label>
                    <input
                      type="time"
                      value={manualEntry.clockIn}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, clockIn: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clock Out Time
                    </label>
                    <input
                      type="time"
                      value={manualEntry.clockOut}
                      onChange={(e) => setManualEntry(prev => ({ ...prev, clockOut: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={manualEntry.notes}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowManualEntryModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleManualEntry}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Logs Modal */}
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clock In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clock Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(attendanceData)
                    .sort(([a], [b]) => new Date(b) - new Date(a))
                    .map(([date, data]) => (
                      <tr key={date} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                            {getStatusIcon(data.status)}
                            <span className="ml-1 capitalize">{data.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.clockIn || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.clockOut || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.hours ? `${data.hours}h` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {data.notes || '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 