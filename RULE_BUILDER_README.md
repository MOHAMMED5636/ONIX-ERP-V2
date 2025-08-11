# Rule Builder System

A comprehensive dynamic field-level access control system for the ERP application that allows administrators to define granular permissions for employee data access.

## Features

### 🛡️ Dynamic Access Control
- **Role-based permissions**: Define access rules based on user roles (admin, manager, hr_manager, etc.)
- **Field-level security**: Control access to specific employee fields (salary, phone, passport, etc.)
- **Conditional rules**: Set complex conditions based on department, location, and other attributes
- **Action-based permissions**: Support for view, edit, delete, and create actions

### 📊 Rule Management
- **Visual rule builder**: Intuitive interface for creating and managing access rules
- **Rule validation**: Built-in validation to ensure rule integrity
- **Active/Inactive rules**: Toggle rules on/off without deletion
- **Rule statistics**: Dashboard showing rule counts and status

### 🔧 Advanced Features
- **Multiple conditions**: Combine multiple conditions with AND logic
- **Flexible operators**: Equals, not equals, contains, starts with, ends with, greater than, less than, in range
- **Real-time evaluation**: Rules are evaluated dynamically based on current user context
- **Persistent storage**: Rules are saved to localStorage and persist across sessions

## Components

### 1. RuleBuilder (`/src/pages/employees/RuleBuilder.js`)
The main interface for creating and managing access rules.

**Features:**
- Create new rules with role, action, field, and conditions
- Edit existing rules
- Delete rules with confirmation
- Toggle rule active status
- Search and filter rules
- Statistics dashboard

**Usage:**
Navigate to `/employees/rule-builder` to access the rule management interface.

### 2. EmployeeRuleDemo (`/src/pages/employees/EmployeeRuleDemo.js`)
A demonstration component showing how rules affect data visibility.

**Features:**
- Switch between different user roles
- View employee data with applied rules
- See which fields are visible/hidden
- Access information for each field
- Real-time rule evaluation

**Usage:**
Navigate to `/employees/rule-demo` to see the rules in action.

### 3. RuleContext (`/src/context/RuleContext.js`)
Global state management for rules across the application.

**Features:**
- Centralized rule storage
- CRUD operations for rules
- LocalStorage persistence
- Rule statistics
- Import/Export functionality

### 4. Rule Evaluator (`/src/utils/ruleEvaluator.js`)
Utility functions for evaluating access rules.

**Key Functions:**
- `evaluateFieldAccess()`: Check if a user can access a specific field
- `filterEmployeeData()`: Filter employee data based on rules
- `canPerformAction()`: Check if an action is allowed
- `getAccessibleFields()`: Get all accessible fields for a user

## Rule Structure

Each rule has the following structure:

```javascript
{
  id: 1,
  role: "manager",           // User role this rule applies to
  action: "view",            // Action: view, edit, delete, create
  field: "salary",           // Employee field to control access to
  conditions: [              // Array of conditions (all must be true)
    {
      key: "department",     // Field to check (user or employee attribute)
      operator: "equals",    // Comparison operator
      value: "IT"           // Value to compare against
    }
  ],
  description: "Managers can view salary only for IT department employees",
  isActive: true            // Whether the rule is active
}
```

## Available Fields

### Employee Fields
- `name` - Employee name
- `email` - Email address
- `phone` - Phone number
- `salary` - Salary information
- `department` - Department
- `position` - Job position
- `hireDate` - Hire date
- `manager` - Manager name
- `location` - Work location
- `status` - Employment status
- `employeeId` - Employee ID
- `passportNumber` - Passport number
- `nationalId` - National ID
- `insurance` - Insurance information
- `bankDetails` - Bank account details
- `emergencyContact` - Emergency contact
- `performanceRating` - Performance rating
- `attendance` - Attendance record
- `leaveBalance` - Leave balance

### Condition Fields
- `department` - Department
- `location` - Location
- `role` - User role
- `status` - Status
- `manager` - Manager
- `hireDate` - Hire date
- `salary_range` - Salary range

## Available Operators

- `equals` - Exact match
- `not_equals` - Not equal to
- `contains` - Contains substring
- `starts_with` - Starts with
- `ends_with` - Ends with
- `greater_than` - Greater than (numeric)
- `less_than` - Less than (numeric)
- `in_range` - Within range (format: "min-max")

## Usage Examples

### Example 1: Basic Role-Based Access
```javascript
{
  role: "manager",
  action: "view",
  field: "salary",
  conditions: [
    { key: "department", operator: "equals", value: "IT" }
  ],
  description: "Managers can view salary only for IT department employees"
}
```

### Example 2: Multi-Condition Rule
```javascript
{
  role: "hr_manager",
  action: "edit",
  field: "salary",
  conditions: [
    { key: "role", operator: "not_equals", value: "admin" },
    { key: "department", operator: "contains", value: "IT" }
  ],
  description: "HR managers can edit salary for non-admin IT employees"
}
```

### Example 3: Range-Based Rule
```javascript
{
  role: "finance_manager",
  action: "view",
  field: "bankDetails",
  conditions: [
    { key: "salary_range", operator: "in_range", value: "50000-100000" }
  ],
  description: "Finance managers can view bank details for employees with salary 50k-100k"
}
```

## Integration with Employee Pages

To use the rule system in your employee components:

```javascript
import { useRules } from '../context/RuleContext';
import { filterEmployeeData, evaluateFieldAccess } from '../utils/ruleEvaluator';

function EmployeeComponent() {
  const { rules } = useRules();
  const currentUser = { role: 'manager', department: 'IT', location: 'HQ' };
  
  // Filter employee data based on rules
  const filteredData = filterEmployeeData(employeeData, rules, currentUser);
  
  // Check specific field access
  const canViewSalary = evaluateFieldAccess(rules, currentUser.role, 'view', 'salary', currentUser, employeeData);
  
  return (
    <div>
      {canViewSalary.hasAccess ? (
        <div>Salary: {employeeData.salary}</div>
      ) : (
        <div>Salary: ***</div>
      )}
    </div>
  );
}
```

## Security Features

### Default Behavior
- **Sensitive fields** (salary, passport, nationalId, bankDetails, insurance) are denied by default if no rule exists
- **Basic fields** (name, email, department) are allowed by default if no rule exists
- **Rule precedence**: More specific rules take precedence over general ones

### Data Protection
- Hidden fields are replaced with placeholder values (***)
- Access decisions are made in real-time based on current user context
- Rules are evaluated server-side in production (localStorage is for demo purposes)

## Best Practices

### Rule Design
1. **Start with deny-by-default**: Create rules to explicitly allow access rather than deny
2. **Use specific conditions**: Be as specific as possible with conditions
3. **Test thoroughly**: Use the demo component to test rule behavior
4. **Document rules**: Use clear descriptions for each rule

### Performance
1. **Limit conditions**: Avoid too many conditions per rule
2. **Use efficient operators**: `equals` is faster than `contains`
3. **Cache results**: Consider caching rule evaluation results for frequently accessed data

### Maintenance
1. **Regular review**: Periodically review and update rules
2. **Audit trail**: Keep track of rule changes
3. **Backup rules**: Export rules regularly for backup

## Troubleshooting

### Common Issues

1. **Rules not working**
   - Check if the rule is active (`isActive: true`)
   - Verify user role matches rule role
   - Ensure conditions are correctly formatted

2. **Fields always hidden**
   - Check if there's a rule that denies access
   - Verify field name matches exactly
   - Check condition values and operators

3. **Unexpected access**
   - Review all active rules for the user role
   - Check condition logic (all conditions must be true)
   - Verify user attributes match condition requirements

### Debug Mode
Enable debug mode in the demo component to see detailed access information for each field.

## Future Enhancements

- **Rule templates**: Pre-built rule templates for common scenarios
- **Rule inheritance**: Hierarchical rule system
- **Time-based rules**: Rules that apply only during certain time periods
- **Audit logging**: Track rule evaluation and access attempts
- **API integration**: Connect to backend for persistent rule storage
- **Advanced conditions**: Support for OR logic and nested conditions

## API Reference

### RuleContext Methods

```javascript
const {
  rules,                    // Array of all rules
  addRule,                  // Add new rule
  updateRule,               // Update existing rule
  deleteRule,               // Delete rule
  toggleRuleStatus,         // Toggle rule active status
  getRulesStats,            // Get rule statistics
  clearAllRules,            // Clear all rules
  exportRules,              // Export rules to JSON
  importRules               // Import rules from JSON
} = useRules();
```

### Rule Evaluator Functions

```javascript
import {
  evaluateFieldAccess,      // Check field access
  filterEmployeeData,       // Filter employee data
  canPerformAction,         // Check action permission
  getAccessibleFields,      // Get accessible fields
  validateRule              // Validate rule structure
} from '../utils/ruleEvaluator';
```

## Support

For questions or issues with the Rule Builder system, please refer to:
- Component documentation in the code
- Demo component for testing
- This README for usage examples
- Rule evaluator utility for technical details 