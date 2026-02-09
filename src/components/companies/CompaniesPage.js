import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  PlusIcon, 
  BuildingOfficeIcon, 
  MapPinIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { getCompanies, deleteCompany as deleteCompanyAPI, getCompanyStats } from "../../services/companiesAPI";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // If it's a relative path, construct full URL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    // Remove leading slash if present to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalEmployees: 0,
    industries: 0,
    activeLicenses: 0
  });
  const [viewCompany, setViewCompany] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLicenseStatus, setFilterLicenseStatus] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "table"
  const navigate = useNavigate();

  // Load companies from backend API
  useEffect(() => {
    loadCompanies();
    loadStats();
  }, [filterStatus, filterLicenseStatus, searchTerm]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        licenseStatus: filterLicenseStatus !== 'all' ? filterLicenseStatus : undefined,
        search: searchTerm || undefined,
      };
      
      const response = await getCompanies(filters);
      
      if (response.success && response.data) {
        // Map backend data to frontend format
        const mappedCompanies = response.data.map(company => ({
          id: company.id,
          name: company.name,
          tag: company.tag || '',
          address: company.address || '',
          contact: company.contactName || '',
          contactDetails: {
            name: company.contactName || '',
            email: company.contactEmail || '',
            phone: company.contactPhone || '',
            extension: company.contactExtension || ''
          },
          logo: company.logo,
          header: company.header,
          footer: company.footer,
          employees: company.employees || 0,
          status: company.status?.toLowerCase() || 'active',
          industry: company.industry || '',
          founded: company.founded || '',
          licenseExpiry: company.licenseExpiry || '',
          licenseStatus: company.licenseStatus?.toLowerCase() || 'active'
        }));
        
        setCompanies(mappedCompanies);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error('Error loading companies:', err);
      setError(err.message || 'Failed to load companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getCompanyStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleDelete = async (id) => {
    const company = companies.find(c => c.id === id);
    const companyName = company?.name || 'this company';
    
    const confirmMessage = `⚠️ WARNING: Deleting "${companyName}" will permanently delete:\n\n` +
      `• The company\n` +
      `• All employees associated with this company\n` +
      `• All departments belonging to this company\n\n` +
      `This action cannot be undone!\n\n` +
      `Are you sure you want to proceed?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const response = await deleteCompanyAPI(id);
        // Reload companies after deletion
        await loadCompanies();
        await loadStats();
        
        // Show success message with employee deletion count
        if (response?.deletedEmployees !== undefined) {
          alert(`Company "${companyName}" deleted successfully.\n${response.deletedEmployees} employee(s) were also deleted.`);
        } else {
          alert(`Company "${companyName}" deleted successfully.`);
        }
      } catch (err) {
        console.error('Error deleting company:', err);
        alert('Failed to delete company: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleView = (company) => {
    setViewCompany(company);
    setShowViewModal(true);
  };

  const handleEdit = (company) => {
    navigate(`/companies/create`, { state: { company } });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || company.status === filterStatus;
    const matchesLicenseStatus = filterLicenseStatus === "all" || company.licenseStatus === filterLicenseStatus;
    return matchesSearch && matchesStatus && matchesLicenseStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIndustryColor = (industry) => {
    const colors = {
      'Construction': 'bg-blue-100 text-blue-800',
      'Technology': 'bg-purple-100 text-purple-800',
      'Engineering': 'bg-orange-100 text-orange-800',
      'Healthcare': 'bg-pink-100 text-pink-800',
      'Finance': 'bg-green-100 text-green-800'
    };
    return colors[industry] || 'bg-gray-100 text-gray-800';
  };

  const getLicenseStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLicenseStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'expired': return 'Expired';
      case 'expiring_soon': return 'Expiring Soon';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Companies
              </h1>
              <p className="text-gray-600 mt-1">Manage your company information and settings with license tracking</p>
            </div>
          </div>
          
          
          {/* Stats Cards */}
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Error: {error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Companies</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies || companies.length}</p>
                  </div>
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeCompanies || companies.filter(c => c.status === 'active').length}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <div className="h-6 w-6 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalEmployees || companies.reduce((sum, c) => sum + (c.employees || 0), 0)}</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <div className="h-6 w-6 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Industries</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.industries || new Set(companies.map(c => c.industry)).size}</p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <div className="h-6 w-6 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Licenses</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeLicenses || companies.filter(c => c.licenseStatus === 'active').length}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Enhanced Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              {/* License Status Filter */}
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filterLicenseStatus}
                  onChange={(e) => setFilterLicenseStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                >
                  <option value="all">All License Status</option>
                  <option value="active">License Active</option>
                  <option value="expired">License Expired</option>
                  <option value="expiring_soon">Expiring Soon</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "cards" 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "table" 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Table
                </button>
              </div>
              
              {/* Add Company Button */}
          <Link
            to="/companies/create"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
                <PlusIcon className="h-5 w-5 mr-2" />
            Add Company
          </Link>
            </div>
          </div>
        </div>

        {/* Companies Content */}
        {viewMode === "cards" ? (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
              >
                                 {/* Card Header */}
                 <div className="p-6 border-b border-gray-100">
                   <div className="flex items-start justify-between mb-4">
                     <div className="flex-1">
                       <h3 
                         className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer hover:text-indigo-600 transition-colors"
                         onClick={() => navigate('/departments', { state: { selectedCompany: company } })}
                         title="Click to view departments"
                       >
                         {company.name}
                       </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getIndustryColor(company.industry)}`}>
                          {company.industry}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(company.status)}`}>
                          {company.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{company.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {company.tag}
                      </span>
                    </div>
                  </div>
                  
                  {/* Company Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{company.employees || 0}</p>
                      <p className="text-xs text-gray-600">Employees</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{company.founded}</p>
                      <p className="text-xs text-gray-600">Founded</p>
                    </div>
                  </div>
                  
                  {/* License Status */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600">License Status</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {company.licenseExpiry ? new Date(company.licenseExpiry).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLicenseStatusColor(company.licenseStatus)}`}>
                        {getLicenseStatusText(company.licenseStatus)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <EnvelopeIcon className="h-4 w-4" />
                      <span>{company.contactDetails?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{company.contactDetails?.phone}</span>
                    </div>
                        </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {/* Open Company Button - Prominent and Clear */}
                      <button 
                        onClick={() => navigate('/departments', { state: { selectedCompany: company } })}
                        className="group relative px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2 font-medium text-sm cursor-pointer"
                        title="Open Company Dashboard"
                        aria-label="Open Company Dashboard"
                      >
                        <BuildingOfficeIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Open</span>
                        <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button 
                        onClick={() => handleView(company)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="View Details"
                        aria-label="View Company Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(company)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Company"
                        aria-label="Edit Company"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(company.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Company"
                        aria-label="Delete Company"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      License Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">{company.tag}</span>
                            </div>
                          </div>
                                                     <div className="ml-4">
                             <div 
                               className="text-sm font-medium text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
                               onClick={() => navigate('/departments', { state: { selectedCompany: company } })}
                               title="Click to view departments"
                             >
                               {company.name}
                             </div>
                             <div className="text-sm text-gray-500">{company.employees || 0} employees</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getIndustryColor(company.industry)}`}>
                          {company.industry}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {company.address}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{company.contact}</div>
                        <div className="text-sm text-gray-500">{company.contactDetails?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(company.status)}`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLicenseStatusColor(company.licenseStatus)}`}>
                            {getLicenseStatusText(company.licenseStatus)}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {company.licenseExpiry ? new Date(company.licenseExpiry).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {/* Open Company Button - Prominent and Clear */}
                          <button
                            onClick={() => navigate('/departments', { state: { selectedCompany: company } })}
                            className="group relative px-2.5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center gap-1.5 font-medium text-xs cursor-pointer"
                            title="Open Company Dashboard"
                            aria-label="Open Company Dashboard"
                          >
                            <BuildingOfficeIcon className="h-3.5 w-3.5" />
                            <span>Open</span>
                            <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleView(company)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="View Details"
                            aria-label="View Company Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(company)}
                            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                            title="Edit Company"
                            aria-label="Edit Company"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete Company"
                            aria-label="Delete Company"
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
        )}

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <BuildingOfficeIcon className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first company."
              }
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Link
                to="/companies/create"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Company
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Enhanced View Modal */}
      {showViewModal && viewCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{viewCompany.tag}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{viewCompany.name}</h2>
                  <p className="text-sm text-gray-600">{viewCompany.industry} • {viewCompany.status}</p>
                </div>
              </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Company Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <BuildingOfficeIcon className="h-5 w-5 text-indigo-500" />
                <div>
                          <p className="text-sm font-medium text-gray-900">Company Name</p>
                          <p className="text-sm text-gray-600">{viewCompany.name}</p>
                </div>
                </div>
                
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPinIcon className="h-5 w-5 text-indigo-500" />
                <div>
                          <p className="text-sm font-medium text-gray-900">Address</p>
                          <p className="text-sm text-gray-600">{viewCompany.address}</p>
                </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="h-5 w-5 bg-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{viewCompany.tag}</span>
                </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Company Tag</p>
                          <p className="text-sm text-gray-600">{viewCompany.tag}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{viewCompany.contactDetails?.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{viewCompany.contactDetails?.name}</p>
                          <p className="text-sm text-gray-600">Primary Contact</p>
                        </div>
                      </div>
                      
                      {viewCompany.contactDetails && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <EnvelopeIcon className="h-4 w-4" />
                            <span>{viewCompany.contactDetails.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <PhoneIcon className="h-4 w-4" />
                            <span>{viewCompany.contactDetails.phone}</span>
                            {viewCompany.contactDetails.extension && (
                              <span className="text-xs text-gray-500">(Ext: {viewCompany.contactDetails.extension})</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Company Stats & Files */}
                <div className="space-y-6">
                  {/* Company Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-indigo-600">{viewCompany.employees || 0}</p>
                        <p className="text-sm text-gray-600">Employees</p>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">{viewCompany.founded}</p>
                        <p className="text-sm text-gray-600">Founded</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* License Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">License Information</h3>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">License Status</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {getLicenseStatusText(viewCompany.licenseStatus)}
                          </p>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getLicenseStatusColor(viewCompany.licenseStatus)}`}>
                          {getLicenseStatusText(viewCompany.licenseStatus)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Expiry Date:</strong> {viewCompany.licenseExpiry ? new Date(viewCompany.licenseExpiry).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Company Files */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Assets</h3>
                    <div className="space-y-3">
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        {viewCompany.logo ? (
                          <div>
                            <img 
                              src={getImageUrl(viewCompany.logo)} 
                              alt="Logo" 
                              className="mx-auto max-h-24 max-w-full object-contain rounded-lg"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="hidden mx-auto h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="mt-1 text-sm font-medium text-gray-900">Company Logo</p>
                          </div>
                        ) : (
                          <div>
                            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Company Logo (not uploaded)</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
                          {viewCompany.header ? (
                            <div>
                              <img 
                                src={getImageUrl(viewCompany.header)} 
                                alt="Header" 
                                className="mx-auto max-h-16 max-w-full object-contain rounded"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <div className="hidden mx-auto h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-400">H</span>
                              </div>
                              <p className="mt-1 text-xs font-medium text-gray-900">Header</p>
                            </div>
                          ) : (
                            <div>
                              <div className="mx-auto h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-400">H</span>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">No Header</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
                          {viewCompany.footer ? (
                            <div>
                              <img 
                                src={getImageUrl(viewCompany.footer)} 
                                alt="Footer" 
                                className="mx-auto max-h-16 max-w-full object-contain rounded"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <div className="hidden mx-auto h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-400">F</span>
                              </div>
                              <p className="mt-1 text-xs font-medium text-gray-900">Footer</p>
                            </div>
                          ) : (
                            <div>
                              <div className="mx-auto h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-400">F</span>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">No Footer</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewCompany);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors"
                >
                  Edit Company
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 