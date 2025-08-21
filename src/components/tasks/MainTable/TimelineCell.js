import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const TimelineCell = ({ value, onChange, hasPredecessors = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const start = value?.[0] ? new Date(value[0]) : null;
  const end = value?.[1] ? new Date(value[1]) : null;
  
  // Safety check for onChange function
  const handleChange = (newValue) => {
    if (typeof onChange === 'function') {
      onChange(newValue);
    } else {
      console.warn('TimelineCell: onChange is not a function', onChange);
    }
  };
  
  return (
    <div className="relative inline-block">
      <button
        className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition ${
          hasPredecessors 
            ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300' 
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
        onClick={() => setShowPicker(v => !v)}
        title={hasPredecessors ? 'Timeline calculated from predecessors' : 'Set timeline manually'}
      >
        {start && end
          ? `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`
          : 'Set dates'}
        {hasPredecessors && (
          <span className="ml-1 text-xs">🔗</span>
        )}
      </button>
      {showPicker && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
            onClick={() => setShowPicker(false)}
          />
          {/* Calendar modal */}
          <div 
            className="fixed z-[9999] bg-white border rounded-lg shadow-2xl" 
            style={{ 
              width: 'auto',
              minWidth: 'auto',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div className="p-3 bg-gray-100 border-b rounded-t-lg flex justify-between items-center">
              <span className="text-sm font-medium">Select Date Range</span>
              <button 
                onClick={() => setShowPicker(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-2">
              <DateRange
                ranges={[{
                  startDate: start || new Date(),
                  endDate: end || new Date(),
                  key: 'selection'
                }]}
                onChange={ranges => {
                  const { startDate, endDate } = ranges.selection;
                  handleChange([startDate, endDate]);
                  setShowPicker(false);
                }}
                moveRangeOnFirstSelection={false}
                rangeColors={['#3B82F6']}
                showMonthAndYearPickers={true}
                editableDateInputs={true}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TimelineCell;


