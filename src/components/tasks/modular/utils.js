// Task management utilities and helper functions
import { format, addDays, differenceInCalendarDays, isValid } from 'date-fns';

// Calculate task timelines based on predecessors and plan days
export const calculateTaskTimelines = (tasks, projectStartDate) => {
  const updatedTasks = tasks.map(task => ({ ...task }));
  
  // Sort tasks by predecessors (tasks with no predecessors first)
  const sortedTasks = [...updatedTasks].sort((a, b) => {
    if (!a.predecessors && !b.predecessors) return 0;
    if (!a.predecessors) return -1;
    if (!b.predecessors) return 1;
    return 0;
  });

  sortedTasks.forEach(task => {
    if (!task.predecessors) {
      // Task with no predecessors starts at project start date
      if (task.planDays > 0) {
        const startDate = new Date(projectStartDate);
        const endDate = addDays(startDate, task.planDays - 1);
        task.timeline = [startDate, endDate];
      }
    } else {
      // Find the latest end date among predecessors
      const predecessorIds = task.predecessors.split(',').map(id => parseInt(id.trim()));
      let latestEndDate = null;
      
      predecessorIds.forEach(predId => {
        const predTask = updatedTasks.find(t => t.id === predId);
        if (predTask && predTask.timeline && predTask.timeline[1]) {
          const predEndDate = new Date(predTask.timeline[1]);
          if (!latestEndDate || predEndDate > latestEndDate) {
            latestEndDate = predEndDate;
          }
        }
      });

      if (latestEndDate && task.planDays > 0) {
        const startDate = addDays(latestEndDate, 1);
        const endDate = addDays(startDate, task.planDays - 1);
        task.timeline = [startDate, endDate];
      }
    }
  });

  return updatedTasks;
};

// Format timeline for display
export const formatTimeline = (timeline) => {
  if (!timeline || !timeline[0] || !timeline[1]) return 'Not set';
  const start = format(new Date(timeline[0]), 'MMM dd');
  const end = format(new Date(timeline[1]), 'MMM dd, yyyy');
  return `${start} – ${end}`;
};

// Calculate progress percentage
export const calculateProgress = (task) => {
  if (!task.subtasks || task.subtasks.length === 0) {
    return task.progress || 0;
  }
  
  const completedSubtasks = task.subtasks.filter(sub => sub.status === 'done').length;
  return Math.round((completedSubtasks / task.subtasks.length) * 100);
};

// Validate task data
export const validateTask = (task) => {
  const errors = {};
  
  if (!task.name || task.name.trim() === '') {
    errors.name = 'Project name is required';
  }
  
  if (task.planDays < 0) {
    errors.planDays = 'Plan days must be non-negative';
  }
  
  return errors;
};

// Filter tasks based on search term
export const filterTasks = (tasks, searchTerm) => {
  if (!searchTerm) return tasks;
  
  const term = searchTerm.toLowerCase();
  return tasks.filter(task => 
    task.name.toLowerCase().includes(term) ||
    task.referenceNumber.toLowerCase().includes(term) ||
    task.category.toLowerCase().includes(term) ||
    task.owner.toLowerCase().includes(term) ||
    task.location.toLowerCase().includes(term)
  );
};

// Sort tasks by various criteria
export const sortTasks = (tasks, sortBy, sortOrder = 'asc') => {
  const sorted = [...tasks];
  
  sorted.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    // Handle special cases
    if (sortBy === 'timeline') {
      aVal = a.timeline?.[0] || new Date(0);
      bVal = b.timeline?.[0] || new Date(0);
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
};

// Generate unique ID for new tasks
export const generateTaskId = () => {
  return Date.now() + Math.random();
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get status color class
export const getStatusColor = (status) => {
  const statusColors = {
    done: "bg-green-500 text-white",
    working: "bg-yellow-500 text-white",
    stuck: "bg-red-500 text-white",
    "not started": "bg-gray-400 text-white"
  };
  return statusColors[status] || "bg-gray-400 text-white";
};

// Get priority color class
export const getPriorityColor = (priority) => {
  const priorityColors = {
    Low: "bg-gray-100 text-gray-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-orange-100 text-orange-800",
    Critical: "bg-red-100 text-red-800"
  };
  return priorityColors[priority] || "bg-gray-100 text-gray-800";
};

// Check if task is overdue
export const isTaskOverdue = (task) => {
  if (!task.timeline || !task.timeline[1]) return false;
  const endDate = new Date(task.timeline[1]);
  const today = new Date();
  return endDate < today && task.status !== 'done';
};

// Get task completion status
export const getTaskCompletionStatus = (task) => {
  if (task.status === 'done') return 'completed';
  if (isTaskOverdue(task)) return 'overdue';
  if (task.status === 'working') return 'in-progress';
  return 'pending';
};

// Calculate total project duration
export const calculateProjectDuration = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  
  const allDates = [];
  tasks.forEach(task => {
    if (task.timeline && task.timeline[0] && task.timeline[1]) {
      allDates.push(new Date(task.timeline[0]));
      allDates.push(new Date(task.timeline[1]));
    }
  });
  
  if (allDates.length === 0) return 0;
  
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  
  return differenceInCalendarDays(maxDate, minDate) + 1;
};

// Export task data
export const exportTaskData = (tasks) => {
  const exportData = tasks.map(task => ({
    id: task.id,
    name: task.name,
    referenceNumber: task.referenceNumber,
    category: task.category,
    status: task.status,
    owner: task.owner,
    timeline: task.timeline ? formatTimeline(task.timeline) : 'Not set',
    planDays: task.planDays,
    priority: task.priority,
    location: task.location,
    progress: `${task.progress || 0}%`,
    rating: task.rating,
    subtasksCount: task.subtasks?.length || 0
  }));
  
  return exportData;
};

// Import task data
export const importTaskData = (data) => {
  return data.map(item => ({
    ...item,
    id: item.id || generateTaskId(),
    timeline: item.timeline === 'Not set' ? [null, null] : item.timeline,
    subtasks: item.subtasks || [],
    expanded: false
  }));
};



