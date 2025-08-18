// SortableSubtaskRow component for drag-and-drop functionality
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon } from '@heroicons/react/24/outline';

const SortableSubtaskRow = ({ sub, subIdx, task, children }) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ id: sub.id });

  return (
    <tr
      ref={setNodeRef}
      style={{ 
        transform: CSS.Transform.toString(transform), 
        transition 
      }}
      className={isDragging ? "bg-blue-50" : ""}
      {...attributes}
    >
      {/* Drag handle cell */}
      <td {...listeners} style={{ cursor: 'grab' }}>
        <Bars3Icon className="w-5 h-5 text-gray-400" />
      </td>
      {children}
    </tr>
  );
};

export default SortableSubtaskRow;
