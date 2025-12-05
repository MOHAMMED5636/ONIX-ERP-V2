import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

const initialContractors = [
  {
    id: "aurora",
    name: "Aurora Contractors LLC",
    specialty: "Infrastructure",
    rating: "A",
    status: "Open",
    contact: "+971 4 456 8890",
    landline: "+971 4 234 5678",
    email: "info@auroracontractors.ae",
    engineerListing: "Whitelisted",
    licenseNumber: "CN-2024-001234",
    manager: "Ahmed Al-Mansoori",
  },
  {
    id: "skyline",
    name: "Skyline Fit-Out",
    specialty: "Interior & Fit-out",
    rating: "B+",
    status: "Not Open",
    contact: "+971 50 222 1100",
    landline: "+971 4 345 6789",
    email: "contact@skylinefitout.com",
    engineerListing: "Whitelisted",
    licenseNumber: "CN-2024-005678",
    manager: "Sarah Johnson",
  },
  {
    id: "desert",
    name: "Desert Foundations",
    specialty: "Civil Works",
    rating: "A-",
    status: "Open",
    contact: "+971 6 733 9080",
    landline: "+971 6 123 4567",
    email: null,
    engineerListing: "Blacklisted",
    licenseNumber: "CN-2023-009876",
    manager: "Mohammed Hassan",
  },
  {
    id: "bluewave",
    name: "Bluewave Electromechanical",
    specialty: "MEP",
    rating: "B",
    status: "Not Open",
    contact: "+971 2 445 7123",
    landline: "+971 2 567 8901",
    email: "sales@bluewave.ae",
    engineerListing: "Whitelisted",
    licenseNumber: "CN-2024-003456",
    manager: "Fatima Al-Zahra",
  },
];

export default function TenderContractorSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedContractorIds, setSelectedContractorIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    engineerListing: "All",
    status: "All",
    rating: "All",
    specialty: "",
  });
  const [contractors] = useState(initialContractors);
  
  // Get tender information from navigation state
  const selectedTender = location.state?.selectedTender || null;

  // Filter contractors based on search and filters
  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch =
      contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.contact.includes(searchTerm) ||
      contractor.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contractor.manager && contractor.manager.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEngineerListing =
      filters.engineerListing === "All" ||
      contractor.engineerListing === filters.engineerListing;

    const matchesStatus =
      filters.status === "All" || contractor.status === filters.status;

    const matchesRating =
      filters.rating === "All" || contractor.rating === filters.rating;

    const matchesSpecialty =
      !filters.specialty ||
      contractor.specialty.toLowerCase().includes(filters.specialty.toLowerCase());

    return (
      matchesSearch &&
      matchesEngineerListing &&
      matchesStatus &&
      matchesRating &&
      matchesSpecialty
    );
  });

  const toggleContractorSelection = (contractorId) => {
    // Only allow selection of whitelisted contractors
    const contractor = contractors.find((c) => c.id === contractorId);
    if (!contractor || contractor.engineerListing !== "Whitelisted") {
      return; // Do nothing if contractor is not whitelisted
    }

    setSelectedContractorIds((prev) => {
      const next = new Set(prev);
      if (next.has(contractorId)) {
        next.delete(contractorId);
      } else {
        next.add(contractorId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    // Only select whitelisted contractors
    const whitelistedContractors = filteredContractors.filter(
      (c) => c.engineerListing === "Whitelisted"
    );
    const whitelistedIds = new Set(whitelistedContractors.map((c) => c.id));
    
    // Check if all whitelisted contractors are already selected
    const allWhitelistedSelected = whitelistedIds.size > 0 && 
      Array.from(whitelistedIds).every((id) => selectedContractorIds.has(id));
    
    if (allWhitelistedSelected) {
      // Deselect all whitelisted contractors
      setSelectedContractorIds((prev) => {
        const next = new Set(prev);
        whitelistedIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      // Select all whitelisted contractors
      setSelectedContractorIds((prev) => {
        const next = new Set(prev);
        whitelistedIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const handleAssign = () => {
    if (!selectedTender || selectedContractorIds.size === 0) {
      alert("Please select at least one contractor.");
      return;
    }

    // Filter to ensure only whitelisted contractors are passed
    const selectedContractors = contractors.filter(
      (c) => selectedContractorIds.has(c.id) && c.engineerListing === "Whitelisted"
    );

    if (selectedContractors.length === 0) {
      alert("Please select at least one whitelisted contractor.");
      return;
    }

    // Navigate to confirmation/review page with selected data
    navigate("/tender/confirmation", {
      state: {
        tender: selectedTender,
        contractors: selectedContractors,
      },
    });
  };

  const handleBack = () => {
    navigate("/tender", {
      state: {
        preserveSelection: true,
      },
    });
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50/40 min-h-screen">
      {/* Header Section */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              title="Go back to tender selection"
            >
              <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 mt-2">
                Select Preferred Contractors
              </h1>
              <p className="text-slate-600 mt-3 max-w-3xl leading-relaxed">
                Choose contractors to associate with{" "}
                <span className="font-semibold text-indigo-600">
                  {selectedTender?.name || "the selected tender"}
                </span>
                . You can select multiple contractors.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Tender Info Card */}
        {selectedTender && (
          <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                  Selected Tender
                </p>
                <h3 className="text-xl font-bold text-slate-900">{selectedTender.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <span>
                    <span className="font-semibold">Client:</span> {selectedTender.client}
                  </span>
                  <span>
                    <span className="font-semibold">Project Manager:</span> {selectedTender.owner}
                  </span>
                  <span>
                    <span className="font-semibold">Submission Date:</span> {selectedTender.date}
                  </span>
                </div>
              </div>
              <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold">
                {selectedContractorIds.size} Selected
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Search and Filters */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Contractor Directory</h2>
            <p className="text-slate-600">
              Search and filter contractors by various criteria to find the best match.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search contractors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 w-full lg:w-64"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold transition flex items-center gap-2 ${
                showFilters
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-indigo-200 hover:text-indigo-600"
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Filter Contractors</h3>
              <button
                onClick={() => {
                  setFilters({
                    engineerListing: "All",
                    status: "All",
                    rating: "All",
                    specialty: "",
                  });
                }}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700 mb-1">
                  Engineer Listing
                </label>
                <select
                  value={filters.engineerListing}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, engineerListing: e.target.value }))
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 bg-white"
                >
                  <option value="All">All</option>
                  <option value="Whitelisted">Whitelisted</option>
                  <option value="Blacklisted">Blacklisted</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 bg-white"
                >
                  <option value="All">All</option>
                  <option value="Open">Open</option>
                  <option value="Not Open">Not Open</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700 mb-1">Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, rating: e.target.value }))
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 bg-white"
                >
                  <option value="All">All</option>
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="B-">B-</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-700 mb-1">
                  Licensed Activities
                </label>
                <input
                  type="text"
                  placeholder="Filter by specialty..."
                  value={filters.specialty}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, specialty: e.target.value }))
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-slate-600">
          Showing {filteredContractors.length} of {contractors.length} contractors
          {selectedContractorIds.size > 0 && (
            <span className="ml-2 font-semibold text-indigo-600">
              ({selectedContractorIds.size} whitelisted selected)
            </span>
          )}
          <span className="ml-2 text-slate-500">
            ({filteredContractors.filter((c) => c.engineerListing === "Whitelisted").length} whitelisted available)
          </span>
        </div>
      </section>

      {/* Contractor Table */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Available Contractors</h2>
          <button
            onClick={handleSelectAll}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {filteredContractors.filter((c) => c.engineerListing === "Whitelisted").length > 0 &&
            filteredContractors
              .filter((c) => c.engineerListing === "Whitelisted")
              .every((c) => selectedContractorIds.has(c.id))
              ? "Deselect All Whitelisted"
              : "Select All Whitelisted"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 w-12">
                  <input
                    type="checkbox"
                    className="accent-indigo-600 h-4 w-4"
                    checked={
                      filteredContractors.filter((c) => c.engineerListing === "Whitelisted").length > 0 &&
                      filteredContractors
                        .filter((c) => c.engineerListing === "Whitelisted")
                        .every((c) => selectedContractorIds.has(c.id))
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                {[
                  "Contractor",
                  "Licensed Activities",
                  "Rating",
                  "Status",
                  "Engineer Listing",
                  "License Number",
                  "Manager",
                  "Contact",
                  "Landline",
                  "Email",
                ].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredContractors.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <MagnifyingGlassIcon className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          No contractors found
                        </h3>
                        <p className="text-slate-600">
                          Try adjusting your search terms or filters to find contractors.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContractors.map((contractor) => {
                  const isWhitelisted = contractor.engineerListing === "Whitelisted";
                  return (
                  <tr
                    key={contractor.id}
                    className={`transition ${
                      !isWhitelisted
                        ? "bg-slate-100/50 opacity-60 cursor-not-allowed"
                        : selectedContractorIds.has(contractor.id)
                        ? "bg-indigo-50/50 border-l-4 border-l-indigo-500 hover:bg-indigo-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="accent-indigo-600 h-4 w-4"
                        aria-label={`Select ${contractor.name}`}
                        checked={selectedContractorIds.has(contractor.id)}
                        onChange={() => toggleContractorSelection(contractor.id)}
                        disabled={contractor.engineerListing !== "Whitelisted"}
                        title={
                          contractor.engineerListing !== "Whitelisted"
                            ? "Only whitelisted contractors can be selected"
                            : `Select ${contractor.name}`
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{contractor.name}</p>
                      <p className="text-xs text-slate-500">ID: {contractor.id}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{contractor.specialty}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                          contractor.rating.startsWith("A")
                            ? "bg-green-50 text-green-700"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {contractor.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-sm rounded-full font-medium ${
                          contractor.status === "Open"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {contractor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-sm rounded-full font-medium ${
                          contractor.engineerListing === "Whitelisted"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {contractor.engineerListing === "Whitelisted" ? "✓" : "✗"}{" "}
                        {contractor.engineerListing}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-mono text-sm">
                      {contractor.licenseNumber}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {contractor.manager || (
                        <span className="italic text-slate-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{contractor.contact}</td>
                    <td className="px-6 py-4 text-slate-700">
                      {contractor.landline || (
                        <span className="italic text-slate-400">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {contractor.email ? (
                        <a
                          href={`mailto:${contractor.email}`}
                          className="text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          {contractor.email}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Not provided</span>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              {selectedContractorIds.size} contractor
              {selectedContractorIds.size !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={handleAssign}
              disabled={selectedContractorIds.size === 0}
              className={`px-8 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                selectedContractorIds.size === 0
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg hover:shadow-xl"
              }`}
            >
              Next: Review & Confirm
              <ArrowLeftIcon className="h-5 w-5 rotate-180" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

