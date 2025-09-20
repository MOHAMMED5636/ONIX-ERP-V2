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
import StatusDropdown from "./StatusDropdown";

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

  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing || !resizeData.current) return;

      const { columnId, startX, initialWidth } = resizeData.current;
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(80, initialWidth + deltaX); // Minimum width of 80px

      setColumnWidths((prev) => ({
        ...prev,
        [columnId]: newWidth,
      }));
    },
    [isResizing]
  );

  const stopResize = useCallback(() => {
    setIsResizing(false);
    setResizingColumn(null);
    resizeData.current = {};
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", stopResize);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopResize);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
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

    const rect = e.currentTarget.closest("th").getBoundingClientRect();
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
const SortableHeader = ({
  id,
  children,
  className = "",
  width,
  onResizeStart,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: width ? `${width}px` : undefined,
    minWidth: width ? `${width}px` : undefined,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`${className} relative group`}
    >
      <div
        className="flex items-center justify-between cursor-grab gap-1 pr-4 w-full"
        {...attributes}
        {...listeners}
      >
        <span className="truncate">{children}</span>
        <span className="text-gray-400 flex-shrink-0">⋮⋮</span>
      </div>
      <ResizeHandle columnId={id} onResizeStart={onResizeStart} />
    </th>
  );
};

// Regular header cell with resize capability (for non-sortable columns)
const RegularHeader = ({
  id,
  children,
  className = "",
  width,
  onResizeStart,
}) => {
  const style = {
    width: width ? `${width}px` : undefined,
    minWidth: width ? `${width}px` : undefined,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <th style={style} className={`${className} relative group`}>
      <div className="flex items-center justify-between gap-1 pr-4 w-full">
        <span className="truncate">{children}</span>
      </div>
      <ResizeHandle columnId={id} onResizeStart={onResizeStart} />
    </th>
  );
};

// Sortable row component with subtask support
const SortableRow = ({
  item,
  isSelected = false,
  onToggle,
  columns,
  onStatusChange,
  columnWidths,
  statusOptions,
  level = 0,
  hasChildren = false,
  isExpanded = true,
  onToggleExpand,
  isParentExpanded = true,
  addingSubtaskFor,
  setAddingSubtaskFor,
  newSubtaskName,
  setNewSubtaskName,
  addSubtask,
  maxLevel = 2,
  expandedTasks = {},
  selectedKeys = new Set(),
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

  const handleStatusChange = (newStatus) => {
    onStatusChange(item.key, newStatus);
  };

  // If parent is not expanded and this is a child, don't render
  if (level > 0 && !isParentExpanded) {
    return null;
  }

  const canHaveChildren = level < maxLevel - 1;
  const isAtMaxLevel = level === maxLevel - 1;
  const hasNestedSubtasks = hasChildren && item.subtasks?.length > 0;

  const isExpandedState = expandedTasks[item.key] !== false;

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        className={`border-b hover:bg-gray-50 text-sm ${
          isDragging ? "bg-blue-50" : ""
        } ${level === 1 ? 'bg-gray-50' : ''} ${level === 2 ? 'bg-gray-100' : ''}`}
      >
        <td
          className="px-3 py-2 border-r"
          style={{
            ...getCellStyle("checkbox"),
            paddingLeft: `${16 + (level * 24)}px`,
            position: "relative",
          }}
        >
          <div className="flex items-center gap-2">
            {level > 0 && (
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 border-l-2 border-b-2 border-gray-300 rounded-bl-sm"></div>
            )}
            <span
              className="text-gray-400 cursor-grab hover:text-gray-600"
              {...attributes}
              {...listeners}
            >
              ⋮⋮
            </span>
            <input
              type="checkbox"
              checked={selectedKeys.has(item.key)}
              onChange={() => onToggle(item.key)}
              className="cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            {hasNestedSubtasks && (
              <button
                onClick={() => onToggleExpand(item.key)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpandedState ? "▼" : "▶"}
              </button>
            )}
          </div>
        </td>
        <td className="px-3 py-2 border-r" style={getCellStyle("type")}>
          <div className="flex items-center gap-1 group">
            {level === 1 && <span className="text-gray-400">↳</span>}
            {level === 2 && <span className="text-gray-400">↳↳</span>}
            {item.type}
            {/* Show + button for tasks and subtasks (levels 0 and 1) */}
            {level < maxLevel - 1 && (
              <button
                className="text-gray-400 hover:text-gray-600 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddingSubtaskFor(
                    addingSubtaskFor === item.key ? null : item.key
                  );
                  setNewSubtaskName("");
                }}
                title={
                  level === 0 
                    ? "Add subtask" 
                    : level === 1 
                      ? "Add sub-subtask" 
                      : "Add task"
                }
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            )}
          </div>
        </td>
        <td className="px-3 py-2 border-r" style={getCellStyle("key")}>
          {item.key}
        </td>
        {columns.slice(2).map((column) => {
          if (column.id === "status") {
            return (
              <td
                key={column.id}
                className="px-3 py-2 border-r"
                style={getCellStyle(column.id)}
              >
                <StatusDropdown
                  currentStatus={item.status}
                  onStatusChange={handleStatusChange}
                  statusOptions={statusOptions}
                  showExtraOptions={true}
                  className=""
                  disabled={false}
                />
              </td>
            );
          }
          return (
            <td
              key={column.id}
              className="px-3 py-2 border-r"
              style={getCellStyle(column.id)}
            >
              <div className="truncate" title={item[column.id]}>
                {item[column.id]}
              </div>
            </td>
          );
        })}
      </tr>

      {/* Subtask input field */}
      {addingSubtaskFor === item.key && (
        <tr className={level === 0 ? "bg-blue-50" : "bg-blue-100"}>
          <td colSpan={columns.length + 1} className="p-0">
            <div
              className="flex items-center gap-2 pl-8 my-1"
              style={{ paddingLeft: `${40 + (level * 24)}px` }}
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder={
                    level === 0 ? "Add subtask" : level === 1 ? "Add sub-subtask" : "Add task"
                  }
                  value={newSubtaskName}
                  onChange={(e) => setNewSubtaskName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newSubtaskName.trim()) {
                      addSubtask(item.key, newSubtaskName, level + 1);
                    } else if (e.key === "Escape") {
                      setAddingSubtaskFor(null);
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    newSubtaskName.trim() && addSubtask(item.key, newSubtaskName, level + 1)
                  }
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={!newSubtaskName.trim()}
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingSubtaskFor(null)}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Render subtasks if expanded */}
      {hasNestedSubtasks && isExpandedState && item.subtasks.map((subtask) => (
        <SortableRow
          key={subtask.key}
          item={subtask}
          isSelected={selectedKeys.has(subtask.key)}
          onToggle={onToggle}
          columns={columns}
          onStatusChange={onStatusChange}
          columnWidths={columnWidths}
          statusOptions={statusOptions}
          level={level + 1}
          hasChildren={subtask.subtasks && subtask.subtasks.length > 0}
          isExpanded={expandedTasks[subtask.key] !== false}
          onToggleExpand={onToggleExpand}
          isParentExpanded={isExpandedState}
          addingSubtaskFor={addingSubtaskFor}
          setAddingSubtaskFor={setAddingSubtaskFor}
          newSubtaskName={newSubtaskName}
          setNewSubtaskName={setNewSubtaskName}
          addSubtask={addSubtask}
          maxLevel={maxLevel}
          expandedTasks={expandedTasks}
          selectedKeys={selectedKeys}
        />
      ))}
    </>
  );
};

// Subtask input field component
const SubtaskInput = ({ parentKey, onAdd, onCancel, newSubtaskName, setNewSubtaskName }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && newSubtaskName.trim()) {
      onAdd(parentKey, newSubtaskName);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-2 pl-8 my-1">
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Enter subtask name"
          value={newSubtaskName}
          onChange={(e) => setNewSubtaskName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onAdd(parentKey, newSubtaskName)}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={!newSubtaskName.trim()}
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Main Table Component
const JiraStyleTable = ({
  data: initialData = [],
  statusOptions = [
    { value: "TO DO", label: "TO DO", color: "bg-gray-100 text-gray-700" },
    {
      value: "IN PROGRESS",
      label: "IN PROGRESS",
      color: "bg-blue-100 text-blue-700",
    },
    { value: "DONE", label: "DONE", color: "bg-green-100 text-green-700" },
  ],
}) => {
  const [tableData, setTableData] = useState(initialData);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [selectedKeys, setSelectedKeys] = useState(new Set());
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
  const { columnWidths, isResizing, resizingColumn, startResize } =
    useColumnResize();

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

  // Handle status change
  const handleStatusChange = (itemKey, newStatus) => {
    setTableData((items) =>
      items.map((item) =>
        item.key === itemKey ? { ...item, status: newStatus } : item
      )
    );
  };

  const toggleSelection = (key) => {
    setSelectedKeys((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(key)) {
        newSelection.delete(key);
      } else {
        newSelection.add(key);
      }
      return newSelection;
    });
  };

  // Toggle expansion of subtasks
  const toggleTaskExpansion = (taskKey) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  // Add subtask to a parent task
  const addSubtask = (parentKey, subtaskName, targetLevel = 1) => {
    if (!subtaskName.trim()) {
      setAddingSubtaskFor(null);
      return;
    }

    const newSubtask = {
      key: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: targetLevel === 1 ? "Subtask" : "Sub-subtask",
      status: "TO DO",
      name: subtaskName,
      subtasks: [],
      // Add other default fields as needed
    };

    const updateSubtasks = (items) => {
      return items.map((item) => {
        if (item.key === parentKey) {
          return {
            ...item,
            subtasks: [...(item.subtasks || []), newSubtask],
          };
        }

        // Recursively search in subtasks
        if (item.subtasks && item.subtasks.length > 0) {
          return {
            ...item,
            subtasks: updateSubtasks(item.subtasks),
          };
        }

        return item;
      });
    };

    setTableData((prevData) => updateSubtasks(prevData));
    setNewSubtaskName("");
    setAddingSubtaskFor(null);

    // Auto-expand the parent if it's not already expanded
    setExpandedTasks((prev) => ({
      ...prev,
      [parentKey]: true,
    }));
  };

  // Check if a task has subtasks
  const hasSubtasks = (task) => {
    return task.subtasks && task.subtasks.length > 0;
  };

  // State for adding subtask
  const [addingSubtaskFor, setAddingSubtaskFor] = useState(null);
  const [newSubtaskName, setNewSubtaskName] = useState("");

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
            <SortableContext items={tableData.map((item) => item.key)} strategy={verticalListSortingStrategy}>
              <tbody>
                {tableData.map((item) => (
                  <SortableRow
                    key={item.key}
                    item={item}
                    isSelected={selectedKeys.has(item.key)}
                    onToggle={toggleSelection}
                    columns={columns}
                    onStatusChange={handleStatusChange}
                    columnWidths={columnWidths}
                    statusOptions={statusOptions}
                    hasChildren={hasSubtasks(item)}
                    isExpanded={expandedTasks[item.key] !== false}
                    onToggleExpand={toggleTaskExpansion}
                    isParentExpanded={true}
                    addingSubtaskFor={addingSubtaskFor}
                    setAddingSubtaskFor={setAddingSubtaskFor}
                    newSubtaskName={newSubtaskName}
                    setNewSubtaskName={setNewSubtaskName}
                    addSubtask={addSubtask}
                    maxLevel={2}
                    expandedTasks={expandedTasks}
                    selectedKeys={selectedKeys}
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
