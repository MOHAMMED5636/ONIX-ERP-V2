import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import MapPicker from '../../modules/WorkingLocations.js';

// Import extracted components and utilities
import {
  GoogleMapPickerDemo,
  SortableSubtaskRow,
  DraggableHeader,
  CellRenderer,
  Modals,
  initialTasks,
  statusColors,
  isAdmin,
  calculateTaskTimelines,
  handleTaskEdit,
  handleSubtaskEdit,
  handleLocationPick
} from './index';

export default function TeamProjectTrackerRefactored() {
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

  // Handle project start date changes and recalculate all timelines
  function handleProjectStartDateChange(newStartDate) {
    setProjectStartDate(newStartDate);
    // Timeline recalculation will be handled by the useEffect that watches projectStartDate
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

  // Add handleDragEnd function
  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // Add handleSubtaskDragEnd function
  function handleSubtaskDragEnd(event, taskId) {
    const { active, over } = event;
    if (active.id !== over.id) {
      setTasks(tasks => {
        return tasks.map(task => {
          if (task.id !== taskId) return task;
          
          const oldIndex = task.subtasks.findIndex(sub => sub.id === active.id);
          const newIndex = task.subtasks.findIndex(sub => sub.id === over.id);
          
          return {
            ...task,
            subtasks: arrayMove(task.subtasks, oldIndex, newIndex)
          };
        });
      });
    }
  }

  // Add handleShowAddColumnMenu function
  function handleShowAddColumnMenu() {
    // Implementation for adding columns
    console.log('Add column menu clicked');
  }

  // Add handleCreateTask function
  function handleCreateTask() {
    const newTask = {
      id: Date.now(),
      name: "New Team Project",
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
    };
    setTasks(prev => [...prev, newTask]);
    setShowNewTask(false);
  }

  // Add handleEdit function
  function handleEdit(task, col, value) {
    setTasks(tasks => handleTaskEdit(tasks, task, col, value, projectStartDate));
  }

  // Add handleEditSubtask function
  function handleEditSubtask(taskId, subId, col, value) {
    setTasks(tasks => handleSubtaskEdit(tasks, tasks.find(t => t.id === taskId), subId, col, value, projectStartDate));
  }

  // Add handleDeleteRow function
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

  // Add handleAddNewTask function
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

  // Add handleOpenMapPicker function
  function handleOpenMapPicker(type, taskId, subId, latLngStr) {
    setMapPickerTarget({ type, taskId, subId });
    setGoogleMapPickerOpen(true);
  }

  // Add handlePickLocation function
  function handlePickLocation(lat, lng) {
    setTasks(tasks => handleLocationPick(tasks, mapPickerTarget, lat, lng));
    setGoogleMapPickerOpen(false);
  }

  // Add toggleExpand function
  function toggleExpand(taskId, type = 'active') {
    if (type === 'active') {
      setExpandedActive(exp => ({ ...exp, [taskId]: !exp[taskId] }));
    } else {
      setExpandedCompleted(exp => ({ ...exp, [taskId]: !exp[taskId] }));
    }
  }

  // Add renderMainCell function using CellRenderer
  function renderMainCell(col, row, onEdit) {
    return CellRenderer.renderMainCell(col, row, onEdit, handleOpenMapPicker, setShowRatingPrompt);
  }

  // Add renderSubtaskCell function using CellRenderer
  function renderSubtaskCell(col, sub, task, subIdx) {
    return CellRenderer.renderSubtaskCell(col, sub, task, subIdx, handleEditSubtask, handleOpenMapPicker);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <style>{`
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); }
        .animate-logo-glow { animation: logoGlow 2.5s infinite alternate; }
        @keyframes logoGlow { 0% { box-shadow: 0 0 0 0 #a5b4fc33, 0 0 0 0 #67e8f933; } 100% { box-shadow: 0 0 16px 4px #a5b4fc66, 0 0 32px 8px #67e8f966; } }
        .fab-pop { animation: fabPop 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes fabPop { from { transform: scale(0.7);} to { transform: scale(1);} }
        .nav-pop { transition: box-shadow 0.2s, transform: 0.2s; }
        .nav-pop:hover, .nav-pop:focus { box-shadow: 0 2px 8px 0 #a5b4fc33; }
        
        /* Task row hover styles */
        .project-row { 
          background-color: #ffffff !important; 
          transition: background-color 0.2s ease-in-out;
        }
        .project-row:hover { 
          background-color: #e6f4ff !important; 
        }
        .subtask-row { 
          background-color: #6c757d !important; 
          transition: background-color 0.2s ease-in-out;
        }
        .subtask-row:hover { 
          background-color: #e6f4ff !important; 
        }
        .childtask-row { 
          background-color: #f8f9fa !important; 
          transition: background-color 0.2s ease-in-out;
        }
        .childtask-row:hover { 
          background-color: #e6f4ff !important; 
        }
      `}</style>
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="glass-card rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Team Project Tracker
              </h1>
              <p className="text-gray-600 text-lg">Manage and track your team's projects with real-time collaboration</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/50 rounded-lg px-4 py-2 border border-white/20">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <input
                  type="date"
                  value={projectStartDate.toISOString().split('T')[0]}
                  onChange={e => handleProjectStartDateChange(new Date(e.target.value))}
                  className="bg-transparent border-none outline-none text-gray-700 font-medium"
                />
              </div>
              <button
                onClick={() => { handleAddNewTask(); setShowNewTask(true); }}
                className="fab-pop bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                New Project
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-card rounded-xl p-6 mb-8 shadow-lg border border-white/20">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/70 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="nav-pop bg-white/70 hover:bg-white/90 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                Location
              </button>
              <button className="nav-pop bg-white/70 hover:bg-white/90 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
                <EyeIcon className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        </div>

        {/* Active Projects Table */}
        <div className="glass-card rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{filteredTasks.length}</span>
              </div>
              Active Team Projects
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto bg-white">
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <tr>
                      {columnOrder.map(key => {
                        const col = columns.find(c => c.key === key);
                        if (!col) return null;
                        return <DraggableHeader key={col.key} col={col} colKey={col.key} />;
                      })}
                      <th key="add-column" className="px-4 py-4 text-center">
                        <button
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
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
                {filteredTasks.map(task => (
                  <React.Fragment key={task.id}>
                    <tr className="project-row rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-b border-gray-100">
                      {columnOrder.map((colKey, idx) => {
                        const col = columns.find(c => c.key === colKey);
                        if (!col) return null;
                        return (
                          <td key={col.key} className="px-4 py-4 align-middle">
                            {col.key === 'task' && idx === 0 ? (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleExpand(task.id, 'active')}
                                  className="focus:outline-none p-1 rounded-lg hover:bg-blue-100 transition-all duration-200"
                                  title={expandedActive[task.id] ? 'Collapse' : 'Expand'}
                                >
                                  {expandedActive[task.id] ? <ChevronDownIcon className="w-5 h-5 text-blue-600" /> : <ChevronRightIcon className="w-5 h-5 text-blue-600" />}
                                </button>
                                <button
                                  className="font-bold text-blue-700 hover:text-blue-800 hover:underline focus:outline-none transition-all duration-200"
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
                    {/* Subtasks as subtable - only render if expandedActive[task.id] */}
                    {expandedActive[task.id] && (
                      <tr>
                        <td colSpan={columnOrder.length} className="p-0 bg-gray-50">
                          <div className="ml-8 pl-4 border-l-2 border-blue-200">
                            <table className="w-full table-fixed">
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
                                          <td key={col.key} className={`px-3 py-2 align-middle${col.key === 'delete' ? ' text-center w-12' : ''}`}>
                                            {renderSubtaskCell(col, sub, task, subIdx)}
                                          </td>
                                        );
                                      })}
                                    </SortableSubtaskRow>
                                  ))}
                                </SortableContext>
                              </DndContext>
                            </tbody>
                          </table>
                            </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Completed Projects Section */}
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
                    <tr className="project-row rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-b border-green-100">
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
                          <div className="ml-8 pl-4 border-l-2 border-green-200">
                            <table className="w-full table-fixed">
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
                                          <td key={col.key} className={`px-3 py-2 align-middle${col.key === 'delete' ? ' text-center w-12' : ''}`}>
                                            {renderSubtaskCell(col, sub, task, subIdx)}
                                          </td>
                                        );
                                      })}
                                    </SortableSubtaskRow>
                                  ))}
                                </SortableContext>
                              </DndContext>
                            </tbody>
                          </table>
                            </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
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

        {/* Map Pickers */}
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
      </main>
    </div>
  );
}

