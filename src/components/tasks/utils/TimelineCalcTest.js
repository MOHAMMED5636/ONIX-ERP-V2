import { calculateTaskDates, calculateProjectDates, getDateRangeString } from './TimelineCalc';

/**
 * Simple test to verify TimelineCalc is working
 * Run this in browser console to test
 */

export function testTimelineCalc() {
  console.log('🧪 Testing TimelineCalc...');
  
  // Test data with real dates
  const testTask = {
    id: 'test-1',
    name: 'Test Task',
    timeline: [new Date('2025-09-01'), new Date('2025-09-10')],
    childSubtasks: [
      {
        id: 'child-1',
        name: 'Child 1',
        timeline: [new Date('2025-09-02'), new Date('2025-09-05')]
      },
      {
        id: 'child-2',
        name: 'Child 2',
        timeline: [new Date('2025-09-06'), new Date('2025-09-08')]
      }
    ]
  };
  
  const testProject = {
    id: 'project-1',
    name: 'Test Project',
    timeline: [new Date('2025-09-01'), new Date('2025-09-10')],
    subtasks: [
      {
        id: 'task-1',
        name: 'Task 1',
        timeline: [new Date('2025-09-01'), new Date('2025-09-05')]
      },
      {
        id: 'task-2',
        name: 'Task 2',
        timeline: [new Date('2025-09-06'), new Date('2025-09-10')]
      }
    ]
  };
  
  // Test 1: Task date calculation
  console.log('\n1️⃣ Testing Task Date Calculation:');
  const calculatedTask = calculateTaskDates(testTask);
  console.log('Original task timeline:', getDateRangeString(testTask.timeline[0], testTask.timeline[1]));
  console.log('Calculated task dates:', getDateRangeString(calculatedTask.start, calculatedTask.end));
  console.log('Task has start/end properties:', !!calculatedTask.start, !!calculatedTask.end);
  
  // Test 2: Project date calculation
  console.log('\n2️⃣ Testing Project Date Calculation:');
  const calculatedProject = calculateProjectDates(testProject);
  console.log('Original project timeline:', getDateRangeString(testProject.timeline[0], testTask.timeline[1]));
  console.log('Calculated project dates:', getDateRangeString(calculatedProject.start, calculatedProject.end));
  console.log('Project has start/end properties:', !!calculatedProject.start, !!calculatedProject.end);
  
  // Test 3: Check if dates are valid
  console.log('\n3️⃣ Validation:');
  console.log('Task start is Date object:', calculatedTask.start instanceof Date);
  console.log('Task end is Date object:', calculatedTask.end instanceof Date);
  console.log('Project start is Date object:', calculatedProject.start instanceof Date);
  console.log('Project end is Date object:', calculatedProject.end instanceof Date);
  
  console.log('\n✅ TimelineCalc test completed!');
  
  return {
    calculatedTask,
    calculatedProject
  };
}

// Export for browser console testing
export default testTimelineCalc;
