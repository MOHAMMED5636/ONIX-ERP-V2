import React, { useState } from "react";
import { PencilIcon, TrashIcon, PlusIcon, BriefcaseIcon, ChartPieIcon, DocumentTextIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';

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

// Demo departments data
const demoDepartments = [
  { id: 1, name: "Human Resources", description: "Manages employee relations, recruitment, and HR policies", manager: "Sarah Johnson", employees: 12 },
  { id: 2, name: "Finance", description: "Handles financial planning, accounting, and budget management", manager: "Michael Chen", employees: 8 },
  { id: 3, name: "Information Technology", description: "Manages IT infrastructure, software development, and technical support", manager: "David Rodriguez", employees: 15 },
  { id: 4, name: "Sales", description: "Responsible for revenue generation and customer acquisition", manager: "Lisa Thompson", employees: 20 },
  { id: 5, name: "Marketing", description: "Handles brand management, advertising, and market research", manager: "James Wilson", employees: 10 },
  { id: 6, name: "Operations", description: "Manages day-to-day business operations and process optimization", manager: "Emily Davis", employees: 18 },
  { id: 7, name: "Customer Service", description: "Provides customer support and maintains customer satisfaction", manager: "Robert Brown", employees: 14 },
  { id: 8, name: "Research & Development", description: "Focuses on innovation, product development, and research", manager: "Jennifer Lee", employees: 9 }
];

export default function Departments() {
  const [showForm, setShowForm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '', manager: '' });

  const handleCreateDepartment = () => {
    if (newDepartment.name && newDepartment.description && newDepartment.manager) {
      // Add to demo data
      demoDepartments.push({
        id: demoDepartments.length + 1,
        name: newDepartment.name,
        description: newDepartment.description,
        manager: newDepartment.manager,
        employees: 0
      });
      setNewDepartment({ name: '', description: '', manager: '' });
      setShowCreateModal(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-10 border-b bg-white shadow-sm gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <ChartPieIcon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-500" /> 
          Departments
        </h1>
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Departments</h2>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-indigo-50 to-white min-h-[60vh] px-2 sm:px-6 lg:px-10">
        <div className="w-full mt-4 sm:mt-8">
          {/* Mobile Cards View */}
          <div className="lg:hidden space-y-3 sm:space-y-4">
            {demoDepartments.map(dept => (
              <div key={dept.id} className="bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-200 hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-2 sm:mb-3">
                  <ChartPieIcon className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-semibold text-gray-800 text-sm flex-1">{dept.name}</h3>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {demoDepartments.map(dept => (
                  <tr key={dept.id} className="hover:bg-indigo-50 transition cursor-pointer">
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-semibold flex items-center gap-2">
                      <ChartPieIcon className="h-5 w-5 text-indigo-400" /> {dept.name}
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