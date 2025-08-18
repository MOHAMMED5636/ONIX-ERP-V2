import React, { useState } from "react";
import { ChartPieIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';

// Import modular components and utilities
import {
  demoSubDepartments,
  departmentNames,
  defaultNewSubDepartment,
  defaultEditSubDepartment
} from './SubDepartmentsPage/index';
import {
  filterSubDepartments,
  createNewSubDepartment,
  updateSubDepartment,
  deleteSubDepartment
} from './SubDepartmentsPage/index';
import {
  SubDepartmentCard,
  SubDepartmentsHeader
} from './SubDepartmentsPage/index';
import {
  CreateSubDepartmentModal,
  EditSubDepartmentModal,
  ViewSubDepartmentModal,
  DeleteConfirmationModal
} from './SubDepartmentsPage/index';

export default function SubDepartmentsPageRefactored() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  
  const [subDepartments, setSubDepartments] = useState(demoSubDepartments[departmentId] || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubDepartment, setSelectedSubDepartment] = useState(null);
  const [newSubDepartment, setNewSubDepartment] = useState(defaultNewSubDepartment);
  const [editSubDepartment, setEditSubDepartment] = useState(defaultEditSubDepartment);

  const departmentName = departmentNames[departmentId] || "Department";

  // Filter sub-departments based on search term
  const filteredSubDepartments = filterSubDepartments(subDepartments, searchTerm);

  const handleSubDepartmentClick = (subDept) => {
    // Navigate to positions page when sub-department is clicked
    navigate(`/company-resources/departments/${departmentId}/sub-departments/${subDept.name.toLowerCase().replace(/\s+/g, '-')}/positions`);
  };

  const handleCreateSubDepartment = () => {
    if (newSubDepartment.name && newSubDepartment.description && newSubDepartment.manager) {
      const newSubDept = createNewSubDepartment(newSubDepartment, subDepartments);
      setSubDepartments([...subDepartments, newSubDept]);
      setNewSubDepartment(defaultNewSubDepartment);
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
      const updatedSubDepartments = updateSubDepartment(subDepartments, selectedSubDepartment, editSubDepartment);
      setSubDepartments(updatedSubDepartments);
      setShowEditModal(false);
      setSelectedSubDepartment(null);
      setEditSubDepartment(defaultEditSubDepartment);
    }
  };

  const handleDeleteSubDepartment = (subDept) => {
    setSelectedSubDepartment(subDept);
    setShowDeleteModal(true);
  };

  const confirmDeleteSubDepartment = () => {
    const updatedSubDepartments = deleteSubDepartment(subDepartments, selectedSubDepartment);
    setSubDepartments(updatedSubDepartments);
    setShowDeleteModal(false);
    setSelectedSubDepartment(null);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Breadcrumbs />
      
      {/* Header and Search */}
      <SubDepartmentsHeader
        departmentName={departmentName}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredSubDepartments={filteredSubDepartments}
        subDepartments={subDepartments}
        onBack={() => navigate('/departments')}
        onCreateSubDepartment={() => setShowCreateModal(true)}
      />
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-green-50 to-white min-h-[60vh] px-2 sm:px-6 lg:px-10">
        <div className="w-full mt-4 sm:mt-8">
          {/* Enhanced Mobile Cards View */}
          <div className="lg:hidden space-y-6">
            {searchTerm && filteredSubDepartments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No sub-departments found</h3>
                <p className="text-gray-500 mb-4">No sub-departments match your search criteria.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredSubDepartments.map(subDept => (
                <SubDepartmentCard
                  key={subDept.id}
                  subDept={subDept}
                  onView={handleViewSubDepartment}
                  onEdit={handleEditSubDepartment}
                  onDelete={handleDeleteSubDepartment}
                  onClick={() => handleSubDepartmentClick(subDept)}
                />
              ))
            )}
          </div>
          
          {/* Enhanced Desktop Table View */}
          <div className="hidden lg:block">
            {searchTerm && filteredSubDepartments.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No sub-departments found</h3>
                  <p className="text-gray-500 mb-4">No sub-departments match your search criteria.</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            ) : (
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
                      {filteredSubDepartments.map(subDept => (
                      <tr 
                        key={subDept.id} 
                        className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 cursor-pointer group" 
                        onClick={() => handleSubDepartmentClick(subDept)}
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
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSubDepartment(subDept);
                              }}
                              className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                              title="Edit Sub Department"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSubDepartment(subDept);
                              }}
                              className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                              title="Delete Sub Department"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateSubDepartmentModal
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        newSubDepartment={newSubDepartment}
        setNewSubDepartment={setNewSubDepartment}
        departmentName={departmentName}
        handleCreateSubDepartment={handleCreateSubDepartment}
      />

      <EditSubDepartmentModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editSubDepartment={editSubDepartment}
        setEditSubDepartment={setEditSubDepartment}
        handleUpdateSubDepartment={handleUpdateSubDepartment}
      />

      <ViewSubDepartmentModal
        showViewModal={showViewModal}
        setShowViewModal={setShowViewModal}
        selectedSubDepartment={selectedSubDepartment}
      />

      <DeleteConfirmationModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        selectedSubDepartment={selectedSubDepartment}
        confirmDeleteSubDepartment={confirmDeleteSubDepartment}
      />
      
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
