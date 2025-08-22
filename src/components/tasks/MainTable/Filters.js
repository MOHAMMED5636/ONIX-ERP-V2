import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  EyeIcon,
  CalendarIcon,
  FunnelIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { format } from 'date-fns';

const Filters = ({
  search,
  setSearch,
  projectStartDate,
  handleProjectStartDateChange,
  handleAddNewTask,
  resetColumnOrder,
  showAddColumnMenu,
  setShowAddColumnMenu,
  addColumnMenuPos,
  addColumnSearch,
  setAddColumnSearch,
  filteredColumnOptions,
  handleAddColumn,
  handleShowAddColumnMenu
}) => {
  // Enhanced filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    global: '',
    name: '',
    status: '',
    assignee: '',
    plan: '',
    category: '',
    dateFrom: '',
    dateTo: '',
  });

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

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      global: '',
      name: '',
      status: '',
      assignee: '',
      plan: '',
      category: '',
      dateFrom: '',
      dateTo: '',
    });
  };

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
      {/* Enhanced Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm rounded-b-lg">
        {/* Left side - Show All Columns button and New Project button */}
        <div className="flex items-center gap-3">
          <button 
            className="px-4 py-2.5 text-sm bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            onClick={resetColumnOrder}
            title="Reset columns to show all fields"
          >
            <EyeIcon className="w-4 h-4 inline mr-2" />
            Show All Columns
          </button>
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            onClick={handleAddNewTask}
          >
            <PlusIcon className="w-5 h-5" /> New Project
          </button>
        </div>
        
        {/* Right side - Search, Project Start, Filters, and Add Column */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md w-64"
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <CalendarIcon className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Project Start:</label>
              <input
                type="date"
                className="px-2 py-1 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm transition-all duration-200"
                value={format(projectStartDate, 'yyyy-MM-dd')}
                onChange={e => handleProjectStartDateChange(new Date(e.target.value))}
              />
            </div>
            {/* Enhanced Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${
                showFilters ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
            </button>
          </div>
          <div className="relative">
            <button 
              className="p-2.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5" 
              onClick={handleShowAddColumnMenu}
              title="Add column"
            >
              <PlusIcon className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filter Panel */}
      {showFilters && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-4 mx-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FunnelIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Filter Projects</h3>
            <div className="flex-1"></div>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Global Search Bar */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search All Projects</label>
              <div className="relative">
                <input
                  type="text"
                  name="global"
                  value={filters.global}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Search by name, reference, assignee, or dates..."
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Project Name Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Search by name"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                {demoStatuses.map((status) => (
                  <option key={status} value={status === 'All Statuses' ? '' : status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Assignee</label>
              <select
                name="assignee"
                value={filters.assignee}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                {demoUsers.map((user) => (
                  <option key={user} value={user === 'All Users' ? '' : user}>{user}</option>
                ))}
              </select>
            </div>

            {/* Part of Plan Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Part of Plan</label>
              <select
                name="plan"
                value={filters.plan}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                {demoPlans.map((plan) => (
                  <option key={plan} value={plan === 'All Plans' ? '' : plan}>{plan}</option>
                ))}
              </select>
            </div>

            {/* Project Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                {demoCategories.map((cat) => (
                  <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Date From Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
              <select
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Any Date</option>
                {demoDates.map((date) => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
              <select
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Any Date</option>
                {demoDates.map((date) => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {Object.values(filters).some(value => value !== '') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.global && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Search: "{filters.global}"
                  </span>
                )}
                {filters.name && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Name: "{filters.name}"
                  </span>
                )}
                {filters.status && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Status: {filters.status}
                  </span>
                )}
                {filters.assignee && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    Assignee: {filters.assignee}
                  </span>
                )}
                {filters.plan && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    Plan: {filters.plan}
                  </span>
                )}
                {filters.category && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    Category: {filters.category}
                  </span>
                )}
                {(filters.dateFrom || filters.dateTo) && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    Date: {filters.dateFrom || 'Any'} - {filters.dateTo || 'Any'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
    </>
  );
};

export default Filters;



