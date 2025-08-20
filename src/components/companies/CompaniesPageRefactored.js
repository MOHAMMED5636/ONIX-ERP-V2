import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BuildingOfficeIcon, 
  PlusIcon 
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useCompanySelection } from "../../context/CompanySelectionContext";

// Import modular components and utilities
import {
  initialCompanies
} from './CompaniesPage/index';
import {
  filterCompanies,
  calculateCompanyStats,
  deleteCompany,
  loadCompaniesFromStorage,
  saveCompaniesToStorage,
  mergeCompaniesWithInitial
} from './CompaniesPage/index';
import {
  CompanyCard,
  CompanyTableRow,
  CompanyFilters,
  CompanyStats,
  CompanySelectionIndicator
} from './CompaniesPage/index';
import {
  ViewCompanyModal
} from './CompaniesPage/index';

export default function CompaniesPageRefactored() {
  const [companies, setCompanies] = useState([]);
  const [viewCompany, setViewCompany] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLicenseStatus, setFilterLicenseStatus] = useState("all");
  const [viewMode, setViewMode] = useState("cards");
  const navigate = useNavigate();
  const { selectedCompany, selectCompany } = useCompanySelection();

  // Load companies from localStorage on component mount
  useEffect(() => {
    const savedCompanies = loadCompaniesFromStorage();
    const allCompanies = mergeCompaniesWithInitial(savedCompanies, initialCompanies);
    setCompanies(allCompanies);
  }, []);

  // Calculate filtered companies and stats
  const filteredCompanies = filterCompanies(companies, searchTerm, filterStatus, filterLicenseStatus);
  const stats = calculateCompanyStats(companies);

  // Event handlers
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      const updatedCompanies = deleteCompany(companies, id);
      setCompanies(updatedCompanies);
      saveCompaniesToStorage(updatedCompanies);
    }
  };

  const handleView = (company) => {
    setViewCompany(company);
    setShowViewModal(true);
  };

  const handleEdit = (company) => {
    navigate(`/companies/create`, { state: { company } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Companies
              </h1>
              <p className="text-gray-600 mt-1">Manage your company information and settings with license tracking</p>
            </div>
          </div>
          
          {/* Selection Indicator */}
          <CompanySelectionIndicator selectedCompany={selectedCompany} />
          
          {/* Stats Cards */}
          <CompanyStats stats={stats} />
        </div>

        {/* Enhanced Action Bar */}
        <CompanyFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterLicenseStatus={filterLicenseStatus}
          setFilterLicenseStatus={setFilterLicenseStatus}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Companies Content */}
        {viewMode === "cards" ? (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                selectedCompany={selectedCompany}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSelectCompany={selectCompany}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      License Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCompanies.map((company) => (
                    <CompanyTableRow
                      key={company.id}
                      company={company}
                      selectedCompany={selectedCompany}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onSelectCompany={selectCompany}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <BuildingOfficeIcon className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first company."
              }
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Link
                to="/companies/create"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Company
              </Link>
            )}
          </div>
        )}
      </div>

      {/* View Modal */}
      <ViewCompanyModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        company={viewCompany}
        onEdit={handleEdit}
      />
    </div>
  );
}

