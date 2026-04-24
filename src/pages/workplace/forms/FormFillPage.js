import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as feedbackSurveyAPI from "../../../services/feedbackSurveyAPI";

function renderQuestionInput(q, value, onChange) {
  const t = (q.questionType || "SHORT_TEXT").toUpperCase();
  const opts = Array.isArray(q.options) ? q.options : [];
  const v = value ?? "";

  if (t === "LONG_TEXT") {
    return (
      <textarea
        className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
        value={v}
        onChange={(e) => onChange(e.target.value)}
        placeholder={q.placeholder || ""}
      />
    );
  }
  if (t === "NUMBER" || t === "LINEAR_SCALE") {
    const cfg = q.config || {};
    const min = cfg.min ?? (t === "LINEAR_SCALE" ? 1 : undefined);
    const max = cfg.max ?? (t === "LINEAR_SCALE" ? 10 : undefined);
    return (
      <input
        type="number"
        className="w-full border rounded-lg px-3 py-2"
        value={v}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={q.placeholder || ""}
      />
    );
  }
  if (t === "EMAIL") {
    return (
      <input
        type="email"
        className="w-full border rounded-lg px-3 py-2"
        value={v}
        onChange={(e) => onChange(e.target.value)}
        placeholder={q.placeholder || ""}
      />
    );
  }
  if (t === "PHONE") {
    return (
      <input
        type="tel"
        className="w-full border rounded-lg px-3 py-2"
        value={v}
        onChange={(e) => onChange(e.target.value)}
        placeholder={q.placeholder || ""}
      />
    );
  }
  if (t === "DATE") {
    return <input type="date" className="w-full border rounded-lg px-3 py-2" value={v} onChange={(e) => onChange(e.target.value)} />;
  }
  if (t === "TIME") {
    return <input type="time" className="w-full border rounded-lg px-3 py-2" value={v} onChange={(e) => onChange(e.target.value)} />;
  }
  if (t === "SINGLE_CHOICE") {
    return (
      <div className="space-y-2">
        {opts.map((o) => (
          <label key={o} className="flex items-center gap-2">
            <input type="radio" name={q.id} checked={v === o} onChange={() => onChange(o)} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    );
  }
  if (t === "DROPDOWN") {
    return (
      <select className="w-full border rounded-lg px-3 py-2 bg-white" value={v} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {opts.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  if (t === "MULTIPLE_CHOICE") {
    const selected = v ? v.split("||").map((s) => s.trim()).filter(Boolean) : [];
    const toggle = (o) => {
      const set = new Set(selected);
      if (set.has(o)) set.delete(o);
      else set.add(o);
      onChange([...set].join("||"));
    };
    return (
      <div className="space-y-2">
        {opts.map((o) => (
          <label key={o} className="flex items-center gap-2">
            <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    );
  }
  if (t === "RATING") {
    const max = (q.config && q.config.max) || 5;
    const n = parseInt(v, 10) || 0;
    return (
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl ${n >= star ? "text-amber-400" : "text-gray-300"}`}
            onClick={() => onChange(String(star))}
          >
            ★
          </button>
        ))}
      </div>
    );
  }
  if (t === "MATRIX" || t === "FILE") {
    return (
      <textarea
        className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
        value={v}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t === "MATRIX" ? '{"row":"col"}' : "File path or URL (if applicable)"}
      />
    );
  }
  return (
    <input
      type="text"
      className="w-full border rounded-lg px-3 py-2"
      value={v}
      onChange={(e) => onChange(e.target.value)}
      placeholder={q.placeholder || ""}
    />
  );
}

export default function FormFillPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedbackSurveyAPI.getFeedbackSurvey(formId);
      const d = res.data;
      setSurvey(d);
      setAnswers(d.answers && typeof d.answers === "object" ? { ...d.answers } : {});
      const secs = Array.isArray(d.sections) && d.sections.length ? d.sections : [];
      setSections(secs);
      setSectionIndex(0);
    } catch (e) {
      setError(e.message || "Failed to load form");
      setSurvey(null);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = async (markComplete) => {
    setSaving(true);
    try {
      await feedbackSurveyAPI.postSurveySubmission(formId, { answers, markComplete });
      if (markComplete) {
        setDone(true);
      }
    } catch (e) {
      alert(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const current = sections[sectionIndex] || { questions: [] };
  const total = sections.length || 1;
  const isLast = sectionIndex >= total - 1;

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">
        Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8 max-w-lg mx-auto">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/workplace/feedbacks-survey" className="text-indigo-600">
          Back to forms
        </Link>
      </div>
    );
  }

  if (done) {
    const msg = survey?.settings?.confirmationMessage || "Thank you. Your response has been recorded.";
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Submitted</h1>
        <p className="text-gray-700 mb-6">{msg}</p>
        <Link to="/workplace/feedbacks-survey" className="text-indigo-600 font-medium">
          Back to forms
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{survey?.title}</h1>
          {survey?.description && <p className="text-gray-600 mt-2">{survey.description}</p>}
        </div>
        <Link to="/workplace/feedbacks-survey" className="text-sm text-indigo-600 shrink-0">
          Exit
        </Link>
      </div>

      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${((sectionIndex + 1) / total) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Section {sectionIndex + 1} of {total}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        {current.title && <h2 className="text-lg font-semibold mb-2">{current.title}</h2>}
        {current.description && <p className="text-sm text-gray-600 mb-4">{current.description}</p>}
        <div className="space-y-6">
          {(current.questions || []).map((q) => (
            <div key={q.id}>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                {q.questionText}
                {q.isRequired && <span className="text-red-500"> *</span>}
              </label>
              {q.description && <p className="text-xs text-gray-500 mb-2">{q.description}</p>}
              {renderQuestionInput(q, answers[q.id], (val) => setAnswers((prev) => ({ ...prev, [q.id]: val })))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <button
          type="button"
          disabled={sectionIndex === 0 || saving}
          onClick={() => setSectionIndex((i) => Math.max(0, i - 1))}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-40"
        >
          Previous
        </button>
        <div className="flex gap-2">
          {!isLast && (
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                await persist(false);
                setSectionIndex((i) => i + 1);
              }}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50"
            >
              Next
            </button>
          )}
          {isLast && (
            <button
              type="button"
              disabled={saving}
              onClick={() => persist(true)}
              className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
