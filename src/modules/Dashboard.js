import React, { useState, useRef } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './calendar-custom.css'; // Custom styles for react-calendar
import DashboardLayout from "../layout/DashboardLayout";
import AdminMessagePopup from "../components/AdminMessagePopup";
import { useLanguage } from "../LanguageContext";
import onixLogo from '../assets/onix-logo.png';

function PieChart({ colors = ["#a78bfa", "#fbbf24", "#f87171"], size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className="mx-auto">
      <circle r="16" cx="16" cy="16" fill={colors[0]} />
      <path d="M16 16 L16 0 A16 16 0 0 1 32 16 Z" fill={colors[1]} />
      <path d="M16 16 L32 16 A16 16 0 0 1 16 32 Z" fill={colors[2]} />
    </svg>
  );
}

// 1. Enhanced DashboardCard for themed gradients, icons, badges, and micro-interactions
function DashboardCard({ title, value, icon, accent, gradient, shadow, children, className = "" }) {
  return (
    <div className={`relative rounded-2xl shadow-md p-4 sm:p-5 lg:p-7 flex flex-col items-start border border-gray-100 glass-card transition-all duration-300 animate-fade-in ${gradient} ${shadow} hover:scale-[1.04] hover:shadow-2xl group ${className}`}>
      <div className="flex items-center gap-3 mb-2 w-full">
        {icon && (
          <span className="flex items-center justify-center rounded-full p-2 bg-white/40 shadow-md mr-2">
            {icon}
          </span>
        )}
        <span className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 truncate drop-shadow">{title}</span>
        {accent && (
          <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-white/70 text-indigo-600 shadow badge-pop">{accent}</span>
        )}
      </div>
      <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 w-full animate-bounce-in flex items-center gap-2">{value}</div>
      {children}
    </div>
  );
}

// Dummy event data
const eventData = {
  '2024-07-10': [{ title: 'Task Due', status: 'In Progress' }],
  '2024-07-15': [{ title: 'Project Review', status: 'Done' }],
  '2024-07-22': [{ title: 'ERP Message', status: 'Delayed' }],
};

function CalendarWidget({ onDateClick }) {
  const [value, setValue] = useState(new Date());
  // Helper to format date as yyyy-mm-dd
  const formatDate = d => d.toISOString().split('T')[0];
  return (
    <div className="mt-4 sm:mt-6 lg:mt-8">
      <Calendar
        onChange={setValue}
        value={value}
        tileContent={({ date, view }) => {
          const key = formatDate(date);
          const isToday = formatDate(new Date()) === key;
          if (eventData[key]) {
            return <span className="block w-2 h-2 mx-auto mt-1 rounded-full bg-indigo-500"></span>;
          }
          if (isToday) {
            return <span className="block w-5 h-5 mx-auto mt-1 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-400 text-white flex items-center justify-center text-xs font-bold shadow">★</span>;
          }
          return null;
        }}
        onClickDay={date => {
          const key = formatDate(date);
          if (eventData[key]) onDateClick(key);
        }}
        className="rounded-xl sm:rounded-2xl shadow-md p-2 sm:p-4 border-0 w-full calendar-attractive"
      />
    </div>
  );
}

// 1. Enhanced RightWidgetBox for Quick Links and Calendar
function RightWidgetBox({ onDateClick }) {
  const { t } = useLanguage();
  return (
    <aside className="glass-card bg-gradient-to-br from-cyan-50 via-white to-indigo-50 rounded-2xl shadow-xl p-4 sm:p-6 border border-cyan-100 w-full max-w-xs mx-auto mb-4 sm:mb-6 xl:mb-0 animate-fade-in flex flex-col gap-6">
      {/* Quick Links Section */}
      <div>
        <h4 className="flex items-center gap-2 font-bold text-indigo-700 mb-3 text-base sm:text-lg"><svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg> {t("Quick Links")}</h4>
        <ul className="flex flex-col gap-2">
          <li><a href="#" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-indigo-100 text-indigo-600 font-semibold shadow transition group"><svg className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg> My Parcels</a></li>
          <li><a href="#" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-indigo-100 text-indigo-600 font-semibold shadow transition group"><svg className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg> Inspection Reports</a></li>
          <li><a href="#" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-indigo-100 text-indigo-600 font-semibold shadow transition group"><svg className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg> Payments</a></li>
          <li><a href="#" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-indigo-100 text-indigo-600 font-semibold shadow transition group"><svg className="h-4 w-4 text-indigo-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 5h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg> Building Services</a></li>
      </ul>
      </div>
      <div className="border-t border-cyan-100 pt-3 text-xs text-gray-400">Company: ONIX Engineering</div>
      {/* Calendar Section */}
      <div className="mt-2">
        <h4 className="flex items-center gap-2 font-bold text-cyan-700 mb-3 text-base sm:text-lg"><svg className="h-6 w-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 5h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg> Calendar</h4>
        <div className="glass-card bg-white/80 rounded-2xl shadow-lg p-2 border border-cyan-100">
      <CalendarWidget onDateClick={onDateClick} />
        </div>
      </div>
    </aside>
  );
}

function AdminMessageModal({ open, onClose, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 lg:p-8 w-full max-w-xs sm:max-w-md relative">
        <button
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-red-500 text-xl sm:text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-indigo-700 mb-2">{message.title}</h2>
        <div className="text-sm sm:text-base text-gray-700 mb-2">{message.body}</div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function AnimatedNumber({ n }) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const end = n;
    if (start === end) return;
    let increment = end / 30;
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setVal(end);
        clearInterval(timer);
      } else {
        setVal(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [n]);
  return <span>{val}</span>;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(null);
  // Admin message popup state
  const [showAdminMsg, setShowAdminMsg] = useState(() => {
    // Disable the modal by default for now
    return false; // localStorage.getItem('adminMsgRead') !== 'true';
  });
  const adminMessage = {
    title: t('Welcome to the ERP Dashboard!'),
    body: t('Please review your pending tasks and check the calendar for upcoming events. Contact admin for any urgent issues.')
  };
  const handleCloseAdminMsg = () => {
    setShowAdminMsg(false);
    localStorage.setItem('adminMsgRead', 'true');
  };

  return (
    <div className="relative min-h-screen w-full bg-white flex flex-col items-stretch justify-start">
      {/* Faded watermark overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-80 z-10" />
      {/* 0. Add imports for useRef and animated SVG blob */}
      {/* 1. Animated SVG Blob background (add just inside main container, before DashboardLayout): */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="blobGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0 400 300" to="360 400 300" dur="24s" repeatCount="indefinite" />
            <path d="M600,300Q600,400,500,450Q400,500,300,450Q200,400,200,300Q200,200,300,150Q400,100,500,150Q600,200,600,300Z" fill="url(#blobGrad)" />
          </g>
        </svg>
      </div>
      <DashboardLayout>
        <div className="relative z-20 p-2 sm:p-4 lg:p-6 xl:p-8 w-full flex flex-col items-stretch justify-start">
          {/* Hero Banner */}
          {/* 2. Hero Banner: add user avatar and personalized greeting */}
          <div className="w-full mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2 sm:px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-300 shadow-lg animate-fade-in relative overflow-hidden">
            <div className="flex items-center gap-4">
              <img src={onixLogo} alt="Onix Logo" className="h-14 w-14 rounded-full shadow-lg border-2 border-white bg-white object-cover" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow">Welcome back to <span className="font-extrabold">Onix Engineering Consultancy</span>!</h1>
                <p className="text-white text-sm sm:text-base opacity-90">Here’s your company snapshot and quick actions.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-white bg-opacity-80 hover:bg-opacity-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2 ripple">
                <svg className="h-5 w-5 text-indigo-500 bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add Task
              </button>
              <button className="bg-white bg-opacity-80 hover:bg-opacity-100 text-cyan-700 font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2 ripple">
                <svg className="h-5 w-5 text-cyan-500 bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
                Add Employee
              </button>
            </div>
          </div>
          <AdminMessagePopup title={t("Admin Message")} message={t("System will be down Sunday 2:00 AM")}/>
          <AdminMessageModal open={showAdminMsg} onClose={handleCloseAdminMsg} message={adminMessage} />
          {/* Responsive main grid: stack on mobile, row on xl+ */}
          <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 gap-x-8 w-full items-stretch justify-start">
            {/* Main content */}
            <div className="flex-1 flex flex-col gap-4 sm:gap-6 lg:gap-8 min-w-0 items-stretch justify-start">
              {/* Summary cards: responsive grid, no overflow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                <DashboardCard
                  title={t('Active Employees')}
                  value={<AnimatedNumber n={61} />}
                  icon={<svg className="h-9 w-9 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m9-4a4 4 0 1 0-8 0 4 4 0 0 0 8 0z" /></svg>}
                  accent={'+5 today'}
                  gradient="bg-white"
                  shadow="shadow-lg"
                  className="w-full"
                />
                <DashboardCard
                  title={t('Active Contracts')}
                  value={<AnimatedNumber n={424} />}
                  icon={<svg className="h-9 w-9 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg>}
                  accent={'100% valid'}
                  gradient="bg-white"
                  shadow="shadow-lg"
                  className="w-full"
                />
                <DashboardCard
                  title={t('Your Daily Attendance')}
                  value={
                    <div className="flex flex-col w-full gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Check-In:</span>
                        <span className="text-base sm:text-lg font-bold text-green-600">8:30</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Check-Out:</span>
                        <span className="text-base sm:text-lg font-bold text-red-500">6:30</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                        <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-red-400 animate-progress-bar" style={{ width: '80%' }} />
                      </div>
                    </div>
                  }
                  icon={<svg className="h-9 w-9 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 5h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg>}
                  accent={'On Time'}
                  gradient="bg-white"
                  shadow="shadow-lg"
                  className="w-full"
                />
                <DashboardCard
                  title={t('Active Tasks')}
                  value={<AnimatedNumber n={0} />}
                  icon={<svg className="h-9 w-9 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m-6-8h6" /></svg>}
                  accent={'!'}
                  gradient="bg-white"
                  shadow="shadow-lg"
                  className="w-full"
                />
                <DashboardCard
                  title={t('Team Active Tasks')}
                  value={
                    <div className="flex flex-col items-center w-full">
                      <div className="relative flex items-center justify-center">
                        <svg className="w-14 h-14" viewBox="0 0 48 48">
                          <circle cx="24" cy="24" r="20" fill="#f1f5f9" />
                          <circle cx="24" cy="24" r="20" fill="none" stroke="#a5b4fc" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset="0" />
                          <circle cx="24" cy="24" r="20" fill="none" stroke="#38bdf8" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset="40" strokeLinecap="round" className="progress-ring" />
                        </svg>
                        <span className="absolute text-lg font-bold text-blue-700 animate-countup">211</span>
                      </div>
                      <span className="text-xs text-gray-600 font-medium mt-1">In Progress</span>
                    </div>
                  }
                  icon={<svg className="h-9 w-9 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>}
                  accent={'+12'}
                  gradient="bg-white"
                  shadow="shadow-lg"
                  className="sm:col-span-2 lg:col-span-1 w-full"
                />
              </div>
              
              {/* Balance Sheet & Invoice Pending Payments: responsive grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
                <div className="glass-card bg-gradient-to-br from-indigo-50 via-white to-cyan-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-indigo-100 w-full overflow-x-auto animate-fade-in">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-indigo-700 mb-4"><svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg> Balance Sheet</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">
                    <div className="flex items-center gap-2 bg-white/70 rounded-lg px-2">
                      <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg>
                      <select className="border-0 bg-transparent focus:ring-0 w-full text-xs sm:text-sm">
                      <option>Furnitures and fittings</option>
                    </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 rounded-lg px-2">
                      <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg>
                      <select className="border-0 bg-transparent focus:ring-0 w-full text-xs sm:text-sm">
                      <option>Loans</option>
                    </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 rounded-lg px-2">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg>
                      <select className="border-0 bg-transparent focus:ring-0 w-full text-xs sm:text-sm">
                      <option>Clients</option>
                    </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 rounded-lg px-2">
                      <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg>
                      <select className="border-0 bg-transparent focus:ring-0 w-full text-xs sm:text-sm">
                      <option>Imprest and Insurance</option>
                    </select>
                    </div>
                  </div>
                </div>
                <div className="glass-card bg-gradient-to-br from-yellow-50 via-white to-orange-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-yellow-100 w-full overflow-x-auto animate-fade-in">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-yellow-700 mb-4"><svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg> Invoice Pending Payments</h3>
                  <div className="text-gray-400 text-sm sm:text-base">No Record / No Data</div>
                </div>
              </div>
              
              {/* Unusual Attendance & Reminders: responsive grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
                <div className="glass-card bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-pink-100 w-full overflow-x-auto animate-fade-in">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-pink-700 mb-4"><svg className="h-6 w-6 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg> Unusual Attendance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px] text-xs sm:text-sm rounded-xl overflow-hidden border border-pink-100">
                      <thead>
                        <tr className="text-gray-500 border-b bg-pink-50">
                          <th className="py-2 text-left">Name</th>
                          <th className="py-2 text-left">Status</th>
                          <th className="py-2 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white/80">
                          <td className="py-2 font-semibold flex items-center gap-2">OMAR SHAKAN</td>
                          <td className="py-2"><span className="inline-block px-2 py-1 rounded-full bg-pink-100 text-pink-600 font-bold text-xs">No Record</span></td>
                          <td className="py-2"><button className="bg-pink-100 text-pink-700 rounded px-3 py-1 text-xs font-bold shadow hover:bg-pink-200 transition">View</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="glass-card bg-gradient-to-br from-yellow-50 via-white to-orange-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-yellow-100 w-full overflow-x-auto animate-fade-in">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-yellow-700 mb-4"><svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg> Reminders</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" /></svg>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-yellow-800 text-xs sm:text-sm">Document Expiry</div>
                        <div className="text-xs text-yellow-600">Passport expires in 30 days</div>
                      </div>
                      <span className="inline-block px-2 py-1 rounded-full bg-yellow-200 text-yellow-800 font-bold text-xs">!</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200">
                      <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" /></svg>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-red-800 text-xs sm:text-sm">Urgent Task</div>
                        <div className="text-xs text-red-600">Project review due today</div>
                      </div>
                      <span className="inline-block px-2 py-1 rounded-full bg-red-200 text-red-800 font-bold text-xs">!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right sidebar: stack below on mobile, right on xl+ */}
            <div className="xl:w-80 w-full mt-6 xl:mt-0 flex-shrink-0 items-stretch justify-start">
              <RightWidgetBox onDateClick={setSelectedDate} />
            </div>
          </div>
        </div>
      </DashboardLayout>
      {/* 4. Add floating notification widget (bottom right) */}
      <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 border border-indigo-100 glass-card">
          <svg className="h-6 w-6 text-yellow-400 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" /></svg>
          <div>
            <div className="font-semibold text-gray-700">Document Expiry</div>
            <div className="text-xs text-gray-500">Passport expires in 30 days</div>
          </div>
          <button className="ml-2 text-indigo-500 hover:underline text-xs">View</button>
        </div>
      </div>
      {/* 5. Add floating action button (FAB) for quick actions */}
      <div className="fixed bottom-20 right-7 z-50 animate-fade-in">
        <button className="bg-gradient-to-br from-indigo-500 to-cyan-400 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl hover:scale-110 transition-all fab-pop">
          +
        </button>
      </div>
      {/* 8. Add CSS for ripple, bounce, pop, glassmorphism, and fade-in at the end of the file: */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
        .animate-countup { transition: color 0.3s, transform 0.3s; }
        .ripple { position: relative; overflow: hidden; }
        .ripple:after { content: ''; position: absolute; left: 50%; top: 50%; width: 0; height: 0; background: rgba(59,130,246,0.15); border-radius: 100%; transform: translate(-50%, -50%); transition: width 0.4s, height 0.4s; z-index: 0; }
        .ripple:active:after { width: 200px; height: 200px; }
        .bounce { animation: bounce 1.2s infinite alternate; }
        @keyframes bounce { 0% { transform: translateY(0);} 100% { transform: translateY(-6px);} }
        .fab-pop { animation: fabPop 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes fabPop { from { transform: scale(0.7);} to { transform: scale(1);} }
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); }
        .progress-ring { transition: stroke-dashoffset 1s cubic-bezier(.4,0,.2,1); }
        .badge-pop { animation: badgePop 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes badgePop { from { transform: scale(0.7);} to { transform: scale(1);} }
        .animate-bounce-in { animation: bounceIn 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes bounceIn { 0% { transform: scale(0.7); opacity: 0;} 80% { transform: scale(1.1); opacity: 1;} 100% { transform: scale(1); } }
        .animate-progress-bar { animation: progressBar 1.2s cubic-bezier(.4,0,.2,1); }
        @keyframes progressBar { from { width: 0; } to { width: 80%; } }
      `}</style>
    </div>
  );
}