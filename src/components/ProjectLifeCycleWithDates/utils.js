// Format dates for display
export const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

// Calculate progress percentage
export const calculateProgress = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  const total = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / total) * 100);
};

// Generate unique ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Validate stage data
export const validateStage = (stageData) => {
  const errors = [];
  
  if (!stageData.name.trim()) {
    errors.push('Stage name is required');
  }
  
  if (!stageData.description.trim()) {
    errors.push('Stage description is required');
  }
  
  if (!stageData.startDate) {
    errors.push('Start date is required');
  }
  
  if (!stageData.endDate) {
    errors.push('End date is required');
  }
  
  if (stageData.startDate && stageData.endDate) {
    const start = new Date(stageData.startDate);
    const end = new Date(stageData.endDate);
    
    if (start >= end) {
      errors.push('End date must be after start date');
    }
  }
  
  return errors;
};

// Create new stage object
export const createNewStage = (formData, selectedIcon) => {
  return {
    id: generateId(),
    name: formData.name,
    description: formData.description,
    icon: selectedIcon,
    color: formData.color,
    bgColor: `bg-${formData.color.replace('#', '')}-50`,
    borderColor: `border-${formData.color.replace('#', '')}-200`,
    hoverColor: `hover:bg-${formData.color.replace('#', '')}-100`,
    route: '/tasks',
    startDate: formData.startDate,
    endDate: formData.endDate,
    tasks: formData.tasks.filter(task => task.trim() !== '')
  };
};

// Update stage tasks
export const updateStageTasks = (stages, stageId, taskIndex, newValue) => {
  return stages.map(stage => 
    stage.id === stageId 
      ? {
          ...stage,
          tasks: stage.tasks.map((task, index) => 
            index === taskIndex ? newValue : task
          )
        }
      : stage
  );
};

// Delete task from stage
export const deleteTaskFromStage = (stages, stageId, taskIndex) => {
  return stages.map(stage => 
    stage.id === stageId 
      ? {
          ...stage,
          tasks: stage.tasks.filter((_, index) => index !== taskIndex)
        }
      : stage
  );
};

// Add task to stage
export const addTaskToStage = (stages, stageId, taskName = 'New Task') => {
  return stages.map(stage => 
    stage.id === stageId 
      ? {
          ...stage,
          tasks: [...stage.tasks, taskName]
        }
      : stage
  );
};

// Reset form data to defaults
export const resetFormData = () => ({
  name: '',
  description: '',
  color: '#4A90E2',
  startDate: '',
  endDate: '',
  tasks: []
});
