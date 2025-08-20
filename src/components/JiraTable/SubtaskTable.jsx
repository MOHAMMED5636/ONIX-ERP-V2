import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
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
import { AnimatePresence } from 'framer-motion';
import { DateCell } from './DateCell';
import { ChecklistCell } from './ChecklistCell';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { columnDefinitions, autoSuggestData } from './data';

const columnHelper = createColumnHelper();

export const SubtaskTable = ({ 
  subtasks, 
  onSubtaskUpdate, 
  parentId, 
  columnOrder,
  selectedSubtasks,
  onSubtaskSelect,
  onSubtaskDeselect,
  onSubtaskSelectAll,
  onSubtaskDeselectAll
}) => {
  const [sorting, setSorting] = useState([]);
  const [filters, setFilters] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Create columns for TanStack Table with the same structure as main table
  const columns = useMemo(() => {
    // Use the same column order as main table but exclude checkbox
    const subtaskColumnOrder = columnOrder.filter(colKey => colKey !== 'checkbox');
    
    return subtaskColumnOrder.map(colKey => {
      const colDef = columnDefinitions.find(col => col.key === colKey);
      if (!colDef) return null;

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
                {colDef.options?.map(option => (
                  <DropdownMenuItem 
                    key={option} 
                    onClick={() => handleSubtaskEdit(row.original.id, colKey, option)}
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
              onChange={(newValue) => handleSubtaskEdit(row.original.id, colKey, newValue)}
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
              onChange={(newValue) => handleSubtaskEdit(row.original.id, colKey, newValue)}
            />
          ),
        });
      }
      
      return columnHelper.accessor(colKey, {
        header: colDef.label,
        cell: ({ row, getValue }) => (
          <div className="px-2 py-1">
            {renderSubtaskCell(row.original, colKey, getValue())}
          </div>
        ),
      });
    }).filter(Boolean);
  }, [columnOrder]);

  const table = useReactTable({
    data: subtasks,
    columns,
    state: {
      sorting,
      columnFilters: Object.entries(filters).map(([key, value]) => ({
        id: key,
        value,
      })),
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleSubtaskEdit = (subtaskId, field, value) => {
    const updatedSubtasks = subtasks.map(subtask =>
      subtask.id === subtaskId ? { ...subtask, [field]: value } : subtask
    );
    onSubtaskUpdate(parentId, updatedSubtasks);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = subtasks.findIndex(subtask => subtask.id === active.id);
      const newIndex = subtasks.findIndex(subtask => subtask.id === over.id);
      
      const reorderedSubtasks = arrayMove(subtasks, oldIndex, newIndex);
      onSubtaskUpdate(parentId, reorderedSubtasks);
    }
  };

  const renderSubtaskCell = (subtask, key, value) => {
    switch (key) {
      case 'projectName':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleSubtaskEdit(subtask.id, key, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
          />
        );
      case 'referenceNumber':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleSubtaskEdit(subtask.id, key, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
          />
        );
      case 'owner':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleSubtaskEdit(subtask.id, key, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
            list="owners"
          />
        );
      case 'planDays':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleSubtaskEdit(subtask.id, key, parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
          />
        );
      case 'remarks':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleSubtaskEdit(subtask.id, key, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded resize-none"
            rows={2}
          />
        );
      case 'assigneeNotes':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleSubtaskEdit(subtask.id, key, e.target.value)}
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
                onClick={() => handleSubtaskEdit(subtask.id, key, star)}
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
            onChange={(e) => handleSubtaskEdit(subtask.id, key, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none rounded"
          />
        );
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Subtasks</h4>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{subtasks.length} subtasks</span>
          <button
            onClick={onSubtaskSelectAll}
            className="text-blue-600 hover:text-blue-800"
          >
            Select All
          </button>
          <button
            onClick={onSubtaskDeselectAll}
            className="text-blue-600 hover:text-blue-800"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {/* Drag handle column */}
              <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider w-8 bg-gray-100">
                <span className="sr-only">Drag</span>
              </th>
              {table.getHeaderGroups().map(headerGroup => (
                headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors whitespace-nowrap bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
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
                  </th>
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
                  <tr
                    key={row.original.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Drag handle */}
                    <td className="px-3 py-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full cursor-move" />
                    </td>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-3 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </AnimatePresence>
            </DndContext>
          </tbody>
        </table>
      </div>

      {/* Data list for autocomplete */}
      <datalist id="owners">
        {autoSuggestData.owners.map(owner => (
          <option key={owner} value={owner} />
        ))}
      </datalist>
    </div>
  );
};
