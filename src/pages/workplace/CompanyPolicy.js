import React, { useState, useEffect } from "react";
import { 
  DocumentTextIcon, 
  EyeIcon, 
  ArrowDownTrayIcon, 
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function CompanyPolicy() {
  const [policies, setPolicies] = useState([
    {
      id: 1,
      title: "Employee Handbook 2024",
      description: "Comprehensive guide covering company policies, procedures, and employee rights",
      fileType: "PDF",
      fileSize: "2.5 MB",
      lastUpdated: "2024-01-15",
      status: "acknowledged",
      acknowledgedAt: "2024-01-20"
    },
    {
      id: 2,
      title: "Data Protection Policy",
      description: "Guidelines for handling sensitive company and customer data",
      fileType: "PDF",
      fileSize: "1.8 MB",
      lastUpdated: "2024-02-01",
      status: "pending"
    },
    {
      id: 3,
      title: "Remote Work Guidelines",
      description: "Policies and procedures for remote work arrangements",
      fileType: "DOCX",
      fileSize: "950 KB",
      lastUpdated: "2024-01-30",
      status: "acknowledged",
      acknowledgedAt: "2024-02-05"
    },
    {
      id: 4,
      title: "Health and Safety Protocol",
      description: "Workplace safety guidelines and emergency procedures",
      fileType: "PDF",
      fileSize: "3.2 MB",
      lastUpdated: "2024-02-10",
      status: "pending"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    description: '',
    file: null
  });

  const handleAcknowledge = (policyId) => {
    setPolicies(prev => prev.map(policy => 
      policy.id === policyId 
        ? { ...policy, status: 'acknowledged', acknowledgedAt: new Date().toISOString().split('T')[0] }
        : policy
    ));
  };

  const handleView = (policy) => {
    // Mock view functionality
    alert(`Viewing: ${policy.title}`);
  };

  const handleDownload = (policy) => {
    // Mock download functionality
    alert(`Downloading: ${policy.title}`);
  };

  const handleCreatePolicy = () => {
    if (!newPolicy.title.trim() || !newPolicy.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    const newPolicyObj = {
      id: Date.now(),
      title: newPolicy.title,
      description: newPolicy.description,
      fileType: newPolicy.file ? newPolicy.file.name.split('.').pop().toUpperCase() : 'PDF',
      fileSize: newPolicy.file ? `${(newPolicy.file.size / 1024 / 1024).toFixed(1)} MB` : '1.0 MB',
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setPolicies(prev => [newPolicyObj, ...prev]);
    setNewPolicy({ title: '', description: '', file: null });
    setShowCreateModal(false);
  };

  const handleDeletePolicy = () => {
    if (selectedPolicy) {
      setPolicies(prev => prev.filter(policy => policy.id !== selectedPolicy.id));
      setShowDeleteModal(false);
      setSelectedPolicy(null);
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || policy.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'acknowledged': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'PDF': return 'bg-red-100 text-red-800';
      case 'DOCX': return 'bg-blue-100 text-blue-800';
      case 'XLSX': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const acknowledgedCount = policies.filter(p => p.status === 'acknowledged').length;
  const pendingCount = policies.filter(p => p.status === 'pending').length;
  const totalPolicies = policies.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <DocumentTextIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Company Policies
              </h1>
              <p className="text-gray-600 mt-1">Manage and acknowledge company policies and procedures</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Policies</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPolicies}</p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                  <p className="text-2xl font-bold text-green-600">{acknowledgedCount}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalPolicies > 0 ? Math.round((acknowledgedCount / totalPolicies) * 100) : 0}%
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <div className="h-6 w-6 bg-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              {/* Status Filter */}
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Create Policy Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create New Policy
              </button>
            </div>
          </div>
        </div>

        {/* Policies Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {policy.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFileTypeColor(policy.fileType)}`}>
                        {policy.fileType}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.status)}`}>
                        {policy.status === 'acknowledged' ? 'Acknowledged' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{policy.description}</p>
                  </div>
                </div>
                
                {/* Policy Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-bold text-gray-900">{policy.fileSize}</p>
                    <p className="text-xs text-gray-600">File Size</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-bold text-gray-900">{policy.lastUpdated}</p>
                    <p className="text-xs text-gray-600">Last Updated</p>
                  </div>
                </div>
                
                {/* Acknowledgment Status */}
                {policy.status === 'acknowledged' && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Acknowledged On</p>
                        <p className="text-sm font-semibold text-gray-900">{policy.acknowledgedAt}</p>
                      </div>
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Card Body */}
              <div className="p-6">
                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleView(policy)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Policy"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDownload(policy)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download Policy"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Policy"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {policy.status === 'pending' && (
                      <button 
                        onClick={() => handleAcknowledge(policy.id)}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    {policy.status === 'acknowledged' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircleIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Acknowledged</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first company policy."
              }
            </p>
            {!searchTerm && filterStatus === "all" && (
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
      </div>

      {/* Create Policy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Policy</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Policy Title *
                </label>
                <input
                  type="text"
                  value={newPolicy.title}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter policy title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Enter policy description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Policy File
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, file: e.target.files[0] }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  accept=".pdf,.doc,.docx"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePolicy}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Delete Policy</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedPolicy.title}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePolicy}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 