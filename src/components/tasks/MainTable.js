import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import {
  PlusIcon,
  MapPinIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  EyeIcon,
  FunnelIcon,
  XMarkIcon,
  StarIcon
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
import CheckboxWithPopup from "./MainTable/CheckboxWithPopup";
import MultiSelectCheckbox from "./MainTable/MultiSelectCheckbox";
import BulkActionBar from "./MainTable/BulkActionBar";
import BulkEditDrawer from "./MainTable/BulkEditDrawer";
import BulkViewDrawer from "./MainTable/BulkViewDrawer";

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
  formatLocationString,
  statusColors
} from "./utils/tableUtils";

// Custom hook for debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

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
    pinned: false, // Add pinned property
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
        color: "#f59e42",
        childSubtasks: [
          {
            id: 111,
            name: "Child Task 1.1",
            referenceNumber: "REF-001-1-1",
            category: "Design",
            status: "done",
            owner: "SA",
            timeline: [null, null],
            remarks: "",
            assigneeNotes: "",
            attachments: [],
            priority: "Low",
            location: "",
            plotNumber: "PLOT-001-1-1",
            community: "Downtown District",
            projectType: "Residential",
            projectFloor: "5",
            developerProject: "Onix Development",
            completed: false,
            checklist: false,
            rating: 1,
            progress: 10,
            color: "#f59e42"
          },
          {
            id: 112,
            name: "Child Task 1.2",
            referenceNumber: "REF-001-1-2",
            category: "Development",
            status: "working",
            owner: "MN",
            timeline: [null, null],
            remarks: "",
            assigneeNotes: "",
            attachments: [],
            priority: "Medium",
            location: "",
            plotNumber: "PLOT-001-1-2",
            community: "Downtown District",
            projectType: "Residential",
            projectFloor: "5",
            developerProject: "Onix Development",
            completed: false,
            checklist: false,
            rating: 3,
            progress: 30,
            color: "#10d081"
          }
        ]
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
        plotNumber: "PLOT-001-2",
        community: "Downtown District",
        projectType: "Residential",
        projectFloor: "5",
        developerProject: "Onix Development",
        completed: false,
        checklist: false,
        rating: 4,
        progress: 70,
        color: "#10d081",
        childSubtasks: []
      },
      {
        id: 13,
        name: "Subitem 3",
        category: "Testing",
        status: "not started",
        owner: "AL",
        due: "2024-07-21",
        priority: "High",
        timeline: "2024-07-21 – 2024-07-22",
        location: "",
        plotNumber: "PLOT-001-3",
        community: "Downtown District",
        projectType: "Residential",
        projectFloor: "5",
        developerProject: "Onix Development",
        completed: false,
        checklist: false,
        rating: 2,
        progress: 40,
        color: "#f20d11",
        childSubtasks: []
      },
      {
        id: 14,
        name: "Subitem 4",
        category: "Review",
        status: "stuck",
        owner: "SA",
        due: "2024-07-23",
        priority: "Low",
        timeline: "2024-07-23 – 2024-07-24",
        location: "",
        plotNumber: "PLOT-001-4",
        community: "Downtown District",
        projectType: "Residential",
        projectFloor: "5",
        developerProject: "Onix Development",
        completed: false,
        checklist: false,
        rating: 1,
        progress: 10,
        color: "#f20d11"
      }
    ]
  },
  {
    id: 2,
    name: "Website Development",
    referenceNumber: "REF-002",
    category: "Development",
    status: "working",
    owner: "SA",
    timeline: [null, null],
    planDays: 15,
    remarks: "High priority project",
    assigneeNotes: "Need to complete by end of month",
    attachments: [],
    priority: "High",
    location: "Remote",
    plotNumber: "PLOT-002",
    community: "Tech District",
    projectType: "Commercial",
    projectFloor: "3",
    developerProject: "Tech Solutions Inc",
    checklist: true,
    rating: 4,
    progress: 75,
    color: "#10d081",
    pinned: true, // Add pinned property - this one is pinned
    subtasks: []
  },
  {
    id: 3,
    name: "Mobile App Design",
    referenceNumber: "REF-003",
    category: "Design",
    status: "pending",
    owner: "AH",
    timeline: [null, null],
    planDays: 8,
    remarks: "",
    assigneeNotes: "",
    attachments: [],
    priority: "Medium",
    location: "Design Studio",
    plotNumber: "PLOT-003",
    community: "Creative Hub",
    projectType: "Mixed Use",
    projectFloor: "2",
    developerProject: "Creative Agency",
    checklist: false,
    rating: 3,
    progress: 25,
    color: "#f59e42",
    pinned: false, // Add pinned property
    subtasks: []
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

  // Enhanced filter handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      global: '',
      name: '',
      status: '',
      assignee: '',
      plan: '',
      category: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  // Enhanced filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    global: '',
    name: '',
    status: '',
    assignee: '',
    plan: '',
    category: '',
    dateFrom: '',
    dateTo: '',
  });

  // Multi-select state
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [showBulkEditDrawer, setShowBulkEditDrawer] = useState(false);
  const [showBulkViewDrawer, setShowBulkViewDrawer] = useState(false);

  // Debounced search for better performance
  const debouncedSearch = useDebounce(search, 300);
  const debouncedFilters = useDebounce(filters, 300);
  
  // Loading state for search
  const [isSearching, setIsSearching] = useState(false);
  
  // Show loading when search is being processed
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => setIsSearching(false), 100);
    return () => clearTimeout(timer);
  }, [debouncedSearch, debouncedFilters]);

  // Keyboard shortcut to focus search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
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
    location: "",
    plotNumber: "",
    community: "",
    projectType: "Residential",
    projectFloor: "",
    developerProject: "",
    notes: "",
    predecessors: "",
    checklist: false,
    link: "",
    rating: 0
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
    if (!newTask) {
      return;
    }
    
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

  // Keyboard handlers for input fields
  const handleNewTaskKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleCreateTask();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setNewTask(null);
      setShowNewTask(false);
    }
  };

  const handleSubtaskKeyDown = (e, taskId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleAddSubtask(taskId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
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
        location: "",
        plotNumber: "",
        community: "",
        projectType: "Residential",
        projectFloor: "",
        developerProject: "",
        notes: "",
        predecessors: "",
        checklist: false,
        link: "",
        rating: 0
      });
    }
  };

  const handleChildSubtaskKeyDown = (e, taskId, parentSubtaskId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleAddChildSubtask(taskId, parentSubtaskId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setShowChildSubtaskForm(null);
      setNewChildSubtask({
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
        location: "",
        plotNumber: "",
        community: "",
        projectType: "Residential",
        projectFloor: "",
        developerProject: "",
        notes: "",
        predecessors: "",
        checklist: false,
        link: "",
        rating: 0
      });
    }
  };

  // Checkbox column handlers
  const handleEditTask = (task) => {
    // Open edit modal or inline edit for the task
    setSelectedProjectForSummary(task);
    setShowProjectDialog(true);
  };

  const handleDeleteTask = (taskId, parentTaskId = null) => {
    if (parentTaskId) {
      // Delete subtask
      setTasks(tasks => tasks.map(task => 
        task.id === parentTaskId 
          ? { ...task, subtasks: task.subtasks.filter(sub => sub.id !== taskId) }
          : task
      ));
    } else {
      // Delete main task
      setTasks(tasks => tasks.filter(task => task.id !== taskId));
    }
  };

  const handleCopyTask = (taskData) => {
    const content = `Task: ${taskData.name}
Reference: ${taskData.referenceNumber}
Status: ${taskData.status}
Owner: ${taskData.owner}
Priority: ${taskData.priority}
Category: ${taskData.category}
Location: ${taskData.location}
Remarks: ${taskData.remarks}
Assignee Notes: ${taskData.assigneeNotes}`;
    
    navigator.clipboard.writeText(content).then(() => {
      alert('Task copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard');
    });
  };

  // Multi-select handlers
  const handleTaskSelection = (taskId, isChecked) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (taskId, isChecked) => {
    if (isChecked) {
      setSelectedTaskIds(new Set(filteredTasks.map(task => task.id)));
    } else {
      setSelectedTaskIds(new Set());
    }
  };

  const handleBulkEdit = (selectedTasks) => {
    setShowBulkEditDrawer(true);
  };

  const handleBulkDelete = (selectedTasks) => {
    const taskIds = selectedTasks.map(task => task.id);
    setTasks(tasks => tasks.filter(task => !taskIds.includes(task.id)));
    setSelectedTaskIds(new Set());
  };

  const handleBulkCopy = (selectedTasks) => {
    const content = selectedTasks.map(task => 
      `Task: ${task.name}
Reference: ${task.referenceNumber}
Status: ${task.status}
Owner: ${task.owner}
Priority: ${task.priority}
Category: ${task.category}
Location: ${task.location}
Remarks: ${task.remarks}
Assignee Notes: ${task.assigneeNotes}
---`
    ).join('\n\n');
    
    navigator.clipboard.writeText(content).then(() => {
      alert('Selected projects copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard');
    });
  };

  const handleBulkView = (selectedTasks) => {
    setShowBulkViewDrawer(true);
  };

  const handleBulkSave = (selectedTasks, formData) => {
    setTasks(tasks => tasks.map(task => {
      if (selectedTasks.some(selectedTask => selectedTask.id === task.id)) {
        const updatedTask = { ...task };
        Object.keys(formData).forEach(field => {
          if (formData[field] !== '') {
            updatedTask[field] = formData[field];
          }
        });
        return updatedTask;
      }
      return task;
    }));
  };

  const handleClearSelection = () => {
    setSelectedTaskIds(new Set());
  };

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
      location: "",
      plotNumber: "",
      community: "",
      projectType: "Residential",
      projectFloor: "",
      developerProject: "",
      notes: "",
      predecessors: "",
      checklist: false,
      link: "",
      rating: 0
    });
  }

  function handleEditSubtask(taskId, subId, col, value) {
    // Handle delete case
    if (col === 'delete') {
      handleDeleteRow(subId, taskId);
      return;
    }

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
      subtasks: [],
      pinned: false // Add pinned property
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

  // Handle pin/unpin functionality
  function handleTogglePin(taskId) {
    setTasks(tasks => tasks.map(task => 
      task.id === taskId ? { ...task, pinned: !task.pinned } : task
    ));
  }



  // Recalculate timelines whenever tasks or projectStartDate change
  useEffect(() => {
    setTasks(ts => calculateTaskTimelines(ts, projectStartDate));
  }, [projectStartDate]);

  // Filter and sort tasks - pinned tasks first, then by existing sorting
  const filteredTasks = filterTasks(tasks, debouncedSearch, debouncedFilters).sort((a, b) => {
    // First sort by pinned status (pinned tasks first)
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Then maintain existing order within each group
    return 0;
  });

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

  // Ensure checkbox column is always first
  useEffect(() => {
    console.log('Current columnOrder:', columnOrder);
    if (!columnOrder.includes('checkbox')) {
      console.log('Adding checkbox column to columnOrder');
      const newOrder = ['checkbox', ...columnOrder];
      setColumnOrder(newOrder);
      saveColumnOrderToStorage(newOrder);
    } else if (columnOrder[0] !== 'checkbox') {
      console.log('Moving checkbox column to first position');
      const newOrder = ['checkbox', ...columnOrder.filter(col => col !== 'checkbox')];
      setColumnOrder(newOrder);
      saveColumnOrderToStorage(newOrder);
    }
  }, [columnOrder]);

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
    console.log('Resetting column order. All columns:', allColumns);
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

  // Add state for child subtask form
  const [showChildSubtaskForm, setShowChildSubtaskForm] = useState(null); // subId or null
  const [newChildSubtask, setNewChildSubtask] = useState({
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
    location: "",
    plotNumber: "",
    community: "",
    projectType: "Residential",
    projectFloor: "",
    developerProject: "",
    notes: "",
    predecessors: "",
    checklist: false,
    link: "",
    rating: 0
  });

  function handleAddChildSubtask(taskId, parentSubtaskId) {
    const newChildSubtaskData = {
      ...createNewSubtask(),
      ...newChildSubtask,
      id: generateTaskId() // Ensure unique ID
    };
    
    setTasks(tasks => {
      const updatedTasks = tasks.map(t =>
        t.id === taskId
          ? {
            ...t,
            subtasks: t.subtasks.map(sub =>
              sub.id === parentSubtaskId
                ? {
                  ...sub,
                  childSubtasks: [
                    ...(sub.childSubtasks || []),
                    newChildSubtaskData
                  ]
                }
                : sub
            )
          }
          : t
      );
      return calculateTaskTimelines(updatedTasks, projectStartDate);
    });
    
    setShowChildSubtaskForm(null);
    setNewChildSubtask({
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
      location: "",
      plotNumber: "",
      community: "",
      projectType: "Residential",
      projectFloor: "",
      developerProject: "",
      notes: "",
      predecessors: "",
      checklist: false,
      link: "",
      rating: 0
    });
  }

  function handleEditChildSubtask(taskId, parentSubtaskId, childSubtaskId, col, value) {
    setTasks(tasks => {
      const updatedTasks = tasks.map(t => {
        if (t.id !== taskId) return t;
        
        const updatedSubtasks = t.subtasks.map(sub => {
          if (sub.id !== parentSubtaskId) return sub;
          
          const updatedChildSubtasks = sub.childSubtasks.map(child => {
            if (child.id !== childSubtaskId) return child;
            
            if (col === 'timeline') {
              const [start, end] = value;
              let planDays = 0;
              if (isValid(start) && isValid(end)) {
                planDays = differenceInCalendarDays(end, start) + 1;
              }
              return { ...child, timeline: value, planDays };
            } else if (col === 'planDays') {
              const [start, end] = child.timeline || [];
              if (isValid(start) && value > 0) {
                const newEnd = addDays(new Date(start), value - 1);
                return { ...child, planDays: value, timeline: [start, newEnd] };
              }
              return { ...child, planDays: value };
            } else {
              return { ...child, [col]: value };
            }
          });
          
          // If all child subtasks are done, set parent subtask status to 'done'
          const allDone = updatedChildSubtasks.length > 0 && updatedChildSubtasks.every(child => child.status === 'done');
          
          return {
            ...sub,
            childSubtasks: updatedChildSubtasks,
            status: allDone ? 'done' : sub.status
          };
        });
        
        return {
          ...t,
          subtasks: updatedSubtasks
        };
      });
      
      // If timeline or planDays changed, recalculate all timelines
      if (col === 'timeline' || col === 'planDays') {
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      }
      
      return updatedTasks;
    });
  }

  function startEditChildSubtask(childSubtaskId, colKey, value) {
    setEditingSubtask({ [`${childSubtaskId}_${colKey}`]: true });
    setEditSubValue(value);
  }

  function handleDeleteChildSubtask(taskId, parentSubtaskId, childSubtaskId) {
    setTasks(tasks => {
      const updatedTasks = tasks.map(t => {
        if (t.id !== taskId) return t;
        
        const updatedSubtasks = t.subtasks.map(sub => {
          if (sub.id !== parentSubtaskId) return sub;
          
          const updatedChildSubtasks = sub.childSubtasks.filter(child => child.id !== childSubtaskId);
          
          // If all child subtasks are done, set parent subtask status to 'done'
          const allDone = updatedChildSubtasks.length > 0 && updatedChildSubtasks.every(child => child.status === 'done');
          
          return {
            ...sub,
            childSubtasks: updatedChildSubtasks,
            status: allDone ? 'done' : sub.status
          };
        });
        
        return {
          ...t,
          subtasks: updatedSubtasks
        };
      });
      
      return calculateTaskTimelines(updatedTasks, projectStartDate);
    });
  }

  // Create a context-aware wrapper for child subtasks
  const createChildSubtaskEditHandler = (parentSubtaskId) => {
    return (taskId, childSubtaskId, col, value) => {
      handleEditChildSubtask(taskId, parentSubtaskId, childSubtaskId, col, value);
    };
  };

  // Direct wrapper for child subtask timeline editing
  const handleChildSubtaskTimelineEdit = (parentSubtaskId) => {
    return (val) => {
      // This is called by TimelineCell with just the value
      // We need to find the current context
      console.log('Timeline edit called with:', val, 'for parent subtask:', parentSubtaskId);
    };
  };

  // Custom cell renderer for child subtasks
  const renderChildSubtaskCell = (col, childSub, task, parentSubtaskId, childIdx) => {
    switch (col.key) {
      case "task":
      case "project name":
        return (
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-xs">└─</span>
            <input
              className="border rounded px-1 py-1 text-xs font-bold text-gray-900 flex-1"
              value={childSub.name}
              onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "name", e.target.value)}
              onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
              placeholder="Task Name"
            />
          </div>
        );
      case "category":
      case "task category":
        return (
          <select
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.category || "Design"}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "category", e.target.value)}
          >
            <option value="Design">Design</option>
            <option value="Development">Development</option>
            <option value="Testing">Testing</option>
            <option value="Review">Review</option>
          </select>
        );
      case "referenceNumber":
      case "reference number":
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.referenceNumber || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "referenceNumber", e.target.value)}
          />
        );
      case "status":
        return (
          <select
            className={`border rounded px-1 py-1 text-xs font-bold w-full ${statusColors[childSub.status] || 'bg-gray-200 text-gray-700'}`}
            value={childSub.status}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "status", e.target.value)}
          >
            <option value="done">Done</option>
            <option value="working">Working</option>
            <option value="stuck">Stuck</option>
            <option value="not started">Not Started</option>
          </select>
        );
      case "owner":
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs bg-pink-200 text-pink-700 border border-white shadow-sm">
            {childSub.owner}
          </span>
        );
      case "timeline":
        const childTimelineHasPredecessors = childSub.predecessors && childSub.predecessors.toString().trim() !== '';
        return (
          <TimelineCell 
            value={childSub.timeline} 
            onChange={val => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "timeline", val)} 
            hasPredecessors={childTimelineHasPredecessors} 
          />
        );
      case "priority":
        return (
          <select
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.priority}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "priority", e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        );
      case "planDays":
        return (
          <input
            type="number"
            min={0}
            className="border rounded px-1 py-1 text-xs w-16 text-center"
            value={childSub.planDays || 0}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "planDays", Number(e.target.value))}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Days"
          />
        );
      case "remarks":
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.remarks || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "remarks", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Remarks"
          />
        );
      case "assigneeNotes":
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.assigneeNotes || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "assigneeNotes", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Assignee notes"
          />
        );
      case "attachments":
        return (
          <div>
            <input
              type="file"
              multiple
              className="text-xs"
              onChange={e => {
                const files = Array.from(e.target.files);
                handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "attachments", files);
              }}
            />
            <ul className="mt-1 text-xs text-gray-600">
              {(childSub.attachments || []).map((file, idx) => (
                <li key={idx}>{file.name || (typeof file === 'string' ? file : '')}</li>
              ))}
            </ul>
          </div>
        );
      case "location":
        return (
          <div className="flex items-center gap-1">
            <input
              className="border rounded px-1 py-1 text-xs flex-1"
              value={childSub.location || ""}
              onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "location", e.target.value)}
              placeholder="Location"
            />
            <button 
              type="button" 
              onClick={() => handleOpenMapPicker('child', task.id, childSub.id, childSub.location)} 
              title="Pick on map"
              className="text-blue-500 hover:text-blue-700"
            >
              <MapPinIcon className="w-4 h-4" />
            </button>
          </div>
        );
      case "plotNumber":
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.plotNumber || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "plotNumber", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Plot #"
          />
        );
      case "community":
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.community || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "community", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Community"
          />
        );
      case "projectType":
        return (
          <select
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.projectType || "Residential"}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "projectType", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
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
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.projectFloor || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "projectFloor", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Floor"
          />
        );
      case "developerProject":
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.developerProject || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "developerProject", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Developer"
          />
        );
      case "notes":
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.notes || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "notes", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Notes"
          />
        );
      case "autoNumber":
        return <span className="text-xs">{childSub.autoNumber || childSub.id}</span>;
      case "predecessors":
        const childPredecessorsHasValue = childSub.predecessors && childSub.predecessors.toString().trim() !== '';
        return (
          <div className="relative">
            <input
              className={`border rounded px-1 py-1 text-xs pr-4 w-full ${childPredecessorsHasValue ? 'border-green-300 bg-green-50' : ''}`}
              value={childSub.predecessors || ""}
              onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "predecessors", e.target.value)}
              onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
              placeholder="Task IDs"
            />
            {childPredecessorsHasValue && (
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-green-600">🔗</span>
            )}
          </div>
        );
      case "checklist":
        return (
          <input
            type="checkbox"
            checked={!!childSub.checklist}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "checklist", e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        );
      case "link":
        return (
          <input
            className="border rounded px-1 py-1 text-xs w-full"
            value={childSub.link || ""}
            onChange={e => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "link", e.target.value)}
            onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, parentSubtaskId)}
            placeholder="Link"
          />
        );
      case "rating":
        if (childSub.status === 'done' && isAdmin) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 cursor-pointer transition ${i <= childSub.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "rating", i)}
                  fill={i <= childSub.rating ? '#facc15' : 'none'}
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
                  className={`w-4 h-4 cursor-pointer transition ${i <= childSub.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => handleEditChildSubtask(task.id, parentSubtaskId, childSub.id, "showRatingPrompt", true)}
                  fill={i <= childSub.rating ? '#facc15' : 'none'}
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
                  className={`w-4 h-4 transition ${i <= childSub.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill={i <= childSub.rating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        }
      default:
        return <span className="text-xs text-gray-500">{childSub[col.key] || ""}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <style>{`
        .project-row { 
          background-color: #ffffff !important; 
          transition: background-color 0.2s ease-in-out;
        }
        .project-row:hover { 
          background-color: #e6f4ff !important; 
        }
        .subtask-row { 
          background-color: #faf8f5 !important; 
          transition: background-color 0.2s ease-in-out;
        }
        .subtask-row:hover { 
          background-color: #fff3cd !important; 
        }
        .childtask-row { 
          background-color: #f0f8ff !important; 
          transition: background-color 0.2s ease-in-out;
        }
        .childtask-row:hover { 
          background-color: #e6f4ff !important; 
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      {/* Main Content */}
      <main className="flex flex-col flex-1 min-h-0">
        <div className="w-full px-4 pt-0 pb-0">
          <Filters
            search={search}
            setSearch={setSearch}
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
          {/* Enhanced Table Container - Scrollable */}
          <div className="flex-1 flex flex-col mt-4 min-h-0">
            <div className="w-full px-4 py-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-visible">
              <table className="w-full table-auto bg-white min-w-full" style={{ overflow: 'visible' }}>
                {/* Enhanced Table header */}
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                        {/* Select All Checkbox Header */}
                        <th className="px-3 py-4 text-center w-12">
                          <MultiSelectCheckbox
                            task={null}
                            isChecked={selectedTaskIds.size > 0 && selectedTaskIds.size === filteredTasks.length}
                            onToggle={handleSelectAll}
                            isSelectAll={true}
                          />
                        </th>
                        {/* Pin Column Header */}
                        <th className="px-3 py-4 text-center w-12">
                          <div className="flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Pin</span>
                          </div>
                        </th>
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
                <tbody className="divide-y divide-gray-100" style={{ overflow: 'visible' }}>
                  {/* No Results Message */}
                  {filteredTasks.length === 0 && !newTask && (
                    <tr>
                      <td colSpan={columnOrder.length + 3} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                            <p className="text-gray-600">
                              Try adjusting your search terms or filters to find what you're looking for.
                            </p>
                          </div>
                          <button
                            onClick={clearAllFilters}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Clear All Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {newTask && (
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200" style={{ overflow: 'visible' }}>
                      {/* Multi-select Checkbox Column for New Task */}
                      <td className="px-4 py-3 align-middle text-center">
                        <MultiSelectCheckbox
                          task={newTask}
                          isChecked={false}
                          onToggle={() => {}} // No-op for new task
                        />
                      </td>
                      {/* Pin Column for New Task */}
                      <td className="px-4 py-3 align-middle text-center">
                        <button
                          onClick={() => setNewTask({ ...newTask, pinned: !newTask.pinned })}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                            newTask.pinned 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                          }`}
                          title={newTask.pinned ? "Unpin task" : "Pin task"}
                        >
                          📌
                        </button>
                      </td>
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
                                onKeyDown={handleNewTaskKeyDown}
                                autoFocus
                              />
                            ) : col.key === "referenceNumber" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.referenceNumber || ""}
                                onChange={e => setNewTask({ ...newTask, referenceNumber: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                              />
                            ) : col.key === "category" ? (
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.category}
                                onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
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
                                onKeyDown={handleNewTaskKeyDown}
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
                                value={newTask.owner}
                                onChange={e => setNewTask({ ...newTask, owner: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                              >
                                <option value="MN">MN</option>
                                <option value="SA">SA</option>
                                <option value="AH">AH</option>
                                <option value="MA">MA</option>
                              </select>
                            ) : col.key === "timeline" ? (
                              <TimelineCell
                                task={newTask}
                                onTimelineChange={(timeline) => setNewTask({ ...newTask, timeline })}
                                isEditing={true}
                                onKeyDown={handleNewTaskKeyDown}
                              />
                            ) : col.key === "planDays" ? (
                              <input
                                type="number"
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.planDays || ""}
                                onChange={e => setNewTask({ ...newTask, planDays: parseInt(e.target.value) || 0 })}
                                onKeyDown={handleNewTaskKeyDown}
                              />
                            ) : col.key === "remarks" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.remarks}
                                onChange={e => setNewTask({ ...newTask, remarks: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                              />
                            ) : col.key === "assigneeNotes" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.assigneeNotes}
                                onChange={e => setNewTask({ ...newTask, assigneeNotes: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                              />
                            ) : col.key === "attachments" ? (
                              <div>
                                <input
                                  type="file"
                                  multiple
                                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
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
                                onKeyDown={handleNewTaskKeyDown}
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
                                  onKeyDown={handleNewTaskKeyDown}
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
                                onKeyDown={handleNewTaskKeyDown}
                                placeholder="Enter plot number"
                              />
                            ) : col.key === "community" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.community || ""}
                                onChange={e => setNewTask(nt => ({ ...nt, community: e.target.value }))}
                                onKeyDown={handleNewTaskKeyDown}
                                placeholder="Enter community"
                              />
                            ) : col.key === "projectType" ? (
                              <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.projectType || "Residential"}
                                onChange={e => setNewTask(nt => ({ ...nt, projectType: e.target.value }))}
                                onKeyDown={handleNewTaskKeyDown}
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
                                onKeyDown={handleNewTaskKeyDown}
                                placeholder="Enter project floor"
                              />
                            ) : col.key === "developerProject" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                value={newTask.developerProject || ""}
                                onChange={e => setNewTask(nt => ({ ...nt, developerProject: e.target.value }))}
                                onKeyDown={handleNewTaskKeyDown}
                                placeholder="Enter developer project"
                              />
                            ) : col.key === "notes" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                value={newTask.notes}
                                onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                                onKeyDown={handleNewTaskKeyDown}
                              />
                            ) : col.key === "autoNumber" ? (
                              <span className="text-gray-600 font-medium">{newTask.autoNumber}</span>
                            ) : col.key === "predecessors" ? (
                              <input
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                    value={newTask.predecessors || ""}
                                    onChange={e => setNewTask(nt => ({ ...nt, predecessors: e.target.value }))}
                                    onKeyDown={handleNewTaskKeyDown}
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
                            key={task.id}
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
                            onTogglePin={handleTogglePin}
                            onAddSubtask={handleAddSubtask}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                            onCopyTask={handleCopyTask}
                            CellRenderer={CellRenderer}
                            isAdmin={isAdmin}
                            isSelected={selectedTaskIds.has(task.id)}
                            onToggleSelection={handleTaskSelection}
                            showSubtaskForm={showSubtaskForm}
                            setShowSubtaskForm={setShowSubtaskForm}
                            newSubtask={newSubtask}
                            setNewSubtask={setNewSubtask}
                            handleSubtaskKeyDown={handleSubtaskKeyDown}
                          />
                      {/* Subtasks as separate table with aligned headers */}
                      {expandedActive[task.id] && (
                        <tr>
                          <td colSpan={columnOrder.length + 3} className="p-0 bg-gradient-to-r from-gray-50 to-blue-50">
                            <table className="w-full table-fixed">
                              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300">
                                <tr>
                                  {/* Checkbox Header Column */}
                                  <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase text-center w-12">
                                    {/* Empty header for checkbox alignment */}
                                  </th>
                                  {columnOrder.map(colKey => {
                                    const col = columns.find(c => c.key === colKey);
                                    if (!col) return null;
                                    return (
                                      <th key={col.key} className={`px-4 py-3 text-xs font-bold text-gray-600 uppercase${col.key === 'delete' ? ' text-center w-12' : ''}`}>
                                        {col.label}
                                      </th>
                                    );
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
                              </thead>
                              <tbody>
                                {task.subtasks.map((sub, subIdx) => (
                                  <React.Fragment key={sub.id}>
                                    <tr className="subtask-row transition-all duration-200">
                                      {/* Checkbox Column for Subtask */}
                                      <td className="px-4 py-3 align-middle text-center w-12">
                                        <div className="flex items-center justify-center">
                                          <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                            title={`Select ${sub.name || 'task'}`}
                                          />
                                        </div>
                                      </td>
                                      {columnOrder.map(colKey => {
                                        const col = columns.find(c => c.key === colKey);
                                        if (!col) return null;
                                        return (
                                          <td key={col.key} className={`px-4 py-3 align-middle${col.key === 'delete' ? ' text-center w-12' : ''}`}>
                                            {CellRenderer.renderSubtaskCell(col, sub, task, subIdx, handleEditSubtask, isAdmin, (e) => handleSubtaskKeyDown(e, task.id), handleEditTask, handleDeleteTask, handleCopyTask)}
                                          </td>
                                        );
                                      })}
                                      <td className="w-12 text-center">
                                        <button
                                          onClick={() => handleDeleteRow(sub.id, task.id)}
                                          className="text-red-500 hover:text-red-700"
                                          title="Delete subtask"
                                        >
                                          ×
                                        </button>
                                      </td>
                                    </tr>
                                    
                                    {/* Child Subtasks */}
                                    {sub.childSubtasks && sub.childSubtasks.map((childSub, childIdx) => (
                                      <tr key={childSub.id} className="childtask-row transition-all duration-200">
                                        {/* Checkbox Column for Child Subtask */}
                                        <td className="px-4 py-2 align-middle text-center w-12">
                                          <div className="flex items-center justify-center">
                                            <input
                                              type="checkbox"
                                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                              title={`Select ${childSub.name || 'child task'}`}
                                            />
                                          </div>
                                        </td>
                                        {columnOrder.map(colKey => {
                                          const col = columns.find(c => c.key === colKey);
                                          if (!col) return null;
                                          return (
                                            <td key={col.key} className={`px-4 py-2 align-middle text-sm${col.key === 'delete' ? ' text-center w-12' : ''}`}>
                                              {renderChildSubtaskCell(col, childSub, task, sub.id, childIdx)}
                                            </td>
                                          );
                                        })}
                                        <td className="w-12 text-center">
                                          <button
                                            onClick={() => handleDeleteChildSubtask(task.id, sub.id, childSub.id)}
                                            className="text-red-500 hover:text-red-700 text-xs"
                                            title="Delete child subtask"
                                          >
                                            ×
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                    
                                    {/* Add Child Subtask Button */}
                                    <tr>
                                      <td colSpan={columnOrder.length + 2} className="px-4 py-1">
                                        {showChildSubtaskForm === sub.id ? (
                                          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                            <form
                                              className="flex flex-wrap gap-2 items-center"
                                              onSubmit={e => {
                                                e.preventDefault();
                                                handleAddChildSubtask(task.id, sub.id);
                                              }}
                                            >
                                              {columnOrder.slice(0, 4).map(colKey => {
                                                const col = columns.find(c => c.key === colKey);
                                                if (!col) return null;
                                                return (
                                                  <div key={col.key} className="flex-1 min-w-0">
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">{col.key === 'task' ? 'TASK NAME' : col.label}:</label>
                                                    {col.key === "task" || col.key === "project name" ? (
                                                      <div className="flex items-center gap-1">
                                                        <span className="text-gray-400 text-xs">└─</span>
                                                        <input
                                                          className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 flex-1"
                                                          value={newChildSubtask.name}
                                                          onChange={e => setNewChildSubtask({ ...newChildSubtask, name: e.target.value })}
                                                          onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, sub.id)}
                                                          placeholder="Task Name"
                                                          autoFocus
                                                        />
                                                      </div>
                                                    ) : col.key === "category" ? (
                                                      <select
                                                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                                        value={newChildSubtask.category}
                                                        onChange={e => setNewChildSubtask({ ...newChildSubtask, category: e.target.value })}
                                                        onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, sub.id)}
                                                      >
                                                        <option value="Design">Design</option>
                                                        <option value="Development">Development</option>
                                                        <option value="Testing">Testing</option>
                                                        <option value="Review">Review</option>
                                                      </select>
                                                    ) : col.key === "status" ? (
                                                      <select
                                                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                                        value={newChildSubtask.status}
                                                        onChange={e => setNewChildSubtask({ ...newChildSubtask, status: e.target.value })}
                                                        onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, sub.id)}
                                                      >
                                                        <option value="pending">pending</option>
                                                        <option value="working">working</option>
                                                        <option value="done">done</option>
                                                        <option value="stuck">stuck</option>
                                                      </select>
                                                    ) : col.key === "owner" ? (
                                                      <select
                                                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                                        value={newChildSubtask.owner}
                                                        onChange={e => setNewChildSubtask({ ...newChildSubtask, owner: e.target.value })}
                                                        onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, sub.id)}
                                                      >
                                                        <option value="MN">MN</option>
                                                        <option value="SA">SA</option>
                                                        <option value="AH">AH</option>
                                                        <option value="MA">MA</option>
                                                      </select>
                                                    ) : col.key === "priority" ? (
                                                      <select
                                                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
                                                        value={newChildSubtask.priority}
                                                        onChange={e => setNewChildSubtask({ ...newChildSubtask, priority: e.target.value })}
                                                        onKeyDown={(e) => handleChildSubtaskKeyDown(e, task.id, sub.id)}
                                                      >
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                      </select>
                                                    ) : null}
                                                  </div>
                                                );
                                              })}
                                              <div className="flex items-center gap-1 mt-2">
                                                <button
                                                  type="submit"
                                                  className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs rounded hover:shadow-md transition-all duration-200 font-medium"
                                                >
                                                  Add Child
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setShowChildSubtaskForm(null)}
                                                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded transition-all duration-200 font-medium"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </form>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => setShowChildSubtaskForm(sub.id)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-semibold transition-all duration-200 flex items-center gap-1"
                                          >
                                            <PlusIcon className="w-3 h-3" />
                                            Add Child Task
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>


                      )}
                      {/* Project End Border */}
                      <tr>
                        <td colSpan={columnOrder.length + 3} className="h-1 bg-gray-300"></td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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

      {/* Bulk Action Components */}
      <BulkActionBar
        selectedTasks={filteredTasks.filter(task => selectedTaskIds.has(task.id))}
        onEdit={handleBulkEdit}
        onDelete={handleBulkDelete}
        onCopy={handleBulkCopy}
        onView={handleBulkView}
        onClearSelection={handleClearSelection}
      />

      <BulkEditDrawer
        isOpen={showBulkEditDrawer}
        selectedTasks={filteredTasks.filter(task => selectedTaskIds.has(task.id))}
        onClose={() => setShowBulkEditDrawer(false)}
        onSave={handleBulkSave}
      />

      <BulkViewDrawer
        isOpen={showBulkViewDrawer}
        selectedTasks={filteredTasks.filter(task => selectedTaskIds.has(task.id))}
        onClose={() => setShowBulkViewDrawer(false)}
      />

    </div>
  );
}

