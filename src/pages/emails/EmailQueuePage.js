import React, { useEffect, useState } from "react";
import { EmailManagementAPI } from "../../services/emailManagementAPI";

export default function EmailQueuePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [rows, setRows] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await EmailManagementAPI.listQueue({ status });
      setRows(res.data || []);
    } catch (e) {
      setError(e.message || "Failed to load queue");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const retry = async (id) => {
    try {
      await EmailManagementAPI.retryQueueItem(id);
      await load();
    } catch (e) {
      alert(e.message || "Retry failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Queue</h1>
          <p className="text-sm text-gray-500">Pending/background email jobs (manual retry supported).</p>
        </div>
        <div className="flex gap-2">
          <select
            className="border rounded-xl px-3 py-2 bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="SENT">Sent</option>
            <option value="SENDING">Sending</option>
          </select>
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="mb-4 text-red-600">{error}</div> : null}

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold text-gray-800">{rows.length} items</div>
        {loading ? (
          <div className="p-6 text-gray-500">Loading…</div>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-2">Scheduled</th>
                  <th className="text-left px-4 py-2">To</th>
                  <th className="text-left px-4 py-2">Subject</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Attempts</th>
                  <th className="text-left px-4 py-2">Last error</th>
                  <th className="text-left px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/20">
                    <td className="px-4 py-2 whitespace-nowrap">
                      {r.scheduledAt ? new Date(r.scheduledAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-2">{r.toEmail}</td>
                    <td className="px-4 py-2 max-w-[320px] truncate" title={r.subject}>
                      {r.subject}
                    </td>
                    <td className="px-4 py-2">{r.status}</td>
                    <td className="px-4 py-2">{r.attempts}</td>
                    <td className="px-4 py-2 max-w-[420px] truncate" title={r.lastError || ""}>
                      {r.lastError || ""}
                    </td>
                    <td className="px-4 py-2">
                      {r.status === "FAILED" || r.status === "PENDING" ? (
                        <button
                          type="button"
                          className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50"
                          onClick={() => retry(r.id)}
                        >
                          Retry
                        </button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-gray-500">No queue items.</div>
        )}
      </div>
    </div>
  );
}

