import React, { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';

const ColumnSettingsDropdown = ({ 
  columns, 
  visibleColumns, 
  onToggleColumn, 
  onResetColumns 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Debug logging
  // console.log('ColumnSettingsDropdown props:', { 
  //   columns: columns?.length, 
  //   visibleColumns: visibleColumns?.length,
  //   onToggleColumn: !!onToggleColumn,
  //   onResetColumns: !!onResetColumns
  // });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggleColumn = (columnKey) => {
    if (onToggleColumn) {
      onToggleColumn(columnKey);
    }
  };

  const handleResetColumns = () => {
    if (onResetColumns) {
      onResetColumns();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => {
          console.log('Settings button clicked, current isOpen:', isOpen);
          setIsOpen(!isOpen);
          e.stopPropagation();
        }}
        className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        title="Column Settings"
      >
        <Settings className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg z-[9999] max-h-80"
        >
          <div className="py-1">
            <div className="px-3 py-2 text-sm font-semibold text-gray-900 border-b border-gray-100 sticky top-0 bg-white">
              Column Settings
            </div>
            
            {/* Scrollable area for columns */}
            <div className="max-h-60 overflow-y-auto">
              {columns && columns.length > 0 ? columns.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns && visibleColumns.includes(column.key)}
                    onChange={() => handleToggleColumn(column.key)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="truncate" title={column.label}>
                    {column.label}
                  </span>
                </label>
              )) : (
                <div className="px-3 py-2 text-sm text-gray-500">No columns available</div>
              )}
            </div>
            
            <div className="border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                onClick={handleResetColumns}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-gray-100 cursor-pointer"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnSettingsDropdown;
