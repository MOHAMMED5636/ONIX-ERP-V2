import React from 'react';
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UserIcon, 
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ContractViewModal = ({ isOpen, onClose, contract }) => {
  if (!isOpen || !contract) return null;

  // Mock detailed contract data (in real app, this would come from props or API)
  const contractDetails = {
    ...contract,
    // General Information
    company: 'ABC Construction Ltd.',
    client: 'XYZ Development',
    description: 'Complete construction project for residential/commercial development',
    
    // Location Details
    latitude: '25.2048',
    longitude: '55.2708',
    region: 'Dubai',
    plotNumber: 'PL-2024-001',
    community: 'Downtown Dubai',
    numberOfFloors: '15',
    
    // Building Details (newly added)
    buildingCost: '4500000',
    builtUpArea: '25000',
    structuralSystem: 'Reinforced Concrete',
    buildingHeight: '45',
    buildingType: 'Mixed-Use',
    
    // Authority & Community
    authorityApproval: 'Approved',
    developerName: 'Emaar Properties',
    
    // Financial Details
    fees: [
      { name: 'Design Fee', amount: '150000', type: 'fixed' },
      { name: 'Construction Fee', amount: '3500000', type: 'percentage' },
      { name: 'Supervision Fee', amount: '250000', type: 'monthly' }
    ],
    
    // Project Details
    projectTypes: ['exterior', 'interior'],
    phases: ['Planning', 'Design', 'Construction', 'Handover'],
    
    // Attachments
    attachments: [
      { name: 'Contract Document.pdf', type: 'pdf', size: '2.4 MB' },
      { name: 'Technical Drawings.dwg', type: 'dwg', size: '15.2 MB' },
      { name: 'Site Photos.zip', type: 'zip', size: '8.7 MB' }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'dwg': return 'bg-blue-100 text-blue-800';
      case 'zip': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative flex items-center justify-between p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                <DocumentTextIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Contract Details</h2>
                <p className="text-blue-100 text-lg font-medium">{contractDetails.ref}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-6">
              
              {/* Contract Overview */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Contract Overview</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(contractDetails.status)}`}>
                      {contractDetails.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Category:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total Value:</span>
                    <span className="text-gray-900 font-bold text-lg">{formatCurrency(contractDetails.value)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Company:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.company}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Client:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.client}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <CalendarIcon className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Timeline</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Start Date:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.start}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">End Date:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.end}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Duration:</span>
                    <span className="text-gray-900 font-semibold">
                      {Math.ceil((new Date(contractDetails.end) - new Date(contractDetails.start)) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <MapPinIcon className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Location Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Region:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.region}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Plot Number:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.plotNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Community:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.community}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Coordinates:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.latitude}, {contractDetails.longitude}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Number of Floors:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.numberOfFloors}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Building Details */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">Building Details</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Building Cost:</span>
                    <span className="text-gray-900 font-semibold">{formatCurrency(contractDetails.buildingCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Built Up Area:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.builtUpArea} sq ft</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Structural System:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.structuralSystem}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Building Height:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.buildingHeight} m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Building Type:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.buildingType}</span>
                  </div>
                </div>
              </div>

              {/* Authority & Community */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
                <div className="flex items-center gap-3 mb-4">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-teal-600" />
                  <h3 className="text-xl font-bold text-gray-900">Authority & Community</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Approval Status:</span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                      {contractDetails.authorityApproval}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Developer:</span>
                    <span className="text-gray-900 font-semibold">{contractDetails.developerName}</span>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                <div className="flex items-center gap-3 mb-4">
                  <CurrencyDollarIcon className="h-6 w-6 text-amber-600" />
                  <h3 className="text-xl font-bold text-gray-900">Financial Breakdown</h3>
                </div>
                <div className="space-y-3">
                  {contractDetails.fees.map((fee, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">{fee.name}:</span>
                      <span className="text-gray-900 font-semibold">{formatCurrency(fee.amount)} ({fee.type})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Phases */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
                <div className="flex items-center gap-3 mb-4">
                  <ChartBarIcon className="h-6 w-6 text-pink-600" />
                  <h3 className="text-xl font-bold text-gray-900">Project Phases</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {contractDetails.phases.map((phase, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-pink-200">
                      <span className="text-gray-800 font-medium text-sm">{phase}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Attachments Section */}
          <div className="mt-8 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <DocumentTextIcon className="h-6 w-6 text-gray-600" />
              <h3 className="text-xl font-bold text-gray-900">Attachments</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contractDetails.attachments.map((attachment, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${getFileTypeColor(attachment.type)}`}>
                      {attachment.type.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                      <p className="text-xs text-gray-500">{attachment.size}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Project Description</h3>
            <p className="text-gray-700 leading-relaxed">{contractDetails.description}</p>
          </div>

          {/* Amendment History */}
          {contractDetails.amendmentHistory && contractDetails.amendmentHistory.length > 0 && (
            <div className="mt-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
              <div className="flex items-center gap-3 mb-6">
                <ClockIcon className="h-6 w-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-900">Amendment History</h3>
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {contractDetails.amendmentHistory.length} Amendment{contractDetails.amendmentHistory.length > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-4">
                {contractDetails.amendmentHistory.map((amendment, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{amendment.amendmentNumber}</h4>
                        <p className="text-sm text-gray-600">{amendment.type}</p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{new Date(amendment.date).toLocaleDateString()}</p>
                        {amendment.effectiveDate && (
                          <p>Effective: {new Date(amendment.effectiveDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason:</span> {amendment.reason}
                      </p>
                    </div>
                    
                    {amendment.changes && amendment.changes.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Changes Made:</p>
                        <div className="space-y-2">
                          {amendment.changes.map((change, changeIndex) => (
                            <div key={changeIndex} className="bg-gray-50 rounded p-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600">Field:</span>
                                  <p className="text-gray-900">{change.field}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">From:</span>
                                  <p className="text-gray-900">{change.originalValue || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">To:</span>
                                  <p className="text-gray-900">{change.newValue || 'N/A'}</p>
                                </div>
                              </div>
                              {change.reason && (
                                <div className="mt-2">
                                  <span className="font-medium text-gray-600 text-sm">Reason:</span>
                                  <p className="text-gray-700 text-sm">{change.reason}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {amendment.approvedBy && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Approved by:</span> {amendment.approvedBy}
                        {amendment.approvalDate && (
                          <span className="ml-2">
                            on {new Date(amendment.approvalDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ContractViewModal;
