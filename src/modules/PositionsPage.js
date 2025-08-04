import React, { useState } from "react";
import { PencilIcon, TrashIcon, PlusIcon, UserGroupIcon, DocumentTextIcon, UserIcon, UsersIcon, ArrowLeftIcon, EyeIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';

// Demo positions data for each sub-department
const demoPositions = {
  "executive-committee": [
    { id: 1, name: "Chief Executive Officer", description: "Overall company leadership and strategic direction", manager: "Rameez Alkadour", employees: 1, status: "Active", salary: "$150,000", requirements: "MBA, 10+ years experience" },
    { id: 2, name: "Chief Financial Officer", description: "Financial planning and corporate finance", manager: "Sarah Johnson", employees: 1, status: "Active", salary: "$120,000", requirements: "CPA, 8+ years experience" },
  ],
  "board-secretariat": [
    { id: 1, name: "Board Secretary", description: "Administrative support and board coordination", manager: "Sarah Johnson", employees: 1, status: "Active", salary: "$80,000", requirements: "Bachelor's degree, 5+ years experience" },
    { id: 2, name: "Executive Assistant", description: "Support for board members and executives", manager: "Mike Chen", employees: 2, status: "Active", salary: "$60,000", requirements: "Associate's degree, 3+ years experience" },
  ],
  "project-planning": [
    { id: 1, name: "Project Manager", description: "Lead project planning and execution", manager: "Abd Aljabar Alabd", employees: 2, status: "Active", salary: "$90,000", requirements: "PMP certification, 5+ years experience" },
    { id: 2, name: "Project Coordinator", description: "Coordinate project activities and resources", manager: "Lisa Wang", employees: 3, status: "Active", salary: "$65,000", requirements: "Bachelor's degree, 3+ years experience" },
  ],
  "project-execution": [
    { id: 1, name: "Senior Developer", description: "Lead technical implementation and development", manager: "Mike Chen", employees: 2, status: "Active", salary: "$110,000", requirements: "Computer Science degree, 7+ years experience" },
    { id: 2, name: "Quality Assurance Engineer", description: "Ensure project quality and testing", manager: "Emma Davis", employees: 2, status: "Active", salary: "$75,000", requirements: "IT degree, 4+ years experience" },
  ],
  "project-monitoring": [
    { id: 1, name: "Project Analyst", description: "Monitor project progress and metrics", manager: "Lisa Wang", employees: 2, status: "Active", salary: "$70,000", requirements: "Business degree, 3+ years experience" },
    { id: 2, name: "Reporting Specialist", description: "Generate project reports and insights", manager: "Alex Rodriguez", employees: 1, status: "Active", salary: "$60,000", requirements: "Data analysis skills, 2+ years experience" },
  ],
  "ui-ux-design": [
    { id: 1, name: "Senior UX Designer", description: "Lead user experience design and research", manager: "Kaddour Alkaodir", employees: 2, status: "Active", salary: "$95,000", requirements: "Design degree, 6+ years experience" },
    { id: 2, name: "UI Designer", description: "Create user interface designs and prototypes", manager: "Emma Davis", employees: 2, status: "Active", salary: "$75,000", requirements: "Design degree, 3+ years experience" },
  ],
  "graphic-design": [
    { id: 1, name: "Creative Director", description: "Lead creative direction and brand strategy", manager: "Emma Davis", employees: 1, status: "Active", salary: "$85,000", requirements: "Art degree, 8+ years experience" },
    { id: 2, name: "Graphic Designer", description: "Create visual designs and marketing materials", manager: "Alex Rodriguez", employees: 2, status: "Active", salary: "$60,000", requirements: "Art degree, 2+ years experience" },
  ],
  "product-design": [
    { id: 1, name: "Product Designer", description: "Design product concepts and user flows", manager: "Alex Rodriguez", employees: 1, status: "Active", salary: "$80,000", requirements: "Design degree, 4+ years experience" },
    { id: 2, name: "Industrial Designer", description: "Design physical product concepts", manager: "Kaddour Alkaodir", employees: 1, status: "Active", salary: "$70,000", requirements: "Industrial design degree, 3+ years experience" },
  ]
};

// Sub-department names mapping
const subDepartmentNames = {
  "executive-committee": "Executive Committee",
  "board-secretariat": "Board Secretariat",
  "project-planning": "Project Planning",
  "project-execution": "Project Execution",
  "project-monitoring": "Project Monitoring",
  "ui-ux-design": "UI/UX Design",
  "graphic-design": "Graphic Design",
  "product-design": "Product Design"
};

export default function PositionsPage() {
  const { departmentId, subDepartmentId } = useParams();
  const navigate = useNavigate();
  
  const [positions, setPositions] = useState(demoPositions[subDepartmentId] || []);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [newPosition, setNewPosition] = useState({ name: '', description: '', manager: '', status: 'Active', salary: '', requirements: '' });
  const [editPosition, setEditPosition] = useState({ name: '', description: '', manager: '', status: 'Active', salary: '', requirements: '' });

  const subDepartmentName = subDepartmentNames[subDepartmentId] || "Sub Department";

  const handlePositionClick = (position) => {
    const positionId = position.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/company-resources/departments/${departmentId}/positions/${subDepartmentId}/job-titles/${positionId}`);
  };

  const handleCreatePosition = () => {
    if (newPosition.name && newPosition.description && newPosition.manager) {
      const newPos = {
        id: positions.length + 1,
        name: newPosition.name,
        description: newPosition.description,
        manager: newPosition.manager,
        employees: 0,
        status: newPosition.status,
        salary: newPosition.salary,
        requirements: newPosition.requirements
      };
      setPositions([...positions, newPos]);
      setNewPosition({ name: '', description: '', manager: '', status: 'Active', salary: '', requirements: '' });
      setShowCreateModal(false);
    }
  };

  const handleEditPosition = (position) => {
    setSelectedPosition(position);
    setEditPosition({
      name: position.name,
      description: position.description,
      manager: position.manager,
      status: position.status,
      salary: position.salary,
      requirements: position.requirements
    });
    setShowEditModal(true);
  };

  const handleViewPosition = (position) => {
    setSelectedPosition(position);
    setShowViewModal(true);
  };

  const handleUpdatePosition = () => {
    if (editPosition.name && editPosition.description && editPosition.manager) {
      setPositions(positions.map(position => 
        position.id === selectedPosition.id 
          ? { ...position, ...editPosition }
          : position
      ));
      setShowEditModal(false);
      setSelectedPosition(null);
      setEditPosition({ name: '', description: '', manager: '', status: 'Active', salary: '', requirements: '' });
    }
  };

  const handleDeletePosition = (position) => {
    setSelectedPosition(position);
    setShowDeleteModal(true);
  };

  const confirmDeletePosition = () => {
    setPositions(positions.filter(position => position.id !== selectedPosition.id));
    setShowDeleteModal(false);
    setSelectedPosition(null);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-10 border-b bg-white shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Back to Sub Departments"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <UserGroupIcon className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500" /> 
            {subDepartmentName} - Positions
          </h1>
        </div>
        <button
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusIcon className="h-5 w-5" />
          Add Position
        </button>
      </div>
      
      {/* Attractive Section Header */}
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 mt-6 sm:mt-8 bg-gradient-to-r from-purple-100 to-pink-50 rounded-lg px-4 sm:px-6 py-3 sm:py-4 border-l-4 border-purple-500 shadow-sm">
          <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Positions</h2>
            <p className="text-sm text-gray-600">Manage positions under {subDepartmentName}</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-purple-50 to-white min-h-[60vh] px-2 sm:px-6 lg:px-10">
        <div className="w-full mt-4 sm:mt-8">
          {/* Mobile Cards View */}
          <div className="lg:hidden space-y-3 sm:space-y-4">
            {positions.map(position => (
              <div key={position.id} className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-200 hover:shadow-lg transition hover:border-purple-300">
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <BriefcaseIcon className="h-5 w-5 text-purple-400" />
                  <h3 
                    className="font-semibold text-gray-800 text-sm flex-1 cursor-pointer hover:text-purple-600 transition hover:underline"
                    onClick={() => handlePositionClick(position)}
                    title="Click to view job titles"
                  >
                    {position.name} <span className="text-xs text-purple-500">→</span>
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleViewPosition(position)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                      title="View Position"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditPosition(position)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit Position"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePosition(position)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete Position"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{position.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Manager: {position.manager}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-gray-400" />
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                      {position.employees} employees
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Salary: {position.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                      position.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {position.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto rounded-2xl shadow-2xl bg-white border border-purple-100">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positions.map(position => (
                  <tr key={position.id} className="hover:bg-purple-50 transition">
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-semibold flex items-center gap-2">
                      <span
                        className="cursor-pointer hover:text-purple-600 transition hover:underline flex items-center gap-2"
                        onClick={() => handlePositionClick(position)}
                        title="Click to view job titles"
                      >
                        <BriefcaseIcon className="h-5 w-5 text-purple-400" /> 
                        {position.name} <span className="text-xs text-purple-500">→</span>
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">{position.description}</td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-purple-300" /> {position.manager}
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 shadow-sm">
                        {position.employees} employees
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">{position.salary}</td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                        position.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {position.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewPosition(position)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="View Position"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditPosition(position)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Position"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePosition(position)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Position"
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

      {/* View Position Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 px-4 sm:px-5 py-3 sm:py-4">
              <EyeIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">View Position</h3>
            </div>
            {/* Modal Body */}
            <div className="p-3 sm:p-6 bg-gradient-to-br from-purple-50 to-white">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <BriefcaseIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedPosition?.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">{selectedPosition?.description}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Manager:</span>
                    <span className="text-gray-900">{selectedPosition?.manager}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Employees:</span>
                    <span className="text-gray-900">{selectedPosition?.employees}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Salary:</span>
                    <span className="text-gray-900">{selectedPosition?.salary}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Requirements:</span>
                    <span className="text-gray-900">{selectedPosition?.requirements}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      selectedPosition?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedPosition?.status}
                    </span>
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

      {/* Create Position Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 px-4 sm:px-5 py-3 sm:py-4">
              <BriefcaseIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">Add Position</h3>
            </div>
            {/* Modal Body */}
            <div className="p-3 sm:p-6 bg-gradient-to-br from-purple-50 to-white">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Position Name <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-purple-300 text-sm" 
                    placeholder="Enter position name" 
                    value={newPosition.name} 
                    onChange={e => setNewPosition(f => ({ ...f, name: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    className="input focus:ring-2 focus:ring-purple-300 text-sm" 
                    rows="3"
                    placeholder="Enter position description" 
                    value={newPosition.description} 
                    onChange={e => setNewPosition(f => ({ ...f, description: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Manager <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-purple-300 text-sm" 
                    placeholder="Enter manager name" 
                    value={newPosition.manager} 
                    onChange={e => setNewPosition(f => ({ ...f, manager: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Salary</label>
                  <input 
                    className="input focus:ring-2 focus:ring-purple-300 text-sm" 
                    placeholder="Enter salary" 
                    value={newPosition.salary} 
                    onChange={e => setNewPosition(f => ({ ...f, salary: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Requirements</label>
                  <textarea 
                    className="input focus:ring-2 focus:ring-purple-300 text-sm" 
                    rows="2"
                    placeholder="Enter job requirements" 
                    value={newPosition.requirements} 
                    onChange={e => setNewPosition(f => ({ ...f, requirements: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Status</label>
                  <select 
                    className="input focus:ring-2 focus:ring-purple-300 text-sm" 
                    value={newPosition.status} 
                    onChange={e => setNewPosition(f => ({ ...f, status: e.target.value }))} 
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full sm:w-auto" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full sm:w-auto" onClick={handleCreatePosition}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Position Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 px-4 sm:px-5 py-3 sm:py-4">
              <PencilIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">Edit Position</h3>
            </div>
            {/* Modal Body */}
            <div className="p-3 sm:p-6 bg-gradient-to-br from-blue-50 to-white">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Position Name <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    placeholder="Enter position name" 
                    value={editPosition.name} 
                    onChange={e => setEditPosition(f => ({ ...f, name: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    rows="3"
                    placeholder="Enter position description" 
                    value={editPosition.description} 
                    onChange={e => setEditPosition(f => ({ ...f, description: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Manager <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    placeholder="Enter manager name" 
                    value={editPosition.manager} 
                    onChange={e => setEditPosition(f => ({ ...f, manager: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Salary</label>
                  <input 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    placeholder="Enter salary" 
                    value={editPosition.salary} 
                    onChange={e => setEditPosition(f => ({ ...f, salary: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Requirements</label>
                  <textarea 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    rows="2"
                    placeholder="Enter job requirements" 
                    value={editPosition.requirements} 
                    onChange={e => setEditPosition(f => ({ ...f, requirements: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Status</label>
                  <select 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    value={editPosition.status} 
                    onChange={e => setEditPosition(f => ({ ...f, status: e.target.value }))} 
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full sm:w-auto" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full sm:w-auto" onClick={handleUpdatePosition}>Update</button>
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
              <h3 className="text-base sm:text-lg font-bold text-white">Delete Position</h3>
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
                    You are about to delete the position <strong>"{selectedPosition?.name}"</strong>. 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full sm:w-auto" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white w-full sm:w-auto" onClick={confirmDeletePosition}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .input { @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-200; }
        .btn { @apply px-4 py-2 rounded font-semibold transition bg-white border border-gray-200 hover:bg-purple-50 hover:text-purple-700 shadow-sm; }
        .btn-primary { @apply bg-purple-600 text-white hover:bg-purple-700 border-0; }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
} 