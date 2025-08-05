# Breadcrumbs Component Usage Guide

## Overview

The `Breadcrumbs` component provides dynamic navigation breadcrumbs for the ERP system navigation path:
**Departments > Subdepartments > Positions > Employees**

## Component Features

- ✅ Uses `useParams()` to extract route IDs
- ✅ Accepts a `names` prop with object: `{ department, subdepartment, position }`
- ✅ Uses Tailwind CSS for clean styling
- ✅ Renders each level as a clickable link, except the last one
- ✅ Includes Home icon and chevron separators
- ✅ Responsive design

## Route Structure

```
/departments                                    → Departments list
/company-resources/departments/:departmentId    → Subdepartments
/company-resources/departments/:departmentId/positions/:subDepartmentId → Positions
/company-resources/departments/:departmentId/positions/:subDepartmentId/employees/:positionId → Employees
```

## Usage Examples

### 1. SubDepartmentsPage (Department Level)

```jsx
import Breadcrumbs from '../components/Breadcrumbs';

// In your component
const departmentName = "Board of Directors";

return (
  <div className="w-full h-full flex flex-col">
    {/* Breadcrumbs */}
    <div className="px-4 sm:px-6 lg:px-10 pt-4">
      <Breadcrumbs 
        names={{
          department: departmentName
        }}
      />
    </div>
    
    {/* Rest of your component */}
  </div>
);
```

**Result:** `Home > Departments > Board of Directors`

### 2. PositionsPage (Subdepartment Level)

```jsx
import Breadcrumbs from '../components/Breadcrumbs';

// In your component
const departmentName = "Board of Directors";
const subDepartmentName = "Executive Committee";

return (
  <div className="w-full h-full flex flex-col">
    {/* Breadcrumbs */}
    <div className="px-4 sm:px-6 lg:px-10 pt-4">
      <Breadcrumbs 
        names={{
          department: departmentName,
          subdepartment: subDepartmentName
        }}
      />
    </div>
    
    {/* Rest of your component */}
  </div>
);
```

**Result:** `Home > Departments > Board of Directors > Executive Committee`

### 3. EmployeesPage (Position Level)

```jsx
import Breadcrumbs from '../components/Breadcrumbs';

// In your component
const departmentName = "Board of Directors";
const subDepartmentName = "Executive Committee";
const positionName = "Chief Executive Officer";

return (
  <div className="w-full h-full flex flex-col">
    {/* Breadcrumbs */}
    <div className="px-4 sm:px-6 lg:px-10 pt-4">
      <Breadcrumbs 
        names={{
          department: departmentName,
          subdepartment: subDepartmentName,
          position: positionName
        }}
      />
    </div>
    
    {/* Rest of your component */}
  </div>
);
```

**Result:** `Home > Departments > Board of Directors > Executive Committee > Chief Executive Officer`

### 4. General Employees List (No specific position)

```jsx
import Breadcrumbs from '../components/Breadcrumbs';

// In your component
return (
  <div className="w-full h-full flex flex-col">
    {/* Breadcrumbs */}
    <div className="px-4 sm:px-6 lg:px-10 pt-4">
      <Breadcrumbs />
    </div>
    
    {/* Rest of your component */}
  </div>
);
```

**Result:** `Home > Departments > Employees`

## Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `names` | `object` | No | Object containing display names for route parameters |

### names object structure:

```jsx
{
  department: "Board of Directors",     // Department name
  subdepartment: "Executive Committee", // Subdepartment name  
  position: "Chief Executive Officer"   // Position name
}
```

## Styling

The component uses Tailwind CSS classes:

- **Container**: `flex items-center space-x-1 text-sm text-gray-500 mb-4`
- **Links**: `hover:text-indigo-600 hover:underline transition-colors duration-200`
- **Active item**: `font-medium text-gray-900`
- **Separators**: `h-4 w-4 text-gray-400`
- **Home icon**: `h-4 w-4 mr-1`

## Navigation Behavior

- **Home**: Navigates to `/`
- **Departments**: Navigates to `/departments`
- **Department**: Navigates to `/company-resources/departments/:departmentId`
- **Subdepartment**: Navigates to `/company-resources/departments/:departmentId/positions/:subDepartmentId`
- **Position**: Navigates to `/company-resources/departments/:departmentId/positions/:subDepartmentId/employees/:positionId`

## Implementation Notes

1. **Route Parameters**: The component automatically extracts `departmentId`, `subDepartmentId`, and `positionId` from the URL
2. **Dynamic Navigation**: Each breadcrumb item (except the last) is clickable and navigates to the appropriate route
3. **Responsive**: Works on both mobile and desktop with proper spacing
4. **Accessibility**: Uses semantic HTML with proper button elements for navigation

## Example Implementation in Different Pages

### SubDepartmentsPage.js
```jsx
// Extract department name from your data
const departmentName = departmentNames[departmentId] || "Department";

<Breadcrumbs 
  names={{
    department: departmentName
  }}
/>
```

### PositionsPage.js
```jsx
// Extract names from your data
const departmentName = subDepartmentNames[subDepartmentId] || "Department";
const subDepartmentName = subDepartmentNames[subDepartmentId] || "Sub Department";

<Breadcrumbs 
  names={{
    department: departmentName,
    subdepartment: subDepartmentName
  }}
/>
```

### EmployeesPage.js (with position context)
```jsx
// When you have position information
<Breadcrumbs 
  names={{
    department: "Board of Directors",
    subdepartment: "Executive Committee", 
    position: "Chief Executive Officer"
  }}
/>
```

This breadcrumb system provides clear navigation context and allows users to easily navigate back through the hierarchy. 