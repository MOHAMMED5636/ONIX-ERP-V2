import React from 'react';
import { ArrowLeftIcon, UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline';
import { getPositionStats } from '../utils';

const PositionsHeader = ({ 
  subDepartmentName, 
  searchTerm, 
  setSearchTerm, 
  filteredPositions, 
  positions, 
  onBack, 
  onCreatePosition 
}) => {
  const stats = getPositionStats(filteredPositions);

  return (
    <>
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-10 border-b bg-white shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Back to Sub Departments"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <UserGroupIcon className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500" /> 
            {subDepartmentName} - Positions
          </h1>
        </div>
        <button
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto justify-center"
          onClick={onCreatePosition}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Position
        </button>
      </div>
      
      {/* Enhanced Section Header */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-3xl shadow-2xl p-8">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>
          <div className="absolute top-1/2 right-8 w-16 h-16 bg-white bg-opacity-5 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
                  <UserGroupIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-purple-100 text-lg leading-relaxed">Manage positions under {subDepartmentName}.</p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
                <div className="px-6 py-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <span className="text-white text-lg font-semibold">{filteredPositions.length} Positions</span>
                </div>
                <div className="px-6 py-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <span className="text-white text-lg font-semibold">
                    {searchTerm ? 'Filtered' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-white text-2xl font-bold">{stats.total}</div>
                <div className="text-purple-100 text-sm">
                  {searchTerm ? 'Filtered Positions' : 'Total Positions'}
                </div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-white text-2xl font-bold">{stats.totalEmployees}</div>
                <div className="text-purple-100 text-sm">Total Employees</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-white text-2xl font-bold">{stats.active}</div>
                <div className="text-purple-100 text-sm">
                  {searchTerm ? 'Filtered Active' : 'Active Positions'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mb-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search positions by name, description, manager, requirements, status, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                {filteredPositions.length} of {positions.length} positions
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )}
            </div>
          </div>
          {searchTerm && (
            <div className="mt-3 text-sm text-purple-600">
              Searching for: <span className="font-semibold">"{searchTerm}"</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PositionsHeader;
