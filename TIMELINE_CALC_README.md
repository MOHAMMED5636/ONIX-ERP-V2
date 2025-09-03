# TimelineCalc.js - Hierarchical Date Calculation System

## 🎯 Overview

`TimelineCalc.js` provides a hierarchical date calculation system for projects, tasks, and child tasks. It ensures that:

1. **Project dates** are calculated from its **tasks only**
2. **Task dates** can roll up from their **child tasks**
3. **Child tasks** do not directly affect project dates

## 🚀 Key Features

- **Hierarchical Calculation**: Dates flow from child tasks → parent tasks → projects
- **Date Validation**: Ensures all returned values are valid `Date` objects
- **Flexible Input**: Handles both Date objects and ISO date strings
- **Performance Optimized**: Efficient date calculations with minimal overhead
- **Type Safe**: Comprehensive error handling and validation

## 📁 File Structure

```
src/components/tasks/utils/
├── TimelineCalc.js          # Main calculation functions
├── TimelineCalcDemo.js      # Demo and testing functions
└── tableUtils.js            # Updated to integrate with TimelineCalc
```

## 🔧 Core Functions

### `calculateTaskDates(task)`

Calculates task dates by rolling up from child tasks if they exist.

```javascript
import { calculateTaskDates } from './TimelineCalc';

const taskWithDates = calculateTaskDates(task);
// Returns: { ...task, start: Date, end: Date, timeline: [Date, Date] }
```

**Logic:**
- If no child tasks: keeps task's own dates
- If has child tasks: sets start = earliest child start, end = latest child end

### `calculateProjectDates(project)`

Calculates project dates from its tasks only.

```javascript
import { calculateProjectDates } from './TimelineCalc';

const projectWithDates = calculateProjectDates(project);
// Returns: { ...project, start: Date, end: Date, timeline: [Date, Date] }
```

**Logic:**
1. Iterates over all project tasks
2. Uses `calculateTaskDates(task)` for each task
3. Sets project start = earliest task start, project end = latest task end

### `calculateAllProjectDates(projects)`

Calculates dates for an array of projects.

```javascript
import { calculateAllProjectDates } from './TimelineCalc';

const projectsWithDates = calculateAllProjectDates(projects);
// Returns: Array of projects with calculated dates
```

## 📊 Example Usage

### Basic Task Date Calculation

```javascript
const task = {
  id: 'task-1',
  name: 'Design Phase',
  timeline: [new Date('2025-09-01'), new Date('2025-09-05')],
  childSubtasks: [
    {
      id: 'subtask-1',
      timeline: [new Date('2025-09-01'), new Date('2025-09-03')]
    },
    {
      id: 'subtask-2', 
      timeline: [new Date('2025-09-04'), new Date('2025-09-05')]
    }
  ]
};

const calculatedTask = calculateTaskDates(task);
// Result: start = Sep 1, end = Sep 5 (rolled up from children)
```

### Project Date Calculation

```javascript
const project = {
  id: 'project-1',
  name: 'Website Development',
  subtasks: [
    { timeline: [new Date('2025-09-01'), new Date('2025-09-05')] },
    { timeline: [new Date('2025-09-08'), new Date('2025-09-12')] },
    { timeline: [new Date('2025-09-15'), new Date('2025-09-20')] }
  ]
};

const calculatedProject = calculateProjectDates(project);
// Result: start = Sep 1, end = Sep 20
```

## 🔄 Integration with Existing System

The new `TimelineCalc` system integrates seamlessly with the existing `calculateTaskTimelines` function:

```javascript
// In tableUtils.js
import { calculateProjectDates } from './TimelineCalc';

export function calculateTaskTimelines(tasks, projectStartDate) {
  // 1. Calculate basic timelines using existing logic
  const tasksWithBasicTimelines = /* existing logic */;
  
  // 2. Apply hierarchical date calculation
  return tasksWithBasicTimelines.map(task => 
    calculateProjectDates(task)
  );
}
```

## ✅ Validation & Error Handling

### Date Validation

```javascript
import { validateProjectDates } from './TimelineCalc';

const isValid = validateProjectDates(project);
// Returns: true if all dates are valid Date objects
```

### Input Flexibility

The system handles various input formats:

```javascript
// Valid inputs:
new Date('2025-09-01')           // Date object
'2025-09-01'                     // ISO string
null                             // No date
undefined                        // No date

// Invalid inputs are safely converted to null
```

## 🧪 Testing & Demo

### Run the Demo

```javascript
import { runTimelineCalcDemo } from './TimelineCalcDemo';

// Run the demo in browser console
runTimelineCalcDemo();
```

### Expected Output

```
🚀 TimelineCalc Demo Starting...

1️⃣ Calculating Task Dates (with child task roll-up):
Task A: Sep 1 → Sep 2
Task C (calculated): Sep 15 → Oct 2

2️⃣ Calculating Project Dates (from tasks only):
Project dates: Sep 1 → Oct 2
  - Expected: Sep 1 → Oct 2
  - Actual: Sep 1 → Oct 2

📌 Project Dates: Sep 1 → Oct 2 ✅
```

## 📋 Business Rules

1. **Project Dates**: Only calculated from direct tasks (subtasks)
2. **Task Dates**: Can roll up from child tasks if they exist
3. **Child Tasks**: Never directly affect project dates
4. **Date Hierarchy**: Child → Task → Project (bottom-up calculation)
5. **Validation**: All returned dates are guaranteed to be valid Date objects

## 🚨 Important Notes

- **Child tasks** are defined as `task.childSubtasks` array
- **Tasks** are defined as `project.subtasks` array
- **Timeline format** is `[startDate, endDate]` array
- **Date objects** are always returned (never strings)
- **Invalid dates** are converted to `null` safely

## 🔮 Future Enhancements

- **Predecessor Logic**: Integrate with existing predecessor system
- **Date Constraints**: Add business rules for date validation
- **Performance**: Optimize for large project hierarchies
- **Caching**: Add memoization for repeated calculations
- **Time Zones**: Support for timezone-aware calculations

## 📞 Support

For questions or issues with the TimelineCalc system:

1. Check the demo output in browser console
2. Verify input data structure matches expected format
3. Ensure all dates are valid Date objects or ISO strings
4. Review the business rules for date hierarchy

---

**Version**: 1.0.0  
**Last Updated**: September 2025  
**Author**: ONIX ERP Development Team
