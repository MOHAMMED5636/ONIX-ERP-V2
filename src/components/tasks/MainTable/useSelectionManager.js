import { useState, useCallback, useMemo } from 'react';

// Helper function to determine the family key of an item
const familyKey = (item) => {
  if (item.type === 'project') {
    return `project:${item.id}`;
  } else if (item.type === 'task') {
    return `task:${item.projectId}`;
  } else if (item.type === 'subtask') {
    return `subtask:${item.taskId}`;
  } else if (item.type === 'childSubtask') {
    return `childSubtask:${item.taskId}:${item.parentSubtaskId}`;
  }
  
  // Fallback for legacy items without explicit type
  if (item.projectId) {
    return `task:${item.projectId}`;
  } else if (item.taskId) {
    return `subtask:${item.taskId}`;
  } else {
    return `project:${item.id}`;
  }
};

// Helper function to analyze selection and determine if it's valid for editing
const analyzeSelection = (selectedItems) => {
  if (selectedItems.length === 0) {
    return { canEdit: false, reason: 'No items selected' };
  }

  if (selectedItems.length === 1) {
    return { canEdit: true, reason: 'Single item selected' };
  }

  // Group items by family
  const families = new Map();
  selectedItems.forEach(item => {
    const key = familyKey(item);
    if (!families.has(key)) {
      families.set(key, []);
    }
    families.get(key).push(item);
  });

  if (families.size === 1) {
    const [familyType] = families.keys();
    return { 
      canEdit: true, 
      reason: `All items are from the same family: ${familyType}` 
    };
  }

  return { 
    canEdit: false, 
    reason: `Mixed families selected. Edit requires items from the same level/parent.` 
  };
};

export const useSelectionManager = () => {
  // Centralized selection state using Map with `${kind}:${id}` keys
  const [selectedItems, setSelectedItems] = useState(new Map());

  // Helper to check if a specific item is selected
  const isRowSelected = useCallback((item) => {
    const key = familyKey(item);
    return selectedItems.has(key);
  }, [selectedItems]);

  // Helper to toggle selection of an item
  const toggleSelect = useCallback((item) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const key = familyKey(item);
      
      if (newMap.has(key)) {
        newMap.delete(key);
      } else {
        newMap.set(key, item);
      }
      
      return newMap;
    });
  }, []);

  // Helper to get all selected items as arrays
  const getSelectedItems = useMemo(() => {
    const items = Array.from(selectedItems.values());
    return {
      projects: items.filter(item => familyKey(item).startsWith('project:')),
      tasks: items.filter(item => familyKey(item).startsWith('task:')),
      subtasks: items.filter(item => familyKey(item).startsWith('subtask:')),
      childSubtasks: items.filter(item => familyKey(item).startsWith('childSubtask:')),
      all: items
    };
  }, [selectedItems]);

  // Helper to clear all selections
  const clearSelection = useCallback(() => {
    setSelectedItems(new Map());
  }, []);

  // Helper to analyze current selection for edit capability
  const selectionAnalysis = useMemo(() => {
    return analyzeSelection(getSelectedItems.all);
  }, [getSelectedItems.all]);

  return {
    selectedItems: getSelectedItems,
    isRowSelected,
    toggleSelect,
    clearSelection,
    selectionAnalysis,
    totalSelected: selectedItems.size
  };
};
