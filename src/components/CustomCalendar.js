import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';

const CustomCalendar = ({ value, onChange, min, className = '' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [isOpen, setIsOpen] = useState(false);
  const calendarRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  useEffect(() => {
    if (value && value.trim() !== '') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        // Set current date to the selected date's month/year for better UX
        setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
      } else {
        setSelectedDate(null);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        // Add a small delay to prevent immediate closing
        setTimeout(() => {
          setIsOpen(false);
        }, 100);
      }
    };

    if (isOpen) {
      // Use a slight delay before adding the event listener
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateSelect = (date) => {
    if (date) {
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const minDate = min ? new Date(min) : null;
      
      if (!minDate || dateOnly >= new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) {
        setSelectedDate(dateOnly);
        const formattedDate = dateOnly.toISOString().split('T')[0];
        onChange(formattedDate);
        setIsOpen(false);
      }
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    setCurrentDate(todayOnly);
    handleDateSelect(todayOnly);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange('');
    setIsOpen(false);
  };

  const isToday = (date) => {
    const today = new Date();
    return date && date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date && date.toDateString() === selectedDate.toDateString();
  };

  const isDisabled = (date) => {
    if (!min || !date) return false;
    const minDate = new Date(min);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    return dateOnly < minDateOnly;
  };

  const formatDisplayDate = () => {
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      return selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    return '';
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      {/* Calendar Input */}
      <div 
        className="w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 border-gray-200 hover:border-purple-300 cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Calendar clicked, current isOpen:', isOpen, 'setting to:', !isOpen);
          setIsOpen(!isOpen);
        }}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm ${selectedDate ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedDate ? formatDisplayDate() : 'Select start date'}
          </span>
          <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs">📅</span>
          </div>
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-[99998]" onClick={() => setIsOpen(false)}></div>
      )}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-3xl shadow-2xl border-2 border-purple-200 z-[99999] transform transition-all duration-300 ease-out" style={{ zIndex: 99999 }}>
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 transform hover:scale-110"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 transform hover:scale-110"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3">
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-purple-700 h-12 flex items-center justify-center">
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={index} className="h-12 w-12"></div>;
                }

                const isCurrentDay = isToday(date);
                const isSelectedDay = isSelected(date);
                const isDisabledDay = isDisabled(date);

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    disabled={isDisabledDay}
                    className={`
                      h-12 w-12 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-110 flex items-center justify-center
                      ${isSelectedDay 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-110' 
                        : isCurrentDay
                        ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 border-2 border-purple-300'
                        : isDisabledDay
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:text-purple-700'
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Footer */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-t border-purple-200">
            <div className="flex items-center justify-between">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200"
              >
                Clear
              </button>
              <button
                onClick={handleToday}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomCalendar;
