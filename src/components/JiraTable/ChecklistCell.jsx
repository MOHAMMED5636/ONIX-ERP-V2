import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export const ChecklistCell = ({ value = [], onChange, placeholder = "Add checklist items" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    if (newItem.trim()) {
      const newChecklist = [
        ...value,
        {
          id: Date.now(),
          text: newItem.trim(),
          completed: false
        }
      ];
      onChange(newChecklist);
      setNewItem('');
    }
  };

  const handleToggleItem = (itemId) => {
    const updatedChecklist = value.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onChange(updatedChecklist);
  };

  const handleRemoveItem = (itemId) => {
    const updatedChecklist = value.filter(item => item.id !== itemId);
    onChange(updatedChecklist);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  const completedCount = value.filter(item => item.completed).length;
  const totalCount = value.length;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full px-2 py-1 text-sm hover:bg-gray-50 rounded"
      >
        {isExpanded ? (
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-gray-500" />
        )}
        <span className="text-sm text-gray-600">
          {totalCount > 0 ? `${completedCount}/${totalCount}` : 'Add items'}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          {/* Add new item */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Checklist items */}
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {value.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggleItem(item.id)}
                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className={`text-sm flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {item.text}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
