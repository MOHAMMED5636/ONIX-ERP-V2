import React, { useState } from "react";
import { PencilIcon, TrashIcon, PlusIcon, ChartPieIcon, DocumentTextIcon, UserIcon, UsersIcon, ArrowLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';

// Demo sub-departments data for each main department
const demoSubDepartments = {
  "board-of-directors": [
    { id: 1, name: "Executive Committee", description: "High-level strategic decision making", manager: "Rameez Alkadour", employees: 3, status: "Active", location: "Floor 10", budget: "$500,000" },
    { id: 2, name: "Board Secretariat", description: "Administrative support for board activities", manager: "Sarah Johnson", employees: 2, status: "Active", location: "Floor 9", budget: "$200,000" },
  ],
  "project-management": [
    { id: 1, name: "Project Planning", description: "Project initiation and planning activities", manager: "Abd Aljabar Alabd", employees: 5, status: "Active", location: "Floor 5", budget: "$300,000" },
    { id: 2, name: "Project Execution", description: "Day-to-day project implementation", manager: "Mike Chen", employees: 4, status: "Active", location: "Floor 6", budget: "$400,000" },
    { id: 3, name: "Project Monitoring", description: "Progress tracking and quality control", manager: "Lisa Wang", employees: 3, status: "Active", location: "Floor 7", budget: "$250,000" },
  ],
  "design-management": [
    { id: 1, name: "UI/UX Design", description: "User interface and experience design", manager: "Kaddour Alkaodir", employees: 4, status: "Active", location: "Floor 3", budget: "$350,000" },
    { id: 2, name: "Graphic Design", description: "Visual design and branding", manager: "Emma Davis", employees: 3, status: "Active", location: "Floor 4", budget: "$280,000" },
    { id: 3, name: "Product Design", description: "Product concept and industrial design", manager: "Alex Rodriguez", employees: 2, status: "Active", location: "Floor 2", budget: "$220,000" },
  ]
};

// Department names mapping
const departmentNames = {
  "board-of-directors": "Board of Directors",
  "project-management": "Project Management", 
  "design-management": "Design Management"
};

export default function SubDepartmentsPage() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  
  const [subDepartments, setSubDepartments] = useState(demoSubDepartments[departmentId] || []);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubDepartment, setSelectedSubDepartment] = useState(null);
  const [newSubDepartment, setNewSubDepartment] = useState({ name: '', description: '', manager: '', status: 'Active', location: '', budget: '' });
  const [editSubDepartment, setEditSubDepartment] = useState({ name: '', description: '', manager: '', status: 'Active', location: '', budget: '' });

  const departmentName = departmentNames[departmentId] || "Department";

  const handleCreateSubDepartment = () => {
    if (newSubDepartment.name && newSubDepartment.description && newSubDepartment.manager) {
      const newSubDept = {
        id: subDepartments.length + 1,
        name: newSubDepartment.name,
        description: newSubDepartment.description,
        manager: newSubDepartment.manager,
        employees: 0,
        status: newSubDepartment.status,
        location: newSubDepartment.location,
        budget: newSubDepartment.budget
      };
      setSubDepartments([...subDepartments, newSubDept]);
      setNewSubDepartment({ name: '', description: '', manager: '', status: 'Active', location: '', budget: '' });
      setShowCreateModal(false);
    }
  };

  const handleEditSubDepartment = (subDept) => {
    setSelectedSubDepartment(subDept);
    setEditSubDepartment({
      name: subDept.name,
      description: subDept.description,
      manager: subDept.manager,
      status: subDept.status,
      location: subDept.location,
      budget: subDept.budget
    });
    setShowEditModal(true);
  };

  const handleViewSubDepartment = (subDept) => {
    setSelectedSubDepartment(subDept);
    setShowViewModal(true);
  };

  const handleUpdateSubDepartment = () => {
    if (editSubDepartment.name && editSubDepartment.description && editSubDepartment.manager) {
      setSubDepartments(subDepartments.map(subDept => 
        subDept.id === selectedSubDepartment.id 
          ? { ...subDept, ...editSubDepartment }
          : subDept
      ));
      setShowEditModal(false);
      setSelectedSubDepartment(null);
      setEditSubDepartment({ name: '', description: '', manager: '', status: 'Active', location: '', budget: '' });
    }
  };

  const handleDeleteSubDepartment = (subDept) => {
    setSelectedSubDepartment(subDept);
    setShowDeleteModal(true);
  };

  const confirmDeleteSubDepartment = () => {
    setSubDepartments(subDepartments.filter(subDept => subDept.id !== selectedSubDepartment.id));
    setShowDeleteModal(false);
    setSelectedSubDepartment(null);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Breadcrumbs />
      
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-10 border-b bg-white shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/departments')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Back to Departments"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ChartPieIcon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-500" /> 
            {departmentName} - Sub Departments
          </h1>
        </div>
        <button
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto justify-center"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Sub Department
        </button>
      </div>
      
      {/* Enhanced Section Header */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl shadow-2xl p-8">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>
          <div className="absolute top-1/2 right-8 w-16 h-16 bg-white bg-opacity-5 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
                  <ChartPieIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-green-100 text-lg leading-relaxed">Manage sub-departments under {departmentName}. Click on any sub-department to view its positions.</p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
                <div className="px-6 py-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <span className="text-white text-lg font-semibold">{subDepartments.length} Sub Departments</span>
                </div>
                <div className="px-6 py-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <span className="text-white text-lg font-semibold">Active</span>
                </div>
              </div>
            </div>
            
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-white text-2xl font-bold">{subDepartments.length}</div>
                <div className="text-green-100 text-sm">Total Sub Departments</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-white text-2xl font-bold">{subDepartments.reduce((sum, subDept) => sum + subDept.employees, 0)}</div>
                <div className="text-green-100 text-sm">Total Employees</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-white text-2xl font-bold">{subDepartments.filter(subDept => subDept.status === 'Active').length}</div>
                <div className="text-green-100 text-sm">Active Sub Departments</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-green-50 to-white min-h-[60vh] px-2 sm:px-6 lg:px-10">
        <div className="w-full mt-4 sm:mt-8">
          {/* Enhanced Mobile Cards View */}
          <div className="lg:hidden space-y-6">
            {subDepartments.map(subDept => (
              <div 
                key={subDept.id} 
                className="group bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:border-green-300 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02]"
                onClick={() => navigate(`/company-resources/departments/${departmentId}/sub-departments/${subDept.name.toLowerCase().replace(/\s+/g, '-')}/positions`)}
                title="Click to view positions"
              >
                <div className="relative overflow-hidden">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                          <ChartPieIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-900 transition-colors">{subDept.name}</h3>
                          <p className="text-gray-500 text-sm">Sub Department</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewSubDepartment(subDept);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="View Sub Department"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSubDepartment(subDept);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Edit Sub Department"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubDepartment(subDept);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Delete Sub Department"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed flex-1">{subDept.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="p-1.5 bg-green-100 rounded-lg">
                            <UserIcon className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Manager</p>
                            <p className="font-semibold text-gray-900 text-sm">{subDept.manager}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="p-1.5 bg-emerald-100 rounded-lg">
                            <UsersIcon className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Employees</p>
                            <p className="font-semibold text-gray-900 text-sm">{subDept.employees}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          subDept.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            subDept.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          {subDept.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Click to view positions</span>
                        <div className="flex items-center gap-2 text-green-600 text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                          <span>View Positions</span>
                          <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Enhanced Desktop Table View */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Sub Department</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Description</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Manager</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Employees</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Status</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {subDepartments.map(subDept => (
                                              <tr 
                          key={subDept.id} 
                          className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 cursor-pointer group" 
                          onClick={() => navigate(`/company-resources/departments/${departmentId}/sub-departments/${subDept.name.toLowerCase().replace(/\s+/g, '-')}/positions`)}
                          title="Click to view positions"
                        >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                              <ChartPieIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-base group-hover:text-green-900 transition-colors">{subDept.name}</div>
                              <div className="text-gray-500 text-sm">Sub Department</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="max-w-md">
                            <p className="text-gray-700 text-sm leading-relaxed">{subDept.description}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                              <UserIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <span className="text-gray-900 text-sm font-semibold">{subDept.manager}</span>
                              <div className="text-gray-500 text-xs">Manager</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center shadow-sm">
                              <UsersIcon className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 shadow-sm">
                                {subDept.employees} employees
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                            subDept.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              subDept.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            {subDept.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewSubDepartment(subDept);
                              }}
                              className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                              title="View Sub Department"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSubDepartment(subDept);
                              }}
                              className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                              title="Edit Sub Department"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSubDepartment(subDept);
                              }}
                              className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                              title="Delete Sub Department"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Sub Department Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 px-4 sm:px-5 py-3 sm:py-4">
              <EyeIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">View Sub Department</h3>
            </div>
            {/* Modal Body */}
            <div className="p-3 sm:p-6 bg-gradient-to-br from-green-50 to-white">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <ChartPieIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedSubDepartment?.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">{selectedSubDepartment?.description}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Manager:</span>
                    <span className="text-gray-900">{selectedSubDepartment?.manager}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Employees:</span>
                    <span className="text-gray-900">{selectedSubDepartment?.employees}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      selectedSubDepartment?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedSubDepartment?.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="text-gray-900">{selectedSubDepartment?.location}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Budget:</span>
                    <span className="text-gray-900">{selectedSubDepartment?.budget}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Sub Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-1 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md relative animate-fade-in overflow-hidden border border-gray-100">
            {/* Modal Header with enhanced styling */}
            <div className="relative overflow-hidden">
              <div className="flex items-center gap-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-4">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <ChartPieIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add Sub Department</h3>
                  <p className="text-green-100 text-sm">Create a new sub-department under {departmentName}</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>
            </div>
            
            {/* Modal Body with enhanced styling */}
            <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-green-50">
              <div className="space-y-5">
                {/* Sub Department Name Field */}
                <div className="group">
                  <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Sub Department Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-sm bg-white shadow-sm" 
                      placeholder="e.g., Executive Committee" 
                      value={newSubDepartment.name} 
                      onChange={e => setNewSubDepartment(f => ({ ...f, name: e.target.value }))} 
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-2 h-2 bg-green-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </div>
                </div>

                {/* Description Field */}
                <div className="group">
                  <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-200 text-sm bg-white shadow-sm resize-none" 
                      rows="3"
                      placeholder="Describe the sub-department's role and responsibilities..." 
                      value={newSubDepartment.description} 
                      onChange={e => setNewSubDepartment(f => ({ ...f, description: e.target.value }))} 
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </div>
                </div>

                {/* Manager Field */}
                <div className="group">
                  <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    Manager <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all duration-200 text-sm bg-white shadow-sm" 
                      placeholder="e.g., Sarah Johnson" 
                      value={newSubDepartment.manager} 
                      onChange={e => setNewSubDepartment(f => ({ ...f, manager: e.target.value }))} 
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-2 h-2 bg-teal-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </div>
                </div>

                {/* Location Field */}
                <div className="group">
                  <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Location
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm" 
                      placeholder="e.g., Floor 10" 
                      value={newSubDepartment.location} 
                      onChange={e => setNewSubDepartment(f => ({ ...f, location: e.target.value }))} 
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </div>
                </div>

                
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-0" 
                  onClick={handleCreateSubDepartment}
                >
                  <span className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Create Sub Department
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sub Department Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 px-4 sm:px-5 py-3 sm:py-4">
              <PencilIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">Edit Sub Department</h3>
            </div>
            {/* Modal Body */}
            <div className="p-3 sm:p-6 bg-gradient-to-br from-blue-50 to-white">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Sub Department Name <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    placeholder="Enter sub department name" 
                    value={editSubDepartment.name} 
                    onChange={e => setEditSubDepartment(f => ({ ...f, name: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    rows="3"
                    placeholder="Enter sub department description" 
                    value={editSubDepartment.description} 
                    onChange={e => setEditSubDepartment(f => ({ ...f, description: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Manager <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    placeholder="Enter manager name" 
                    value={editSubDepartment.manager} 
                    onChange={e => setEditSubDepartment(f => ({ ...f, manager: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Location</label>
                  <input 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    placeholder="Enter location" 
                    value={editSubDepartment.location} 
                    onChange={e => setEditSubDepartment(f => ({ ...f, location: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Budget</label>
                  <input 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    placeholder="Enter budget" 
                    value={editSubDepartment.budget} 
                    onChange={e => setEditSubDepartment(f => ({ ...f, budget: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Status</label>
                  <select 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    value={editSubDepartment.status} 
                    onChange={e => setEditSubDepartment(f => ({ ...f, status: e.target.value }))} 
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 w-full sm:w-auto" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-0 w-full sm:w-auto" onClick={handleUpdateSubDepartment}>Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 px-4 sm:px-5 py-3 sm:py-4">
              <TrashIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">Delete Sub Department</h3>
            </div>
            {/* Modal Body */}
            <div className="p-3 sm:p-6 bg-gradient-to-br from-red-50 to-white">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <TrashIcon className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h4>
                  <p className="text-gray-600 text-sm">
                    You are about to delete the sub department <strong>"{selectedSubDepartment?.name}"</strong>. 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 w-full sm:w-auto" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-0 w-full sm:w-auto" onClick={confirmDeleteSubDepartment}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .input { @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-200; }
        .btn { @apply px-4 py-2 rounded font-semibold transition bg-white border border-gray-200 hover:bg-green-50 hover:text-green-700 shadow-sm; }
        .btn-primary { @apply bg-green-600 text-white hover:bg-green-700 border-0; }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
} 