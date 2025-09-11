// Utility functions for ProjectLifeCycle module

/**
 * Format date for display
 */
export function formatDate(dateString) {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  // Use system locale to match computer date style
  return date.toLocaleDateString();
}

/**
 * Get status color for task
 */
export function getStatusColor(status) {
  const statusColors = {
    'pending': '#6B7280',
    'in-progress': '#F59E0B',
    'completed': '#10B981',
    'blocked': '#EF4444'
  };
  return statusColors[status] || '#6B7280';
}

/**
 * Get priority color for task
 */
export function getPriorityColor(priority) {
  const priorityColors = {
    'low': '#10B981',
    'medium': '#F59E0B',
    'high': '#EF4444',
    'urgent': '#DC2626'
  };
  return priorityColors[priority] || '#F59E0B';
}

/**
 * Get status label for task
 */
export function getStatusLabel(status) {
  const statusLabels = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'blocked': 'Blocked'
  };
  return statusLabels[status] || 'Pending';
}

/**
 * Get priority label for task
 */
export function getPriorityLabel(priority) {
  const priorityLabels = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent'
  };
  return priorityLabels[priority] || 'Medium';
}

/**
 * Calculate task progress for a stage
 */
export function calculateStageProgress(stage) {
  if (!stage.tasks || stage.tasks.length === 0) return 0;
  
  const completedTasks = stage.tasks.filter(task => task.status === 'completed');
  return Math.round((completedTasks.length / stage.tasks.length) * 100);
}

/**
 * Calculate overall project progress
 */
export function calculateOverallProgress(stages) {
  if (!stages || stages.length === 0) return 0;
  
  let totalTasks = 0;
  let completedTasks = 0;
  
  stages.forEach(stage => {
    if (stage.tasks) {
      totalTasks += stage.tasks.length;
      completedTasks += stage.tasks.filter(task => task.status === 'completed').length;
    }
  });
  
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}

/**
 * Get tasks by status
 */
export function getTasksByStatus(stages, status) {
  const tasks = [];
  stages.forEach(stage => {
    if (stage.tasks) {
      const filteredTasks = stage.tasks.filter(task => task.status === status);
      tasks.push(...filteredTasks.map(task => ({ ...task, stageName: stage.name })));
    }
  });
  return tasks;
}

/**
 * Get overdue tasks
 */
export function getOverdueTasks(stages) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueTasks = [];
  stages.forEach(stage => {
    if (stage.tasks) {
      const overdue = stage.tasks.filter(task => {
        if (!task.dueDate || task.status === 'completed') return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < today;
      });
      overdueTasks.push(...overdue.map(task => ({ ...task, stageName: stage.name })));
    }
  });
  return overdueTasks;
}

/**
 * Get upcoming tasks (due in next 7 days)
 */
export function getUpcomingTasks(stages) {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  today.setHours(0, 0, 0, 0);
  nextWeek.setHours(23, 59, 59, 999);
  
  const upcomingTasks = [];
  stages.forEach(stage => {
    if (stage.tasks) {
      const upcoming = stage.tasks.filter(task => {
        if (!task.dueDate || task.status === 'completed') return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate <= nextWeek;
      });
      upcomingTasks.push(...upcoming.map(task => ({ ...task, stageName: stage.name })));
    }
  });
  return upcomingTasks;
}

/**
 * Validate stage data
 */
export function validateStage(stage) {
  const errors = [];
  
  if (!stage.name.trim()) {
    errors.push("Stage name is required");
  }
  
  if (!stage.description.trim()) {
    errors.push("Stage description is required");
  }
  
  return errors;
}

/**
 * Validate task data
 */
export function validateTask(task) {
  const errors = [];
  
  if (!task.name.trim()) {
    errors.push("Task name is required");
  }
  
  if (!task.status) {
    errors.push("Task status is required");
  }
  
  if (!task.priority) {
    errors.push("Task priority is required");
  }
  
  return errors;
}

/**
 * Create a new stage object
 */
export function createNewStage(name, description, color) {
  return {
    id: Date.now(),
    name,
    description,
    color,
    tasks: []
  };
}

/**
 * Create a new task object
 */
export function createNewTask(name, status, priority, dueDate) {
  return {
    id: Date.now(),
    name,
    status,
    priority,
    dueDate
  };
}

/**
 * Sort tasks by priority and due date
 */
export function sortTasks(tasks) {
  const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
  
  return tasks.sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by due date (earliest first)
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
}

/**
 * Filter tasks by search term
 */
export function filterTasksBySearch(tasks, searchTerm) {
  if (!searchTerm) return tasks;
  
  return tasks.filter(task => 
    task.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

/**
 * Get stage statistics
 */
export function getStageStats(stage) {
  const totalTasks = stage.tasks?.length || 0;
  const completedTasks = stage.tasks?.filter(task => task.status === 'completed').length || 0;
  const inProgressTasks = stage.tasks?.filter(task => task.status === 'in-progress').length || 0;
  const pendingTasks = stage.tasks?.filter(task => task.status === 'pending').length || 0;
  const blockedTasks = stage.tasks?.filter(task => task.status === 'blocked').length || 0;
  
  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    blockedTasks,
    progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  };
}



