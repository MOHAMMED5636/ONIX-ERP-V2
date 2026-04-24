import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import * as feedbackSurveyAPI from "../../../services/feedbackSurveyAPI";

export default function FormInsightsPage() {
  const { formId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedbackSurveyAPI.getSurveyAnalytics(formId);
      setData(res.data);
    } catch (e) {
      setError(e.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = async () => {
    try {
      const blob = await feedbackSurveyAPI.downloadSurveyCsv(formId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form-${formId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message || "Export failed");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading…</div>;
  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/workplace/feedbacks-survey" className="text-indigo-600">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <Link to="/workplace/feedbacks-survey" className="text-sm text-indigo-600">
            ← Forms
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Form insights</h1>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
        >
          Export CSV
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Submissions</p>
          <p className="text-2xl font-bold">{data?.totalSubmissions ?? 0}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Assigned</p>
          <p className="text-2xl font-bold">{data?.assignedUsers ?? 0}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-sm text-gray-500">Completion rate</p>
          <p className="text-2xl font-bold">{data?.completionRatePercent ?? 0}%</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-4">Per-question</h2>
        <ul className="space-y-4 text-sm">
          {(data?.perQuestion || []).map((row) => (
            <li key={row.questionId} className="border-b pb-3">
              <p className="font-medium text-gray-900">{row.questionText}</p>
              <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                {JSON.stringify(row, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
