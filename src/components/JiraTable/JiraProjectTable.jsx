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
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { initialProjects, columnDefinitions, autoSuggestData } from './data';
import { Toolbar } from './Toolbar';
import { AddProjectModal } from './AddProjectModal';
import { AddColumnModal } from './AddColumnModal';
import { DateCell } from './DateCell';
import { ChecklistCell } from './ChecklistCell';
import { SubtaskTable } from './SubtaskTable';
import { ChevronRightIcon, ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';

const columnHelper = createColumnHelper();

export const JiraProjectTable = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(
    columnDefinitions.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );
  const [columnOrder, setColumnOrder] = useState(columnDefinitions.map(col => col.key));
  const [selectedProjects, setSelectedProjects] = useState(new Set());
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

  // Update predecessor options based on current projects
  const predecessorOptions = useMemo(() => {
    return projects.map(project => project.referenceNumber);
  }, [projects]);

  // Create columns for TanStack Table
  const columns = useMemo(() => {
    return columnOrder
      .filter(colKey => visibleColumns[colKey])
      .map(colKey => {
        const colDef = columnDefinitions.find(col => col.key === colKey);
        if (!colDef) return null;

        if (colKey === 'checkbox') {
          return columnHelper.accessor(colKey, {
            header: () => (
              <input
                type="checkbox"
                checked={selectedProjects.size === projects.length && projects.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProjects(new Set(projects.map(p => p.id)));
                  } else {
                    setSelectedProjects(new Set());
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            ),
            cell: ({ row }) => (
              <input
                type="checkbox"
                checked={selectedProjects.has(row.original.id)}
                onChange={(e) => {
                  const newSelected = new Set(selectedProjects);
                  if (e.target.checked) {
                    newSelected.add(row.original.id);
                  } else {
                    newSelected.delete(row.original.id);
                  }
                  setSelectedProjects(newSelected);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            ),
          });
        }

        if (colDef.type === 'dropdown') {
          return columnHelper.accessor(colKey, {
            header: colDef.label,
            cell: ({ row, getValue }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 px-2">
                    {getValue() || 'Select...'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {(colKey === 'predecessor' ? predecessorOptions : colDef.options)?.map(option => (
                    <DropdownMenuItem 
                      key={option} 
                      onClick={() => handleCellEdit(row.original.id, colKey, option)}
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          });
        }

        if (colDef.type === 'date') {
          return columnHelper.accessor(colKey, {
            header: colDef.label,
            cell: ({ row, getValue }) => (
              <DateCell
                value={getValue()}
                onChange={(newValue) => handleCellEdit(row.original.id, colKey, newValue)}
              />
            ),
          });
        }

        if (colDef.type === 'checklist') {
          return columnHelper.accessor(colKey, {
            header: colDef.label,
            cell: ({ row, getValue }) => (
              <ChecklistCell
                value={getValue()}
                onChange={(newValue) => handleCellEdit(row.original.id, colKey, newValue)}
              />
            ),
          });
        }
        
        return columnHelper.accessor(colKey, {
          header: colDef.label,
          cell: ({ row, getValue }) => (
            <div className="px-2 py-1">
              {renderCell(row.original, colKey, getValue())}
            </div>
          ),
        });
      }).filter(Boolean);
  }, [visibleColumns, columnOrder, selectedProjects, projects, predecessorOptions]);

  // Flatten projects for table (don't include subtasks in main table)
  const tableData = useMemo(() => {
    return projects;
  }, [projects]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnFilters: Object.entries(filters).map(([key, value]) => ({
        id: key,
        value,
      })),
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      if (typeof updater === 'function') {
        setFilters(updater(Object.entries(filters).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value,
        }), {})));
      }
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleCellEdit = useCallback((projectId, field, value) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId 
          ? { ...project, [field]: value }
          : project
      )
    );
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = projects.findIndex(project => project.id === active.id);
      const newIndex = projects.findIndex(project => project.id === over.id);
      
      setProjects(prevProjects => arrayMove(prevProjects, oldIndex, newIndex));
    }
  }, [projects]);

  const handleColumnReorder = useCallback((result) => {
    if (!result.destination) return;
    
    const items = Array.from(columnOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setColumnOrder(items);
  }, [columnOrder]);

  const toggleRowExpansion = useCallback((projectId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  }, []);

  const handleSubtaskUpdate = useCallback((parentId, updatedSubtasks) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === parentId 
          ? { ...project, subtasks: updatedSubtasks }
          : project
      )
    );
  }, []);

  const handleAddSubtask = useCallback((parentId) => {
    const parentProject = projects.find(p => p.id === parentId);
    if (!parentProject) return;

    const newSubtask = {
      id: `${parentId}-${Date.now()}`,
      projectName: 'New Subtask',
      referenceNumber: `${parentProject.referenceNumber}-${parentProject.subtasks?.length + 1 || 1}`,
      status: 'To Do',
      owner: '',
      startDate: '',
      endDate: '',
      planDays: 0,
      remarks: '',
      assigneeNotes: '',
      attachments: [],
      priority: 'Medium',
      location: parentProject.location || '',
      plotNumber: parentProject.plotNumber || '',
      community: parentProject.community || '',
      projectType: parentProject.projectType || '',
      projectFloor: parentProject.projectFloor || 0,
      developer: parentProject.developer || '',
      predecessor: parentProject.referenceNumber,
      communityChecklist: [],
      checklist: [],
      link: '',
      rating: 0,
      progress: 0,
      colorIndicator: '#6B7280'
    };

    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === parentId 
          ? { 
              ...project, 
              subtasks: [...(project.subtasks || []), newSubtask] 
            }
          : project
      )
    );
  }, [projects]);

  const handleAddProject = useCallback((newProject) => {
    setProjects(prev => [...prev, { ...newProject, id: Date.now().toString() }]);
    setShowAddProject(false);
  }, []);

  const handleAddColumn = useCallback((newColumn) => {
    const columnKey = newColumn.key.toLowerCase().replace(/\s+/g, '');
    const newColumnDef = {
      key: columnKey,
      label: newColumn.label,
      type: newColumn.type,
      width: 150,
      sortable: true,
      options: newColumn.options || []
    };
    
    // Update column definitions
    columnDefinitions.push(newColumnDef);
    
    // Update visible columns
    setVisibleColumns(prev => ({ ...prev, [columnKey]: true }));
    
    // Update column order
    setColumnOrder(prev => [...prev, columnKey]);
    
    setShowAddColumn(false);
  }, []);

  const renderCell = (project, key, value) => {
    switch (key) {
      case 'projectName':
        return (
          <div className="flex items-center gap-2">
            {project.subtasks && project.subtasks.length > 0 && (
              <button
                onClick={() => toggleRowExpansion(project.id)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {expandedRows.has(project.id) ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            )}
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleCellEdit(project.id, key, e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
            />
          </div>
        );
      case 'referenceNumber':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleCellEdit(project.id, key, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
          />
        );
      case 'owner':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleCellEdit(project.id, key, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
            list="owners"
          />
        );
      case 'planDays':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleCellEdit(project.id, key, parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
          />
        );
      case 'remarks':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleCellEdit(project.id, key, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded resize-none"
            rows={2}
          />
        );
      case 'assigneeNotes':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleCellEdit(project.id, key, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded resize-none"
            rows={2}
          />
        );
      case 'attachments':
        return (
          <div className="text-sm text-gray-600">
            {Array.isArray(value) ? `${value.length} files` : 'No files'}
          </div>
        );
      case 'progress':
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${value || 0}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 w-8">{value || 0}%</span>
          </div>
        );
      case 'rating':
        return (
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleCellEdit(project.id, key, star)}
                className={`text-lg ${star <= (value || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        );
      case 'colorIndicator':
        return (
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: value || '#6B7280' }}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleCellEdit(project.id, key, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-xl border border-gray-200">
      {/* Toolbar - Fixed at top */}
      <div className="flex-shrink-0">
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
          selectedCount={selectedProjects.size}
          onBulkDelete={() => {
            setProjects(prev => prev.filter(p => !selectedProjects.has(p.id)));
            setSelectedProjects(new Set());
          }}
        />
      </div>

      {/* Column Headers with Drag and Drop */}
      <div className="flex-shrink-0 border-b border-gray-200">
        <DragDropContext onDragEnd={handleColumnReorder}>
          <Droppable droppableId="columns" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex bg-gradient-to-r from-gray-100 to-gray-200"
              >
                {table.getHeaderGroups().map(headerGroup => (
                  headerGroup.headers.map((header, index) => (
                    <Draggable key={header.id} draggableId={header.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`px-3 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-300 transition-colors bg-gradient-to-r from-gray-100 to-gray-200 whitespace-nowrap ${
                            snapshot.isDragging ? 'opacity-50' : ''
                          }`}
                          style={{ width: columnDefinitions.find(col => col.key === header.id)?.width || 150 }}
                        >
                          <div className="flex items-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() && (
                              <span>
                                {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Table Container - Single scrollable area with proper height */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <AnimatePresence>
                {table.getRowModel().rows.map((row, index) => (
                  <React.Fragment key={row.original.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-3 py-2">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {/* Subtask Table */}
                    {row.original.subtasks && 
                     expandedRows.has(row.original.id) && (
                      <tr>
                        <td colSpan={row.getVisibleCells().length} className="p-0">
                          <SubtaskTable
                            subtasks={row.original.subtasks}
                            onSubtaskUpdate={handleSubtaskUpdate}
                            parentId={row.original.id}
                            columnOrder={columnOrder}
                            columnDefinitions={columnDefinitions}
                            onAddSubtask={() => handleAddSubtask(row.original.id)}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </DndContext>
          </tbody>
        </table>
      </div>

      {/* Pagination - Fixed at bottom */}
      <div className="flex-shrink-0 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
      </div>

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

      {/* Data list for autocomplete */}
      <datalist id="owners">
        {autoSuggestData.owners.map(owner => (
          <option key={owner} value={owner} />
        ))}
      </datalist>
    </div>
  );
};
