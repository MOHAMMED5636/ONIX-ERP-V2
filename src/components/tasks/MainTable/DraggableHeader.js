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
  
  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`px-3 py-2 text-xs font-bold text-gray-500 uppercase bg-white border-b border-gray-100 ${isDragging ? 'bg-blue-50' : ''} ${
        colKey === 'referenceNumber' ? 'w-32 min-w-32' : ''
      } ${
        colKey === 'remarks' || colKey === 'assigneeNotes' ? 'w-48 min-w-48' : ''
      } ${
        colKey === 'plotNumber' || colKey === 'community' || colKey === 'projectType' ? 'w-40 min-w-40' : ''
      } ${
        colKey === 'projectFloor' || colKey === 'developerProject' ? 'w-40 min-w-40' : ''
      } ${
        colKey === 'owner' ? 'w-36 min-w-36' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="flex items-center gap-1 cursor-grab flex-1" {...attributes} {...listeners}>
          <Bars3Icon className="w-4 h-4 text-gray-400" />
          {col.key === 'checkbox' ? (
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">CHECKBOX</span>
          ) : col.key === 'task' ? (isSubtaskTable ? 'TASK NAME' : 'PROJECT NAME') : 
            col.key === 'owner' ? (isSubtaskTable ? 'EMPLOYEE' : 'PROJECT MANAGER') : col.label}
        </span>
        
        {/* Minimize/Close button - only show for removable columns */}
        {onRemoveColumn && colKey !== 'task' && colKey !== 'checkbox' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onRemoveColumn) {
                onRemoveColumn(colKey);
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className="ml-1 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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



