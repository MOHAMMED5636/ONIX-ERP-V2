import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  MapPinIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  StarIcon,
  XMarkIcon,
  PaperClipIcon,
  LinkIcon,
  Bars3Icon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { DateRange } from 'react-date-range';
import { format, addDays, differenceInCalendarDays, isValid } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MapPicker from '../modules/WorkingLocations.js';
import ReorderableDropdown from "./tasks/ReorderableDropdown";

const initialTasks = [
  {
    id: 1,
    name: "Building construction",
    referenceNumber: "REF-001",
    category: "Development",
    status: "done",
    owner: "MN",
    timeline: [null, null],
    planDays: 10,
    remarks: "",
    assigneeNotes: "",
    attachments: [],
    priority: "Low",
    location: "Onix engineering co.",
    plotNumber: "PLOT-001",
    community: "Downtown District",
    projectType: "Residential",
    projectFloor: "5",
    developerProject: "Onix Development",
    checklist: false,
    rating: 3,
    progress: 50,
    color: "#60a5fa",
    subtasks: [
      {
        id: 11,
        name: "Subitem 1",
        referenceNumber: "REF-001-1",
        category: "Design",
        status: "done",
        owner: "SA",
        timeline: [null, null],
        remarks: "",
        assigneeNotes: "",
        attachments: [],
        priority: "Low",
        location: "",
        plotNumber: "PLOT-001-1",
        community: "Downtown District",
        projectType: "Residential",
        projectFloor: "5",
        developerProject: "Onix Development",
        completed: false,
        checklist: false,
        rating: 2,
        progress: 20,
        color: "#f59e42"
      },
      {
        id: 12,
        name: "Subitem 2",
        category: "Development",
        status: "working",
        owner: "MN",
        due: "2024-07-19",
        priority: "Medium",
        timeline: "2024-07-19 – 2024-07-20",
        location: "",
        completed: false,
        checklist: false,
        rating: 4,
        progress: 60,
        color: "#10b981"
      },
      {
        id: 13,
        name: "Subitem 3",
        category: "Testing",
        status: "not started",
        owner: "AL",
        due: "2024-07-20",
        priority: "High",
        timeline: "2024-07-20 – 2024-07-21",
        location: "",
        completed: false,
        checklist: false,
        rating: 1,
        progress: 0,
        color: "#6366f1"
      },
      {
        id: 14,
        name: "Subitem 4",
        category: "Review",
        status: "stuck",
        owner: "SA",
        due: "2024-07-21",
        priority: "Low",
        timeline: "2024-07-21 – 2024-07-22",
        location: "",
        completed: false,
        checklist: false,
        rating: 5,
        progress: 80,
        color: "#ef4444"
      }
    ],
    expanded: true
  }
];

const statusColors = {
  done: "bg-green-500 text-white",
  working: "bg-yellow-500 text-white",
  stuck: "bg-red-500 text-white",
  "not started": "bg-gray-400 text-white"
};

const isAdmin = true; // TODO: Replace with real authentication logic

// Add GoogleMapPicker demo modal at the top level
function GoogleMapPickerDemo({ onPick, onClose }) {
  // For demo, clicking anywhere on the map will pick a fixed location
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-2xl relative flex flex-col" style={{ height: 500 }}>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          title="Close"
        >
          &times;
        </button>
        <h3 className="text-lg font-semibold mb-2">Pick Location on Google Map (Demo)</h3>
        <div className="flex-1 flex items-center justify-center">
          <div style={{ width: '100%', height: 400, position: 'relative' }}>
            <iframe
              title="Google Map Demo"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0, borderRadius: 8 }}
              src="https://www.google.com/maps/embed/v1/view?key=AIzaSyD-EXAMPLE-KEY&center=25.276987,55.296249&zoom=10"
              allowFullScreen
            />
            <button
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onClick={() => { onPick(25.276987, 55.296249); }}
              title="Pick this location"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this helper component for sortable subtask rows
function SortableSubtaskRow({ sub, subIdx, task, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sub.id });
  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
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
}

export default function TeamProjectTracker() {
  // Inline edit state and handlers for Project Name (move to top)
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskName, setEditingTaskName] = useState("");
  const [selectedProjectForSummary, setSelectedProjectForSummary] = useState(null);

  const handleProjectNameClick = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskName(task.name);
  };
  const handleProjectNameDoubleClick = (task) => {
    setSelectedProjectForSummary(task);
  };
  const handleProjectNameChange = (e) => setEditingTaskName(e.target.value);
  const handleProjectNameBlur = (task) => {
    if (editingTaskName.trim() !== "") {
      handleEdit(task, 'name', editingTaskName);
    }
    setEditingTaskId(null);
  };
  const handleProjectNameKeyDown = (e, task) => {
    if (e.key === "Enter") {
      if (editingTaskName.trim() !== "") {
        handleEdit(task, 'name', editingTaskName);
      }
      setEditingTaskId(null);
    } else if (e.key === "Escape") {
      setEditingTaskId(null);
    }
  };
  const closeProjectSummary = () => setSelectedProjectForSummary(null);

  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [showNewTask, setShowNewTask] = useState(false);
  // Add state for subtask form
  const [showSubtaskForm, setShowSubtaskForm] = useState(null); // taskId or null
  const [newSubtask, setNewSubtask] = useState({
    name: "",
    referenceNumber: "",
    category: "Design",
    status: "not started",
    owner: "",
    timeline: [null, null],
    planDays: 0,
    remarks: "",
    assigneeNotes: "",
    attachments: [],
    priority: "Low",
    location: ""
  });
  // Add state for editing subtasks
  const [editingSubtask, setEditingSubtask] = useState({}); // {subId_colKey: true}
  const [editSubValue, setEditSubValue] = useState("");
  const [showAddColumnDropdown, setShowAddColumnDropdown] = useState(false);
  // Add two separate expanded state objects
  const [expandedActive, setExpandedActive] = useState({}); // For active projects
  const [expandedCompleted, setExpandedCompleted] = useState({}); // For completed projects
  const [newTask, setNewTask] = useState(null);
  // Add a state for rating prompt
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState(null); // { type: 'main'|'sub'|'completed', taskId, subId }
  const [mapPickerCoords, setMapPickerCoords] = useState({ lat: null, lng: null });
  // Add GoogleMapPicker demo modal
  const [googleMapPickerOpen, setGoogleMapPickerOpen] = useState(false);
  const [projectStartDate, setProjectStartDate] = useState(new Date()); // Add project start date state

  // --- SVG ARROW CONNECTION LOGIC ---
  const mainTaskRefs = useRef({}); // {taskId: ref}
  const subTableRefs = useRef({}); // {taskId: ref}
  const [arrowPos, setArrowPos] = useState({}); // {taskId: {x1, y1, x2, y2}}
  // Add a ref for the main task name span
  const mainTaskNameRefs = useRef({}); // {taskId: ref}

  useLayoutEffect(() => {
    const newArrowPos = {};
    tasks.forEach(task => {
      if (
        task.expanded &&
        task.subtasks.length > 0 &&
        mainTaskNameRefs.current[task.id] &&
        subTableRefs.current[task.id]
      ) {
        const nameRect = mainTaskNameRefs.current[task.id].getBoundingClientRect();
        const subRect = subTableRefs.current[task.id].getBoundingClientRect();
        // Adjust for scroll position
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        newArrowPos[task.id] = {
          x1: nameRect.right - scrollX,
          y1: nameRect.top + nameRect.height / 2 - scrollY,
          x2: subRect.left - scrollX,
          y2: subRect.top + 24 - scrollY // 24px down from top of subtable
        };
      }
    });
    setArrowPos(newArrowPos);
  }, [tasks, showSubtaskForm, search]);

  function handleToggleExpand(taskId) {
    setTasks(tasks =>
      tasks.map(t =>
        t.id === taskId ? { ...t, expanded: !t.expanded } : t
      )
    );
  }
  function handleMarkSubtaskComplete(taskId, subId) {
    setTasks(tasks =>
      tasks.map(t => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = t.subtasks.map(s =>
          s.id === subId ? { ...s, status: "done", completed: true } : s
        );
        // Check if all subtasks are done
        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.status === 'done');
        return {
          ...t,
          subtasks: updatedSubtasks,
          status: allDone ? 'done' : t.status
        };
      })
    );
  }
  function handleCreateTask() {
    if (!newTask) return;
    
    // Validate required fields
    if (!newTask.name || newTask.name.trim() === "") {
      alert("Please enter a project name");
      return;
    }
    
    // Create the task with current newTask data
    const taskToAdd = {
      ...newTask,
      id: Date.now(),
      expanded: false
    };
    
    setTasks(tasks => {
      const updatedTasks = [...tasks, taskToAdd];
      return calculateTaskTimelines(updatedTasks, projectStartDate);
    });
    
    // Clear the new task form
    setNewTask(null);
    setShowNewTask(false);
  }

  function handleAddSubtask(taskId) {
    const newSubtaskData = {
      id: Date.now(),
      ...newSubtask,
      completed: false,
      checklist: false,
      rating: 3,
      progress: 0,
      color: "#60a5fa",
      predecessors: ""
    };
    
    setTasks(tasks => {
      const updatedTasks = tasks.map(t =>
        t.id === taskId
          ? {
            ...t,
            subtasks: [
              ...t.subtasks,
              newSubtaskData
            ]
          }
          : t
      );
      return calculateTaskTimelines(updatedTasks, projectStartDate);
    });
    setShowSubtaskForm(null);
    setNewSubtask({
      name: "",
      referenceNumber: "",
      category: "Design",
      status: "not started",
      owner: "",
      timeline: [null, null],
      planDays: 0,
      remarks: "",
      assigneeNotes: "",
      attachments: [],
      priority: "Low",
      location: ""
    });
  }

  function handleEditSubtask(taskId, subId, col, value) {
    setTasks(tasks => {
      let updatedTasks = tasks.map(t => {
        if (t.id !== taskId) return t;
        const idx = t.subtasks.findIndex(sub => sub.id === subId);
        let updatedSubtasks = t.subtasks.map(sub => ({ ...sub }));
        // Update the changed subtask
        updatedSubtasks[idx] = (() => {
          if (col === 'timeline') {
            const [start, end] = value;
            let planDays = 0;
            if (isValid(start) && isValid(end)) {
              planDays = differenceInCalendarDays(end, start) + 1;
            }
            return { ...updatedSubtasks[idx], timeline: value, planDays };
          } else if (col === 'planDays') {
            const [start, end] = updatedSubtasks[idx].timeline || [];
            if (isValid(start) && value > 0) {
              const newEnd = addDays(new Date(start), value - 1);
              return { ...updatedSubtasks[idx], planDays: value, timeline: [start, newEnd] };
            }
            return { ...updatedSubtasks[idx], planDays: value };
          } else {
            return { ...updatedSubtasks[idx], [col]: value };
          }
        })();
        
        // If all subtasks are done, set main task status to 'done'
        const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.status === 'done');
        // Calculate average progress of subtasks
        let avgProgress = t.progress;
        if (updatedSubtasks.length > 0) {
          const total = updatedSubtasks.reduce((sum, s) => sum + (typeof s.progress === 'number' ? s.progress : 0), 0);
          avgProgress = Math.round(total / updatedSubtasks.length);
        }
        return { ...t, subtasks: updatedSubtasks, status: allDone ? 'done' : t.status, progress: avgProgress };
      });
      
      // If predecessors, timeline, or planDays changed, recalculate all timelines
      if (col === 'predecessors' || col === 'timeline' || col === 'planDays') {
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      }
      
      return updatedTasks;
    });
  }

  function startEditSubtask(subId, colKey, value) {
    setEditingSubtask({ [`${subId}_${colKey}`]: true });
    setEditSubValue(value);
  }

  // Update toggleExpand to accept a type (active/completed)
  function toggleExpand(taskId, type = 'active') {
    if (type === 'active') {
      setExpandedActive(exp => ({ ...exp, [taskId]: !exp[taskId] }));
    } else {
      setExpandedCompleted(exp => ({ ...exp, [taskId]: !exp[taskId] }));
    }
  }

  function handleDeleteRow(id, parentTaskId = null) {
    setTasks(tasks => {
      let updatedTasks;
      if (parentTaskId) {
        updatedTasks = tasks.map(task =>
          task.id === parentTaskId
            ? { ...task, subtasks: task.subtasks.filter(sub => sub.id !== id) }
            : task
        );
      } else {
        updatedTasks = tasks.filter(task => task.id !== id);
      }
      // Recalculate timelines after deletion to ensure proper dependencies
      return calculateTaskTimelines(updatedTasks, projectStartDate);
    });
  }

  function handleAddNewTask() {
    setNewTask({
      id: Date.now(),
      name: "",
      referenceNumber: "",
      category: "Design",
      status: "not started",
      owner: "AL",
      timeline: [null, null],
      planDays: 0,
      remarks: "",
      assigneeNotes: "",
      attachments: [],
      priority: "Low",
      location: "",
      plotNumber: "",
      community: "",
      projectType: "Residential",
      projectFloor: "",
      developerProject: "",
      notes: "",
      autoNumber: tasks.length + 1,
      predecessors: "",
      checklist: false,
      link: "",
      rating: 0,
      progress: 0,
      color: "#60a5fa",
      subtasks: []
    });
  }

  function handleEdit(task, col, value) {
    setTasks(tasks => {
      const idx = tasks.findIndex(t => t.id === task.id);
      let updatedTasks = tasks.map(t => ({ ...t }));
      // Update the changed task
      updatedTasks[idx] = (() => {
        if (col === 'timeline') {
          const [start, end] = value;
          let planDays = 0;
          if (isValid(start) && isValid(end)) {
            planDays = differenceInCalendarDays(end, start) + 1;
          }
          return { ...updatedTasks[idx], timeline: value, planDays };
        } else if (col === 'planDays') {
          const [start, end] = updatedTasks[idx].timeline || [];
          if (isValid(start) && value > 0) {
            const newEnd = addDays(new Date(start), value - 1);
            return { ...updatedTasks[idx], planDays: value, timeline: [start, newEnd] };
          }
          return { ...updatedTasks[idx], planDays: value };
        } else {
          return { ...updatedTasks[idx], [col]: value };
        }
      })();
      
      // If predecessors, timeline, or planDays changed, recalculate all timelines
      if (col === 'predecessors' || col === 'timeline' || col === 'planDays') {
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      }
      
      return updatedTasks;
    });
  }

  function handleOpenMapPicker(type, taskId, subId, latLngStr) {
    setMapPickerTarget({ type, taskId, subId });
    setGoogleMapPickerOpen(true);
  }
  function handlePickLocation(lat, lng) {
    if (!mapPickerTarget) return;
    const value = `${lat},${lng}`;
    if (mapPickerTarget.type === 'main') {
      setTasks(ts => ts.map(t => t.id === mapPickerTarget.taskId ? { ...t, location: value } : t));
    } else if (mapPickerTarget.type === 'sub') {
      setTasks(ts => ts.map(t => t.id === mapPickerTarget.taskId ? { ...t, subtasks: t.subtasks.map(s => s.id === mapPickerTarget.subId ? { ...s, location: value } : s) } : t));
    }
    setGoogleMapPickerOpen(false);
  }

  // Handle project start date changes and recalculate all timelines
  function handleProjectStartDateChange(newStartDate) {
    setProjectStartDate(newStartDate);
    // Timeline recalculation will be handled by the useEffect that watches projectStartDate
  }

  // Helper: Calculate timelines based on predecessors
  function calculateTaskTimelines(tasks, projectStartDate) {
    // Build a lookup for tasks by id (including subtasks)
    const taskMap = {};
    const allTasks = [];
    
    // Collect all tasks and subtasks
    tasks.forEach(task => {
      taskMap[task.id] = task;
      allTasks.push(task);
      if (task.subtasks) {
        task.subtasks.forEach(subtask => {
          taskMap[subtask.id] = subtask;
          allTasks.push(subtask);
        });
      }
    });

    // Helper to calculate plan days from timeline
    function calculatePlanDaysFromTimeline(timeline) {
      if (!timeline || !timeline[0] || !timeline[1]) return 0;
      return differenceInCalendarDays(timeline[1], timeline[0]) + 1;
    }

    // Helper to parse predecessor ids (comma/space separated)
    function getPredecessorIds(predecessors) {
      if (!predecessors) return [];
      return predecessors
        .toString()
        .split(/[, ]+/)
        .map(s => Number(s))
        .filter(n => !isNaN(n));
    }

    // Calculate timelines for all tasks and subtasks
    const updatedTaskMap = {};
    allTasks.forEach(task => {
      // If task already has a timeline, calculate plan days from it
      if (task.timeline && task.timeline[0] && task.timeline[1]) {
        const calculatedPlanDays = calculatePlanDaysFromTimeline(task.timeline);
        updatedTaskMap[task.id] = {
          ...task,
          planDays: task.planDays || calculatedPlanDays
        };
        return;
      }
      
      let startDate = projectStartDate;
      const predIds = getPredecessorIds(task.predecessors);
      
      if (predIds.length > 0) {
        // Find latest end date among predecessors
        let latestEnd = null;
        predIds.forEach(pid => {
          const predTask = taskMap[pid];
          if (predTask && predTask.timeline && predTask.timeline[1]) {
            const predEnd = new Date(predTask.timeline[1]);
            if (!latestEnd || predEnd > latestEnd) latestEnd = predEnd;
          }
        });
        if (latestEnd) {
          startDate = addDays(latestEnd, 1);
        }
      }
      
      // Calculate end date
      const duration = task.planDays > 0 ? task.planDays : 1;
      const endDate = addDays(startDate, duration - 1);
      
      // Calculate plan days from timeline if not set
      const calculatedPlanDays = calculatePlanDaysFromTimeline([startDate, endDate]);
      
      updatedTaskMap[task.id] = {
        ...task,
        timeline: [startDate, endDate],
        planDays: task.planDays || calculatedPlanDays
      };
    });

    // Update main tasks with their updated subtasks
    return tasks.map(task => {
      const updatedTask = updatedTaskMap[task.id];
      if (task.subtasks) {
        updatedTask.subtasks = task.subtasks.map(subtask => 
          updatedTaskMap[subtask.id] || subtask
        );
      }
      return updatedTask;
    });
  }

  // Recalculate timelines whenever tasks or projectStartDate change
  useEffect(() => {
    setTasks(ts => calculateTaskTimelines(ts, projectStartDate));
  }, [projectStartDate]);

  const filteredTasks = tasks.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  // Replace this:
  // const columns = [ ... ];
  // With:
  const INITIAL_COLUMNS = [
    { key: 'task', label: 'TASK' },
    { key: 'referenceNumber', label: 'REFERENCE NUMBER' },
    { key: 'category', label: 'TASK CATEGORY' },
    { key: 'status', label: 'STATUS' },
    { key: 'owner', label: 'OWNER' },
    { key: 'timeline', label: 'TIMELINE' },
    { key: 'planDays', label: 'PLAN DAYS' },
    { key: 'remarks', label: 'REMARKS' },
    { key: 'assigneeNotes', label: 'ASSIGNEE NOTES' },
    { key: 'attachments', label: 'ATTACHMENTS' },
    { key: 'priority', label: 'PRIORITY' },
    { key: 'location', label: 'LOCATION' },
    { key: 'plotNumber', label: 'PLOT NUMBER' },
    { key: 'community', label: 'COMMUNITY' },
    { key: 'projectType', label: 'PROJECT TYPE' },
    { key: 'projectFloor', label: 'PROJECT FLOOR' },
    { key: 'developerProject', label: 'DEVELOPER PROJECT' },
    { key: 'autoNumber', label: 'AUTO #' },
    { key: 'predecessors', label: 'PREDECESSORS' },
    { key: 'checklist', label: 'CHECKLIST' },
    { key: 'link', label: 'LINK' },
    { key: 'rating', label: 'RATING' },
    { key: 'progress', label: 'PROGRESS' },
    { key: 'color', label: 'COLOR' },
    { key: 'delete', label: '' }
  ];
  const [columns, setColumns] = useState(INITIAL_COLUMNS);

  // Store column order in state
  const defaultColumnOrder = columns.map(col => col.key);
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('columnOrder');
    const parsed = saved ? JSON.parse(saved) : defaultColumnOrder;
    
    // Ensure all new columns are included in the order
    const allColumns = [...new Set([...parsed, ...defaultColumnOrder])];
    return allColumns;
  });
  useEffect(() => {
    localStorage.setItem('columnOrder', JSON.stringify(columnOrder));
  }, [columnOrder]);

  // Force refresh column order when component mounts to include new fields
  useEffect(() => {
    const currentOrder = columnOrder;
    const allColumns = columns.map(col => col.key);
    const missingColumns = allColumns.filter(col => !currentOrder.includes(col));
    
    if (missingColumns.length > 0) {
      const newOrder = [...currentOrder, ...missingColumns];
      setColumnOrder(newOrder);
      localStorage.setItem('columnOrder', JSON.stringify(newOrder));
    }
  }, [columns]);

  const completedTasks = tasks.filter(t => t.status === "done");

  // Helper renderers for Monday.com style columns
  function TimelineCell({ value, onChange, hasPredecessors = false }) {
    const [showPicker, setShowPicker] = useState(false);
    const start = value?.[0] ? new Date(value[0]) : null;
    const end = value?.[1] ? new Date(value[1]) : null;
    return (
      <div className="relative inline-block">
        <button
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition ${
            hasPredecessors 
              ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
          onClick={() => setShowPicker(v => !v)}
          title={hasPredecessors ? 'Timeline calculated from predecessors' : 'Set timeline manually'}
        >
          {start && end
            ? `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`
            : 'Set dates'}
          {hasPredecessors && (
            <span className="ml-1 text-xs">🔗</span>
          )}
        </button>
        {showPicker && (
          <div className="absolute z-50 bg-white border rounded shadow-lg mt-2">
            <DateRange
              ranges={[{
                startDate: start || new Date(),
                endDate: end || new Date(),
                key: 'selection'
              }]}
              onChange={ranges => {
                const { startDate, endDate } = ranges.selection;
                onChange([startDate, endDate]);
                setShowPicker(false);
              }}
              moveRangeOnFirstSelection={false}
              rangeColors={['#3B82F6']}
              showMonthAndYearPickers={true}
              editableDateInputs={true}
            />
          </div>
        )}
      </div>
    );
  }

  // Update renderMainCell to accept an onEdit handler
  function renderMainCell(col, row, onEdit) {
    switch (col.key) {
      case "task":
        return (
          <input
            className="border rounded px-2 py-1 text-sm font-bold text-gray-900"
            value={row.name}
            onChange={e => onEdit("name", e.target.value)}
          />
        );
      case "referenceNumber":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.referenceNumber || ""}
            onChange={e => onEdit("referenceNumber", e.target.value)}
          />
        );
      case "category":
        return (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={row.category || "Design"}
            onChange={e => onEdit("category", e.target.value)}
          >
            <option value="Design">Design</option>
            <option value="Development">Development</option>
            <option value="Testing">Testing</option>
            <option value="Review">Review</option>
          </select>
        );
      case "status":
        return (
          <select
            className={`border rounded px-2 py-1 text-xs font-bold ${statusColors[row.status] || 'bg-gray-200 text-gray-700'}`}
            value={row.status}
            onChange={e => onEdit("status", e.target.value)}
          >
             <option value="done">Done</option>
             <option value="suspended">Suspended</option>
             <option value="cancelled">Cancelled</option>
             <option value="in progress">In Progress</option>
            <option value="pending">Pending</option>
          </select>
        );
      case "owner":
        return (
          <select
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.owner || ""}
            onChange={e => onEdit("owner", e.target.value)}
          >
            <option value="">Select owner</option>
            <option value="MN">MN</option>
            <option value="SA">SA</option>
            <option value="AL">AL</option>
            {/* Add all possible users here */}
          </select>
        );
      case "timeline":
        const timelineHasPredecessors = row.predecessors && row.predecessors.toString().trim() !== '';
        return <TimelineCell value={row.timeline} onChange={val => onEdit("timeline", val)} hasPredecessors={timelineHasPredecessors} />;
      case "planDays":
        return (
          <input
            type="number"
            min={0}
            className="border rounded px-2 py-1 text-sm w-20 text-center"
            value={row.planDays || 0}
            onChange={e => onEdit("planDays", Number(e.target.value))}
            placeholder="Enter plan days"
          />
        );
      case "remarks":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.remarks || ""}
            onChange={e => onEdit("remarks", e.target.value)}
            placeholder="Enter remarks"
          />
        );
      case "assigneeNotes":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.assigneeNotes || ""}
            onChange={e => onEdit("assigneeNotes", e.target.value)}
            placeholder="Enter assignee notes"
          />
        );
      case "attachments":
        return (
          <div>
            <input
              type="file"
              multiple
              onChange={e => {
                const files = Array.from(e.target.files);
                onEdit("attachments", files);
              }}
            />
            <ul className="mt-1 text-xs text-gray-600">
              {(row.attachments || []).map((file, idx) => (
                <li key={idx}>{file.name || (typeof file === 'string' ? file : '')}</li>
              ))}
            </ul>
          </div>
        );
      case "priority":
        return (
          <select
            className="border rounded px-2 py-1 text-xs font-bold"
            value={row.priority}
            onChange={e => onEdit("priority", e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        );
      case "location":
        return (
          <div className="flex items-center gap-1">
            <input
              className="border rounded px-2 py-1 text-sm"
              value={row.location}
              onChange={e => onEdit("location", e.target.value)}
              placeholder="Enter location or pick on map"
            />
            <button type="button" onClick={() => handleOpenMapPicker('main', row.id, null, row.location)} title="Pick on map">
              <MapPinIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
            </button>
          </div>
        );
      case "plotNumber":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.plotNumber || ""}
            onChange={e => onEdit("plotNumber", e.target.value)}
            placeholder="Enter plot number"
          />
        );
      case "community":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.community || ""}
            onChange={e => onEdit("community", e.target.value)}
            placeholder="Enter community"
          />
        );
      case "projectType":
        return (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={row.projectType || "Residential"}
            onChange={e => onEdit("projectType", e.target.value)}
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Mixed Use">Mixed Use</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>
        );
      case "projectFloor":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.projectFloor || ""}
            onChange={e => onEdit("projectFloor", e.target.value)}
            placeholder="Enter project floor"
          />
        );
      case "developerProject":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.developerProject || ""}
            onChange={e => onEdit("developerProject", e.target.value)}
            placeholder="Enter developer project"
          />
        );
      case "notes":
        return (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={row.notes}
            onChange={e => onEdit("notes", e.target.value)}
          />
        );
      case "autoNumber":
        return <span>{row.autoNumber || row.id}</span>;
      case "predecessors":
        const predecessorsHasValue = row.predecessors && row.predecessors.toString().trim() !== '';
        return (
          <div className="relative">
            <input
              className={`border rounded px-2 py-1 text-sm pr-6 ${predecessorsHasValue ? 'border-green-300 bg-green-50' : ''}`}
              value={row.predecessors}
              onChange={e => onEdit("predecessors", e.target.value)}
              placeholder="Enter task IDs (e.g., 1, 2, 3)"
            />
            {predecessorsHasValue && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600">🔗</span>
            )}
          </div>
        );
      case "checklist":
        return (
          <input
            type="checkbox"
            checked={!!row.checklist}
            onChange={e => onEdit("checklist", e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        );
      case "link":
        return (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={row.link}
            onChange={e => onEdit("link", e.target.value)}
          />
        );
      case "rating":
        if (row.status === 'done' && isAdmin) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 cursor-pointer transition ${i <= row.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => onEdit("rating", i)}
                  fill={i <= row.rating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        } else if (isAdmin) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 cursor-pointer transition ${i <= row.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setShowRatingPrompt(true)}
                  fill={i <= row.rating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        } else {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 transition ${i <= row.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill={i <= row.rating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        }
      case "progress":
        // If there are subtasks, make progress read-only and show average
        const hasSubtasks = row.subtasks && row.subtasks.length > 0;
        return (
          <div className="flex flex-col items-center">
            <div className="w-24 h-2 bg-gray-200 rounded relative overflow-hidden mb-1">
              <div
                className="h-2 rounded bg-blue-500 transition-all duration-500"
                style={{ width: `${row.progress}%` }}
              ></div>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-gray-700">{row.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={row.progress}
              onChange={e => onEdit("progress", Number(e.target.value))}
              className="w-24"
              disabled={hasSubtasks}
              readOnly={hasSubtasks}
            />
          </div>
        );
      case "color":
        return (
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <span className="inline-block w-6 h-6 rounded-full border-2 border-gray-200" style={{ background: row.color }}></span>
            <input
              type="color"
              value={row.color}
              onChange={e => onEdit("color", e.target.value)}
              className="w-6 h-6 p-0 border-0 bg-transparent"
              style={{ visibility: 'hidden', position: 'absolute' }}
            />
            <span className="text-xs text-gray-500">{row.color}</span>
          </label>
        );
      case "delete":
        return (
          <button
            className="p-1 rounded hover:bg-red-100 transition"
            onClick={onEdit}
            title="Delete"
          >
            <TrashIcon className="w-5 h-5 text-red-500" />
          </button>
        );
      case "planDays":
        return (
          <input
            type="number"
            className="border rounded px-2 py-1 text-sm text-gray-900"
            value={row.planDays || 0}
            onChange={e => onEdit("planDays", Number(e.target.value))}
            placeholder="Enter plan days"
          />
        );
      case "assign":
        return (
          <input
            className="border rounded px-2 py-1 text-sm text-gray-900"
            value={row.assign || ""}
            onChange={e => onEdit("assign", e.target.value)}
            placeholder="Enter assignee notes"
          />
        );
      case "notes":
        return (
          <input
            className="border rounded px-2 py-1 text-sm text-gray-900"
            value={row.notes || ""}
            onChange={e => onEdit("notes", e.target.value)}
            placeholder="Add notes"
          />
        );
      case "remarks":
        return (
          <input
            className="border rounded px-2 py-1 text-sm text-gray-900"
            value={row.remarks || ""}
            onChange={e => onEdit("remarks", e.target.value)}
            placeholder="Add remarks"
          />
        );
      default:
        return row[col.key] || '';
    }
  }

  function renderSubtaskCell(col, sub, task, subIdx) {
    switch (col.key) {
      case "task":
      case "project name":
        return (
          <input
            className="border rounded px-2 py-1 text-sm font-bold text-gray-900"
            value={sub.name}
            onChange={e => handleEditSubtask(task.id, sub.id, "name", e.target.value)}
            placeholder="Subtask name"
          />
        );
      case "category":
      case "task category":
        return (
          <ReorderableDropdown
            label="Task Category"
            options={[
              { value: "Design", label: "Design" },
              { value: "Development", label: "Development" },
              { value: "Testing", label: "Testing" },
              { value: "Review", label: "Review" }
            ]}
            value={sub.category || "Design"}
            onChange={val => handleEditSubtask(task.id, sub.id, "category", val)}
          />
        );
      case "referenceNumber":
      case "reference number":
        return (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={sub.referenceNumber || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "referenceNumber", e.target.value)}
          />
        );
      case "status":
        return (
          <select
            className={`border rounded px-2 py-1 text-xs font-bold ${statusColors[sub.status] || 'bg-gray-200 text-gray-700'}`}
            value={sub.status}
            onChange={e => handleEditSubtask(task.id, sub.id, "status", e.target.value)}
          >
            <option value="done">Done</option>
            <option value="working">Working</option>
            <option value="stuck">Stuck</option>
            <option value="not started">Not Started</option>
          </select>
        );
      case "owner":
        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs bg-pink-200 text-pink-700 border border-white shadow-sm">{sub.owner}</span>;
      case "timeline":
        const subTimelineHasPredecessors = sub.predecessors && sub.predecessors.toString().trim() !== '';
        return <TimelineCell value={sub.timeline} onChange={val => handleEditSubtask(task.id, sub.id, "timeline", val)} hasPredecessors={subTimelineHasPredecessors} />;
      case "priority":
        return <select
          className="border rounded px-2 py-1 text-sm"
          value={sub.priority}
          onChange={e => handleEditSubtask(task.id, sub.id, "priority", e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>;
      case "location":
        return (
          <div className="flex items-center gap-1">
            <input
              className="border rounded px-2 py-1 text-sm"
              value={sub.location}
              onChange={e => handleEditSubtask(task.id, sub.id, "location", e.target.value)}
              placeholder="Enter location or pick on map"
            />
            <button type="button" onClick={() => handleOpenMapPicker('sub', task.id, sub.id, sub.location)} title="Pick on map">
              <MapPinIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
            </button>
          </div>
        );
      case "plotNumber":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.plotNumber || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "plotNumber", e.target.value)}
            placeholder="Enter plot number"
          />
        );
      case "community":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.community || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "community", e.target.value)}
            placeholder="Enter community"
          />
        );
      case "projectType":
        return (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sub.projectType || "Residential"}
            onChange={e => handleEditSubtask(task.id, sub.id, "projectType", e.target.value)}
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Mixed Use">Mixed Use</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>
        );
      case "projectFloor":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.projectFloor || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "projectFloor", e.target.value)}
            placeholder="Enter project floor"
          />
        );
      case "developerProject":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.developerProject || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "developerProject", e.target.value)}
            placeholder="Enter developer project"
          />
        );
      case "notes":
        return <span className="flex items-center gap-1 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition"><span>{sub.notes || "Add note"}</span><PencilSquareIcon className="w-4 h-4 text-gray-400" /></span>;
      case "attachments":
        return (
          <div>
            <input
              type="file"
              multiple
              onChange={e => {
                const files = Array.from(e.target.files);
                handleEditSubtask(task.id, sub.id, "attachments", files);
              }}
            />
            <ul className="mt-1 text-xs text-gray-600">
              {(sub.attachments || []).map((file, idx) => (
                <li key={idx}>{file.name || (typeof file === 'string' ? file : '')}</li>
              ))}
            </ul>
          </div>
        );
      case "autoNumber":
      case "auto #":
        return <span>{subIdx + 1}</span>;
      case "predecessors":
        const subPredecessorsHasValue = sub.predecessors && sub.predecessors.toString().trim() !== '';
        return (
          <div className="relative">
            <input
              className={`border rounded px-2 py-1 text-sm pr-6 ${subPredecessorsHasValue ? 'border-green-300 bg-green-50' : ''}`}
              value={sub.predecessors}
              onChange={e => handleEditSubtask(task.id, sub.id, "predecessors", e.target.value)}
              placeholder="Enter task IDs (e.g., 1, 2, 3)"
            />
            {subPredecessorsHasValue && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600">🔗</span>
            )}
          </div>
        );
      case "checklist":
        return (
          <input
            type="checkbox"
            checked={!!sub.checklist}
            onChange={e => handleEditSubtask(task.id, sub.id, "checklist", e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        );
      case "link":
        return <input
          className="border rounded px-2 py-1 text-sm"
          value={sub.link}
          onChange={e => handleEditSubtask(task.id, sub.id, "link", e.target.value)}
        />;
      case "rating":
        if (sub.status === 'done' && isAdmin) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 cursor-pointer transition ${i <= sub.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => handleEditSubtask(task.id, sub.id, "rating", i)}
                  fill={i <= sub.rating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        } else if (isAdmin) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 cursor-pointer transition ${i <= sub.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setShowRatingPrompt(true)}
                  fill={i <= sub.rating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        } else {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 transition ${i <= sub.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill={i <= sub.rating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        }
      case "progress":
        return <div className="flex flex-col items-center">
          <div className="w-24 h-2 bg-gray-200 rounded relative overflow-hidden mb-1">
            <div
              className="h-2 rounded bg-blue-500 transition-all duration-500"
              style={{ width: `${sub.progress}%` }}
            ></div>
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-gray-700">{sub.progress}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={sub.progress}
            onChange={e => handleEditSubtask(task.id, sub.id, "progress", Number(e.target.value))}
            className="w-24"
          />
        </div>;
      case "color":
        return <label className="inline-flex items-center gap-2 cursor-pointer">
          <span className="inline-block w-6 h-6 rounded-full border-2 border-gray-200" style={{ background: sub.color }}></span>
          <input
            type="color"
            value={sub.color}
            onChange={e => handleEditSubtask(task.id, sub.id, "color", e.target.value)}
            className="w-6 h-6 p-0 border-0 bg-transparent"
            style={{ visibility: 'hidden', position: 'absolute' }}
          />
          <span className="text-xs text-gray-500">{sub.color}</span>
        </label>;
      case "planDays":
        return (
          <input
            type="number"
            min={0}
            className="border rounded px-2 py-1 text-sm text-gray-900 w-20 text-center"
            value={sub.planDays || 0}
            onChange={e => handleEditSubtask(task.id, sub.id, "planDays", Number(e.target.value))}
            placeholder="Enter plan days"
          />
        );
      case "assign":
        return (
          <input
            className="border rounded px-2 py-1 text-sm text-gray-900"
            value={sub.assign || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "assign", e.target.value)}
            placeholder="Enter assignee notes"
          />
        );
      case "notes":
        return (
          <input
            className="border rounded px-2 py-1 text-sm text-gray-900"
            value={sub.notes || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "notes", e.target.value)}
            placeholder="Add notes"
          />
        );
      case "remarks":
        return (
          <input
            className="border rounded px-2 py-1 text-sm text-gray-900"
            value={sub.remarks || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "remarks", e.target.value)}
            placeholder="Add remarks"
          />
        );
      case "assigneeNotes":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.assigneeNotes || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "assigneeNotes", e.target.value)}
            placeholder="Enter assignee notes"
          />
        );
      default:
        return sub[col.key] || '';
    }
  }

  // Add handleDragEnd function
  function handleDragEnd(event) {
    const { active, over } = event;
    
    // Check if both active and over exist and are valid
    if (!active || !over || !active.id || !over.id) {
      return;
    }
    
    if (active.id !== over.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        
        // Check if both indices are valid
        if (oldIndex === -1 || newIndex === -1) {
          return prev;
        }
        
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  // Add column type options for the add column menu
  const COLUMN_TYPE_OPTIONS = [
    { key: 'status', label: 'Status', icon: '🟢' },
    { key: 'text', label: 'Text', icon: '🔤' },
    { key: 'date', label: 'Date', icon: '📅' },
    { key: 'number', label: 'Number', icon: '🔢' },
    { key: 'dropdown', label: 'Dropdown', icon: '⬇️' },
    { key: 'files', label: 'Files', icon: '📎' },
    { key: 'priority', label: 'Priority', icon: '⚡' },
    { key: 'color', label: 'Color Picker', icon: '🎨' },
  ];

  // Add state for add column menu
  const [showAddColumnMenu, setShowAddColumnMenu] = useState(false);
  const [addColumnMenuPos, setAddColumnMenuPos] = useState({ x: 0, y: 0 });
  const [addColumnSearch, setAddColumnSearch] = useState('');

  function handleShowAddColumnMenu(e) {
    const rect = e.target.getBoundingClientRect();
    const dropdownWidth = 288; // w-72 in px
    let left = rect.left;
    if (left + dropdownWidth > window.innerWidth) {
      left = window.innerWidth - dropdownWidth - 16; // 16px margin from right
      if (left < 0) left = 0;
    }
    setAddColumnMenuPos({ x: left, y: rect.bottom });
    setShowAddColumnMenu(true);
  }
  function handleAddColumn(type) {
    const newKey = `custom_${type}_${Date.now()}`;
    const newCol = { key: newKey, label: `New ${COLUMN_TYPE_OPTIONS.find(opt => opt.key === type).label}`, type };
    setColumns(cols => [...cols, newCol]);
    setColumnOrder(order => [...order, newKey]);
    setTasks(ts => ts.map(t => ({
      ...t,
      [newKey]: '',
      subtasks: (t.subtasks || []).map(s => ({ ...s, [newKey]: '' }))
    })));
    setShowAddColumnMenu(false);
    setAddColumnSearch('');
  }
  const filteredColumnOptions = COLUMN_TYPE_OPTIONS.filter(opt => opt.label.toLowerCase().includes(addColumnSearch.toLowerCase()));

  // Function to reset column order to include all columns
  function resetColumnOrder() {
    const allColumns = columns.map(col => col.key);
    setColumnOrder(allColumns);
    localStorage.setItem('columnOrder', JSON.stringify(allColumns));
  }

  // Add the handler for subtask drag end
  function handleSubtaskDragEnd(event, taskId) {
    const { active, over } = event;
    
    // Check if both active and over exist and are valid
    if (!active || !over || !active.id || !over.id) {
      return;
    }
    
    if (active.id === over.id) return;
    
    setTasks(tasks =>
      tasks.map(task => {
        if (task.id !== taskId) return task;
        const oldIndex = task.subtasks.findIndex(sub => sub.id === active.id);
        const newIndex = task.subtasks.findIndex(sub => sub.id === over.id);
        
        // Check if both indices are valid
        if (oldIndex === -1 || newIndex === -1) {
          return task;
        }
        
        return {
          ...task,
          subtasks: arrayMove(task.subtasks, oldIndex, newIndex)
        };
      })
    );
  }

  return (
    <div className="flex bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">
      {/* Sidebar */}
     
      {/* Main Content */}
      <main className="flex flex-col flex-1">
        <div className="w-full px-4 pt-0 pb-0">
          {/* Enhanced Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm rounded-b-lg">
            {/* Left side - Show All Columns button and New Project button */}
            <div className="flex items-center gap-3">
              <button 
                className="px-4 py-2.5 text-sm bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                onClick={resetColumnOrder}
                title="Reset columns to show all fields"
              >
                <EyeIcon className="w-4 h-4 inline mr-2" />
                Show All Columns
              </button>
                          <button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              onClick={handleAddNewTask}
            >
              <PlusIcon className="w-5 h-5" /> New Team Project
            </button>
            </div>
            
            {/* Right side - Search, Project Start, and Add Column */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md w-64"
                    placeholder="Search team projects..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <CalendarIcon className="w-4 h-4 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">Project Start:</label>
                  <input
                    type="date"
                    className="px-2 py-1 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm transition-all duration-200"
                    value={format(projectStartDate, 'yyyy-MM-dd')}
                    onChange={e => handleProjectStartDateChange(new Date(e.target.value))}
                  />
                </div>
              </div>
              <div className="relative">
                <button className="p-2.5 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5" onClick={() => setShowAddColumnDropdown(v => !v)}>
                  <PlusIcon className="w-5 h-5 text-blue-600" />
                </button>
                {showAddColumnDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="p-3 text-gray-700 font-medium">Add Column</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Enhanced Table Container */}
          <div className="flex-1 flex flex-col mt-4">
            <div className="w-full px-4 py-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <table className="w-full table-auto bg-white">
                {/* Enhanced Table header */}
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        {columnOrder
                          .filter(key => key !== 'category') // Remove TASK CATEGORY header for main tasks
                          .map(key => {
                            const col = columns.find(c => c.key === key);
                            if (!col) return null;
                            return <DraggableHeader key={col.key} col={col} colKey={col.key} />;
                          })}
                        <th key="add-column" className="px-3 py-4 text-center">
                          <button
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                            onClick={handleShowAddColumnMenu}
                            title="Add column"
                            type="button"
                          >
                            +
                          </button>
                        </th>
                      </tr>
                    </thead>
                  </SortableContext>
                </DndContext>
                <tbody className="divide-y divide-gray-100">
                  {newTask && (
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
                      {columnOrder.map((colKey, idx) => {
                        const col = columns.find(c => c.key === colKey);
                        if (!col) return null;
                        return (
                          <td key={col.key} className="px-4 py-3 align-middle">
                            {col.key === "task" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.name}
                                onChange={e => setNewTask({ ...newTask, name: e.target.value })}
                              />
                            ) : col.key === "referenceNumber" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.referenceNumber || ""}
                                onChange={e => setNewTask({ ...newTask, referenceNumber: e.target.value })}
                              />
                            ) : col.key === "category" ? (
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.category}
                                onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                              >
                                <option value="Design">Design</option>
                                <option value="Development">Development</option>
                                <option value="Testing">Testing</option>
                                <option value="Review">Review</option>
                              </select>
                            ) : col.key === "status" ? (
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.status}
                                onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                              >
                                <option value="Pending">pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Suspended">Suspended</option>
                              </select>
                            ) : col.key === "owner" ? (
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.owner || ""}
                                onChange={e => setNewTask({ ...newTask, owner: e.target.value })}
                              >
                                <option value="">Select owner</option>
                                <option value="MN">MN</option>
                                <option value="SA">SA</option>
                                <option value="AL">AL</option>
                                {/* Add all possible users here */}
                              </select>
                            ) : col.key === "timeline" ? (
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Timeline:</label>
                                <TimelineCell value={newTask.timeline} onChange={val => {
                                  // Update timeline and calculate plan days
                                  const updatedNewTask = { ...newTask, timeline: val };
                                  if (val && val[0] && val[1]) {
                                    const planDays = differenceInCalendarDays(val[1], val[0]) + 1;
                                    updatedNewTask.planDays = planDays;
                                  }
                                  setNewTask(updatedNewTask);
                                }} />
                              </div>
                            ) : col.key === "planDays" ? (
                              <input
                                type="number"
                                min={0}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.planDays || 0}
                                onChange={e => {
                                  const newPlanDays = Number(e.target.value);
                                  // Update plan days and recalculate timeline
                                  const updatedNewTask = { ...newTask, planDays: newPlanDays };
                                  if (newTask.timeline && newTask.timeline[0] && newPlanDays > 0) {
                                    const newEnd = addDays(new Date(newTask.timeline[0]), newPlanDays - 1);
                                    updatedNewTask.timeline = [newTask.timeline[0], newEnd];
                                  }
                                  setNewTask(updatedNewTask);
                                }}
                                placeholder="Enter plan days"
                              />
                            ) : col.key === "remarks" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.remarks || ""}
                                onChange={e => setNewTask(nt => ({ ...nt, remarks: e.target.value }))}
                                placeholder="Enter remarks"
                              />
                            ) : col.key === "assigneeNotes" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.assigneeNotes || ""}
                                onChange={e => setNewTask(nt => ({ ...nt, assigneeNotes: e.target.value }))}
                                placeholder="Enter assignee notes"
                              />
                            ) : col.key === "attachments" ? (
                              <div>
                                <input
                                  type="file"
                                  multiple
                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                  onChange={e => {
                                    const files = Array.from(e.target.files);
                                    setNewTask(nt => ({ ...nt, attachments: files }));
                                  }}
                                />
                                <ul className="mt-1 text-xs text-gray-600">
                                  {(newTask.attachments || []).map((file, idx) => (
                                    <li key={idx}>{file.name || (typeof file === 'string' ? file : '')}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : col.key === "priority" ? (
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.priority}
                                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </select>
                            ) : col.key === "location" ? (
                              <div className="flex items-center gap-2">
                                <input
                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 flex-1"
                                  value={newTask.location}
                                  onChange={e => setNewTask({ ...newTask, location: e.target.value })}
                                  placeholder="Enter location or pick on map"
                                />
                                <button type="button" onClick={() => handleOpenMapPicker('main', newTask.id, null, newTask.location)} title="Pick on map" className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200">
                                  <MapPinIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                                </button>
                              </div>
                            ) : col.key === "plotNumber" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.plotNumber || ""}
                                onChange={e => setNewTask(nt => ({ ...nt, plotNumber: e.target.value }))}
                                placeholder="Enter plot number"
                              />
                            ) : col.key === "community" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.community || ""}
                                onChange={e => setNewTask(nt => ({ ...nt, community: e.target.value }))}
                                placeholder="Enter community"
                              />
                            ) : col.key === "projectType" ? (
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.projectType || "Residential"}
                                onChange={e => setNewTask(nt => ({ ...nt, projectType: e.target.value }))}
                              >
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Industrial">Industrial</option>
                                <option value="Mixed Use">Mixed Use</option>
                                <option value="Infrastructure">Infrastructure</option>
                              </select>
                            ) : col.key === "projectFloor" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.projectFloor || ""}
                                onChange={e => setNewTask(nt => ({ ...nt, projectFloor: e.target.value }))}
                                placeholder="Enter project floor"
                              />
                            ) : col.key === "developerProject" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.developerProject || ""}
                                onChange={e => setNewTask(nt => ({ ...nt, developerProject: e.target.value }))}
                                placeholder="Enter developer project"
                              />
                            ) : col.key === "notes" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.notes}
                                onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                              />
                            ) : col.key === "autoNumber" ? (
                              <span className="text-gray-600 font-medium">{newTask.autoNumber}</span>
                            ) : col.key === "predecessors" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                    value={newTask.predecessors || ""}
                                    onChange={e => setNewTask(nt => ({ ...nt, predecessors: e.target.value }))}
                                    placeholder="Enter predecessors"
                                  />
                            ) : null}
                          </td>
                        );
                      })}
                          <td key="add-column" className="px-4 py-3 align-middle">
                            <div className="flex items-center gap-2">
                              <button
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 font-medium"
                                onClick={handleCreateTask}
                                title="Save new project"
                              >
                                Save
                              </button>
                              <button
                                className="px-4 py-2 bg-red-600 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-all duration-200"
                                onClick={() => setNewTask(null)}
                                title="Cancel new project"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                  )}
                  {filteredTasks.map(task => (
                    <React.Fragment key={task.id}>
                      {/* Main Task Row */}
                      <tr className="bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-b border-gray-100">
                        {columnOrder
                          .filter(key => key !== 'category') // REMOVE TASK CATEGORY ONLY FOR MAIN TASK ROWS
                          .map((colKey, idx) => {
                            const col = columns.find(c => c.key === colKey);
                            if (!col) return null;
                            return (
                              <td key={col.key} className="px-4 py-4 align-middle">
                                {col.key === 'task' && idx === 0 ? (
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => toggleExpand(task.id, 'active')}
                                      className="focus:outline-none p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                      title={expandedActive[task.id] ? 'Collapse' : 'Expand'}
                                    >
                                      {expandedActive[task.id] ? <ChevronDownIcon className="w-5 h-5 text-gray-500" /> : <ChevronRightIcon className="w-5 h-5 text-gray-500" />}
                                    </button>
                                    {editingTaskId === task.id ? (
                                      <input
                                        type="text"
                                        value={editingTaskName}
                                        autoFocus
                                        onChange={handleProjectNameChange}
                                        onBlur={() => handleProjectNameBlur(task)}
                                        onKeyDown={e => handleProjectNameKeyDown(e, task)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                      />
                                    ) : (
                                      <span
                                        className="font-bold text-blue-700 hover:text-blue-800 hover:underline focus:outline-none cursor-pointer transition-all duration-200"
                                        onClick={() => handleProjectNameClick(task)}
                                        onDoubleClick={() => handleProjectNameDoubleClick(task)}
                                      >
                                        {task.name}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  renderMainCell(col, task, (field, value) => {
                                    if (col.key === 'delete') handleDeleteRow(task.id);
                                    else handleEdit(task, field, value);
                                  })
                                )}
                              </td>
                            );
                          })}
                        <td key="add-column" className="px-4 py-4 align-middle">
                          <button
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                            onClick={handleShowAddColumnMenu}
                            title="Add column"
                            type="button"
                          >
                            +
                          </button>
                        </td>
                      </tr>
                      {/* Subtasks as subtable - always render */}
                      {expandedActive[task.id] && (
                        <tr>
                          <td colSpan={columnOrder.length} className="p-0 bg-gradient-to-r from-gray-50 to-blue-50">
                            <table className="ml-12 table-fixed min-w-full">
                              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300">
                                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                                    <tr>
                                      <th></th> {/* Drag handle header cell for alignment */}
                                      {columnOrder.map(colKey => {
                                        const col = columns.find(c => c.key === colKey);
                                        if (!col) return null;
                                        return <DraggableHeader key={col.key} col={col} colKey={col.key} />;
                                      })}
                                      <th key="add-column" className="px-4 py-3 text-xs font-bold text-gray-600 uppercase text-center w-12">
                                        <button
                                          className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                          onClick={handleShowAddColumnMenu}
                                          title="Add column"
                                          type="button"
                                        >
                                          +
                                        </button>
                                      </th>
                                    </tr>
                                  </SortableContext>
                                </DndContext>
                              </thead>
                              <tbody>
                                <DndContext onDragEnd={event => handleSubtaskDragEnd(event, task.id)}>
                                  <SortableContext items={task.subtasks.map(sub => sub.id)} strategy={verticalListSortingStrategy}>
                                    {task.subtasks.map((sub, subIdx) => (
                                      <SortableSubtaskRow key={sub.id} sub={sub} subIdx={subIdx} task={task}>
                                        {columnOrder.map(colKey => {
                                          const col = columns.find(c => c.key === colKey);
                                          if (!col) return null;
                                          return (
                                            <td key={col.key} className={`px-3 py-2 align-middle${col.key === 'delete' ? ' text-center w-12' : ''}`}>{renderSubtaskCell(col, sub, task, subIdx)}</td>
                                          );
                                        })}
                                      </SortableSubtaskRow>
                                    ))}
                                  </SortableContext>
                                </DndContext>
                                {/* Add Subtask Button and Form */}
                                <tr>
                                  <td colSpan={columnOrder.length} className="px-4 py-3">
                                    {showSubtaskForm === task.id ? (
                                      <form
                                        className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                                        onSubmit={e => {
                                          e.preventDefault();
                                          handleAddSubtask(task.id);
                                        }}
                                      >
                                        {columnOrder.map(colKey => {
                                          const col = columns.find(c => c.key === colKey);
                                          if (!col) return null;
                                          return (
                                            <div key={col.key} className="flex-1">
                                              <label className="block text-xs font-medium text-gray-700 mb-1">{col.label}:</label>
                                              {col.key === "category" ? (
                                                <select
                                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                                  value={newSubtask[col.key]}
                                                  onChange={e => setNewSubtask(s => ({ ...s, [col.key]: e.target.value }))}
                                                >
                                                  <option value="Design">Design</option>
                                                  <option value="Development">Development</option>
                                                  <option value="Testing">Testing</option>
                                                  <option value="Review">Review</option>
                                                </select>
                                              ) : col.key === "status" ? (
                                                <select
                                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                                  value={newSubtask[col.key]}
                                                  onChange={e => setNewSubtask(s => ({ ...s, [col.key]: e.target.value }))}
                                                >
                                                  <option value="not started">Not Started</option>
                                                  <option value="working">Working</option>
                                                  <option value="done">Done</option>
                                                  <option value="stuck">Stuck</option>
                                                </select>
                                              ) : col.key === "timeline" ? (
                                                <TimelineCell value={newSubtask[col.key]} onChange={val => setNewSubtask(s => ({ ...s, [col.key]: val }))} />
                                              ) : col.key === "planDays" ? (
                                                <input
                                                  type="number"
                                                  min={0}
                                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                                  value={newSubtask[col.key] || 0}
                                                  onChange={e => setNewSubtask(s => ({ ...s, [col.key]: Number(e.target.value) }))}
                                                  placeholder="Enter plan days"
                                                />
                                              ) : col.key === "remarks" ? (
                                                <input
                                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                                  value={newSubtask[col.key] || ""}
                                                  onChange={e => setNewSubtask(s => ({ ...s, [col.key]: e.target.value }))}
                                                  placeholder="Enter remarks"
                                                />
                                              ) : col.key === "assigneeNotes" ? (
                                                <input
                                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                                  value={newSubtask[col.key] || ""}
                                                  onChange={e => setNewSubtask(s => ({ ...s, [col.key]: e.target.value }))}
                                                  placeholder="Enter assignee notes"
                                                />
                                              ) : col.key === "attachments" ? (
                                                <div>
                                                  <input
                                                    type="file"
                                                    multiple
                                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                                    onChange={e => {
                                                      const files = Array.from(e.target.files);
                                                      setNewSubtask(s => ({ ...s, attachments: files }));
                                                    }}
                                                  />
                                                  <ul className="mt-1 text-xs text-gray-600">
                                                    {(newSubtask.attachments || []).map((file, idx) => (
                                                      <li key={idx}>{file.name || (typeof file === 'string' ? file : '')}</li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              ) : (
                                                <input
                                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                                  value={newSubtask[col.key]}
                                                  onChange={e => setNewSubtask(s => ({ ...s, [col.key]: e.target.value }))}
                                                />
                                              )}
                                            </div>
                                          );
                                        })}
                                        <div className="flex gap-2">
                                          <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">Add</button>
                                          <button type="button" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200" onClick={() => setShowSubtaskForm(null)}>Cancel</button>
                                        </div>
                                      </form>
                                    ) : (
                                      <button
                                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-semibold transition-all duration-200 flex items-center gap-1"
                                        onClick={() => setShowSubtaskForm(task.id)}
                                      >
                                        <PlusIcon className="w-4 h-4" />
                                        Add Subtask
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {completedTasks.length > 0 && (
            <div className="mt-12 flex items-center gap-3 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                Completed Team Projects
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent"></div>
            </div>
          )}
          {completedTasks.length > 0 && (
            <div className="w-full px-4 py-0 mt-4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <table className="w-full table-auto bg-white">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                    <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                      <tr>
                        {columnOrder.map(key => {
                          const col = columns.find(c => c.key === key);
                          if (!col) return null;
                          return <DraggableHeader key={col.key} col={col} colKey={col.key} />;
                        })}
                        <th key="add-column" className="px-4 py-4 text-center">
                          <button
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                            onClick={handleShowAddColumnMenu}
                            title="Add column"
                            type="button"
                          >
                            +
                          </button>
                        </th>
                      </tr>
                    </thead>
                  </SortableContext>
                </DndContext>
                <tbody className="divide-y divide-green-100">
                  {completedTasks.map(task => (
                    <React.Fragment key={task.id}>
                      <tr className="bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-b border-green-100">
                        {columnOrder.map((colKey, idx) => {
                          const col = columns.find(c => c.key === colKey);
                          if (!col) return null;
                          return (
                            <td key={col.key} className="px-4 py-4 align-middle">
                              {col.key === 'task' && idx === 0 ? (
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => toggleExpand(task.id, 'completed')}
                                    className="focus:outline-none p-1 rounded-lg hover:bg-green-100 transition-all duration-200"
                                    title={expandedCompleted[task.id] ? 'Collapse' : 'Expand'}
                                  >
                                    {expandedCompleted[task.id] ? <ChevronDownIcon className="w-5 h-5 text-green-600" /> : <ChevronRightIcon className="w-5 h-5 text-green-600" />}
                                  </button>
                                  <button
                                    className="font-bold text-green-700 hover:text-green-800 hover:underline focus:outline-none transition-all duration-200"
                                    onClick={() => { setSelectedProject(task); setShowProjectDialog(true); }}
                                  >
                                    {task.name}
                                  </button>
                                </div>
                              ) : (
                                renderMainCell(col, task, (field, value) => {
                                  if (col.key === 'delete') handleDeleteRow(task.id);
                                  else handleEdit(task, field, value);
                                })
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      {/* Subtasks as subtable - only render if expandedCompleted[task.id] */}
                      {expandedCompleted[task.id] && (
                        <tr>
                          <td colSpan={columnOrder.length} className="p-0 bg-gray-50">
                            <table className="ml-12 table-fixed min-w-full">
                              <thead>
                                <tr>
                                  {columnOrder.map(colKey => {
                                    const col = columns.find(c => c.key === colKey);
                                    if (!col) return null;
                                    return (
                                      <th key={col.key} className={`px-3 py-2 text-xs font-bold text-gray-500 uppercase${col.key === 'delete' ? ' text-center w-12' : ''}`}>{col.label}</th>
                                    );
                                  })}
                                  <th key="add-column" className="px-3 py-2 text-xs font-bold text-gray-500 uppercase text-center w-12">
                                    <button
                                      className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 text-2xl flex items-center justify-center shadow"
                                      onClick={handleShowAddColumnMenu}
                                      title="Add column"
                                      type="button"
                                    >
                                      +
                                    </button>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <DndContext onDragEnd={event => handleSubtaskDragEnd(event, task.id)}>
                                  <SortableContext items={task.subtasks.map(sub => sub.id)} strategy={verticalListSortingStrategy}>
                                    {task.subtasks.map((sub, subIdx) => (
                                      <SortableSubtaskRow key={sub.id} sub={sub} subIdx={subIdx} task={task}>
                                        {columnOrder.map(colKey => {
                                          const col = columns.find(c => c.key === colKey);
                                          if (!col) return null;
                                          return (
                                            <td key={col.key} className={`px-3 py-2 align-middle${col.key === 'delete' ? ' text-center w-12' : ''}`}>{renderSubtaskCell(col, sub, task, subIdx)}</td>
                                          );
                                        })}
                                      </SortableSubtaskRow>
                                    ))}
                                  </SortableContext>
                                </DndContext>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Simulate creating a task */}
          {showNewTask && (
            <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Create New Team Project</h2>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-700 transition w-full"
                  onClick={handleCreateTask}
                >
                  Create Team Project
                </button>
                <button
                  className="mt-2 text-gray-500 hover:underline w-full"
                  onClick={() => setShowNewTask(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {/* Project Summary Modal */}
          {selectedProjectForSummary && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40">
              <div className="bg-white h-full w-full max-w-4xl shadow-2xl rounded-l-2xl p-0 overflow-y-auto relative flex flex-col">
                {/* Accent bar */}
                <div className="h-3 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-400 rounded-tl-2xl" />
                <button
                  onClick={closeProjectSummary}
                  className="absolute top-6 right-8 text-gray-400 hover:text-red-500 text-3xl font-bold z-10"
                  aria-label="Close"
                >
                  &times;
                </button>
                <div className="p-16 pt-10 flex-1 flex flex-col">
                  <h2 className="text-3xl font-extrabold mb-2 text-gray-900 tracking-tight">{selectedProjectForSummary.name}</h2>
                  <div className="text-base text-gray-500 mb-8">Reference #: <span className="font-semibold text-gray-700">{selectedProjectForSummary.referenceNumber}</span></div>
                  <div className="space-y-8">
                    {/* Project Info Section */}
                    <div>
                      <div className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                        <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg>
                        Project Info
                      </div>
                      <div className="space-y-2">
                        <div><span className="text-gray-500">Category: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.category}</span></div>
                        <div><span className="text-gray-500">Type: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.projectType}</span></div>
                        <div><span className="text-gray-500">Plot Number: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.plotNumber}</span></div>
                        <div><span className="text-gray-500">Community: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.community}</span></div>
                        <div><span className="text-gray-500">Project Floor: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.projectFloor}</span></div>
                        <div><span className="text-gray-500">Developer Project: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.developerProject}</span></div>
                      </div>
                    </div>
                    <hr className="my-4 border-gray-200" />
                    {/* Status Section */}
                    <div>
                      <div className="text-lg font-semibold text-cyan-700 mb-4 flex items-center gap-2">
                        <svg className="h-6 w-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
                        Status
                      </div>
                      <div className="space-y-2">
                        <div><span className="text-gray-500">Status: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.status}</span></div>
                        <div><span className="text-gray-500">Owner: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.owner}</span></div>
                        <div><span className="text-gray-500">Priority: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.priority}</span></div>
                        <div><span className="text-gray-500">Timeline: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.timeline && selectedProjectForSummary.timeline.join(' - ')}</span></div>
                        <div><span className="text-gray-500">Plan Days: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.planDays}</span></div>
                      </div>
                    </div>
                    <hr className="my-4 border-gray-200" />
                    {/* Other Info Section */}
                    <div>
                      <div className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
                        <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 5h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg>
                        Other Info
                      </div>
                      <div className="space-y-2">
                        <div><span className="text-gray-500">Location: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.location}</span></div>
                        <div><span className="text-gray-500">Remarks: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.remarks}</span></div>
                        <div><span className="text-gray-500">Assignee Notes: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.assigneeNotes}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {showRatingPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full text-center">
            <div className="text-lg font-semibold mb-4">Please set status to Done and then come back to rate.</div>
            <button
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
              onClick={() => setShowRatingPrompt(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showProjectDialog && selectedProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button
              className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
              onClick={() => setShowProjectDialog(false)}
            >
              <XMarkIcon className="w-6 h-6 text-gray-400" />
            </button>
            <div className="text-2xl font-bold mb-2">{selectedProject.name}</div>
            <div className="mb-4 text-sm text-gray-500">Reference #: <span className="font-semibold text-gray-700">{selectedProject.referenceNumber}</span></div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><span className="font-semibold">Status:</span> <span className="inline-block px-2 py-1 rounded text-white" style={{ background: statusColors[selectedProject.status] || '#ccc' }}>{selectedProject.status}</span></div>
              <div><span className="font-semibold">Owner:</span> {selectedProject.owner}</div>
              <div><span className="font-semibold">Priority:</span> {selectedProject.priority}</div>
              <div><span className="font-semibold">Category:</span> {selectedProject.category}</div>
              <div><span className="font-semibold">Timeline:</span> {selectedProject.timeline && selectedProject.timeline[0] && selectedProject.timeline[1] ? `${format(new Date(selectedProject.timeline[0]), 'MMM d, yyyy')} – ${format(new Date(selectedProject.timeline[1]), 'MMM d, yyyy')}` : '—'}</div>
              <div><span className="font-semibold">Plan Days:</span> {selectedProject.planDays}</div>
              <div><span className="font-semibold">Location:</span> {selectedProject.location}</div>
              <div><span className="font-semibold">Plot Number:</span> {selectedProject.plotNumber}</div>
              <div><span className="font-semibold">Community:</span> {selectedProject.community}</div>
              <div><span className="font-semibold">Project Type:</span> {selectedProject.projectType}</div>
              <div><span className="font-semibold">Project Floor:</span> {selectedProject.projectFloor}</div>
              <div><span className="font-semibold">Developer Project:</span> {selectedProject.developerProject}</div>
              <div><span className="font-semibold">Remarks:</span> {selectedProject.remarks}</div>
              <div><span className="font-semibold">Assignee Notes:</span> {selectedProject.assigneeNotes}</div>
              <div><span className="font-semibold">Checklist:</span> <input type="checkbox" checked={!!selectedProject.checklist} readOnly className="w-5 h-5 text-blue-600 border-gray-300 rounded" /></div>
              <div><span className="font-semibold">Link:</span> {selectedProject.link && (<a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline inline-flex items-center gap-1"><LinkIcon className="w-4 h-4" />{selectedProject.link}</a>)}</div>
              <div><span className="font-semibold">Files:</span> {selectedProject.attachments && selectedProject.attachments.length > 0 ? (<ul className="mt-1 text-xs text-gray-600">{selectedProject.attachments.map((file, idx) => (<li key={idx} className="flex items-center gap-1"><PaperClipIcon className="w-4 h-4" />{file.name || (typeof file === 'string' ? file : '')}</li>))}</ul>) : 'No files'}</div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">Rating:</span>
              <span className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <StarIcon
                    key={i}
                    className={`w-5 h-5 ${i <= selectedProject.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill={i <= selectedProject.rating ? '#facc15' : 'none'}
                  />
                ))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Progress:</span>
              <div className="w-32 h-3 bg-gray-200 rounded relative overflow-hidden">
                <div className="h-3 rounded bg-blue-500 transition-all duration-500" style={{ width: `${selectedProject.progress || 0}%` }}></div>
              </div>
              <span className="text-xs text-gray-700">{selectedProject.progress || 0}%</span>
            </div>
          </div>
        </div>
      )}
      {mapPickerOpen && (
        <MapPicker
          lat={mapPickerCoords.lat}
          lng={mapPickerCoords.lng}
          onPick={handlePickLocation}
          onClose={() => setMapPickerOpen(false)}
        />
      )}
      {googleMapPickerOpen && (
        <GoogleMapPickerDemo
          onPick={handlePickLocation}
          onClose={() => setGoogleMapPickerOpen(false)}
        />
      )}
      {showAddColumnMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-72"
          style={{ left: addColumnMenuPos.x, top: addColumnMenuPos.y }}
        >
          <div className="mb-2">
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Search column types..."
              value={addColumnSearch}
              onChange={e => setAddColumnSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredColumnOptions.map(opt => (
              <button
                key={opt.key}
                className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-blue-50 text-left"
                onClick={() => handleAddColumn(opt.key)}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
            {filteredColumnOptions.length === 0 && (
              <div className="text-gray-400 text-sm px-2 py-4">No column types found.</div>
            )}
          </div>
          <button
            className="mt-2 w-full text-blue-600 hover:underline text-sm"
            onClick={() => alert('More column types coming soon!')}
          >
            More columns
          </button>
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
            onClick={() => setShowAddColumnMenu(false)}
            title="Close"
            type="button"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// Draggable header component
function DraggableHeader({ col, colKey }) {
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
}