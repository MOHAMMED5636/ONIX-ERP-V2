import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const TimelineCell = ({ value, onChange, hasPredecessors = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const start = value?.[0] ? new Date(value[0]) : null;
  const end = value?.[1] ? new Date(value[1]) : null;
  
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
        <div className="absolute z-50 bg-white border rounded shadow-lg mt-2">
          <DateRange
            ranges={[{
              startDate: start || new Date(),
              endDate: end || new Date(),
              key: 'selection'
            }]}
            onChange={ranges => {
              const { startDate, endDate } = ranges.selection;
              onChange([startDate, endDate]);
              setShowPicker(false);
            }}
            moveRangeOnFirstSelection={false}
            rangeColors={['#3B82F6']}
            showMonthAndYearPickers={true}
            editableDateInputs={true}
          />
        </div>
      )}
    </div>
  );
};

export default TimelineCell;


