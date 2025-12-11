import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  ChartBarIcon,
  DocumentTextIcon,
  StarIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function TenderContractorEvaluation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tender = location.state?.tender || {
    id: "metro-station",
    name: "Metro Station Expansion",
    client: "RTA Dubai",
    date: "Nov 22, 2025",
    owner: "Kaddour",
    status: "Under Evaluation",
  };

  // Questionnaire criteria
  const questionnaireCriteria = [
    {
      id: "timely_response",
      question: "Does the contractor respond on time?",
      description: "Evaluate the contractor's punctuality in responding to inquiries, requests, and communications.",
    },
    {
      id: "communication",
      question: "Is the contractor's communication clear and easy?",
      description: "Assess the clarity, professionalism, and effectiveness of the contractor's communication.",
    },
    {
      id: "pricing_accuracy",
      question: "Does the contractor provide realistic and fair market prices?",
      description: "Evaluate whether the contractor's pricing is competitive, realistic, and aligned with market standards.",
    },
    {
      id: "understanding_drawings",
      question: "Does the contractor correctly study and understand project drawings?",
      description: "Assess the contractor's ability to comprehend and interpret technical drawings accurately.",
    },
    {
      id: "understanding_specifications",
      question: "Does the contractor study and follow project specifications accurately?",
      description: "Evaluate the contractor's attention to detail and adherence to project specifications.",
    },
    {
      id: "active_registration",
      question: "Does the contractor have valid and active registration/licenses?",
      description: "Verify that the contractor has all necessary licenses, registrations, and certifications.",
    },
    {
      id: "resources_manpower",
      question: "Does the contractor have sufficient labor, engineers, and resources to execute the project?",
      description: "Assess the contractor's capacity, resources, and manpower to successfully complete the project.",
    },
  ];

  // Sample contractor evaluation data
  const [evaluationResults] = useState([
    {
      id: "contractor-1",
      name: "Aurora Contractors LLC",
      technicalScore: 92,
      commercialScore: 88,
      overallScore: 90,
      ranking: 1,
      status: "Recommended",
      price: "2,450,000 AED",
      technicalNotes: "Excellent technical proposal with comprehensive approach. Strong track record in similar projects.",
      commercialNotes: "Competitive pricing with good value proposition.",
      strengths: [
        "Strong technical expertise",
        "Proven track record",
        "Competitive pricing",
        "Excellent project management",
      ],
      weaknesses: [
        "Limited experience in metro projects",
        "Longer delivery timeline",
      ],
      evaluator: "Kaddour",
      evaluationDate: "2025-11-20",
    },
    {
      id: "contractor-2",
      name: "Elite Engineering Group",
      technicalScore: 85,
      commercialScore: 95,
      overallScore: 90,
      ranking: 2,
      status: "Recommended",
      price: "2,380,000 AED",
      technicalNotes: "Good technical proposal with solid methodology. Some areas need clarification.",
      commercialNotes: "Most competitive pricing in the market. Excellent value for money.",
      strengths: [
        "Best commercial offer",
        "Good technical approach",
        "Experienced team",
        "Flexible timeline",
      ],
      weaknesses: [
        "Some technical gaps",
        "Limited references",
      ],
      evaluator: "Noura",
      evaluationDate: "2025-11-20",
    },
    {
      id: "contractor-3",
      name: "Premier Construction Co.",
      technicalScore: 78,
      commercialScore: 82,
      overallScore: 80,
      ranking: 3,
      status: "Under Review",
      price: "2,650,000 AED",
      technicalNotes: "Adequate technical proposal but lacks some critical details.",
      commercialNotes: "Higher pricing compared to competitors.",
      strengths: [
        "Established company",
        "Good reputation",
        "Adequate resources",
      ],
      weaknesses: [
        "Higher price",
        "Technical proposal needs improvement",
        "Limited innovation",
      ],
      evaluator: "Samir",
      evaluationDate: "2025-11-19",
    },
    {
      id: "contractor-4",
      name: "Metro Builders Ltd.",
      technicalScore: 65,
      commercialScore: 75,
      overallScore: 70,
      ranking: 4,
      status: "Not Recommended",
      price: "2,800,000 AED",
      technicalNotes: "Technical proposal does not meet minimum requirements. Several critical gaps identified.",
      commercialNotes: "Highest pricing with limited value proposition.",
      strengths: [
        "Some relevant experience",
      ],
      weaknesses: [
        "Insufficient technical details",
        "Highest price",
        "Weak project management plan",
        "Limited resources",
      ],
      evaluator: "Kaddour",
      evaluationDate: "2025-11-19",
    },
  ]);

  // Questionnaire ratings state - contractorId -> criterionId -> rating (1-5)
  const [questionnaireRatings, setQuestionnaireRatings] = useState(() => {
    const initialRatings = {};
    evaluationResults.forEach((contractor) => {
      initialRatings[contractor.id] = {};
      questionnaireCriteria.forEach((criterion) => {
        // Initialize with 0 (unrated)
        initialRatings[contractor.id][criterion.id] = 0;
      });
    });
    return initialRatings;
  });

  const handleBack = () => {
    navigate("/tender");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Recommended":
        return "bg-green-100 text-green-700 border-green-200";
      case "Under Review":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Not Recommended":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getRankingBadge = (ranking) => {
    if (ranking === 1) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
          <TrophyIcon className="h-4 w-4" />
          <span className="text-sm font-bold">Winner</span>
        </div>
      );
    }
    return (
      <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
        <span className="text-sm font-semibold">#{ranking}</span>
      </div>
    );
  };

  // Calculate statistics
  const averageTechnicalScore = evaluationResults.reduce((sum, c) => sum + c.technicalScore, 0) / evaluationResults.length;
  const averageCommercialScore = evaluationResults.reduce((sum, c) => sum + c.commercialScore, 0) / evaluationResults.length;
  const averageOverallScore = evaluationResults.reduce((sum, c) => sum + c.overallScore, 0) / evaluationResults.length;
  const recommendedCount = evaluationResults.filter(c => c.status === "Recommended").length;

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
              Contractor Evaluation & Award
            </h1>
            <p className="text-slate-600 mt-3 max-w-3xl leading-relaxed">
              Evaluation results and recommendations for{" "}
              <span className="font-semibold text-indigo-600">{tender?.name}</span>.
              Compare technical and commercial scores to make the final award decision.
            </p>
          </div>
        </div>

        {/* Tender Info Card */}
        <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                Tender Information
              </p>
              <h3 className="text-xl font-bold text-slate-900">{tender.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                <span>
                  <span className="font-semibold">Client:</span> {tender.client}
                </span>
                <span>
                  <span className="font-semibold">Project Manager:</span> {tender.owner}
                </span>
                <span>
                  <span className="font-semibold">Contractors Evaluated:</span> {evaluationResults.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
              <p className="text-xs font-semibold text-blue-600 uppercase">Avg Technical</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">{averageTechnicalScore.toFixed(1)}</p>
            <p className="text-xs text-blue-600 mt-1">Out of 100</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <ChartBarIcon className="h-5 w-5 text-green-600" />
              <p className="text-xs font-semibold text-green-600 uppercase">Avg Commercial</p>
            </div>
            <p className="text-2xl font-bold text-green-700">{averageCommercialScore.toFixed(1)}</p>
            <p className="text-xs text-green-600 mt-1">Out of 100</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <StarIcon className="h-5 w-5 text-purple-600" />
              <p className="text-xs font-semibold text-purple-600 uppercase">Avg Overall</p>
            </div>
            <p className="text-2xl font-bold text-purple-700">{averageOverallScore.toFixed(1)}</p>
            <p className="text-xs text-purple-600 mt-1">Out of 100</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="h-5 w-5 text-amber-600" />
              <p className="text-xs font-semibold text-amber-600 uppercase">Recommended</p>
            </div>
            <p className="text-2xl font-bold text-amber-700">{recommendedCount}</p>
            <p className="text-xs text-amber-600 mt-1">Contractors</p>
          </div>
        </div>
      </section>

      {/* Evaluation Results Table */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Evaluation Results
            </h2>
            <p className="text-slate-600">
              Detailed evaluation scores and recommendations for each contractor.
            </p>
          </div>
          <button className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition flex items-center gap-2">
            <DocumentTextIcon className="h-4 w-4" />
            Export Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left">Ranking</th>
                <th className="px-6 py-3 text-left">Contractor</th>
                <th className="px-6 py-3 text-center">Technical Score</th>
                <th className="px-6 py-3 text-center">Commercial Score</th>
                <th className="px-6 py-3 text-center">Overall Score</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {evaluationResults.map((contractor) => (
                <tr key={contractor.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    {getRankingBadge(contractor.ranking)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{contractor.name}</p>
                    <p className="text-xs text-slate-500">Evaluated by {contractor.evaluator}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(contractor.technicalScore)}`}>
                        {contractor.technicalScore}
                      </span>
                      <span className="text-xs text-slate-500">/100</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(contractor.commercialScore)}`}>
                        {contractor.commercialScore}
                      </span>
                      <span className="text-xs text-slate-500">/100</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-xl font-bold ${getScoreColor(contractor.overallScore)}`}>
                        {contractor.overallScore}
                      </span>
                      <span className="text-xs text-slate-500">/100</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{contractor.price}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full border font-medium ${getStatusColor(contractor.status)}`}>
                      {contractor.status === "Recommended" && <CheckCircleIcon className="h-4 w-4 mr-1" />}
                      {contractor.status === "Not Recommended" && <XCircleIcon className="h-4 w-4 mr-1" />}
                      {contractor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        // Open detailed view modal or navigate to detail page
                        alert(`View detailed evaluation for ${contractor.name}`);
                      }}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Contractor Evaluation Questionnaire */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <ClipboardDocumentCheckIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Contractor Evaluation Questionnaire
            </h2>
            <p className="text-slate-600">
              Rate each contractor on the following criteria using a 5-star rating system (★ = Poor, ★★★★★ = Excellent).
            </p>
          </div>
        </div>

        {/* Questionnaire for each contractor */}
        <div className="space-y-8">
          {evaluationResults.map((contractor) => (
            <div
              key={contractor.id}
              className="border-2 border-slate-200 rounded-2xl p-6 space-y-6 bg-gradient-to-br from-white to-slate-50"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{contractor.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {getRankingBadge(contractor.ranking)} • {contractor.price}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Overall Questionnaire Score</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {(() => {
                      const ratings = questionnaireRatings[contractor.id] || {};
                      const values = Object.values(ratings).filter(r => r > 0);
                      if (values.length === 0) return "0";
                      const avg = values.reduce((sum, r) => sum + r, 0) / values.length;
                      return (avg * 20).toFixed(0); // Convert to 0-100 scale
                    })()}
                    <span className="text-sm text-slate-500">/100</span>
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {questionnaireCriteria.map((criterion, index) => {
                  const rating = questionnaireRatings[contractor.id]?.[criterion.id] || 0;
                  
                  return (
                    <div
                      key={criterion.id}
                      className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-full w-6 h-6 flex items-center justify-center">
                              {index + 1}
                            </span>
                            <h4 className="text-base font-semibold text-slate-900">
                              {criterion.question}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500 ml-8 mt-1">
                            {criterion.description}
                          </p>
                        </div>
                        {rating > 0 && (
                          <div className="ml-4">
                            <span className="text-sm font-bold text-indigo-600">
                              {rating}/5
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 5-Star Rating */}
                      <div className="flex items-center gap-2 ml-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              setQuestionnaireRatings((prev) => ({
                                ...prev,
                                [contractor.id]: {
                                  ...prev[contractor.id],
                                  [criterion.id]: star,
                                },
                              }));
                            }}
                            className="focus:outline-none transition-transform hover:scale-110"
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          >
                            {star <= rating ? (
                              <StarIconSolid className="h-8 w-8 text-yellow-400" />
                            ) : (
                              <StarIcon className="h-8 w-8 text-slate-300 hover:text-yellow-300" />
                            )}
                          </button>
                        ))}
                        <span className="ml-4 text-xs text-slate-500">
                          {rating === 0 && "Click to rate"}
                          {rating === 1 && "Poor"}
                          {rating === 2 && "Fair"}
                          {rating === 3 && "Good"}
                          {rating === 4 && "Very Good"}
                          {rating === 5 && "Excellent"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary for this contractor */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    Criteria Rated:{" "}
                    <span className="font-semibold text-slate-900">
                      {Object.values(questionnaireRatings[contractor.id] || {}).filter(r => r > 0).length} / {questionnaireCriteria.length}
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      // Reset ratings for this contractor
                      setQuestionnaireRatings((prev) => ({
                        ...prev,
                        [contractor.id]: {},
                      }));
                    }}
                    className="text-xs text-red-600 hover:text-red-700 hover:underline"
                  >
                    Reset Ratings
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Questionnaire Instructions */}
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <ClipboardDocumentCheckIcon className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-indigo-900 mb-2">Rating Guidelines</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>★☆☆☆☆ (1 star) - Poor: Does not meet expectations</li>
                <li>★★☆☆☆ (2 stars) - Fair: Below average, needs improvement</li>
                <li>★★★☆☆ (3 stars) - Good: Meets basic requirements</li>
                <li>★★★★☆ (4 stars) - Very Good: Exceeds expectations</li>
                <li>★★★★★ (5 stars) - Excellent: Outstanding performance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Evaluation Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {evaluationResults.map((contractor) => (
          <div
            key={contractor.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {getRankingBadge(contractor.ranking)}
                  <h3 className="text-xl font-semibold text-slate-900">{contractor.name}</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Evaluated by {contractor.evaluator} on {new Date(contractor.evaluationDate).toLocaleDateString()}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full border font-medium ${getStatusColor(contractor.status)}`}>
                {contractor.status === "Recommended" && <CheckCircleIcon className="h-4 w-4 mr-1" />}
                {contractor.status === "Not Recommended" && <XCircleIcon className="h-4 w-4 mr-1" />}
                {contractor.status}
              </span>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Technical</p>
                <p className={`text-2xl font-bold ${getScoreColor(contractor.technicalScore)}`}>
                  {contractor.technicalScore}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Commercial</p>
                <p className={`text-2xl font-bold ${getScoreColor(contractor.commercialScore)}`}>
                  {contractor.commercialScore}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Overall</p>
                <p className={`text-2xl font-bold ${getScoreColor(contractor.overallScore)}`}>
                  {contractor.overallScore}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Bid Price</p>
              <p className="text-xl font-bold text-slate-900">{contractor.price}</p>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Technical Notes</p>
                <p className="text-sm text-slate-700">{contractor.technicalNotes}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Commercial Notes</p>
                <p className="text-sm text-slate-700">{contractor.commercialNotes}</p>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase mb-2 flex items-center gap-1">
                  <CheckCircleIcon className="h-4 w-4" />
                  Strengths
                </p>
                <ul className="space-y-1">
                  {contractor.strengths.map((strength, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase mb-2 flex items-center gap-1">
                  <XCircleIcon className="h-4 w-4" />
                  Weaknesses
                </p>
                <ul className="space-y-1">
                  {contractor.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Action Buttons */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={handleBack}
            className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Tender
          </button>
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5" />
              Generate Award Letter
            </button>
            <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-lg hover:shadow-xl transition flex items-center gap-2 font-semibold">
              <TrophyIcon className="h-5 w-5" />
              Finalize Award
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

