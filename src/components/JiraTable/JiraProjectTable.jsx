import React, { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { initialProjects, columnDefinitions, autoSuggestData } from './data';
import { ProjectRow } from './ProjectRow';
import { Toolbar } from './Toolbar';
import { AddProjectModal } from './AddProjectModal';
import { AddColumnModal } from './AddColumnModal';
import { motion } from 'framer-motion';

const columnHelper = createColumnHelper();

export const JiraProjectTable = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(
    columnDefinitions.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Create columns for TanStack Table
  const columns = useMemo(() => {
    return columnDefinitions
      .filter(col => visibleColumns[col.key])
      .map(col => {
        if (col.type === 'dropdown') {
          return columnHelper.accessor(col.key, {
            header: col.label,
            cell: ({ row, getValue }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 px-2">
                    {getValue()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {col.options?.map(option => (
                    <DropdownMenuItem key={option} onClick={() => handleCellEdit(row.original.id, col.key, option)}>
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          });
        }
        
        return columnHelper.accessor(col.key, {
          header: col.label,
          cell: ({ row, getValue }) => (
            <div className="px-2 py-1">
              {renderCell(row.original, col.key, getValue())}
            </div>
          ),
        });
      });
  }, [visibleColumns]);

  // Flatten projects and subtasks for table
  const flattenedData = useMemo(() => {
    const flattened = [];
    projects.forEach(project => {
      // Add main project
      flattened.push({
        ...project,
        level: 0,
        parentId: null,
      });
      
      // Add subtasks if expanded
      if (expandedRows.has(project.id) && project.subtasks) {
        project.subtasks.forEach(subtask => {
          flattened.push({
            ...subtask,
            level: 1,
            parentId: project.id,
          });
        });
      }
    });
    return flattened;
  }, [projects, expandedRows]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let filtered = flattenedData;
    
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => item[key] === value);
      }
    });
    
    return filtered;
  }, [flattenedData, searchTerm, filters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setProjects(prevProjects => {
        const oldIndex = prevProjects.findIndex(p => p.id === active.id);
        const newIndex = prevProjects.findIndex(p => p.id === over.id);
        return arrayMove(prevProjects, oldIndex, newIndex);
      });
    }
  }, []);

  const toggleRowExpansion = useCallback((rowId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  const handleCellEdit = useCallback((projectId, field, value) => {
    setProjects(prevProjects => {
      return prevProjects.map(project => {
        if (project.id === projectId) {
          return { ...project, [field]: value };
        }
        if (project.subtasks) {
          return {
            ...project,
            subtasks: project.subtasks.map(subtask => {
              if (subtask.id === projectId) {
                return { ...subtask, [field]: value };
              }
              return subtask;
            })
          };
        }
        return project;
      });
    });
  }, []);

  const handleAddProject = useCallback((newProject) => {
    setProjects(prev => [...prev, { ...newProject, id: Date.now() }]);
    setShowAddProject(false);
  }, []);

  const handleAddColumn = useCallback((newColumn) => {
    // This would typically update the column definitions
    setShowAddColumn(false);
  }, []);

  const renderCell = useCallback((row, field, value) => {
    const column = columnDefinitions.find(col => col.key === field);
    
    switch (column?.type) {
      case 'text':
        return <span className="text-sm">{value || '-'}</span>;
      case 'number':
        return <span className="text-sm">{value || 0}</span>;
      case 'textarea':
        return <span className="text-sm max-w-xs truncate">{value || '-'}</span>;
      case 'dropdown':
        return (
          <span 
            className="inline-block px-2 py-1 text-xs rounded-full text-white"
            style={{ backgroundColor: getStatusColor(value) }}
          >
            {value || 'Select'}
          </span>
        );
      case 'person':
        return <span className="text-sm">{value || 'Select Owner'}</span>;
      case 'daterange':
        return (
          <span className="text-xs">
            {value?.startDate && value?.endDate 
              ? `${value.startDate} - ${value.endDate}`
              : 'Set dates'
            }
          </span>
        );
      case 'file':
        return (
          <span className="text-xs">
            {Array.isArray(value) && value.length > 0 
              ? `${value.length} file(s)`
              : 'No files'
            }
          </span>
        );
      case 'checklist':
        return (
          <span className="text-xs">
            {Array.isArray(value) 
              ? `${value.filter(item => item.completed).length}/${value.length}`
              : '0/0'
            }
          </span>
        );
      case 'rating':
        return (
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                className="text-yellow-400"
              >
                {star <= value ? '★' : '☆'}
              </span>
            ))}
          </div>
        );
      case 'progress':
        return (
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full" 
              style={{ width: `${value || 0}%` }}
            />
            <span className="text-xs ml-1">{value || 0}%</span>
          </div>
        );
      case 'color':
        return (
          <div 
            className="w-3 h-3 rounded-full border"
            style={{ backgroundColor: value || '#ccc' }}
          />
        );
      case 'url':
        return (
          <div>
            {value ? (
              <a 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs"
              >
                View Link
              </a>
            ) : (
              <span className="text-gray-400 text-xs">No link</span>
            )}
          </div>
        );
      default:
        return <span className="text-sm">{value || '-'}</span>;
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return '#10B981';
      case 'In Progress': return '#F59E0B';
      case 'To Do': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-xl border border-gray-200">
      {/* Toolbar - Fixed at top */}
      <motion.div 
        className="flex-shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Toolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={setVisibleColumns}
          onAddProject={() => setShowAddProject(true)}
          onAddColumn={() => setShowAddColumn(true)}
          autoSuggestData={autoSuggestData}
        />
      </motion.div>

      {/* Table Container - Single scrollable area */}
      <motion.div 
        className="flex-1 min-h-0 overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200 sticky top-0 z-10">
            <tr>
              {/* Drag handle column */}
              <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-12 bg-gradient-to-r from-gray-100 to-gray-200">
                <span className="sr-only">Drag</span>
              </th>
              {/* Expand/collapse column */}
              <th className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-12 bg-gradient-to-r from-gray-100 to-gray-200">
                <span className="sr-only">Expand</span>
              </th>
              {table.getHeaderGroups().map(headerGroup => (
                headerGroup.headers.map(header => (
                  <motion.th
                    key={header.id}
                    className="px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-300 transition-colors bg-gradient-to-r from-gray-100 to-gray-200"
                    onClick={header.column.getToggleSortingHandler()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                        </motion.span>
                      )}
                    </div>
                  </motion.th>
                ))
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <AnimatePresence>
                {table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.original.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      backgroundColor: "rgba(59, 130, 246, 0.05)",
                      scale: 1.001
                    }}
                    className="hover:bg-blue-50/50 transition-all duration-200"
                  >
                    <ProjectRow
                      row={row}
                      index={index}
                      expandedRows={expandedRows}
                      onToggleExpansion={toggleRowExpansion}
                      onCellEdit={handleCellEdit}
                      autoSuggestData={autoSuggestData}
                    />
                  </motion.tr>
                ))}
              </AnimatePresence>
            </DndContext>
          </tbody>
        </table>
      </motion.div>

      {/* Pagination - Fixed at bottom */}
      <motion.div 
        className="flex-shrink-0 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <div className="flex-1 flex justify-between sm:hidden">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="flex gap-x-2 items-baseline">
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of{' '}
              <span className="font-medium">{table.getPageCount()}</span>
            </span>
            <label>
              <span className="sr-only">Items Per Page</span>
              <select
                className="rounded-md border-gray-300 text-sm"
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  table.setPageSize(Number(e.target.value));
                }}
              >
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Button
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Next
              </Button>
            </nav>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      {showAddProject && (
        <AddProjectModal
          onClose={() => setShowAddProject(false)}
          onAdd={handleAddProject}
          columnDefinitions={columnDefinitions}
          autoSuggestData={autoSuggestData}
        />
      )}
      
      {showAddColumn && (
        <AddColumnModal
          onClose={() => setShowAddColumn(false)}
          onAdd={handleAddColumn}
        />
      )}
    </div>
  );
};
