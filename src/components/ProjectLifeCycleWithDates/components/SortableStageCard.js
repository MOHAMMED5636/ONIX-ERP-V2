import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  XMarkIcon,
  Bars3Icon,
  CalendarIcon,
  ArrowRightIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { formatDate, calculateProgress } from '../utils';

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

  const progress = calculateProgress(stage.startDate, stage.endDate);

  if (isMobile) {
    return (
      <div>
        {/* Unified Mobile Stage and Task Container */}
        <div 
          ref={setNodeRef}
          className="relative group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 rounded-2xl overflow-hidden"
          style={{
            backgroundColor: `${stage.color}08`,
            borderColor: `${stage.color}30`,
            boxShadow: hoveredStage === stage.id 
              ? `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px ${stage.color}20` 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
                className="flex-shrink-0 p-3 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: `${stage.color}20`,
                  color: stage.color
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
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: stage.color
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
              <h4 className="font-semibold text-gray-800 text-sm">Tasks</h4>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addTaskToStage(stage.id);
                }}
                className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20 text-gray-600 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {stage.tasks && stage.tasks.length > 0 ? (
                stage.tasks.map((task, taskIndex) => (
                  <div
                    key={taskIndex}
                    className="group/task relative px-3 py-2 rounded-lg text-sm hover:bg-white hover:bg-opacity-30 transition-colors"
                    style={{
                      backgroundColor: `${stage.color}15`,
                      color: stage.color,
                      border: `1px solid ${stage.color}30`
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
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            saveTaskEdit();
                          }}
                          className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
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
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span 
                          className="flex-1 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            startEditTask(stage.id, taskIndex, task);
                          }}
                        >
                          {task}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              startEditTask(stage.id, taskIndex, task);
                            }}
                            className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
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

        {/* Down Arrow (except for last stage) */}
        {index < totalStages - 1 && (
          <div className="flex justify-center mt-4">
            <div className="flex flex-col items-center">
              <ArrowDownIcon className="w-6 h-6 text-gray-400" />
              <div className="text-xs text-gray-500 mt-1">Next</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Unified Stage and Task Container */}
      <div 
        ref={setNodeRef}
        className="relative group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: `${stage.color}08`,
          borderColor: `${stage.color}30`,
          boxShadow: hoveredStage === stage.id 
            ? `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px ${stage.color}20` 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
              className="p-4 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: `${stage.color}20`,
                color: stage.color
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
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: stage.color
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800 text-sm">Tasks</h4>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addTaskToStage(stage.id);
              }}
              className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20 text-gray-600 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stage.tasks && stage.tasks.length > 0 ? (
              stage.tasks.map((task, taskIndex) => (
                <div
                  key={taskIndex}
                  className="group/task relative px-3 py-2 rounded-lg text-sm hover:bg-white hover:bg-opacity-30 transition-colors"
                  style={{
                    backgroundColor: `${stage.color}15`,
                    color: stage.color,
                    border: `1px solid ${stage.color}30`
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
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          saveTaskEdit();
                        }}
                        className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
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
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span 
                        className="flex-1 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startEditTask(stage.id, taskIndex, task);
                        }}
                      >
                        {task}
                      </span>
                      <div className="flex items-center space-x-1 opacity-0 group-hover/task:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            startEditTask(stage.id, taskIndex, task);
                          }}
                          className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
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

      {/* Arrow (except for last stage) */}
      {index < totalStages - 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex flex-col items-center">
            <ArrowRightIcon 
              className="w-8 h-8 text-gray-400 transition-all duration-300 group-hover:text-gray-600" 
            />
            <div className="text-xs text-gray-500 mt-1">Next</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SortableStageCard;
