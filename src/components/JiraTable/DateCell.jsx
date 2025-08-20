import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon } from '@heroicons/react/24/outline';

export const DateCell = ({ value, onChange, placeholder = "Select date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleDateChange = (date) => {
    const formattedDate = date ? date.toISOString().split('T')[0] : '';
    onChange(formattedDate);
    setIsOpen(false);
  };

  const currentDate = value ? new Date(value) : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
      >
        <CalendarIcon className="h-4 w-4 text-gray-400" />
        <span className={currentDate ? 'text-gray-900' : 'text-gray-500'}>
          {currentDate ? currentDate.toLocaleDateString() : placeholder}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1">
          <DatePicker
            selected={currentDate}
            onChange={handleDateChange}
            inline
            dateFormat="yyyy-MM-dd"
            placeholderText={placeholder}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
};
