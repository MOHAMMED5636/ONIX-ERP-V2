// Filter sub-departments based on search term
export const filterSubDepartments = (subDepartments, searchTerm) => {
  return subDepartments.filter(subDept =>
    subDept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subDept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subDept.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subDept.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subDept.budget.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subDept.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subDept.id.toString().includes(searchTerm)
  );
};

// Validate new sub-department data
export const validateNewSubDepartment = (newSubDepartment) => {
  const errors = [];
  
  if (!newSubDepartment.name.trim()) {
    errors.push('Sub department name is required');
  }
  
  if (!newSubDepartment.description.trim()) {
    errors.push('Description is required');
  }
  
  if (!newSubDepartment.manager.trim()) {
    errors.push('Manager is required');
  }
  
  return errors;
};

// Validate edit sub-department data
export const validateEditSubDepartment = (editSubDepartment) => {
  const errors = [];
  
  if (!editSubDepartment.name.trim()) {
    errors.push('Sub department name is required');
  }
  
  if (!editSubDepartment.description.trim()) {
    errors.push('Description is required');
  }
  
  if (!editSubDepartment.manager.trim()) {
    errors.push('Manager is required');
  }
  
  return errors;
};

// Create new sub-department object
export const createNewSubDepartment = (newSubDepartment, subDepartments) => {
  return {
    id: subDepartments.length + 1,
    name: newSubDepartment.name,
    description: newSubDepartment.description,
    manager: newSubDepartment.manager,
    employees: 0,
    status: newSubDepartment.status,
    location: newSubDepartment.location,
    budget: newSubDepartment.budget
  };
};

// Update sub-department object
export const updateSubDepartment = (subDepartments, selectedSubDepartment, editSubDepartment) => {
  return subDepartments.map(subDept => 
    subDept.id === selectedSubDepartment.id 
      ? { ...subDept, ...editSubDepartment }
      : subDept
  );
};

// Delete sub-department
export const deleteSubDepartment = (subDepartments, selectedSubDepartment) => {
  return subDepartments.filter(subDept => subDept.id !== selectedSubDepartment.id);
};

// Get sub-department statistics
export const getSubDepartmentStats = (subDepartments) => {
  const total = subDepartments.length;
  const active = subDepartments.filter(subDept => subDept.status === 'Active').length;
  const inactive = subDepartments.filter(subDept => subDept.status === 'Inactive').length;
  const totalEmployees = subDepartments.reduce((sum, subDept) => sum + subDept.employees, 0);
  
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

// Format budget for display
export const formatBudget = (budget) => {
  if (!budget) return 'Not specified';
  return budget;
};

// Generate unique ID
export const generateId = (subDepartments) => {
  return Math.max(...subDepartments.map(sd => sd.id), 0) + 1;
};
