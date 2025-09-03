import { addDays, isValid, parseISO } from 'date-fns';

/**
 * TimelineCalc.js - Hierarchical date calculation system
 * 
 * This module provides functions to calculate project and task dates based on:
 * 1. Project dates are calculated from its tasks only
 * 2. Task dates can roll up from their child tasks
 * 3. Child tasks do not directly affect project dates
 */

/**
 * Validates if a date is valid and converts string dates to Date objects
 * @param {Date|string|null} date - Date to validate
 * @returns {Date|null} Valid Date object or null
 */
function validateDate(date) {
  if (!date) return null;
  
  if (date instanceof Date) {
    return isValid(date) ? date : null;
  }
  
  if (typeof date === 'string') {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed : null;
  }
  
  return null;
}

/**
 * Gets the earliest start date from an array of dates
 * @param {Array<Date>} dates - Array of dates to check
 * @returns {Date|null} Earliest date or null if no valid dates
 */
function getEarliestDate(dates) {
  const validDates = dates.filter(date => date !== null);
  if (validDates.length === 0) return null;
  
  return validDates.reduce((earliest, current) => 
    current < earliest ? current : earliest
  );
}

/**
 * Gets the latest end date from an array of dates
 * @param {Array<Date>} dates - Array of dates to check
 * @returns {Date|null} Latest date or null if no valid dates
 */
function getLatestDate(dates) {
  const validDates = dates.filter(date => date !== null);
  if (validDates.length === 0) return null;
  
  return validDates.reduce((latest, current) => 
    current > latest ? current : latest
  );
}

/**
 * Calculates task dates by rolling up from child tasks if they exist
 * @param {Object} task - Task object with timeline and subtasks
 * @returns {Object} Task with calculated start/end dates
 */
export function calculateTaskDates(task) {
  if (!task) return task;
  
  // If task has no child tasks, keep its own dates
  if (!task.childSubtasks || task.childSubtasks.length === 0) {
    return {
      ...task,
      start: validateDate(task.timeline?.[0]),
      end: validateDate(task.timeline?.[1])
    };
  }
  
  // Collect all child task dates
  const childStartDates = [];
  const childEndDates = [];
  
  task.childSubtasks.forEach(childTask => {
    if (childTask.timeline && childTask.timeline.length === 2) {
      const startDate = validateDate(childTask.timeline[0]);
      const endDate = validateDate(childTask.timeline[1]);
      
      if (startDate) childStartDates.push(startDate);
      if (endDate) childEndDates.push(endDate);
    }
  });
  
  // Calculate task dates from child tasks
  const calculatedStart = getEarliestDate(childStartDates);
  const calculatedEnd = getLatestDate(childEndDates);
  
  // If we have valid child dates, use them; otherwise keep task's own dates
  const finalStart = calculatedStart || validateDate(task.timeline?.[0]);
  const finalEnd = calculatedEnd || validateDate(task.timeline?.[1]);
  
  return {
    ...task,
    start: finalStart,
    end: finalEnd,
    // Update timeline array if we have calculated dates
    timeline: finalStart && finalEnd ? [finalStart, finalEnd] : task.timeline
  };
}

/**
 * Calculates project dates from its tasks only
 * @param {Object} project - Project object with tasks
 * @returns {Object} Project with calculated start/end dates
 */
export function calculateProjectDates(project) {
  if (!project || !project.subtasks || project.subtasks.length === 0) {
    return {
      ...project,
      start: validateDate(project.timeline?.[0]),
      end: validateDate(project.timeline?.[1])
    };
  }
  
  // First, calculate dates for all tasks (including roll-up from child tasks)
  const tasksWithCalculatedDates = project.subtasks.map(task => 
    calculateTaskDates(task)
  );
  
  // Collect all task start and end dates
  const taskStartDates = [];
  const taskEndDates = [];
  
  tasksWithCalculatedDates.forEach(task => {
    if (task.start) taskStartDates.push(task.start);
    if (task.end) taskEndDates.push(task.end);
  });
  
  // Calculate project dates from tasks
  const projectStart = getEarliestDate(taskStartDates);
  const projectEnd = getLatestDate(taskEndDates);
  
  return {
    ...project,
    start: projectStart,
    end: projectEnd,
    // Update timeline array if we have calculated dates
    timeline: projectStart && projectEnd ? [projectStart, projectEnd] : project.timeline,
    // Update subtasks with calculated dates
    subtasks: tasksWithCalculatedDates
  };
}

/**
 * Main function to calculate all project and task dates hierarchically
 * @param {Array} projects - Array of project objects
 * @returns {Array} Projects with calculated dates
 */
export function calculateAllProjectDates(projects) {
  if (!Array.isArray(projects)) return projects;
  
  return projects.map(project => calculateProjectDates(project));
}

/**
 * Utility function to format dates for display
 * @param {Date} date - Date to format
 * @param {string} format - Format string (default: 'MMM d')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'MMM d') {
  if (!date || !isValid(date)) return '';
  
  try {
    // Simple formatting - you can replace this with date-fns format if needed
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Utility function to get date range string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {string} Formatted date range string
 */
export function getDateRangeString(startDate, endDate) {
  const start = validateDate(startDate);
  const end = validateDate(endDate);
  
  if (!start || !end) return '';
  
  const startStr = formatDate(start);
  const endStr = formatDate(end);
  
  if (startStr === endStr) return startStr;
  return `${startStr} → ${endStr}`;
}

/**
 * Validates that all calculated dates are valid Date objects
 * @param {Object} project - Project object to validate
 * @returns {boolean} True if all dates are valid
 */
export function validateProjectDates(project) {
  if (!project) return false;
  
  const start = validateDate(project.start);
  const end = validateDate(project.end);
  
  if (!start || !end) return false;
  
  // Validate task dates
  if (project.subtasks) {
    for (const task of project.subtasks) {
      const taskStart = validateDate(task.start);
      const taskEnd = validateDate(task.end);
      
      if (!taskStart || !taskEnd) return false;
      
      // Validate child task dates
      if (task.childSubtasks) {
        for (const childTask of task.childSubtasks) {
          const childStart = validateDate(childTask.timeline?.[0]);
          const childEnd = validateDate(childTask.timeline?.[1]);
          
          if (!childStart || !childEnd) return false;
        }
      }
    }
  }
  
  return true;
}

export default {
  calculateTaskDates,
  calculateProjectDates,
  calculateAllProjectDates,
  formatDate,
  getDateRangeString,
  validateProjectDates
};
