import React, { useState, useEffect } from 'react';
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
  ExclamationTriangleIcon,
  PencilSquareIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { usePreferences } from '../../context/PreferencesContext';
import ContractsAPI from '../../services/contractsAPI';

// Build editable form state from contract (raw/API field names for save)
const buildEditForm = (contract) => {
  if (!contract) return {};
  const clientDisplay = contract.client && typeof contract.client === 'object'
    ? (contract.client.name || contract.client.email || '')
    : (contract.clientName || (typeof contract.client === 'string' ? contract.client : '') || '');
  const companyDisplay = contract.company && typeof contract.company === 'object'
    ? (contract.company.name || contract.companyName || '')
    : (contract.companyName || (typeof contract.company === 'string' ? contract.company : '') || '');
  const rawFees = typeof contract.contractFees === 'string'
    ? (() => { try { return JSON.parse(contract.contractFees) || []; } catch { return []; } })()
    : (contract.contractFees || []);
  return {
    referenceNumber: contract.referenceNumber || '',
    status: contract.status || 'DRAFT',
    category: contract.contractCategory || contract.contractType || contract.category || '',
    contractValue: contract.contractValue != null ? Number(contract.contractValue) : (contract.totalAmount != null ? Number(contract.totalAmount) : 0),
    company: companyDisplay,
    client: clientDisplay,
    projectManagerName: contract.projectManager || '',
    startDate: contract.startDate ? (contract.startDate.includes('T') ? contract.startDate.split('T')[0] : contract.startDate) : '',
    endDate: contract.endDate ? (contract.endDate.includes('T') ? contract.endDate.split('T')[0] : contract.endDate) : '',
    region: contract.region || '',
    plotNumber: contract.plotNumber || '',
    community: contract.community || '',
    latitude: contract.latitude || '',
    longitude: contract.longitude || '',
    numberOfFloors: contract.numberOfFloors != null ? String(contract.numberOfFloors) : '',
    buildingCost: contract.buildingCost != null && contract.buildingCost !== '' ? Number(contract.buildingCost) : '',
    builtUpArea: contract.builtUpArea != null && contract.builtUpArea !== '' ? Number(contract.builtUpArea) : '',
    structuralSystem: contract.structuralSystem || '',
    buildingHeight: contract.buildingHeight != null && contract.buildingHeight !== '' ? Number(contract.buildingHeight) : '',
    buildingType: contract.buildingType || '',
    authorityApprovalStatus: contract.authorityApprovalStatus || contract.authorityApproval || '',
    developerName: contract.developerName || '',
    contractFees: Array.isArray(rawFees) ? rawFees.map(f => ({
      name: f.name,
      type: f.type || 'fixed',
      amount: f.amount != null ? Number(f.amount) : Number(f.calculatedAmount || 0),
    })) : [],
    phases: Array.isArray(contract.phases) ? [...contract.phases] : (contract.projectPhases ? (typeof contract.projectPhases === 'string' ? JSON.parse(contract.projectPhases || '[]') : contract.projectPhases) : ['Planning', 'Design', 'Construction', 'Handover']),
    description: contract.description || '',
  };
};

const ContractViewModal = ({ isOpen, onClose, contract, onSave }) => {
  const { toDisplay, currencyCode, preferences } = usePreferences();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [fullContract, setFullContract] = useState(null);
  const [loadingContract, setLoadingContract] = useState(false);

  // Fetch full contract details from backend when modal opens
  useEffect(() => {
    if (isOpen && contract?.id) {
      setLoadingContract(true);
      ContractsAPI.getContract(contract.id)
        .then(response => {
          if (response?.success && response?.data) {
            setFullContract(response.data);
            setEditForm(buildEditForm(response.data));
          } else {
            // Fallback to prop contract if API fails
            setFullContract(contract);
            setEditForm(buildEditForm(contract));
          }
        })
        .catch(error => {
          console.error('Error fetching contract details:', error);
          // Fallback to prop contract on error
          setFullContract(contract);
          setEditForm(buildEditForm(contract));
        })
        .finally(() => {
          setLoadingContract(false);
        });
    } else if (isOpen && contract) {
      // If no ID, use prop contract directly
      setFullContract(contract);
      setEditForm(buildEditForm(contract));
    }
  }, [isOpen, contract?.id]);

  useEffect(() => {
    if (isOpen && fullContract) {
      setIsEditMode(false);
    }
  }, [isOpen, fullContract]);

  // Use fullContract if available, otherwise fallback to prop contract
  const contractToUse = fullContract || contract;

  if (!isOpen || !contractToUse) return null;

  // Use contract values when present (from API, stored in base units); fallback to mock
  const rawBuildingCost = contractToUse.buildingCost != null && contractToUse.buildingCost !== '' ? Number(contractToUse.buildingCost) : 4500000;
  const rawBuiltUpArea = contractToUse.builtUpArea != null && contractToUse.builtUpArea !== '' ? Number(contractToUse.builtUpArea) : 25000;
  const rawBuildingHeight = contractToUse.buildingHeight != null && contractToUse.buildingHeight !== '' ? Number(contractToUse.buildingHeight) : 45;

  // Convert base → display using Admin preferences (real-time)
  const displayBuildingCost = toDisplay(rawBuildingCost, 'currency');
  const displayBuiltUpArea = toDisplay(rawBuiltUpArea, 'area');
  const displayBuildingHeight = toDisplay(rawBuildingHeight, 'height');

  const areaLabel = (preferences?.areaUnit || 'sqm') === 'sqft' ? 'sq ft' : 'sqm';
  const heightLabel = (preferences?.heightUnit || 'meter') === 'feet' ? 'ft' : 'm';

  // Normalize client to string (API returns client as object { id, name, email, phone })
  const clientDisplay = contractToUse.client && typeof contractToUse.client === 'object'
    ? (contractToUse.client.name || contractToUse.client.email || '—')
    : (contractToUse.clientName || (typeof contractToUse.client === 'string' ? contractToUse.client : null) || 'XYZ Development');

  // Normalize company to string (in case API returns company as object)
  const companyDisplay = contractToUse.company && typeof contractToUse.company === 'object'
    ? (contractToUse.company.name || contractToUse.companyName || '—')
    : (contractToUse.companyName || (typeof contractToUse.company === 'string' ? contractToUse.company : null) || 'ABC Construction Ltd.');

  // Contract details from fetched full contract (ensures correct referenceNumber from backend)
  const contractDetails = {
    ...contractToUse,
    ref: contractToUse.referenceNumber || contractToUse.ref || null,
    value: (contractToUse.contractValue != null && contractToUse.contractValue !== '') ? toDisplay(Number(contractToUse.contractValue), 'currency') : contractToUse.value,
    start: contractToUse.startDate ? new Date(contractToUse.startDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : contractToUse.start,
    end: contractToUse.endDate ? new Date(contractToUse.endDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : contractToUse.end,
    category: contractToUse.contractCategory || contractToUse.contractType || contractToUse.category,
    // General Information
    company: companyDisplay,
    client: clientDisplay,
    manager: contractToUse.projectManager || '—',
    description: contractToUse.description || 'Complete construction project for residential/commercial development',
    
    // Location Details
    latitude: contractToUse.latitude || '25.2048',
    longitude: contractToUse.longitude || '55.2708',
    region: contractToUse.region || 'Dubai',
    plotNumber: contractToUse.plotNumber || 'PL-2024-001',
    community: contractToUse.community || 'Downtown Dubai',
    numberOfFloors: contractToUse.numberOfFloors || '15',
    
    // Building Details (display values from Admin preferences)
    buildingCost: displayBuildingCost,
    builtUpArea: displayBuiltUpArea,
    structuralSystem: contractToUse.structuralSystem || 'Reinforced Concrete',
    buildingHeight: displayBuildingHeight,
    buildingType: contractToUse.buildingType || 'Mixed-Use',
    
    // Authority & Community
    authorityApproval: contractToUse.authorityApprovalStatus || 'Approved',
    developerName: contractToUse.developerName || 'Emaar Properties',
    
    // Financial Details (convert amounts base → display when from API)
    fees: (() => {
      const raw = typeof contractToUse.contractFees === 'string' ? (() => { try { return JSON.parse(contractToUse.contractFees) || []; } catch { return []; } })() : (contractToUse.contractFees || []);
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map(f => ({
          name: f.name,
          type: f.type || 'fixed',
          amount: toDisplay(Number(f.amount || f.calculatedAmount || 0), 'currency'),
        }));
      }
      return [
        { name: 'Design Fee', amount: toDisplay(150000, 'currency'), type: 'fixed' },
        { name: 'Construction Fee', amount: toDisplay(3500000, 'currency'), type: 'percentage' },
        { name: 'Supervision Fee', amount: toDisplay(250000, 'currency'), type: 'monthly' },
      ];
    })(),
    
    // Project Details
    projectTypes: ['exterior', 'interior'],
    phases: ['Planning', 'Design', 'Construction', 'Handover'],
    
    // Attachments: only from contract data (no demo/placeholder files)
    attachments: (() => {
      const list = [];
      // Primary contract document
      if (contractToUse.contractDocument) {
        const path = typeof contractToUse.contractDocument === 'string' ? contractToUse.contractDocument : (contractToUse.contractDocument.filePath || contractToUse.contractDocument.fileUrl || '');
        const name = path.split('/').pop() || 'Contract document';
        const ext = (name.split('.').pop() || '').toLowerCase();
        list.push({ name, type: ext || 'file', size: '—', filePath: path });
      }
      // Additional attachments (JSON array)
      let raw = contractToUse.attachments;
      if (typeof raw === 'string') {
        try { raw = JSON.parse(raw); } catch { raw = []; }
      }
      if (Array.isArray(raw) && raw.length > 0) {
        raw.forEach(att => {
          const name = att.fileName || att.name || (att.filePath || att.fileUrl || '').split('/').pop() || 'Attachment';
          const ext = (name.split('.').pop() || '').toLowerCase();
          const size = att.size ? (typeof att.size === 'number' ? `${(att.size / 1024 / 1024).toFixed(1)} MB` : att.size) : '—';
          list.push({ name, type: ext || 'file', size, filePath: att.filePath || att.fileUrl });
        });
      }
      return list;
    })(),
  };

  const formatCurrency = (amount) => {
    const code = currencyCode || 'AED';
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount ?? 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSave = async () => {
    if (!onSave || !contractToUse?.id) return;
    setSaving(true);
    try {
      // Include referenceNumber in the update payload (now editable)
      await onSave(contractToUse.id, editForm);
      setIsEditMode(false);
      // Refresh full contract after save
      if (contractToUse.id) {
        const response = await ContractsAPI.getContract(contractToUse.id);
        if (response?.success && response?.data) {
          setFullContract(response.data);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm(buildEditForm(contractToUse));
    setIsEditMode(false);
  };

  const getFileTypeColor = (type) => {
    if (!type) return 'bg-gray-100 text-gray-800';
    const t = String(type).toLowerCase();
    switch (t) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'dwg': return 'bg-blue-100 text-blue-800';
      case 'zip': return 'bg-gray-100 text-gray-800';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp': return 'bg-green-100 text-green-800';
      case 'doc':
      case 'docx': return 'bg-indigo-100 text-indigo-800';
      case 'xls':
      case 'xlsx': return 'bg-emerald-100 text-emerald-800';
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
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      'Saving…'
                    ) : (
                      <>
                        <CheckIcon className="h-5 w-5" />
                        Save
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium transition-all"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
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
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Contract Reference:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editForm.referenceNumber || ''}
                        onChange={(e) => setEditForm(f => ({ ...f, referenceNumber: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-bold text-base bg-blue-50 flex-1 max-w-[250px]"
                        placeholder="Enter reference number"
                      />
                    ) : (
                      <span className="text-gray-900 font-bold text-base bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                        {contractDetails.ref || contractToUse.referenceNumber || '—'}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Status:</span>
                    {isEditMode ? (
                      <select
                        value={editForm.status || ''}
                        onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(contractDetails.status)}`}>
                        {contractDetails.status}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Category:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editForm.category || ''}
                        onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold flex-1 max-w-[200px]"
                      />
                    ) : (
                      <span className="text-gray-900 font-semibold">{contractDetails.category}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Total Value:</span>
                    {isEditMode ? (
                      <input
                        type="number"
                        value={editForm.contractValue ?? ''}
                        onChange={(e) => setEditForm(f => ({ ...f, contractValue: e.target.value === '' ? '' : Number(e.target.value) }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-bold w-32"
                      />
                    ) : (
                      <span className="text-gray-900 font-bold text-lg">{formatCurrency(contractDetails.value)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Company:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editForm.company || ''}
                        onChange={(e) => setEditForm(f => ({ ...f, company: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold flex-1 max-w-[200px]"
                      />
                    ) : (
                      <span className="text-gray-900 font-semibold">{contractDetails.company}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Client:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editForm.client || ''}
                        onChange={(e) => setEditForm(f => ({ ...f, client: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold flex-1 max-w-[200px]"
                      />
                    ) : (
                      <span className="text-gray-900 font-semibold">{contractDetails.client}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Manager:</span>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editForm.projectManagerName || ''}
                        onChange={(e) => setEditForm(f => ({ ...f, projectManagerName: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold flex-1 max-w-[200px]"
                        placeholder="Project manager name"
                      />
                    ) : (
                      <span className="text-gray-900 font-semibold">{contractDetails.manager}</span>
                    )}
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
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Start Date:</span>
                    {isEditMode ? (
                      <input
                        type="date"
                        value={editForm.startDate || ''}
                        onChange={(e) => setEditForm(f => ({ ...f, startDate: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold"
                      />
                    ) : (
                      <span className="text-gray-900 font-semibold">{contractDetails.start}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">End Date:</span>
                    {isEditMode ? (
                      <input
                        type="date"
                        value={editForm.endDate || ''}
                        onChange={(e) => setEditForm(f => ({ ...f, endDate: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold"
                      />
                    ) : (
                      <span className="text-gray-900 font-semibold">{contractDetails.end}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Duration:</span>
                    <span className="text-gray-900 font-semibold">
                      {(() => {
                        const start = isEditMode ? editForm.startDate : contractDetails.start;
                        const end = isEditMode ? editForm.endDate : contractDetails.end;
                        if (!start || !end) return 'N/A';
                        const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
                        return isNaN(days) ? 'N/A' : days + ' days';
                      })()}
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
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Region:</span>
                    {isEditMode ? (
                      <input type="text" value={editForm.region || ''} onChange={(e) => setEditForm(f => ({ ...f, region: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold flex-1 max-w-[200px]" />
                    ) : <span className="text-gray-900 font-semibold">{contractDetails.region}</span>}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Plot Number:</span>
                    {isEditMode ? (
                      <input type="text" value={editForm.plotNumber || ''} onChange={(e) => setEditForm(f => ({ ...f, plotNumber: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold flex-1 max-w-[200px]" />
                    ) : <span className="text-gray-900 font-semibold">{contractDetails.plotNumber}</span>}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Community:</span>
                    {isEditMode ? (
                      <input type="text" value={editForm.community || ''} onChange={(e) => setEditForm(f => ({ ...f, community: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold flex-1 max-w-[200px]" />
                    ) : <span className="text-gray-900 font-semibold">{contractDetails.community}</span>}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Coordinates:</span>
                    {isEditMode ? (
                      <div className="flex items-center gap-2">
                        <input type="text" placeholder="Lat" value={editForm.latitude || ''} onChange={(e) => setEditForm(f => ({ ...f, latitude: e.target.value }))}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 w-24" />
                        <input type="text" placeholder="Lng" value={editForm.longitude || ''} onChange={(e) => setEditForm(f => ({ ...f, longitude: e.target.value }))}
                          className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 w-24" />
                      </div>
                    ) : <span className="text-gray-900 font-semibold">{contractDetails.latitude}, {contractDetails.longitude}</span>}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Number of Floors:</span>
                    {isEditMode ? (
                      <input type="text" value={editForm.numberOfFloors || ''} onChange={(e) => setEditForm(f => ({ ...f, numberOfFloors: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold w-20" />
                    ) : <span className="text-gray-900 font-semibold">{contractDetails.numberOfFloors}</span>}
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
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Building Cost:</span>
                    {isEditMode ? (
                      <input type="number" value={editForm.buildingCost ?? ''} onChange={(e) => setEditForm(f => ({ ...f, buildingCost: e.target.value === '' ? '' : Number(e.target.value) }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold w-36" />
                    ) : <span className="text-gray-900 font-semibold">{formatCurrency(contractDetails.buildingCost)}</span>}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Built Up Area:</span>
                    {isEditMode ? (
                      <input type="number" value={editForm.builtUpArea ?? ''} onChange={(e) => setEditForm(f => ({ ...f, builtUpArea: e.target.value === '' ? '' : Number(e.target.value) }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold w-36" />
                    ) : <span className="text-gray-900 font-semibold">{contractDetails.builtUpArea != null ? Number(contractDetails.builtUpArea).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'} {areaLabel}</span>}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Structural System:</span>
                    {isEditMode ? (
                      <input type="text" value={editForm.structuralSystem || ''} onChange={(e) => setEditForm(f => ({ ...f, structuralSystem: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold flex-1 max-w-[200px]" />
                    ) : <span className="text-gray-900 font-semibold">{contractDetails.structuralSystem}</span>}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Building Height:</span>
                    {isEditMode ? (
                      <input type="number" value={editForm.buildingHeight ?? ''} onChange={(e) => setEditForm(f => ({ ...f, buildingHeight: e.target.value === '' ? '' : Number(e.target.value) }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold w-28" />
                    ) : <span className="text-gray-900 font-semibold">{contractDetails.buildingHeight != null ? Number(contractDetails.buildingHeight).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—'} {heightLabel}</span>}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Building Type:</span>
                    {isEditMode ? (
                      <input type="text" value={editForm.buildingType || ''} onChange={(e) => setEditForm(f => ({ ...f, buildingType: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold flex-1 max-w-[200px]" />
                    ) : <span className="text-gray-900 font-semibold">{contractDetails.buildingType}</span>}
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
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Approval Status:</span>
                    {isEditMode ? (
                      <input type="text" value={editForm.authorityApprovalStatus || ''} onChange={(e) => setEditForm(f => ({ ...f, authorityApprovalStatus: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold flex-1 max-w-[200px]" />
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                        {contractDetails.authorityApproval}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-gray-600 font-medium">Developer:</span>
                    {isEditMode ? (
                      <input type="text" value={editForm.developerName || ''} onChange={(e) => setEditForm(f => ({ ...f, developerName: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 font-semibold flex-1 max-w-[200px]" />
                    ) : <span className="text-gray-900 font-semibold">{contractDetails.developerName}</span>}
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
                  {(isEditMode ? editForm.contractFees : contractDetails.fees).map((fee, index) => (
                    <div key={index} className="flex justify-between items-center gap-4">
                      <span className="text-gray-600 font-medium">{fee.name}:</span>
                      {isEditMode ? (
                        <div className="flex items-center gap-2">
                          <input type="number" value={fee.amount ?? ''} onChange={(e) => {
                            const next = [...editForm.contractFees];
                            next[index] = { ...next[index], amount: e.target.value === '' ? 0 : Number(e.target.value) };
                            setEditForm(f => ({ ...f, contractFees: next }));
                          }} className="border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 w-28" />
                          <span className="text-gray-500 text-sm">({fee.type})</span>
                        </div>
                      ) : (
                        <span className="text-gray-900 font-semibold">{formatCurrency(fee.amount)} ({fee.type})</span>
                      )}
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
                  {(isEditMode ? editForm.phases : contractDetails.phases).map((phase, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-pink-200">
                      {isEditMode ? (
                        <input type="text" value={typeof phase === 'string' ? phase : phase.name || ''} onChange={(e) => {
                          const next = [...editForm.phases];
                          next[index] = e.target.value;
                          setEditForm(f => ({ ...f, phases: next }));
                        }} className="border border-gray-300 rounded px-2 py-1 text-gray-800 text-sm w-full" />
                      ) : (
                        <span className="text-gray-800 font-medium text-sm">{typeof phase === 'string' ? phase : phase.name || phase}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Attachments Section - same viewable pattern as Clients (backend root for static files) */}
          <div className="mt-8 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <DocumentTextIcon className="h-6 w-6 text-gray-600" />
              <h3 className="text-xl font-bold text-gray-900">Attachments</h3>
            </div>
            {contractDetails.attachments && contractDetails.attachments.length > 0 ? (
              (() => {
                const backendRoot = (process.env.REACT_APP_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');
                return (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Document Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">File Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractDetails.attachments.map((attachment, index) => {
                      const viewUrl = attachment.filePath ? `${backendRoot}${attachment.filePath}` : null;
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getFileTypeColor(attachment.type)}`}>
                              {(attachment.type || 'file').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-sm text-gray-900">{attachment.name}</td>
                          <td className="py-2 px-4">
                            {viewUrl ? (
                              <a
                                href={viewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm font-medium"
                              >
                                View
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
                );
              })()
            ) : (
              <p className="text-sm text-gray-500">No attachments</p>
            )}
          </div>

          {/* Description */}
          <div className="mt-8 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Project Description</h3>
            {isEditMode ? (
              <textarea value={editForm.description || ''} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                rows={4} className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 w-full" />
            ) : (
              <p className="text-gray-700 leading-relaxed">{contractDetails.description}</p>
            )}
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
