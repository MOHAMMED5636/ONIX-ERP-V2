import React from 'react';
import { 
  PaintBrushIcon, 
  CodeBracketIcon, 
  EyeIcon, 
  BeakerIcon, 
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  Bars3Icon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDate, calculateStageProgress } from '../utils';

const SortableStageCard = ({ 
  stage, 
  index, 
  totalStages, 
  onEdit, 
  onDelete, 
  onStageClick, 
  hoveredStage, 
  setHoveredStage, 
  editingTask,
  editingTaskValue,
  setEditingTaskValue,
  startEditTask,
  saveTaskEdit,
  cancelTaskEdit,
  deleteTask,
  addTaskToStage,
  isMobile = false 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!stage.startDate || !stage.endDate) return 0;
    const start = new Date(stage.startDate);
    const end = new Date(stage.endDate);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  const progress = calculateProgress();

  if (isMobile) {
    return (
      <div>
        {/* Unified Mobile Stage and Task Container */}
        <div 
          ref={setNodeRef}
          className="relative group cursor-pointer transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-2 rounded-3xl overflow-hidden backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${stage.color}15 0%, ${stage.color}08 50%, ${stage.color}05 100%)`,
            borderColor: `${stage.color}40`,
            boxShadow: hoveredStage === stage.id 
              ? `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${stage.color}30, inset 0 1px 0 rgba(255, 255, 255, 0.1)` 
              : `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px ${stage.color}20`,
            ...style
          }}
          onMouseEnter={() => setHoveredStage(stage.id)}
          onMouseLeave={() => setHoveredStage(null)}
          onClick={() => onStageClick(stage)}
        >
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-3 right-3 p-2 rounded-lg hover:bg-white hover:bg-opacity-20 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-20"
          >
            <Bars3Icon className="w-5 h-5 text-gray-600" />
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 left-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(stage);
              }}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 text-blue-600 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(stage);
              }}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 text-red-600 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Stage Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center space-x-4">
              <div 
                className="flex-shrink-0 p-4 rounded-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3"
                style={{ 
                  background: `linear-gradient(135deg, ${stage.color}30 0%, ${stage.color}20 100%)`,
                  color: stage.color,
                  boxShadow: `0 8px 25px -5px ${stage.color}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                }}
              >
                <stage.icon className="w-8 h-8" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {stage.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-2">
                  {stage.description}
                </p>

                {/* Date Range */}
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <CalendarIcon className="w-3 h-3" />
                  <span>{formatDate(stage.startDate)} - {formatDate(stage.endDate)}</span>
                </div>

                {/* Progress Bar */}
                {stage.startDate && stage.endDate && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 bg-opacity-50 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-3 rounded-full transition-all duration-500 transform"
                        style={{ 
                          width: `${progress}%`,
                          background: `linear-gradient(90deg, ${stage.color} 0%, ${stage.color}CC 100%)`,
                          boxShadow: `0 0 10px ${stage.color}60`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-800 text-sm">Tasks</h4>
                <span className="text-xs text-gray-500">(Click task to edit • Scroll to see more)</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Scroll to top of task list
                    const taskContainer = e.target.closest('.task-scroll-container');
                    if (taskContainer) {
                      taskContainer.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20 text-gray-600 transition-colors"
                  title="Scroll to top"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Scroll to bottom of task list
                    const taskContainer = e.target.closest('.task-scroll-container');
                    if (taskContainer) {
                      taskContainer.scrollTo({
                        top: taskContainer.scrollHeight,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20 text-gray-600 transition-colors"
                  title="Scroll to bottom"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addTaskToStage(stage.id);
                }}
                className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20 text-gray-600 transition-colors"
                title="Add new task"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 task-scroll-container" style={{ maxHeight: '200px', minHeight: '120px', overflowY: 'auto' }}>
              {stage.tasks && stage.tasks.length > 0 ? (
                stage.tasks.map((task, taskIndex) => (
                  <div
                    key={taskIndex}
                    className={`group/task relative px-3 py-2 rounded-lg text-sm hover:bg-white hover:bg-opacity-30 transition-all duration-300 transform hover:scale-102 hover:shadow-lg ${
                      editingTask && editingTask.stageId === stage.id && editingTask.taskIndex === taskIndex 
                        ? 'ring-2 ring-blue-400 shadow-lg scale-105' 
                        : ''
                    }`}
                    style={{
                      background: editingTask && editingTask.stageId === stage.id && editingTask.taskIndex === taskIndex 
                        ? `linear-gradient(135deg, ${stage.color}30 0%, ${stage.color}20 100%)` 
                        : `linear-gradient(135deg, ${stage.color}20 0%, ${stage.color}15 100%)`,
                      color: stage.color,
                      border: `1px solid ${stage.color}40`,
                      boxShadow: `0 4px 15px -5px ${stage.color}30`
                    }}
                  >
                    {editingTask && editingTask.stageId === stage.id && editingTask.taskIndex === taskIndex ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editingTaskValue}
                          onChange={(e) => setEditingTaskValue(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          style={{ color: stage.color }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTaskEdit();
                            if (e.key === 'Escape') cancelTaskEdit();
                          }}
                          autoFocus
                          placeholder="Edit task..."
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            saveTaskEdit();
                          }}
                          className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                          title="Save changes"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            cancelTaskEdit();
                          }}
                          className="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                          title="Cancel editing"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between group/task-item">
                        <span 
                          className="flex-1 cursor-pointer hover:text-opacity-80 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Find the task container and scroll to this specific task
                            const taskElement = e.target.closest('.group\\/task');
                            const taskContainer = e.target.closest('.task-scroll-container');
                            
                            if (taskElement && taskContainer) {
                              // Calculate the position to scroll to
                              const containerRect = taskContainer.getBoundingClientRect();
                              const taskRect = taskElement.getBoundingClientRect();
                              const scrollTop = taskContainer.scrollTop;
                              const targetScrollTop = scrollTop + (taskRect.top - containerRect.top) - (containerRect.height / 2) + (taskRect.height / 2);
                              
                              // Smooth scroll to the task
                              taskContainer.scrollTo({
                                top: Math.max(0, targetScrollTop),
                                behavior: 'smooth'
                              });
                            }
                            
                            // Start editing the task
                            startEditTask(stage.id, taskIndex, task);
                          }}
                          title="Click to scroll to task and edit"
                        >
                          {task}
                        </span>
                        <div className="flex items-center space-x-1 opacity-0 group-hover/task-item:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              // Scroll to this specific task
                              const taskElement = e.target.closest('.group\\/task');
                              const taskContainer = e.target.closest('.task-scroll-container');
                              
                              if (taskElement && taskContainer) {
                                const containerRect = taskContainer.getBoundingClientRect();
                                const taskRect = taskElement.getBoundingClientRect();
                                const scrollTop = taskContainer.scrollTop;
                                const targetScrollTop = scrollTop + (taskRect.top - containerRect.top) - (containerRect.height / 2) + (taskRect.height / 2);
                                
                                taskContainer.scrollTo({
                                  top: Math.max(0, targetScrollTop),
                                  behavior: 'smooth'
                                });
                              }
                            }}
                            className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                            title="Scroll to task"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              startEditTask(stage.id, taskIndex, task);
                            }}
                            className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Edit task"
                          >
                            <PencilIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteTask(stage.id, taskIndex);
                            }}
                            className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                            title="Delete task"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm text-center py-4">
                  No tasks available
                </div>
              )}
            </div>
          </div>

          {/* Hover indicator */}
          <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${
            hoveredStage === stage.id ? 'opacity-100' : 'opacity-0'
          }`} style={{ borderColor: stage.color }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Unified Stage and Task Container */}
      <div 
        ref={setNodeRef}
        className="relative group cursor-pointer transition-all duration-500 transform hover:scale-105 hover:shadow-2xl border-2 rounded-3xl overflow-hidden backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, ${stage.color}15 0%, ${stage.color}08 50%, ${stage.color}05 100%)`,
          borderColor: `${stage.color}40`,
          boxShadow: hoveredStage === stage.id 
            ? `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${stage.color}30, inset 0 1px 0 rgba(255, 255, 255, 0.1)` 
            : `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px ${stage.color}20`,
          ...style
        }}
        onMouseEnter={() => setHoveredStage(stage.id)}
        onMouseLeave={() => setHoveredStage(null)}
        onClick={() => onStageClick(stage)}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-3 right-3 p-2 rounded-lg hover:bg-white hover:bg-opacity-20 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-20"
        >
          <Bars3Icon className="w-4 h-4 text-gray-600" />
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 left-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(stage);
            }}
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 text-blue-600 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(stage);
            }}
            className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 text-red-600 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Stage Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-center mb-4">
            <div 
              className="p-5 rounded-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3"
              style={{ 
                background: `linear-gradient(135deg, ${stage.color}30 0%, ${stage.color}20 100%)`,
                color: stage.color,
                boxShadow: `0 12px 35px -10px ${stage.color}40, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
              }}
            >
              <stage.icon className="w-10 h-10" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
            {stage.name}
          </h3>
          
          <p className="text-sm text-gray-600 text-center leading-relaxed mb-4">
            {stage.description}
          </p>

          {/* Date Range */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-3">
            <CalendarIcon className="w-4 h-4" />
            <span>{formatDate(stage.startDate)} - {formatDate(stage.endDate)}</span>
          </div>

          {/* Progress Bar */}
          {stage.startDate && stage.endDate && (
            <div className="px-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 bg-opacity-50 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-3 rounded-full transition-all duration-500 transform"
                  style={{ 
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${stage.color} 0%, ${stage.color}CC 100%)`,
                    boxShadow: `0 0 10px ${stage.color}60`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-800 text-sm">Tasks</h4>
              <span className="text-xs text-gray-500">(Click task to edit • Scroll to see more)</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Scroll to top of task list
                  const taskContainer = e.target.closest('.task-scroll-container');
                  if (taskContainer) {
                    taskContainer.scrollTo({
                      top: 0,
                      behavior: 'smooth'
                    });
                  }
                }}
                className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20 text-gray-600 transition-colors"
                title="Scroll to top"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Scroll to bottom of task list
                  const taskContainer = e.target.closest('.task-scroll-container');
                  if (taskContainer) {
                    taskContainer.scrollTo({
                      top: taskContainer.scrollHeight,
                      behavior: 'smooth'
                    });
                  }
                }}
                className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20 text-gray-600 transition-colors"
                title="Scroll to bottom"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addTaskToStage(stage.id);
              }}
              className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20 text-gray-600 transition-colors"
              title="Add new task"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 task-scroll-container" style={{ maxHeight: '200px', minHeight: '120px', overflowY: 'auto' }}>
            {stage.tasks && stage.tasks.length > 0 ? (
              stage.tasks.map((task, taskIndex) => (
                <div
                  key={taskIndex}
                  className={`group/task relative px-3 py-2 rounded-lg text-sm hover:bg-white hover:bg-opacity-30 transition-all duration-300 transform hover:scale-102 hover:shadow-lg ${
                    editingTask && editingTask.stageId === stage.id && editingTask.taskIndex === taskIndex 
                      ? 'ring-2 ring-blue-400 shadow-lg scale-105' 
                      : ''
                  }`}
                  style={{
                    background: editingTask && editingTask.stageId === stage.id && editingTask.taskIndex === taskIndex 
                      ? `linear-gradient(135deg, ${stage.color}30 0%, ${stage.color}20 100%)` 
                      : `linear-gradient(135deg, ${stage.color}20 0%, ${stage.color}15 100%)`,
                    color: stage.color,
                    border: `1px solid ${stage.color}40`,
                    boxShadow: `0 4px 15px -5px ${stage.color}30`
                  }}
                >
                  {editingTask && editingTask.stageId === stage.id && editingTask.taskIndex === taskIndex ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editingTaskValue}
                        onChange={(e) => setEditingTaskValue(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ color: stage.color }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTaskEdit();
                          if (e.key === 'Escape') cancelTaskEdit();
                        }}
                        autoFocus
                        placeholder="Edit task..."
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          saveTaskEdit();
                        }}
                        className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                        title="Save changes"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          cancelTaskEdit();
                        }}
                        className="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
                        title="Cancel editing"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group/task-item">
                      <span 
                        className="flex-1 cursor-pointer hover:text-opacity-80 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          // Find the task container and scroll to this specific task
                          const taskElement = e.target.closest('.group\\/task');
                          const taskContainer = e.target.closest('.task-scroll-container');
                          
                          if (taskElement && taskContainer) {
                            // Calculate the position to scroll to
                            const containerRect = taskContainer.getBoundingClientRect();
                            const taskRect = taskElement.getBoundingClientRect();
                            const scrollTop = taskContainer.scrollTop;
                            const targetScrollTop = scrollTop + (taskRect.top - containerRect.top) - (containerRect.height / 2) + (taskRect.height / 2);
                            
                            // Smooth scroll to the task
                            taskContainer.scrollTo({
                              top: Math.max(0, targetScrollTop),
                              behavior: 'smooth'
                            });
                          }
                          
                          // Start editing the task
                          startEditTask(stage.id, taskIndex, task);
                        }}
                        title="Click to scroll to task and edit"
                      >
                        {task}
                      </span>
                      <div className="flex items-center space-x-1 opacity-0 group-hover/task-item:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Scroll to this specific task
                            const taskElement = e.target.closest('.group\\/task');
                            const taskContainer = e.target.closest('.task-scroll-container');
                            
                            if (taskElement && taskContainer) {
                              const containerRect = taskContainer.getBoundingClientRect();
                              const taskRect = taskElement.getBoundingClientRect();
                              const scrollTop = taskContainer.scrollTop;
                              const targetScrollTop = scrollTop + (taskRect.top - containerRect.top) - (containerRect.height / 2) + (taskRect.height / 2);
                              
                              taskContainer.scrollTo({
                                top: Math.max(0, targetScrollTop),
                                behavior: 'smooth'
                              });
                            }
                          }}
                          className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                          title="Scroll to task"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            startEditTask(stage.id, taskIndex, task);
                          }}
                          className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                          title="Edit task"
                        >
                          <PencilIcon className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteTask(stage.id, taskIndex);
                          }}
                          className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                          title="Delete task"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm text-center py-4">
                No tasks available
              </div>
            )}
          </div>
        </div>

        {/* Hover indicator */}
        <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${
          hoveredStage === stage.id ? 'opacity-100' : 'opacity-0'
        }`} style={{ borderColor: stage.color }} />
      </div>
    </div>
  );
};

export default SortableStageCard;


