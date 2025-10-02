import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TrophyIcon,
  LightBulbIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import AIEmployeeEvaluationsChatbot from './AIEmployeeEvaluationsChatbot';

const AIEmployeeEvaluations = () => {
  const [activeTab, setActiveTab] = useState('scorecard');
  const [employees, setEmployees] = useState([]);
  const [kpiWeights, setKpiWeights] = useState({
    attendance: 25,
    projects: 40,
    compliance: 15,
    manager: 20
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [evaluationData, setEvaluationData] = useState({});
  const [showChatbot, setShowChatbot] = useState(false);

  // Sample employee data
  useEffect(() => {
    const sampleEmployees = [
      {
        id: 1,
        name: "Ahmed Hassan",
        department: "Engineering",
        position: "Senior Engineer",
        avatar: "AH",
        attendance: 95,
        projects: 88,
        compliance: 92,
        manager: 85,
        overall: 0,
        status: "High Performer"
      },
      {
        id: 2,
        name: "Sarah Johnson",
        department: "HR",
        position: "HR Manager",
        avatar: "SJ",
        attendance: 98,
        projects: 95,
        compliance: 100,
        manager: 92,
        overall: 0,
        status: "Top Performer"
      },
      {
        id: 3,
        name: "Mohammed Ali",
        department: "Finance",
        position: "Accountant",
        avatar: "MA",
        attendance: 85,
        projects: 75,
        compliance: 80,
        manager: 70,
        overall: 0,
        status: "Needs Improvement"
      }
    ];

    // Calculate overall scores
    const employeesWithScores = sampleEmployees.map(emp => ({
      ...emp,
      overall: Math.round(
        (emp.attendance * kpiWeights.attendance / 100) +
        (emp.projects * kpiWeights.projects / 100) +
        (emp.compliance * kpiWeights.compliance / 100) +
        (emp.manager * kpiWeights.manager / 100)
      )
    }));

    setEmployees(employeesWithScores);
  }, [kpiWeights]);

  const tabs = [
    { id: 'scorecard', label: 'Employee Scorecard', icon: StarIcon },
    { id: 'dashboard', label: 'Performance Dashboard', icon: ChartBarIcon },
    { id: 'settings', label: 'KPI Settings', icon: Cog6ToothIcon },
    { id: 'reports', label: 'Evaluation Reports', icon: DocumentTextIcon }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Top Performer': return 'text-green-600 bg-green-100';
      case 'High Performer': return 'text-blue-600 bg-blue-100';
      case 'Needs Improvement': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const generateRecommendations = (employee) => {
    const recommendations = [];
    
    if (employee.attendance < 90) {
      recommendations.push({
        type: 'warning',
        title: 'Attendance Improvement',
        description: 'Consider flexible work arrangements or attendance coaching'
      });
    }
    
    if (employee.projects < 80) {
      recommendations.push({
        type: 'info',
        title: 'Project Management Training',
        description: 'Recommend project management certification or mentoring'
      });
    }
    
    if (employee.overall >= 90) {
      recommendations.push({
        type: 'success',
        title: 'Recognition Opportunity',
        description: 'Consider for promotion, bonus, or leadership role'
      });
    }
    
    return recommendations;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-2xl border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="text-white">
              <h1 className="text-3xl font-bold flex items-center mb-2">
                <div className="bg-white bg-opacity-20 p-2 rounded-xl mr-4">
                  <StarIcon className="w-8 h-8 text-white" />
                </div>
                AI Employee Evaluations
              </h1>
              <p className="text-blue-100 text-lg">
                🤖 Automated performance evaluation and intelligent scorecard generation
              </p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowChatbot(true)}
                className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                AI Assistant
              </button>
              <button className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Generate Scorecards
              </button>
              <button className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-opacity-30 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <Cog6ToothIcon className="w-5 h-5 mr-2" />
                Adjust KPI Weights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 border-b-3 font-semibold text-sm flex items-center transition-all duration-300 rounded-t-lg ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50 shadow-md transform -translate-y-1'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} /> 
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'scorecard' && (
          <div className="space-y-8">
            {/* Employee List */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                    <StarIcon className="w-6 h-6 text-white" />
                  </div>
                  Employee Performance Scorecard
                </h3>
                <p className="text-blue-100 text-lg mt-2">✨ Click on an employee to view detailed evaluation</p>
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
                <table className="w-full divide-y divide-gray-200 min-w-[800px]">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-1/6">👤 Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12">🏢 Dept</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12">⏰ Att</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12">📋 Proj</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12">✅ Comp</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12">👨‍💼 Mgr</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12">🎯 Overall</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12">📊 Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12">⚡ Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {employees.map((employee, index) => (
                      <tr key={employee.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg" onClick={() => setSelectedEmployee(employee)}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                                <span className="text-xs font-bold text-white">{employee.avatar}</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-bold text-gray-900 truncate max-w-32">{employee.name}</div>
                              <div className="text-xs text-gray-600 truncate max-w-32">{employee.position}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {employee.department}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <div className="w-12 bg-gray-200 rounded-full h-1.5 mb-1">
                              <div className={`h-1.5 rounded-full ${employee.attendance >= 90 ? 'bg-green-500' : employee.attendance >= 80 ? 'bg-blue-500' : employee.attendance >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${employee.attendance}%`}}></div>
                            </div>
                            <span className={`text-xs font-bold ${getScoreColor(employee.attendance)}`}>
                              {employee.attendance}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <div className="w-12 bg-gray-200 rounded-full h-1.5 mb-1">
                              <div className={`h-1.5 rounded-full ${employee.projects >= 90 ? 'bg-green-500' : employee.projects >= 80 ? 'bg-blue-500' : employee.projects >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${employee.projects}%`}}></div>
                            </div>
                            <span className={`text-xs font-bold ${getScoreColor(employee.projects)}`}>
                              {employee.projects}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <div className="w-12 bg-gray-200 rounded-full h-1.5 mb-1">
                              <div className={`h-1.5 rounded-full ${employee.compliance >= 90 ? 'bg-green-500' : employee.compliance >= 80 ? 'bg-blue-500' : employee.compliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${employee.compliance}%`}}></div>
                            </div>
                            <span className={`text-xs font-bold ${getScoreColor(employee.compliance)}`}>
                              {employee.compliance}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <div className="w-12 bg-gray-200 rounded-full h-1.5 mb-1">
                              <div className={`h-1.5 rounded-full ${employee.manager >= 90 ? 'bg-green-500' : employee.manager >= 80 ? 'bg-blue-500' : employee.manager >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${employee.manager}%`}}></div>
                            </div>
                            <span className={`text-xs font-bold ${getScoreColor(employee.manager)}`}>
                              {employee.manager}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <div className="w-14 bg-gray-200 rounded-full h-2 mb-1">
                              <div className={`h-2 rounded-full ${employee.overall >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' : employee.overall >= 80 ? 'bg-gradient-to-r from-blue-400 to-blue-600' : employee.overall >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`} style={{width: `${employee.overall}%`}}></div>
                            </div>
                            <span className={`text-sm font-bold ${getScoreColor(employee.overall)}`}>
                              {employee.overall}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(employee.status)}`}>
                            {employee.status === 'Top Performer' && '🏆 '}
                            {employee.status === 'High Performer' && '⭐ '}
                            {employee.status === 'Needs Improvement' && '⚠️ '}
                            <span className="hidden sm:inline">{employee.status}</span>
                            <span className="sm:hidden">
                              {employee.status === 'Top Performer' && 'Top'}
                              {employee.status === 'High Performer' && 'High'}
                              {employee.status === 'Needs Improvement' && 'Low'}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-1">
                            <button className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded transition-all duration-200 transform hover:scale-110">
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all duration-200 transform hover:scale-110">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Employee Detail Modal */}
            {selectedEmployee && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Performance Evaluation - {selectedEmployee.name}
                      </h3>
                      <button
                        onClick={() => setSelectedEmployee(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>
                    
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-900">Attendance & Punctuality</span>
                          <span className="text-lg font-bold text-blue-600">{selectedEmployee.attendance}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: `${selectedEmployee.attendance}%`}}></div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-900">Task & Project Completion</span>
                          <span className="text-lg font-bold text-green-600">{selectedEmployee.projects}%</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: `${selectedEmployee.projects}%`}}></div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-purple-900">Leave & Policy Compliance</span>
                          <span className="text-lg font-bold text-purple-600">{selectedEmployee.compliance}%</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: `${selectedEmployee.compliance}%`}}></div>
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-orange-900">Manager Evaluation</span>
                          <span className="text-lg font-bold text-orange-600">{selectedEmployee.manager}%</span>
                        </div>
                        <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{width: `${selectedEmployee.manager}%`}}></div>
                        </div>
                      </div>
                    </div>

                    {/* Overall Score */}
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Overall Performance Score</h4>
                        <div className="text-4xl font-bold text-blue-600 mb-2">{selectedEmployee.overall}%</div>
                        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEmployee.status)}`}>
                          {selectedEmployee.status}
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
                        AI Recommendations
                      </h4>
                      <div className="space-y-2">
                        {generateRecommendations(selectedEmployee).map((rec, index) => (
                          <div key={index} className={`p-3 rounded-lg ${
                            rec.type === 'success' ? 'bg-green-50 border border-green-200' :
                            rec.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                            'bg-blue-50 border border-blue-200'
                          }`}>
                            <div className="flex items-start">
                              {rec.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5" />}
                              {rec.type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />}
                              {rec.type === 'info' && <LightBulbIcon className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />}
                              <div>
                                <div className="font-medium text-gray-900">{rec.title}</div>
                                <div className="text-sm text-gray-600">{rec.description}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                      <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Cancel
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-2xl shadow-2xl text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                      <UserGroupIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-blue-100 truncate">👥 Total Employees</dt>
                      <dd className="text-3xl font-bold text-white">{employees.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-2xl shadow-2xl text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                      <TrophyIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-green-100 truncate">🏆 Top Performers</dt>
                      <dd className="text-3xl font-bold text-white">
                        {employees.filter(emp => emp.overall >= 90).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8 rounded-2xl shadow-2xl text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                      <ArrowTrendingUpIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-purple-100 truncate">📈 Avg Performance</dt>
                      <dd className="text-3xl font-bold text-white">
                        {Math.round(employees.reduce((sum, emp) => sum + emp.overall, 0) / employees.length)}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  📊 Performance Trends & Analytics
                </h3>
                <p className="text-indigo-100 text-lg mt-2">Real-time performance insights and trends</p>
              </div>
              <div className="p-8">
                <div className="text-center text-gray-500 py-16">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
                    <ChartBarIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">📈 Performance Analytics Dashboard</h3>
                    <p className="text-gray-600">Interactive performance trends visualization will be displayed here.</p>
                    <div className="mt-6 flex justify-center space-x-4">
                      <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">📊 Charts</div>
                      <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">📈 Trends</div>
                      <div className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">🎯 Insights</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                  <Cog6ToothIcon className="w-6 h-6 text-white" />
                </div>
                ⚙️ KPI Weight Configuration
              </h3>
              <p className="text-green-100 text-lg mt-2">Customize performance evaluation weights to match your organization's priorities</p>
            </div>
            <div className="p-8">
              <div className="space-y-8">
                {Object.entries(kpiWeights).map(([key, value]) => (
                  <div key={key} className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <label className="text-lg font-bold text-gray-900 flex items-center">
                          {key === 'projects' && '📋 Task & Project Completion'}
                          {key === 'manager' && '👨‍💼 Manager Evaluation'}
                          {key === 'compliance' && '✅ Leave & Policy Compliance'}
                          {key === 'attendance' && '⏰ Attendance & Punctuality'}
                        </label>
                        <p className="text-sm text-gray-600 mt-1">Current weight: <span className="font-bold text-blue-600">{value}%</span></p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-48 bg-gray-200 rounded-full h-3">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300" style={{width: `${(value/50)*100}%`}}></div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={value}
                          onChange={(e) => setKpiWeights(prev => ({...prev, [key]: parseInt(e.target.value)}))}
                          className="w-32 accent-blue-500"
                        />
                        <span className="text-xl font-bold text-gray-900 w-16 text-center">{value}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-xl text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">🎯 Total Weight</span>
                    <span className="text-3xl font-bold">
                      {Object.values(kpiWeights).reduce((sum, weight) => sum + weight, 0)}%
                    </span>
                  </div>
                  <div className="mt-2 text-blue-100">
                    {Object.values(kpiWeights).reduce((sum, weight) => sum + weight, 0) === 100 ? 
                      '✅ Perfect balance!' : 
                      '⚠️ Adjust weights to reach 100%'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  📊 Evaluation Reports & Analytics
                </h3>
                <p className="text-orange-100 text-lg mt-2">Generate comprehensive performance reports and insights</p>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <button className="group p-8 border-2 border-dashed border-blue-300 rounded-2xl hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                    <div className="text-center">
                      <div className="bg-blue-100 group-hover:bg-blue-200 p-4 rounded-full w-16 h-16 mx-auto mb-4 transition-colors">
                        <DocumentTextIcon className="w-8 h-8 text-blue-600 mx-auto" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">👤 Individual Scorecards</h4>
                      <p className="text-sm text-gray-600 mb-4">Generate detailed scorecards for specific employees</p>
                      <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold group-hover:bg-blue-600 transition-colors">
                        📄 Generate Report
                      </div>
                    </div>
                  </button>
                  
                  <button className="group p-8 border-2 border-dashed border-green-300 rounded-2xl hover:border-green-500 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                    <div className="text-center">
                      <div className="bg-green-100 group-hover:bg-green-200 p-4 rounded-full w-16 h-16 mx-auto mb-4 transition-colors">
                        <ChartBarIcon className="w-8 h-8 text-green-600 mx-auto" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">🏢 Department Report</h4>
                      <p className="text-sm text-gray-600 mb-4">Generate comprehensive department-wide performance analysis</p>
                      <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold group-hover:bg-green-600 transition-colors">
                        📊 Generate Report
                      </div>
                    </div>
                  </button>
                  
                  <button className="group p-8 border-2 border-dashed border-purple-300 rounded-2xl hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50 hover:to-violet-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                    <div className="text-center">
                      <div className="bg-purple-100 group-hover:bg-purple-200 p-4 rounded-full w-16 h-16 mx-auto mb-4 transition-colors">
                        <CalendarDaysIcon className="w-8 h-8 text-purple-600 mx-auto" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">📅 Quarterly Review</h4>
                      <p className="text-sm text-gray-600 mb-4">Generate quarterly performance evaluation reports</p>
                      <div className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold group-hover:bg-purple-600 transition-colors">
                        📈 Generate Report
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Chatbot */}
      <AIEmployeeEvaluationsChatbot
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        employees={employees}
        kpiWeights={kpiWeights}
      />
    </div>
  );
};

export default AIEmployeeEvaluations;
