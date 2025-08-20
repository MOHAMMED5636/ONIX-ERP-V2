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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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

const ProjectLifeCycleWithDates = () => {
  const navigate = useNavigate();
  const [hoveredStage, setHoveredStage] = useState(null);
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
        'User experience mapping'
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
        'Performance optimization'
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
    navigate(stage.route, { 
      state: { 
        filterStage: stage.id,
        stageName: stage.name 
      } 
    });
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

    if (active.id !== over.id) {
      setStages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
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

  const renderModal = () => {
    console.log('Modal states:', { showEditModal, showAddModal, showDeleteModal });
    if (showEditModal || showAddModal) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {showEditModal ? 'Edit Stage' : 'Add New Stage'}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setShowAddModal(false);
                  setEditingStage(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter stage description"
                />
              </div>

              {/* Date Range Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.color === color.value 
                          ? 'border-gray-400 scale-110' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      <div className="w-full h-2 bg-white rounded opacity-80"></div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tasks
                </label>
                <div className="space-y-2">
                  {formData.tasks.map((task, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={task}
                        onChange={(e) => updateTask(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Task ${index + 1}`}
                      />
                      <button
                        onClick={() => removeTask(index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addTask}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
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
      );
    }

    if (showDeleteModal) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Stage
              </h3>
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
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Project Management Life Cycle
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Visualize and navigate through the complete project lifecycle stages with timeline tracking. 
            Click on any stage to view related projects and tasks.
          </p>
          
          {/* Add Stage Button */}
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
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
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/tasks')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <CodeBracketIcon className="w-5 h-5 mr-2" />
            View All Projects
          </button>
        </div>
      </div>

      {/* Modals */}
      {renderModal()}
    </div>
  );
};

export default ProjectLifeCycleWithDates; 