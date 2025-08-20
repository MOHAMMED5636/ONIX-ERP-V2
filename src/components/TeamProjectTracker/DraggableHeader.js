import React from 'react';
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DraggableHeader = ({ col, colKey }) => {
  const { setNodeRef, attributes, listeners, isDragging, transform, transition } = useSortable({ id: colKey });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`px-3 py-2 text-xs font-bold text-gray-500 uppercase bg-white border-b border-gray-100 ${isDragging ? 'bg-blue-50' : ''}`}
    >
      <span className="flex items-center gap-1 cursor-grab">
        <Bars3Icon className="w-4 h-4 text-gray-400" />
        {col.key === 'task' ? 'PROJECT NAME' : col.label}
      </span>
    </th>
  );
};

export default DraggableHeader;

