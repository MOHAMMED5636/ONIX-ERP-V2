import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRightIcon, ChartBarIcon, CloudArrowUpIcon, XMarkIcon, PaperClipIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

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

// Tender management data by year (2021-2025)
const tenderYearlyData = [
  { year: 2021, total: 45, awarded: 28, pending: 12, rejected: 5 },
  { year: 2022, total: 52, awarded: 35, pending: 10, rejected: 7 },
  { year: 2023, total: 68, awarded: 42, pending: 18, rejected: 8 },
  { year: 2024, total: 75, awarded: 48, pending: 20, rejected: 7 },
  { year: 2025, total: 82, awarded: 55, pending: 22, rejected: 5 },
];

export default function TenderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [showTenderInvitationForm, setShowTenderInvitationForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTenderForUpload, setSelectedTenderForUpload] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [tenderUploads, setTenderUploads] = useState({}); // Store uploaded files per tender

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

      {/* Tender Management Graphs */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-6 w-6 text-indigo-600" />
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Analytics
            </p>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Tender Management Overview (2021-2025)
          </h2>
          <p className="text-slate-600">
            Annual tender statistics showing total tenders, awarded, pending, and rejected projects.
          </p>
        </div>

        {/* Bar Graph */}
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 p-6 lg:p-8">
          <div className="space-y-6">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-indigo-600"></div>
                <span className="text-sm font-medium text-slate-700">Total Tenders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-600"></div>
                <span className="text-sm font-medium text-slate-700">Awarded</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500"></div>
                <span className="text-sm font-medium text-slate-700">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-600"></div>
                <span className="text-sm font-medium text-slate-700">Rejected</span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="relative bg-white rounded-lg p-4">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-4 bottom-16 flex flex-col justify-between text-xs text-slate-500 pr-2 w-8">
                <span className="font-semibold">100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span className="font-semibold">0</span>
              </div>
              
              {/* Chart Container */}
              <div className="flex items-end justify-between gap-2 lg:gap-3 h-80 border-b-2 border-l-2 border-slate-300 pb-4 pl-10 pr-4 ml-10">
                {tenderYearlyData.map((data, index) => {
                  const maxValue = Math.max(...tenderYearlyData.map(d => d.total));
                  const totalHeight = (data.total / maxValue) * 100;
                  const awardedPercent = (data.awarded / data.total) * 100;
                  const pendingPercent = (data.pending / data.total) * 100;
                  const rejectedPercent = (data.rejected / data.total) * 100;

                  return (
                    <div key={data.year} className="flex-1 flex flex-col items-center gap-2 group relative h-full max-w-[120px]">
                      {/* Bars Container - Stacked Bar */}
                      <div className="w-full flex flex-col items-end justify-end h-full">
                        <div
                          className="w-full rounded-t-lg transition-all duration-500 ease-out hover:shadow-xl hover:scale-105 relative overflow-hidden border-2 border-slate-400 shadow-md"
                          style={{ height: `${Math.max(totalHeight, 5)}%`, minHeight: '40px' }}
                          title={`${data.year}: Total ${data.total} tenders`}
                        >
                          {/* Stacked segments from bottom to top */}
                          {/* Awarded (Green) - Bottom */}
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-green-600 transition-all duration-500 ease-out border-t border-green-700"
                            style={{ height: `${awardedPercent}%` }}
                            title={`Awarded: ${data.awarded}`}
                          ></div>
                          {/* Pending (Amber) - Middle */}
                          <div
                            className="absolute left-0 right-0 bg-amber-500 transition-all duration-500 ease-out border-t border-amber-600"
                            style={{ 
                              bottom: `${awardedPercent}%`,
                              height: `${pendingPercent}%`
                            }}
                            title={`Pending: ${data.pending}`}
                          ></div>
                          {/* Rejected (Red) - Top */}
                          <div
                            className="absolute left-0 right-0 bg-red-600 transition-all duration-500 ease-out border-t border-red-700"
                            style={{ 
                              bottom: `${awardedPercent + pendingPercent}%`,
                              height: `${rejectedPercent}%`
                            }}
                            title={`Rejected: ${data.rejected}`}
                          ></div>
                        </div>
                      </div>

                      {/* Year Label */}
                      <div className="text-center mt-2 w-full">
                        <div className="text-sm font-bold text-slate-900">{data.year}</div>
                        <div className="text-xs text-slate-600 mt-1 font-medium">
                          {data.total} total
                        </div>
                      </div>

                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-20 shadow-xl">
                        <div className="font-semibold mb-1.5 border-b border-slate-700 pb-1">{data.year} Statistics</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                            <span>Total: <strong>{data.total}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span>Awarded: <strong>{data.awarded}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <span>Pending: <strong>{data.pending}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <span>Rejected: <strong>{data.rejected}</strong></span>
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-indigo-700">
                  {tenderYearlyData.reduce((sum, d) => sum + d.total, 0)}
                </div>
                <div className="text-sm text-indigo-600 font-medium mt-1">Total Tenders</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {tenderYearlyData.reduce((sum, d) => sum + d.awarded, 0)}
                </div>
                <div className="text-sm text-green-600 font-medium mt-1">Awarded</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-700">
                  {tenderYearlyData.reduce((sum, d) => sum + d.pending, 0)}
                </div>
                <div className="text-sm text-amber-600 font-medium mt-1">Pending</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-700">
                  {tenderYearlyData.reduce((sum, d) => sum + d.rejected, 0)}
                </div>
                <div className="text-sm text-red-600 font-medium mt-1">Rejected</div>
              </div>
            </div>
          </div>
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
            const handleStepClick = () => {
              setActiveStep(index);
              // Navigate to evaluation page when clicking on step 3 (Evaluation & Award)
              if (index === 2) {
                navigate("/tender/evaluation", {
                  state: {
                    tender: selectedTenderId ? tenders.find((t) => t.id === selectedTenderId) : null,
                  },
                });
              }
            };
            return (
              <button
                key={step.title}
                onClick={handleStepClick}
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
                      {index === 2 ? "View evaluation results →" : "View requirements →"}
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
                  "Upload",
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
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedTenderForUpload(row);
                        setUploadFiles([]);
                        setShowUploadModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                    >
                      <CloudArrowUpIcon className="h-4 w-4" />
                      Upload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Upload Modal */}
      {showUploadModal && selectedTenderForUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Upload Documents
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Upload documents for{" "}
                    <span className="font-semibold">{selectedTenderForUpload.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedTenderForUpload(null);
                    setUploadFiles([]);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <XMarkIcon className="h-6 w-6 text-slate-600" />
                </button>
              </div>

              {/* Tender Info */}
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-indigo-900">Tender:</span>
                    <p className="text-indigo-700">{selectedTenderForUpload.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-900">Client:</span>
                    <p className="text-indigo-700">{selectedTenderForUpload.client}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-900">Project Manager:</span>
                    <p className="text-indigo-700">{selectedTenderForUpload.owner}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-900">Status:</span>
                    <p className="text-indigo-700">{selectedTenderForUpload.status}</p>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Documents *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-indigo-400 transition">
                  <input
                    type="file"
                    id="tender-docs-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg,.dxf,.zip,.rar"
                    multiple
                    onChange={(e) => {
                      const fileArray = Array.from(e.target.files);
                      const maxSize = 10 * 1024 * 1024; // 10 MB per file
                      const oversizedFiles = fileArray.filter(file => file.size > maxSize);
                      
                      if (oversizedFiles.length > 0) {
                        alert(`The following file(s) exceed the 10 MB limit:\n${oversizedFiles.map(f => f.name).join('\n')}\n\nPlease select files smaller than 10 MB.`);
                        return;
                      }
                      
                      setUploadFiles((prev) => [...prev, ...fileArray]);
                    }}
                  />
                  <label
                    htmlFor="tender-docs-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <ArrowUpTrayIcon className="h-12 w-12 text-slate-400 mb-3" />
                    <p className="text-sm text-slate-600 mb-1">
                      Click to upload or drag and drop documents
                    </p>
                    <p className="text-xs text-slate-500">
                      PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, DWG, DXF, ZIP, RAR (Max 10MB per file)
                    </p>
                  </label>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadFiles.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Files to Upload ({uploadFiles.length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uploadFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <PaperClipIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-700 truncate">{file.name}</span>
                          <span className="text-xs text-slate-500 flex-shrink-0">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setUploadFiles((prev) => prev.filter((_, i) => i !== index));
                          }}
                          className="text-red-600 hover:text-red-700 flex-shrink-0 ml-2"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Documents */}
              {tenderUploads[selectedTenderForUpload.id] && tenderUploads[selectedTenderForUpload.id].length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Previously Uploaded Documents ({tenderUploads[selectedTenderForUpload.id].length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {tenderUploads[selectedTenderForUpload.id].map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <PaperClipIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-slate-700 truncate">
                            {file.name || `Document ${index + 1}`}
                          </span>
                          {file.size && (
                            <span className="text-xs text-slate-500 flex-shrink-0">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedTenderForUpload(null);
                    setUploadFiles([]);
                  }}
                  className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (uploadFiles.length === 0) {
                      alert("Please select at least one file to upload.");
                      return;
                    }

                    // Save uploaded files to state
                    setTenderUploads((prev) => ({
                      ...prev,
                      [selectedTenderForUpload.id]: [
                        ...(prev[selectedTenderForUpload.id] || []),
                        ...uploadFiles,
                      ],
                    }));

                    alert(`Successfully uploaded ${uploadFiles.length} document(s) for ${selectedTenderForUpload.name}.`);
                    setShowUploadModal(false);
                    setSelectedTenderForUpload(null);
                    setUploadFiles([]);
                  }}
                  disabled={uploadFiles.length === 0}
                  className={`px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-lg hover:shadow-xl transition flex items-center gap-2 font-semibold ${
                    uploadFiles.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <CloudArrowUpIcon className="h-5 w-5" />
                  Upload Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



