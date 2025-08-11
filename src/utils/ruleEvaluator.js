// Rule evaluation utility for dynamic field-level access control

/**
 * Evaluates if a condition is met based on the operator and values
 * @param {Object} condition - The condition object with key, operator, and value
 * @param {Object} userAttributes - The current user's attributes
 * @param {Object} targetData - The target data being accessed
 * @returns {boolean} - Whether the condition is met
 */
const evaluateCondition = (condition, userAttributes, targetData) => {
  const { key, operator, value } = condition;
  
  // Get the actual value to compare against
  let actualValue;
  if (key in userAttributes) {
    actualValue = userAttributes[key];
  } else if (key in targetData) {
    actualValue = targetData[key];
  } else {
    return false; // Field doesn't exist
  }

  // Convert to string for comparison if needed
  const stringValue = String(actualValue).toLowerCase();
  const compareValue = String(value).toLowerCase();

  switch (operator) {
    case 'equals':
      return stringValue === compareValue;
    case 'not_equals':
      return stringValue !== compareValue;
    case 'contains':
      return stringValue.includes(compareValue);
    case 'starts_with':
      return stringValue.startsWith(compareValue);
    case 'ends_with':
      return stringValue.endsWith(compareValue);
    case 'greater_than':
      return Number(actualValue) > Number(value);
    case 'less_than':
      return Number(actualValue) < Number(value);
    case 'in_range':
      // For range, value should be in format "min-max"
      const [min, max] = value.split('-').map(Number);
      const numValue = Number(actualValue);
      return numValue >= min && numValue <= max;
    default:
      return false;
  }
};

/**
 * Evaluates if all conditions in a rule are met
 * @param {Array} conditions - Array of condition objects
 * @param {Object} userAttributes - The current user's attributes
 * @param {Object} targetData - The target data being accessed
 * @returns {boolean} - Whether all conditions are met
 */
const evaluateConditions = (conditions, userAttributes, targetData) => {
  if (!conditions || conditions.length === 0) {
    return true; // No conditions means always allow
  }

  return conditions.every(condition => 
    evaluateCondition(condition, userAttributes, targetData)
  );
};

/**
 * Evaluates access rules to determine field visibility
 * @param {Array} rules - Array of access rules
 * @param {string} userRole - Current user's role
 * @param {string} action - Action being performed (view, edit, delete, create)
 * @param {string} field - Field being accessed
 * @param {Object} userAttributes - Current user's attributes
 * @param {Object} targetData - Target data being accessed
 * @returns {Object} - Object with access information
 */
export const evaluateFieldAccess = (rules, userRole, action, field, userAttributes = {}, targetData = {}) => {
  // Find applicable rules
  const applicableRules = rules.filter(rule => 
    rule.isActive && 
    rule.role === userRole && 
    rule.action === action && 
    rule.field === field
  );

  if (applicableRules.length === 0) {
    // No rules found - default to denied for sensitive fields, allowed for basic fields
    const sensitiveFields = ['salary', 'passportNumber', 'nationalId', 'bankDetails', 'insurance'];
    return {
      hasAccess: !sensitiveFields.includes(field),
      reason: sensitiveFields.includes(field) ? 'No access rule found for sensitive field' : 'No specific rule, default access granted',
      rule: null
    };
  }

  // Check if any rule allows access
  for (const rule of applicableRules) {
    if (evaluateConditions(rule.conditions, userAttributes, targetData)) {
      return {
        hasAccess: true,
        reason: 'Access granted by rule',
        rule: rule
      };
    }
  }

  // No conditions met
  return {
    hasAccess: false,
    reason: 'Conditions not met for any applicable rule',
    rule: applicableRules[0] // Return first rule for reference
  };
};

/**
 * Filters employee data based on access rules
 * @param {Object} employeeData - The employee data object
 * @param {Array} rules - Array of access rules
 * @param {Object} userInfo - Current user information
 * @returns {Object} - Filtered employee data
 */
export const filterEmployeeData = (employeeData, rules, userInfo) => {
  const filteredData = {};
  const userAttributes = {
    role: userInfo.role,
    department: userInfo.department,
    location: userInfo.location,
    ...userInfo
  };

  // Check each field in employee data
  Object.keys(employeeData).forEach(field => {
    const accessResult = evaluateFieldAccess(
      rules, 
      userInfo.role, 
      'view', 
      field, 
      userAttributes, 
      employeeData
    );

    if (accessResult.hasAccess) {
      filteredData[field] = employeeData[field];
    } else {
      // Replace sensitive data with placeholder
      filteredData[field] = getPlaceholderValue(field);
    }
  });

  return filteredData;
};

/**
 * Gets placeholder value for hidden fields
 * @param {string} field - The field name
 * @returns {string} - Placeholder value
 */
const getPlaceholderValue = (field) => {
  const placeholders = {
    salary: '***',
    phone: '***-***-****',
    email: '***@***.com',
    passportNumber: '********',
    nationalId: '********',
    bankDetails: '**** **** **** ****',
    insurance: '********',
    emergencyContact: '*** *** ****',
    performanceRating: '***',
    attendance: '***',
    leaveBalance: '***'
  };

  return placeholders[field] || '***';
};

/**
 * Checks if a user can perform a specific action on a field
 * @param {Array} rules - Array of access rules
 * @param {string} userRole - Current user's role
 * @param {string} action - Action to perform
 * @param {string} field - Field to access
 * @param {Object} userAttributes - Current user's attributes
 * @param {Object} targetData - Target data being accessed
 * @returns {boolean} - Whether the action is allowed
 */
export const canPerformAction = (rules, userRole, action, field, userAttributes = {}, targetData = {}) => {
  const accessResult = evaluateFieldAccess(rules, userRole, action, field, userAttributes, targetData);
  return accessResult.hasAccess;
};

/**
 * Gets all accessible fields for a user
 * @param {Array} rules - Array of access rules
 * @param {string} userRole - Current user's role
 * @param {string} action - Action to perform
 * @param {Object} userAttributes - Current user's attributes
 * @param {Object} targetData - Target data being accessed
 * @returns {Array} - Array of accessible field names
 */
export const getAccessibleFields = (rules, userRole, action, userAttributes = {}, targetData = {}) => {
  const accessibleFields = [];
  
  // Get all unique fields from rules
  const allFields = [...new Set(rules.map(rule => rule.field))];
  
  allFields.forEach(field => {
    if (canPerformAction(rules, userRole, action, field, userAttributes, targetData)) {
      accessibleFields.push(field);
    }
  });

  return accessibleFields;
};

/**
 * Validates a rule structure
 * @param {Object} rule - The rule to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateRule = (rule) => {
  const errors = [];

  if (!rule.role) {
    errors.push('Role is required');
  }

  if (!rule.action) {
    errors.push('Action is required');
  }

  if (!rule.field) {
    errors.push('Field is required');
  }

  if (!rule.description) {
    errors.push('Description is required');
  }

  // Validate conditions
  if (rule.conditions && rule.conditions.length > 0) {
    rule.conditions.forEach((condition, index) => {
      if (!condition.key) {
        errors.push(`Condition ${index + 1}: Key is required`);
      }
      if (!condition.operator) {
        errors.push(`Condition ${index + 1}: Operator is required`);
      }
      if (!condition.value) {
        errors.push(`Condition ${index + 1}: Value is required`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

export default {
  evaluateFieldAccess,
  filterEmployeeData,
  canPerformAction,
  getAccessibleFields,
  validateRule
}; 