import React from 'react';

const MultiSelectCheckbox = ({ 
  task, 
  isChecked, 
  onToggle, 
  isSelectAll = false 
}) => {
  const handleChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelectAll) {
      onToggle(null, e.target.checked);
    } else {
      onToggle(task.id, e.target.checked);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
        title={isSelectAll ? "Select all projects" : `Select ${task?.name || 'task'}`}
      />
    </div>
  );
};

export default MultiSelectCheckbox;
