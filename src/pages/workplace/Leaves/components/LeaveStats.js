import React from 'react';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ChartBarIcon 
} from "@heroicons/react/24/outline";

const LeaveStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
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
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
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
            <p className="text-2xl font-bold text-green-600">{stats.approvedCount}</p>
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
            <p className="text-2xl font-bold text-purple-600">{stats.totalDaysUsed}</p>
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
            <p className="text-2xl font-bold text-blue-600">{stats.successRate}%</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <div className="h-6 w-6 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveStats;
