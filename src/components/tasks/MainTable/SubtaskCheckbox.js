import React from 'react';

const SubtaskCheckbox = ({ 
  subtask, 
  isChecked, 
  onToggle, 
  parentTaskId = null 
}) => {
  const handleChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(subtask.id, e.target.checked, parentTaskId);
  };

  return (
    <div className="flex items-center justify-center">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-colors duration-200 hover:border-blue-400"
        title={`Select ${subtask?.name || 'subtask'}`}
      />
    </div>
  );
};

export default SubtaskCheckbox;
