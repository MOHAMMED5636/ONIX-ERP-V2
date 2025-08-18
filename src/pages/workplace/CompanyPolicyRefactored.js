import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';

// Import modular components and utilities
import {
  PolicyCard,
  PolicyFilters,
  CreatePolicyModal,
  DeleteConfirmationModal,
  ViewPolicyModal,
  CreateDepartmentModal,
  initialPolicies,
  initialDepartments,
  defaultNewPolicy,
  defaultNewDepartment,
  filterPolicies,
  getPolicyStats,
  validateNewPolicy,
  validateNewDepartment,
  createNewPolicy,
  acknowledgePolicy,
  deletePolicy,
  canDeleteDepartment,
  handleDownload
} from './CompanyPolicy/index';

const CompanyPolicyRefactored = () => {
  // State management
  const [policies, setPolicies] = useState(initialPolicies);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateDepartmentModal, setShowCreateDepartmentModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policyToView, setPolicyToView] = useState(null);
  const [departments, setDepartments] = useState(initialDepartments);
  const [newDepartment, setNewDepartment] = useState(defaultNewDepartment);
  const [newPolicy, setNewPolicy] = useState(defaultNewPolicy);

  // Filter policies based on search and filters
  const filteredPolicies = filterPolicies(policies, searchTerm, filterStatus, filterDepartment);
  
  // Get policy statistics
  const stats = getPolicyStats(policies);

  // Event handlers
  const handleAcknowledge = (policyId) => {
    setPolicies(prev => acknowledgePolicy(prev, policyId));
  };

  const handleView = (policy) => {
    setPolicyToView(policy);
    setShowViewModal(true);
  };

  const handleDownloadPolicy = (policy) => {
    handleDownload(policy);
  };

  const handleCreatePolicy = () => {
    const errors = validateNewPolicy(newPolicy);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const newPolicyObj = createNewPolicy(newPolicy);
    setPolicies(prev => [newPolicyObj, ...prev]);
    setNewPolicy(defaultNewPolicy);
    setShowCreateModal(false);
  };

  const handleDeletePolicy = () => {
    if (selectedPolicy) {
      setPolicies(prev => deletePolicy(prev, selectedPolicy.id));
      setShowDeleteModal(false);
      setSelectedPolicy(null);
    }
  };

  const handleCreateDepartment = () => {
    const errors = validateNewDepartment(newDepartment, departments);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setDepartments(prev => [...prev, newDepartment.name]);
    setNewDepartment(defaultNewDepartment);
    setShowCreateDepartmentModal(false);
  };

  const handleDeleteDepartment = (departmentName) => {
    const { canDelete, reason } = canDeleteDepartment(departmentName, policies);
    if (!canDelete) {
      alert(reason);
      return;
    }

    setDepartments(prev => prev.filter(dept => dept !== departmentName));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Policies</h1>
              <p className="text-gray-600">Manage and track company policies and employee acknowledgments</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Policies</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Acknowledged</p>
                <p className="text-2xl font-bold text-green-600">{stats.acknowledged}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Policies</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-xs text-gray-500">{stats.pendingPercentage}% of total</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <DocumentTextIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                <p className="text-2xl font-bold text-green-600">{stats.acknowledged}</p>
                <p className="text-xs text-gray-500">{stats.acknowledgedPercentage}% of total</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                <p className="text-xs text-gray-500">Active departments</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <PolicyFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterDepartment={filterDepartment}
          setFilterDepartment={setFilterDepartment}
          departments={departments}
          onCreatePolicy={() => setShowCreateModal(true)}
          onCreateDepartment={() => setShowCreateDepartmentModal(true)}
        />

        {/* Policies Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onView={handleView}
              onDownload={handleDownloadPolicy}
              onDelete={(policy) => {
                setSelectedPolicy(policy);
                setShowDeleteModal(true);
              }}
              onAcknowledge={handleAcknowledge}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredPolicies.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <DocumentTextIcon className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all" || filterDepartment !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first company policy."
              }
            </p>
            {!searchTerm && filterStatus === "all" && filterDepartment === "all" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Policy
              </button>
            )}
          </div>
        )}

        {/* Modals */}
        <CreatePolicyModal
          showCreateModal={showCreateModal}
          newPolicy={newPolicy}
          setNewPolicy={setNewPolicy}
          departments={departments}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreatePolicy}
        />

        <DeleteConfirmationModal
          showDeleteModal={showDeleteModal}
          selectedPolicy={selectedPolicy}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeletePolicy}
        />

        <ViewPolicyModal
          showViewModal={showViewModal}
          policyToView={policyToView}
          onClose={() => setShowViewModal(false)}
          onDownload={handleDownloadPolicy}
          onAcknowledge={handleAcknowledge}
        />

        <CreateDepartmentModal
          showCreateDepartmentModal={showCreateDepartmentModal}
          newDepartment={newDepartment}
          setNewDepartment={setNewDepartment}
          departments={departments}
          onClose={() => setShowCreateDepartmentModal(false)}
          onSave={handleCreateDepartment}
          onDeleteDepartment={handleDeleteDepartment}
        />
      </div>
    </div>
  );
};

export default CompanyPolicyRefactored;
