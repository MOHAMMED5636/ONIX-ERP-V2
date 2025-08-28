import React, { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const TimelineCell = ({ value, onChange, hasPredecessors = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const buttonRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();
  
  const start = value?.[0] ? new Date(value[0]) : null;
  const end = value?.[1] ? new Date(value[1]) : null;
  
  // Safety check for onChange function
  const handleChange = (newValue) => {
    if (typeof onChange === 'function') {
      onChange(newValue);
    }
  };
  
  // Handle button click
  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPicker(true);
  };
  
  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowPicker(false);
    }
  };
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showPicker) {
        setShowPicker(false);
      }
    };
    
    if (showPicker) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showPicker]);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPicker && 
          modalRef.current && 
          !modalRef.current.contains(event.target) && 
          buttonRef.current && 
          !buttonRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPicker]);
  
  // Render modal using portal
  const renderModal = () => {
    if (!showPicker) return null;
    
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-30"
          onClick={handleBackdropClick}
        />
        
        {/* Modal */}
        <div 
          ref={modalRef}
          className="relative bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm w-full mx-4"
        >
          {/* Header */}
          <div className="p-2 bg-gray-100 border-b border-gray-200 rounded-t-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 text-sm">
                Select Date Range
              </span>
              <button 
                onClick={() => setShowPicker(false)}
                className="text-gray-500 hover:text-gray-700 text-lg font-bold"
                type="button"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Calendar */}
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
              }}
              moveRangeOnFirstSelection={false}
              rangeColors={['#3B82F6']}
              showMonthAndYearPickers={true}
              editableDateInputs={false}
              preventSnapRefocus={true}
              calendarFocus="forwards"
              dragSelectionEnabled={true}
            />
          </div>
          
          {/* Footer */}
          <div className="p-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">
                Click and drag to select a date range
              </div>
              
              {start && end && (
                <div className="bg-white rounded p-1 border text-xs">
                  <div className="text-blue-600 font-medium">
                    {format(start, 'MMM d, yyyy')} – {format(end, 'MMM d, yyyy')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };
  
  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition ${
          hasPredecessors 
            ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300' 
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
        onClick={handleButtonClick}
        title={hasPredecessors ? 'Timeline calculated from predecessors' : 'Set timeline manually'}
      >
        {start && end
          ? `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`
          : 'Set dates'}
        {hasPredecessors && (
          <span className="ml-1 text-xs">🔗</span>
        )}
      </button>
      
      {renderModal()}
    </div>
  );
};

export default TimelineCell;


