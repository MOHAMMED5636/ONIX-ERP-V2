import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export default function TenderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tender = location.state?.tender || null;
  const contractors = location.state?.contractors || [];

  const handleBack = () => {
    navigate("/tender/contractors", {
      state: {
        selectedTender: tender,
        selectedContractors: contractors,
      },
    });
  };

  const handleConfirm = () => {
    // Here you would typically make an API call to save the assignment
    // Navigate to Technical Submission page
    navigate("/tender/technical-submission", {
      state: {
        tender,
        contractors,
      },
    });
  };

  const handleCancel = () => {
    navigate("/tender");
  };

  if (!tender || contractors.length === 0) {
    return (
      <div className="p-6 lg:p-10 space-y-8 bg-slate-50/40 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-md text-center">
          <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Missing Information
          </h2>
          <p className="text-slate-600 mb-6">
            Please go back and select a tender and contractors.
          </p>
          <button
            onClick={() => navigate("/tender")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition"
          >
            Go to Tender Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50/40 min-h-screen">
      {/* Header */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Go back"
          >
            <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 mt-2">
              Review & Confirm Assignment
            </h1>
            <p className="text-slate-600 mt-3 max-w-3xl leading-relaxed">
              Please review the tender and selected contractors before confirming the assignment.
            </p>
          </div>
        </div>
      </section>

      {/* Tender Details Card */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Tender Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Tender Name
            </p>
            <p className="text-lg font-semibold text-slate-900">{tender.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Client
            </p>
            <p className="text-lg text-slate-900">{tender.client}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Project Manager
            </p>
            <p className="text-lg text-slate-900">{tender.owner}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Submission Date
            </p>
            <p className="text-lg text-slate-900">{tender.date}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Status
          </p>
          <span className="inline-flex items-center px-4 py-2 text-sm rounded-full bg-amber-50 text-amber-700 font-medium">
            {tender.status}
          </span>
        </div>
      </section>

      {/* Selected Contractors */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Selected Contractors
              </h2>
              <p className="text-slate-600">
                {contractors.length} contractor{contractors.length !== 1 ? "s" : ""} will be
                assigned to this tender
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contractors.map((contractor) => (
            <div
              key={contractor.id}
              className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg">{contractor.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">ID: {contractor.id}</p>
                </div>
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
              </div>
              <div className="space-y-2 pt-2 border-t border-green-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Licensed Activities:</span>
                  <span className="font-semibold text-slate-900">{contractor.specialty}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Rating:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      contractor.rating.startsWith("A")
                        ? "bg-green-100 text-green-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {contractor.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      contractor.status === "Open"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {contractor.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Engineer Listing:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      contractor.engineerListing === "Whitelisted"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {contractor.engineerListing === "Whitelisted" ? "✓" : "✗"}{" "}
                    {contractor.engineerListing}
                  </span>
                </div>
                {contractor.manager && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Manager:</span>
                    <span className="font-semibold text-slate-900">{contractor.manager}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Contact:</span>
                  <span className="font-mono text-xs">{contractor.contact}</span>
                </div>
              </div>
            </div>
          ))}
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
            <button
              onClick={handleCancel}
              className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-red-200 hover:text-red-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-lg hover:shadow-xl transition flex items-center gap-2 font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

