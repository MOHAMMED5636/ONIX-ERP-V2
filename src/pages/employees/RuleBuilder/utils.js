// Utility functions for RuleBuilder module

/**
 * Get action color for styling
 */
export function getActionColor(action) {
  switch (action) {
    case 'view': return 'bg-blue-100 text-blue-800';
    case 'edit': return 'bg-yellow-100 text-yellow-800';
    case 'delete': return 'bg-red-100 text-red-800';
    case 'create': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get role color for styling
 */
export function getRoleColor(role) {
  switch (role) {
    case 'admin': return 'bg-purple-100 text-purple-800';
    case 'manager': return 'bg-indigo-100 text-indigo-800';
    case 'hr_manager': return 'bg-pink-100 text-pink-800';
    case 'finance_manager': return 'bg-emerald-100 text-emerald-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Filter rules based on search term and filters
 */
export function filterRules(rules, searchTerm, filterRole, filterAction) {
  return rules.filter(rule => {
    const matchesSearch = rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.field.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || rule.role === filterRole;
    const matchesAction = !filterAction || rule.action === filterAction;
    
    return matchesSearch && matchesRole && matchesAction;
  });
}

/**
 * Validate rule data
 */
export function validateRule(rule) {
  const errors = [];
  
  if (!rule.role.trim()) {
    errors.push("Role is required");
  }
  
  if (!rule.action.trim()) {
    errors.push("Action is required");
  }
  
  if (!rule.field.trim()) {
    errors.push("Field is required");
  }
  
  if (!rule.description.trim()) {
    errors.push("Description is required");
  }
  
  // Validate conditions
  if (rule.conditions && rule.conditions.length > 0) {
    rule.conditions.forEach((condition, index) => {
      if (!condition.key.trim()) {
        errors.push(`Condition ${index + 1}: Key is required`);
      }
      if (!condition.operator.trim()) {
        errors.push(`Condition ${index + 1}: Operator is required`);
      }
      if (!condition.value.trim()) {
        errors.push(`Condition ${index + 1}: Value is required`);
      }
    });
  }
  
  return errors;
}

/**
 * Generate rule description based on rule data
 */
export function generateRuleDescription(rule) {
  if (rule.description) return rule.description;
  
  const actionText = rule.action || 'access';
  const fieldText = rule.field || 'data';
  const roleText = rule.role || 'user';
  
  let description = `${roleText} can ${actionText} ${fieldText}`;
  
  if (rule.conditions && rule.conditions.length > 0) {
    const conditionsText = rule.conditions
      .map(condition => `${condition.key} ${condition.operator} ${condition.value}`)
      .join(' AND ');
    description += ` when ${conditionsText}`;
  }
  
  return description;
}

/**
 * Add condition to rule
 */
export function addCondition(rule) {
  return {
    ...rule,
    conditions: [...rule.conditions, { key: '', operator: 'equals', value: '' }]
  };
}

/**
 * Remove condition from rule
 */
export function removeCondition(rule, index) {
  const updatedConditions = rule.conditions.filter((_, i) => i !== index);
  return {
    ...rule,
    conditions: updatedConditions.length > 0 ? updatedConditions : [{ key: '', operator: 'equals', value: '' }]
  };
}

/**
 * Update condition in rule
 */
export function updateCondition(rule, index, field, value) {
  const updatedConditions = rule.conditions.map((condition, i) => 
    i === index ? { ...condition, [field]: value } : condition
  );
  return {
    ...rule,
    conditions: updatedConditions
  };
}

/**
 * Reset rule to default state
 */
export function resetRule(ruleType = 'new') {
  return {
    role: '',
    action: '',
    field: '',
    conditions: [{ key: '', operator: 'equals', value: '' }],
    description: '',
    isActive: true
  };
}

/**
 * Copy rules from source employee
 */
export function copyRulesFromEmployee(sourceRules, sourceEmployeeName) {
  return sourceRules.map(rule => ({
    ...rule,
    id: Date.now() + Math.random(), // Generate new ID
    description: `${rule.description} (Copied from ${sourceEmployeeName})`
  }));
}

/**
 * Get rules statistics
 */
export function getRulesStats(rules) {
  const totalRules = rules.length;
  const activeRules = rules.filter(rule => rule.isActive).length;
  const inactiveRules = totalRules - activeRules;
  const viewRules = rules.filter(rule => rule.action === 'view').length;
  const editRules = rules.filter(rule => rule.action === 'edit').length;
  
  return {
    totalRules,
    activeRules,
    inactiveRules,
    viewRules,
    editRules
  };
}

/**
 * Format condition for display
 */
export function formatCondition(condition) {
  return `${condition.key} ${condition.operator} ${condition.value}`;
}

/**
 * Check if rule is valid for saving
 */
export function isRuleValid(rule) {
  const errors = validateRule(rule);
  return errors.length === 0;
}

/**
 * Get unique values for a field from employees data
 */
export function getFieldValues(employees, field) {
  const values = employees.map(emp => emp[field]).filter(Boolean);
  return [...new Set(values)];
}

/**
 * Simulate API delay
 */
export function simulateApiDelay(delay = 1000) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Handle API errors
 */
export function handleApiError(error, fallbackMessage = 'An error occurred') {
  console.error('API Error:', error);
  return error.message || fallbackMessage;
}


