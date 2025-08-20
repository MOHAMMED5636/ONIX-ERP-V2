import React from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon 
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { statusOptions, licenseStatusOptions } from '../constants';

const CompanyFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus, 
  filterLicenseStatus, 
  setFilterLicenseStatus,
  viewMode,
  setViewMode
}) => {
  return (
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
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
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
              {licenseStatusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All License Status' : 
                   status === 'active' ? 'License Active' :
                   status === 'expired' ? 'License Expired' :
                   status === 'expiring_soon' ? 'Expiring Soon' : status}
                </option>
              ))}
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
  );
};

export default CompanyFilters;

