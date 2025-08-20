import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const CalendarTest = () => {
  const [showPicker, setShowPicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Calendar Test</h2>
      
      <div className="relative inline-block">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowPicker(!showPicker)}
        >
          {dateRange[0].startDate && dateRange[0].endDate
            ? `${format(dateRange[0].startDate, 'MMM d')} – ${format(dateRange[0].endDate, 'MMM d')}`
            : 'Select Dates'}
        </button>
        
        {showPicker && (
          <div className="absolute z-50 bg-white border rounded shadow-lg mt-2">
            <DateRange
              ranges={dateRange}
              onChange={item => setDateRange([item.selection])}
              moveRangeOnFirstSelection={false}
              rangeColors={['#3B82F6']}
              showMonthAndYearPickers={true}
              editableDateInputs={true}
            />
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p>Selected dates: {JSON.stringify(dateRange)}</p>
      </div>
    </div>
  );
};

export default CalendarTest;

