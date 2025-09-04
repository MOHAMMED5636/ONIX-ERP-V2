import React, { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useSearchAndFilters } from '../hooks/useSearchAndFilters';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const TimelineCell = ({ value, onChange, hasPredecessors = false, tasks = [], onFilterChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const buttonRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();
  
  // Use shared search and filter hook
  const {
    search,
    setSearch,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    isSearching,
    clearAllFilters,
    filterTasks,
    getFilteredTasks,
    getActiveFilterCount,
    hasActiveFilters,
  } = useSearchAndFilters(tasks);
  
  // Notify parent component of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({ search, filters });
    }
  }, [search, filters, onFilterChange]);
  
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
  
  // Handle escape key and keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showPicker) {
        setShowPicker(false);
      }
      
      // Ctrl+K to focus search when modal is open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && showPicker) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search tasks"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    
    if (showPicker) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
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
                  Timeline & Task Filters
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
          
          {/* Search and Filters Section */}
          <div className="p-4 border-b border-gray-100">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks... (Ctrl+K to focus)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                {isSearching && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Filters Toggle */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <FunnelIcon className="w-5 h-5" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {getActiveFilterCount && getActiveFilterCount() > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {getActiveFilterCount()} active
                  </span>
                )}
              </button>
              
              {getActiveFilterCount && getActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded-md transition-all duration-200"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* Project Name Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    value={filters.name}
                    onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="working">Working</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                {/* Assignee Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                  <select
                    value={filters.assignee}
                    onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">All Users</option>
                    <option value="MN">MN</option>
                    <option value="SA">SA</option>
                    <option value="AH">AH</option>
                    <option value="MA">MA</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Review">Review</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Date From Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Date To Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
            )}
            
            {/* Search Results Counter */}
            {hasActiveFilters && hasActiveFilters() && (
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    Found <strong>{getFilteredTasks().length}</strong> task{getFilteredTasks().length !== 1 ? 's' : ''} 
                    {search && ` matching "${search}"`}
                    {getActiveFilterCount && getActiveFilterCount() > 0 && ' with applied filters'}
                  </span>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
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
        title={hasPredecessors ? 'Timeline calculated from predecessors' : 'Open timeline & filters'}
      >
        {start && end
          ? `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`
          : 'Timeline & Filters'}
        {hasPredecessors && (
          <span className="ml-1 text-xs">🔗</span>
        )}
      </button>
      
      {renderModal()}
    </div>
  );
};

export default TimelineCell;


