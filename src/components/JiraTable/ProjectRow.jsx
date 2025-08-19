import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon, ChevronRightIcon, Bars3Icon, PencilIcon } from '@heroicons/react/24/outline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { columnDefinitions } from './data';

export const ProjectRow = ({ 
  row, 
  index, 
  expandedRows, 
  onToggleExpansion, 
  onCellEdit, 
  autoSuggestData 
}) => {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.original.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isExpanded = expandedRows.has(row.original.id);
  const hasSubtasks = row.original.subtasks && row.original.subtasks.length > 0;
  const isSubtask = row.original.level === 1;

  const handleCellClick = (field, value) => {
    setEditingCell(field);
    setEditValue(value || '');
  };

  const handleCellSave = () => {
    if (editingCell) {
      onCellEdit(row.original.id, editingCell, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const renderCell = (field, value) => {
    const column = columnDefinitions.find(col => col.key === field);
    
    if (editingCell === field) {
      if (column?.type === 'textarea') {
        return (
          <div className="space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleCellSave();
                if (e.key === 'Escape') handleCellCancel();
              }}
              className="w-full h-20 p-2 text-xs border border-blue-500 rounded resize-none focus:border-blue-600"
              autoFocus
            />
            <div className="flex space-x-1">
              <button
                onClick={handleCellSave}
                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={handleCellCancel}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      }
      
      return (
        <div className="flex items-center space-x-1">
          <Input
            type={column?.type === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCellSave();
              if (e.key === 'Escape') handleCellCancel();
            }}
            onBlur={handleCellSave}
            className="h-6 text-xs border-blue-500 focus:border-blue-600"
            autoFocus
          />
          <div className="flex space-x-1">
            <button
              onClick={handleCellSave}
              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
            >
              ✓
            </button>
            <button
              onClick={handleCellCancel}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      );
    }

    switch (column?.type) {
      case 'text':
        return (
          <div 
            className="text-sm cursor-pointer hover:bg-gray-50 px-1 py-1 rounded transition-colors group relative"
            onClick={() => handleCellClick(field, value)}
            title="Click to edit"
          >
            <span>{value || '-'}</span>
            <PencilIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 absolute right-1 top-1/2 transform -translate-y-1/2 transition-opacity" />
          </div>
        );
      
      case 'number':
        return (
          <div 
            className="text-sm cursor-pointer hover:bg-gray-50 px-1 py-1 rounded transition-colors group relative"
            onClick={() => handleCellClick(field, value)}
            title="Click to edit"
          >
            <span>{value || 0}</span>
            <PencilIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 absolute right-1 top-1/2 transform -translate-y-1/2 transition-opacity" />
          </div>
        );
      
      case 'textarea':
        return (
          <div 
            className="text-sm cursor-pointer hover:bg-gray-50 px-1 py-1 rounded max-w-xs truncate transition-colors group relative"
            onClick={() => handleCellClick(field, value)}
            title={value || "Click to edit"}
          >
            <span>{value || '-'}</span>
            <PencilIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 absolute right-1 top-1/2 transform -translate-y-1/2 transition-opacity" />
          </div>
        );
      
      case 'dropdown':
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-6 px-2 text-xs"
                style={{
                  backgroundColor: getStatusColor(value),
                  color: 'white'
                }}
              >
                {value || 'Select'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {column.options?.map(option => (
                <DropdownMenuItem 
                  key={option} 
                  onClick={() => onCellEdit(row.original.id, field, option)}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      
      case 'person':
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 px-2 text-xs">
                {value || 'Select Owner'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {autoSuggestData.owners.map(owner => (
                <DropdownMenuItem 
                  key={owner} 
                  onClick={() => onCellEdit(row.original.id, field, owner)}
                >
                  {owner}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      
      case 'daterange':
        return (
          <div className="text-xs">
            {value?.startDate && value?.endDate 
              ? `${value.startDate} - ${value.endDate}`
              : 'Set dates'
            }
          </div>
        );
      
      case 'file':
        return (
          <div className="text-xs">
            {Array.isArray(value) && value.length > 0 
              ? `${value.length} file(s)`
              : 'No files'
            }
          </div>
        );
      
      case 'checklist':
        return (
          <div className="text-xs">
            {Array.isArray(value) 
              ? `${value.filter(item => item.completed).length}/${value.length}`
              : '0/0'
            }
          </div>
        );
      
      case 'rating':
        return (
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                className="text-yellow-400 cursor-pointer"
                onClick={() => onCellEdit(row.original.id, field, star)}
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
            className="w-3 h-3 rounded-full border cursor-pointer"
            style={{ backgroundColor: value || '#ccc' }}
            onClick={() => {
              const color = prompt('Enter color (hex):', value || '#000000');
              if (color) onCellEdit(row.original.id, field, color);
            }}
          />
        );
      
      case 'url':
        return (
          <div className="group relative">
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
            <button
              onClick={() => handleCellClick(field, value)}
              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit URL"
            >
              <PencilIcon className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        );
      
      default:
        return (
          <div 
            className="text-sm cursor-pointer hover:bg-gray-50 px-1 py-1 rounded transition-colors group relative"
            onClick={() => handleCellClick(field, value)}
            title="Click to edit"
          >
            <span>{value || '-'}</span>
            <PencilIcon className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 absolute right-1 top-1/2 transform -translate-y-1/2 transition-opacity" />
          </div>
        );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return '#10B981';
      case 'In Progress': return '#F59E0B';
      case 'To Do': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <motion.tr
      ref={setNodeRef}
      style={style}
      className={`bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-b border-gray-100 ${isDragging ? 'opacity-50' : ''} ${isSubtask ? 'bg-gray-25' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Drag handle */}
      <td className="px-3 py-4 align-middle w-12">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:bg-gray-100 p-1 rounded"
        >
          <Bars3Icon className="w-4 h-4 text-gray-400" />
        </div>
      </td>

      {/* Expand/collapse button */}
      <td className="px-3 py-4 align-middle w-12">
        {hasSubtasks && (
          <button
            onClick={() => onToggleExpansion(row.original.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}
      </td>

      {/* Data cells */}
      {row.getVisibleCells().map(cell => (
        <td
          key={cell.id}
          className="px-3 py-4 align-middle whitespace-nowrap"
          style={{ width: cell.column.getSize() }}
        >
          <div style={{ paddingLeft: isSubtask ? '20px' : '0' }}>
            {renderCell(cell.column.id, cell.getValue())}
          </div>
        </td>
      ))}
    </motion.tr>
  );
};
