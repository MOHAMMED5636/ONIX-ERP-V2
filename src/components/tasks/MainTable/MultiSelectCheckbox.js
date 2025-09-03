import React from 'react';

const MultiSelectCheckbox = ({ 
  task, 
  isChecked, 
  onToggle, 
  isSelectAll = false 
}) => {
  const handleChange = (e) => {
    console.log('Checkbox clicked:', {
      taskId: task?.id,
      taskName: task?.name,
      newState: e.target.checked
    });
    
    // Only stop propagation, not preventDefault to allow normal checkbox behavior
    e.stopPropagation();
    
    if (isSelectAll) {
      onToggle(null, e.target.checked);
    } else {
      onToggle(task.id, e.target.checked);
    }
  };

  return (
    <div 
      className="flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer hover:border-blue-400"
        title={isSelectAll ? "Select all projects" : `Select ${task?.name || 'task'}`}
      />
    </div>
  );
};

export default MultiSelectCheckbox;

