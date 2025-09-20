import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import StatusBadge from "./StatusBadge";

// Column resizing hook
const useColumnResize = () => {
  const [columnWidths, setColumnWidths] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState(null);
  const resizeData = useRef({});

  const startResize = useCallback((columnId, startX, initialWidth) => {
    setIsResizing(true);
    setResizingColumn(columnId);
    resizeData.current = {
      columnId,
      startX,
      initialWidth,
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !resizeData.current) return;

    const { columnId, startX, initialWidth } = resizeData.current;
    const deltaX = e.clientX - startX;
    const newWidth = Math.max(80, initialWidth + deltaX); // Minimum width of 80px

    setColumnWidths(prev => ({
      ...prev,
      [columnId]: newWidth,
    }));
  }, [isResizing]);

  const stopResize = useCallback(() => {
    setIsResizing(false);
    setResizingColumn(null);
    resizeData.current = {};
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', stopResize);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, stopResize]);

  return {
    columnWidths,
    isResizing,
    resizingColumn,
    startResize,
  };
};

// Resize handle component
const ResizeHandle = ({ columnId, onResizeStart }) => {
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.closest('th').getBoundingClientRect();
    onResizeStart(columnId, e.clientX, rect.width);
  };

  return (
    <div
      className="absolute right-0 top-0 h-full w-1 cursor-col-resize transition-all group"
      onMouseDown={handleMouseDown}
    >
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-6 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-full h-full rounded"></div>
      </div>
    </div>
  );
};

// Sortable table header cell with resize capability
const SortableHeader = ({ id, children, className = "", width, onResizeStart }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: width ? `${width}px` : undefined,
    minWidth: width ? `${width}px` : undefined,
  };

  return (
    <th 
      ref={setNodeRef} 
      style={style} 
      className={`${className} relative group`}
    >
      <div
        className="flex items-center justify-between cursor-grab gap-1 pr-4"
        {...attributes}
        {...listeners}
      >
        {children}
        <span className="text-gray-400">⋮⋮</span>
      </div>
      <ResizeHandle columnId={id} onResizeStart={onResizeStart} />
    </th>
  );
};

// Regular header cell with resize capability (for non-sortable columns)
const RegularHeader = ({ id, children, className = "", width, onResizeStart }) => {
  const style = {
    width: width ? `${width}px` : undefined,
    minWidth: width ? `${width}px` : undefined,
  };

  return (
    <th style={style} className={`${className} relative group`}>
      <div className="flex items-center justify-between gap-1 pr-4">
        {children}
      </div>
      <ResizeHandle columnId={id} onResizeStart={onResizeStart} />
    </th>
  );
};

// Sortable row component
const SortableRow = ({
  item,
  isSelected,
  onToggle,
  columns,
  onStatusChange,
  columnWidths,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getCellStyle = (columnId) => {
    const width = columnWidths[columnId];
    return width ? { width: `${width}px`, minWidth: `${width}px` } : {};
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b hover:bg-gray-50 text-sm ${
        isDragging ? "bg-blue-50" : ""
      }`}
    >
      <td className="px-3 py-2 border-r" style={getCellStyle('checkbox')}>
        <div className="flex items-center gap-2">
          <span
            className="text-gray-400 cursor-grab hover:text-gray-600"
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </span>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(item.key)}
            className="cursor-pointer"
          />
        </div>
      </td>
      <td className="px-3 py-2 border-r" style={getCellStyle('type')}>{item.type}</td>
      <td className="px-3 py-2 border-r" style={getCellStyle('key')}>{item.key}</td>
      {columns.slice(2).map((column) => (
        <td 
          key={column.id} 
          className="px-3 py-2 border-r" 
          style={getCellStyle(column.id)}
        >
          {column.id === "status" ? (
            <StatusBadge
              status={item[column.id]}
              onStatusChange={onStatusChange}
              itemKey={item.key}
            />
          ) : (
            <div className="truncate" title={item[column.id]}>
              {item[column.id]}
            </div>
          )}
        </td>
      ))}
    </tr>
  );
};

// Main Table Component
const JiraStyleTable = ({ data: initialData = [] }) => {
  const [tableData, setTableData] = useState(initialData);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [columns, setColumns] = useState([
    { id: "type", label: "Type", width: "min-w-[100px]" },
    { id: "key", label: "Ref.No", width: "min-w-[90px]" },
    { id: "status", label: "Status", width: "min-w-[120px]" },
    { id: "owner", label: "Owner", width: "min-w-[120px]" },
    { id: "projectName", label: "Project Name", width: "min-w-[150px]" },
    { id: "timeline", label: "Timeline", width: "min-w-[120px]" },
    { id: "planDays", label: "Plan Days", width: "min-w-[120px]" },
    { id: "remarks", label: "Remarks", width: "min-w-[120px]" },
    { id: "assigneeNotes", label: "Assignee Notes", width: "min-w-[150px]" },
    { id: "attachments", label: "Attachments", width: "min-w-[120px]" },
    { id: "priority", label: "Priority", width: "min-w-[100px]" },
    { id: "location", label: "Location", width: "min-w-[120px]" },
    { id: "plotNumber", label: "Plot Number", width: "min-w-[120px]" },
    { id: "community", label: "Community", width: "min-w-[150px]" },
    { id: "projectType", label: "Project Type", width: "min-w-[120px]" },
    { id: "projectFloor", label: "Project Floor", width: "min-w-[120px]" },
    {
      id: "developerProject",
      label: "Developer Project",
      width: "min-w-[150px]",
    },
    { id: "autoNumber", label: "Auto Number", width: "min-w-[90px]" },
    { id: "predecessors", label: "Predecessors", width: "min-w-[150px]" },
    { id: "checklist", label: "Checklist", width: "min-w-[120px]" },
    { id: "link", label: "Link", width: "min-w-[150px]" },
    { id: "rating", label: "Rating", width: "min-w-[100px]" },
    { id: "progress", label: "Progress", width: "min-w-[120px]" },
    { id: "color", label: "Color", width: "min-w-[100px]" },
  ]);

  // Column resizing functionality
  const { columnWidths, isResizing, resizingColumn, startResize } = useColumnResize();

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

  // Handle status change
  const handleStatusChange = useCallback((itemKey, newStatus) => {
    setTableData((prevData) =>
      prevData.map((item) =>
        item.key === itemKey ? { ...item, status: newStatus } : item
      )
    );
  }, []);

  // Handle column reordering
  const handleColumnDragEnd = useCallback((event) => {
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

  // Handle row reordering
  const handleRowDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTableData((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id);
        const newIndex = items.findIndex((item) => item.key === over?.id);

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
          <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
            Sort
          </button>
          <button className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full border-collapse bg-white text-left">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <RegularHeader
                id="checkbox"
                className="px-3 py-2 border-r min-w-[50px]"
                width={columnWidths.checkbox}
                onResizeStart={startResize}
              />
              
              <RegularHeader
                id="type"
                className="px-3 py-2 border-r min-w-[100px]"
                width={columnWidths.type}
                onResizeStart={startResize}
              >
                Type
              </RegularHeader>
              
              <RegularHeader
                id="key"
                className="px-3 py-2 border-r min-w-[90px]"
                width={columnWidths.key}
                onResizeStart={startResize}
              >
                Ref.No
              </RegularHeader>

              {/* Draggable columns with resize handles */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleColumnDragEnd}
              >
                <SortableContext
                  items={columns.slice(2).map((col) => col.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {columns.slice(2).map((column) => (
                    <SortableHeader
                      key={column.id}
                      id={column.id}
                      className={`px-3 py-2 border-r ${column.width}`}
                      width={columnWidths[column.id]}
                      onResizeStart={startResize}
                    >
                      {column.label}
                    </SortableHeader>
                  ))}
                </SortableContext>
              </DndContext>
            </tr>
          </thead>

          {/* Draggable rows */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleRowDragEnd}
          >
            <SortableContext
              items={tableData.map((item) => item.key)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {tableData.map((item) => (
                  <SortableRow
                    key={item.key}
                    item={item}
                    isSelected={selectedKeys.includes(item.key)}
                    onToggle={toggleSelection}
                    columns={columns}
                    onStatusChange={handleStatusChange}
                    columnWidths={columnWidths}
                  />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  );
};

export default JiraStyleTable;