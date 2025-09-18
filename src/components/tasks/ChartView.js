import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  ChartPieIcon,
  ChartBarSquareIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const ChartView = () => {
  const [activeChart, setActiveChart] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  
  // Sample data for construction tasks
  const taskData = {
    total: 156,
    completed: 89,
    inProgress: 42,
    pending: 25,
    overdue: 8,
    thisWeek: 23,
    nextWeek: 31
  };

  const statusData = [
    { name: 'Completed', value: 89, color: 'bg-green-500', percentage: 57 },
    { name: 'In Progress', value: 42, color: 'bg-blue-500', percentage: 27 },
    { name: 'Pending', value: 25, color: 'bg-yellow-500', percentage: 16 }
  ];

  const priorityData = [
    { name: 'High Priority', value: 28, color: 'bg-red-500', percentage: 18 },
    { name: 'Medium Priority', value: 78, color: 'bg-yellow-500', percentage: 50 },
    { name: 'Low Priority', value: 50, color: 'bg-green-500', percentage: 32 }
  ];

  const assigneeData = [
    { name: 'SA', tasks: 45, color: 'bg-purple-500', completion: 78 },
    { name: 'MN', tasks: 38, color: 'bg-blue-500', completion: 65 },
    { name: 'AH', tasks: 35, color: 'bg-green-500', completion: 82 },
    { name: 'MA', tasks: 38, color: 'bg-orange-500', completion: 71 }
  ];

  const weeklyProgress = [
    { week: 'Week 1', completed: 12, inProgress: 8, pending: 5 },
    { week: 'Week 2', completed: 18, inProgress: 10, pending: 7 },
    { week: 'Week 3', completed: 22, inProgress: 12, pending: 6 },
    { week: 'Week 4', completed: 15, inProgress: 8, pending: 4 },
    { week: 'Current', completed: 22, inProgress: 4, pending: 3 }
  ];

  const chartTypes = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'status', name: 'Status Distribution', icon: ChartPieIcon },
    { id: 'priority', name: 'Priority Analysis', icon: ChartBarSquareIcon },
    { id: 'assignee', name: 'Team Performance', icon: UsersIcon },
    { id: 'timeline', name: 'Progress Timeline', icon: ArrowTrendingUpIcon }
  ];

  const timeRanges = [
    { id: '7d', name: 'Last 7 Days' },
    { id: '30d', name: 'Last 30 Days' },
    { id: '90d', name: 'Last 90 Days' },
    { id: '1y', name: 'Last Year' }
  ];

  const renderOverviewChart = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Key Metrics Cards */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
            <p className="text-3xl font-bold">{taskData.total}</p>
          </div>
          <ChartBarIcon className="w-8 h-8 text-blue-200" />
        </div>
        <div className="mt-2 text-sm text-blue-100">
          <span className="text-green-300">+12%</span> from last month
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Completed</p>
            <p className="text-3xl font-bold">{taskData.completed}</p>
          </div>
          <CheckCircleIcon className="w-8 h-8 text-green-200" />
        </div>
        <div className="mt-2 text-sm text-green-100">
          <span className="text-green-300">57%</span> completion rate
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm font-medium">In Progress</p>
            <p className="text-3xl font-bold">{taskData.inProgress}</p>
          </div>
          <ClockIcon className="w-8 h-8 text-yellow-200" />
        </div>
        <div className="mt-2 text-sm text-yellow-100">
          <span className="text-yellow-300">27%</span> of total tasks
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold">{taskData.pending}</p>
          </div>
          <ExclamationTriangleIcon className="w-8 h-8 text-red-200" />
        </div>
        <div className="mt-2 text-sm text-red-100">
          <span className="text-red-300">16%</span> pending tasks
        </div>
      </div>
    </div>
  );

  const renderStatusChart = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Task Status Distribution</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart Representation */}
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
              {/* Completed - 57% */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10B981"
                strokeWidth="8"
                strokeDasharray={`${57 * 2.51} 251`}
                className="drop-shadow-lg"
              />
              {/* In Progress - 27% */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="8"
                strokeDasharray={`${27 * 2.51} 251`}
                strokeDashoffset={`-${57 * 2.51}`}
                className="drop-shadow-lg"
              />
              {/* Pending - 16% */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="8"
                strokeDasharray={`${16 * 2.51} 251`}
                strokeDashoffset={`-${84 * 2.51}`}
                className="drop-shadow-lg"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{taskData.total}</div>
                <div className="text-sm text-gray-500">Total Tasks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-4">
          {statusData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                <span className="font-medium text-gray-900">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{item.value}</div>
                <div className="text-sm text-gray-500">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPriorityChart = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Priority Distribution</h3>
      <div className="space-y-4">
        {priorityData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">{item.name}</span>
              <span className="text-sm text-gray-500">{item.value} tasks ({item.percentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${item.color} transition-all duration-1000 ease-out`}
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssigneeChart = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Team Performance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assigneeData.map((assignee, index) => (
          <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${assignee.color} flex items-center justify-center text-white font-bold`}>
                  {assignee.name}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{assignee.name}</div>
                  <div className="text-sm text-gray-500">{assignee.tasks} tasks assigned</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{assignee.completion}%</div>
                <div className="text-sm text-gray-500">completion</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${assignee.color} transition-all duration-1000 ease-out`}
                style={{ width: `${assignee.completion}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimelineChart = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Progress Timeline</h3>
      <div className="space-y-4">
        {weeklyProgress.map((week, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-20 text-sm font-medium text-gray-600">{week.week}</div>
            <div className="flex-1 flex gap-2">
              <div className="flex-1 bg-green-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-800">{week.completed}</div>
                <div className="text-xs text-green-600">Completed</div>
              </div>
              <div className="flex-1 bg-blue-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-800">{week.inProgress}</div>
                <div className="text-xs text-blue-600">In Progress</div>
              </div>
              <div className="flex-1 bg-yellow-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-800">{week.pending}</div>
                <div className="text-xs text-yellow-600">Pending</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActiveChart = () => {
    switch (activeChart) {
      case 'overview':
        return renderOverviewChart();
      case 'status':
        return renderStatusChart();
      case 'priority':
        return renderPriorityChart();
      case 'assignee':
        return renderAssigneeChart();
      case 'timeline':
        return renderTimelineChart();
      default:
        return renderOverviewChart();
    }
  };

  return (
    <div className="p-6">
      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-lg border border-gray-200 mb-6 -mt-6">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - Analytics Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Bars3Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Analytics</h2>
              <p className="text-sm text-gray-600">Construction project insights</p>
            </div>
          </div>
          
          {/* Right side - Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
              <PlusIcon className="w-5 h-5" /> New Report
            </button>
            
            <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
              <ClipboardDocumentIcon className="w-5 h-5" /> Export
            </button>
            
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search analytics... (Ctrl+K to focus)"
                className="w-56 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            {/* Show Filters Button */}
            <button className="flex items-center gap-1.5 px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300 bg-white shadow-sm">
              <FunnelIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Show Filters</span>
            </button>
          </div>
        </div>
      </div>


      {/* Chart Type Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {chartTypes.map((chart) => (
            <button
              key={chart.id}
              onClick={() => setActiveChart(chart.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeChart === chart.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <chart.icon className="w-4 h-4" />
              {chart.name}
            </button>
          ))}
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  timeRange === range.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Chart */}
      <div className="animate-fadeIn">
        {renderActiveChart()}
      </div>

      {/* Additional Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
            <h4 className="font-semibold text-gray-900">Productivity Trend</h4>
          </div>
          <div className="text-2xl font-bold text-green-600 mb-2">+15%</div>
          <div className="text-sm text-gray-500">Tasks completed this month</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Upcoming Deadlines</h4>
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-2">12</div>
          <div className="text-sm text-gray-500">Tasks due this week</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <UsersIcon className="w-6 h-6 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Team Efficiency</h4>
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-2">87%</div>
          <div className="text-sm text-gray-500">Average completion rate</div>
        </div>
      </div>
    </div>
  );
};

export default ChartView;
