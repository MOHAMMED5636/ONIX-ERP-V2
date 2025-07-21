import React, { useState } from "react";
import {
  PaperClipIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  AtSymbolIcon,
  PaperAirplaneIcon
} from "@heroicons/react/24/outline";
import TaskDrawer from "./TaskDrawer";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRef } from "react";

// --- COLUMN DEFINITIONS ---
// Now each column has: key, label, type, options (for dropdowns, etc.)
const initialColumns = [
  { key: "checkbox", label: "", type: "checkbox" },
  { key: "name", label: "Task", type: "text" },
  { key: "owner", label: "Owner", type: "dropdown", options: [
    { value: "alice", label: "Alice", avatar: "AL", color: "bg-pink-200 text-pink-700" },
    { value: "bob", label: "Bob", avatar: "BO", color: "bg-blue-200 text-blue-700" },
    { value: "charlie", label: "Charlie", avatar: "CH", color: "bg-green-200 text-green-700" },
  ] },
  { key: "status", label: "Status", type: "dropdown", options: [
    { value: "not_started", label: "Not Started", color: "bg-gray-200 text-gray-700" },
    { value: "working", label: "Working on it", color: "bg-yellow-200 text-yellow-800" },
    { value: "done", label: "Done", color: "bg-green-200 text-green-800" },
    { value: "stuck", label: "Stuck", color: "bg-red-200 text-red-800" },
  ] },
  { key: "due", label: "Due date", type: "date" },
  { key: "priority", label: "Priority", type: "dropdown", options: [
    { value: "low", label: "Low", color: "bg-blue-100 text-blue-700" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
    { value: "high", label: "High", color: "bg-red-100 text-red-700" },
  ] },
  { key: "notes", label: "Notes", type: "text" },
  { key: "autoNumber", label: "Auto Number", type: "number", readonly: true },
  { key: "location", label: "Location", type: "text" },
  { key: "rating", label: "Rating", type: "rating" },
  { key: "progress", label: "Progress", type: "progress" },
  { key: "color", label: "Color Picker", type: "color" },
  { key: "files", label: "Files", type: "file" },
  { key: "timeline", label: "Timeline", type: "daterange" },
  { key: "updated", label: "Last updated", type: "readonly" },
  { key: "options", label: "", type: "options" },
  { key: "chat", label: "Chat", type: "chat" },
  { key: "link", label: "Link", type: "link" },
  { key: "add", label: <button className="w-6 h-6 flex items-center justify-center rounded bg-blue-100 hover:bg-blue-200 text-blue-600"><PlusIcon className="w-4 h-4" /></button>, type: "add" },
];

// --- DEMO TASK DATA ---
// Each row is now an object with values keyed by column key
const demoTasks = [
  {
    group: "To-Do",
    color: "border-blue-500",
    tasks: [
      {
        checkbox: false,
        name: "New task",
        owner: "alice",
        status: "not_started",
        due: "2024-07-17",
        priority: "low",
        notes: "",
        autoNumber: 1,
        location: "Dubai",
        rating: 3,
        progress: 70,
        color: "#60a5fa",
        files: null,
        timeline: ["2024-07-17", "2024-07-18"],
        updated: "5 hours ago",
        options: null,
        chat: null,
        link: "",
        subtasks: [
          {
            checkbox: false,
            name: "Subtask 1",
            owner: "bob",
            status: "working",
            due: "2024-07-18",
            priority: "medium",
            notes: "Subtask notes",
            autoNumber: 101,
            location: "Dubai",
            rating: 4,
            progress: 50,
            color: "#fbbf24",
            files: null,
            timeline: ["2024-07-18", "2024-07-19"],
            updated: "4 hours ago",
            options: null,
            chat: null,
            link: "",
          }
        ]
      },
      {
        checkbox: false,
        name: "building construction",
        owner: "bob",
        status: "working",
        due: "2024-07-18",
        priority: "low",
        notes: "Action items",
        autoNumber: 2,
        location: "--",
        rating: 4,
        progress: 40,
        color: "#fbbf24",
        files: null,
        timeline: ["2024-07-17", "2024-07-18"],
        updated: "5 hours ago",
        options: null,
        chat: null,
        link: "",
        subtasks: [
          {
            checkbox: false,
            name: "Subtask 2",
            owner: "alice",
            status: "not_started",
            due: "2024-07-19",
            priority: "low",
            notes: "Subtask for building",
            autoNumber: 102,
            location: "--",
            rating: 2,
            progress: 20,
            color: "#60a5fa",
            files: null,
            timeline: ["2024-07-19", "2024-07-20"],
            updated: "3 hours ago",
            options: null,
            chat: null,
            link: "",
          }
        ]
      },
      {
        checkbox: false,
        name: "architecture design",
        owner: "charlie",
        status: "done",
        due: "2024-07-19",
        priority: "high",
        notes: "Meeting notes",
        autoNumber: 3,
        location: "Abu Dhabi",
        rating: 5,
        progress: 100,
        color: "#34d399",
        files: null,
        timeline: ["2024-07-19", "2024-07-20"],
        updated: "5 hours ago",
        options: null,
        chat: null,
        link: "",
        subtasks: [
          {
            checkbox: false,
            name: "Subtask 3",
            owner: "charlie",
            status: "done",
            due: "2024-07-20",
            priority: "high",
            notes: "Subtask for design",
            autoNumber: 103,
            location: "Abu Dhabi",
            rating: 5,
            progress: 100,
            color: "#34d399",
            files: null,
            timeline: ["2024-07-20", "2024-07-21"],
            updated: "2 hours ago",
            options: null,
            chat: null,
            link: "",
          }
        ]
      },
      {
        checkbox: false,
        name: "mep design",
        owner: "alice",
        status: "stuck",
        due: "2024-07-21",
        priority: "medium",
        notes: "Other",
        autoNumber: 4,
        location: "--",
        rating: 2,
        progress: 10,
        color: "#f87171",
        files: null,
        timeline: ["2024-07-21", "2024-07-22"],
        updated: "5 hours ago",
        options: null,
        chat: null,
        link: "",
        subtasks: [
          {
            checkbox: false,
            name: "Subtask 4",
            owner: "bob",
            status: "stuck",
            due: "2024-07-22",
            priority: "medium",
            notes: "Subtask for mep",
            autoNumber: 104,
            location: "--",
            rating: 1,
            progress: 10,
            color: "#f87171",
            files: null,
            timeline: ["2024-07-22", "2024-07-23"],
            updated: "1 hour ago",
            options: null,
            chat: null,
            link: "",
          }
        ]
      },
    ],
  },
  {
    group: "Completed",
    color: "border-green-500",
    tasks: [
      {
        checkbox: false,
        name: "Completed task",
        owner: "bob",
        status: "done",
        due: "2024-07-17",
        priority: "low",
        notes: "",
        autoNumber: 5,
        location: "Sharjah",
        rating: 4,
        progress: 100,
        color: "#6366f1",
        files: null,
        timeline: ["2024-07-17", "2024-07-22"],
        updated: "1 hour ago",
        options: null,
        chat: null,
        link: "",
        subtasks: [
          {
            checkbox: false,
            name: "Subtask 5",
            owner: "alice",
            status: "done",
            due: "2024-07-18",
            priority: "low",
            notes: "Completed subtask",
            autoNumber: 105,
            location: "Sharjah",
            rating: 3,
            progress: 100,
            color: "#6366f1",
            files: null,
            timeline: ["2024-07-18", "2024-07-19"],
            updated: "1 hour ago",
            options: null,
            chat: null,
            link: "",
          }
        ]
      },
    ],
  },
];

// --- DRAGGABLE COLUMN HEADER ---
function DraggableHeader({ column, index, listeners, attributes, isDragging, style }) {
  return (
    <th
      {...attributes}
      {...listeners}
      className={`py-3 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-left whitespace-nowrap bg-white ${isDragging ? 'opacity-60' : ''}`}
      style={style}
      scope="col"
    >
      {column.label}
    </th>
  );
}

// --- GENERIC CELL EDITOR ---
function CellEditor({ type, value, options, onChange, readonly }) {
  const inputRef = useRef();
  switch (type) {
    case "text":
      return <input type="text" className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-200" value={value || ""} onChange={e => onChange(e.target.value)} disabled={readonly} ref={inputRef} />;
    case "dropdown":
      // Custom pill badge for status and priority
      if (readonly || !onChange) {
        // Color mapping for status
        if (options && options.length && options.some(opt => ["done","stuck","working","not_started"].includes(opt.value))) {
          let color = "bg-gray-400 text-white";
          if (value === "done") color = "bg-green-500 text-white";
          else if (value === "stuck") color = "bg-red-500 text-white";
          else if (value === "working") color = "bg-yellow-500 text-white";
          else if (value === "not_started") color = "bg-gray-400 text-white";
          const label = options.find(opt => opt.value === value)?.label || value;
          return <span className={`rounded-md px-2 py-1 text-sm font-semibold ${color}`}>{label}</span>;
        }
        // Color mapping for priority
        if (options && options.length && options.some(opt => ["low","medium","high"].includes(opt.value))) {
          let color = "bg-blue-400 text-white";
          if (value === "low") color = "bg-blue-400 text-white";
          else if (value === "medium") color = "bg-yellow-500 text-white";
          else if (value === "high") color = "bg-red-500 text-white";
          const label = options.find(opt => opt.value === value)?.label || value;
          return <span className={`rounded-md px-2 py-1 text-sm font-semibold ${color}`}>{label}</span>;
        }
      }
      // Default dropdown for other cases
      return (
        <select className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-200" value={value || ""} onChange={e => onChange(e.target.value)} disabled={readonly}>
          <option value="">Select...</option>
          {options && options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      );
    case "date":
      return <input type="date" className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-200" value={value || ""} onChange={e => onChange(e.target.value)} disabled={readonly} ref={inputRef} />;
    case "number":
      return <input type="number" className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-200" value={value || ""} onChange={e => onChange(Number(e.target.value))} disabled={readonly} ref={inputRef} />;
    case "rating":
      return (
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(star => (
            <button key={star} type="button" className={star <= (value || 0) ? "text-yellow-400" : "text-gray-300"} onClick={() => !readonly && onChange(star)} disabled={readonly}>★</button>
          ))}
        </div>
      );
    case "progress":
      return (
        <div className="flex items-center gap-2">
          <input type="range" min={0} max={100} value={value || 0} onChange={e => onChange(Number(e.target.value))} className="w-24" disabled={readonly} />
          <span className="text-xs text-gray-500">{value || 0}%</span>
        </div>
      );
    case "color":
      return <input type="color" value={value || "#cccccc"} onChange={e => onChange(e.target.value)} className="w-8 h-8 p-0 border-0" disabled={readonly} />;
    case "file":
      return <input type="file" onChange={e => onChange(e.target.files[0])} className="w-full" disabled={readonly} />;
    case "daterange":
      return (
        <div className="flex gap-1 items-center">
          <input type="date" value={value?.[0] || ""} onChange={e => onChange([e.target.value, value?.[1] || ""]) } className="px-2 py-1 border rounded" disabled={readonly} />
          <span className="text-gray-400">-</span>
          <input type="date" value={value?.[1] || ""} onChange={e => onChange((value?.[0] || "") + "-" + e.target.value)} className="px-2 py-1 border rounded" disabled={readonly} />
        </div>
      );
    case "link":
      return <input type="text" className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-200" value={value || ""} onChange={e => onChange(e.target.value)} disabled={readonly} ref={inputRef} placeholder="Paste or type link..." />;
    case "checkbox":
      return <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} disabled={readonly} />;
    case "chat":
      return <button className="p-1 rounded hover:bg-blue-50" title="Open chat" onClick={onChange}>💬</button>;
    case "options":
      return <button className="p-1 rounded hover:bg-gray-100">⋮</button>;
    case "add":
      return value;
    case "readonly":
    default:
      return <span className="text-gray-400">{value}</span>;
  }
}

// --- RENDER TASK CELL BY COLUMN KEY ---
function renderTaskCell(col, task, saveField, editing, setEditing, editValues, setEditValues, handleKey, lastUpdated, onChat) {
  switch (col.key) {
    case "checkbox":
      return <td className="sticky left-0 bg-white z-10 border-r border-gray-100"><input type="checkbox" className="rounded border-gray-300 focus:ring-blue-500" /></td>;
    case "name":
      return <td className="whitespace-nowrap px-3 py-2 font-semibold text-gray-900 relative">{task.name}</td>;
    case "owner":
      return <td className="whitespace-nowrap px-3 py-2 relative"><span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${task.owner.color} border border-white shadow-sm`}>{task.owner.initials}</span></td>;
    case "status":
      return <td className="whitespace-nowrap px-3 py-2 relative"><span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${task.status.color} shadow-sm border border-gray-200`}>{task.status.label}</span></td>;
    case "due":
      return <td className="whitespace-nowrap px-3 py-2 relative"><span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 shadow-sm">{task.due}</span></td>;
    case "priority":
      return <td className="whitespace-nowrap px-3 py-2 relative"><span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${task.priority.color} shadow-sm border border-gray-200`}>{task.priority.label}</span></td>;
    case "notes":
      return <td className="whitespace-nowrap px-3 py-2 text-gray-700 relative">{task.notes || <span className="text-gray-400">Add notes</span>}</td>;
    case "autoNumber":
      return <td className="whitespace-nowrap px-3 py-2 text-gray-700 text-center">{task.autoNumber}</td>;
    case "location":
      return <td className="whitespace-nowrap px-3 py-2 text-gray-700 text-center">{task.location || "--"}</td>;
    case "rating":
      return <td className="whitespace-nowrap px-3 py-2 text-yellow-500 text-center">{"★".repeat(task.rating) + "☆".repeat(5-task.rating)}</td>;
    case "progress":
      return <td className="whitespace-nowrap px-3 py-2"><div className="w-24 h-2 bg-gray-200 rounded"><div className="h-2 rounded bg-blue-500" style={{width: `${task.progress}%`}}></div></div><span className="text-xs text-gray-500 ml-2">{task.progress}%</span></td>;
    case "color":
      return <td className="whitespace-nowrap px-3 py-2 text-center"><button className="w-6 h-6 rounded-full border-2 border-gray-200" style={{background: task.color}} title="Pick color"></button></td>;
    case "files":
      return <td className="whitespace-nowrap px-3 py-2 relative">{task.files ? <PaperClipIcon className="h-5 w-5 text-blue-500 inline" /> : <span className="text-gray-400">--</span>}</td>;
    case "timeline":
      return <td className="whitespace-nowrap px-3 py-2 relative">{task.timeline}</td>;
    case "updated":
      return <td className="whitespace-nowrap px-3 py-2 text-gray-400 text-xs">{task.updated}</td>;
    case "options":
      return <td className="whitespace-nowrap px-3 py-2"><Tooltip text="More options"><EllipsisHorizontalIcon className="h-5 w-5 text-gray-400 hover:text-blue-600 cursor-pointer" /></Tooltip></td>;
    case "chat":
      return <td className="whitespace-nowrap px-3 py-2"><button onClick={onChat} className="p-1 rounded hover:bg-blue-50" title="Open chat"><ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" /></button></td>;
    case "link":
      return <td className="whitespace-nowrap px-3 py-2 text-blue-600 text-center"><a href="#">--</a></td>;
    case "add":
      return <td className="whitespace-nowrap px-3 py-2"></td>;
    default:
      return <td className="whitespace-nowrap px-3 py-2 text-gray-400">--</td>;
  }
}

// --- SORTABLE HEADER CELL ---
function SortableHeaderCell({ column, id, index, listeners, attributes, isDragging, style }) {
  const { setNodeRef, transform, transition, isDragging: isDraggingCell } = useSortable({ id });
  return (
    <th
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`py-3 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-left whitespace-nowrap bg-white select-none ${isDraggingCell ? 'opacity-60' : ''}`}
      style={{ ...style, transform: CSS.Transform.toString(transform), transition }}
      scope="col"
    >
      {column.label}
    </th>
  );
}

// --- HEADER ROW WITH DND ---
function HeaderRowDnd({ columns, onDragEnd }) {
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={columns.map(col => col.key)} strategy={horizontalListSortingStrategy}>
        <tr>
          {columns.map((col, i) => (
            <SortableHeaderCell key={col.key} id={col.key} column={col} index={i} />
          ))}
        </tr>
      </SortableContext>
    </DndContext>
  );
}

// --- TASK ROW WITH INLINE EDITING ---
function TaskRowDnd({ columns, row, onChat, onUpdate }) {
  const [editingCell, setEditingCell] = useState(null); // key of cell being edited
  const [editValue, setEditValue] = useState(null);

  function handleCellClick(col) {
    if (col.readonly || col.type === "readonly" || col.type === "add") return;
    setEditingCell(col.key);
    setEditValue(row[col.key]);
  }
  function handleCellChange(val, col) {
    setEditValue(val);
    if (col.type !== "file") {
      onUpdate && onUpdate(col.key, val);
    }
  }
  function handleCellBlur(col) {
    if (col.type !== "file") {
      onUpdate && onUpdate(col.key, editValue);
    }
    setEditingCell(null);
  }
  return (
    <tr className="group hover:bg-blue-50 transition border-b border-gray-100" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      {columns.map(col => (
        <td
          key={col.key}
          className="whitespace-nowrap px-3 py-2 text-sm cursor-pointer"
          onClick={() => handleCellClick(col)}
        >
          {editingCell === col.key ? (
            <div onBlur={() => handleCellBlur(col)}>
              <CellEditor
                type={col.type}
                value={editValue}
                options={col.options}
                onChange={val => handleCellChange(val, col)}
                readonly={col.readonly}
              />
            </div>
          ) : col.type === "dropdown" && col.options ? (
            <span className={col.options.find(opt => opt.value === row[col.key])?.color || ""}>
              {col.options.find(opt => opt.value === row[col.key])?.label || row[col.key] || <span className="text-gray-400">--</span>}
            </span>
          ) : col.type === "rating" ? (
            <span className="text-yellow-500">{"★".repeat(row[col.key] || 0) + "☆".repeat(5-(row[col.key] || 0))}</span>
          ) : col.type === "progress" ? (
            <div className="w-24 h-2 bg-gray-200 rounded"><div className="h-2 rounded bg-blue-500" style={{width: `${row[col.key] || 0}%`}}></div><span className="text-xs text-gray-500 ml-2">{row[col.key] || 0}%</span></div>
          ) : col.type === "color" ? (
            <span className="inline-block w-6 h-6 rounded-full border-2 border-gray-200" style={{background: row[col.key] || "#ccc"}}></span>
          ) : col.type === "file" ? (
            row[col.key] ? <span className="text-blue-500">{typeof row[col.key] === "string" ? row[col.key] : row[col.key]?.name || "File uploaded"}</span> : <span className="text-gray-400">--</span>
          ) : col.type === "daterange" ? (
            <span>{row[col.key]?.[0] || "--"} - {row[col.key]?.[1] || "--"}</span>
          ) : col.type === "link" ? (
            row[col.key] ? <a href={row[col.key]} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{row[col.key]}</a> : <span className="text-gray-400">--</span>
          ) : col.type === "checkbox" ? (
            <input type="checkbox" checked={!!row[col.key]} readOnly />
          ) : col.type === "chat" ? (
            <button className="p-1 rounded hover:bg-blue-50" title="Open chat" onClick={onChat}>💬</button>
          ) : col.type === "options" ? (
            <button className="p-1 rounded hover:bg-gray-100">⋮</button>
          ) : col.type === "add" ? (
            col.label
          ) : (
            <span>{row[col.key] || <span className="text-gray-400">--</span>}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

// Add Tooltip component
function Tooltip({ text, children }) {
  return (
    <span className="relative group">
      {children}
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 hidden group-hover:block whitespace-nowrap bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg">
        {text}
      </span>
    </span>
  );
}

// Fix AddTaskRow and HeaderRow to accept columns as a prop
function AddTaskRow({ columns }) {
  return (
    <tr className="hover:bg-blue-50 transition border-b border-gray-100">
      <td className="sticky left-0 bg-white z-10 border-r border-gray-100">
        <PlusIcon className="h-5 w-5 text-blue-500" />
      </td>
      <td colSpan={columns.length - 1} className="px-3 py-2 text-blue-600 font-medium cursor-pointer hover:underline">
        + Add Task
      </td>
    </tr>
  );
}

// 1. Add a HeaderRow component for the header row
function HeaderRow({ columns }) {
  return (
          <tr>
            {columns.map((col, i) => (
              <th
                key={col.key}
                className={`py-3 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-left whitespace-nowrap ${i === 0 ? 'sticky left-0 bg-white z-20 shadow-md' : ''}`}
                style={i === 0 ? { minWidth: 48, maxWidth: 48, width: 48 } : {}}
              >
                {col.label}
              </th>
            ))}
          </tr>
  );
}

export default function MainTable() {
  const [collapsed, setCollapsed] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [columnOrder, setColumnOrder] = useState(initialColumns.map(col => col.key));
  const columns = columnOrder.map(key => initialColumns.find(col => col.key === key));
  const [expandedTasks, setExpandedTasks] = useState({});
  const [editState, setEditState] = useState({}); // { [rowId_colKey]: true }
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [chatTaskId, setChatTaskId] = useState(null);
  const [selectedTab, setSelectedTab] = useState('updates');
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Bob', timestamp: '2 hours ago', text: 'Started working on the task.' },
    { sender: 'Alice', timestamp: '1 hour ago', text: 'Please update the status when done.' },
    { sender: 'Bob', timestamp: 'just now', text: 'Will do! 👍' },
  ]);

  function openChatDrawer(taskId) {
    setChatTaskId(taskId);
    setChatDrawerOpen(true);
    setSelectedTab('updates');
  }
  function closeChatDrawer() {
    setChatDrawerOpen(false);
    setChatTaskId(null);
  }

  const handleCollapse = (group) => {
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleExpandToggle = (taskId) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Helper to render a cell with inline editing
  function EditableCell({ row, col, isSubtask, onUpdate }) {
    const cellKey = `${row.autoNumber}_${col.key}`;
    const isEditing = !!editState[cellKey];
    const value = row[col.key];
    function handleEdit(val) {
      onUpdate(col.key, val);
      setEditState((prev) => ({ ...prev, [cellKey]: false }));
    }
    if (col.key === 'checkbox') {
      return (
        <td className={`sticky left-0 bg-white z-10 border-r border-gray-100 ${isSubtask ? 'bg-gray-50' : ''}`}>
          <div className="flex items-center">
            {row.subtasks && row.subtasks.length > 0 && !isSubtask && (
              <button
                className="mr-2 focus:outline-none"
                onClick={e => { e.stopPropagation(); handleExpandToggle(row.autoNumber); }}
                aria-label={expandedTasks[row.autoNumber] ? 'Collapse subtasks' : 'Expand subtasks'}
              >
                <span className={`inline-block w-3 h-3 transition-transform ${expandedTasks[row.autoNumber] ? '' : 'rotate-[-90deg]'}`}>▶</span>
              </button>
            )}
            <input type="checkbox" checked={!!row.checkbox} readOnly />
          </div>
        </td>
      );
    }
    // Subtask: only show certain columns
    if (isSubtask && !['name','owner','status','due','progress'].includes(col.key)) {
      return <td className="whitespace-nowrap px-3 py-2 text-sm bg-gray-50"></td>;
    }
    // Inline editing for all editable cells
    if (isEditing && col.type !== 'readonly' && col.type !== 'add' && col.type !== 'options' && col.type !== 'chat') {
      return (
        <td className={`whitespace-nowrap px-3 py-2 text-sm ${isSubtask ? 'bg-gray-50' : ''}`}
            onBlur={() => setEditState((prev) => ({ ...prev, [cellKey]: false }))}>
          <CellEditor
            type={col.type}
            value={value}
            options={col.options}
            onChange={handleEdit}
            readonly={col.readonly}
          />
        </td>
      );
    }
    // Special case: render chat icon in chat column
    if (col.key === 'chat') {
      return (
        <td className="whitespace-nowrap px-3 py-2 text-center">
          <button onClick={() => openChatDrawer(row.autoNumber)} className="p-1 rounded hover:bg-blue-50" title="Open chat">
            <ChatBubbleLeftIcon className="w-5 h-5 text-gray-500 cursor-pointer" />
          </button>
        </td>
      );
    }
    // Display cell (with click to edit if editable)
    return (
      <td
        className={`whitespace-nowrap px-3 py-2 text-sm ${isSubtask ? 'bg-gray-50' : ''} ${col.key === 'name' && isSubtask ? 'pl-6 ml-6 border-l-2 border-gray-300 font-medium text-gray-800' : ''} group-hover:bg-gray-100 transition`}
        onClick={() => {
          if (!col.readonly && col.type !== 'readonly' && col.type !== 'add' && col.type !== 'options' && col.type !== 'chat') setEditState((prev) => ({ ...prev, [cellKey]: true }));
        }}
        style={{ cursor: (!col.readonly && col.type !== 'readonly' && col.type !== 'add' && col.type !== 'options' && col.type !== 'chat') ? 'pointer' : undefined }}
      >
        {col.key === 'progress' ? (
          <div className="w-24 h-2 bg-gray-200 rounded"><div className="h-2 rounded bg-blue-500" style={{width: `${value || 0}%`}}></div><span className="text-xs text-gray-500 ml-2">{value || 0}%</span></div>
        ) : value || <span className="text-gray-400">--</span>}
      </td>
    );
  }

  // Render a main task row and its subtasks
  function RenderTaskRow({ task, columns, groupName }) {
    const isExpanded = expandedTasks[task.autoNumber];
    const hasSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 0;
    // Handler for inline editing
    function handleUpdate(colKey, val, isSubtask, subIdx) {
      if (isSubtask) {
        task.subtasks[subIdx][colKey] = val;
      } else {
        task[colKey] = val;
      }
      // Force update (in real app, use setState or context)
      setEditState((prev) => ({ ...prev }));
    }
    return (
      <>
        <tr className="group hover:bg-blue-50 transition border-b border-gray-100" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
          {columns.map((col, colIdx) => (
            <EditableCell key={col.key} row={task} col={col} isSubtask={false} onUpdate={(colKey, val) => handleUpdate(colKey, val, false)} />
          ))}
        </tr>
        {/* Render subtasks as full-width rows below parent, only if expanded */}
        {hasSubtasks && isExpanded && task.subtasks.map((sub, idx) => (
          <tr key={sub.autoNumber || idx} className="border-b border-gray-100 hover:bg-gray-100 transition">
            {columns.map((col, colIdx) => (
              <EditableCell key={col.key} row={sub} col={col} isSubtask={true} onUpdate={(colKey, val) => handleUpdate(colKey, val, true, idx)} />
            ))}
          </tr>
        ))}
      </>
    );
  }

  // Helper to get task title by ID
  function getTaskTitleById(id) {
    for (const group of demoTasks) {
      for (const task of group.tasks) {
        if (task.autoNumber === id) return task.name;
      }
    }
    return `Task #${id}`;
  }

  return (
    <div className="w-full overflow-x-scroll overflow-y-scroll max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
      <div className="min-w-full inline-block align-middle">
        <table className={`w-max min-w-[1200px] border-separate border-spacing-0 text-[15px] font-medium text-gray-800`}>
        <tbody>
          {demoTasks.map((group) => (
            <React.Fragment key={group.group}>
              {/* Group header */}
              <tr>
                <td
                    colSpan={columns.length}
                  className={`py-2 px-3 font-bold text-gray-800 text-base bg-gray-50 border-b border-gray-200 sticky left-0 z-10 ${group.color}`}
                >
                  <div className="flex items-center gap-2">
                    <button
                      className="focus:outline-none"
                      onClick={() => handleCollapse(group.group)}
                      aria-label={collapsed[group.group] ? 'Expand group' : 'Collapse group'}
                    >
                      <span className={`inline-block w-3 h-3 transition-transform ${collapsed[group.group] ? 'rotate-0' : 'rotate-90'}`}>▶</span>
                    </button>
                    <span className="pl-2">{group.group}</span>
                  </div>
                </td>
              </tr>
                {/* Render header row only for 'To-Do' group */}
                {group.group === 'To-Do' && <HeaderRowDnd columns={columns} onDragEnd={handleDragEnd} />}
              {!collapsed[group.group] &&
                  group.tasks.map((task, idx) => (
                    <RenderTaskRow key={task.autoNumber || idx} task={task} columns={columns} groupName={group.group} />
                  ))}
                {!collapsed[group.group] && <AddTaskRow columns={columns} />}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      </div>
      <TaskDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} task={selectedTask} />
      {chatDrawerOpen && (
        <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 transition-transform duration-300" style={{width:'420px'}}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="text-xl font-semibold">{getTaskTitleById(chatTaskId)}</span>
            <button onClick={closeChatDrawer} className="text-gray-500 hover:text-red-500 p-2"><XMarkIcon className="w-6 h-6" /></button>
          </div>
          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-4">
            {['updates','files','activity'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`capitalize px-4 py-2 -mb-px border-b-2 transition font-medium text-sm focus:outline-none ${selectedTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-500'}`}
              >
                {tab === 'updates' ? 'Updates' : tab === 'files' ? 'Files' : 'Activity Log'}
              </button>
            ))}
          </div>
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{minHeight:'0'}}>
            {selectedTab === 'updates' && (
              <>
                <div className="space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto pr-2">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="bg-gray-100 p-2 rounded-md my-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-700 text-sm">{msg.sender}</span>
                        <span className="text-xs text-gray-400">{msg.timestamp}</span>
                      </div>
                      <div className="text-gray-800 text-sm whitespace-pre-line">{msg.text}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {selectedTab === 'files' && (
              <div className="text-gray-400 text-center mt-10">Files tab placeholder</div>
            )}
            {selectedTab === 'activity' && (
              <div className="text-gray-400 text-center mt-10">Activity log placeholder</div>
            )}
          </div>
          {/* Input Box */}
          {selectedTab === 'updates' && (
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex items-end gap-2">
              <button className="p-2 text-gray-400 hover:text-blue-500"><AtSymbolIcon className="w-5 h-5" /></button>
              <button className="p-2 text-gray-400 hover:text-blue-500"><PaperClipIcon className="w-5 h-5" /></button>
              <textarea
                className="flex-1 resize-none border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-200 min-h-[38px] max-h-24"
                placeholder="Write an update and mention others with @"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                rows={1}
              />
              <button className="p-2 text-blue-500 hover:bg-blue-50 rounded" title="Send">
                <PaperAirplaneIcon className="w-5 h-5 rotate-90" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 