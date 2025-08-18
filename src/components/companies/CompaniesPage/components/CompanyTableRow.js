import React from 'react';
import { 
  MapPinIcon, 
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

const CompanyTableRow = ({ 
  company, 
  selectedCompany, 
  onView, 
  onEdit, 
  onDelete, 
  onSelectCompany 
}) => {
  const navigate = useNavigate();

  return (
    <tr className="hover:bg-gray-50 transition-colors">
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
          <button
            onClick={() => onView(company)}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(company)}
            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Edit Company"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(company.id)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Company"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onSelectCompany(company.name)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              selectedCompany === company.name
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700"
            }`}
            title={selectedCompany === company.name ? "Selected for Employee Creation" : "Select for Employee Creation"}
          >
            {selectedCompany === company.name ? (
              <div className="flex items-center gap-1">
                <CheckIcon className="h-3 w-3" />
                <span>Selected</span>
              </div>
            ) : (
              "Select"
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CompanyTableRow;
