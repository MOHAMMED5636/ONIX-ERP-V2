import React, { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const TimelineCell = ({ value, onChange, hasPredecessors = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const buttonRef = useRef(null);
  const modalRef = useRef(null);
  
  const start = value?.[0] ? new Date(value[0]) : null;
  const end = value?.[1] ? new Date(value[1]) : null;
  
  // Initialize temp dates when picker opens
  useEffect(() => {
    if (showPicker) {
      setTempStartDate(start || new Date());
      setTempEndDate(end || new Date());
    }
  }, [showPicker, start, end]);
  
  // Safety check for onChange function
  const handleChange = (newValue) => {
    if (typeof onChange === 'function') {
      onChange(newValue);
    } else {
      console.warn('TimelineCell: onChange is not a function', onChange);
    }
  };
  
  // Calculate modal position
  const calculatePosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 };
    
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Simple modal size
    const modalWidth = 400;
    const modalHeight = 300;
    
    // Calculate position
    let left = rect.left;
    let top = rect.bottom + 10;
    
    // Adjust if modal would go off-screen
    if (left + modalWidth > viewportWidth) {
      left = viewportWidth - modalWidth - 10;
    }
    if (left < 10) {
      left = 10;
    }
    
    if (top + modalHeight > viewportHeight) {
      top = rect.top - modalHeight - 10;
    }
    if (top < 10) {
      top = 10;
    }
    
    return { top, left };
  };
  
  // Handle button click
  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const position = calculatePosition();
    setModalPosition(position);
    setShowPicker(true);
  };
  
  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowPicker(false);
    }
  };
  
  // Handle apply button click
  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      handleChange([tempStartDate, tempEndDate]);
      setShowPicker(false);
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    setShowPicker(false);
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
      <div className="fixed inset-0 z-[9999]">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-30"
          onClick={handleBackdropClick}
        />
        
        {/* Modal */}
        <div 
          ref={modalRef}
          className="absolute bg-white border border-gray-200 rounded-lg shadow-2xl"
          style={{ 
            top: `${modalPosition.top}px`,
            left: `${modalPosition.left}px`,
            width: '400px',
            maxHeight: '90vh',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div className="p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Select Date Range</span>
            <button 
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors"
              type="button"
            >
              ×
            </button>
          </div>
          
          {/* Calendar */}
          <div className="p-2">
            <DateRange
              ranges={[{
                startDate: tempStartDate || new Date(),
                endDate: tempEndDate || new Date(),
                key: 'selection'
              }]}
              onChange={ranges => {
                const { startDate, endDate } = ranges.selection;
                setTempStartDate(startDate);
                setTempEndDate(endDate);
              }}
              moveRangeOnFirstSelection={false}
              rangeColors={['#3B82F6']}
              showMonthAndYearPickers={true}
              editableDateInputs={true}
              preventSnapRefocus={true}
              calendarFocus="forwards"
            />
          </div>
          
          {/* Footer with buttons */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="text-xs text-gray-600">
              {tempStartDate && tempEndDate && (
                <span>
                  {format(tempStartDate, 'MMM d, yyyy')} - {format(tempEndDate, 'MMM d, yyyy')}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!tempStartDate || !tempEndDate}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                Apply
              </button>
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


