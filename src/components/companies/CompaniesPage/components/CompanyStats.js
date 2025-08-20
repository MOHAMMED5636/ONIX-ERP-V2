import React from 'react';
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";

const CompanyStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Companies</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
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
            <p className="text-2xl font-bold text-green-600">{stats.activeCompanies}</p>
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
            <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
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
            <p className="text-2xl font-bold text-gray-900">{stats.uniqueIndustries}</p>
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
            <p className="text-2xl font-bold text-green-600">{stats.activeLicenses}</p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyStats;

