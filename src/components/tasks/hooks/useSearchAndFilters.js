import { useState, useEffect, useCallback } from 'react';

// Custom hook for debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Shared search and filter hook
export const useSearchAndFilters = (initialTasks = []) => {
  // Search state
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    name: '',
    status: '',
    assignee: '',
    category: '',
    priority: '',
    location: '',
    dateFrom: '',
    dateTo: '',
  });

  // Debounced values for smooth typing
  const debouncedSearch = useDebounce(search, 300);
  const debouncedFilters = useDebounce(filters, 300);

  // Show loading when search is being processed
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => setIsSearching(false), 100);
    return () => clearTimeout(timer);
  }, [debouncedSearch, debouncedFilters]);

  // Clear all filters and search
  const clearAllFilters = useCallback(() => {
    setFilters({
      name: '',
      status: '',
      assignee: '',
      category: '',
      priority: '',
      location: '',
      dateFrom: '',
      dateTo: '',
    });
    setSearch('');
  }, []);

  // Filter tasks function
  const filterTasks = useCallback((taskList) => {
    return taskList.filter(task => {
      // Basic search filter
      const searchMatch = !debouncedSearch || 
        task.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        task.referenceNumber?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        task.owner?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        task.remarks?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        task.assigneeNotes?.toLowerCase().includes(debouncedSearch.toLowerCase());

      if (!searchMatch) return false;

      // Advanced filters
      const nameMatch = !debouncedFilters.name || 
        task.name?.toLowerCase().includes(debouncedFilters.name.toLowerCase());

      const statusMatch = !debouncedFilters.status || 
        task.status?.toLowerCase() === debouncedFilters.status.toLowerCase();

      const assigneeMatch = !debouncedFilters.assignee || 
        task.owner?.toLowerCase() === debouncedFilters.assignee.toLowerCase();

      const categoryMatch = !debouncedFilters.category || 
        task.category?.toLowerCase() === debouncedFilters.category.toLowerCase();

      const priorityMatch = !debouncedFilters.priority || 
        task.priority?.toLowerCase() === debouncedFilters.priority.toLowerCase();

      const locationMatch = !debouncedFilters.location || 
        task.location?.toLowerCase().includes(debouncedFilters.location.toLowerCase());

      // Date range filtering
      let dateMatch = true;
      if (debouncedFilters.dateFrom || debouncedFilters.dateTo) {
        const taskStartDate = task.timeline?.[0] ? new Date(task.timeline[0]) : null;
        const taskEndDate = task.timeline?.[1] ? new Date(task.timeline[1]) : null;
        
        if (debouncedFilters.dateFrom && taskStartDate) {
          const fromDate = new Date(debouncedFilters.dateFrom);
          dateMatch = dateMatch && taskStartDate >= fromDate;
        }
        
        if (debouncedFilters.dateTo && taskEndDate) {
          const toDate = new Date(debouncedFilters.dateTo);
          dateMatch = dateMatch && taskEndDate <= toDate;
        }
      }

      return nameMatch && statusMatch && assigneeMatch && categoryMatch && priorityMatch && locationMatch && dateMatch;
    });
  }, [debouncedSearch, debouncedFilters]);

  // Get filtered tasks
  const getFilteredTasks = useCallback(() => {
    return filterTasks(initialTasks);
  }, [filterTasks, initialTasks]);

  // Get active filter count
  const getActiveFilterCount = useCallback(() => {
    return Object.values(filters).filter(value => value !== '').length;
  }, [filters]);

  // Check if any filters are active
  const hasActiveFilters = useCallback(() => {
    return getActiveFilterCount() > 0 || search !== '';
  }, [getActiveFilterCount, search]);

  return {
    // State
    search,
    setSearch,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    isSearching,
    
    // Actions
    clearAllFilters,
    filterTasks,
    getFilteredTasks,
    
    // Computed values
    getActiveFilterCount,
    hasActiveFilters,
    
    // Debounced values
    debouncedSearch,
    debouncedFilters,
  };
};

