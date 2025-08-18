import React, { useState } from "react";
import { BriefcaseIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';

// Import modular components and utilities
import {
  demoPositions,
  subDepartmentNames,
  defaultNewPosition,
  defaultEditPosition
} from './PositionsPage/index';
import {
  filterPositions,
  createNewPosition,
  updatePosition,
  deletePosition
} from './PositionsPage/index';
import {
  PositionCard,
  PositionsHeader
} from './PositionsPage/index';
import {
  CreatePositionModal,
  EditPositionModal,
  ViewPositionModal,
  DeleteConfirmationModal
} from './PositionsPage/index';

export default function PositionsPageRefactored() {
  const { departmentId, subDepartmentId } = useParams();
  const navigate = useNavigate();
  
  const [positions, setPositions] = useState(demoPositions[subDepartmentId] || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [newPosition, setNewPosition] = useState(defaultNewPosition);
  const [editPosition, setEditPosition] = useState(defaultEditPosition);

  const subDepartmentName = subDepartmentNames[subDepartmentId] || "Sub Department";

  // Filter positions based on search term
  const filteredPositions = filterPositions(positions, searchTerm);

  const handlePositionClick = (position) => {
    // Navigate to employees page when position is clicked
    navigate('/employees');
  };

  const handleCreatePosition = () => {
    if (newPosition.name && newPosition.description && newPosition.manager) {
      const newPos = createNewPosition(newPosition, positions);
      setPositions([...positions, newPos]);
      setNewPosition(defaultNewPosition);
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
      const updatedPositions = updatePosition(positions, selectedPosition, editPosition);
      setPositions(updatedPositions);
      setShowEditModal(false);
      setSelectedPosition(null);
      setEditPosition(defaultEditPosition);
    }
  };

  const handleDeletePosition = (position) => {
    setSelectedPosition(position);
    setShowDeleteModal(true);
  };

  const confirmDeletePosition = () => {
    const updatedPositions = deletePosition(positions, selectedPosition);
    setPositions(updatedPositions);
    setShowDeleteModal(false);
    setSelectedPosition(null);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Breadcrumbs />
      
      {/* Header and Search */}
      <PositionsHeader
        subDepartmentName={subDepartmentName}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredPositions={filteredPositions}
        positions={positions}
        onBack={() => navigate(-1)}
        onCreatePosition={() => setShowCreateModal(true)}
      />
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-purple-50 to-white min-h-[60vh] px-2 sm:px-6 lg:px-10">
        <div className="w-full mt-4 sm:mt-8">
          {/* Enhanced Mobile Cards View */}
          <div className="lg:hidden space-y-6">
            {searchTerm && filteredPositions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No positions found</h3>
                <p className="text-gray-500 mb-4">No positions match your search criteria.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredPositions.map(position => (
                <PositionCard
                  key={position.id}
                  position={position}
                  onView={handleViewPosition}
                  onEdit={handleEditPosition}
                  onDelete={handleDeletePosition}
                  onClick={() => handlePositionClick(position)}
                />
              ))
            )}
          </div>
          
          {/* Enhanced Desktop Table View */}
          <div className="hidden lg:block">
            {searchTerm && filteredPositions.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No positions found</h3>
                  <p className="text-gray-500 mb-4">No positions match your search criteria.</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600">
                      <tr>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Position</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Description</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Manager</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Employees</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Salary</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Status</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {filteredPositions.map(position => (
                      <tr 
                        key={position.id} 
                        className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all duration-300 cursor-pointer group" 
                        onClick={() => handlePositionClick(position)}
                        title="Click to view employees"
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                              <BriefcaseIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-base group-hover:text-purple-900 transition-colors">{position.name}</div>
                              <div className="text-gray-500 text-sm">Position</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="max-w-md">
                            <p className="text-gray-700 text-sm leading-relaxed">{position.description}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center shadow-sm">
                              <UserIcon className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <span className="text-gray-900 text-sm font-semibold">{position.manager}</span>
                              <div className="text-gray-500 text-xs">Manager</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center shadow-sm">
                              <UsersIcon className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-violet-100 text-violet-700 shadow-sm">
                                {position.employees} employees
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-indigo-600 font-bold text-sm">$</span>
                            </div>
                            <div>
                              <span className="text-gray-900 text-sm font-semibold">{position.salary}</span>
                              <div className="text-gray-500 text-xs">Salary</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            position.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              position.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            {position.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPosition(position);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
                              title="View Position"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPosition(position);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                              title="Edit Position"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePosition(position);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                              title="Delete Position"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <CreatePositionModal
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        newPosition={newPosition}
        setNewPosition={setNewPosition}
        subDepartmentName={subDepartmentName}
        handleCreatePosition={handleCreatePosition}
      />

      <EditPositionModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editPosition={editPosition}
        setEditPosition={setEditPosition}
        handleUpdatePosition={handleUpdatePosition}
      />

      <ViewPositionModal
        showViewModal={showViewModal}
        setShowViewModal={setShowViewModal}
        selectedPosition={selectedPosition}
      />

      <DeleteConfirmationModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        selectedPosition={selectedPosition}
        confirmDeletePosition={confirmDeletePosition}
      />
      
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
