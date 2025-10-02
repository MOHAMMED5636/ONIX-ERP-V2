// Main TaskManager component that orchestrates task management functionality
import React, { useRef, useLayoutEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useTaskContext } from './context';
import { filterTasks, generateTaskId, validateTask } from './utils';
import { defaultNewTask, defaultNewSubtask } from './constants';
import TaskTable from './components/TaskTable';
import GoogleMapPicker from './components/GoogleMapPicker';

const TaskManager = () => {
  const { state, actions } = useTaskContext();
  const { 
    tasks, 
    search, 
    showNewTask, 
    showSubtaskForm, 
    newTask, 
    newSubtask,
    googleMapPickerOpen,
    mapPickerOpen,
    mapPickerTarget,
    mapPickerCoords,
    projectStartDate,
    arrowPos
  } = state;

  // Refs for arrow positioning
  const mainTaskRefs = useRef({});
  const subTableRefs = useRef({});
  const mainTaskNameRefs = useRef({});

  // Calculate arrow positions for visual connections
  useLayoutEffect(() => {
    const newArrowPos = {};
    tasks.forEach(task => {
      if (
        task.expanded &&
        task.subtasks.length > 0 &&
        mainTaskNameRefs.current[task.id] &&
        subTableRefs.current[task.id]
      ) {
        const nameRect = mainTaskNameRefs.current[task.id].getBoundingClientRect();
        const subRect = subTableRefs.current[task.id].getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        newArrowPos[task.id] = {
          x1: nameRect.right - scrollX,
          y1: nameRect.top + nameRect.height / 2 - scrollY,
          x2: subRect.left - scrollX,
          y2: subRect.top + 24 - scrollY
        };
      }
    });
    actions.setArrowPos(newArrowPos);
  }, [tasks, showSubtaskForm, search]);

  // Event handlers
  const handleSearchChange = (e) => {
    actions.setSearch(e.target.value);
  };

  const handleAddNewTask = () => {
    const newTaskData = {
      ...defaultNewTask,
      id: generateTaskId(),
      autoNumber: tasks.length + 1,
      expanded: false
    };
    actions.setNewTask(newTaskData);
    actions.setShowNewTask(true);
  };

  const handleCreateTask = () => {
    if (!newTask) return;
    
    const errors = validateTask(newTask);
    if (Object.keys(errors).length > 0) {
      alert(`Please fix the following errors:\n${Object.values(errors).join('\n')}`);
      return;
    }
    
    const taskToAdd = {
      ...newTask,
      id: Date.now(),
      expanded: false
    };
    
    actions.addTask(taskToAdd);
    actions.calculateTimelines();
  };

  const handleEditTask = (task, field, value) => {
    const updatedTask = { ...task, [field]: value };
    
    // Handle special cases
    if (field === 'timeline') {
      const [start, end] = value;
      let planDays = 0;
      if (start && end) {
        planDays = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
      }
      updatedTask.planDays = planDays;
    } else if (field === 'planDays') {
      // For project-level tasks, only update planDays without changing timeline
      // Timeline updates should only happen for tasks and subtasks, not projects
      // No timeline update needed here
    }
    
    actions.updateTask(updatedTask);
    
    // Recalculate timelines if needed
    // Note: planDays changes at project level no longer trigger timeline recalculation
    if (field === 'predecessors' || field === 'timeline') {
      actions.calculateTimelines();
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      actions.deleteTask(taskId);
    }
  };

  const handleToggleExpand = (taskId) => {
    actions.toggleExpand(taskId);
  };

  const handleAddSubtask = (taskId) => {
    actions.setShowSubtaskForm(taskId);
  };

  const handleCreateSubtask = (taskId) => {
    const newSubtaskData = {
      id: generateTaskId(),
      ...newSubtask,
      completed: false,
      checklist: false,
      rating: 3,
      progress: 0,
      color: "#60a5fa",
      predecessors: ""
    };
    
    actions.addSubtask(taskId, newSubtaskData);
    actions.calculateTimelines();
    
    // Reset form
    actions.setNewSubtask(defaultNewSubtask);
  };

  const handleEditSubtask = (taskId, subtaskId, field, value) => {
    actions.updateSubtask(taskId, subtaskId, field, value);
  };

  const handleDeleteSubtask = (taskId, subtaskId) => {
    if (window.confirm('Are you sure you want to delete this subtask?')) {
      actions.deleteSubtask(taskId, subtaskId);
    }
  };

  const handleMarkSubtaskComplete = (taskId, subtaskId) => {
    actions.markSubtaskComplete(taskId, subtaskId);
  };

  const handleViewTask = (task) => {
    // Implementation for viewing task details
    console.log('Viewing task:', task);
  };

  const handleMapPickerPick = (lat, lng) => {
    if (mapPickerTarget) {
      const { type, taskId, subId } = mapPickerTarget;
      if (type === 'main') {
        handleEditTask(tasks.find(t => t.id === taskId), 'location', `${lat}, ${lng}`);
      } else if (type === 'sub') {
        const task = tasks.find(t => t.id === taskId);
        const subtask = task.subtasks.find(s => s.id === subId);
        handleEditSubtask(taskId, subId, 'location', `${lat}, ${lng}`);
      }
    }
    actions.setMapPicker(false, null, { lat: null, lng: null });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      // Handle drag and drop logic here
      console.log('Drag ended:', { active, over });
    }
  };

  // Filter tasks based on search
  const filteredTasks = filterTasks(tasks, search);

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
          <button
            onClick={handleAddNewTask}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Task
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Task Table */}
      <div className="relative">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <TaskTable
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onViewTask={handleViewTask}
              onAddSubtask={handleAddSubtask}
              onToggleExpand={handleToggleExpand}
              onMarkSubtaskComplete={handleMarkSubtaskComplete}
            />
          </SortableContext>
        </DndContext>

        {/* Arrow connections */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {Object.entries(arrowPos).map(([taskId, pos]) => (
            <line
              key={taskId}
              x1={pos.x1}
              y1={pos.y1}
              x2={pos.x2}
              y2={pos.y2}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          ))}
        </svg>
      </div>

      {/* New Task Form */}
      {showNewTask && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
              <input
                type="text"
                value={newTask?.name || ''}
                onChange={(e) => actions.setNewTask({ ...newTask, name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCreateTask();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    actions.setShowNewTask(false);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task name"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ref. No</label>
              <input
                type="text"
                value={newTask?.referenceNumber || ''}
                onChange={(e) => actions.setNewTask({ ...newTask, referenceNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter reference number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newTask?.category || 'Design'}
                onChange={(e) => actions.setNewTask({ ...newTask, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Review">Review</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <select
                value={newTask?.owner || 'AL'}
                onChange={(e) => actions.setNewTask({ ...newTask, owner: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AL">AL</option>
                <option value="MN">MN</option>
                <option value="SA">SA</option>
                <option value="JD">JD</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => actions.setShowNewTask(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTask}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Task
            </button>
          </div>
        </div>
      )}

      {/* Subtask Form */}
      {showSubtaskForm && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Add Subtask</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtask Name</label>
              <input
                type="text"
                value={newSubtask.name}
                onChange={(e) => actions.setNewSubtask({ ...newSubtask, name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCreateSubtask(showSubtaskForm);
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    actions.setShowSubtaskForm(null);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter subtask name"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newSubtask.category}
                onChange={(e) => actions.setNewSubtask({ ...newSubtask, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Review">Review</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => actions.setShowSubtaskForm(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleCreateSubtask(showSubtaskForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Subtask
            </button>
          </div>
        </div>
      )}

      {/* Map Picker */}
      {googleMapPickerOpen && (
        <GoogleMapPicker
          onPick={handleMapPickerPick}
          onClose={() => actions.setGoogleMapPicker(false)}
        />
      )}
    </div>
  );
};

export default TaskManager;



