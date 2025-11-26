import React, { useState } from "react";
import { Link } from "react-router-dom";

const lifecycleSteps = [
  {
    title: "Tender Notice",
    description:
      "Publish project scope, eligibility criteria, and submission checklist for interested contractors.",
    detail:
      "All notices follow Dubai Municipality compliance and reference codes.",
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
  },
  {
    name: "Residential Tower – Marina",
    client: "Emerald Properties",
    date: "Nov 24, 2025",
    owner: "Noura",
    status: "Client Clarification",
  },
  {
    name: "Community School Campus",
    client: "Knowledge Fund",
    date: "Dec 1, 2025",
    owner: "Samir",
    status: "Final Review",
  },
];

export default function TenderPage() {
  const [activeStep, setActiveStep] = useState(0);

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.description}
                </p>
                <span className="text-xs font-semibold text-indigo-600 mt-auto">
                  View requirements →
                </span>
              </button>
            );
          })}
        </div>
        <div className="rounded-2xl bg-white border border-indigo-50 p-5 text-sm text-slate-600 leading-relaxed shadow-sm">
          {lifecycleSteps[activeStep].detail}
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-4">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Tender Operations Board
            </h2>
            <p className="text-slate-600">
              Upcoming deadlines, owners, and live status for each opportunity.
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                {[
                  "Tender Name",
                  "Client",
                  "Submission Date",
                  "Owner",
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
                    <div className="flex gap-3 text-sm font-semibold text-indigo-600">
                      <Link to="#">View</Link>
                      <span className="text-slate-200">|</span>
                      <Link to="#">Update</Link>
                    </div>
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



