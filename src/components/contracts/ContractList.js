import React from "react";
import { useNavigate } from "react-router-dom";

const demoContracts = [
  { ref: "C-CO-25279", start: "7/1/2023", end: "7/1/2025", category: "Residential Villa" },
  { ref: "C-CO-2542", start: "6/18/2025", end: "6/18/2026", category: "Residential Villa" },
  { ref: "C-CO-2547", start: "6/16/2025", end: "6/16/2026", category: "Residential Villa" },
  { ref: "C-ON-2208", start: "10/11/2022", end: "10/11/2023", category: "Residential Villa" },
];

export default function ContractList() {
  const navigate = useNavigate();
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