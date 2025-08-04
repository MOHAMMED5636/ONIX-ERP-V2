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
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";

const initialCompanies = [
  { 
    id: 1, 
    name: "ONIX Construction", 
    tag: "ONIX", 
    address: "Dubai, UAE", 
    contact: "John Doe",
    contactDetails: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+971-50-123-4567",
      extension: "101"
    },
    logo: null, 
    header: null, 
    footer: null,
    employees: 45,
    status: "active",
    industry: "Construction",
    founded: "2018"
  },
  { 
    id: 2, 
    name: "Tech Solutions Ltd", 
    tag: "TECH", 
    address: "Abu Dhabi, UAE", 
    contact: "Jane Smith",
    contactDetails: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+971-50-987-6543",
      extension: "102"
    },
    logo: null, 
    header: null, 
    footer: null,
    employees: 32,
    status: "active",
    industry: "Technology",
    founded: "2020"
  },
  { 
    id: 3, 
    name: "Global Engineering", 
    tag: "GLOB", 
    address: "Sharjah, UAE", 
    contact: "Mike Johnson",
    contactDetails: {
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+971-50-555-1234",
      extension: "103"
    },
    logo: null, 
    header: null, 
    footer: null,
    employees: 28,
    status: "active",
    industry: "Engineering",
    founded: "2019"
  },
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [viewCompany, setViewCompany] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "table"
  const navigate = useNavigate();

  // Load companies from localStorage on component mount
  useEffect(() => {
    const savedCompanies = JSON.parse(localStorage.getItem('companies') || '[]');
    // Merge saved companies with initial companies, avoiding duplicates
    const allCompanies = [...initialCompanies];
    savedCompanies.forEach(savedCompany => {
      if (!allCompanies.find(company => company.id === savedCompany.id)) {
        allCompanies.push(savedCompany);
      }
    });
    setCompanies(allCompanies);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      const updatedCompanies = companies.filter(company => company.id !== id);
      setCompanies(updatedCompanies);
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));
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
    return matchesSearch && matchesStatus;
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
              <p className="text-gray-600 mt-1">Manage your company information and settings</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Companies</p>
                  <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
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
                  <p className="text-2xl font-bold text-green-600">{companies.filter(c => c.status === 'active').length}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{companies.reduce((sum, c) => sum + (c.employees || 0), 0)}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{new Set(companies.map(c => c.industry)).size}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <div className="h-6 w-6 bg-orange-500 rounded-full"></div>
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
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              {/* Filter */}
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
                      <button 
                        onClick={() => handleView(company)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(company)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Company"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(company.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Company"
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
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(company)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(company)}
                            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Edit Company"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Company"
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
                  
                  {/* Company Files */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Assets</h3>
                    <div className="space-y-3">
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        {viewCompany.logo ? (
                          <div>
                            <img src={viewCompany.logo} alt="Logo" className="mx-auto h-12 w-12 object-contain" />
                            <p className="mt-1 text-sm font-medium text-gray-900">Company Logo</p>
                            <p className="text-xs text-gray-500">{formatFileSize(viewCompany.logo.size)}</p>
                          </div>
                        ) : (
                          <div>
                            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="mt-1 text-sm text-gray-500">No logo uploaded</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
                          {viewCompany.header ? (
                            <div>
                              <img src={viewCompany.header} alt="Header" className="mx-auto h-8 w-8 object-contain" />
                              <p className="mt-1 text-xs font-medium text-gray-900">Header</p>
                            </div>
                          ) : (
                            <div>
                              <div className="mx-auto h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-400">H</span>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">No header</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      {viewCompany.footer ? (
                        <div>
                              <img src={viewCompany.footer} alt="Footer" className="mx-auto h-8 w-8 object-contain" />
                              <p className="mt-1 text-xs font-medium text-gray-900">Footer</p>
                            </div>
                          ) : (
                            <div>
                              <div className="mx-auto h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-400">F</span>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">No footer</p>
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
  );
} 