import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  XMarkIcon,
  CheckIcon,
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

export default function ContractorsPage() {
  const [contractors, setContractors] = useState(initialContractors);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [filters, setFilters] = useState({
    engineerListing: "All",
    status: "All",
    rating: "All",
    specialty: "",
  });
  const [contractorForm, setContractorForm] = useState({
    name: "",
    specialty: "",
    rating: "",
    status: "",
    contact: "",
    landline: "",
    email: "",
    engineerListing: "Whitelisted",
    licenseNumber: "",
    manager: "",
  });
  const [error, setError] = useState("");

  const filteredContractors = contractors.filter((contractor) => {
    // Search filter
    const matchesSearch =
      contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.contact.includes(searchTerm) ||
      contractor.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contractor.manager && contractor.manager.toLowerCase().includes(searchTerm.toLowerCase()));

    // Engineer listing filter
    const matchesEngineerListing =
      filters.engineerListing === "All" ||
      contractor.engineerListing === filters.engineerListing;

    // Status filter
    const matchesStatus =
      filters.status === "All" || contractor.status === filters.status;

    // Rating filter
    const matchesRating =
      filters.rating === "All" || contractor.rating === filters.rating;

    // Specialty filter
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

  const handleAddContractor = (e) => {
    e.preventDefault();
    const requiredFields = ["name", "specialty", "rating", "status", "licenseNumber", "contact"];
    const missing = requiredFields.filter((field) => !contractorForm[field].trim());
    
    if (missing.length) {
      setError("Please fill all required fields marked with *.");
      return;
    }

    const newContractor = {
      ...contractorForm,
      id: `${contractorForm.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      email: contractorForm.email || null,
    };

    setContractors((prev) => [...prev, newContractor]);
    setContractorForm({
      name: "",
      specialty: "",
      rating: "",
      status: "",
      contact: "",
      landline: "",
      email: "",
      engineerListing: "Whitelisted",
      licenseNumber: "",
      manager: "",
    });
    setError("");
    setShowAddForm(false);
  };

  const handleDeleteContractor = (id) => {
    if (window.confirm("Are you sure you want to delete this contractor?")) {
      setContractors((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleViewContractor = (contractor) => {
    setSelectedContractor(contractor);
    setShowViewModal(true);
  };

  const handleEditContractor = (contractor) => {
    setSelectedContractor(contractor);
    setContractorForm({
      name: contractor.name,
      specialty: contractor.specialty,
      rating: contractor.rating,
      status: contractor.status,
      contact: contractor.contact,
      landline: contractor.landline || "",
      email: contractor.email || "",
      engineerListing: contractor.engineerListing,
      licenseNumber: contractor.licenseNumber,
      manager: contractor.manager || "",
    });
    setError("");
    setShowEditModal(true);
  };

  const handleUpdateContractor = (e) => {
    e.preventDefault();
    const requiredFields = ["name", "specialty", "rating", "status", "licenseNumber", "contact"];
    const missing = requiredFields.filter((field) => !contractorForm[field].trim());
    
    if (missing.length) {
      setError("Please fill all required fields marked with *.");
      return;
    }

    setContractors((prev) =>
      prev.map((c) =>
        c.id === selectedContractor.id
          ? {
              ...contractorForm,
              id: c.id,
              email: contractorForm.email || null,
              manager: contractorForm.manager || null,
              landline: contractorForm.landline || null,
            }
          : c
      )
    );
    setShowEditModal(false);
    setSelectedContractor(null);
    setError("");
    setContractorForm({
      name: "",
      specialty: "",
      rating: "",
      status: "",
      contact: "",
      landline: "",
      email: "",
      engineerListing: "Whitelisted",
      licenseNumber: "",
      manager: "",
    });
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 bg-slate-50/40 min-h-screen">
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Supplier Management
            </p>
            <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 mt-2">
              Contractors & Suppliers
            </h1>
            <p className="text-slate-600 mt-3 max-w-3xl leading-relaxed">
              Manage your contractor and supplier database. Add new vendors, track licensed activities, ratings, and status for tender assignments.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-2xl shadow hover:bg-indigo-500 transition flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Contractor
            </button>
            <button className="px-5 py-3 border border-slate-200 text-sm font-semibold text-slate-700 rounded-2xl hover:border-indigo-200 hover:text-indigo-600 transition">
              Export List
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Contractors", value: contractors.length, badge: "Active" },
            { label: "Available Now", value: contractors.filter((c) => c.status === "Open").length, badge: "Open" },
            { label: "Top Rated (A)", value: contractors.filter((c) => c.rating.startsWith("A")).length, badge: "Premium" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 px-5 py-4 shadow-sm"
            >
              <p className="text-sm text-slate-500">{card.label}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-semibold text-slate-900">
                  {card.value}
                </span>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5">
                  {card.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showAddForm && (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Register New Contractor</h2>
            <button
              onClick={() => {
                setShowAddForm(false);
                setError("");
                setContractorForm({
                  name: "",
                  specialty: "",
                  rating: "",
                  status: "",
                  contact: "",
                  email: "",
                });
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          {error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}
          <form
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            onSubmit={handleAddContractor}
          >
            {[
              { key: "name", label: "Contractor Name *", placeholder: "e.g. Horizon Builders" },
              { key: "specialty", label: "Licensed Activities *", placeholder: "e.g. Structural Works, MEP" },
              { key: "rating", label: "Rating *", placeholder: "e.g. A, B+" },
              { key: "status", label: "Status *", placeholder: "Open or Not Open", type: "select", options: ["Open", "Not Open"] },
              { key: "engineerListing", label: "Engineer Listing *", placeholder: "Whitelisted or Blacklisted", type: "select", options: ["Whitelisted", "Blacklisted"] },
            { key: "licenseNumber", label: "License Number *", placeholder: "e.g. CN-2024-001234" },
            { key: "manager", label: "Manager", placeholder: "e.g. John Smith" },
            { key: "contact", label: "Primary Contact *", placeholder: "+971 ..." },
            { key: "landline", label: "Landline Number", placeholder: "+971 4 ..." },
            { key: "email", label: "Email (optional)", placeholder: "contact@company.com" },
            ].map((field) => (
              <div key={field.key} className="flex flex-col">
                <label className="text-sm font-semibold text-slate-700 mb-1">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    value={contractorForm[field.key]}
                    onChange={(e) =>
                      setContractorForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Select status...</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.key === "email" ? "email" : "text"}
                    value={contractorForm[field.key]}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                      setContractorForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                  />
                )}
              </div>
            ))}
            <div className="md:col-span-2 lg:col-span-3 flex gap-3">
              <button
                type="submit"
                className="px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-2xl shadow hover:bg-indigo-500 transition"
              >
                Add Contractor
              </button>
              <button
                type="button"
                onClick={() => {
                  setContractorForm({
                    name: "",
                    specialty: "",
                    rating: "",
                    status: "",
                    contact: "",
                    email: "",
                  });
                  setError("");
                }}
                className="px-5 py-3 border border-slate-200 text-sm font-semibold text-slate-700 rounded-2xl hover:border-indigo-200 hover:text-indigo-600 transition"
              >
                Clear
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Contractor Directory</h2>
            <p className="text-slate-600">Search and manage all registered contractors and suppliers.</p>
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
                <label className="text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
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
                <label className="text-xs font-semibold text-slate-700 mb-1">
                  Rating
                </label>
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
            {(filters.engineerListing !== "All" ||
              filters.status !== "All" ||
              filters.rating !== "All" ||
              filters.specialty) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-indigo-200">
                <span className="text-xs text-slate-600">Active filters:</span>
                {filters.engineerListing !== "All" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                    {filters.engineerListing}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, engineerListing: "All" }))
                      }
                      className="hover:text-indigo-900"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.status !== "All" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                    Status: {filters.status}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, status: "All" }))
                      }
                      className="hover:text-indigo-900"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.rating !== "All" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                    Rating: {filters.rating}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, rating: "All" }))
                      }
                      className="hover:text-indigo-900"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.specialty && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                    {filters.specialty}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, specialty: "" }))
                      }
                      className="hover:text-indigo-900"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-slate-600">
          Showing {filteredContractors.length} of {contractors.length} contractors
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                {["Contractor", "Licensed Activities", "Rating", "Status", "Engineer Listing", "License Number", "Manager", "Contact", "Landline", "Email", "Actions"].map(
                  (heading) => (
                    <th key={heading} className="px-6 py-3 text-left">
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredContractors.map((contractor) => (
                <tr key={contractor.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{contractor.name}</p>
                    <p className="text-xs text-slate-500">ID: {contractor.id}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{contractor.specialty}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-sm rounded-full bg-indigo-50 text-indigo-700 font-medium">
                      {contractor.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                      contractor.status === "Open" 
                        ? "bg-green-50 text-green-700" 
                        : "bg-red-50 text-red-700"
                    }`}>
                      {contractor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                      contractor.engineerListing === "Whitelisted" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {contractor.engineerListing === "Whitelisted" ? "✓ Whitelisted" : "✗ Blacklisted"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-mono text-sm">
                    {contractor.licenseNumber}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {contractor.manager || <span className="text-slate-400 italic">Not assigned</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{contractor.contact}</td>
                  <td className="px-6 py-4 text-slate-700">
                    {contractor.landline || <span className="text-slate-400 italic">Not provided</span>}
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
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewContractor(contractor)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="View"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditContractor(contractor)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteContractor(contractor.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* View Modal */}
      {showViewModal && selectedContractor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-2xl font-semibold text-slate-900">Contractor Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedContractor(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <XMarkIcon className="h-6 w-6 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contractor Name</label>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{selectedContractor.name}</p>
                  <p className="text-sm text-slate-500 mt-1">ID: {selectedContractor.id}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">License Number</label>
                  <p className="mt-1 text-lg font-mono text-slate-900">{selectedContractor.licenseNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Licensed Activities</label>
                  <p className="mt-1 text-base text-slate-900">{selectedContractor.specialty}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rating</label>
                  <div className="mt-1">
                    <span className="inline-flex px-3 py-1 text-sm rounded-full bg-indigo-50 text-indigo-700 font-medium">
                      {selectedContractor.rating}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                      selectedContractor.status === "Open" 
                        ? "bg-green-50 text-green-700" 
                        : "bg-red-50 text-red-700"
                    }`}>
                      {selectedContractor.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Engineer Listing</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
                      selectedContractor.engineerListing === "Whitelisted" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {selectedContractor.engineerListing === "Whitelisted" ? "✓ Whitelisted" : "✗ Blacklisted"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Manager</label>
                  <p className="mt-1 text-base text-slate-900">
                    {selectedContractor.manager || <span className="text-slate-400 italic">Not assigned</span>}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Primary Contact</label>
                  <p className="mt-1 text-base text-slate-900">{selectedContractor.contact}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Landline Number</label>
                  <p className="mt-1 text-base text-slate-900">
                    {selectedContractor.landline || <span className="text-slate-400 italic">Not provided</span>}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</label>
                  <p className="mt-1 text-base text-slate-900">
                    {selectedContractor.email ? (
                      <a href={`mailto:${selectedContractor.email}`} className="text-indigo-600 hover:text-indigo-700 hover:underline">
                        {selectedContractor.email}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not provided</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3 rounded-b-3xl">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedContractor(null);
                }}
                className="px-5 py-2 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditContractor(selectedContractor);
                }}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 transition flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedContractor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-2xl font-semibold text-slate-900">Edit Contractor</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedContractor(null);
                  setError("");
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <XMarkIcon className="h-6 w-6 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleUpdateContractor} className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: "name", label: "Contractor Name *", placeholder: "e.g. Horizon Builders" },
                  { key: "specialty", label: "Licensed Activities *", placeholder: "e.g. Structural Works, MEP" },
                  { key: "rating", label: "Rating *", placeholder: "e.g. A, B+" },
                  { key: "status", label: "Status *", type: "select", options: ["Open", "Not Open"] },
                  { key: "engineerListing", label: "Engineer Listing *", type: "select", options: ["Whitelisted", "Blacklisted"] },
                  { key: "licenseNumber", label: "License Number *", placeholder: "e.g. CN-2024-001234" },
                  { key: "manager", label: "Manager", placeholder: "e.g. John Smith" },
                  { key: "contact", label: "Primary Contact *", placeholder: "+971 ..." },
                  { key: "landline", label: "Landline Number", placeholder: "+971 4 ..." },
                  { key: "email", label: "Email (optional)", placeholder: "contact@company.com" },
                ].map((field) => (
                  <div key={field.key} className="flex flex-col">
                    <label className="text-sm font-semibold text-slate-700 mb-1">
                      {field.label}
                    </label>
                    {field.type === "select" ? (
                      <select
                        value={contractorForm[field.key]}
                        onChange={(e) =>
                          setContractorForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.key === "email" ? "email" : "text"}
                        value={contractorForm[field.key]}
                        placeholder={field.placeholder}
                        onChange={(e) =>
                          setContractorForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedContractor(null);
                    setError("");
                  }}
                  className="px-5 py-2 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 transition flex items-center gap-2"
                >
                  <CheckIcon className="h-4 w-4" />
                  Update Contractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

