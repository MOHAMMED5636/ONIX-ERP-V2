import React, { useEffect, useMemo, useState } from "react";
import { EmailManagementAPI } from "../../services/emailManagementAPI";

const EVENT_KEYS = [
  "EMPLOYEE_CREATED_ERP_ACCESS",
  "PASSWORD_RESET",
  "FORM_SUBMITTED",
];

export default function EmailTriggersPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [tRes, trigRes] = await Promise.all([
        EmailManagementAPI.listTemplates(),
        EmailManagementAPI.listTriggers(),
      ]);
      setTemplates(tRes.data || []);
      setRows(trigRes.data || []);
    } catch (e) {
      setError(e.message || "Failed to load triggers");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const templateOptions = useMemo(() => templates.map((t) => ({ id: t.id, label: t.name })), [templates]);

  const startNew = () => {
    setEditing({
      _mode: "create",
      name: "",
      eventKey: EVENT_KEYS[0],
      templateId: templates[0]?.id || "",
      enabled: true,
      recipients: { to: "employee.email", cc: "", bcc: "" },
    });
  };

  const startEdit = (row) => {
    let recipients = { to: "", cc: "", bcc: "" };
    try {
      recipients = row.recipients ? JSON.parse(row.recipients) : recipients;
    } catch {
      recipients = recipients;
    }
    setEditing({
      _mode: "edit",
      id: row.id,
      name: row.name || "",
      eventKey: row.eventKey || EVENT_KEYS[0],
      templateId: row.templateId || "",
      enabled: row.enabled !== false,
      recipients,
    });
  };

  const save = async () => {
    if (!editing?.name?.trim()) return alert("Name is required");
    if (!editing?.templateId) return alert("Template is required");
    try {
      if (editing._mode === "create") await EmailManagementAPI.createTrigger(editing);
      else await EmailManagementAPI.updateTrigger(editing.id, editing);
      setEditing(null);
      await load();
    } catch (e) {
      alert(e.message || "Save failed");
    }
  };

  const del = async (row) => {
    if (!window.confirm(`Delete trigger \"${row.name}\"?`)) return;
    try {
      await EmailManagementAPI.deleteTrigger(row.id);
      await load();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Triggers</h1>
          <p className="text-sm text-gray-500">Map ERP events to templates (enable/disable, recipients).</p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          disabled={!templates.length}
          title={!templates.length ? "Create a template first" : ""}
        >
          + New Trigger
        </button>
      </div>

      {error ? <div className="mb-4 text-red-600">{error}</div> : null}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b font-semibold text-gray-800">Triggers</div>
          <div className="divide-y">
            {loading ? (
              <div className="p-4 text-gray-500">Loading…</div>
            ) : rows.length ? (
              rows.map((r) => (
                <div key={r.id} className="p-4 flex items-start justify-between gap-3 hover:bg-indigo-50/30">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{r.name}</div>
                    <div className="text-xs text-gray-500 truncate">{r.eventKey}</div>
                    <div className="text-xs mt-1">
                      <span className={`px-2 py-0.5 rounded-full ${r.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                        {r.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="text-indigo-600 text-sm font-semibold" onClick={() => startEdit(r)}>
                      Edit
                    </button>
                    <button className="text-red-600 text-sm font-semibold" onClick={() => del(r)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500">No triggers yet.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border rounded-2xl shadow-sm p-4">
          {!editing ? (
            <div className="text-gray-500 p-6">Select a trigger to edit, or create a new one.</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <input
                  className="mt-1 w-full border rounded-xl px-3 py-2"
                  value={editing.name}
                  onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Event Key</label>
                  <select
                    className="mt-1 w-full border rounded-xl px-3 py-2 bg-white"
                    value={editing.eventKey}
                    onChange={(e) => setEditing((p) => ({ ...p, eventKey: e.target.value }))}
                  >
                    {EVENT_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Template</label>
                  <select
                    className="mt-1 w-full border rounded-xl px-3 py-2 bg-white"
                    value={editing.templateId}
                    onChange={(e) => setEditing((p) => ({ ...p, templateId: e.target.value }))}
                  >
                    {templateOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={editing.enabled !== false}
                  onChange={(e) => setEditing((p) => ({ ...p, enabled: e.target.checked }))}
                />
                Enabled
              </label>

              <div>
                <label className="text-sm font-semibold text-gray-700">Recipients mapping (JSON)</label>
                <textarea
                  className="mt-1 w-full border rounded-xl px-3 py-2 font-mono text-xs min-h-[160px]"
                  value={JSON.stringify(editing.recipients || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const v = JSON.parse(e.target.value);
                      setEditing((p) => ({ ...p, recipients: v }));
                    } catch {
                      // ignore while typing
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: {`{ "to": "employee.email", "cc": "", "bcc": "" }`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={save}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

