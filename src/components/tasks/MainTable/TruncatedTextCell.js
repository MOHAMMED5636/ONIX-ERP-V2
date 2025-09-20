import React, { useState, useRef, useEffect } from 'react';

const TruncatedTextCell = ({ 
  value, 
  onChange, 
  onKeyDown, 
  placeholder, 
  className = "",
  maxWidth = "w-32",
  isEditable = true 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const cellRef = useRef(null);
  
  // If no value or just whitespace, show placeholder
  const displayValue = value && value.trim() ? value.trim() : "";
  const hasContent = displayValue.length > 0;
  
  // Truncate text if it's longer than 20 characters
  const truncatedText = displayValue.length > 20 
    ? `${displayValue.substring(0, 20)}...` 
    : displayValue;

  const handleMouseEnter = (e) => {
    if (!hasContent) return;
    
    console.log('Mouse enter - showing tooltip for:', displayValue);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const newPosition = {
      top: rect.top,
      left: rect.right + 10
    };
    
    console.log('Tooltip position:', newPosition);
    setTooltipPosition(newPosition);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    console.log('Mouse leave - hiding tooltip');
    setShowTooltip(false);
  };

  // Debug logging
  useEffect(() => {
    // console.log('TruncatedTextCell render:', {
    //   value,
    //   displayValue,
    //   hasContent,
    //   truncatedText,
    //   showTooltip
    // });
  }, [value, displayValue, hasContent, truncatedText, showTooltip]);

  if (!isEditable) {
    return (
      <div className={`${maxWidth} ${className} relative`} ref={cellRef}>
        <div 
          className={`px-2 py-1 text-sm cursor-pointer hover:bg-gray-50 rounded transition-colors ${
            hasContent ? 'text-gray-900' : 'text-gray-400'
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {hasContent ? truncatedText : placeholder}
          {/* Debug indicator */}
          {hasContent && <span className="text-blue-500 text-xs ml-1">ℹ️</span>}
        </div>
        
        {/* Custom Tooltip */}
        {showTooltip && hasContent && (
          <div 
            className="fixed z-50 w-80 max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-lg pointer-events-none"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left
            }}
          >
            <div className="text-sm text-gray-900 whitespace-pre-wrap break-words">
              {displayValue}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${maxWidth} ${className} relative`} ref={cellRef}>
      <input
        className="border rounded px-2 py-1 text-sm w-full resize-none"
        value={value || ""}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Debug indicator */}
      {hasContent && <span className="absolute top-0 right-0 text-blue-500 text-xs">ℹ️</span>}
      
      {/* Custom Tooltip */}
      {showTooltip && hasContent && (
        <div 
          className="fixed z-50 w-80 max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-lg pointer-events-none"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left
          }}
        >
          <div className="text-sm text-gray-900 whitespace-pre-wrap break-words">
            {displayValue}
          </div>
        </div>
      )}
    </div>
  );
};

export default TruncatedTextCell;
