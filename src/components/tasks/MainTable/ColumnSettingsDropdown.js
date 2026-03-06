import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings } from 'lucide-react';

const DROPDOWN_WIDTH = 256;
const DROPDOWN_OFFSET = 8;

const ColumnSettingsDropdown = ({ 
  columns, 
  visibleColumns, 
  onToggleColumn, 
  onResetColumns 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // When opening, measure button and position dropdown outside table (fixed to viewport)
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    let left = rect.right - DROPDOWN_WIDTH;
    if (left < 8) left = 8;
    if (left + DROPDOWN_WIDTH > window.innerWidth - 8) left = window.innerWidth - DROPDOWN_WIDTH - 8;
    setPosition({ top: rect.bottom + DROPDOWN_OFFSET, left });
  }, [isOpen]);

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

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className="fixed min-w-[14rem] w-64 rounded-lg border border-gray-200 bg-white shadow-2xl overflow-hidden flex flex-col"
      style={{
        top: position.top,
        left: position.left,
        zIndex: 10000,
        maxHeight: 'min(20rem, 70vh)',
      }}
    >
      <div className="py-1 flex flex-col min-h-0 flex-1">
        <div className="px-4 py-2.5 text-sm font-semibold text-gray-900 border-b border-gray-100 shrink-0 bg-white">
          Column Settings
        </div>
        <div className="max-h-48 overflow-y-auto overscroll-contain flex-1 min-h-0">
          {columns && columns.length > 0 ? columns.map((column) => (
            <label
              key={column.key}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={visibleColumns && visibleColumns.includes(column.key)}
                onChange={() => handleToggleColumn(column.key)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded shrink-0"
              />
              <span className="truncate" title={column.label}>
                {column.label}
              </span>
            </label>
          )) : (
            <div className="px-3 py-2 text-sm text-gray-500">No columns available</div>
          )}
        </div>
        <div className="border-t border-gray-100 shrink-0 bg-white">
          <button
            onClick={handleResetColumns}
            type="button"
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-gray-50 cursor-pointer"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={(e) => {
          setIsOpen(!isOpen);
          e.stopPropagation();
        }}
        className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shrink-0"
        title="Column Settings"
      >
        <Settings className="h-5 w-5" />
      </button>
      {typeof document !== 'undefined' && document.body && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default ColumnSettingsDropdown;
