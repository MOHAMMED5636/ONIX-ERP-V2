import React, { useState, useRef, useEffect } from "react";

const StatusDropdown = ({ 
  currentStatus, 
  onStatusChange, 
  statusOptions = [
    { value: 'TO DO', label: 'TO DO', color: 'bg-gray-100 text-gray-700' },
    { value: 'IN PROGRESS', label: 'IN PROGRESS', color: 'bg-blue-100 text-blue-700' },
    { value: 'DONE', label: 'DONE', color: 'bg-green-100 text-green-700' }
  ],
  showExtraOptions = true,
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, position: 'bottom' });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const currentStatusConfig = statusOptions.find(option => option.value === currentStatus) || statusOptions[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = showExtraOptions ? 200 : 140;
      
      let position = 'bottom';
      let top = rect.bottom + 2;
      let left = rect.left;
      
      // Check if dropdown would go below viewport
      if (rect.bottom + dropdownHeight > viewportHeight) {
        position = 'top';
        top = rect.top - dropdownHeight - 2;
      }
      
      // Ensure dropdown doesn't go off screen horizontally
      const dropdownWidth = 160;
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 10;
      }
      
      setDropdownPosition({ top, left, position });
    }
  };

  const handleStatusSelect = (newStatus) => {
    onStatusChange(newStatus);
    setIsOpen(false);
  };

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    if (disabled) return;
    
    if (!isOpen) {
      calculateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleDropdownToggle}
        disabled={disabled}
        className={`px-2 py-1 rounded text-xs font-medium cursor-pointer hover:bg-opacity-80 transition-all min-w-[100px] text-left whitespace-nowrap flex items-center justify-between ${currentStatusConfig.color} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span>{currentStatusConfig.label}</span>
        <span className="ml-1 text-gray-400 text-xs">▼</span>
      </button>

      {isOpen && (
        <div 
          className="fixed bg-white border border-gray-300 rounded shadow-xl min-w-[160px] max-w-[200px]"
          style={{ 
            zIndex: 999999,
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          {statusOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleStatusSelect(option.value)}
              className={`px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                option.value === currentStatus ? 'bg-blue-50' : ''
              }`}
            >
              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${option.color}`}>
                {option.label}
              </span>
            </div>
          ))}
          
          {/* Jira-style additional options */}
          {showExtraOptions && (
            <div className="border-t border-gray-200">
              <div className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
                Create status
              </div>
              <div className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
                Edit status
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;