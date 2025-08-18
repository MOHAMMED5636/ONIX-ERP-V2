import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon, ChartPieIcon, DocumentTextIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';

const SubDepartmentCard = ({ 
  subDept, 
  onView, 
  onEdit, 
  onDelete, 
  onClick 
}) => {
  return (
    <div 
      className="group bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:border-green-300 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <ChartPieIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-900 transition-colors">{subDept.name}</h3>
                <p className="text-gray-500 text-sm">Sub Department</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(subDept);
                }}
                className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
                title="View Sub Department"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(subDept);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                title="Edit Sub Department"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(subDept);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                title="Delete Sub Department"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <DocumentTextIcon className="h-4 w-4 text-gray-500" />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">{subDept.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <UserIcon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Manager</p>
                  <p className="font-semibold text-gray-900 text-sm">{subDept.manager}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <UsersIcon className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Employees</p>
                  <p className="font-semibold text-gray-900 text-sm">{subDept.employees}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                subDept.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  subDept.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {subDept.status}
              </span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Click to view positions</span>
              <div className="flex items-center gap-2 text-green-600 text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                <span>View Positions</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubDepartmentCard;
