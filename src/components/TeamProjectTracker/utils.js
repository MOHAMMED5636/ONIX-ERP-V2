import { addDays, differenceInCalendarDays, isValid } from 'date-fns';

// Helper to calculate plan days from timeline
export function calculatePlanDaysFromTimeline(timeline) {
  if (!timeline || !timeline[0] || !timeline[1]) return 0;
  return differenceInCalendarDays(timeline[1], timeline[0]) + 1;
}

// Helper to parse predecessor ids (comma/space separated)
export function getPredecessorIds(predecessors) {
  if (!predecessors) return [];
  return predecessors
    .toString()
    .split(/[, ]+/)
    .map(s => Number(s))
    .filter(n => !isNaN(n));
}

// Calculate timelines based on predecessors
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

// Helper function to handle task editing
export function handleTaskEdit(tasks, task, col, value, projectStartDate) {
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
}

// Helper function to handle subtask editing
export function handleSubtaskEdit(tasks, task, subId, col, value, projectStartDate) {
  return tasks.map(t => {
    if (t.id !== task.id) return t;
    
    const updatedSubtasks = t.subtasks.map(sub => {
      if (sub.id !== subId) return sub;
      
      if (col === 'timeline') {
        const [start, end] = value;
        let planDays = 0;
        if (isValid(start) && isValid(end)) {
          planDays = differenceInCalendarDays(end, start) + 1;
        }
        return { ...sub, timeline: value, planDays };
      } else if (col === 'planDays') {
        const [start, end] = sub.timeline || [];
        if (isValid(start) && value > 0) {
          const newEnd = addDays(new Date(start), value - 1);
          return { ...sub, planDays: value, timeline: [start, newEnd] };
        }
        return { ...sub, planDays: value };
      } else {
        return { ...sub, [col]: value };
      }
    });
    
    return { ...t, subtasks: updatedSubtasks };
  });
}

// Helper function to handle location picking
export function handleLocationPick(tasks, mapPickerTarget, lat, lng) {
  if (!mapPickerTarget) return tasks;
  
  const value = `${lat},${lng}`;
  if (mapPickerTarget.type === 'main') {
    return tasks.map(t => t.id === mapPickerTarget.taskId ? { ...t, location: value } : t);
  } else if (mapPickerTarget.type === 'sub') {
    return tasks.map(t => t.id === mapPickerTarget.taskId ? { ...t, subtasks: t.subtasks.map(s => s.id === mapPickerTarget.subId ? { ...s, location: value } : s) } : t);
  }
  return tasks;
}
