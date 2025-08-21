import React, { useState, useMemo, useCallback, useRef, useLayoutEffect, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  Bars3Icon
} from "@heroicons/react/24/outline";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { addDays, differenceInCalendarDays, isValid } from 'date-fns';

// Import components (you'll need to create these or adapt from MainTable)
import TimelineCell from '../tasks/MainTable/TimelineCell';
import DraggableHeader from '../tasks/MainTable/DraggableHeader';
import SortableSubtaskRow from '../tasks/MainTable/SortableSubtaskRow';
import GoogleMapPickerDemo from '../tasks/MainTable/GoogleMapPickerDemo';

// Excel-like table component with full MainTable.js features
const ExcelTableDemo = () => {
  // Enhanced sample data with hierarchical structure
  const [data, setData] = useState([
    {
      id: 1,
      projectName: "Building Construction A",
      status: "In Progress",
      owner: "John Smith",
      startDate: "2024-01-15",
      endDate: "2024-06-30",
      budget: 500000,
      progress: 65,
      priority: "High",
      category: "Construction",
      location: "Downtown",
      notes: "Foundation work completed",
      plotNumber: "PLOT-001",
      community: "Downtown District",
      projectType: "Residential",
      projectFloor: "5",
      developerProject: "Onix Development",
      checklist: false,
      rating: 3,
      color: "#60a5fa",
      timeline: [new Date("2024-01-15"), new Date("2024-06-30")],
      planDays: 10,
      remarks: "",
      assigneeNotes: "",
      attachments: [],
      predecessors: "",
      expanded: false,
      subtasks: [
        {
          id: 11,
          projectName: "Foundation Work",
          status: "Completed",
          owner: "SA",
          startDate: "2024-01-15",
          endDate: "2024-02-15",
          budget: 150000,
          progress: 100,
          priority: "High",
          category: "Design",
          location: "Downtown",
          notes: "Foundation completed",
          plotNumber: "PLOT-001-1",
          community: "Downtown District",
          projectType: "Residential",
          projectFloor: "5",
          developerProject: "Onix Development",
          checklist: false,
          rating: 4,
          color: "#f59e42",
          timeline: [new Date("2024-01-15"), new Date("2024-02-15")],
          planDays: 5,
          remarks: "",
          assigneeNotes: "",
          attachments: [],
          predecessors: "",
          expanded: false,
          childSubtasks: [
            {
              id: 111,
              projectName: "Site Preparation",
              status: "Completed",
              owner: "SA",
              startDate: "2024-01-15",
              endDate: "2024-01-25",
              budget: 50000,
              progress: 100,
              priority: "High",
              category: "Design",
              location: "Downtown",
              notes: "Site cleared and prepared",
              plotNumber: "PLOT-001-1-1",
              community: "Downtown District",
              projectType: "Residential",
              projectFloor: "5",
              developerProject: "Onix Development",
              checklist: false,
              rating: 5,
              color: "#10d081",
              timeline: [new Date("2024-01-15"), new Date("2024-01-25")],
              planDays: 2,
              remarks: "",
              assigneeNotes: "",
              attachments: [],
              predecessors: "",
            }
          ]
        },
        {
          id: 12,
          projectName: "Structural Framework",
          status: "Working",
          owner: "MN",
          startDate: "2024-02-16",
          endDate: "2024-04-15",
          budget: 200000,
          progress: 70,
          priority: "Medium",
          category: "Development",
          location: "Downtown",
          notes: "Steel framework in progress",
          plotNumber: "PLOT-001-2",
          community: "Downtown District",
          projectType: "Residential",
          projectFloor: "5",
          developerProject: "Onix Development",
          checklist: false,
          rating: 3,
          color: "#10d081",
          timeline: [new Date("2024-02-16"), new Date("2024-04-15")],
          planDays: 8,
          remarks: "",
          assigneeNotes: "",
          attachments: [],
          predecessors: "11",
          expanded: false,
          childSubtasks: []
        }
      ]
    },
    {
      id: 2,
      projectName: "Office Renovation B",
      status: "Completed",
      owner: "Sarah Johnson",
      startDate: "2024-02-01",
      endDate: "2024-04-15",
      budget: 250000,
      progress: 100,
      priority: "Medium",
      category: "Renovation",
      location: "Business District",
      notes: "All phases completed on time",
      plotNumber: "PLOT-002",
      community: "Business District",
      projectType: "Commercial",
      projectFloor: "3",
      developerProject: "Onix Development",
      checklist: true,
      rating: 5,
      color: "#f44448",
      timeline: [new Date("2024-02-01"), new Date("2024-04-15")],
      planDays: 15,
      remarks: "",
      assigneeNotes: "",
      attachments: [],
      predecessors: "",
      expanded: false,
      subtasks: []
    }
  ]);

  // Enhanced table state
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [showNewTask, setShowNewTask] = useState(false);
  const [showSubtaskForm, setShowSubtaskForm] = useState(null);
  const [showChildSubtaskForm, setShowChildSubtaskForm] = useState(null);
  const [googleMapPickerOpen, setGoogleMapPickerOpen] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState(null);
  const [projectStartDate, setProjectStartDate] = useState(new Date());

  // Enhanced column definitions with all MainTable.js features
  const [columns, setColumns] = useState([
    { key: 'projectName', label: 'Project Name', type: 'text', sortable: true, filterable: true, width: 'w-80' },
    { key: 'status', label: 'Status', type: 'select', options: ['In Progress', 'Completed', 'Planning', 'On Hold', 'Stuck'], sortable: true, filterable: true, width: 'w-32' },
    { key: 'owner', label: 'Owner', type: 'text', sortable: true, filterable: true, width: 'w-24' },
    { key: 'timeline', label: 'Timeline', type: 'timeline', sortable: true, filterable: true, width: 'w-40' },
    { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'], sortable: true, filterable: true, width: 'w-28' },
    { key: 'progress', label: 'Progress (%)', type: 'progress', sortable: true, filterable: true, width: 'w-32' },
    { key: 'category', label: 'Category', type: 'text', sortable: true, filterable: true, width: 'w-36' },
    { key: 'budget', label: 'Budget ($)', type: 'number', sortable: true, filterable: true, width: 'w-32' },
    { key: 'location', label: 'Location', type: 'location', sortable: true, filterable: true, width: 'w-40' },
    { key: 'plotNumber', label: 'Plot Number', type: 'text', sortable: true, filterable: true, width: 'w-32' },
    { key: 'community', label: 'Community', type: 'text', sortable: true, filterable: true, width: 'w-40' },
    { key: 'projectType', label: 'Project Type', type: 'select', options: ['Residential', 'Commercial', 'Industrial', 'Mixed Use', 'Infrastructure'], sortable: true, filterable: true, width: 'w-36' },
    { key: 'projectFloor', label: 'Project Floor', type: 'text', sortable: true, filterable: true, width: 'w-32' },
    { key: 'developerProject', label: 'Developer Project', type: 'text', sortable: true, filterable: true, width: 'w-40' },
    { key: 'rating', label: 'Rating', type: 'rating', sortable: true, filterable: true, width: 'w-24' },
    { key: 'color', label: 'Color', type: 'color', sortable: true, filterable: true, width: 'w-20' },
    { key: 'checklist', label: 'Checklist', type: 'checkbox', sortable: true, filterable: true, width: 'w-24' },
    { key: 'attachments', label: 'Attachments', type: 'files', sortable: false, filterable: true, width: 'w-32' },
    { key: 'notes', label: 'Notes', type: 'text', sortable: false, filterable: true, width: 'w-40' }
  ]);

  // Column order state
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('excelTableColumnOrder');
    return saved ? JSON.parse(saved) : columns.map(col => col.key);
  });

  // Save column order to localStorage
  useEffect(() => {
    localStorage.setItem('excelTableColumnOrder', JSON.stringify(columnOrder));
  }, [columnOrder]);

  // Enhanced sorting function
  const sortData = useCallback((data, sortConfig) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, []);

  // Enhanced filtering function
  const filterData = useCallback((data, filters, searchTerm) => {
    return data.filter(row => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) return false;
      }

      // Column filters
      for (const [key, value] of Object.entries(filters)) {
        if (value && value !== '') {
          if (String(row[key]).toLowerCase() !== String(value).toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  }, []);

  // Processed data
  const processedData = useMemo(() => {
    let result = data;
    result = filterData(result, filters, searchTerm);
    result = sortData(result, sortConfig);
    return result;
  }, [data, filters, searchTerm, sortConfig, filterData, sortData]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle cell editing
  const handleCellEdit = (rowId, columnKey, value, parentId = null, childId = null) => {
    setData(prev => {
      if (parentId && childId) {
        // Editing child subtask
        return prev.map(row => 
          row.id === parentId 
            ? {
                ...row,
                subtasks: row.subtasks.map(sub =>
                  sub.id === childId 
                    ? { ...sub, [columnKey]: value }
                    : sub
                )
              }
            : row
        );
      } else if (parentId) {
        // Editing subtask
        return prev.map(row => 
          row.id === parentId 
            ? {
                ...row,
                subtasks: row.subtasks.map(sub =>
                  sub.id === rowId 
                    ? { ...sub, [columnKey]: value }
                    : sub
                )
              }
            : row
        );
      } else {
        // Editing main row
        return prev.map(row => 
          row.id === rowId ? { ...row, [columnKey]: value } : row
        );
      }
    });
  };

  // Handle cell click for editing
  const handleCellClick = (rowId, columnKey, value, parentId = null, childId = null) => {
    setEditingCell({ rowId, columnKey, parentId, childId });
    setEditValue(value);
  };

  // Handle edit save
  const handleEditSave = () => {
    if (editingCell) {
      handleCellEdit(
        editingCell.rowId, 
        editingCell.columnKey, 
        editValue,
        editingCell.parentId,
        editingCell.childId
      );
      setEditingCell(null);
      setEditValue("");
    }
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  // Handle row selection
  const handleRowSelect = (rowId) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === processedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(processedData.map(row => row.id)));
    }
  };

  // Handle delete selected
  const handleDeleteSelected = () => {
    setData(prev => prev.filter(row => !selectedRows.has(row.id)));
    setSelectedRows(new Set());
  };

  // Handle expand/collapse
  const handleToggleExpand = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  // Add new row
  const handleAddRow = () => {
    const newRow = {
      id: Math.max(...data.map(row => row.id)) + 1,
      projectName: "",
      status: "Planning",
      owner: "",
      startDate: "",
      endDate: "",
      budget: 0,
      progress: 0,
      priority: "Medium",
      category: "",
      location: "",
      notes: "",
      plotNumber: "",
      community: "",
      projectType: "Residential",
      projectFloor: "",
      developerProject: "",
      checklist: false,
      rating: 0,
      color: "#60a5fa",
      timeline: [null, null],
      planDays: 0,
      remarks: "",
      assigneeNotes: "",
      attachments: [],
      predecessors: "",
      expanded: false,
      subtasks: []
    };
    setData(prev => [...prev, newRow]);
  };

  // Handle drag end for columns
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!active || !over || !active.id || !over.id) {
      return;
    }
    
    if (active.id !== over.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        
        if (oldIndex === -1 || newIndex === -1) {
          return prev;
        }
        
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  // Handle map picker
  const handleOpenMapPicker = (type, rowId, parentId = null, childId = null) => {
    setMapPickerTarget({ type, rowId, parentId, childId });
    setGoogleMapPickerOpen(true);
  };

  const handlePickLocation = (lat, lng) => {
    if (!mapPickerTarget) return;
    const location = `${lat}, ${lng}`;
    
    if (mapPickerTarget.childId) {
      handleCellEdit(mapPickerTarget.rowId, 'location', location, mapPickerTarget.parentId, mapPickerTarget.childId);
    } else if (mapPickerTarget.parentId) {
      handleCellEdit(mapPickerTarget.rowId, 'location', location, mapPickerTarget.parentId);
    } else {
      handleCellEdit(mapPickerTarget.rowId, 'location', location);
    }
    
    setGoogleMapPickerOpen(false);
  };

  // Render cell content with enhanced functionality
  const renderCell = (row, column, depth = 0, parentId = null, childId = null) => {
    const value = row[column.key];
    const isEditing = editingCell?.rowId === row.id && 
                     editingCell?.columnKey === column.key &&
                     editingCell?.parentId === parentId &&
                     editingCell?.childId === childId;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          {column.type === 'select' ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            >
              {column.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : column.type === 'timeline' ? (
            <TimelineCell
              value={editValue}
              onChange={(val) => setEditValue(val)}
              hasPredecessors={false}
            />
          ) : column.type === 'number' ? (
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          ) : column.type === 'checkbox' ? (
            <input
              type="checkbox"
              checked={editValue}
              onChange={(e) => setEditValue(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          )}
          <button
            onClick={handleEditSave}
            className="p-1 text-green-600 hover:text-green-800"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleEditCancel}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      );
    }

    switch (column.type) {
      case 'progress':
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{value}%</span>
          </div>
        );
      case 'select':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'High' ? 'bg-red-100 text-red-800' :
            value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            value === 'Low' ? 'bg-green-100 text-green-800' :
            value === 'Completed' ? 'bg-green-100 text-green-800' :
            value === 'In Progress' ? 'bg-blue-100 text-blue-800' :
            value === 'Planning' ? 'bg-purple-100 text-purple-800' :
            value === 'On Hold' ? 'bg-gray-100 text-gray-800' :
            value === 'Stuck' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {value}
          </span>
        );
      case 'timeline':
        return (
          <TimelineCell
            value={value}
            onChange={(val) => handleCellEdit(row.id, column.key, val, parentId, childId)}
            hasPredecessors={false}
          />
        );
      case 'location':
        return (
          <div className="flex items-center gap-2">
            <input
              className="border border-gray-300 rounded px-2 py-1 text-xs flex-1"
              value={value || ""}
              onChange={(e) => handleCellEdit(row.id, column.key, e.target.value, parentId, childId)}
              placeholder="Enter location"
            />
            <button
              type="button"
              onClick={() => handleOpenMapPicker('location', row.id, parentId, childId)}
              title="Pick on map"
              className="p-1"
            >
              <MapPinIcon className="w-3 h-3 text-blue-500 hover:text-blue-700" />
            </button>
          </div>
        );
      case 'rating':
        return (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => handleCellEdit(row.id, column.key, star, parentId, childId)}
                className={`text-xs ${value >= star ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        );
      case 'color':
        return (
          <div
            className="w-4 h-4 rounded-full border border-gray-300 cursor-pointer"
            style={{ backgroundColor: value || "#60a5fa" }}
            onClick={() => {
              const colors = ["#60a5fa", "#f59e42", "#10d081", "#f44448", "#8b5cf6", "#06b6d4"];
              const currentIndex = colors.indexOf(value || "#60a5fa");
              const nextColor = colors[(currentIndex + 1) % colors.length];
              handleCellEdit(row.id, column.key, nextColor, parentId, childId);
            }}
          />
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => handleCellEdit(row.id, column.key, e.target.checked, parentId, childId)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        );
      case 'files':
        return (
          <div>
            <input
              type="file"
              multiple
              className="text-xs"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                handleCellEdit(row.id, column.key, files, parentId, childId);
              }}
            />
            {value && value.length > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                {value.length} file(s)
              </div>
            )}
          </div>
        );
      case 'number':
        return `$${value.toLocaleString()}`;
      default:
        return value;
    }
  };

  // Render hierarchical row
  const renderRow = (row, depth = 0, parentId = null) => {
    const hasChildren = row.subtasks && row.subtasks.length > 0;
    const isExpanded = expandedRows[row.id];
    const indentLevel = depth * 20;

    return (
      <React.Fragment key={row.id}>
        <tr 
          className={`hover:bg-gray-50 transition-colors ${
            selectedRows.has(row.id) ? 'bg-blue-50' : ''
          }`}
        >
          {/* Row Checkbox */}
          <td className="px-4 py-3">
            <input
              type="checkbox"
              checked={selectedRows.has(row.id)}
              onChange={() => handleRowSelect(row.id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </td>
          
          {/* Data Cells */}
          {columnOrder.map((colKey, idx) => {
            const col = columns.find(c => c.key === colKey);
            if (!col) return null;
            
            return (
              <td
                key={col.key}
                className="px-4 py-3 text-sm text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleCellClick(row.id, col.key, row[col.key], parentId)}
              >
                {col.key === 'projectName' && idx === 0 ? (
                  <div className="flex items-center gap-2" style={{ marginLeft: `${indentLevel}px` }}>
                    {/* Expand/Collapse arrow */}
                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleExpand(row.id);
                        }}
                        className="focus:outline-none p-1 rounded hover:bg-gray-100 transition-all duration-200"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? 
                          <ChevronDownIcon className="w-4 h-4 text-gray-600" /> : 
                          <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                        }
                      </button>
                    )}
                    
                    {/* Placeholder for consistent spacing */}
                    {!hasChildren && <div className="w-6" />}
                    
                    {/* Project name */}
                    <span className="font-medium">{row[col.key]}</span>
                  </div>
                ) : (
                  renderCell(row, col, depth, parentId)
                )}
              </td>
            );
          })}
          
          {/* Actions */}
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCellClick(row.id, 'projectName', row.projectName, parentId)}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                title="Edit"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setData(prev => prev.filter(r => r.id !== row.id));
                }}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        
        {/* Render child subtasks */}
        {hasChildren && isExpanded && row.subtasks.map(subtask => (
          <React.Fragment key={subtask.id}>
            {renderRow(subtask, depth + 1, row.id)}
            
            {/* Render child subtasks */}
            {subtask.childSubtasks && subtask.childSubtasks.length > 0 && 
             expandedRows[subtask.id] && subtask.childSubtasks.map(childSubtask => (
              <React.Fragment key={childSubtask.id}>
                {renderRow(childSubtask, depth + 2, subtask.id)}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6">
      {/* Excel-like Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Enhanced Excel-like Data Table</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddRow}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Add Row
              </button>
              {selectedRows.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete ({selectedRows.size})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Excel-like Toolbar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search all columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
            </button>

            {/* Results count */}
            <span className="text-sm text-gray-600">
              {processedData.length} of {data.length} rows
            </span>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {columns.filter(col => col.filterable).map(column => (
                  <div key={column.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {column.label}
                    </label>
                    {column.type === 'select' ? (
                      <select
                        value={filters[column.key] || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, [column.key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All</option>
                        {column.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={`Filter ${column.label}...`}
                        value={filters[column.key] || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, [column.key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Excel-like Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {/* Select All Checkbox */}
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === processedData.length && processedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                
                {/* Column Headers with Drag & Drop */}
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                    {columnOrder.map(key => {
                      const col = columns.find(c => c.key === key);
                      if (!col) return null;
                      
                      return (
                        <th
                          key={col.key}
                          className={`px-4 py-3 text-left text-sm font-medium text-gray-900 ${
                            col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                          }`}
                          onClick={() => col.sortable && handleSort(col.key)}
                        >
                          <div className="flex items-center gap-2">
                            {col.label}
                            {col.sortable && (
                              <div className="flex flex-col">
                                <ArrowUpIcon 
                                  className={`w-3 h-3 ${
                                    sortConfig.key === col.key && sortConfig.direction === 'asc' 
                                      ? 'text-blue-600' 
                                      : 'text-gray-400'
                                  }`} 
                                />
                                <ArrowDownIcon 
                                  className={`w-3 h-3 ${
                                    sortConfig.key === col.key && sortConfig.direction === 'desc' 
                                      ? 'text-blue-600' 
                                      : 'text-gray-400'
                                  }`} 
                                />
                              </div>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </SortableContext>
                </DndContext>
                
                {/* Actions */}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200">
              {processedData.map(row => renderRow(row))}
            </tbody>
          </table>
        </div>
        
        {/* Excel-like Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total: {processedData.length} rows</span>
            <span>Selected: {selectedRows.size} rows</span>
          </div>
        </div>
      </div>

      {/* Google Maps Picker Modal */}
      {googleMapPickerOpen && (
        <GoogleMapPickerDemo
          onPick={handlePickLocation}
          onClose={() => setGoogleMapPickerOpen(false)}
        />
      )}
    </div>
  );
};

export default ExcelTableDemo;
