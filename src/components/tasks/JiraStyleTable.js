import React, { useState, useCallback } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

// Badge component for status
const StatusBadge = ({ status }) => {
  const colors = {
    "TO DO": "bg-gray-200 text-gray-700",
    "IN PROGRESS": "bg-yellow-200 text-yellow-800",
    "DONE": "bg-green-200 text-green-800",
  };

  return (
    <span
      className={`px-1 py-1 rounded text-xs font-semibold ${
        colors[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

// Sortable table header cell
const SortableHeader = ({ id, children, className = "" }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <th 
      ref={setNodeRef} 
      style={style}
      className={`${className} relative`}
    >
      <div 
        className="flex items-center justify-between cursor-grab"
        {...attributes}
        {...listeners}
      >
        {children}
        <span className="text-gray-400 ml-1">⋮⋮</span>
      </div>
    </th>
  );
};

// Row component
const TableRow = ({ item, isSelected, onToggle, columns }) => {
  return (
    <tr className="border-b hover:bg-gray-50 text-sm">
      <td className="px-3 py-2 border-r min-w-[50px]">
        <div className="flex items-center gap-2">
        <span className="text-gray-400 cursor-grab">⋮⋮</span>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(item.key)}
          className="cursor-pointer"
        />
        </div>
      </td>
      <td className="px-3 py-2 border-r min-w-[100px]">{item.type}</td>
      <td className="px-3 py-2 border-r min-w-[90px]">{item.key}</td>
      {columns.slice(2).map((column) => (
        <td key={column.id} className="px-3 py-2 border-r min-w-[120px]">
          {column.id === 'status' ? (
            <StatusBadge status={item[column.id]} />
          ) : (
            item[column.id]
          )}
        </td>
      ))}
    </tr>
  );
};

// Main Table Component
const JiraStyleTable = ({ data }) => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [columns, setColumns] = useState([
    { id: 'type', label: 'Type', width: 'min-w-[100px]' },
    { id: 'key', label: 'Ref.No', width: 'min-w-[90px]' },
    { id: 'status', label: 'Status', width: 'min-w-[120px]' },
    { id: 'owner', label: 'Owner', width: 'min-w-[120px]' },
    { id: 'projectName', label: 'Project Name', width: 'min-w-[150px]' },
    { id: 'timeline', label: 'Timeline', width: 'min-w-[120px]' },
    { id: 'planDays', label: 'Plan Days', width: 'min-w-[120px]' },
    { id: 'remarks', label: 'Remarks', width: 'min-w-[120px]' },
    { id: 'assigneeNotes', label: 'Assignee Notes', width: 'min-w-[150px]' },
    { id: 'attachments', label: 'Attachments', width: 'min-w-[120px]' },
    { id: 'priority', label: 'Priority', width: 'min-w-[100px]' },
    { id: 'location', label: 'Location', width: 'min-w-[120px]' },
    { id: 'plotNumber', label: 'Plot Number', width: 'min-w-[120px]' },
    { id: 'community', label: 'Community', width: 'min-w-[150px]' },
    { id: 'projectType', label: 'Project Type', width: 'min-w-[120px]' },
    { id: 'projectFloor', label: 'Project Floor', width: 'min-w-[120px]' },
    { id: 'developerProject', label: 'Developer Project', width: 'min-w-[150px]' },
    { id: 'autoNumber', label: 'Auto Number', width: 'min-w-[90px]' },
    { id: 'predecessors', label: 'Predecessors', width: 'min-w-[150px]' },
    { id: 'checklist', label: 'Checklist', width: 'min-w-[120px]' },
    { id: 'link', label: 'Link', width: 'min-w-[150px]' },
    { id: 'rating', label: 'Rating', width: 'min-w-[100px]' },
    { id: 'progress', label: 'Progress', width: 'min-w-[120px]' },
    { id: 'color', label: 'Color', width: 'min-w-[100px]' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        // Don't allow reordering the first two columns
        if (oldIndex < 2 || newIndex < 2) return items;
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const toggleSelection = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">My Kanban Project</h2>
        <div className="space-x-2">
          <button className="px-3 py-1 border rounded text-sm">Sort</button>
          <button className="px-3 py-1 border rounded text-sm">Filter</button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full border-collapse bg-white text-left">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="px-3 py-2 border-r min-w-[50px]"></th>
              {/* Fixed first two columns */}
              <th className="px-3 py-2 border-r min-w-[100px]">Type</th>
              <th className="px-3 py-2 border-r min-w-[90px]">Ref.No</th>
              
              {/* Draggable columns */}
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={columns.slice(2).map(col => col.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {columns.slice(2).map((column) => (
                    <SortableHeader 
                      key={column.id} 
                      id={column.id}
                      className={`px-3 py-2 border-r ${column.width}`}
                    >
                      {column.label}
                    </SortableHeader>
                  ))}
                </SortableContext>
              </DndContext>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <TableRow 
                key={item.key} 
                item={item} 
                isSelected={selectedKeys.includes(item.key)}
                onToggle={toggleSelection}
                columns={columns}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JiraStyleTable;
