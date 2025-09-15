import React from 'react';
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DraggableHeader = ({ col, colKey, isSubtaskTable = false, onRemoveColumn }) => {
  const { setNodeRef, attributes, listeners, isDragging, transform, transition } = useSortable({ id: colKey });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  // Define column width classes
  const getColumnWidth = () => {
    switch(colKey) {
      case 'task':
        return 'w-64 min-w-64';
      case 'timeline':
        return 'w-48 min-w-48';
      case 'planDays':
      case 'status':
      case 'priority':
        return 'w-32 min-w-32';
      case 'remarks':
      case 'assigneeNotes':
        return 'w-48 min-w-48';
      case 'checkbox':
        return 'w-16 min-w-16';
      default:
        return 'w-40 min-w-40';
    }
  };
  
  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${getColumnWidth()} ${isDragging ? 'bg-blue-50' : 'bg-white'}`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 cursor-grab" {...attributes} {...listeners}>
          <Bars3Icon className="w-4 h-4 text-gray-400" />
          {col.key === 'checkbox' ? (
            <span className="sr-only">Select</span>
          ) : col.key === 'task' ? (
            isSubtaskTable ? 'TASK NAME' : 'PROJECT NAME'
          ) : (
            col.label || colKey.toUpperCase()
          )}
        </span>
        
        {onRemoveColumn && colKey !== 'task' && colKey !== 'checkbox' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onRemoveColumn(colKey);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="ml-1 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            title={`Hide ${col.label || colKey} column`}
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}
      </div>
    </th>
  );
};

export default DraggableHeader;
