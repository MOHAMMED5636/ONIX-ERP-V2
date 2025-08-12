import React, { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, PlusIcon, BriefcaseIcon, ChartPieIcon, DocumentTextIcon, UserIcon, UsersIcon, EyeIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { useCompanySelection } from '../context/CompanySelectionContext';

const initialDepartments = [
  "Human Resources",
  "Finance",
  "Information Technology",
  "Sales",
  "Marketing",
  "Operations",
  "Customer Service",
  "Research & Development"
];

// Demo departments data with your specific departments
const demoDepartments = [
  { id: 1, name: "Board of Directors", description: "Executive leadership and strategic decision making for the company", manager: "Rameez Alkadour", employees: 5, departmentId: "board-of-directors" },
  { id: 2, name: "Project Management", description: "Oversees project planning, execution, and delivery across all departments", manager: "Abd Aljabar Alabd", employees: 12, departmentId: "project-management" },
  { id: 3, name: "Design Management", description: "Manages design processes, creative direction, and design team coordination", manager: "Kaddour Alkaodir", employees: 8, departmentId: "design-management" }
];

export default function Departments() {
  const navigate = useNavigate();
  const location = useLocation();
  const [departments, setDepartments] = useState(demoDepartments);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '', manager: '' });
  const [editDepartment, setEditDepartment] = useState({ name: '', description: '', manager: '' });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const { selectedDepartment: contextSelectedDepartment, selectDepartment } = useCompanySelection();

  // Get selected company from navigation state
  useEffect(() => {
    if (location.state?.selectedCompany) {
      setSelectedCompany(location.state.selectedCompany);
    }
  }, [location.state]);

  const handleCreateDepartment = () => {
    if (newDepartment.name && newDepartment.description && newDepartment.manager) {
      const newDept = {
        id: departments.length + 1,
        name: newDepartment.name,
        description: newDepartment.description,
        manager: newDepartment.manager,
        employees: 0
      };
      setDepartments([...departments, newDept]);
      setNewDepartment({ name: '', description: '', manager: '' });
      setShowCreateModal(false);
    }
  };

  const handleViewDepartment = (dept) => {
    setSelectedDepartment(dept);
    setShowViewModal(true);
  };

  const handleEditDepartment = (dept) => {
    setSelectedDepartment(dept);
    setEditDepartment({
      name: dept.name,
      description: dept.description,
      manager: dept.manager
    });
    setShowEditModal(true);
  };

  const handleUpdateDepartment = () => {
    if (editDepartment.name && editDepartment.description && editDepartment.manager) {
      setDepartments(departments.map(dept => 
        dept.id === selectedDepartment.id 
          ? { ...dept, ...editDepartment }
          : dept
      ));
      setShowEditModal(false);
      setSelectedDepartment(null);
      setEditDepartment({ name: '', description: '', manager: '' });
    }
  };

  const handleDeleteDepartment = (dept) => {
    setSelectedDepartment(dept);
    setShowDeleteModal(true);
  };

  const confirmDeleteDepartment = () => {
    setDepartments(departments.filter(dept => dept.id !== selectedDepartment.id));
    setShowDeleteModal(false);
    setSelectedDepartment(null);
  };

  const handleDepartmentClick = (dept) => {
    if (dept.departmentId) {
      navigate(`/company-resources/departments/${dept.departmentId}/sub-departments`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Breadcrumbs names={{}} />
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-10 border-b bg-white shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/companies')}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Back to Companies"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <ChartPieIcon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-500" /> 
              Departments
            </h1>
            {selectedCompany && (
              <p className="text-sm text-gray-600 mt-1">
                {selectedCompany.name} • {selectedCompany.address}
              </p>
            )}
          </div>
        </div>
        <button
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto justify-center"
          onClick={() => setShowCreateModal(true)}
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Department
        </button>
      </div>
      

      
      {/* Enhanced Section Header */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8">
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
                  <p className="text-blue-100 text-lg leading-relaxed">Manage departments for ONIX Construction. Click on any department to view its sub-departments and positions.</p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
                <div className="px-6 py-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <span className="text-white text-lg font-semibold">{departments.length} Departments</span>
                </div>
                <div className="px-6 py-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <span className="text-white text-lg font-semibold">Active</span>
                </div>
              </div>
            </div>
            
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-white text-2xl font-bold">{departments.length}</div>
                <div className="text-blue-100 text-sm">Total Departments</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-white text-2xl font-bold">{departments.reduce((sum, dept) => sum + dept.employees, 0)}</div>
                <div className="text-blue-100 text-sm">Total Employees</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-white text-2xl font-bold">{departments.length}</div>
                <div className="text-blue-100 text-sm">Active Managers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 w-full px-4 sm:px-6 lg:px-10">
        <div className="w-full">
          {/* Enhanced Mobile Cards View */}
          <div className="lg:hidden space-y-6">
            {departments.map(dept => (
              <div 
                key={dept.id} 
                className="group bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02]"
                onClick={() => handleDepartmentClick(dept)}
                title="Click to view sub-departments"
              >
                <div className="relative overflow-hidden">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                          <ChartPieIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-900 transition-colors">{dept.name}</h3>
                          <p className="text-gray-500 text-sm">Department</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDepartment(dept);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="View Department"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDepartment(dept);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Edit Department"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDepartment(dept);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Delete Department"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectDepartment(dept.name);
                          }}
                          className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                            contextSelectedDepartment === dept.name
                              ? "text-green-600 bg-green-50"
                              : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                          }`}
                          title={contextSelectedDepartment === dept.name ? "Selected for Employee Creation" : "Select for Employee Creation"}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed flex-1">{dept.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <UserIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Manager</p>
                            <p className="font-semibold text-gray-900 text-sm">{dept.manager}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="p-1.5 bg-green-100 rounded-lg">
                            <UsersIcon className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Employees</p>
                            <p className="font-semibold text-gray-900 text-sm">{dept.employees}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Click to view sub-departments</span>
                        <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                          <span>View Details</span>
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
                  <thead className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Department</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Description</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Manager</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Employees</th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {departments.map(dept => (
                      <tr 
                        key={dept.id} 
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer group" 
                        onClick={() => handleDepartmentClick(dept)}
                        title="Click to view sub-departments"
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                              <ChartPieIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-base group-hover:text-blue-900 transition-colors">{dept.name}</div>
                              <div className="text-gray-500 text-sm">Department</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="max-w-md">
                            <p className="text-gray-700 text-sm leading-relaxed">{dept.description}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-sm">
                              <UserIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <span className="text-gray-900 text-sm font-semibold">{dept.manager}</span>
                              <div className="text-gray-500 text-xs">Manager</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                              <UsersIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-700 shadow-sm">
                                {dept.employees} employees
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDepartment(dept);
                              }}
                              className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                              title="View Department"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDepartment(dept);
                              }}
                              className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                              title="Edit Department"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDepartment(dept);
                              }}
                              className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                              title="Delete Department"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                selectDepartment(dept.name);
                              }}
                              className={`p-3 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm ${
                                contextSelectedDepartment === dept.name
                                  ? "text-green-600 bg-green-50"
                                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                              }`}
                              title={contextSelectedDepartment === dept.name ? "Selected for Employee Creation" : "Select for Employee Creation"}
                            >
                              <CheckIcon className="h-5 w-5" />
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

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-1 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md relative animate-fade-in overflow-hidden border border-gray-100">
            {/* Modal Header with enhanced styling */}
            <div className="relative overflow-hidden">
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <ChartPieIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Create Department</h3>
                  <p className="text-blue-100 text-sm">Add a new department to your organization</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>
            </div>
            
            {/* Modal Body with enhanced styling */}
            <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50">
              <div className="space-y-5">
                {/* Department Name Field */}
                <div className="group">
                  <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Department Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm" 
                      placeholder="e.g., Human Resources" 
                      value={newDepartment.name} 
                      onChange={e => setNewDepartment(f => ({ ...f, name: e.target.value }))} 
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </div>
                </div>

                {/* Description Field */}
                <div className="group">
                  <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 text-sm bg-white shadow-sm resize-none" 
                      rows="3"
                      placeholder="Describe the department's role and responsibilities..." 
                      value={newDepartment.description} 
                      onChange={e => setNewDepartment(f => ({ ...f, description: e.target.value }))} 
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </div>
                </div>

                {/* Manager Field */}
                <div className="group">
                  <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Manager <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-sm bg-white shadow-sm" 
                      placeholder="e.g., John Smith" 
                      value={newDepartment.manager} 
                      onChange={e => setNewDepartment(f => ({ ...f, manager: e.target.value }))} 
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-2 h-2 bg-purple-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
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
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-0" 
                  onClick={handleCreateDepartment}
                >
                  <span className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Create Department
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 px-4 sm:px-5 py-3 sm:py-4">
              <PencilIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">Edit Department</h3>
            </div>
            {/* Modal Body */}
            <div className="p-3 sm:p-6 bg-gradient-to-br from-emerald-50 to-white">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Department Name <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-green-300 text-sm" 
                    placeholder="Enter department name" 
                    value={editDepartment.name} 
                    onChange={e => setEditDepartment(f => ({ ...f, name: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    className="input focus:ring-2 focus:ring-green-300 text-sm" 
                    rows="3"
                    placeholder="Enter department description" 
                    value={editDepartment.description} 
                    onChange={e => setEditDepartment(f => ({ ...f, description: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Manager <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-green-300 text-sm" 
                    placeholder="Enter manager name" 
                    value={editDepartment.manager} 
                    onChange={e => setEditDepartment(f => ({ ...f, manager: e.target.value }))} 
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 w-full sm:w-auto" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-0 w-full sm:w-auto" onClick={handleUpdateDepartment}>Update</button>
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
              <h3 className="text-base sm:text-lg font-bold text-white">Delete Department</h3>
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
                    You are about to delete the department <strong>"{selectedDepartment?.name}"</strong>. 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 w-full sm:w-auto" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-0 w-full sm:w-auto" onClick={confirmDeleteDepartment}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Department Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 px-4 sm:px-5 py-3 sm:py-4">
              <EyeIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">View Department</h3>
            </div>
            {/* Modal Body */}
            <div className="p-3 sm:p-6 bg-gradient-to-br from-emerald-50 to-white">
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2 text-gray-700 text-sm">Department Name</label>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 text-gray-800 font-semibold">
                    {selectedDepartment?.name}
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-2 text-gray-700 text-sm">Description</label>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 text-gray-800">
                    {selectedDepartment?.description}
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-2 text-gray-700 text-sm">Manager</label>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 text-gray-800 flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-green-500" />
                    {selectedDepartment?.manager}
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-2 text-gray-700 text-sm">Employees</label>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 text-gray-800 flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-green-500" />
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      {selectedDepartment?.employees} employees
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6 sm:mt-8">
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .input { @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200; }
        .btn { @apply px-4 py-2 rounded font-semibold transition bg-white border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm; }
        .btn-primary { @apply bg-indigo-600 text-white hover:bg-indigo-700 border-0; }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
} 