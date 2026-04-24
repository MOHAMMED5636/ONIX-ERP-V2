import React, { useEffect, useState, useCallback } from 'react';
import { listSystemFeedbackAdmin, updateSystemFeedbackAdmin } from '../services/systemFeedbackAPI';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const STATUS_OPTIONS = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'];

export default function SystemFeedbackAdminPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState({ data: [], pagination: {} });
  const [expandedId, setExpandedId] = useState(null);
  const [notesDraft, setNotesDraft] = useState({});

  const load = useCallback(async () => {
    if (user?.role !== 'ADMIN') return;
    setLoading(true);
    setError('');
    try {
      const res = await listSystemFeedbackAdmin({ status: status || undefined, page, limit: 15 });
      setPayload(res);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [user?.role, status, page]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    load();
  }, [user?.role, load]);

  const patch = async (id, body) => {
    try {
      await updateSystemFeedbackAdmin(id, body);
      await load();
    } catch (e) {
      window.alert(e.message || 'Update failed');
    }
  };

  if (user?.role !== 'ADMIN') return null;

  const rows = payload.data || [];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <nav className="text-sm text-gray-500 mb-2">
        <Link to="/dashboard" className="text-indigo-600 hover:underline">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">System feedback</span>
      </nav>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System feedback</h1>
        <p className="text-sm text-gray-600 mt-1">
          Submissions from all users. Only administrators can access this page.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s || 'all'} value={s}>
              {s || 'All'}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => load()}
          className="text-sm text-indigo-600 font-medium hover:underline"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && !error && (
        <div className="space-y-4">
          {rows.length === 0 && <p className="text-gray-500">No feedback yet.</p>}
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
            >
              <button
                type="button"
                className="w-full text-left px-4 py-3 flex flex-wrap gap-2 items-start justify-between hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
              >
                <div>
                  <span className="text-xs font-mono text-gray-400">{row.id.slice(0, 8)}…</span>
                  <span className="ml-2 text-sm font-semibold text-gray-900">
                    {row.submitter?.firstName} {row.submitter?.lastName}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">{row.submitter?.email}</span>
                  <span className="text-xs text-gray-400 ml-2">{row.submitter?.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      row.status === 'OPEN'
                        ? 'bg-amber-100 text-amber-800'
                        : row.status === 'RESOLVED'
                          ? 'bg-green-100 text-green-800'
                          : row.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {row.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString() : ''}
                  </span>
                </div>
              </button>

              {expandedId === row.id && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/80 space-y-3">
                  {row.category && (
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Category:</span> {row.category}
                    </p>
                  )}
                  {row.pageUrl && (
                    <p className="text-sm break-all">
                      <span className="font-medium text-gray-700">Page:</span> {row.pageUrl}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap text-gray-800">{row.message}</p>
                  {row.screenshotUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Screenshot</p>
                      <a
                        href={row.screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 text-sm underline"
                      >
                        Open image
                      </a>
                      <img src={row.screenshotUrl} alt="Feedback" className="mt-2 max-h-64 rounded-lg border border-gray-200" />
                    </div>
                  )}
                  {row.adminNotes && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Admin notes:</span> {row.adminNotes}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 items-center pt-2">
                    <span className="text-sm font-medium text-gray-700">Set status:</span>
                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={row.status === s}
                        onClick={() => patch(row.id, { status: s })}
                        className="text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-40"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Admin notes</label>
                    <textarea
                      value={notesDraft[row.id] ?? row.adminNotes ?? ''}
                      onChange={(e) => setNotesDraft((d) => ({ ...d, [row.id]: e.target.value }))}
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      placeholder="Internal notes…"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        patch(row.id, {
                          adminNotes: notesDraft[row.id] ?? row.adminNotes ?? '',
                        })
                      }
                      className="mt-2 text-sm px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Save notes
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {payload.pagination && payload.pagination.pages > 1 && (
            <div className="flex gap-2 justify-center pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 py-1">
                Page {page} / {payload.pagination.pages}
              </span>
              <button
                type="button"
                disabled={page >= (payload.pagination.pages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
