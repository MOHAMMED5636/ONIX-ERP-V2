import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const lifecycleSteps = [
  {
    title: "Tender Invitation",
    description:
      "Publish project scope, eligibility criteria, and submission checklist for interested contractors.",
    detail:
      "All invitations follow Dubai Municipality compliance and reference codes.",
  },
  {
    title: "Technical Submission",
    description:
      "Teams prepare drawings, BOQs, and certifications for formal review.",
    detail:
      "Dedicated reviewers validate completeness before forwarding to the committee.",
    requirements: [
      "Architectural drawings (plans, elevations, sections)",
      "Structural engineering calculations and drawings",
      "MEP (Mechanical, Electrical, Plumbing) design documents",
      "Bill of Quantities (BOQ) with detailed pricing",
      "Material specifications and certifications",
      "Method statements and construction methodology",
      "Project timeline and schedule (Gantt chart)",
      "Quality assurance and control procedures",
      "Health and safety management plan",
      "Company profile and previous project portfolio",
      "Team qualifications and CVs of key personnel",
      "Financial statements and bank guarantees",
    ],
    checklist: [
      "All drawings stamped and signed by licensed engineers",
      "BOQ matches tender requirements and specifications",
      "Certifications valid and not expired",
      "Method statements align with Dubai Municipality standards",
      "All documents properly indexed and organized",
      "Digital copies uploaded to tender portal",
      "Hard copies prepared for physical submission (if required)",
    ],
  },
  {
    title: "Evaluation & Award",
    description:
      "Panels compare commercial and technical packages then issue an award letter.",
    detail:
      "Winning bidders receive onboarding packages for mobilization and supervision.",
  },
  {
    title: "Completed Project Section",
    description:
      "Archive awarded tenders, publish completion certificates, and move the project into supervision handover.",
    detail:
      "Completed packages include signed contracts, inspection approvals, and close-out documentation for facility teams.",
  },
];

const supportServices = [
  {
    name: "Consultation & Clarifications",
    description:
      "Schedule clarification calls, submit RFIs, and review addendums released during tendering.",
  },
  {
    name: "Document Authentication",
    description:
      "Track notarization, attestation, and municipality stamping requirements for each submission.",
  },
  {
    name: "Cost Benchmark Library",
    description:
      "Benchmark your proposal against historical ONIX bids and market references.",
  },
  {
    name: "Site Visit Coordination",
    description:
      "Request escorted visits, capture attendance, and upload photographic evidence.",
  },
];

const tenders = [
  {
    name: "Metro Station Expansion",
    client: "RTA Dubai",
    date: "Nov 22, 2025",
    owner: "Kaddour",
    status: "Preparing Submission",
    id: "metro-station",
  },
  {
    name: "Residential Tower – Marina",
    client: "Emerald Properties",
    date: "Nov 24, 2025",
    owner: "Noura",
    status: "Client Clarification",
    id: "residential-tower",
  },
  {
    name: "Community School Campus",
    client: "Knowledge Fund",
    date: "Dec 1, 2025",
    owner: "Samir",
    status: "Final Review",
    id: "community-school",
  },
];

export default function TenderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [showTenderInvitationForm, setShowTenderInvitationForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Restore selection from navigation state if coming back
  useEffect(() => {
    if (location.state?.preserveSelection && location.state?.selectedTenderId) {
      setSelectedTenderId(location.state.selectedTenderId);
    }
  }, [location.state]);

  // Handle navigation state from project management page
  useEffect(() => {
    if (location.state?.openTenderInvitation) {
      setSelectedProject({
        id: location.state.projectId,
        name: location.state.projectName,
        referenceNumber: location.state.projectRef,
      });
      setActiveStep(0); // Set to Tender Invitation step
      setShowTenderInvitationForm(true);
      // Clear the navigation state to prevent re-opening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const toggleTenderSelection = (tenderId) => {
    setSelectedTenderId((prev) => {
      // If clicking the same tender, deselect it
      if (prev === tenderId) {
        return null;
      }
      // Otherwise, select the new tender
      return tenderId;
    });
  };

  const handleNext = () => {
    if (!selectedTenderId) {
      setAssignmentMessage("Please select a tender to proceed.");
      return;
    }

    const selectedTender = tenders.find((t) => t.id === selectedTenderId);
    if (selectedTender) {
      // Navigate to contractor selection page with tender info
      navigate("/tender/contractors", {
        state: {
          selectedTender: selectedTender,
        },
      });
    }
  };


  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50/40 min-h-screen">
      {/* Progress Indicator */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                1
              </div>
              <span className="text-sm font-medium text-indigo-600">Select Tender</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-semibold">
                2
              </div>
              <span className="text-sm font-medium text-slate-400">Select Contractors</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-semibold">
                3
              </div>
              <span className="text-sm font-medium text-slate-400">Review & Confirm</span>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Dashboard / Tender Hub
            </p>
            <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 mt-2">
              Tender Management Services
            </h1>
            <p className="text-slate-600 mt-3 max-w-3xl leading-relaxed">
              Inspired by Dubai Municipality’s building services portal, this
              workspace guides teams through every tender milestone—from notice
              issuance and technical submissions to evaluation, award, and
              supervision handover.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-2xl shadow hover:bg-indigo-500 transition">
              + Register New Tender
            </button>
            <button className="px-5 py-3 border border-slate-200 text-sm font-semibold text-slate-700 rounded-2xl hover:border-indigo-200 hover:text-indigo-600 transition">
              Download Guidelines
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Active Tenders", value: 12, badge: "Open" },
            { label: "Pending Approvals", value: 5, badge: "Leadership" },
            { label: "Submissions Due Today", value: 2, badge: "Urgent" },
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

      <section className="bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Tender Lifecycle
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            Permit & Submission Steps
          </h2>
          <p className="text-slate-600">
            Mirror the Dubai Municipality flow—from notice to structural
            inspection—while keeping stakeholders aligned.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {lifecycleSteps.map((step, index) => {
            const isActive = activeStep === index;
            return (
              <button
                key={step.title}
                onClick={() => setActiveStep(index)}
                className={`text-left rounded-2xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 p-5 flex flex-col gap-3 shadow-sm ${
                  isActive
                    ? "border-indigo-300 bg-white shadow-md"
                    : "border-slate-100 bg-white hover:border-indigo-200"
                }`}
                aria-pressed={isActive}
              >
                <div className="text-sm font-semibold text-indigo-600">
                  Step {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {step.title}
                </h3>
                {isActive ? (
                  <>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                    <span className="text-xs font-semibold text-indigo-600 mt-auto">
                      View requirements →
                    </span>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic mt-auto">
                    Click to view details
                  </p>
                )}
              </button>
            );
          })}
        </div>
        <div className="rounded-2xl bg-white border border-indigo-50 p-5 text-sm text-slate-600 leading-relaxed shadow-sm space-y-4">
          <p>{lifecycleSteps[activeStep].detail}</p>
          
          {lifecycleSteps[activeStep].requirements && (
            <div className="mt-4 pt-4 border-t border-indigo-100">
              <h4 className="font-semibold text-slate-900 mb-3">Required Documents:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc list-inside text-slate-700">
                {lifecycleSteps[activeStep].requirements.map((req, idx) => (
                  <li key={idx} className="text-sm">{req}</li>
                ))}
              </ul>
            </div>
          )}
          
          {lifecycleSteps[activeStep].checklist && (
            <div className="mt-4 pt-4 border-t border-indigo-100">
              <h4 className="font-semibold text-slate-900 mb-3">Submission Checklist:</h4>
              <ul className="space-y-2">
                {lifecycleSteps[activeStep].checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-indigo-600 mt-0.5">✓</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-4">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Tender Operations Board
            </h2>
            <p className="text-slate-600">
              Upcoming deadlines, project managers, and live status for each opportunity.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition">
              Filter
            </button>
            <button className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition">
              Columns
            </button>
          </div>
        </header>
        {selectedTenderId && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 px-4 py-3 text-sm text-indigo-900 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold">
                {tenders.find((t) => t.id === selectedTenderId)?.name || "Tender"} selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="px-3 py-1.5 rounded-lg bg-white text-indigo-700 text-xs font-semibold border border-indigo-200 hover:bg-indigo-100 transition"
                onClick={() => setSelectedTenderId(null)}
              >
                Clear Selection
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition flex items-center gap-2 shadow-lg hover:shadow-xl"
                onClick={handleNext}
              >
                Next: Select Contractors
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 w-12">
                  {/* Single selection - no select all checkbox */}
                </th>
                {[
                  "Tender Name",
                  "Client",
                  "Submission Date",
                  "Project Manager",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenders.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <input
                      type="radio"
                      name="tender-selection"
                      className="accent-indigo-600 h-4 w-4"
                      aria-label={`Select ${row.name}`}
                      checked={selectedTenderId === row.id}
                      onChange={() => toggleTenderSelection(row.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{row.name}</p>
                    <p className="text-xs text-slate-500">Tender Ref TBD</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{row.client}</td>
                  <td className="px-6 py-4 text-slate-700">{row.date}</td>
                  <td className="px-6 py-4 text-slate-700">{row.owner}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-amber-50 text-amber-700 font-medium">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Support Desk
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">
            Tender Support & Other Services
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportServices.map((service) => (
            <div
              key={service.name}
              className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {service.name}
              </h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}



