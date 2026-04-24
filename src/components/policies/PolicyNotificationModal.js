import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  EyeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { fetchPolicyFileBlob, downloadPolicyFile } from '../../services/policiesAPI';

function fileTypeLabel(policy) {
  const t = String(policy?.fileType || '').trim();
  return t || 'File';
}

function isPdfPolicy(policy) {
  const t = String(policy?.fileType || '').toUpperCase();
  if (t === 'PDF') return true;
  const n = String(policy?.fileName || '').toLowerCase();
  return n.endsWith('.pdf');
}

export default function PolicyNotificationModal({ open, policy, onClose, onAcknowledge, acknowledging }) {
  const [fileBusy, setFileBusy] = useState(false);
  const [fileErr, setFileErr] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const previewUrlRef = useRef(null);

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      window.URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }, []);

  const hasAttachment = Boolean(policy?.hasFile);
  const pdf = policy ? isPdfPolicy(policy) : false;

  const displayName = useMemo(() => {
    if (!policy) return '';
    return String(policy.fileName || '').trim() || `${policy.title || 'Policy'} attachment`;
  }, [policy]);

  useEffect(() => {
    if (!open) {
      setFileErr(null);
      setFileBusy(false);
      revokePreviewUrl();
    }
  }, [open, revokePreviewUrl]);

  useEffect(() => {
    return () => revokePreviewUrl();
  }, [revokePreviewUrl]);

  useEffect(() => {
    if (!open || !policy?.id) return;
    return () => revokePreviewUrl();
  }, [open, policy?.id, revokePreviewUrl]);

  const openPdfPreview = useCallback(async () => {
    if (!policy?.id) return;
    setFileErr(null);
    setFileBusy(true);
    try {
      const { blob } = await fetchPolicyFileBlob(policy.id);
      revokePreviewUrl();
      const url = window.URL.createObjectURL(blob);
      previewUrlRef.current = url;
      setPreviewUrl(url);
    } catch (e) {
      setFileErr(e?.message || 'Could not load attachment');
    } finally {
      setFileBusy(false);
    }
  }, [policy?.id, revokePreviewUrl]);

  const handleDownload = useCallback(async () => {
    if (!policy?.id) return;
    setFileErr(null);
    setFileBusy(true);
    try {
      await downloadPolicyFile(policy.id);
    } catch (e) {
      setFileErr(e?.message || 'Download failed');
    } finally {
      setFileBusy(false);
    }
  }, [policy?.id]);

  const handleOpenInNewTab = useCallback(async () => {
    if (!policy?.id) return;
    setFileErr(null);
    setFileBusy(true);
    try {
      const { blob } = await fetchPolicyFileBlob(policy.id);
      const url = window.URL.createObjectURL(blob);
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      if (!w) {
        window.URL.revokeObjectURL(url);
        setFileErr('Pop-up blocked — use Download instead.');
        return;
      }
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setFileErr(e?.message || 'Could not open attachment');
    } finally {
      setFileBusy(false);
    }
  }, [policy?.id]);

  if (!open || !policy) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="flex items-start justify-between gap-4 p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div>
            <p className="text-xs font-semibold opacity-90">Important policy notification</p>
            <h2 className="text-lg font-extrabold leading-tight">{policy.title}</h2>
            <p className="text-xs opacity-90 mt-1">
              Department: <span className="font-semibold">{policy.department}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/15"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{policy.description}</p>

          {hasAttachment && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-white p-2 shadow-sm border border-gray-100">
                  <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attached document</p>
                  <p className="text-sm font-bold text-gray-900 truncate" title={displayName}>
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fileTypeLabel(policy)}
                    {policy.fileSize && policy.fileSize !== '—' ? ` · ${policy.fileSize}` : ''}
                  </p>

                  {fileErr && <p className="text-xs text-red-600 mt-2">{fileErr}</p>}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {pdf && (
                      <button
                        type="button"
                        disabled={fileBusy}
                        onClick={() => (previewUrl ? revokePreviewUrl() : openPdfPreview())}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-800 text-xs font-bold hover:bg-gray-50 disabled:opacity-60"
                      >
                        <EyeIcon className="h-4 w-4" />
                        {previewUrl ? 'Hide preview' : 'Preview'}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={fileBusy}
                      onClick={handleOpenInNewTab}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-800 text-xs font-bold hover:bg-gray-50 disabled:opacity-60"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Open
                    </button>
                    <button
                      type="button"
                      disabled={fileBusy}
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-extrabold hover:bg-indigo-700 disabled:opacity-60"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      {fileBusy ? 'Working…' : 'Download'}
                    </button>
                  </div>
                </div>
              </div>

              {pdf && previewUrl && (
                <div className="mt-3 rounded-lg border border-gray-200 overflow-hidden bg-white">
                  <iframe title="Policy PDF preview" className="w-full h-[360px]" src={previewUrl} />
                </div>
              )}
            </div>
          )}

          {policy.createdBy?.name && (
            <p className="text-xs text-gray-500 mt-3">
              Created by: <span className="font-medium text-gray-700">{policy.createdBy.name}</span>
            </p>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-white"
          >
            Later
          </button>
          <button
            type="button"
            disabled={acknowledging}
            onClick={onAcknowledge}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-extrabold shadow hover:from-green-700 hover:to-emerald-700 disabled:opacity-60"
          >
            <CheckCircleIcon className="h-5 w-5" />
            {acknowledging ? 'Acknowledging…' : 'Acknowledge'}
          </button>
        </div>
      </div>
    </div>
  );
}
