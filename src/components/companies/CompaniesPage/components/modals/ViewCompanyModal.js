import React from 'react';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  EnvelopeIcon, 
  PhoneIcon 
} from "@heroicons/react/24/outline";
import { 
  getLicenseStatusColor, 
  getLicenseStatusText, 
  formatFileSize 
} from '../../utils';

const ViewCompanyModal = ({ 
  isOpen, 
  onClose, 
  company, 
  onEdit 
}) => {
  if (!isOpen || !company) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{company.tag}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
              <p className="text-sm text-gray-600">{company.industry} • {company.status}</p>
            </div>
          </div>
          <button
            onClick={onClose}
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
                      <p className="text-sm text-gray-600">{company.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPinIcon className="h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">{company.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-5 w-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{company.tag}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Company Tag</p>
                      <p className="text-sm text-gray-600">{company.tag}</p>
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
                      <span className="text-white text-sm font-bold">{company.contactDetails?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{company.contactDetails?.name}</p>
                      <p className="text-sm text-gray-600">Primary Contact</p>
                    </div>
                  </div>
                  
                  {company.contactDetails && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <EnvelopeIcon className="h-4 w-4" />
                        <span>{company.contactDetails.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4" />
                        <span>{company.contactDetails.phone}</span>
                        {company.contactDetails.extension && (
                          <span className="text-xs text-gray-500">(Ext: {company.contactDetails.extension})</span>
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
                    <p className="text-2xl font-bold text-indigo-600">{company.employees || 0}</p>
                    <p className="text-sm text-gray-600">Employees</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{company.founded}</p>
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
                        {getLicenseStatusText(company.licenseStatus)}
                      </p>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getLicenseStatusColor(company.licenseStatus)}`}>
                      {getLicenseStatusText(company.licenseStatus)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Expiry Date:</strong> {company.licenseExpiry ? new Date(company.licenseExpiry).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Company Files */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Assets</h3>
                <div className="space-y-3">
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    {company.logo ? (
                      <div>
                        <img src={company.logo} alt="Logo" className="mx-auto h-12 w-12 object-contain" />
                        <p className="mt-1 text-sm font-medium text-gray-900">Company Logo</p>
                        <p className="text-xs text-gray-500">{formatFileSize(company.logo.size)}</p>
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
                      {company.header ? (
                        <div>
                          <img src={company.header} alt="Header" className="mx-auto h-8 w-8 object-contain" />
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
                      {company.footer ? (
                        <div>
                          <img src={company.footer} alt="Footer" className="mx-auto h-8 w-8 object-contain" />
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
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(company);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors"
            >
              Edit Company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCompanyModal;
