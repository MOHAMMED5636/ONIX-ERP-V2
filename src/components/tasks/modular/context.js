// Task management context for state management
import React, { createContext, useContext, useReducer } from 'react';
import { initialTasks } from './constants';
import { calculateTaskTimelines } from './utils';

// Initial state
const initialState = {
  tasks: initialTasks,
  search: "",
  showNewTask: false,
  showSubtaskForm: null,
  editingTaskId: null,
  editingTaskName: "",
  selectedProjectForSummary: null,
  expandedActive: {},
  expandedCompleted: {},
  newTask: null,
  newSubtask: {
    name: "",
    referenceNumber: "",
    category: "Design",
    status: "not started",
    owner: "",
    timeline: [null, null],
    planDays: 0,
    remarks: "",
    assigneeNotes: "",
    attachments: [],
    priority: "Low",
    location: ""
  },
  editingSubtask: {},
  editSubValue: "",
  showAddColumnDropdown: false,
  showRatingPrompt: false,
  selectedProject: null,
  showProjectDialog: false,
  mapPickerOpen: false,
  mapPickerTarget: null,
  mapPickerCoords: { lat: null, lng: null },
  googleMapPickerOpen: false,
  projectStartDate: new Date(),
  arrowPos: {}
};

// Action types
const TASK_ACTIONS = {
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  TOGGLE_EXPAND: 'TOGGLE_EXPAND',
  SET_SEARCH: 'SET_SEARCH',
  SET_SHOW_NEW_TASK: 'SET_SHOW_NEW_TASK',
  SET_SHOW_SUBTASK_FORM: 'SET_SHOW_SUBTASK_FORM',
  SET_EDITING_TASK: 'SET_EDITING_TASK',
  SET_SELECTED_PROJECT: 'SET_SELECTED_PROJECT',
  SET_EXPANDED_ACTIVE: 'SET_EXPANDED_ACTIVE',
  SET_EXPANDED_COMPLETED: 'SET_EXPANDED_COMPLETED',
  SET_NEW_TASK: 'SET_NEW_TASK',
  SET_NEW_SUBTASK: 'SET_NEW_SUBTASK',
  SET_EDITING_SUBTASK: 'SET_EDITING_SUBTASK',
  SET_EDIT_SUB_VALUE: 'SET_EDIT_SUB_VALUE',
  SET_SHOW_ADD_COLUMN: 'SET_SHOW_ADD_COLUMN',
  SET_SHOW_RATING_PROMPT: 'SET_SHOW_RATING_PROMPT',
  SET_SELECTED_PROJECT_DIALOG: 'SET_SELECTED_PROJECT_DIALOG',
  SET_SHOW_PROJECT_DIALOG: 'SET_SHOW_PROJECT_DIALOG',
  SET_MAP_PICKER: 'SET_MAP_PICKER',
  SET_GOOGLE_MAP_PICKER: 'SET_GOOGLE_MAP_PICKER',
  SET_PROJECT_START_DATE: 'SET_PROJECT_START_DATE',
  SET_ARROW_POS: 'SET_ARROW_POS',
  ADD_SUBTASK: 'ADD_SUBTASK',
  UPDATE_SUBTASK: 'UPDATE_SUBTASK',
  DELETE_SUBTASK: 'DELETE_SUBTASK',
  MARK_SUBTASK_COMPLETE: 'MARK_SUBTASK_COMPLETE',
  CALCULATE_TIMELINES: 'CALCULATE_TIMELINES'
};

// Reducer function
const taskReducer = (state, action) => {
  switch (action.type) {
    case TASK_ACTIONS.SET_TASKS:
      return { ...state, tasks: action.payload };
    
    case TASK_ACTIONS.ADD_TASK:
      return { 
        ...state, 
        tasks: [...state.tasks, action.payload],
        showNewTask: false,
        newTask: null
      };
    
    case TASK_ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        )
      };
    
    case TASK_ACTIONS.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    
    case TASK_ACTIONS.TOGGLE_EXPAND:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload ? { ...task, expanded: !task.expanded } : task
        )
      };
    
    case TASK_ACTIONS.SET_SEARCH:
      return { ...state, search: action.payload };
    
    case TASK_ACTIONS.SET_SHOW_NEW_TASK:
      return { ...state, showNewTask: action.payload };
    
    case TASK_ACTIONS.SET_SHOW_SUBTASK_FORM:
      return { ...state, showSubtaskForm: action.payload };
    
    case TASK_ACTIONS.SET_EDITING_TASK:
      return { 
        ...state, 
        editingTaskId: action.payload.id,
        editingTaskName: action.payload.name
      };
    
    case TASK_ACTIONS.SET_SELECTED_PROJECT:
      return { ...state, selectedProjectForSummary: action.payload };
    
    case TASK_ACTIONS.SET_EXPANDED_ACTIVE:
      return { ...state, expandedActive: action.payload };
    
    case TASK_ACTIONS.SET_EXPANDED_COMPLETED:
      return { ...state, expandedCompleted: action.payload };
    
    case TASK_ACTIONS.SET_NEW_TASK:
      return { ...state, newTask: action.payload };
    
    case TASK_ACTIONS.SET_NEW_SUBTASK:
      return { ...state, newSubtask: action.payload };
    
    case TASK_ACTIONS.SET_EDITING_SUBTASK:
      return { ...state, editingSubtask: action.payload };
    
    case TASK_ACTIONS.SET_EDIT_SUB_VALUE:
      return { ...state, editSubValue: action.payload };
    
    case TASK_ACTIONS.SET_SHOW_ADD_COLUMN:
      return { ...state, showAddColumnDropdown: action.payload };
    
    case TASK_ACTIONS.SET_SHOW_RATING_PROMPT:
      return { ...state, showRatingPrompt: action.payload };
    
    case TASK_ACTIONS.SET_SELECTED_PROJECT_DIALOG:
      return { ...state, selectedProject: action.payload };
    
    case TASK_ACTIONS.SET_SHOW_PROJECT_DIALOG:
      return { ...state, showProjectDialog: action.payload };
    
    case TASK_ACTIONS.SET_MAP_PICKER:
      return { 
        ...state, 
        mapPickerOpen: action.payload.open,
        mapPickerTarget: action.payload.target,
        mapPickerCoords: action.payload.coords
      };
    
    case TASK_ACTIONS.SET_GOOGLE_MAP_PICKER:
      return { ...state, googleMapPickerOpen: action.payload };
    
    case TASK_ACTIONS.SET_PROJECT_START_DATE:
      return { ...state, projectStartDate: action.payload };
    
    case TASK_ACTIONS.SET_ARROW_POS:
      return { ...state, arrowPos: action.payload };
    
    case TASK_ACTIONS.ADD_SUBTASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? {
                ...task,
                subtasks: [...task.subtasks, action.payload.subtask]
              }
            : task
        ),
        showSubtaskForm: null
      };
    
    case TASK_ACTIONS.UPDATE_SUBTASK:
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id !== action.payload.taskId) return task;
          const updatedSubtasks = task.subtasks.map(sub =>
            sub.id === action.payload.subtaskId
              ? { ...sub, [action.payload.field]: action.payload.value }
              : sub
          );
          return { ...task, subtasks: updatedSubtasks };
        })
      };
    
    case TASK_ACTIONS.DELETE_SUBTASK:
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id !== action.payload.taskId) return task;
          return {
            ...task,
            subtasks: task.subtasks.filter(sub => sub.id !== action.payload.subtaskId)
          };
        })
      };
    
    case TASK_ACTIONS.MARK_SUBTASK_COMPLETE:
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id !== action.payload.taskId) return task;
          const updatedSubtasks = task.subtasks.map(sub =>
            sub.id === action.payload.subtaskId
              ? { ...sub, status: "done", completed: true }
              : sub
          );
          const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.status === 'done');
          return {
            ...task,
            subtasks: updatedSubtasks,
            status: allDone ? 'done' : task.status
          };
        })
      };
    
    case TASK_ACTIONS.CALCULATE_TIMELINES:
      return {
        ...state,
        tasks: calculateTaskTimelines(state.tasks, state.projectStartDate)
      };
    
    default:
      return state;
  }
};

// Create context
const TaskContext = createContext();

// Provider component
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Action creators
  const actions = {
    setTasks: (tasks) => dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: tasks }),
    addTask: (task) => dispatch({ type: TASK_ACTIONS.ADD_TASK, payload: task }),
    updateTask: (task) => dispatch({ type: TASK_ACTIONS.UPDATE_TASK, payload: task }),
    deleteTask: (taskId) => dispatch({ type: TASK_ACTIONS.DELETE_TASK, payload: taskId }),
    toggleExpand: (taskId) => dispatch({ type: TASK_ACTIONS.TOGGLE_EXPAND, payload: taskId }),
    setSearch: (search) => dispatch({ type: TASK_ACTIONS.SET_SEARCH, payload: search }),
    setShowNewTask: (show) => dispatch({ type: TASK_ACTIONS.SET_SHOW_NEW_TASK, payload: show }),
    setShowSubtaskForm: (taskId) => dispatch({ type: TASK_ACTIONS.SET_SHOW_SUBTASK_FORM, payload: taskId }),
    setEditingTask: (id, name) => dispatch({ type: TASK_ACTIONS.SET_EDITING_TASK, payload: { id, name } }),
    setSelectedProject: (project) => dispatch({ type: TASK_ACTIONS.SET_SELECTED_PROJECT, payload: project }),
    setExpandedActive: (expanded) => dispatch({ type: TASK_ACTIONS.SET_EXPANDED_ACTIVE, payload: expanded }),
    setExpandedCompleted: (expanded) => dispatch({ type: TASK_ACTIONS.SET_EXPANDED_COMPLETED, payload: expanded }),
    setNewTask: (task) => dispatch({ type: TASK_ACTIONS.SET_NEW_TASK, payload: task }),
    setNewSubtask: (subtask) => dispatch({ type: TASK_ACTIONS.SET_NEW_SUBTASK, payload: subtask }),
    setEditingSubtask: (editing) => dispatch({ type: TASK_ACTIONS.SET_EDITING_SUBTASK, payload: editing }),
    setEditSubValue: (value) => dispatch({ type: TASK_ACTIONS.SET_EDIT_SUB_VALUE, payload: value }),
    setShowAddColumn: (show) => dispatch({ type: TASK_ACTIONS.SET_SHOW_ADD_COLUMN, payload: show }),
    setShowRatingPrompt: (show) => dispatch({ type: TASK_ACTIONS.SET_SHOW_RATING_PROMPT, payload: show }),
    setSelectedProjectDialog: (project) => dispatch({ type: TASK_ACTIONS.SET_SELECTED_PROJECT_DIALOG, payload: project }),
    setShowProjectDialog: (show) => dispatch({ type: TASK_ACTIONS.SET_SHOW_PROJECT_DIALOG, payload: show }),
    setMapPicker: (open, target, coords) => dispatch({ 
      type: TASK_ACTIONS.SET_MAP_PICKER, 
      payload: { open, target, coords } 
    }),
    setGoogleMapPicker: (open) => dispatch({ type: TASK_ACTIONS.SET_GOOGLE_MAP_PICKER, payload: open }),
    setProjectStartDate: (date) => dispatch({ type: TASK_ACTIONS.SET_PROJECT_START_DATE, payload: date }),
    setArrowPos: (positions) => dispatch({ type: TASK_ACTIONS.SET_ARROW_POS, payload: positions }),
    addSubtask: (taskId, subtask) => dispatch({ 
      type: TASK_ACTIONS.ADD_SUBTASK, 
      payload: { taskId, subtask } 
    }),
    updateSubtask: (taskId, subtaskId, field, value) => dispatch({
      type: TASK_ACTIONS.UPDATE_SUBTASK,
      payload: { taskId, subtaskId, field, value }
    }),
    deleteSubtask: (taskId, subtaskId) => dispatch({
      type: TASK_ACTIONS.DELETE_SUBTASK,
      payload: { taskId, subtaskId }
    }),
    markSubtaskComplete: (taskId, subtaskId) => dispatch({
      type: TASK_ACTIONS.MARK_SUBTASK_COMPLETE,
      payload: { taskId, subtaskId }
    }),
    calculateTimelines: () => dispatch({ type: TASK_ACTIONS.CALCULATE_TIMELINES })
  };

  return (
    <TaskContext.Provider value={{ state, actions }}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use task context
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};


