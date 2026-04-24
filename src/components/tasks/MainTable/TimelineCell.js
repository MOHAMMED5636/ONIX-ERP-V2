import React, { useState } from 'react';
import { format } from 'date-fns';

const TimelineCell = ({ value, onChange, hasPredecessors = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [fromDate, setFromDate] = useState(
    value?.[0] ? new Date(value[0]).toISOString().slice(0, 10) : ''
  );
  const [toDate, setToDate] = useState(
    value?.[1] ? new Date(value[1]).toISOString().slice(0, 10) : ''
  );

  const start = value?.[0] ? new Date(value[0]) : null;
  const end = value?.[1] ? new Date(value[1]) : null;

  const handleSave = () => {
    if (!fromDate || !toDate) {
      setShowPicker(false);
      return;
    }
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    if (typeof onChange === 'function') {
      onChange([startDate, endDate]);
    }
    setShowPicker(false);
  };
  
  return (
    <div className="relative inline-block">
      <button
        className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition ${
          hasPredecessors 
            ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300' 
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPicker(true);
        }}
        title={hasPredecessors ? 'Timeline calculated from predecessors' : 'Open timeline & filters'}
      >
        {start && end
          ? `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`
          : 'Timeline & Filters'}
        {hasPredecessors && (
          <span className="ml-1 text-xs">🔗</span>
        )}
      </button>
      {showPicker && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Timeline</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 text-xl"
                onClick={() => setShowPicker(false)}
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
            </div>
            {fromDate && toDate && (
              <div className="mb-4 text-xs text-gray-600">
                Selected:&nbsp;
                <span className="font-semibold">
                  {format(new Date(fromDate), 'MMM d, yyyy')} – {format(new Date(toDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-1 text-xs rounded-md border border-gray-300 text-gray-700"
                onClick={() => setShowPicker(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineCell;


