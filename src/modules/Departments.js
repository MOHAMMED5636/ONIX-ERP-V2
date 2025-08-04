import React, { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, PlusIcon, BriefcaseIcon, ChartPieIcon, DocumentTextIcon, UserIcon, UsersIcon, EyeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';

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
      navigate(`/company-resources/departments/${dept.departmentId}`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
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
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => setShowCreateModal(true)}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Department
        </button>
      </div>
      
      {/* Attractive Section Header */}
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 mt-6 sm:mt-8 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-lg px-4 sm:px-6 py-3 sm:py-4 border-l-4 border-blue-500 shadow-sm">
          <ChartPieIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
              {selectedCompany ? `${selectedCompany.name} Departments` : 'Departments'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCompany 
                ? `Manage departments for ${selectedCompany.name}. Click on any department to view its sub-departments.`
                : 'Click on any department to view its sub-departments'
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-indigo-50 to-white min-h-[60vh] px-2 sm:px-6 lg:px-10">
        <div className="w-full mt-4 sm:mt-8">
          {/* Mobile Cards View */}
          <div className="lg:hidden space-y-3 sm:space-y-4">
            {departments.map(dept => (
              <div 
                key={dept.id} 
                className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-200 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-200 hover:border-indigo-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => handleDepartmentClick(dept)}
                title="Click to view sub-departments"
              >
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <ChartPieIcon className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-semibold text-gray-800 text-sm flex-1">
                    {dept.name} <span className="text-xs text-indigo-500">→</span>
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDepartment(dept);
                      }}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                      title="View Department"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDepartment(dept);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit Department"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDepartment(dept);
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete Department"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{dept.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Manager: {dept.manager}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-gray-400" />
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                      {dept.employees} employees
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto rounded-2xl shadow-2xl bg-white border border-indigo-100">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map(dept => (
                  <tr 
                    key={dept.id} 
                    className="hover:bg-indigo-50 transition cursor-pointer group" 
                    onClick={() => handleDepartmentClick(dept)}
                    title="Click to view sub-departments"
                  >
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-semibold flex items-center gap-2">
                      <ChartPieIcon className="h-5 w-5 text-indigo-400" /> 
                      <span>
                        {dept.name} <span className="text-xs text-indigo-500">→</span>
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">{dept.description}</td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-indigo-300" /> {dept.manager}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 shadow-sm">
                        {dept.employees} employees
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDepartment(dept);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="View Department"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDepartment(dept);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Department"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDepartment(dept);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Department"
                        >
                          <TrashIcon className="h-4 w-4" />
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

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 px-4 sm:px-5 py-3 sm:py-4">
              <ChartPieIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">Create Department</h3>
            </div>
            {/* Modal Body */}
            <div className="p-3 sm:p-6 bg-gradient-to-br from-indigo-50 to-white">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Department Name <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    placeholder="Enter department name" 
                    value={newDepartment.name} 
                    onChange={e => setNewDepartment(f => ({ ...f, name: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    rows="3"
                    placeholder="Enter department description" 
                    value={newDepartment.description} 
                    onChange={e => setNewDepartment(f => ({ ...f, description: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Manager <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    placeholder="Enter manager name" 
                    value={newDepartment.manager} 
                    onChange={e => setNewDepartment(f => ({ ...f, manager: e.target.value }))} 
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full sm:w-auto" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full sm:w-auto" onClick={handleCreateDepartment}>Create</button>
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
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full sm:w-auto" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white w-full sm:w-auto" onClick={handleUpdateDepartment}>Update</button>
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
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full sm:w-auto" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white w-full sm:w-auto" onClick={confirmDeleteDepartment}>Delete</button>
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