import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import ContractViewModal from './ContractViewModal';
import AmendmentForm from './AmendmentForm';

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
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [contractForAmendment, setContractForAmendment] = useState(null);
  const [contracts, setContracts] = useState(demoContracts);

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

  const handleCreateAmendmentSubmit = async (updatedContract, amendmentRecord) => {
    try {
      // Update the original contract in the list with the changes
      setContracts(prevContracts => 
        prevContracts.map(contract => 
          contract.id === updatedContract.id || contract.ref === updatedContract.ref
            ? updatedContract
            : contract
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
    active: contracts.filter(contract => contract.status === "Active").length,
    completed: contracts.filter(contract => contract.status === "Completed").length,
    residential: contracts.filter(contract => contract.category === "Residential Villa").length,
    commercial: contracts.filter(contract => contract.category === "Commercial Building").length,
    industrial: contracts.filter(contract => contract.category === "Industrial Complex").length,
    totalValue: contracts.reduce((sum, contract) => sum + contract.value, 0),
    averageValue: Math.round(contracts.reduce((sum, contract) => sum + contract.value, 0) / contracts.length)
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
      <div className="overflow-x-auto bg-white rounded-xl shadow p-2 sm:p-4">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2 px-2">Reference Number</th>
              <th className="py-2 px-2">Start Date</th>
              <th className="py-2 px-2">End Date</th>
              <th className="py-2 px-2">Contract Category</th>
              <th className="py-2 px-2">Options</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c, idx) => (
              <tr key={idx} className={`even:bg-gray-50 ${c.amendmentHistory && c.amendmentHistory.length > 0 ? 'bg-green-50' : ''}`}>
                <td className="py-2 px-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {c.ref}
                    {c.amendmentHistory && c.amendmentHistory.length > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Amended ({c.amendmentHistory.length})
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-2 whitespace-nowrap">{c.start}</td>
                <td className="py-2 px-2 whitespace-nowrap">{c.end}</td>
                <td className="py-2 px-2 whitespace-nowrap">{c.category}</td>
                <td className="py-2 px-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleViewContract(c)}
                      className="text-blue-600 hover:underline text-xs sm:text-sm hover:text-blue-800 transition-colors"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleCreateAmendment(c)}
                      className="text-green-600 hover:underline text-xs sm:text-sm hover:text-green-800 transition-colors"
                    >
                      Create Amendment
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contract View Modal */}
      <ContractViewModal
        isOpen={showViewModal}
        onClose={handleCloseModal}
        contract={selectedContract}
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