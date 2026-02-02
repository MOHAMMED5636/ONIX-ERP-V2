import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon, BriefcaseIcon, DocumentTextIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline';
import { getStatusColor } from '../utils';

const PositionCard = ({ 
  position, 
  onView, 
  onEdit, 
  onDelete, 
  onClick 
}) => {
  return (
    <div 
      className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-purple-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-900 transition-colors">{position.name}</h3>
                <p className="text-gray-500 text-sm">Position</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView(position);
                }}
                className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
                title="View Position"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(position);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                title="Edit Position"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(position);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                title="Delete Position"
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
              <p className="text-gray-600 text-sm leading-relaxed flex-1">{position.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <UserIcon className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Manager</p>
                  <p className="font-semibold text-gray-900 text-sm">{position.manager}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-1.5 bg-violet-100 rounded-lg">
                  <UsersIcon className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Employees</p>
                  <p className="font-semibold text-gray-900 text-sm">{position.employees}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                position.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  position.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {position.status}
              </span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Click to view employees</span>
              <div className="flex items-center gap-2 text-purple-600 text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                <span>View Employees</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionCard;
