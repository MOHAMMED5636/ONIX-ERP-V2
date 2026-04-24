import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import * as feedbackSurveyAPI from "../../../services/feedbackSurveyAPI";

const Q_TYPES = [
  "SHORT_TEXT",
  "LONG_TEXT",
  "NUMBER",
  "EMAIL",
  "PHONE",
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "DROPDOWN",
  "DATE",
  "TIME",
  "FILE",
  "RATING",
  "LINEAR_SCALE",
  "MATRIX",
];

function normalizeLoadedSurvey(data) {
  const secs = (data.sections && data.sections.length ? data.sections : []).map((s, idx) => ({
    id: s.id || `sec-${idx}`,
    title: s.title || `Section ${idx + 1}`,
    description: s.description || "",
    order: typeof s.order === "number" ? s.order : idx,
    questions: (s.questions || []).map((q, qi) => ({
      id: q.id,
      questionText: q.questionText || "",
      description: q.description || "",
      questionType: (q.questionType || "SHORT_TEXT").toUpperCase(),
      options: Array.isArray(q.options) ? q.options : [],
      isRequired: q.isRequired !== false,
      placeholder: q.placeholder || "",
      order: typeof q.order === "number" ? q.order : qi,
      config: q.config || null,
      validation: q.validation || null,
    })),
  }));
  return {
    title: data.title || "",
    description: data.description || "",
    department: data.department || "",
    sections: secs.length
      ? secs
      : [
          {
            id: "sec-0",
            title: "General",
            description: "",
            order: 0,
            questions: (data.questions || []).map((q, qi) => ({
              id: q.id,
              questionText: q.questionText || "",
              description: q.description || "",
              questionType: (q.questionType || "SHORT_TEXT").toUpperCase(),
              options: Array.isArray(q.options) ? q.options : [],
              isRequired: q.isRequired !== false,
              placeholder: q.placeholder || "",
              order: typeof q.order === "number" ? q.order : qi,
              config: q.config || null,
              validation: q.validation || null,
            })),
          },
        ],
    settings: data.settings || {},
    status: data.status || "DRAFT",
  };
}

export default function FormBuilderPage() {
  const { formId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ title: "", description: "", department: "", status: "" });
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [shareLinks, setShareLinks] = useState([]);
  const [shareBusy, setShareBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedbackSurveyAPI.getFeedbackSurvey(formId);
      const n = normalizeLoadedSurvey(res.data);
      setMeta({
        title: n.title,
        description: n.description,
        department: n.department,
        status: n.status,
      });
      setSections(n.sections);
      setSettings(n.settings || {});
      const sl = await feedbackSurveyAPI.listShareLinks(formId).catch(() => ({ data: [] }));
      setShareLinks(sl.data || []);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    load();
  }, [load]);

  const toPayload = () => ({
    title: meta.title,
    description: meta.description,
    department: meta.department || null,
    sections: sections.map((s, si) => ({
      title: s.title,
      description: s.description || null,
      order: typeof s.order === "number" ? s.order : si,
      questions: (s.questions || []).map((q, qi) => ({
        questionText: q.questionText,
        description: q.description || null,
        order: typeof q.order === "number" ? q.order : qi,
        questionType: q.questionType,
        options: ["MULTIPLE_CHOICE", "SINGLE_CHOICE", "DROPDOWN"].includes(q.questionType)
          ? (q.options || []).filter(Boolean)
          : null,
        isRequired: !!q.isRequired,
        placeholder: q.placeholder || null,
        config: q.config || undefined,
        validation: q.validation || undefined,
      })),
    })),
    settings: {
      allowMultipleSubmissions: !!settings.allowMultipleSubmissions,
      requireLogin: settings.requireLogin !== false,
      closingDate: settings.closingDate || null,
      notifyOnSubmit: !!settings.notifyOnSubmit,
      confirmationMessage: settings.confirmationMessage || null,
      allowEditAfterSubmit: !!settings.allowEditAfterSubmit,
    },
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await feedbackSurveyAPI.patchFeedbackSurvey(formId, toPayload());
      await load();
      alert("Saved.");
    } catch (e) {
      alert(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm("Publish this form and assign it to all staff roles?")) return;
    setSaving(true);
    try {
      await feedbackSurveyAPI.patchFeedbackSurvey(formId, toPayload());
      await feedbackSurveyAPI.publishFeedbackSurvey(formId);
      await load();
      alert("Published.");
    } catch (e) {
      alert(e.message || "Publish failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateShare = async () => {
    setShareBusy(true);
    try {
      await feedbackSurveyAPI.createShareLink(formId, { requireLogin: true });
      const sl = await feedbackSurveyAPI.listShareLinks(formId);
      setShareLinks(sl.data || []);
    } catch (e) {
      alert(e.message || "Could not create link");
    } finally {
      setShareBusy(false);
    }
  };

  const updateQuestion = (si, qi, patch) => {
    setSections((prev) => {
      const copy = prev.map((s) => ({ ...s, questions: [...s.questions] }));
      copy[si].questions[qi] = { ...copy[si].questions[qi], ...patch };
      return copy;
    });
  };

  const addQuestion = (si) => {
    setSections((prev) => {
      const copy = prev.map((s) => ({ ...s, questions: [...s.questions] }));
      copy[si].questions.push({
        id: `new-${Date.now()}`,
        questionText: "New question",
        description: "",
        questionType: "SHORT_TEXT",
        options: [],
        isRequired: true,
        placeholder: "",
        order: copy[si].questions.length,
        config: null,
        validation: null,
      });
      return copy;
    });
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}`,
        title: `Section ${prev.length + 1}`,
        description: "",
        order: prev.length,
        questions: [],
      },
    ]);
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading editor…</div>;
  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error}</p>
        <Link className="text-indigo-600" to="/workplace/feedbacks-survey">
          Back
        </Link>
      </div>
    );
  }

  const apiPublicFormUrl = (token) => {
    const root = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
    const trimmed = root.endsWith("/") ? root.slice(0, -1) : root;
    return `${trimmed}/public/forms/${token}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <Link to="/workplace/feedbacks-survey" className="text-sm text-indigo-600">
            ← Forms
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Form builder</h1>
          <p className="text-sm text-gray-500">Status: {meta.status}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={saving || meta.status === "PUBLISHED" || meta.status === "ACTIVE"}
            onClick={handlePublish}
            className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
          >
            Publish
          </button>
          <Link
            to={`/workplace/forms/${encodeURIComponent(formId)}/fill`}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 inline-flex items-center"
          >
            Preview
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border rounded-xl p-4 space-y-3">
            <label className="block text-sm font-medium">Title</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={meta.title}
              onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
            />
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 min-h-[80px]"
              value={meta.description}
              onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
            />
            <label className="block text-sm font-medium">Department</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={meta.department}
              onChange={(e) => setMeta((m) => ({ ...m, department: e.target.value }))}
            />
          </div>

          {sections.map((sec, si) => (
            <div key={sec.id} className="bg-white border rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center gap-2">
                <input
                  className="flex-1 font-semibold border rounded px-2 py-1"
                  value={sec.title}
                  onChange={(e) => {
                    const t = e.target.value;
                    setSections((prev) => prev.map((s, i) => (i === si ? { ...s, title: t } : s)));
                  }}
                />
                <button
                  type="button"
                  className="text-sm text-indigo-600"
                  onClick={() => addQuestion(si)}
                >
                  + Question
                </button>
              </div>
              <textarea
                className="w-full text-sm border rounded px-2 py-1"
                placeholder="Section description (optional)"
                value={sec.description}
                onChange={(e) => {
                  const t = e.target.value;
                  setSections((prev) => prev.map((s, i) => (i === si ? { ...s, description: t } : s)));
                }}
              />
              <div className="space-y-4">
                {(sec.questions || []).map((q, qi) => (
                  <div key={q.id || `${si}-${qi}`} className="border rounded-lg p-3 bg-gray-50 space-y-2">
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={q.questionText}
                      onChange={(e) => updateQuestion(si, qi, { questionText: e.target.value })}
                    />
                    <div className="flex flex-wrap gap-2">
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={q.questionType}
                        onChange={(e) => updateQuestion(si, qi, { questionType: e.target.value })}
                      >
                        {Q_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <label className="text-sm flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!!q.isRequired}
                          onChange={(e) => updateQuestion(si, qi, { isRequired: e.target.checked })}
                        />
                        Required
                      </label>
                    </div>
                    {["MULTIPLE_CHOICE", "SINGLE_CHOICE", "DROPDOWN"].includes(q.questionType) && (
                      <input
                        className="w-full text-sm border rounded px-2 py-1"
                        placeholder="Options comma-separated"
                        value={(q.options || []).join(", ")}
                        onChange={(e) =>
                          updateQuestion(si, qi, {
                            options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                          })
                        }
                      />
                    )}
                    <input
                      className="w-full text-sm border rounded px-2 py-1"
                      placeholder="Placeholder"
                      value={q.placeholder || ""}
                      onChange={(e) => updateQuestion(si, qi, { placeholder: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button type="button" onClick={addSection} className="text-indigo-600 text-sm font-medium">
            + Add section
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">Form settings</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!settings.allowMultipleSubmissions}
                onChange={(e) => setSettings((s) => ({ ...s, allowMultipleSubmissions: e.target.checked }))}
              />
              Allow multiple submissions
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.requireLogin !== false}
                onChange={(e) => setSettings((s) => ({ ...s, requireLogin: e.target.checked }))}
              />
              Require login
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!settings.notifyOnSubmit}
                onChange={(e) => setSettings((s) => ({ ...s, notifyOnSubmit: e.target.checked }))}
              />
              Notify owner on submit
            </label>
            <label className="block text-sm">Confirmation message</label>
            <textarea
              className="w-full border rounded px-2 py-1 text-sm"
              value={settings.confirmationMessage || ""}
              onChange={(e) => setSettings((s) => ({ ...s, confirmationMessage: e.target.value }))}
            />
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-2">
            <h2 className="font-semibold">Share</h2>
            <button
              type="button"
              disabled={shareBusy || meta.status !== "PUBLISHED"}
              onClick={handleCreateShare}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm disabled:opacity-40"
            >
              Create share link
            </button>
            <p className="text-xs text-gray-500">Share links are available after publish.</p>
            <ul className="text-xs space-y-1 break-all">
              {shareLinks.map((l) => (
                <li key={l.id}>
                  {l.isActive ? (
                    <span>{apiPublicFormUrl(l.token)}</span>
                  ) : (
                    <span className="text-gray-400">(revoked)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
