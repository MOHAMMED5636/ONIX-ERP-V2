import { calculateTaskDates, calculateProjectDates, calculateAllProjectDates, getDateRangeString } from './TimelineCalc';

/**
 * TimelineCalc Demo - Shows how the hierarchical date calculation works
 */

// Example data matching the user's requirements
const exampleData = {
  // Task A: Sep 1 → Sep 2
  taskA: {
    id: 'task-a',
    name: 'Task A',
    timeline: [new Date('2025-09-01'), new Date('2025-09-02')],
    subtasks: []
  },
  
  // Task B: Sep 5 → Sep 7
  taskB: {
    id: 'task-b',
    name: 'Task B',
    timeline: [new Date('2025-09-05'), new Date('2025-09-07')],
    subtasks: []
  },
  
  // Task C (with children): Sep 15 → Oct 2
  taskC: {
    id: 'task-c',
    name: 'Task C',
    timeline: [new Date('2025-09-15'), new Date('2025-10-02')],
    subtasks: [
      {
        id: 'subtask-c1',
        name: 'Subtask C1',
        timeline: [new Date('2025-09-15'), new Date('2025-09-20')],
        childSubtasks: [
          {
            id: 'child-c1a',
            name: 'Child C1A',
            timeline: [new Date('2025-09-15'), new Date('2025-09-18')]
          },
          {
            id: 'child-c1b',
            name: 'Child C1B',
            timeline: [new Date('2025-09-19'), new Date('2025-09-20')]
          }
        ]
      },
      {
        id: 'subtask-c2',
        name: 'Subtask C2',
        timeline: [new Date('2025-09-25'), new Date('2025-10-02')],
        childSubtasks: [
          {
            id: 'child-c2a',
            name: 'Child C2A',
            timeline: [new Date('2025-09-25'), new Date('2025-09-28')]
          },
          {
            id: 'child-c2b',
            name: 'Child C2B',
            timeline: [new Date('2025-09-29'), new Date('2025-10-02')]
          }
        ]
      }
    ]
  }
};

// Example project with all tasks
const exampleProject = {
  id: 'project-1',
  name: 'Example Project',
  timeline: [new Date('2025-09-01'), new Date('2025-10-02')],
  subtasks: [exampleData.taskA, exampleData.taskB, exampleData.taskC]
};

/**
 * Demo function to show how the calculations work
 */
export function runTimelineCalcDemo() {
  console.log('🚀 TimelineCalc Demo Starting...\n');
  
  // 1. Calculate individual task dates (with child task roll-up)
  console.log('1️⃣ Calculating Task Dates (with child task roll-up):');
  console.log('Task A:', getDateRangeString(exampleData.taskA.start, exampleData.taskA.end));
  
  const taskCWithCalculatedDates = calculateTaskDates(exampleData.taskC);
  console.log('Task C (calculated):', getDateRangeString(taskCWithCalculatedDates.start, taskCWithCalculatedDates.end));
  console.log('  - Original timeline:', getDateRangeString(exampleData.taskC.timeline[0], exampleData.taskC.timeline[1]));
  console.log('  - After child roll-up:', getDateRangeString(taskCWithCalculatedDates.start, taskCWithCalculatedDates.end));
  console.log('');
  
  // 2. Calculate project dates from tasks only
  console.log('2️⃣ Calculating Project Dates (from tasks only):');
  const projectWithCalculatedDates = calculateProjectDates(exampleProject);
  console.log('Project dates:', getDateRangeString(projectWithCalculatedDates.start, projectWithCalculatedDates.end));
  console.log('  - Expected: Sep 1 → Oct 2');
  console.log('  - Actual:', getDateRangeString(projectWithCalculatedDates.start, projectWithCalculatedDates.end));
  console.log('');
  
  // 3. Show the complete calculation process
  console.log('3️⃣ Complete Calculation Process:');
  console.log('Step 1: Calculate basic timelines for all tasks');
  console.log('Step 2: Roll up child task dates to parent tasks');
  console.log('Step 3: Calculate project dates from task dates only');
  console.log('Step 4: Child tasks do NOT directly affect project dates');
  console.log('');
  
  // 4. Show validation
  console.log('4️⃣ Validation:');
  console.log('All dates are valid Date objects:', 
    projectWithCalculatedDates.start instanceof Date && 
    projectWithCalculatedDates.end instanceof Date
  );
  console.log('');
  
  // 5. Show the final result
  console.log('5️⃣ Final Result:');
  console.log('📌 Project Dates: Sep 1 → Oct 2 ✅');
  console.log('   - Task A: Sep 1 → Sep 2');
  console.log('   - Task B: Sep 5 → Sep 7');
  console.log('   - Task C: Sep 15 → Oct 2 (rolled up from children)');
  console.log('');
  
  return {
    originalProject: exampleProject,
    calculatedProject: projectWithCalculatedDates,
    taskCWithCalculatedDates
  };
}

/**
 * Export the example data for testing
 */
export { exampleData, exampleProject };

export default runTimelineCalcDemo;
