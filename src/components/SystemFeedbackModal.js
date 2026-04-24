import React, { useState } from 'react';
import { XMarkIcon, PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';
import { submitSystemFeedback } from '../services/systemFeedbackAPI';

const CATEGORIES = [
  { value: '', label: 'General' },
  { value: 'BUG', label: 'Bug / Error' },
  { value: 'UX', label: 'UX / Usability' },
  { value: 'FEATURE', label: 'Feature request' },
  { value: 'OTHER', label: 'Other' },
];

export default function SystemFeedbackModal({ isOpen, onClose, onSubmitted }) {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = message.trim();
    if (trimmed.length < 3) {
      setError('Please enter a short description (at least 3 characters).');
      return;
    }
    setSubmitting(true);
    try {
      await submitSystemFeedback({
        message: trimmed,
        category: category || undefined,
        pageUrl: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search || ''}` : '',
        screenshotFile: file || null,
      });
      setMessage('');
      setCategory('');
      setFile(null);
      if (onSubmitted) onSubmitted();
      onClose();
      window.alert('Thank you. Your feedback was submitted.');
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTakeScreenshot = async () => {
    setError('');
    setCapturing(true);
    try {
      // Capture only the app root so we get the ERP screen (not browser UI).
      const root = document.getElementById('root') || document.body;
      const canvas = await html2canvas(root, {
        useCORS: true,
        backgroundColor: '#ffffff',
        ignoreElements: (el) => el?.getAttribute?.('data-feedback-modal') === '1',
      });

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Failed to create screenshot');

      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotFile = new File([blob], `erp-screenshot-${ts}.png`, { type: 'image/png' });
      setFile(screenshotFile);
    } catch (e) {
      setError(e?.message || 'Failed to take screenshot');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" data-feedback-modal="1" data-html2canvas-ignore="true">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100"
        role="dialog"
        aria-labelledby="feedback-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
          <h2 id="feedback-modal-title" className="text-lg font-bold text-gray-900">
            Send feedback
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-white/80 hover:text-gray-800"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Describe the issue or suggestion. Optionally attach a screenshot (e.g. of the current page). Only administrators can
            view submissions.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value || 'general'} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[120px]"
              placeholder="What happened? What did you expect?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Screenshot (optional)</label>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleTakeScreenshot}
                disabled={capturing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 bg-white text-sm text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                title="Take screenshot"
              >
                <PhotoIcon className="h-5 w-5" />
                {capturing ? 'Taking screenshot…' : 'Screenshot'}
              </button>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 text-sm text-indigo-800 cursor-pointer hover:bg-indigo-50">
                <PhotoIcon className="h-5 w-5" />
                <span>{file ? file.name : 'Choose image…'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              {file && (
                <button type="button" onClick={() => setFile(null)} className="text-sm text-red-600 hover:underline">
                  Remove
                </button>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              {submitting ? 'Sending…' : 'Submit feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
