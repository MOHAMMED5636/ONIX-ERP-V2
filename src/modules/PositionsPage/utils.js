// Filter positions based on search term
export const filterPositions = (positions, searchTerm) => {
  return positions.filter(position =>
    position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.requirements.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.id.toString().includes(searchTerm)
  );
};

// Validate new position data
export const validateNewPosition = (newPosition) => {
  const errors = [];
  
  if (!newPosition.name.trim()) {
    errors.push('Position name is required');
  }
  
  if (!newPosition.description.trim()) {
    errors.push('Position description is required');
  }
  
  if (!newPosition.manager.trim()) {
    errors.push('Manager is required');
  }
  
  return errors;
};

// Validate edit position data
export const validateEditPosition = (editPosition) => {
  const errors = [];
  
  if (!editPosition.name.trim()) {
    errors.push('Position name is required');
  }
  
  if (!editPosition.description.trim()) {
    errors.push('Position description is required');
  }
  
  if (!editPosition.manager.trim()) {
    errors.push('Manager is required');
  }
  
  return errors;
};

// Create new position object
export const createNewPosition = (newPosition, positions) => {
  return {
    id: positions.length + 1,
    name: newPosition.name,
    description: newPosition.description,
    manager: newPosition.manager,
    employees: 0,
    status: newPosition.status,
    requirements: newPosition.requirements
  };
};

// Update position object
export const updatePosition = (positions, selectedPosition, editPosition) => {
  return positions.map(position => 
    position.id === selectedPosition.id 
      ? { ...position, ...editPosition }
      : position
  );
};

// Delete position
export const deletePosition = (positions, selectedPosition) => {
  return positions.filter(position => position.id !== selectedPosition.id);
};

// Get position statistics
export const getPositionStats = (positions) => {
  const total = positions.length;
  const active = positions.filter(position => position.status === 'Active').length;
  const inactive = positions.filter(position => position.status === 'Inactive').length;
  const totalEmployees = positions.reduce((sum, position) => sum + position.employees, 0);
  
  return {
    total,
    active,
    inactive,
    totalEmployees,
    activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    inactivePercentage: total > 0 ? Math.round((inactive / total) * 100) : 0
  };
};

// Get status color
export const getStatusColor = (status) => {
  switch (status) {
    case 'Active':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Inactive':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// Get status icon
export const getStatusIcon = (status) => {
  switch (status) {
    case 'Active':
      return 'CheckCircleIcon';
    case 'Inactive':
      return 'XCircleIcon';
    default:
      return 'QuestionMarkCircleIcon';
  }
};

// Format salary for display
export const formatSalary = (salary) => {
  if (!salary) return 'Not specified';
  return salary;
};

// Generate unique ID
export const generateId = (positions) => {
  return Math.max(...positions.map(p => p.id), 0) + 1;
};
