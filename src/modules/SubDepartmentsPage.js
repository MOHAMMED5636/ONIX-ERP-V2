import React, { useState } from "react";
import { PencilIcon, TrashIcon, PlusIcon, ChartPieIcon, DocumentTextIcon, UserIcon, UsersIcon, ArrowLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';

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
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusIcon className="h-5 w-5" />
          Add Sub Department
        </button>
      </div>
      
      {/* Attractive Section Header */}
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 mt-6 sm:mt-8 bg-gradient-to-r from-green-100 to-emerald-50 rounded-lg px-4 sm:px-6 py-3 sm:py-4 border-l-4 border-green-500 shadow-sm">
          <ChartPieIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Sub Departments</h2>
            <p className="text-sm text-gray-600">Manage sub-departments under {departmentName}. Click on any sub-department to view its positions.</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-green-50 to-white min-h-[60vh] px-2 sm:px-6 lg:px-10">
        <div className="w-full mt-4 sm:mt-8">
          {/* Mobile Cards View */}
          <div className="lg:hidden space-y-3 sm:space-y-4">
            {subDepartments.map(subDept => (
              <div key={subDept.id} className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-200 hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <ChartPieIcon className="h-5 w-5 text-green-400" />
                  <h3 
                    className="font-semibold text-gray-800 text-sm flex-1 cursor-pointer hover:text-green-600 transition hover:underline"
                    onClick={() => navigate(`/company-resources/departments/${departmentId}/positions/${subDept.name.toLowerCase().replace(/\s+/g, '-')}`)}
                    title="Click to view positions"
                  >
                    {subDept.name} <span className="text-xs text-green-500">→</span>
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleViewSubDepartment(subDept)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                      title="View Sub Department"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditSubDepartment(subDept)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit Sub Department"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubDepartment(subDept)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete Sub Department"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{subDept.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Manager: {subDept.manager}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-gray-400" />
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      {subDept.employees} employees
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                      subDept.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {subDept.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto rounded-2xl shadow-2xl bg-white border border-green-100">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Sub Department</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subDepartments.map(subDept => (
                  <tr key={subDept.id} className="hover:bg-green-50 transition">
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-semibold flex items-center gap-2">
                      <ChartPieIcon className="h-5 w-5 text-green-400" /> 
                      <span 
                        className="cursor-pointer hover:text-green-600 transition hover:underline"
                        onClick={() => navigate(`/company-resources/departments/${departmentId}/positions/${subDept.name.toLowerCase().replace(/\s+/g, '-')}`)}
                        title="Click to view positions"
                      >
                        {subDept.name} <span className="text-xs text-green-500">→</span>
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">{subDept.description}</td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-green-300" /> {subDept.manager}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 shadow-sm">
                        {subDept.employees} employees
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                        subDept.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {subDept.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewSubDepartment(subDept)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="View Sub Department"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditSubDepartment(subDept)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Sub Department"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubDepartment(subDept)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Sub Department"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 px-4 sm:px-5 py-3 sm:py-4">
              <ChartPieIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">Add Sub Department</h3>
            </div>
            {/* Modal Body */}
            <div className="p-3 sm:p-6 bg-gradient-to-br from-green-50 to-white">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Sub Department Name <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-green-300 text-sm" 
                    placeholder="Enter sub department name" 
                    value={newSubDepartment.name} 
                    onChange={e => setNewSubDepartment(f => ({ ...f, name: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    className="input focus:ring-2 focus:ring-green-300 text-sm" 
                    rows="3"
                    placeholder="Enter sub department description" 
                    value={newSubDepartment.description} 
                    onChange={e => setNewSubDepartment(f => ({ ...f, description: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Manager <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-green-300 text-sm" 
                    placeholder="Enter manager name" 
                    value={newSubDepartment.manager} 
                    onChange={e => setNewSubDepartment(f => ({ ...f, manager: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Location</label>
                  <input 
                    className="input focus:ring-2 focus:ring-green-300 text-sm" 
                    placeholder="Enter location" 
                    value={newSubDepartment.location} 
                    onChange={e => setNewSubDepartment(f => ({ ...f, location: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Budget</label>
                  <input 
                    className="input focus:ring-2 focus:ring-green-300 text-sm" 
                    placeholder="Enter budget" 
                    value={newSubDepartment.budget} 
                    onChange={e => setNewSubDepartment(f => ({ ...f, budget: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Status</label>
                  <select 
                    className="input focus:ring-2 focus:ring-green-300 text-sm" 
                    value={newSubDepartment.status} 
                    onChange={e => setNewSubDepartment(f => ({ ...f, status: e.target.value }))} 
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full sm:w-auto" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white w-full sm:w-auto" onClick={handleCreateSubDepartment}>Create</button>
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
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full sm:w-auto" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full sm:w-auto" onClick={handleUpdateSubDepartment}>Update</button>
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
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full sm:w-auto" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white w-full sm:w-auto" onClick={confirmDeleteSubDepartment}>Delete</button>
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