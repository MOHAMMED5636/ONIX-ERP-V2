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
import { FaChevronDown } from "react-icons/fa";

// Status options for dropdown
const STATUS_OPTIONS = [
  { value: "TO DO", label: "TO DO", color: "bg-gray-200 text-gray-700" },
  {
    value: "IN PROGRESS",
    label: "IN PROGRESS",
    color: "bg-yellow-200 text-yellow-800",
  },
  { value: "DONE", label: "DONE", color: "bg-green-200 text-green-800" },
];

// Interactive Status Badge with dropdown
const StatusBadge = ({ status, onStatusChange, itemKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    position: "below",
  });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const colors = {
    "TO DO": "bg-gray-200 text-gray-700",
    "IN PROGRESS": "bg-yellow-200 text-yellow-800",
    DONE: "bg-green-200 text-green-800",
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0, position: "below" };

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 200; // Approximate dropdown height

    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    let top, position;

    // If there's not enough space below but enough above, position above
    if (spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight) {
      top = buttonRect.top - dropdownHeight;
      position = "above";
    } else {
      top = buttonRect.bottom + 2;
      position = "below";
    }

    return {
      top: top,
      left: buttonRect.left,
      position: position,
    };
  };

  const handleToggleDropdown = () => {
    if (!isOpen) {
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
    }
    setIsOpen(!isOpen);
  };

  const handleStatusSelect = (newStatus) => {
    onStatusChange(itemKey, newStatus);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <span
          ref={buttonRef}
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold cursor-pointer hover:opacity-80 whitespace-nowrap ${
            colors[status] || "bg-gray-100 text-gray-600"
          }`}
          onClick={handleToggleDropdown}
        >
          {status}
          <FaChevronDown
            className={`ml-1 text-xs transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </div>

      {isOpen && (
        <div
          className="fixed bg-white border border-gray-300 rounded-md shadow-xl min-w-[160px] py-1"
          style={{
            zIndex: 9999,
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <div
              key={option.value}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm flex items-center"
              onClick={() => handleStatusSelect(option.value)}
            >
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${option.color}`}
              >
                {option.label}
              </span>
            </div>
          ))}
          <hr className="my-1 border-gray-200" />
          <div className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-600">
            Create status
          </div>
          <div className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-600">
            Edit status
          </div>
        </div>
      )}
    </>
  );
};

// Sortable table header cell
const SortableHeader = ({ id, children, className = "" }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <th ref={setNodeRef} style={style} className={`${className} relative`}>
      <div
        className="flex items-center justify-between cursor-grab gap-1"
        {...attributes}
        {...listeners}
      >
        {children}
        <span className="text-gray-400">⋮⋮</span>
      </div>
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

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b hover:bg-gray-50 text-sm ${
        isDragging ? "bg-blue-50" : ""
      }`}
    >
      <td className="px-3 py-2 border-r min-w-[50px]">
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
      <td className="px-3 py-2 border-r min-w-[100px]">{item.type}</td>
      <td className="px-3 py-2 border-r min-w-[90px]">{item.key}</td>
      {columns.slice(2).map((column) => (
        <td key={column.id} className="px-3 py-2 border-r min-w-[120px]">
          {column.id === "status" ? (
            <StatusBadge
              status={item[column.id]}
              onStatusChange={onStatusChange}
              itemKey={item.key}
            />
          ) : (
            item[column.id]
          )}
        </td>
      ))}
    </tr>
  );
};

// Main Table Component
const JiraStyleTable = ({ data: initialData }) => {
  const [data, setData] = useState(initialData);
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
    setData((prevData) =>
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
      setData((items) => {
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
              <th className="px-3 py-2 border-r min-w-[50px]"></th>
              {/* Fixed first two columns */}
              <th className="px-3 py-2 border-r min-w-[100px]">Type</th>
              <th className="px-3 py-2 border-r min-w-[90px]">Ref.No</th>

              {/* Draggable columns */}
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
              items={data.map((item) => item.key)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {data.map((item) => (
                  <SortableRow
                    key={item.key}
                    item={item}
                    isSelected={selectedKeys.includes(item.key)}
                    onToggle={toggleSelection}
                    columns={columns}
                    onStatusChange={handleStatusChange}
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
