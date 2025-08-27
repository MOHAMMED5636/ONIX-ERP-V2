import React, { useState, useMemo, useCallback } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FunnelIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  FlagIcon,
  TagIcon
} from "@heroicons/react/24/outline";

// Jira-like table component replicating the exact interface
const JiraLikeTable = () => {
  // Sample data matching the Jira interface
  const [data, setData] = useState([
    {
      id: "VIL-1",
      type: "Task",
      summary: "contract",
      status: "TO DO",
      priority: "Medium",
      assignee: null,
      dueDate: null,
      category: null,
      labels: [],
      created: "Aug 18, 2025",
      comments: 0,
      description: "Contract review and approval process"
    },
    {
      id: "VIL-17",
      type: "Task",
      summary: "check tha dra...",
      status: "TO DO",
      priority: "Medium",
      assignee: null,
      dueDate: null,
      category: null,
      labels: [],
      created: "Aug 21, 2025",
      comments: 0,
      description: "Check the drawings and specifications"
    },
    {
      id: "VIL-8",
      type: "Task",
      summary: "1",
      status: "TO DO",
      priority: "Medium",
      assignee: null,
      dueDate: null,
      category: null,
      labels: [],
      created: "Aug 20, 2025",
      comments: 0,
      description: "Initial planning phase"
    },
    {
      id: "VIL-7",
      type: "Task",
      summary: "verify",
      status: "TO DO",
      priority: "Medium",
      assignee: null,
      dueDate: null,
      category: null,
      labels: [],
      created: "Aug 20, 2025",
      comments: 0,
      description: "Verify project requirements"
    },
    {
      id: "VIL-6",
      type: "Task",
      summary: "sign by",
      status: "TO DO",
      priority: "Medium",
      assignee: null,
      dueDate: null,
      category: null,
      labels: [],
      created: "Aug 20, 2025",
      comments: 0,
      description: "Get approval signatures"
    },
    {
      id: "VIL-5",
      type: "Task",
      summary: "concept fdesi...",
      status: "TO DO",
      priority: "Medium",
      assignee: null,
      dueDate: null,
      category: null,
      labels: [],
      created: "Aug 20, 2025",
      comments: 0,
      description: "Concept design development"
    },
    {
      id: "VIL-2",
      type: "Task",
      summary: "approval",
      status: "TO DO",
      priority: "Medium",
      assignee: null,
      dueDate: null,
      category: null,
      labels: [],
      created: "Aug 18, 2025",
      comments: 0,
      description: "Project approval process"
    },
    {
      id: "VIL-3",
      type: "Task",
      summary: "3d design",
      status: "TO DO",
      priority: "Medium",
      assignee: null,
      dueDate: null,
      category: null,
      labels: [],
      created: "Aug 18, 2025",
      comments: 0,
      description: "3D design and modeling"
    },
    {
      id: "VIL-4",
      type: "Task",
      summary: "525",
      status: "TO DO",
      priority: "Medium",
      assignee: null,
      dueDate: null,
      category: null,
      labels: [],
      created: "Aug 18, 2025",
      comments: 0,
      description: "Project reference number"
    },
    {
      id: "VIL-9",
      type: "Task",
      summary: "ecxfdxsgfv",
      status: "TO DO",
      priority: "Medium",
      assignee: null,
      dueDate: null,
      category: null,
      labels: [],
      created: "Aug 21, 2025",
      comments: 0,
      description: "Technical specification"
    },
    {
      id: "VIL-10",
      type: "Task",
      summary: "excavation",
      status: "TO DO",
      priority: "Medium",
      assignee: null,
      dueDate: null,
      category: null,
      labels: [],
      created: "Aug 21, 2025",
      comments: 0,
      description: "Site excavation work"
    },
    {
      id: "VIL-11",
      type: "Task",
      summary: "fythufhj",
      status: "TO DO",
      priority: "Medium",
      assignee: null,
      dueDate: null,
      category: null,
      labels: [],
      created: "Aug 21, 2025",
      comments: 0,
      description: "Foundation work"
    },
    {
      id: "VIL-12",
      type: "Task",
      summary: "final review",
      status: "TO DO",
      priority: "Medium",
      assignee: null,
      dueDate: null,
      category: null,
      labels: [],
      created: "Aug 21, 2025",
      comments: 0,
      description: "Final project review"
    }
  ]);

  // Table state
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Column definitions matching Jira
  const columns = [
    { key: 'type', label: 'Type', width: 'w-16' },
    { key: 'key', label: 'Key', width: 'w-20' },
    { key: 'summary', label: 'Summary', width: 'w-64' },
    { key: 'status', label: 'Status', width: 'w-24' },
    { key: 'comments', label: 'Comments', width: 'w-24' },
    { key: 'category', label: 'Category', width: 'w-24' },
    { key: 'assignee', label: 'Assignee', width: 'w-24' },
    { key: 'dueDate', label: 'Due date', width: 'w-24' },
    { key: 'priority', label: 'Priority', width: 'w-24' },
    { key: 'labels', label: 'Labels', width: 'w-24' },
    { key: 'created', label: 'Created', width: 'w-32' }
  ];

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          row.id.toLowerCase().includes(searchLower) ||
          row.summary.toLowerCase().includes(searchLower) ||
          row.status.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [data, searchTerm]);

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
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map(row => row.id)));
    }
  };

  // Handle cell editing
  const handleCellEdit = (rowId, columnKey, value) => {
    setData(prev => prev.map(row => 
      row.id === rowId ? { ...row, [columnKey]: value } : row
    ));
  };

  // Handle cell click for editing
  const handleCellClick = (rowId, columnKey, value) => {
    setEditingCell({ rowId, columnKey });
    setEditValue(value || "");
  };

  // Handle edit save
  const handleEditSave = () => {
    if (editingCell) {
      handleCellEdit(editingCell.rowId, editingCell.columnKey, editValue);
      setEditingCell(null);
      setEditValue("");
    }
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  // Render cell content
  const renderCell = (row, column) => {
    const value = row[column.key];
    const isEditing = editingCell?.rowId === row.id && editingCell?.columnKey === column.key;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={handleEditSave}
            className="p-1 text-green-600 hover:text-green-800"
          >
            <CheckIcon className="w-3 h-3" />
          </button>
          <button
            onClick={handleEditCancel}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        </div>
      );
    }

    switch (column.key) {
      case 'type':
        return (
          <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
        );
      case 'key':
        return (
          <span 
            className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
            onClick={() => handleCellClick(row.id, column.key, value)}
          >
            {value}
          </span>
        );
      case 'summary':
        return (
          <span 
            className="text-gray-900 hover:text-blue-600 cursor-pointer"
            onClick={() => handleCellClick(row.id, column.key, value)}
          >
            {value}
          </span>
        );
      case 'status':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {value}
          </span>
        );
      case 'comments':
        return (
          <button className="text-gray-500 hover:text-blue-600 text-sm">
            Add comment
          </button>
        );
      case 'category':
        return value || <span className="text-gray-400">—</span>;
      case 'assignee':
        return value || <span className="text-gray-400">—</span>;
      case 'dueDate':
        return value || <span className="text-gray-400">—</span>;
      case 'priority':
        return (
          <div className="flex items-center gap-1">
            <FlagIcon className="w-3 h-3 text-gray-400" />
            <span className="text-sm">= {value}</span>
          </div>
        );
      case 'labels':
        return value && value.length > 0 ? (
          <div className="flex gap-1">
            {value.map((label, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {label}
              </span>
            ))}
          </div>
        ) : (
          <button className="text-gray-500 hover:text-blue-600 text-sm">
            + Add label
          </button>
        );
      case 'created':
        return (
          <span className="text-gray-600 text-sm">
            {value}
          </span>
        );
      default:
        return value;
    }
  };

  return (
    <div className="w-full h-full bg-white">
      {/* Jira Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">V</span>
              </div>
              <span className="text-lg font-medium text-gray-900">villa</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <StarIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <ChevronDownIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 mt-4">
          <button className="text-gray-500 hover:text-gray-700 pb-2">Summary</button>
          <button className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">List</button>
          <button className="text-gray-500 hover:text-gray-700 pb-2">Board</button>
          <button className="text-gray-500 hover:text-gray-700 pb-2">Calendar</button>
          <button className="text-gray-500 hover:text-gray-700 pb-2">Timeline</button>
          <button className="text-gray-500 hover:text-gray-700 pb-2">Pages</button>
          <button className="text-gray-500 hover:text-gray-700 pb-2">Forms</button>
          <button className="text-gray-500 hover:text-gray-700 pb-2">Shortcuts</button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search list"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Jira Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* Select All Checkbox */}
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              
              {/* Column Headers */}
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-medium text-gray-900 ${column.width}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {filteredData.map(row => (
              <tr 
                key={row.id}
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
                {columns.map(column => (
                  <td
                    key={column.key}
                    className="px-4 py-3 text-sm text-gray-900"
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors">
            <PlusIcon className="w-4 h-4" />
            Create
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium transition-colors">
            Quickstart
          </button>
        </div>
      </div>
    </div>
  );
};

export default JiraLikeTable;



