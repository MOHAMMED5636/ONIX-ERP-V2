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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-fadeIn">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
          onClick={handleBackdropClick}
        />
        
        {/* Modal */}
        <div 
          ref={modalRef}
          className="relative bg-white border-0 rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 animate-scaleIn"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header */}
          <div 
            className="p-4 rounded-t-2xl border-b border-gray-100"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="font-semibold text-white text-sm">
                  Select Date Range
                </span>
              </div>
              <button 
                onClick={() => setShowPicker(false)}
                className="text-white hover:text-gray-200 text-xl font-bold transition-all duration-200 hover:scale-110 hover:bg-white hover:bg-opacity-20 rounded-full w-6 h-6 flex items-center justify-center"
                type="button"
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Calendar */}
          <div className="p-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
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
                rangeColors={['#667eea']}
                showMonthAndYearPickers={true}
                editableDateInputs={false}
                preventSnapRefocus={true}
                calendarFocus="forwards"
                dragSelectionEnabled={true}
                className="custom-date-range"
              />
            </div>
          </div>
          
          {/* Footer */}
          <div 
            className="p-4 rounded-b-2xl"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}
          >
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                <span className="text-xs text-gray-600 font-medium">
                  Click and drag to select a date range
                </span>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              
              {start && end && (
                <div 
                  className="bg-white rounded-xl p-3 border-0 shadow-lg transform transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.05)'
                  }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="text-blue-600 font-semibold text-sm">
                      {format(start, 'MMM d, yyyy')} – {format(end, 'MMM d, yyyy')}
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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


