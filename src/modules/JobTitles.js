import React, { useState } from 'react';
import { PencilSquareIcon, EyeIcon, ClipboardDocumentListIcon, ChartPieIcon, DocumentTextIcon, CurrencyDollarIcon, UsersIcon } from '@heroicons/react/24/outline';

const demoJobTitles = [
  { id: 1, title: 'HR Manager', department: 'HR', description: 'Handles HR tasks', salary: 5000, employees: 3 },
  { id: 2, title: 'BIM MEP Modular', department: 'Engineering', description: 'BIM MEP specialist', salary: 7000, employees: 2 },
  { id: 3, title: 'Quantity Surveyor', department: 'Finance', description: 'Cost estimation', salary: 6000, employees: 1 },
  { id: 4, title: 'Accountant', department: 'Finance', description: 'Manages accounts', salary: 5500, employees: 2 },
  { id: 5, title: 'Architect', department: 'Design', description: 'Designs buildings', salary: 8000, employees: 4 },
  { id: 6, title: 'Interior Designer', department: 'Design', description: 'Interior spaces', salary: 6500, employees: 1 },
  { id: 7, title: 'Messenger', department: 'Admin', description: 'Delivers documents', salary: 3000, employees: 1 },
  { id: 8, title: 'Electrical Engineer', department: 'Engineering', description: 'Electrical systems', salary: 7500, employees: 2 },
  { id: 9, title: 'Architecture Draftsperson', department: 'Design', description: 'Drafts plans', salary: 5000, employees: 1 },
  { id: 10, title: 'Managing Director', department: 'Management', description: 'Leads company', salary: 12000, employees: 1 },
];

export default function JobTitles() {
  const [showForm, setShowForm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState({ title: '', department: '', description: '', salary: '' });

  const handleCreateJobTitle = () => {
    if (newJobTitle.title && newJobTitle.department && newJobTitle.description && newJobTitle.salary) {
      demoJobTitles.push({
        id: demoJobTitles.length + 1,
        title: newJobTitle.title,
        department: newJobTitle.department,
        description: newJobTitle.description,
        salary: newJobTitle.salary,
        employees: 0
      });
      setNewJobTitle({ title: '', department: '', description: '', salary: '' });
      setShowCreateModal(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-10 border-b bg-white shadow-sm gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <ClipboardDocumentListIcon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-500" /> 
          Job Titles
        </h1>
        <button
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => setShowCreateModal(true)}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Job Title
        </button>
      </div>
      
      {/* Attractive Section Header */}
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 mb-6 sm:mb-8 mt-6 sm:mt-8 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-lg px-4 sm:px-6 py-3 sm:py-4 border-l-4 border-blue-500 shadow-sm">
          <ClipboardDocumentListIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Job Titles</h2>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-indigo-50 to-white min-h-[60vh] px-4 sm:px-6 lg:px-10">
        <div className="w-full mt-4 sm:mt-8">
          {/* Mobile Cards View */}
          <div className="lg:hidden space-y-4">
            {demoJobTitles.map(job => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition">
                <div className="flex items-center gap-3 mb-3">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-semibold text-gray-800 flex-1">{job.title}</h3>
                  <button className="p-2 rounded hover:bg-indigo-50" title="View"><EyeIcon className="h-5 w-5 text-blue-500" /></button>
                  <button className="p-2 rounded hover:bg-indigo-50" title="Edit"><PencilSquareIcon className="h-5 w-5 text-indigo-500" /></button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <ChartPieIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{job.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{job.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Salary: ${job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-gray-400" />
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                      {job.employees} employees
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto rounded-2xl shadow-2xl bg-white border border-indigo-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {demoJobTitles.map(job => (
                  <tr key={job.id} className="hover:bg-indigo-50 transition cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold flex items-center gap-2">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-400" /> {job.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      <ChartPieIcon className="h-4 w-4 text-indigo-300" /> {job.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{job.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-indigo-300" /> ${job.salary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 shadow-sm">
                        {job.employees} employees
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <button className="p-2 rounded hover:bg-indigo-50" title="View"><EyeIcon className="h-5 w-5 text-blue-500" /></button>
                      <button className="p-2 rounded hover:bg-indigo-50" title="Edit"><PencilSquareIcon className="h-5 w-5 text-indigo-500" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Job Title Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-4">
              <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
              <h3 className="text-lg sm:text-xl font-bold text-white">Create Job Title</h3>
            </div>
            {/* Modal Body */}
            <div className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-white">
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Job Title <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-blue-300" 
                    placeholder="Enter job title" 
                    value={newJobTitle.title} 
                    onChange={e => setNewJobTitle(f => ({ ...f, title: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Department <span className="text-red-500">*</span></label>
                  <select 
                    className="input focus:ring-2 focus:ring-blue-300" 
                    value={newJobTitle.department} 
                    onChange={e => setNewJobTitle(f => ({ ...f, department: e.target.value }))} 
                  >
                    <option value="">Select department</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="IT">IT</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    className="input focus:ring-2 focus:ring-blue-300" 
                    rows="3"
                    placeholder="Enter job description" 
                    value={newJobTitle.description} 
                    onChange={e => setNewJobTitle(f => ({ ...f, description: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Salary <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-blue-300" 
                    type="number"
                    placeholder="Enter salary amount" 
                    value={newJobTitle.salary} 
                    onChange={e => setNewJobTitle(f => ({ ...f, salary: e.target.value }))} 
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-8">
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={handleCreateJobTitle}>Create</button>
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