import React, { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './calendar-custom.css'; // Custom styles for react-calendar
import DashboardLayout from "../layout/DashboardLayout";
import AdminMessagePopup from "../components/AdminMessagePopup";
import { useLanguage } from "../LanguageContext";

function PieChart({ colors = ["#a78bfa", "#fbbf24", "#f87171"], size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className="mx-auto">
      <circle r="16" cx="16" cy="16" fill={colors[0]} />
      <path d="M16 16 L16 0 A16 16 0 0 1 32 16 Z" fill={colors[1]} />
      <path d="M16 16 L32 16 A16 16 0 0 1 16 32 Z" fill={colors[2]} />
    </svg>
  );
}

function DashboardCard({ title, value, icon, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md p-3 sm:p-4 lg:p-6 flex flex-col items-start border border-gray-100 ${className}`}>
      <div className="flex items-center gap-2 mb-2 w-full">
        {icon && <span className="text-indigo-500 text-sm sm:text-base">{icon}</span>}
        <span className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 truncate">{title}</span>
      </div>
      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 w-full">{value}</div>
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
          if (eventData[key]) {
            return <span className="block w-1.5 h-1.5 sm:w-2 sm:h-2 mx-auto mt-1 rounded-full bg-indigo-500"></span>;
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

function RightWidgetBox({ onDateClick }) {
  const { t } = useLanguage();
  return (
    <aside className="bg-white rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md p-3 sm:p-4 lg:p-6 border border-gray-100 w-full max-w-xs mx-auto mb-4 sm:mb-6 xl:mb-0">
      <h4 className="font-bold text-gray-700 mb-3 sm:mb-4 text-base sm:text-lg">{t("Quick Links")}</h4>
      <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
        <li><a href="#" className="text-indigo-600 hover:underline">My Parcels</a></li>
        <li><a href="#" className="text-indigo-600 hover:underline">Inspection Reports</a></li>
        <li><a href="#" className="text-indigo-600 hover:underline">Payments</a></li>
        <li><a href="#" className="text-indigo-600 hover:underline">Building Services</a></li>
      </ul>
      <div className="mt-4 sm:mt-6 border-t pt-2 sm:pt-3 text-xs text-gray-400">Company: ONIX Engineering</div>
      <CalendarWidget onDateClick={onDateClick} />
    </aside>
  );
}

function AdminMessageModal({ open, onClose, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 max-w-md w-full relative">
        <button
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-red-500 text-xl sm:text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-indigo-700 mb-2">{message.title}</h2>
        <div className="text-sm sm:text-base text-gray-700 mb-2">{message.body}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(null);
  // Admin message popup state
  const [showAdminMsg, setShowAdminMsg] = useState(() => {
    return localStorage.getItem('adminMsgRead') !== 'true';
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
    <div className="relative min-h-screen w-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: 'url("/onix-bg.png")', opacity: 1 }}>
      {/* Faded watermark overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-90 z-10" />
      <DashboardLayout>
        <div className="relative z-20 p-2 sm:p-4 lg:p-6 xl:p-8">
          <AdminMessagePopup title={t("Admin Message")} message={t("System will be down Sunday 2:00 AM")}/>
          <AdminMessageModal open={showAdminMsg} onClose={handleCloseAdminMsg} message={adminMessage} />
          
          <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8">
            {/* Main content */}
            <div className="flex-1 flex flex-col gap-4 sm:gap-6 lg:gap-8">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full">
                <DashboardCard title={t('Active Employees')} value="61" className="bg-gray-50 w-full" />
                <DashboardCard title={t('Active Contracts')} value="424" className="bg-gray-50 w-full" />
                <DashboardCard
                  title={t('Your Daily Attendance')}
                  value={
                    <div className="flex flex-col gap-1 sm:gap-2 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Check-In:</span>
                        <span className="text-sm sm:text-base lg:text-lg font-bold text-green-600">8:30</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Check-Out:</span>
                        <span className="text-sm sm:text-base lg:text-lg font-bold text-red-500">6:30</span>
                      </div>
                    </div>
                  }
                  className="bg-gray-50 w-full"
                />
                <DashboardCard title={t('Active Tasks')} value="0" className="bg-gray-50 w-full" />
                <DashboardCard
                  title={t('Team Active Tasks')}
                  value={
                    <div className="flex justify-between items-center w-full gap-2 sm:gap-4">
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-500">153</span>
                        <span className="text-xs text-gray-600 font-medium">Pending</span>
                      </div>
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700">211</span>
                        <span className="text-xs text-gray-600 font-medium">In Progress</span>
                      </div>
                    </div>
                  }
                  className="bg-gray-50 sm:col-span-2 lg:col-span-1 w-full"
                />
              </div>
              
              {/* Balance Sheet & Invoice Pending Payments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 w-full">
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md p-3 sm:p-4 lg:p-6 border border-gray-100 w-full overflow-x-auto">
                  <h3 className="text-gray-700 font-bold mb-3 sm:mb-4 text-base sm:text-lg">{t('Balance Sheet')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">
                    <select className="border rounded-lg p-2 w-full bg-white text-xs sm:text-sm">
                      <option>Furnitures and fittings</option>
                    </select>
                    <select className="border rounded-lg p-2 w-full bg-white text-xs sm:text-sm">
                      <option>Loans</option>
                    </select>
                    <select className="border rounded-lg p-2 w-full bg-white text-xs sm:text-sm">
                      <option>Clients</option>
                    </select>
                    <select className="border rounded-lg p-2 w-full bg-white text-xs sm:text-sm">
                      <option>Imprest and Insurance</option>
                    </select>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md p-3 sm:p-4 lg:p-6 border border-gray-100 w-full overflow-x-auto">
                  <h3 className="text-gray-700 font-bold mb-3 sm:mb-4 text-base sm:text-lg">{t('Invoice Pending Payments')}</h3>
                  <div className="text-gray-400 text-sm sm:text-base">{t('No Record')} / {t('No Data')}</div>
                </div>
              </div>
              
              {/* Unusual Attendance & Reminders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 w-full">
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md p-3 sm:p-4 lg:p-6 border border-gray-100 w-full overflow-x-auto">
                  <h3 className="text-gray-700 font-bold mb-3 sm:mb-4 text-base sm:text-lg">{t('Unusual Attendance')}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="text-gray-500 border-b">
                          <th className="py-2 text-left">{t('Name')}</th>
                          <th className="py-2 text-left">{t('Status')}</th>
                          <th className="py-2 text-left">{t('Action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2">OMAR SHAKAN</td>
                          <td className="py-2 text-red-400">{t('No Record')}</td>
                          <td className="py-2"><button className="bg-indigo-50 text-indigo-600 rounded px-2 py-1 text-xs">{t('View')}</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md p-3 sm:p-4 lg:p-6 border border-gray-100 w-full overflow-x-auto">
                  <h3 className="text-gray-700 font-bold mb-3 sm:mb-4 text-base sm:text-lg">{t('Reminders')}</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-yellow-800 text-xs sm:text-sm">Document Expiry</div>
                        <div className="text-xs text-yellow-600">Passport expires in 30 days</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-red-800 text-xs sm:text-sm">Urgent Task</div>
                        <div className="text-xs text-red-600">Project review due today</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right sidebar */}
            <div className="xl:w-80 w-full mt-6 xl:mt-0">
              <RightWidgetBox onDateClick={setSelectedDate} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
} 