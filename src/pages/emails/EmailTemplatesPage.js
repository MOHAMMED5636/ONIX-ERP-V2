import React, { useEffect, useMemo, useState } from "react";
import { EmailManagementAPI } from "../../services/emailManagementAPI";
import { EMAIL_PLACEHOLDER_GROUPS, flattenEmailPlaceholders } from "../../utils/emailPlaceholders";

const DEFAULT_TEMPLATE = {
  name: "",
  fromEmail: "",
  cc: "",
  bcc: "",
  subject: "Your ERP Login Details – ONIX Group",
  html: "<p>Hello %EmployeeName%,</p><p>Your ERP access has been created.</p>",
  variables: ["EmployeeName", "Email", "Password", "LoginURL", "CompanyName", "Department"],
  isActive: true,
};

export default function EmailTemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [testTo, setTestTo] = useState("");
  const [testVarsJson, setTestVarsJson] = useState("{\n  \"EmployeeName\": \"Test User\",\n  \"Email\": \"test@example.com\",\n  \"Password\": \"Temp1234\",\n  \"LoginURL\": \"https://erp.onixgroup.ae/login\",\n  \"CompanyName\": \"ONIX Group\",\n  \"Department\": \"\"\n}");
  const [activeField, setActiveField] = useState("html"); // subject | html
  const subjectRef = React.useRef(null);
  const htmlRef = React.useRef(null);
  const [placeholderOpen, setPlaceholderOpen] = useState(false);
  const [placeholderSearch, setPlaceholderSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await EmailManagementAPI.listTemplates();
      setRows(res.data || []);
    } catch (e) {
      setError(e.message || "Failed to load templates");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setEditing({ ...DEFAULT_TEMPLATE, _mode: "create" });
  };

  const startEdit = (row) => {
    let vars = [];
    try {
      vars = row.variables ? JSON.parse(row.variables) : [];
    } catch {
      vars = [];
    }
    setEditing({
      id: row.id,
      name: row.name || "",
      fromEmail: row.fromEmail || "",
      cc: row.cc || "",
      bcc: row.bcc || "",
      subject: row.subject || "",
      html: row.html || "",
      variables: Array.isArray(vars) ? vars : [],
      isActive: row.isActive !== false,
      _mode: "edit",
    });
  };

  const variablesHint = useMemo(() => {
    const v = editing?.variables || [];
    return v.length ? v.map((x) => `%${x}%`).join("  ") : "";
  }, [editing?.variables]);

  const placeholderFlat = useMemo(() => flattenEmailPlaceholders(), []);

  const filteredPlaceholderGroups = useMemo(() => {
    const q = placeholderSearch.trim().toLowerCase();
    if (!q) return EMAIL_PLACEHOLDER_GROUPS;
    return EMAIL_PLACEHOLDER_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter(
        (it) => it.label.toLowerCase().includes(q) || it.key.toLowerCase().includes(q)
      ),
    })).filter((g) => g.items.length > 0);
  }, [placeholderSearch]);

  const save = async () => {
    if (!editing?.name?.trim()) return alert("Name is required");
    if (!editing?.subject?.trim()) return alert("Subject is required");
    if (!editing?.html?.trim()) return alert("HTML is required");
    try {
      if (editing._mode === "create") {
        await EmailManagementAPI.createTemplate(editing);
      } else {
        await EmailManagementAPI.updateTemplate(editing.id, editing);
      }
      setEditing(null);
      await load();
    } catch (e) {
      alert(e.message || "Save failed");
    }
  };

  const insertPlaceholder = (key) => {
    if (!editing) return;
    const token = `%${key}%`;
    if (activeField === "subject") {
      const el = subjectRef.current;
      const start = el?.selectionStart ?? editing.subject.length;
      const end = el?.selectionEnd ?? editing.subject.length;
      const next = `${editing.subject.slice(0, start)}${token}${editing.subject.slice(end)}`;
      setEditing((p) => ({ ...p, subject: next }));
      setTimeout(() => {
        try {
          el?.focus();
          el?.setSelectionRange(start + token.length, start + token.length);
        } catch {}
      }, 0);
      return;
    }
    const el = htmlRef.current;
    const start = el?.selectionStart ?? editing.html.length;
    const end = el?.selectionEnd ?? editing.html.length;
    const next = `${editing.html.slice(0, start)}${token}${editing.html.slice(end)}`;
    setEditing((p) => ({ ...p, html: next }));
    setTimeout(() => {
      try {
        el?.focus();
        el?.setSelectionRange(start + token.length, start + token.length);
      } catch {}
    }, 0);
  };

  const insertFromPicker = (key) => {
    insertPlaceholder(key);
    setPlaceholderOpen(false);
    setPlaceholderSearch("");
  };

  const del = async (row) => {
    if (!window.confirm(`Delete template "${row.name}"?`)) return;
    try {
      await EmailManagementAPI.deleteTemplate(row.id);
      await load();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  const sendTest = async () => {
    if (!editing?.id) return alert("Save the template first.");
    if (!testTo.trim()) return alert("Enter a recipient email.");
    let vars = {};
    try {
      vars = JSON.parse(testVarsJson || "{}");
    } catch {
      return alert("Test variables JSON is invalid.");
    }
    try {
      await EmailManagementAPI.testTemplate(editing.id, { toEmail: testTo.trim(), variables: vars });
      alert("Test email sent.");
    } catch (e) {
      alert(e.message || "Test failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-xs text-gray-500">Email Management</div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startNew}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            + New Template
          </button>
        </div>
      </div>

      {error ? <div className="mb-4 text-red-600">{error}</div> : null}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-12">
          {/* Left list */}
          <div className="lg:col-span-3 border-r">
            <div className="px-4 py-3 border-b font-semibold text-gray-800">Templates</div>
            <div className="divide-y max-h-[78vh] overflow-auto">
              {loading ? (
                <div className="p-4 text-gray-500">Loading…</div>
              ) : rows.length ? (
                rows.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => startEdit(r)}
                    className={`w-full text-left p-4 hover:bg-indigo-50/30 ${
                      editing?.id === r.id ? "bg-indigo-50/60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{r.name}</div>
                        <div className="text-xs text-gray-500 truncate">{r.subject}</div>
                        <div className="text-xs mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full ${
                              r.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {r.isActive ? "Active" : "Disabled"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <span
                          className="text-red-600 text-xs font-semibold"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            del(r);
                          }}
                        >
                          Delete
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-gray-500">No templates yet.</div>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-9">
            {!editing ? (
              <div className="p-8 text-gray-500">Select a template, or click “New Template”.</div>
            ) : (
              <div className="p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="font-semibold text-gray-900">Template editor</div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={editing.isActive !== false}
                        onChange={(e) => setEditing((p) => ({ ...p, isActive: e.target.checked }))}
                      />
                      Enabled
                    </label>
                    <button
                      type="button"
                      onClick={save}
                      className="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Template Name*</label>
                    <input
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={editing.name}
                      onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">From</label>
                    <input
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={editing.fromEmail || ""}
                      onChange={(e) => setEditing((p) => ({ ...p, fromEmail: e.target.value }))}
                      placeholder="noreply@onixgroup.ae"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Cc</label>
                    <input
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={editing.cc || ""}
                      onChange={(e) => setEditing((p) => ({ ...p, cc: e.target.value }))}
                      placeholder="info@onixgroup.ae"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Bcc</label>
                    <input
                      className="mt-1 w-full border rounded-md px-3 py-2"
                      value={editing.bcc || ""}
                      onChange={(e) => setEditing((p) => ({ ...p, bcc: e.target.value }))}
                      placeholder=""
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-semibold text-gray-700">Subject*</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      ref={subjectRef}
                      className="flex-1 border rounded-md px-3 py-2"
                      value={editing.subject}
                      onFocus={() => setActiveField("subject")}
                      onChange={(e) => setEditing((p) => ({ ...p, subject: e.target.value }))}
                      placeholder='Invoice - %InvoiceNumber% from %CompanyName% for %ProjectName%'
                    />
                    <button
                      type="button"
                      className="px-3 py-2 border rounded-md bg-white text-sm hover:bg-gray-50"
                      onClick={() => {
                        setActiveField("subject");
                        setPlaceholderOpen((s) => !s);
                      }}
                      title="Insert Placeholder"
                    >
                      Insert Placeholder ▾
                    </button>
                  </div>
                  {variablesHint ? <div className="text-xs text-gray-500 mt-1">Available: {variablesHint}</div> : null}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Email Content (HTML)*</label>
                    <button
                      type="button"
                      className="px-3 py-2 border rounded-md bg-white text-sm hover:bg-gray-50"
                      onClick={() => {
                        setActiveField("html");
                        setPlaceholderOpen((s) => !s);
                      }}
                      title="Insert Placeholder"
                    >
                      Insert Placeholder ▾
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-4">
                    <div>
                      <textarea
                        ref={htmlRef}
                        className="w-full border rounded-md px-3 py-2 font-mono text-xs min-h-[320px]"
                        value={editing.html}
                        onFocus={() => setActiveField("html")}
                        onChange={(e) => setEditing((p) => ({ ...p, html: e.target.value }))}
                      />
                    </div>
                    <div className="border rounded-md bg-gray-50 overflow-auto min-h-[320px]">
                      <div className="px-3 py-2 text-xs text-gray-500 border-b bg-white">
                        Preview
                      </div>
                      <div className="p-3" dangerouslySetInnerHTML={{ __html: editing.html || "" }} />
                    </div>
                  </div>
                </div>

                {/* Placeholder picker (dropdown panel) */}
                {placeholderOpen ? (
                  <div className="mt-4 border rounded-lg bg-white shadow-sm">
                    <div className="p-3 border-b flex items-center justify-between">
                      <div className="font-semibold text-sm text-gray-900">Insert Placeholder</div>
                      <button
                        type="button"
                        className="text-sm text-gray-500 hover:text-gray-800"
                        onClick={() => {
                          setPlaceholderOpen(false);
                          setPlaceholderSearch("");
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-3 border-b">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
                        <input
                          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
                          value={placeholderSearch}
                          onChange={(e) => setPlaceholderSearch(e.target.value)}
                          placeholder="Search"
                        />
                      </div>
                    </div>
                    <div className="max-h-[360px] overflow-auto p-3">
                      {filteredPlaceholderGroups.length ? (
                        filteredPlaceholderGroups.map((g) => (
                          <div key={g.group} className="mb-4 last:mb-0">
                            <div className="text-xs font-semibold text-gray-500 mb-2">{g.group}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {g.items.map((it) => (
                                <button
                                  key={`${g.group}-${it.key}`}
                                  type="button"
                                  className="text-left px-3 py-2 rounded-md hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-100 text-sm"
                                  onClick={() => insertFromPicker(it.key)}
                                  title={`%${it.key}%`}
                                >
                                  {it.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No placeholders found.</div>
                      )}
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 border-t pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">Send test email</div>
                      <div className="text-xs text-gray-500">Uses current saved template and variables JSON.</div>
                    </div>
                    <button
                      type="button"
                      onClick={sendTest}
                      className="px-4 py-2 rounded-md bg-gray-900 text-white font-semibold hover:bg-black"
                    >
                      Send test
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">To</label>
                      <input
                        className="mt-1 w-full border rounded-md px-3 py-2"
                        value={testTo}
                        onChange={(e) => setTestTo(e.target.value)}
                        placeholder="someone@onixgroup.ae"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700">Variables JSON</label>
                      <textarea
                        className="mt-1 w-full border rounded-md px-3 py-2 font-mono text-xs min-h-[140px]"
                        value={testVarsJson}
                        onChange={(e) => setTestVarsJson(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

