import { v4 as uuidv4 } from 'uuid';

/**
 * Validates if the selected tasks can be copied according to business rules
 * @param {Array} selectedTasks - Array of selected task objects
 * @param {Array} allTasks - Array of all tasks in the system
 * @returns {Object} Validation result with isValid flag and message
 */
export const validateTaskSelection = (selectedTasks, allTasks) => {
  if (!selectedTasks || selectedTasks.length === 0) {
    return {
      isValid: false,
      message: 'No tasks selected for copying'
    };
  }

  // Check if any selected task is a child task
  const hasChildTasks = selectedTasks.some(task => {
    // A task is a child if it has a parentTaskId or if it's a subtask
    return task.parentTaskId || (task.type === 'subtask') || (task.type === 'childSubtask');
  });

  if (hasChildTasks) {
    return {
      isValid: false,
      message: 'Cannot copy child tasks independently. Select parent tasks only.'
    };
  }

  // Check if all selected tasks are parent tasks (have subtasks or are main projects)
  const allAreParentTasks = selectedTasks.every(task => {
    // A task is a parent if it has subtasks or is a main project
    return (task.subtasks && task.subtasks.length > 0) || !task.parentTaskId;
  });

  if (!allAreParentTasks) {
    return {
      isValid: false,
      message: 'All selected tasks must be parent tasks with subtasks'
    };
  }

  return {
    isValid: true,
    message: `${selectedTasks.length} parent task(s) selected for copying`
  };
};

/**
 * Copies selected parent tasks with their complete subtrees
 * @param {Array} selectedTasks - Array of selected parent task objects
 * @returns {Object} Copy result with copied data and metadata
 */
export const copyTasks = (selectedTasks) => {
  const validation = validateTaskSelection(selectedTasks, []);
  
  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  const copiedTasks = selectedTasks.map(task => {
    // Deep clone the task to avoid reference issues
    const clonedTask = JSON.parse(JSON.stringify(task));
    
    // Remove the ID so a new one can be generated on paste
    delete clonedTask.id;
    
    // Process subtasks recursively
    if (clonedTask.subtasks && clonedTask.subtasks.length > 0) {
      clonedTask.subtasks = clonedTask.subtasks.map(subtask => {
        const clonedSubtask = { ...subtask };
        delete clonedSubtask.id;
        
        // Process child subtasks if they exist
        if (clonedSubtask.childSubtasks && clonedSubtask.childSubtasks.length > 0) {
          clonedSubtask.childSubtasks = clonedSubtask.childSubtasks.map(childSubtask => {
            const clonedChildSubtask = { ...childSubtask };
            delete clonedChildSubtask.id;
            return clonedChildSubtask;
          });
        }
        
        return clonedSubtask;
      });
    }
    
    return clonedTask;
  });

  return {
    copiedTasks,
    copyTimestamp: new Date().toISOString(),
    totalTasks: copiedTasks.length,
    totalSubtasks: copiedTasks.reduce((sum, task) => 
      sum + (task.subtasks ? task.subtasks.length : 0), 0
    ),
    totalChildSubtasks: copiedTasks.reduce((sum, task) => 
      sum + (task.subtasks ? task.subtasks.reduce((subSum, subtask) => 
        subSum + (subtask.childSubtasks ? subtask.childSubtasks.length : 0), 0
      ) : 0), 0
    )
  };
};

/**
 * Generates a unique ID for a task
 * @returns {string} Unique ID
 */
const generateTaskId = () => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Pastes copied tasks into a target project
 * @param {Object} copiedData - Data returned from copyTasks function
 * @param {string} targetProjectId - ID of the target project
 * @param {Array} existingTasks - Array of existing tasks in the target project
 * @returns {Object} Paste result with pasted tasks and metadata
 */
export const pasteTasks = (copiedData, targetProjectId, existingTasks = []) => {
  if (!copiedData || !copiedData.copiedTasks) {
    throw new Error('No valid copied data provided');
  }

  if (!targetProjectId) {
    throw new Error('Target project ID is required');
  }

  const pastedTasks = copiedData.copiedTasks.map(task => {
    // Generate new ID for the main task
    const newTaskId = generateTaskId();
    
    // Create pasted task with new ID and target project
    const pastedTask = {
      ...task,
      id: newTaskId,
      projectId: targetProjectId,
      // Add copy metadata
      copiedFrom: {
        originalId: task.id || 'unknown',
        copyTimestamp: copiedData.copyTimestamp,
        sourceProject: task.projectId || 'unknown'
      }
    };

    // Process subtasks with new IDs
    if (pastedTask.subtasks && pastedTask.subtasks.length > 0) {
      pastedTask.subtasks = pastedTask.subtasks.map(subtask => {
        const newSubtaskId = generateTaskId();
        
        const pastedSubtask = {
          ...subtask,
          id: newSubtaskId,
          taskId: newTaskId, // Link to new parent task
          projectId: targetProjectId
        };

        // Process child subtasks with new IDs
        if (pastedSubtask.childSubtasks && pastedSubtask.childSubtasks.length > 0) {
          pastedSubtask.childSubtasks = pastedSubtask.childSubtasks.map(childSubtask => {
            const newChildSubtaskId = generateTaskId();
            
            return {
              ...childSubtask,
              id: newChildSubtaskId,
              taskId: newTaskId,
              parentSubtaskId: newSubtaskId,
              projectId: targetProjectId
            };
          });
        }

        return pastedSubtask;
      });
    }

    return pastedTask;
  });

  return {
    pastedTasks,
    targetProjectId,
    pasteTimestamp: new Date().toISOString(),
    totalPasted: pastedTasks.length,
    totalSubtasks: pastedTasks.reduce((sum, task) => 
      sum + (task.subtasks ? task.subtasks.length : 0), 0
    ),
    totalChildSubtasks: pastedTasks.reduce((sum, task) => 
      sum + (task.subtasks ? task.subtasks.reduce((subSum, subtask) => 
        subSum + (subtask.childSubtasks ? subtask.childSubtasks.length : 0), 0
      ) : 0), 0
    )
  };
};

/**
 * Gets clipboard data from localStorage
 * @returns {Object|null} Clipboard data or null if none exists
 */
export const getClipboardData = () => {
  try {
    const clipboardData = localStorage.getItem('taskClipboard');
    return clipboardData ? JSON.parse(clipboardData) : null;
  } catch (error) {
    console.error('Error reading clipboard data:', error);
    return null;
  }
};

/**
 * Saves clipboard data to localStorage
 * @param {Object} clipboardData - Data to save to clipboard
 */
export const saveClipboardData = (clipboardData) => {
  try {
    localStorage.setItem('taskClipboard', JSON.stringify(clipboardData));
  } catch (error) {
    console.error('Error saving clipboard data:', error);
  }
};

/**
 * Clears clipboard data from localStorage
 */
export const clearClipboardData = () => {
  try {
    localStorage.removeItem('taskClipboard');
  } catch (error) {
    console.error('Error clearing clipboard data:', error);
  }
};

/**
 * Checks if clipboard contains valid task data
 * @returns {boolean} True if clipboard has valid data
 */
export const hasClipboardData = () => {
  const clipboardData = getClipboardData();
  return clipboardData && clipboardData.copiedTasks && clipboardData.copiedTasks.length > 0;
};
