import React, { useState } from "react";
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon, ArrowLeftIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';

// Demo job titles data for each position
const demoJobTitles = {
  "chief-executive-officer": [
    { id: 1, title: "CEO - Global", description: "Global CEO role", status: "Active" },
    { id: 2, title: "CEO - Regional", description: "Regional CEO role", status: "Inactive" },
  ],
  "chief-financial-officer": [
    { id: 1, title: "CFO - North America", description: "CFO for North America", status: "Active" },
  ],
  "project-manager": [
    { id: 1, title: "Senior Project Manager", description: "Senior level project management", status: "Active" },
    { id: 2, title: "Junior Project Manager", description: "Junior level project management", status: "Active" },
  ],
  "senior-designer": [
    { id: 1, title: "Lead Designer", description: "Lead design role", status: "Active" },
    { id: 2, title: "UI/UX Designer", description: "UI/UX design specialist", status: "Active" },
  ],
  "design-director": [
    { id: 1, title: "Creative Director", description: "Creative direction role", status: "Active" },
    { id: 2, title: "Art Director", description: "Art direction role", status: "Active" },
  ],
  "executive-committee": [
    { id: 1, title: "Committee Chair", description: "Executive committee chair", status: "Active" },
    { id: 2, title: "Committee Member", description: "Executive committee member", status: "Active" },
  ],
  "strategic-planning": [
    { id: 1, title: "Strategic Planner", description: "Strategic planning role", status: "Active" },
    { id: 2, title: "Business Analyst", description: "Business analysis role", status: "Active" },
  ],
  "risk-management": [
    { id: 1, title: "Risk Manager", description: "Risk management role", status: "Active" },
    { id: 2, title: "Compliance Officer", description: "Compliance role", status: "Active" },
  ],
  "agile-coach": [
    { id: 1, title: "Senior Agile Coach", description: "Senior agile coaching", status: "Active" },
    { id: 2, title: "Scrum Master", description: "Scrum master role", status: "Active" },
  ],
  "product-owner": [
    { id: 1, title: "Product Owner", description: "Product ownership role", status: "Active" },
    { id: 2, title: "Product Manager", description: "Product management role", status: "Active" },
  ],
  "technical-lead": [
    { id: 1, title: "Technical Lead", description: "Technical leadership role", status: "Active" },
    { id: 2, title: "Senior Developer", description: "Senior development role", status: "Active" },
  ],
  "graphic-designer": [
    { id: 1, title: "Senior Graphic Designer", description: "Senior graphic design", status: "Active" },
    { id: 2, title: "Junior Graphic Designer", description: "Junior graphic design", status: "Active" },
  ],
  "web-designer": [
    { id: 1, title: "Web Designer", description: "Web design role", status: "Active" },
    { id: 2, title: "Frontend Designer", description: "Frontend design role", status: "Active" },
  ],
  "brand-designer": [
    { id: 1, title: "Brand Designer", description: "Brand design role", status: "Active" },
    { id: 2, title: "Visual Designer", description: "Visual design role", status: "Active" },
  ],
};

export default function JobTitlesPage() {
  const { departmentId, subDepartmentId, positionId } = useParams();
  const navigate = useNavigate();

  const [jobTitles, setJobTitles] = useState(demoJobTitles[positionId] || []);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState(null);
  const [newJobTitle, setNewJobTitle] = useState({ title: '', description: '', status: 'Active' });
  const [editJobTitle, setEditJobTitle] = useState({ title: '', description: '', status: 'Active' });

  const handleCreateJobTitle = () => {
    if (newJobTitle.title && newJobTitle.description) {
      const newTitle = {
        id: jobTitles.length + 1,
        ...newJobTitle,
      };
      setJobTitles([...jobTitles, newTitle]);
      setNewJobTitle({ title: '', description: '', status: 'Active' });
      setShowCreateModal(false);
    }
  };

  const handleEditJobTitle = (jobTitle) => {
    setSelectedJobTitle(jobTitle);
    setEditJobTitle({ ...jobTitle });
    setShowEditModal(true);
  };

  const handleViewJobTitle = (jobTitle) => {
    setSelectedJobTitle(jobTitle);
    setShowViewModal(true);
  };

  const handleUpdateJobTitle = () => {
    if (editJobTitle.title && editJobTitle.description) {
      setJobTitles(jobTitles.map(jt =>
        jt.id === selectedJobTitle.id ? { ...jt, ...editJobTitle } : jt
      ));
      setShowEditModal(false);
      setSelectedJobTitle(null);
      setEditJobTitle({ title: '', description: '', status: 'Active' });
    }
  };

  const handleDeleteJobTitle = (jobTitle) => {
    setSelectedJobTitle(jobTitle);
    setShowDeleteModal(true);
  };

  const confirmDeleteJobTitle = () => {
    setJobTitles(jobTitles.filter(jt => jt.id !== selectedJobTitle.id));
    setShowDeleteModal(false);
    setSelectedJobTitle(null);
  };

  const handleJobTitleClick = (jobTitle) => {
    const jobTitleId = jobTitle.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    navigate(`/company-resources/departments/${departmentId}/positions/${subDepartmentId}/job-titles/${positionId}/employees/${jobTitleId}`);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-10 border-b bg-white shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Back to Positions"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <BriefcaseIcon className="h-6 w-6 sm:h-7 sm:w-7 text-pink-500" />
            Job Titles
          </h1>
        </div>
        <button
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusIcon className="h-5 w-5" />
          Add Job Title
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-pink-50 to-white min-h-[60vh] px-2 sm:px-6 lg:px-10">
        <div className="w-full mt-4 sm:mt-8">
          {/* Table View */}
          <div className="overflow-x-auto rounded-2xl shadow-2xl bg-white border border-pink-100">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-pink-50">
                <tr>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobTitles.map(jobTitle => (
                  <tr 
                    key={jobTitle.id} 
                    className="hover:bg-pink-50 transition cursor-pointer group" 
                    onClick={() => handleJobTitleClick(jobTitle)}
                    title="Click to view employees"
                  >
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-semibold flex items-center gap-2">
                      <span>
                        {jobTitle.title} <span className="text-xs text-pink-500">→</span>
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">{jobTitle.description}</td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                        jobTitle.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {jobTitle.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewJobTitle(jobTitle);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="View Job Title"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditJobTitle(jobTitle);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Job Title"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJobTitle(jobTitle);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Job Title"
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

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            <div className="flex items-center gap-3 bg-gradient-to-r from-pink-500 to-pink-300 px-4 sm:px-5 py-3 sm:py-4">
              <EyeIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">View Job Title</h3>
            </div>
            <div className="p-3 sm:p-6 bg-gradient-to-br from-pink-50 to-white">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center mb-4">
                    <BriefcaseIcon className="h-8 w-8 text-pink-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedJobTitle?.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{selectedJobTitle?.description}</p>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    selectedJobTitle?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedJobTitle?.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            <div className="flex items-center gap-3 bg-gradient-to-r from-pink-500 to-pink-300 px-4 sm:px-5 py-3 sm:py-4">
              <BriefcaseIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">Add Job Title</h3>
            </div>
            <div className="p-3 sm:p-6 bg-gradient-to-br from-pink-50 to-white">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Job Title <span className="text-red-500">*</span></label>
                  <input
                    className="input focus:ring-2 focus:ring-pink-300 text-sm"
                    placeholder="Enter job title"
                    value={newJobTitle.title}
                    onChange={e => setNewJobTitle(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Description <span className="text-red-500">*</span></label>
                  <textarea
                    className="input focus:ring-2 focus:ring-pink-300 text-sm"
                    rows="3"
                    placeholder="Enter job title description"
                    value={newJobTitle.description}
                    onChange={e => setNewJobTitle(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Status</label>
                  <select
                    className="input focus:ring-2 focus:ring-pink-300 text-sm"
                    value={newJobTitle.status}
                    onChange={e => setNewJobTitle(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full sm:w-auto" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary bg-gradient-to-r from-pink-600 to-pink-400 hover:from-pink-700 hover:to-pink-500 text-white w-full sm:w-auto" onClick={handleCreateJobTitle}>Create</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 px-4 sm:px-5 py-3 sm:py-4">
              <PencilIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">Edit Job Title</h3>
            </div>
            <div className="p-3 sm:p-6 bg-gradient-to-br from-blue-50 to-white">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Job Title <span className="text-red-500">*</span></label>
                  <input
                    className="input focus:ring-2 focus:ring-blue-300 text-sm"
                    placeholder="Enter job title"
                    value={editJobTitle.title}
                    onChange={e => setEditJobTitle(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Description <span className="text-red-500">*</span></label>
                  <textarea
                    className="input focus:ring-2 focus:ring-blue-300 text-sm"
                    rows="3"
                    placeholder="Enter job title description"
                    value={editJobTitle.description}
                    onChange={e => setEditJobTitle(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Status</label>
                  <select
                    className="input focus:ring-2 focus:ring-blue-300 text-sm"
                    value={editJobTitle.status}
                    onChange={e => setEditJobTitle(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full sm:w-auto" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full sm:w-auto" onClick={handleUpdateJobTitle}>Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            <div className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 px-4 sm:px-5 py-3 sm:py-4">
              <TrashIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">Delete Job Title</h3>
            </div>
            <div className="p-3 sm:p-6 bg-gradient-to-br from-red-50 to-white">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <TrashIcon className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h4>
                  <p className="text-gray-600 text-sm">
                    You are about to delete the job title <strong>"{selectedJobTitle?.title}"</strong>.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full sm:w-auto" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white w-full sm:w-auto" onClick={confirmDeleteJobTitle}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input { @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-pink-200; }
        .btn { @apply px-4 py-2 rounded font-semibold transition bg-white border border-gray-200 hover:bg-pink-50 hover:text-pink-700 shadow-sm; }
        .btn-primary { @apply bg-pink-600 text-white hover:bg-pink-700 border-0; }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
} 