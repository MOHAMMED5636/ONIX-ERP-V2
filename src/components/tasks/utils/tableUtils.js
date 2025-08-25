import { format, addDays, differenceInCalendarDays, isValid } from 'date-fns';

// Constants
export const statusColors = {
  done: "bg-green-500 text-white",
  working: "bg-yellow-500 text-white",
  stuck: "bg-red-500 text-white",
  "not started": "bg-gray-400 text-white"
};

export const INITIAL_COLUMNS = [
  { key: 'checkbox', label: 'CHECKBOX' },
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

// Date and timeline utilities
export function calculatePlanDaysFromTimeline(timeline) {
  if (!timeline || !timeline[0] || !timeline[1]) return 0;
  return differenceInCalendarDays(timeline[1], timeline[0]) + 1;
}

export function getPredecessorIds(predecessors) {
  if (!predecessors) return [];
  return predecessors
    .toString()
    .split(/[, ]+/)
    .map(s => Number(s))
    .filter(n => !isNaN(n));
}

export function calculateTaskTimelines(tasks, projectStartDate) {
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

// Filtering utilities
export function filterTasks(tasks, search, filters = {}) {
  return tasks.filter(t => {
    // Basic search filter
    const searchMatch = !search || 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.referenceNumber && t.referenceNumber.toLowerCase().includes(search.toLowerCase())) ||
      (t.owner && t.owner.toLowerCase().includes(search.toLowerCase()));

    if (!searchMatch) return false;

    // Advanced filters
    const globalMatch = !filters.global || 
      t.name.toLowerCase().includes(filters.global.toLowerCase()) ||
      (t.referenceNumber && t.referenceNumber.toLowerCase().includes(filters.global.toLowerCase())) ||
      (t.owner && t.owner.toLowerCase().includes(filters.global.toLowerCase())) ||
      (t.category && t.category.toLowerCase().includes(filters.global.toLowerCase())) ||
      (t.location && t.location.toLowerCase().includes(filters.global.toLowerCase()));

    const nameMatch = !filters.name || 
      t.name.toLowerCase().includes(filters.name.toLowerCase());

    const statusMatch = !filters.status || 
      t.status.toLowerCase() === filters.status.toLowerCase();

    const assigneeMatch = !filters.assignee || 
      (t.owner && t.owner.toLowerCase() === filters.assignee.toLowerCase());

    const planMatch = !filters.plan || 
      (t.referenceNumber && t.referenceNumber.toLowerCase().includes(filters.plan.toLowerCase()));

    const categoryMatch = !filters.category || 
      (t.category && t.category.toLowerCase() === filters.category.toLowerCase());

    // Date range filtering
    let dateMatch = true;
    if (filters.dateFrom || filters.dateTo) {
      const taskStartDate = t.timeline && t.timeline[0] ? new Date(t.timeline[0]) : null;
      const taskEndDate = t.timeline && t.timeline[1] ? new Date(t.timeline[1]) : null;
      
      if (filters.dateFrom && taskStartDate) {
        const fromDate = new Date(filters.dateFrom);
        dateMatch = dateMatch && taskStartDate >= fromDate;
      }
      
      if (filters.dateTo && taskEndDate) {
        const toDate = new Date(filters.dateTo);
        dateMatch = dateMatch && taskEndDate <= toDate;
      }
    }

    return globalMatch && nameMatch && statusMatch && assigneeMatch && planMatch && categoryMatch && dateMatch;
  });
}

export function filterCompletedTasks(tasks) {
  return tasks.filter(t => t.status === "done");
}

// Column management utilities
export function getDefaultColumnOrder(columns) {
  return columns.map(col => col.key);
}

export function loadColumnOrderFromStorage(defaultOrder) {
  const saved = localStorage.getItem('columnOrder');
  const parsed = saved ? JSON.parse(saved) : defaultOrder;
  
  // Ensure all new columns are included in the order
  const allColumns = [...new Set([...parsed, ...defaultOrder])];
  
  // Ensure checkbox column is always first
  const checkboxIndex = allColumns.indexOf('checkbox');
  if (checkboxIndex > 0) {
    allColumns.splice(checkboxIndex, 1);
    allColumns.unshift('checkbox');
  } else if (checkboxIndex === -1) {
    allColumns.unshift('checkbox');
  }
  
  return allColumns;
}

export function saveColumnOrderToStorage(columnOrder) {
  localStorage.setItem('columnOrder', JSON.stringify(columnOrder));
}

export function getMissingColumns(currentOrder, allColumns) {
  return allColumns.filter(col => !currentOrder.includes(col));
}

// Task validation utilities
export function validateTask(task) {
  const errors = [];
  
  if (!task.name || task.name.trim() === "") {
    errors.push("Project name is required");
  }
  
  if (task.planDays && task.planDays < 0) {
    errors.push("Plan days must be non-negative");
  }
  
  return errors;
}

export function validateSubtask(subtask) {
  const errors = [];
  
  if (!subtask.name || subtask.name.trim() === "") {
    errors.push("Subtask name is required");
  }
  
  if (subtask.planDays && subtask.planDays < 0) {
    errors.push("Plan days must be non-negative");
  }
  
  return errors;
}

// Task generation utilities
export function generateTaskId() {
  return Date.now();
}

export function createNewTask(tasks, projectStartDate) {
  return {
    id: generateTaskId(),
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
  };
}

export function createNewSubtask() {
  return {
    id: generateTaskId(),
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
    completed: false,
    checklist: false,
    rating: 3,
    progress: 0,
    color: "#60a5fa",
    predecessors: ""
  };
}

// Progress calculation utilities
export function calculateTaskProgress(subtasks) {
  if (!subtasks || subtasks.length === 0) return 0;
  
  const total = subtasks.reduce((sum, s) => sum + (typeof s.progress === 'number' ? s.progress : 0), 0);
  return Math.round(total / subtasks.length);
}

export function areAllSubtasksComplete(subtasks) {
  return subtasks.length > 0 && subtasks.every(s => s.status === 'done');
}

// Column utilities
export function createNewColumn(type) {
  const newKey = `custom_${type}_${Date.now()}`;
  return { key: newKey, label: `New ${type}`, type };
}

export function addColumnToTasks(tasks, columnKey) {
  return tasks.map(t => ({
    ...t,
    [columnKey]: '',
    subtasks: (t.subtasks || []).map(s => ({ ...s, [columnKey]: '' }))
  }));
}

// Map utilities
export function formatLocationString(lat, lng) {
  return `${lat},${lng}`;
}

export function parseLocationString(locationString) {
  if (!locationString) return { lat: null, lng: null };
  
  const parts = locationString.split(',');
  if (parts.length !== 2) return { lat: null, lng: null };
  
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  
  return { lat: isNaN(lat) ? null : lat, lng: isNaN(lng) ? null : lng };
}

// Date formatting utilities
export function formatTimeline(timeline) {
  if (!timeline || !timeline[0] || !timeline[1]) return 'Not set';
  
  const start = new Date(timeline[0]);
  const end = new Date(timeline[1]);
  
  if (!isValid(start) || !isValid(end)) return 'Invalid dates';
  
  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
}

export function formatDateForInput(date) {
  return format(date, 'yyyy-MM-dd');
}

// File utilities
export function formatFileList(files) {
  if (!files || files.length === 0) return [];
  
  return files.map(file => ({
    name: file.name || (typeof file === 'string' ? file : 'Unknown file'),
    size: file.size || 0,
    type: file.type || 'unknown'
  }));
}

// Color utilities
export function getStatusColor(status) {
  return statusColors[status] || 'bg-gray-200 text-gray-700';
}

export function getPriorityColor(priority) {
  const colors = {
    'Low': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-red-100 text-red-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
}



