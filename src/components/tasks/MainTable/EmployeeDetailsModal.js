import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, BriefcaseIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const EmployeeDetailsModal = ({ isOpen, onClose, employeeId, allTasks }) => {
  const [employee, setEmployee] = useState(null);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [assignedSubtasks, setAssignedSubtasks] = useState([]);

  // Debug logging
  useEffect(() => {
    console.log('EmployeeDetailsModal props:', { isOpen, employeeId, allTasks: allTasks?.length });
  }, [isOpen, employeeId, allTasks]);

  // Mock employee data
  const mockEmployees = {
    'SA': {
      id: 'SA',
      name: 'Sarah Ahmed',
      position: 'Senior Developer',
      department: 'Engineering',
      email: 'sarah.ahmed@company.com',
      phone: '+971 50 123 4567',
      location: 'Dubai, UAE',
      status: 'active',
      avatar: 'SA',
      joinDate: '2023-01-15',
      experience: '5 years'
    },
    'MN': {
      id: 'MN',
      name: 'Mohammed Nasser',
      position: 'Project Manager',
      department: 'Project Management',
      email: 'mohammed.nasser@company.com',
      phone: '+971 50 234 5678',
      location: 'Abu Dhabi, UAE',
      status: 'active',
      avatar: 'MN',
      joinDate: '2022-03-10',
      experience: '7 years'
    },
    'AH': {
      id: 'AH',
      name: 'Ahmed Hassan',
      position: 'UI/UX Designer',
      department: 'Design',
      email: 'ahmed.hassan@company.com',
      phone: '+971 50 345 6789',
      location: 'Sharjah, UAE',
      status: 'active',
      avatar: 'AH',
      joinDate: '2023-06-20',
      experience: '3 years'
    },
    'MA': {
      id: 'MA',
      name: 'Mariam Ali',
      position: 'Quality Assurance Engineer',
      department: 'Testing',
      email: 'mariam.ali@company.com',
      phone: '+971 50 456 7890',
      location: 'Dubai, UAE',
      status: 'active',
      avatar: 'MA',
      joinDate: '2022-11-05',
      experience: '4 years'
    },
    'AL': {
      id: 'AL',
      name: 'Ali Lakhani',
      position: 'DevOps Engineer',
      department: 'Infrastructure',
      email: 'ali.lakhani@company.com',
      phone: '+971 50 567 8901',
      location: 'Dubai, UAE',
      status: 'active',
      avatar: 'AL',
      joinDate: '2023-02-28',
      experience: '6 years'
    }
  };

  useEffect(() => {
    if (isOpen && employeeId) {
      const emp = mockEmployees[employeeId];
      if (emp) {
        setEmployee(emp);
        
        // Find all tasks and subtasks assigned to this employee
        const tasks = [];
        const subtasks = [];
        
        allTasks.forEach(task => {
          if (task.owner === employeeId) {
            tasks.push({
              ...task,
              type: 'project',
              level: 'main'
            });
          }
          
          if (task.subtasks) {
            task.subtasks.forEach(subtask => {
              if (subtask.owner === employeeId) {
                subtasks.push({
                  ...subtask,
                  type: 'subtask',
                  level: 'subtask',
                  parentTask: task.name,
                  parentTaskId: task.id
                });
              }
              
              if (subtask.childSubtasks) {
                subtask.childSubtasks.forEach(childSubtask => {
                  if (childSubtask.owner === employeeId) {
                    subtasks.push({
                      ...childSubtask,
                      type: 'child-subtask',
                      level: 'child',
                      parentTask: task.name,
                      parentSubtask: subtask.name,
                      parentTaskId: task.id,
                      parentSubtaskId: subtask.id
                    });
                  }
                });
              }
            });
          }
        });
        
        setAssignedTasks(tasks);
        setAssignedSubtasks(subtasks);
      }
    }
  }, [isOpen, employeeId, allTasks]);

  if (!isOpen || !employee) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'working': return 'bg-yellow-100 text-yellow-800';
      case 'stuck': return 'bg-red-100 text-red-800';
      case 'not started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {employee.avatar}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
              <p className="text-lg text-gray-600">{employee.position}</p>
              <p className="text-sm text-gray-500">{employee.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Employee Information */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  Employee Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{employee.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Joined: {employee.joinDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BriefcaseIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Experience: {employee.experience}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700 capitalize">{employee.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Tasks */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Main Tasks */}
                {assignedTasks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                      Assigned Tasks ({assignedTasks.length})
                    </h3>
                    <div className="space-y-3">
                      {assignedTasks.map((task) => (
                        <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{task.name}</h4>
                            <span className="text-sm text-gray-500">{task.referenceNumber}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span>Progress: {task.progress || 0}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Subtasks */}
                {assignedSubtasks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BriefcaseIcon className="w-5 h-5 text-green-600" />
                      Assigned Tasks ({assignedSubtasks.length})
                    </h3>
                    <div className="space-y-3">
                      {assignedSubtasks.map((subtask) => (
                        <div key={subtask.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{subtask.name}</h4>
                            <span className="text-sm text-gray-500">{subtask.referenceNumber}</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="text-blue-600">Task:</span> {subtask.parentTask}
                            {subtask.parentSubtask && (
                              <span className="ml-2">
                                <span className="text-green-600">Subtask:</span> {subtask.parentSubtask}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subtask.status)}`}>
                              {subtask.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(subtask.priority)}`}>
                              {subtask.priority}
                            </span>
                            <span>Level: {subtask.level}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Tasks */}
                {assignedTasks.length === 0 && assignedSubtasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BriefcaseIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No assigned tasks</p>
                    <p className="text-sm">This employee is not currently assigned to any tasks.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;
