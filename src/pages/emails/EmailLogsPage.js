import React, { useEffect, useState } from "react";
import { EmailManagementAPI } from "../../services/emailManagementAPI";

export default function EmailLogsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, limit: 50 });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await EmailManagementAPI.listLogs({ page, limit: 50, status, q });
      setData(res.data || { items: [], total: 0, limit: 50 });
    } catch (e) {
      setError(e.message || "Failed to load logs");
      setData({ items: [], total: 0, limit: 50 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / (data.limit || 50)));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Logs</h1>
          <p className="text-sm text-gray-500">Sent/failed email history with error details.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            className="flex-1 min-w-[220px] border rounded-xl px-3 py-2"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by recipient / subject / template…"
          />
          <select
            className="border rounded-xl px-3 py-2 bg-white"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setPage(1);
              load();
            }}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
          >
            Search
          </button>
        </div>
      </div>

      {error ? <div className="mb-4 text-red-600">{error}</div> : null}

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold text-gray-800">
          {data.total || 0} records
        </div>
        {loading ? (
          <div className="p-6 text-gray-500">Loading…</div>
        ) : data.items.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-2">Time</th>
                  <th className="text-left px-4 py-2">Recipient</th>
                  <th className="text-left px-4 py-2">Subject</th>
                  <th className="text-left px-4 py-2">Template</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/20">
                    <td className="px-4 py-2 whitespace-nowrap">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-2">{r.recipientEmail}</td>
                    <td className="px-4 py-2 max-w-[320px] truncate" title={r.subject}>
                      {r.subject}
                    </td>
                    <td className="px-4 py-2">{r.template}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          r.status === "SENT"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 max-w-[420px] truncate" title={r.errorMessage || ""}>
                      {r.errorMessage || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-gray-500">No logs found.</div>
        )}

        <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
          <div>
            Page {page} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

