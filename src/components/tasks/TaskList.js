// Force refresh - ChartBarIcon import fix
import React, { useState, useEffect, useRef } from "react";
import { 
  GlobeAltIcon, 
  MagnifyingGlassIcon, 
  ChatBubbleLeftRightIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  XMarkIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../LanguageContext";
import { format } from "date-fns";
import TabBar from "./TabBar";
import ActionControls from "./ActionControls";
import MainTable from "./MainTable";
import KanbanBoard from "./KanbanBoard";

export default function TaskList() {
  const [activeTab, setActiveTab] = useState("main-table");
  const { lang, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0
  });

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Refs for popup handling
  const popupRef = useRef(null);
  const searchInputRef = useRef(null);

  // Demo data for dropdowns
  const demoPlans = ["All Plans", "Ref#1234", "Ref#5678", "Ref#9012", "Ref#3456", "Ref#7890"];
  const demoUsers = ["All Users", "MN", "SA", "AH", "MA"];
  const demoCategories = ["All Categories", "Design", "Development", "Testing", "Review"];
  const demoStatuses = ["All Statuses", "pending", "working", "done", "cancelled", "suspended"];

  // Filter handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

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
    setSearchTerm("");
  };

  // Close popup when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showFilters) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFilters]);

  // Handle date filter from navigation
  useEffect(() => {
    if (location.state?.dateFilter) {
      const { startDate, endDate } = location.state.dateFilter;
      setFilters(prev => ({
        ...prev,
        dateFrom: format(startDate, 'yyyy-MM-dd'),
        dateTo: format(endDate, 'yyyy-MM-dd')
      }));
      
      // Clear the navigation state to prevent re-applying on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Simulate loading and fetch stats
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setStats({
        total: 156,
        completed: 89,
        inProgress: 42,
        pending: 25
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="tasks-full-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Enhanced Header Bar */}
      <header className="flex-shrink-0 w-full bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 flex items-center px-3 sm:px-6 py-4 z-40 relative min-h-0">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 flex items-center w-full gap-4">
          {/* Left section: Enhanced Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 group">
              <div className="relative">
                <img 
                  src="/onix-bg.png" 
                  alt="Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl border-2 border-white/50 shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-xl" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Task Management
                </h1>
                <p className="text-xs text-gray-500">Project Dashboard</p>
              </div>
            </div>
          </div>

          {/* Center section: Enhanced Search bar */}
          <div className="flex-1 min-w-0 flex justify-center items-center max-w-md mx-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="lg:hidden p-2 focus:outline-none hover:bg-white/50 rounded-xl transition-all duration-200"
              aria-label="Toggle search"
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="hidden lg:flex relative w-full max-w-sm" ref={searchInputRef}>
              <div className="relative w-full group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl h-8 w-8 shadow-lg group-hover:scale-110 transition-all duration-300">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder={lang === "ar" ? "بحث في المهام..." : "Search tasks... (click for filters)"}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`w-full pl-12 pr-4 py-2 rounded-2xl bg-white/80 backdrop-blur-sm border focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm shadow-lg transition-all duration-300 focus:bg-white hover:bg-white/90 group-hover:shadow-xl cursor-pointer ${
                    Object.values(filters).some(value => value !== '') || searchTerm 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-white/50'
                  }`}
                  dir={lang}
                  readOnly
                />
                {Object.values(filters).some(value => value !== '') && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
                
                {/* Filter Popup */}
                {showFilters && (
                  <div ref={popupRef} className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <FunnelIcon className="w-5 h-5 text-blue-600" />
                          Search & Filters
                        </h3>
                        <button
                          onClick={() => setShowFilters(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Search Input in Popup */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Search Tasks</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Search by name, reference, assignee, or dates..."
                            autoFocus
                          />
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      
                      {/* Filter Options */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Project Name Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
                          <input
                            type="text"
                            name="name"
                            value={filters.name}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Filter by name"
                          />
                        </div>

                        {/* Status Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                          <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                          >
                            <option value="">All Statuses</option>
                            {demoStatuses.slice(1).map((status) => (
                              <option key={status} value={status}>{status}</option>
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
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                          >
                            <option value="">All Users</option>
                            {demoUsers.slice(1).map((user) => (
                              <option key={user} value={user}>{user}</option>
                            ))}
                          </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                          <select
                            name="category"
                            value={filters.category}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                          >
                            <option value="">All Categories</option>
                            {demoCategories.slice(1).map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Date From Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                          <input
                            type="date"
                            name="dateFrom"
                            value={filters.dateFrom}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        {/* Date To Filter */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                          <input
                            type="date"
                            name="dateTo"
                            value={filters.dateTo}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Active Filters Display */}
                      {Object.values(filters).some(value => value !== '') && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                            <button
                              onClick={clearAllFilters}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {filters.name && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Name: "{filters.name}"
                              </span>
                            )}
                            {filters.status && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                Status: {filters.status}
                              </span>
                            )}
                            {filters.assignee && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                Assignee: {filters.assignee}
                              </span>
                            )}
                            {filters.category && (
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                Category: {filters.category}
                              </span>
                            )}
                            {(filters.dateFrom || filters.dateTo) && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                Date: {filters.dateFrom || 'Any'} - {filters.dateTo || 'Any'}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Results Counter */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          <span>Search results will appear below</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {showSearch && (
              <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-white/20 p-4 lg:hidden z-50 rounded-b-2xl shadow-xl">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl h-9 w-9 shadow-lg">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder={lang === "ar" ? "بحث في المهام..." : "Search tasks... (click for filters)"}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={() => setShowFilters(!showFilters)}
                    className={`w-full pl-14 pr-4 py-3 rounded-2xl bg-white/80 backdrop-blur-sm border focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm shadow-lg transition-all duration-300 focus:bg-white cursor-pointer ${
                      Object.values(filters).some(value => value !== '') || searchTerm 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-white/50'
                    }`}
                    dir={lang}
                    readOnly
                  />
                  {Object.values(filters).some(value => value !== '') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {/* Mobile Filter Popup */}
                {showFilters && (
                  <div className="mt-4 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FunnelIcon className="w-5 h-5 text-blue-600" />
                        Search & Filters
                      </h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Search Input in Mobile Popup */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Search Tasks</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Search by name, reference, assignee, or dates..."
                          autoFocus
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    
                    {/* Mobile Filter Options */}
                    <div className="space-y-4">
                      {/* Project Name Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
                        <input
                          type="text"
                          name="name"
                          value={filters.name}
                          onChange={handleFilterChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Filter by name"
                        />
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                        <select
                          name="status"
                          value={filters.status}
                          onChange={handleFilterChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                          <option value="">All Statuses</option>
                          {demoStatuses.slice(1).map((status) => (
                            <option key={status} value={status}>{status}</option>
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
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                          <option value="">All Users</option>
                          {demoUsers.slice(1).map((user) => (
                            <option key={user} value={user}>{user}</option>
                          ))}
                        </select>
                      </div>

                      {/* Category Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                        <select
                          name="category"
                          value={filters.category}
                          onChange={handleFilterChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                          <option value="">All Categories</option>
                          {demoCategories.slice(1).map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Date Range */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                          <input
                            type="date"
                            name="dateFrom"
                            value={filters.dateFrom}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                          <input
                            type="date"
                            name="dateTo"
                            value={filters.dateTo}
                            onChange={handleFilterChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Active Filters Display */}
                    {Object.values(filters).some(value => value !== '') && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                          <button
                            onClick={clearAllFilters}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {filters.name && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Name: "{filters.name}"
                            </span>
                          )}
                          {filters.status && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                              Status: {filters.status}
                            </span>
                          )}
                          {filters.assignee && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                              Assignee: {filters.assignee}
                            </span>
                          )}
                          {filters.category && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                              Category: {filters.category}
                            </span>
                          )}
                          {(filters.dateFrom || filters.dateTo) && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                              Date: {filters.dateFrom || 'Any'} - {filters.dateTo || 'Any'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right section: Enhanced Controls */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {/* Enhanced Chatroom Button */}
            <button
              onClick={() => navigate("/project-chat")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative group flex-shrink-0"
              title="Go to Chatroom"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              <span className="hidden sm:inline text-sm">Chatroom</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold shadow-lg border border-white animate-pulse">2</span>
            </button>
            
            {/* Enhanced Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/50 flex-shrink-0"
            >
              <GlobeAltIcon className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">{lang === "en" ? "EN | ع" : "ع | EN"}</span>
              <span className="sm:hidden text-sm">{lang === "en" ? "EN" : "ع"}</span>
            </button>


          </div>
        </div>
      </header>

             {/* Enhanced Task Content */}
       <div className="flex-1 flex flex-col min-h-0 overflow-hidden h-full">
        {/* Stats Dashboard */}
        {!isLoading && (
          <div className="flex-shrink-0 p-4 bg-white/60 backdrop-blur-sm border-b border-white/20 overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-full">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-blue-100 text-xs font-medium truncate">Total Tasks</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                  <ChartBarIcon className="h-6 w-6 text-blue-200 flex-shrink-0 ml-2" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-3 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-green-100 text-xs font-medium truncate">Completed</p>
                    <p className="text-xl font-bold">{stats.completed}</p>
                  </div>
                  <CheckCircleIcon className="h-6 w-6 text-green-200 flex-shrink-0 ml-2" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-3 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-yellow-100 text-xs font-medium truncate">In Progress</p>
                    <p className="text-xl font-bold">{stats.inProgress}</p>
                  </div>
                  <ClockIcon className="h-6 w-6 text-yellow-200 flex-shrink-0 ml-2" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-3 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-red-100 text-xs font-medium truncate">Pending</p>
                    <p className="text-xl font-bold">{stats.pending}</p>
                  </div>
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-200 flex-shrink-0 ml-2" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced TabBar */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-white/20">
          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        {/* Enhanced ActionControls */}
        <div className="flex-shrink-0 bg-white/60 backdrop-blur-sm border-b border-white/20">
          <ActionControls />
        </div>
        
                 {/* Main Content - Enhanced */}
         <div className="flex-1 min-h-0 overflow-auto bg-gradient-to-br from-slate-50/50 via-blue-50/50 to-indigo-50/50 h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                {/* ONIX Logo Spinning Animation */}
                <div className="mx-auto mb-4">
                  <svg 
                    className="animate-spin h-20 w-20" 
                    viewBox="0 0 100 100" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Segment 1 - Blue to Teal (0-120 degrees) */}
                    <path 
                      d="M 50 50 L 50 10 A 40 40 0 0 1 10 50 Z" 
                      fill="url(#blueTealGradient)"
                    />
                    
                    {/* Segment 2 - Orange to Red (120-240 degrees) */}
                    <path 
                      d="M 50 50 L 10 50 A 40 40 0 0 1 50 90 Z" 
                      fill="url(#orangeRedGradient)"
                    />
                    
                    {/* Segment 3 - Grey (240-360 degrees) */}
                    <path 
                      d="M 50 50 L 50 90 A 40 40 0 0 1 90 50 Z" 
                      fill="#9ca3af"
                    />
                    
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="blueTealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                      <linearGradient id="orangeRedGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">Loading your tasks...</p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {activeTab === "main-table" && <MainTable />}
              {activeTab === "kanban" && <KanbanBoard />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 