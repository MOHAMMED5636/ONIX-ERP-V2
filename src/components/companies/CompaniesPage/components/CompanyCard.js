import React from 'react';
import { 
  MapPinIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { 
  getIndustryColor, 
  getStatusColor, 
  getLicenseStatusColor, 
  getLicenseStatusText 
} from '../utils';

const CompanyCard = ({ 
  company, 
  selectedCompany, 
  onView, 
  onEdit, 
  onDelete, 
  onSelectCompany 
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
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
            <button 
              onClick={() => onView(company)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onEdit(company)}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit Company"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onDelete(company.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Company"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onSelectCompany(company.name)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedCompany === company.name
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700"
              }`}
              title={selectedCompany === company.name ? "Selected for Employee Creation" : "Select for Employee Creation"}
            >
              {selectedCompany === company.name ? (
                <div className="flex items-center gap-1">
                  <CheckIcon className="h-4 w-4" />
                  <span>Selected</span>
                </div>
              ) : (
                "Select"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;

