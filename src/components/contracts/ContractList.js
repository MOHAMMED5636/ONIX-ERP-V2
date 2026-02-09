import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  HomeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import ContractViewModal from './ContractViewModal';
import AmendmentForm from './AmendmentForm';
import ContractsAPI from '../../services/contractsAPI';
import { usePreferences } from '../../context/PreferencesContext';

const demoContracts = [
  { 
    id: 1,
    ref: "C-CO-25279", 
    start: "7/1/2023", 
    end: "7/1/2025", 
    category: "Residential Villa", 
    status: "Active", 
    value: 2500000,
    contractValue: "2,500,000 AED",
    startDate: "7/1/2023",
    endDate: "7/1/2025",
    paymentTerms: "Monthly payments",
    scopeOfWork: "Complete villa construction",
    deliverables: "3-bedroom villa with garden",
    termsAndConditions: "Standard construction terms",
    penaltyClauses: "AED 500/day for delays",
    warrantyPeriod: "2 years",
    buildingCost: "2,200,000 AED",
    builtUpArea: "250 sq ft",
    structuralSystem: "Reinforced Concrete",
    buildingHeight: "15 meters",
    buildingType: "Residential",
    region: "Dubai Marina",
    plotNumber: "PL-2023-001",
    community: "Marina Walk",
    numberOfFloors: "3",
    authorityApproval: "DM Approved"
  },
  { 
    id: 2,
    ref: "C-CO-2542", 
    start: "6/18/2025", 
    end: "6/18/2026", 
    category: "Residential Villa", 
    status: "Active", 
    value: 1800000,
    contractValue: "1,800,000 AED",
    startDate: "6/18/2025",
    endDate: "6/18/2026",
    paymentTerms: "Quarterly payments",
    scopeOfWork: "Villa renovation",
    deliverables: "Renovated 2-bedroom villa",
    termsAndConditions: "Renovation terms",
    penaltyClauses: "AED 300/day for delays",
    warrantyPeriod: "1 year",
    buildingCost: "1,600,000 AED",
    builtUpArea: "180 sq ft",
    structuralSystem: "Steel Frame",
    buildingHeight: "12 meters",
    buildingType: "Residential",
    region: "Jumeirah",
    plotNumber: "PL-2025-002",
    community: "Jumeirah Beach",
    numberOfFloors: "2",
    authorityApproval: "DM Pending"
  },
  { 
    id: 3,
    ref: "C-CO-2547", 
    start: "6/16/2025", 
    end: "6/16/2026", 
    category: "Residential Villa", 
    status: "Active", 
    value: 2200000,
    contractValue: "2,200,000 AED",
    startDate: "6/16/2025",
    endDate: "6/16/2026",
    paymentTerms: "Monthly payments",
    scopeOfWork: "Luxury villa construction",
    deliverables: "4-bedroom luxury villa",
    termsAndConditions: "Premium construction terms",
    penaltyClauses: "AED 800/day for delays",
    warrantyPeriod: "3 years",
    buildingCost: "2,000,000 AED",
    builtUpArea: "300 sq ft",
    structuralSystem: "Reinforced Concrete",
    buildingHeight: "18 meters",
    buildingType: "Residential",
    region: "Palm Jumeirah",
    plotNumber: "PL-2025-003",
    community: "Palm Beach",
    numberOfFloors: "3",
    authorityApproval: "DM Approved"
  },
  { 
    id: 4,
    ref: "C-ON-2208", 
    start: "10/11/2022", 
    end: "10/11/2023", 
    category: "Residential Villa", 
    status: "Completed", 
    value: 1500000,
    contractValue: "1,500,000 AED",
    startDate: "10/11/2022",
    endDate: "10/11/2023",
    paymentTerms: "Lump sum",
    scopeOfWork: "Villa construction",
    deliverables: "2-bedroom villa",
    termsAndConditions: "Standard terms",
    penaltyClauses: "AED 400/day for delays",
    warrantyPeriod: "2 years",
    buildingCost: "1,300,000 AED",
    builtUpArea: "150 sq ft",
    structuralSystem: "Concrete Block",
    buildingHeight: "10 meters",
    buildingType: "Residential",
    region: "Sharjah",
    plotNumber: "PL-2022-001",
    community: "Al Majaz",
    numberOfFloors: "2",
    authorityApproval: "DM Approved"
  },
  { 
    id: 5,
    ref: "C-CO-2550", 
    start: "1/15/2024", 
    end: "1/15/2026", 
    category: "Commercial Building", 
    status: "Active", 
    value: 5000000,
    contractValue: "5,000,000 AED",
    startDate: "1/15/2024",
    endDate: "1/15/2026",
    paymentTerms: "Monthly payments",
    scopeOfWork: "Office building construction",
    deliverables: "10-story office building",
    termsAndConditions: "Commercial terms",
    penaltyClauses: "AED 1,000/day for delays",
    warrantyPeriod: "5 years",
    buildingCost: "4,500,000 AED",
    builtUpArea: "5000 sq ft",
    structuralSystem: "Steel Frame",
    buildingHeight: "45 meters",
    buildingType: "Commercial",
    region: "DIFC",
    plotNumber: "PL-2024-001",
    community: "Financial Center",
    numberOfFloors: "10",
    authorityApproval: "DM Approved"
  }
];

export default function ContractList() {
  const navigate = useNavigate();
  const { toDisplay, currencyCode, preferences } = usePreferences();
  const areaLabel = (preferences?.areaUnit || 'sqm') === 'sqft' ? 'sq ft' : 'sqm';
  const heightLabel = (preferences?.heightUnit || 'meter') === 'feet' ? 'ft' : 'm';
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [contractForAmendment, setContractForAmendment] = useState(null);
  const [contractsRaw, setContractsRaw] = useState([]); // Store base values from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingOutContractId, setLoadingOutContractId] = useState(null);
  const [loadOutSuccess, setLoadOutSuccess] = useState(null);

  // Map raw contracts to display using Admin preferences (auto-updates when preferences change)
  const contracts = React.useMemo(() => {
    return contractsRaw.map(contract => {
      let contractStatus = contract.status;
      if (typeof contractStatus === 'number') contractStatus = 'DRAFT';
      else if (!contractStatus || contractStatus === '') contractStatus = 'DRAFT';
      else contractStatus = String(contractStatus);
      const baseValue = contract.contractValue ? Number(contract.contractValue) : (contract.totalAmount ? Number(contract.totalAmount) : 0);
      const displayValue = toDisplay(baseValue, 'currency');
      return {
        id: contract.id,
        ref: contract.referenceNumber || null,
        start: contract.startDate ? new Date(contract.startDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'N/A',
        end: contract.endDate ? new Date(contract.endDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'N/A',
        category: contract.contractCategory || contract.contractType || 'N/A',
        status: contractStatus,
        value: displayValue,
        contractValue: baseValue != null && baseValue !== '' ? `${Number(displayValue).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currencyCode || 'AED'}` : 'N/A',
        startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : null,
        endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : null,
        paymentTerms: contract.paymentTerms || 'N/A',
        scopeOfWork: contract.description || 'N/A',
        deliverables: contract.specialClauses || 'N/A',
        termsAndConditions: contract.termsAndConditions || 'N/A',
        penaltyClauses: contract.specialClauses || 'N/A',
        warrantyPeriod: contract.renewalTerms || 'N/A',
        buildingCost: contract.buildingCost != null && contract.buildingCost !== '' ? `${Number(toDisplay(Number(contract.buildingCost), 'currency')).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currencyCode || 'AED'}` : 'N/A',
        builtUpArea: contract.builtUpArea != null && contract.builtUpArea !== '' ? `${Number(toDisplay(Number(contract.builtUpArea), 'area')).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${areaLabel}` : 'N/A',
        structuralSystem: contract.structuralSystem || 'N/A',
        buildingHeight: contract.buildingHeight != null && contract.buildingHeight !== '' ? `${Number(toDisplay(Number(contract.buildingHeight), 'height')).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${heightLabel}` : 'N/A',
        buildingType: contract.buildingType || 'N/A',
        region: contract.region || 'N/A',
        plotNumber: contract.plotNumber || 'N/A',
        community: contract.community || 'N/A',
        numberOfFloors: contract.numberOfFloors ? String(contract.numberOfFloors) : 'N/A',
        authorityApproval: contract.authorityApprovalStatus || 'N/A',
        ...contract,
        status: contractStatus,
      };
    });
  }, [contractsRaw, toDisplay, currencyCode, preferences, areaLabel, heightLabel]);

  const fetchContracts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ContractsAPI.getContracts({ limit: 100 });
      if (response && response.success && response.data) {
        const contractsList = response.data.contracts || (Array.isArray(response.data) ? response.data : []);
        setContractsRaw(contractsList);
      } else {
        setContractsRaw([]);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setError(error.message || 'Failed to load contracts');
      setContractsRaw([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedContract(null);
  };

  const handleCreateAmendment = (contract) => {
    setContractForAmendment(contract);
    setShowAmendmentModal(true);
  };

  const handleCloseAmendmentModal = () => {
    setShowAmendmentModal(false);
    setContractForAmendment(null);
  };

  const handleDeleteContract = async (contract) => {
    const contractTitle = contract.title || contract.contractCategory || 'this contract';
    if (!window.confirm(`Delete ${contractTitle}? This cannot be undone.`)) return;
    try {
      await ContractsAPI.deleteContract(contract.id);
      setContractsRaw(prev => prev.filter(c => c.id !== contract.id));
    } catch (err) {
      console.error('Delete contract failed:', err);
      alert(err.message || 'Failed to delete contract.');
    }
  };

  const handleLoadOut = async (contract) => {
    // Check if contract is already linked to a project
    if (contract.projectId || contract.project) {
      const existingProject = contract.project?.referenceNumber || 'a project';
      alert(`This contract is already linked to project ${existingProject}. Duplicate entries are not allowed.`);
      return;
    }

    if (!window.confirm(`Load Out contract ${contract.ref || contract.referenceNumber}?\n\nThis will create a new project in the Project List with all contract details.`)) {
      return;
    }

    setLoadingOutContractId(contract.id);
    setLoadOutSuccess(null);

    try {
      const response = await ContractsAPI.loadOutContract(contract.id);
      
      if (response.success) {
        const projectRef = response.data?.project?.referenceNumber || 'N/A';
        setLoadOutSuccess({
          contractRef: contract.ref || contract.referenceNumber,
          projectRef: projectRef,
          message: response.message || `Project ${projectRef} created successfully!`
        });

        // Update contract in list to show it's linked
        setContractsRaw(prev =>
          prev.map(c =>
            c.id === contract.id
              ? { ...c, projectId: response.data?.project?.id, project: response.data?.project }
              : c
          )
        );

        // Clear success message after 5 seconds
        setTimeout(() => {
          setLoadOutSuccess(null);
        }, 5000);

        // Optionally navigate to projects page or show success notification
        alert(`✅ ${response.message}\n\nProject Reference: ${projectRef}\n\nYou can now view it in the Project List.`);
      } else {
        throw new Error(response.message || 'Failed to load out contract');
      }
    } catch (err) {
      console.error('Load Out failed:', err);
      alert(`❌ Error: ${err.message || 'Failed to create project from contract. Please try again.'}`);
    } finally {
      setLoadingOutContractId(null);
    }
  };

  const handleCreateAmendmentSubmit = async (updatedContract, amendmentRecord) => {
    try {
      // Update the original contract in the list with the changes (update raw list; display will recompute via useMemo)
      setContractsRaw(prev => 
        prev.map(c => 
          c.id === updatedContract.id || c.referenceNumber === updatedContract.ref
            ? { ...c, ...updatedContract }
            : c
        )
      );
      
      // Show success message with details
      const changesSummary = amendmentRecord.amendmentData.changes
        .filter(change => change.field && change.newValue)
        .map(change => `${change.field}: ${change.originalValue} → ${change.newValue}`)
        .join(', ');
      
      alert(`Amendment ${amendmentRecord.amendmentNumber} created successfully!\n\nChanges applied:\n${changesSummary}\n\nContract has been updated with the new values.`);
      
      // In a real application, you would:
      // 1. Save updated contract and amendment record to database/API
      // 2. Send notifications to stakeholders about the changes
      // 3. Update contract version history
      // 4. Generate audit trail
      
      console.log('Amendment Applied:', {
        updatedContract,
        amendmentRecord,
        changesApplied: amendmentRecord.changesApplied,
        originalContract: contractForAmendment
      });
      
    } catch (error) {
      console.error('Error creating amendment:', error);
      throw error;
    }
  };
  
  // Calculate contract statistics
  const contractStats = {
    total: contracts.length,
    active: contracts.filter(contract => contract.status === "ACTIVE" || contract.status === "Active").length,
    completed: contracts.filter(contract => contract.status === "COMPLETED" || contract.status === "Completed").length,
    residential: contracts.filter(contract => 
      contract.category?.toLowerCase().includes('residential') || 
      contract.buildingType?.toLowerCase().includes('residential') ||
      contract.contractType?.toLowerCase().includes('residential')
    ).length,
    commercial: contracts.filter(contract => 
      contract.category?.toLowerCase().includes('commercial') || 
      contract.buildingType?.toLowerCase().includes('commercial') ||
      contract.contractType?.toLowerCase().includes('commercial')
    ).length,
    industrial: contracts.filter(contract => 
      contract.category?.toLowerCase().includes('industrial') || 
      contract.buildingType?.toLowerCase().includes('industrial') ||
      contract.contractType?.toLowerCase().includes('industrial')
    ).length,
    totalValue: contracts.reduce((sum, contract) => sum + (contract.value || 0), 0),
    averageValue: contracts.length > 0 
      ? Math.round(contracts.reduce((sum, contract) => sum + (contract.value || 0), 0) / contracts.length)
      : 0
  };

  return (
    <div className="w-full h-full px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Contracts</h1>
        <button
          onClick={() => navigate("/contracts/create")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow text-xs sm:text-base w-full sm:w-auto"
        >
          + Create Contract
        </button>
      </div>

      {/* Contract Statistics */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 mb-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Contract Statistics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Contracts */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-blue-100 text-xs font-medium truncate">Total Contracts</p>
                <p className="text-xl font-bold">{contractStats.total}</p>
              </div>
              <ChartBarIcon className="h-6 w-6 text-blue-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* Active Contracts */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-green-100 text-xs font-medium truncate">Active</p>
                <p className="text-xl font-bold">{contractStats.active}</p>
              </div>
              <CheckCircleIcon className="h-6 w-6 text-green-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* Completed Contracts */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-purple-100 text-xs font-medium truncate">Completed</p>
                <p className="text-xl font-bold">{contractStats.completed}</p>
              </div>
              <DocumentTextIcon className="h-6 w-6 text-purple-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* Total Value */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-yellow-100 text-xs font-medium truncate">Total Value</p>
                <p className="text-xl font-bold">${(contractStats.totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <CalendarIcon className="h-6 w-6 text-yellow-200 flex-shrink-0 ml-2" />
            </div>
          </div>
        </div>
        
        {/* Additional Statistics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Residential Contracts */}
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-pink-100 text-xs font-medium truncate">Residential</p>
                <p className="text-xl font-bold">{contractStats.residential}</p>
              </div>
              <HomeIcon className="h-6 w-6 text-pink-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* Commercial Contracts */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-indigo-100 text-xs font-medium truncate">Commercial</p>
                <p className="text-xl font-bold">{contractStats.commercial}</p>
              </div>
              <BuildingOfficeIcon className="h-6 w-6 text-indigo-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* Industrial Contracts */}
          <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-teal-100 text-xs font-medium truncate">Industrial</p>
                <p className="text-xl font-bold">{contractStats.industrial}</p>
              </div>
              <ExclamationTriangleIcon className="h-6 w-6 text-teal-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* Average Value */}
          <div className="bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-amber-100 text-xs font-medium truncate">Avg Value</p>
                <p className="text-xl font-bold">${(contractStats.averageValue / 1000000).toFixed(1)}M</p>
              </div>
              <ClockIcon className="h-6 w-6 text-amber-200 flex-shrink-0 ml-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Load Out Success Notification */}
      {loadOutSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-green-800 font-semibold">Load Out Successful!</p>
              <p className="text-green-700 text-sm">
                Contract {loadOutSuccess.contractRef} → Project {loadOutSuccess.projectRef}
              </p>
            </div>
          </div>
          <button
            onClick={() => setLoadOutSuccess(null)}
            className="text-green-600 hover:text-green-800"
          >
            ✕
          </button>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-xl shadow p-2 sm:p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading contracts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600">No contracts found</p>
            <button
              onClick={() => navigate("/contracts/create")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create First Contract
            </button>
          </div>
        ) : (
          <table className="min-w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2 px-2">Reference</th>
                <th className="py-2 px-2">Start Date</th>
                <th className="py-2 px-2">End Date</th>
                <th className="py-2 px-2">Contract Category</th>
                <th className="py-2 px-2">Options</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c, idx) => (
                <tr key={c.id || idx} className={`even:bg-gray-50 ${c.amendmentHistory && c.amendmentHistory.length > 0 ? 'bg-green-50' : ''}`}>
                  <td className="py-2 px-2 whitespace-nowrap">
                    <span className="font-semibold text-gray-800">{c.ref || c.referenceNumber || 'N/A'}</span>
                  </td>
                  <td className="py-2 px-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {c.start}
                      {c.amendmentHistory && c.amendmentHistory.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Amended ({c.amendmentHistory.length})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2 whitespace-nowrap">{c.end}</td>
                  <td className="py-2 px-2 whitespace-nowrap">{c.category}</td>
                  <td className="py-2 px-2 whitespace-nowrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button 
                        onClick={() => handleViewContract(c)}
                        className="text-blue-600 hover:underline text-xs sm:text-sm hover:text-blue-800 transition-colors"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleLoadOut(c)}
                        disabled={loadingOutContractId === c.id || c.projectId || c.project}
                        className={`flex items-center gap-1 text-xs sm:text-sm transition-colors ${
                          loadingOutContractId === c.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : c.projectId || c.project
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-purple-600 hover:underline hover:text-purple-800'
                        }`}
                        title={c.projectId || c.project ? 'Already linked to a project' : 'Create project from this contract'}
                      >
                        {loadingOutContractId === c.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <ArrowRightIcon className="h-4 w-4" />
                            Load Out
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => handleCreateAmendment(c)}
                        className="text-green-600 hover:underline text-xs sm:text-sm hover:text-green-800 transition-colors"
                      >
                        Create Amendment
                      </button>
                      <button 
                        onClick={() => handleDeleteContract(c)}
                        className="text-red-600 hover:underline text-xs sm:text-sm hover:text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Contract View Modal */}
      <ContractViewModal
        isOpen={showViewModal}
        onClose={handleCloseModal}
        contract={selectedContract}
        onSave={async (contractId, payload) => {
          await ContractsAPI.updateContract(contractId, payload);
          setContractsRaw(prev =>
            prev.map(c => (c.id === contractId ? { ...c, ...payload } : c))
          );
          setSelectedContract(prev =>
            prev && prev.id === contractId ? { ...prev, ...payload } : prev
          );
        }}
      />

      {/* Amendment Form Modal */}
      <AmendmentForm
        isOpen={showAmendmentModal}
        onClose={handleCloseAmendmentModal}
        originalContract={contractForAmendment}
        onCreateAmendment={handleCreateAmendmentSubmit}
      />
    </div>
  );
} 