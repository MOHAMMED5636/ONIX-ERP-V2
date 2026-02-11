import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { Info } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const Filters = ({
  search,
  setSearch,
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  clearAllFilters,
  isSearching,
  getActiveFilterCount,
  handleAddNewTask,
  handleExport,
  resetColumnOrder,
  showAddColumnMenu,
  setShowAddColumnMenu,
  addColumnMenuPos,
  addColumnSearch,
  setAddColumnSearch,
  filteredColumnOptions,
  handleAddColumn,
  handleShowAddColumnMenu,
  selectedTaskIds,
  tasks
}) => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'EMPLOYEE';
  const navigate = useNavigate();
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Handle Tender Invitation button click
  const handleTenderInvitation = () => {
    if (selectedTaskIds && selectedTaskIds.size > 0) {
      // Get the first selected project
      const selectedProject = tasks.find(task => selectedTaskIds.has(task.id));
      if (selectedProject) {
        // Navigate to tender page with project info in state
        navigate('/tender', { 
          state: { 
            projectId: selectedProject.id,
            projectName: selectedProject.name,
            projectRef: selectedProject.referenceNumber,
            openTenderInvitation: true
          } 
        });
      }
    } else {
      alert('Please select a project first');
    }
  };
  // Demo data for dropdowns
  const demoPlans = ["All Plans", "Ref#1234", "Ref#5678", "Ref#9012", "Ref#3456", "Ref#7890"];
  const demoUsers = ["All Users", "MN", "SA", "AH", "MA"];
  const demoCategories = ["All Categories", "Design", "Development", "Testing", "Review"];
  const demoStatuses = ["All Statuses", "pending", "working", "done", "cancelled", "suspended"];
  const demoDates = [
    "2023-07-01",
    "2023-07-05",
    "2023-07-10",
    "2023-07-12",
    "2023-07-15",
    "2023-07-20",
    "2023-07-22",
    "2023-07-25",
  ];

  // Column type options for the add column menu
  const COLUMN_TYPE_OPTIONS = [
    { key: 'status', label: 'Status', icon: '🟢' },
    { key: 'text', label: 'Text', icon: '🔤' },
    { key: 'date', label: 'Date', icon: '📅' },
    { key: 'number', label: 'Number', icon: '🔢' },
    { key: 'dropdown', label: 'Dropdown', icon: '⬇️' },
    { key: 'files', label: 'Files', icon: '📎' },
    { key: 'priority', label: 'Priority', icon: '⚡' },
    { key: 'color', label: 'Color Picker', icon: '🎨' },
  ];

  return (
    <>
      {/* Enhanced Top Bar - Restructured for better alignment */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {/* Top row with action buttons */}
        <div className="flex items-center justify-between px-2 sm:px-4 py-3 gap-2 overflow-x-auto filters-container">
          {/* Left side - Main Table Indicator */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Bars3Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">Main Table</h2>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Project management and task tracking</p>
            </div>
          </div>
          
          {/* Right side - New Project, Paste, Search, Show Filters */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
            {!isEmployee ? (
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-1.5 sm:gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base flex-shrink-0"
                onClick={handleAddNewTask}
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">New Project</span><span className="sm:hidden">New</span>
              </button>
            ) : (
              <div className="text-xs sm:text-sm text-gray-500 italic flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200 flex-shrink-0">
                <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                <span className="hidden sm:inline">Only project managers can create projects</span>
                <span className="sm:hidden">Managers only</span>
              </div>
            )}
            
            {/* Info Icon with Tooltip */}
            <div className="relative group flex-shrink-0">
              <button
                onClick={() => setShowInfoModal(true)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200 rounded-full hover:bg-blue-50"
                title="Copy-Paste Feature Guide"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <button
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-1.5 sm:gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base flex-shrink-0"
              onClick={handleExport}
              title="Export Table Data"
            >
              <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Export</span>
            </button>

            <button
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg flex items-center gap-1.5 sm:gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base flex-shrink-0 ${
                selectedTaskIds && selectedTaskIds.size > 0
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
              }`}
              onClick={handleTenderInvitation}
              disabled={!selectedTaskIds || selectedTaskIds.size === 0}
              title={selectedTaskIds && selectedTaskIds.size > 0 ? "Create Tender Invitation for selected project" : "Please select a project first"}
            >
              <ClipboardDocumentListIcon className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Tender Invitation</span><span className="sm:hidden">Tender</span>
            </button>
            
            {/* Search Box */}
            <div className="relative flex-shrink-0">
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-32 sm:w-48 md:w-56 pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm text-sm"
              />
              <MagnifyingGlassIcon className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              {isSearching && (
                <div className="absolute right-8 sm:right-10 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            
            {/* Show Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300 bg-white shadow-sm flex-shrink-0 text-sm"
            >
              <FunnelIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-sm font-medium">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              <span className="sm:hidden font-medium">{showFilters ? 'Hide' : 'Show'}</span>
              {getActiveFilterCount && getActiveFilterCount() > 0 && (
                <span className="ml-1 px-1.5 sm:px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-6 py-2 border-t border-gray-100">

        {/* Clear All Filters - Only show when filters are active */}
        {getActiveFilterCount && getActiveFilterCount() > 0 && (
          <div className="flex justify-end mb-2">
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded-md transition-all duration-200"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
          </div>
        )}
      </div>

      {/* Add Column Menu */}
      {showAddColumnMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72"
          style={{ left: addColumnMenuPos.x, top: addColumnMenuPos.y }}
        >
          <div className="mb-2">
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Search column types..."
              value={addColumnSearch}
              onChange={e => setAddColumnSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredColumnOptions.map(opt => (
              <button
                key={opt.key}
                className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-blue-50 text-left"
                onClick={() => handleAddColumn(opt.key)}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
            {filteredColumnOptions.length === 0 && (
              <div className="text-gray-400 text-sm px-2 py-4">No column types found.</div>
            )}
          </div>
          <button
            className="mt-2 w-full text-blue-600 hover:underline text-sm"
            onClick={() => alert('More column types coming soon!')}
          >
            More columns
          </button>
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
            onClick={() => setShowAddColumnMenu(false)}
            title="Close"
            type="button"
          >
            ×
          </button>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Copy-Paste Feature Guide</h2>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Valid Copy Operations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  ✅ Valid Copy Operations
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Select parent tasks only (with subtasks)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Multiple parent tasks can be selected together</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>All child tasks are automatically included</span>
                  </div>
                </div>
              </div>

              {/* Invalid Copy Operations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  ❌ Invalid Copy Operations
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Cannot copy child tasks independently</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Cannot copy subtasks without their parent</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Cannot copy mixed parent/child selections</span>
                  </div>
                </div>
              </div>

              {/* How to Use */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  📋 How to Use
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">1.</span>
                    <span>Select parent task(s) using checkboxes</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">2.</span>
                    <span>Click "Copy" button in bulk action bar</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">3.</span>
                    <span>Navigate to target project</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">4.</span>
                    <span>Click "Paste" button and select target project</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">5.</span>
                    <span>Tasks are pasted with new IDs and preserved hierarchy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowInfoModal(false)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Filters;



