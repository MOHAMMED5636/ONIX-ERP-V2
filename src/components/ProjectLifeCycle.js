import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ProjectSelector from './ProjectLifeCycle/ProjectSelector';

// Custom scrollbar styles
const scrollbarStyles = `
  .task-scroll-container {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    max-height: 200px !important;
    min-height: 120px !important;
    scrollbar-width: thin;
    scrollbar-color: #94a3b8 #f1f5f9;
    position: relative;
  }
  .task-scroll-container::-webkit-scrollbar {
    width: 8px !important;
    display: block !important;
  }
  .task-scroll-container::-webkit-scrollbar-track {
    background: #f1f5f9 !important;
    border-radius: 4px !important;
    margin: 2px !important;
  }
  .task-scroll-container::-webkit-scrollbar-thumb {
    background: #64748b !important;
    border-radius: 4px !important;
    border: 1px solid #f1f5f9 !important;
    min-height: 20px !important;
  }
  .task-scroll-container::-webkit-scrollbar-thumb:hover {
    background: #475569 !important;
  }
  .task-scroll-container::-webkit-scrollbar-corner {
    background: #f1f5f9 !important;
  }
  
  /* Force scrolling for task containers */
  .task-list-container {
    max-height: 180px !important;
    overflow-y: scroll !important;
    overflow-x: hidden !important;
    scrollbar-width: thin;
    scrollbar-color: #94a3b8 #f1f5f9;
  }
  .task-list-container::-webkit-scrollbar {
    width: 6px !important;
  }
  .task-list-container::-webkit-scrollbar-track {
    background: #f8fafc !important;
    border-radius: 3px !important;
  }
  .task-list-container::-webkit-scrollbar-thumb {
    background: #cbd5e1 !important;
    border-radius: 3px !important;
  }
  .task-list-container::-webkit-scrollbar-thumb:hover {
    background: #94a3b8 !important;
  }
`;

// Separate component for sortable stage cards
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

  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    // Use system locale to match computer date style
    return date.toLocaleDateString();
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
            
                       <div 
            className="space-y-2 task-list-container" 
            style={{ 
              maxHeight: '180px', 
              minHeight: '120px', 
              overflowY: 'scroll',
              overflowX: 'hidden',
              scrollbarWidth: 'thin',
              scrollbarColor: '#94a3b8 #f1f5f9',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '8px',
              padding: '8px',
              backgroundColor: 'rgba(255,255,255,0.5)'
            }}
          >
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
          
          <div 
            className="space-y-2 task-list-container" 
            style={{ 
              maxHeight: '180px', 
              minHeight: '120px', 
              overflowY: 'scroll',
              overflowX: 'hidden',
              scrollbarWidth: 'thin',
              scrollbarColor: '#94a3b8 #f1f5f9',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '8px',
              padding: '8px',
              backgroundColor: 'rgba(255,255,255,0.5)'
            }}
          >
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

const ProjectLifeCycle = () => {
  const navigate = useNavigate();
  const [hoveredStage, setHoveredStage] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Inject scrollbar styles
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = scrollbarStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  const [stages, setStages] = useState([
    {
      id: 'design',
      name: 'Design',
      description: 'Create project specifications and visual mockups',
      icon: PaintBrushIcon,
      color: '#4A90E2',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      route: '/tasks',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      tasks: [
        'Create wireframes',
        'Design user interface',
        'Create style guide',
        'Design system components',
        'User experience mapping',
        'Prototype development',
        'Design review meeting',
        'Client feedback integration',
        'Final design approval',
        'Design handoff preparation',
        'Design system documentation',
        'Accessibility audit',
        'Responsive design testing',
        'Design quality assurance',
        'Design team collaboration',
        'Design iteration cycles',
        'User testing sessions',
        'Design optimization',
        'Brand consistency check',
        'Design finalization',
        'Wireframe validation',
        'UI component library',
        'Design system implementation',
        'User journey mapping',
        'Visual design exploration'
      ]
    },
    {
      id: 'development',
      name: 'Development',
      description: 'Build and implement the project features',
      icon: CodeBracketIcon,
      color: '#50E3C2',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      hoverColor: 'hover:bg-teal-100',
      route: '/tasks',
      startDate: '2024-02-16',
      endDate: '2024-04-15',
             tasks: [
         'Frontend development',
         'Backend API development',
         'Database setup',
         'Integration testing',
         'Performance optimization',
         'Code refactoring',
         'Security implementation',
         'Third-party integrations',
         'API documentation',
         'Development testing',
         'Code review process',
         'Unit test implementation',
         'Database optimization',
         'API versioning',
         'Development environment setup',
         'Code deployment',
         'Environment configuration',
         'Build optimization',
         'Error handling',
         'Logging implementation'
       ]
    },
    {
      id: 'review',
      name: 'Review',
      description: 'Evaluate and validate project deliverables',
      icon: EyeIcon,
      color: '#F5A623',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      hoverColor: 'hover:bg-amber-100',
      route: '/tasks',
      startDate: '2024-04-16',
      endDate: '2024-05-15',
      tasks: [
        'Code review',
        'Design review',
        'User acceptance testing',
        'Stakeholder feedback',
        'Quality assurance check'
      ]
    },
    {
      id: 'testing',
      name: 'Testing',
      description: 'Quality assurance and bug testing',
      icon: BeakerIcon,
      color: '#9013FE',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:bg-purple-100',
      route: '/tasks',
      startDate: '2024-05-16',
      endDate: '2024-06-15',
      tasks: [
        'Unit testing',
        'Integration testing',
        'System testing',
        'User acceptance testing',
        'Performance testing'
      ]
    },
    {
      id: 'handover',
      name: 'Handover',
      description: 'Deliver final project to stakeholders',
      icon: CheckCircleIcon,
      color: '#7ED321',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100',
      route: '/tasks',
      startDate: '2024-06-16',
      endDate: '2024-07-15',
      tasks: [
        'Documentation completion',
        'Training materials',
        'Deployment preparation',
        'Stakeholder handover',
        'Project closure'
      ]
    }
  ]);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [deletingStage, setDeletingStage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#4A90E2',
    startDate: '',
    endDate: '',
    tasks: []
  });

  // Task editing states
  const [editingTask, setEditingTask] = useState(null);
  const [editingTaskValue, setEditingTaskValue] = useState('');

  // Available icons for selection
  const availableIcons = [
    { name: 'PaintBrush', icon: PaintBrushIcon },
    { name: 'CodeBracket', icon: CodeBracketIcon },
    { name: 'Eye', icon: EyeIcon },
    { name: 'Beaker', icon: BeakerIcon },
    { name: 'CheckCircle', icon: CheckCircleIcon },
  ];

  // Color options
  const colorOptions = [
    { name: 'Blue', value: '#4A90E2', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', hoverColor: 'hover:bg-blue-100' },
    { name: 'Teal', value: '#50E3C2', bgColor: 'bg-teal-50', borderColor: 'border-teal-200', hoverColor: 'hover:bg-teal-100' },
    { name: 'Amber', value: '#F5A623', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', hoverColor: 'hover:bg-amber-100' },
    { name: 'Purple', value: '#9013FE', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', hoverColor: 'hover:bg-purple-100' },
    { name: 'Green', value: '#7ED321', bgColor: 'bg-green-50', borderColor: 'border-green-200', hoverColor: 'hover:bg-green-100' },
    { name: 'Red', value: '#E53E3E', bgColor: 'bg-red-50', borderColor: 'border-red-200', hoverColor: 'hover:bg-red-100' },
    { name: 'Pink', value: '#EC4899', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', hoverColor: 'hover:bg-pink-100' },
    { name: 'Indigo', value: '#6366F1', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', hoverColor: 'hover:bg-indigo-100' },
  ];

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleStageClick = (stage) => {
    console.log('Stage clicked:', stage.name);
    // Open edit modal instead of navigating
    handleEdit(stage);
  };

  const handleEdit = (stage) => {
    console.log('Edit clicked for stage:', stage.name);
    setEditingStage(stage);
    setFormData({
      name: stage.name,
      description: stage.description,
      color: stage.color,
      startDate: stage.startDate || '',
      endDate: stage.endDate || '',
      tasks: stage.tasks || []
    });
    setShowEditModal(true);
    setShowAddModal(false);
    setShowDeleteModal(false);
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      description: '',
      color: '#4A90E2',
      startDate: '',
      endDate: '',
      tasks: []
    });
    setShowAddModal(true);
  };

  const handleDelete = (stage) => {
    setDeletingStage(stage);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = () => {
    if (!formData.name.trim() || !formData.description.trim()) return;

    const selectedColor = colorOptions.find(c => c.value === formData.color);
    
    setStages(prev => prev.map(stage => 
      stage.id === editingStage.id 
        ? {
            ...stage,
            name: formData.name,
            description: formData.description,
            color: formData.color,
            startDate: formData.startDate,
            endDate: formData.endDate,
            bgColor: selectedColor.bgColor,
            borderColor: selectedColor.borderColor,
            hoverColor: selectedColor.hoverColor,
            tasks: formData.tasks
          }
        : stage
    ));
    
    setShowEditModal(false);
    setEditingStage(null);
  };

  const handleSaveAdd = () => {
    if (!formData.name.trim() || !formData.description.trim()) return;

    const selectedColor = colorOptions.find(c => c.value === formData.color);
    const selectedIcon = availableIcons[0];
    
    const newStage = {
      id: `stage-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      icon: selectedIcon.icon,
      color: formData.color,
      startDate: formData.startDate,
      endDate: formData.endDate,
      bgColor: selectedColor.bgColor,
      borderColor: selectedColor.borderColor,
      hoverColor: selectedColor.hoverColor,
      route: '/tasks',
      tasks: formData.tasks
    };

    setStages(prev => [...prev, newStage]);
    setShowAddModal(false);
  };

  const handleConfirmDelete = () => {
    setStages(prev => prev.filter(stage => stage.id !== deletingStage.id));
    setShowDeleteModal(false);
    setDeletingStage(null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    // Check if both active and over exist and are valid
    if (!active || !over || !active.id || !over.id) {
      return;
    }

    if (active.id !== over.id) {
      setStages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        // Check if both indices are valid
        if (oldIndex === -1 || newIndex === -1) {
          return items;
        }
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, '']
    }));
  };

  const removeTask = (index) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const updateTask = (index, value) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => i === index ? value : task)
    }));
  };

  const startEditTask = (stageId, taskIndex, taskValue) => {
    setEditingTask({ stageId, taskIndex });
    setEditingTaskValue(taskValue);
  };

  const saveTaskEdit = () => {
    if (!editingTask || !editingTaskValue.trim()) return;

    setStages(prev => prev.map(stage => 
      stage.id === editingTask.stageId 
        ? {
            ...stage,
            tasks: stage.tasks.map((task, index) => 
              index === editingTask.taskIndex ? editingTaskValue.trim() : task
            )
          }
        : stage
    ));

    setEditingTask(null);
    setEditingTaskValue('');
  };

  const cancelTaskEdit = () => {
    setEditingTask(null);
    setEditingTaskValue('');
  };

  const deleteTask = (stageId, taskIndex) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? {
            ...stage,
            tasks: stage.tasks.filter((_, index) => index !== taskIndex)
          }
        : stage
    ));
  };

  const addTaskToStage = (stageId) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? {
            ...stage,
            tasks: [...stage.tasks, 'New Task']
          }
        : stage
    ));
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    // You can add logic here to filter stages based on selected project
    // For now, we'll just update the selected project
  };

  const renderModal = () => {
    console.log('Modal states:', { showEditModal, showAddModal, showDeleteModal });
    if (showEditModal || showAddModal) {
      return (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
               <div className="flex items-center justify-between">
                 <h3 className="text-lg font-bold text-gray-900">
                   {showEditModal ? 'Edit Stage' : 'Add New Stage'}
                 </h3>
                 <button
                   onClick={() => {
                     setShowEditModal(false);
                     setShowAddModal(false);
                     setEditingStage(null);
                   }}
                   className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                 >
                   <XMarkIcon className="w-6 h-6" />
                 </button>
               </div>
             </div>
             <div className="p-6">

                         <div className="space-y-3">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Stage Name
                 </label>
                 <input
                   type="text"
                   value={formData.name}
                   onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="Enter stage name"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Description
                 </label>
                 <textarea
                   value={formData.description}
                   onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   rows={2}
                   placeholder="Enter stage description"
                 />
               </div>

                             {/* Date Range Fields */}
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Start Date
                   </label>
                   <input
                     type="date"
                     value={formData.startDate}
                     onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     End Date
                   </label>
                   <input
                     type="date"
                     value={formData.endDate}
                     onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Color Theme
                 </label>
                 <div className="grid grid-cols-4 gap-2">
                   {colorOptions.map((color) => (
                     <button
                       key={color.value}
                       onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                       className={`p-2 rounded-lg border-2 transition-all ${
                         formData.color === color.value 
                           ? 'border-gray-400 scale-105' 
                           : 'border-gray-200 hover:border-gray-300'
                       }`}
                       style={{ backgroundColor: color.value }}
                     >
                       <div className="w-full h-1 bg-white rounded opacity-80"></div>
                     </button>
                   ))}
                 </div>
               </div>

                             <div>
                 <div className="flex items-center justify-between mb-2">
                   <label className="block text-sm font-medium text-gray-700">
                     Tasks
                   </label>
                   <span className="text-xs text-gray-500">({formData.tasks.length} tasks)</span>
                 </div>
                 <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                   {formData.tasks.map((task, index) => (
                     <div key={index} className="flex items-center space-x-2">
                       <input
                         type="text"
                         value={task}
                         onChange={(e) => updateTask(index, e.target.value)}
                         className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         placeholder={`Task ${index + 1}`}
                       />
                       <button
                         onClick={() => removeTask(index)}
                         className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                         title="Remove task"
                       >
                         <XMarkIcon className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                   <button
                     onClick={addTask}
                     className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors text-sm"
                   >
                     <PlusIcon className="w-4 h-4 inline mr-2" />
                     Add Task
                   </button>
                 </div>
               </div>
            </div>

                         <div className="flex justify-end space-x-3 mt-6">
               <button
                 onClick={() => {
                   setShowEditModal(false);
                   setShowAddModal(false);
                   setEditingStage(null);
                 }}
                 className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
               >
                 Cancel
               </button>
               <button
                 onClick={showEditModal ? handleSaveEdit : handleSaveAdd}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 {showEditModal ? 'Update Stage' : 'Add Stage'}
               </button>
             </div>
           </div>
         </div>
       </div>
      );
    }

         if (showDeleteModal) {
       return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
               <div className="flex items-center justify-between">
                 <h3 className="text-lg font-bold text-gray-900">
                   Delete Stage
                 </h3>
                 <button
                   onClick={() => {
                     setShowDeleteModal(false);
                     setDeletingStage(null);
                   }}
                   className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                 >
                   <XMarkIcon className="w-6 h-6" />
                 </button>
               </div>
             </div>
             <div className="p-6">
               <div className="text-center">
                 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                   <TrashIcon className="h-6 w-6 text-red-600" />
                 </div>
                 <p className="text-sm text-gray-500 mb-6">
                   Are you sure you want to delete "{deletingStage?.name}"? This action cannot be undone.
                 </p>
               </div>

               <div className="flex justify-end space-x-3">
                 <button
                   onClick={() => {
                     setShowDeleteModal(false);
                     setDeletingStage(null);
                   }}
                   className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleConfirmDelete}
                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                 >
                   Delete
                 </button>
               </div>
             </div>
           </div>
         </div>
       );
     }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 relative overflow-hidden">
      {/* Custom scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl">
            <CodeBracketIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent mb-6">
            Project Management Life Cycle
          </h1>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto mb-8 leading-relaxed">
            Visualize and navigate through the complete project lifecycle stages with timeline tracking. 
            Click on any stage to view related projects and tasks.
          </p>
          
          {/* Project Selector */}
          <div className="max-w-md mx-auto mb-8">
            <ProjectSelector 
              selectedProject={selectedProject}
              onProjectSelect={handleProjectSelect}
            />
          </div>

          {/* Selected Project Info */}
          {selectedProject && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: selectedProject.color }}
                    ></div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedProject.name}</h3>
                      <p className="text-gray-600">{selectedProject.referenceNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Progress</div>
                    <div className="text-2xl font-bold text-gray-900">{selectedProject.progress}%</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${selectedProject.progress}%`,
                        backgroundColor: selectedProject.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Add Stage Button */}
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
          >
            <PlusIcon className="w-6 h-6 mr-3" />
            Add New Stage
          </button>
        </div>

        {/* Desktop Layout - Unified Stage and Task Containers */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={stages.map(s => s.id)} strategy={horizontalListSortingStrategy}>
            <div className="hidden lg:grid grid-cols-5 gap-8 mb-8">
              {stages.map((stage, index) => (
                <SortableStageCard
                  key={stage.id}
                  stage={stage}
                  index={index}
                  totalStages={stages.length}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStageClick={handleStageClick}
                  hoveredStage={hoveredStage}
                  setHoveredStage={setHoveredStage}
                  editingTask={editingTask}
                  editingTaskValue={editingTaskValue}
                  setEditingTaskValue={setEditingTaskValue}
                  startEditTask={startEditTask}
                  saveTaskEdit={saveTaskEdit}
                  cancelTaskEdit={cancelTaskEdit}
                  deleteTask={deleteTask}
                  addTaskToStage={addTaskToStage}
                  isMobile={false}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Mobile Layout - Unified Stage and Task Containers */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={stages.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="lg:hidden space-y-6">
              {stages.map((stage, index) => (
                <SortableStageCard
                  key={stage.id}
                  stage={stage}
                  index={index}
                  totalStages={stages.length}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStageClick={handleStageClick}
                  hoveredStage={hoveredStage}
                  setHoveredStage={setHoveredStage}
                  editingTask={editingTask}
                  editingTaskValue={editingTaskValue}
                  setEditingTaskValue={setEditingTaskValue}
                  startEditTask={startEditTask}
                  saveTaskEdit={saveTaskEdit}
                  cancelTaskEdit={cancelTaskEdit}
                  deleteTask={deleteTask}
                  addTaskToStage={addTaskToStage}
                  isMobile={true}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/tasks')}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
          >
            <CodeBracketIcon className="w-6 h-6 mr-3" />
            View All Projects
          </button>
        </div>
      </div>

      {/* Modals */}
      {renderModal()}
    </div>
  );
};

export default ProjectLifeCycle; 