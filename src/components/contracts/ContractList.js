import React from "react";
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

const demoContracts = [
  { ref: "C-CO-25279", start: "7/1/2023", end: "7/1/2025", category: "Residential Villa", status: "Active", value: 2500000 },
  { ref: "C-CO-2542", start: "6/18/2025", end: "6/18/2026", category: "Residential Villa", status: "Active", value: 1800000 },
  { ref: "C-CO-2547", start: "6/16/2025", end: "6/16/2026", category: "Residential Villa", status: "Active", value: 2200000 },
  { ref: "C-ON-2208", start: "10/11/2022", end: "10/11/2023", category: "Residential Villa", status: "Completed", value: 1500000 },
  { ref: "C-CO-2550", start: "1/15/2024", end: "1/15/2026", category: "Commercial Building", status: "Active", value: 5000000 },
  { ref: "C-CO-2551", start: "3/20/2024", end: "3/20/2025", category: "Commercial Building", status: "Active", value: 3200000 },
  { ref: "C-CO-2552", start: "5/10/2023", end: "5/10/2024", category: "Commercial Building", status: "Completed", value: 2800000 },
  { ref: "C-CO-2553", start: "8/1/2024", end: "8/1/2026", category: "Industrial Complex", status: "Active", value: 7500000 },
  { ref: "C-CO-2554", start: "2/14/2024", end: "2/14/2025", category: "Industrial Complex", status: "Active", value: 4200000 },
  { ref: "C-CO-2555", start: "11/1/2023", end: "11/1/2024", category: "Industrial Complex", status: "Completed", value: 3800000 },
];

export default function ContractList() {
  const navigate = useNavigate();
  
  // Calculate contract statistics
  const contractStats = {
    total: demoContracts.length,
    active: demoContracts.filter(contract => contract.status === "Active").length,
    completed: demoContracts.filter(contract => contract.status === "Completed").length,
    residential: demoContracts.filter(contract => contract.category === "Residential Villa").length,
    commercial: demoContracts.filter(contract => contract.category === "Commercial Building").length,
    industrial: demoContracts.filter(contract => contract.category === "Industrial Complex").length,
    totalValue: demoContracts.reduce((sum, contract) => sum + contract.value, 0),
    averageValue: Math.round(demoContracts.reduce((sum, contract) => sum + contract.value, 0) / demoContracts.length)
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
            {demoContracts.map((c, idx) => (
              <tr key={idx} className="even:bg-gray-50">
                <td className="py-2 px-2 whitespace-nowrap">{c.ref}</td>
                <td className="py-2 px-2 whitespace-nowrap">{c.start}</td>
                <td className="py-2 px-2 whitespace-nowrap">{c.end}</td>
                <td className="py-2 px-2 whitespace-nowrap">{c.category}</td>
                <td className="py-2 px-2 whitespace-nowrap">
                  <button className="text-blue-600 hover:underline text-xs sm:text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 