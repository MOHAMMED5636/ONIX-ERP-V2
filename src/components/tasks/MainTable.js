import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import {
  PlusIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { addDays, differenceInCalendarDays, isValid } from 'date-fns';
import MapPicker from '../../modules/WorkingLocations.js';

// Import extracted components
import ProjectRow from "./MainTable/ProjectRow";
import CompletedProjects from "./MainTable/CompletedProjects";
import Filters from "./MainTable/Filters";
import TimelineCell from "./MainTable/TimelineCell";
import DraggableHeader from "./MainTable/DraggableHeader";
import SortableSubtaskRow from "./MainTable/SortableSubtaskRow";
import GoogleMapPickerDemo from "./MainTable/GoogleMapPickerDemo";
import CellRenderer from "./MainTable/CellRenderer";
import Modals from "./MainTable/Modals";

// Import utilities
import {
  INITIAL_COLUMNS,
  calculateTaskTimelines,
  filterTasks,
  filterCompletedTasks,
  getDefaultColumnOrder,
  loadColumnOrderFromStorage,
  saveColumnOrderToStorage,
  getMissingColumns,
  validateTask,
  generateTaskId,
  createNewSubtask,
  calculateTaskProgress,
  areAllSubtasksComplete,
  createNewColumn,
  addColumnToTasks,
  formatLocationString
} from "./utils/tableUtils";

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



const isAdmin = true; // TODO: Replace with real authentication logic





export default function MainTable() {
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
    const errors = validateTask(newTask);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    // Create the task with current newTask data
    const taskToAdd = {
      ...newTask,
      id: generateTaskId(),
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
      ...createNewSubtask(),
      ...newSubtask
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
        const allDone = areAllSubtasksComplete(updatedSubtasks);
        // Calculate average progress of subtasks
        const avgProgress = calculateTaskProgress(updatedSubtasks);
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
    const value = formatLocationString(lat, lng);
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



  // Recalculate timelines whenever tasks or projectStartDate change
  useEffect(() => {
    setTasks(ts => calculateTaskTimelines(ts, projectStartDate));
  }, [projectStartDate]);

  const filteredTasks = filterTasks(tasks, search);


  const [columns, setColumns] = useState(INITIAL_COLUMNS);

  // Store column order in state
  const defaultColumnOrder = getDefaultColumnOrder(columns);
  const [columnOrder, setColumnOrder] = useState(() => {
    return loadColumnOrderFromStorage(defaultColumnOrder);
  });
  useEffect(() => {
    saveColumnOrderToStorage(columnOrder);
  }, [columnOrder]);

  // Force refresh column order when component mounts to include new fields
  useEffect(() => {
    const currentOrder = columnOrder;
    const allColumns = getDefaultColumnOrder(columns);
    const missingColumns = getMissingColumns(currentOrder, allColumns);
    
    if (missingColumns.length > 0) {
      const newOrder = [...currentOrder, ...missingColumns];
      setColumnOrder(newOrder);
      saveColumnOrderToStorage(newOrder);
    }
  }, [columns]);

  const completedTasks = filterCompletedTasks(tasks);







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
    const newCol = createNewColumn(type);
    setColumns(cols => [...cols, newCol]);
    setColumnOrder(order => [...order, newCol.key]);
    setTasks(ts => addColumnToTasks(ts, newCol.key));
    setShowAddColumnMenu(false);
    setAddColumnSearch('');
  }
  const filteredColumnOptions = [
    { key: 'status', label: 'Status', icon: '🟢' },
    { key: 'text', label: 'Text', icon: '🔤' },
    { key: 'date', label: 'Date', icon: '📅' },
    { key: 'number', label: 'Number', icon: '🔢' },
    { key: 'dropdown', label: 'Dropdown', icon: '⬇️' },
    { key: 'files', label: 'Files', icon: '📎' },
    { key: 'priority', label: 'Priority', icon: '⚡' },
    { key: 'color', label: 'Color Picker', icon: '🎨' },
  ].filter(opt => opt.label.toLowerCase().includes(addColumnSearch.toLowerCase()));

  // Function to reset column order to include all columns
  function resetColumnOrder() {
    const allColumns = getDefaultColumnOrder(columns);
    setColumnOrder(allColumns);
    saveColumnOrderToStorage(allColumns);
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
      <main className="flex flex-col flex-1 ">
        <div className="w-full px-4 pt-0 pb-0">
          <Filters
            search={search}
            setSearch={setSearch}
            projectStartDate={projectStartDate}
            handleProjectStartDateChange={handleProjectStartDateChange}
            handleAddNewTask={handleAddNewTask}
            resetColumnOrder={resetColumnOrder}
            showAddColumnMenu={showAddColumnMenu}
            setShowAddColumnMenu={setShowAddColumnMenu}
            addColumnMenuPos={addColumnMenuPos}
            addColumnSearch={addColumnSearch}
            setAddColumnSearch={setAddColumnSearch}
            filteredColumnOptions={filteredColumnOptions}
            handleAddColumn={handleAddColumn}
            handleShowAddColumnMenu={handleShowAddColumnMenu}
          />
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
                                    const planDays = new Date(val[1]) - new Date(val[0]) + 1;
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
                          <ProjectRow
                            task={task}
                            columnOrder={columnOrder}
                            columns={columns}
                            expandedActive={expandedActive}
                            editingTaskId={editingTaskId}
                            editingTaskName={editingTaskName}
                            onToggleExpand={toggleExpand}
                            onProjectNameClick={handleProjectNameClick}
                            onProjectNameDoubleClick={handleProjectNameDoubleClick}
                            onProjectNameChange={handleProjectNameChange}
                            onProjectNameBlur={handleProjectNameBlur}
                            onProjectNameKeyDown={handleProjectNameKeyDown}
                            onEdit={handleEdit}
                            onDelete={handleDeleteRow}
                            onShowAddColumnMenu={handleShowAddColumnMenu}
                            CellRenderer={CellRenderer}
                            isAdmin={isAdmin}
                          />
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
                                            <td key={col.key} className={`px-3 py-2 align-middle${col.key === 'delete' ? ' text-center w-12' : ''}`}>
                                              {CellRenderer.renderSubtaskCell(col, sub, task, subIdx, handleEditSubtask, isAdmin)}
                                            </td>
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
          <CompletedProjects
            completedTasks={completedTasks}
            columnOrder={columnOrder}
            columns={columns}
            expandedCompleted={expandedCompleted}
            onToggleExpand={toggleExpand}
            onEdit={handleEdit}
            onDelete={handleDeleteRow}
            onShowAddColumnMenu={handleShowAddColumnMenu}
            onSubtaskDragEnd={handleSubtaskDragEnd}
            renderMainCell={(col, row, onEdit) => CellRenderer.renderMainCell(col, row, onEdit, isAdmin)}
            renderSubtaskCell={(col, sub, task, subIdx) => CellRenderer.renderSubtaskCell(col, sub, task, subIdx, handleEditSubtask, isAdmin)}
            setSelectedProject={setSelectedProject}
            setShowProjectDialog={setShowProjectDialog}
            DraggableHeader={DraggableHeader}
          />
          {/* Simulate creating a task */}
          {showNewTask && (
            <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Create New Project</h2>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-700 transition w-full"
                  onClick={handleCreateTask}
                >
                  Create Project
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

      {/* Modals */}
      <Modals.RatingPrompt 
        showRatingPrompt={showRatingPrompt} 
        setShowRatingPrompt={setShowRatingPrompt} 
      />
      
      <Modals.ProjectDialog 
        showProjectDialog={showProjectDialog} 
        selectedProject={selectedProject} 
        setShowProjectDialog={setShowProjectDialog} 
      />
      
      <Modals.ProjectSummary 
        selectedProjectForSummary={selectedProjectForSummary} 
        closeProjectSummary={closeProjectSummary} 
      />
      
      <Modals.NewTaskModal 
        showNewTask={showNewTask} 
        setShowNewTask={setShowNewTask} 
        handleCreateTask={handleCreateTask} 
      />

    </div>
  );
}

