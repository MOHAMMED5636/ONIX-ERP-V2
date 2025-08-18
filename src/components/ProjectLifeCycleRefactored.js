import React, { useState } from 'react';
import { 
  PaintBrushIcon, 
  CodeBracketIcon, 
  EyeIcon, 
  BeakerIcon, 
  CheckCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';

// Import modular components
import SortableStageCard from './ProjectLifeCycle/components/SortableStageCard';
import StageModal from './ProjectLifeCycle/components/modals/StageModal';
import DeleteConfirmationModal from './ProjectLifeCycle/components/modals/DeleteConfirmationModal';

// Import constants and utilities
import { SCROLLBAR_STYLES } from './ProjectLifeCycle/constants';

const ProjectLifeCycleRefactored = () => {
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
        'Design finalization'
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

  // Event handlers
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 relative overflow-hidden">
      {/* Custom scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: SCROLLBAR_STYLES }} />
      
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
      <StageModal
        showEditModal={showEditModal}
        showAddModal={showAddModal}
        setShowEditModal={setShowEditModal}
        setShowAddModal={setShowAddModal}
        setEditingStage={setEditingStage}
        formData={formData}
        setFormData={setFormData}
        updateTask={updateTask}
        removeTask={removeTask}
        addTask={addTask}
        handleSaveEdit={handleSaveEdit}
        handleSaveAdd={handleSaveAdd}
      />

      <DeleteConfirmationModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        deletingStage={deletingStage}
        setDeletingStage={setDeletingStage}
        handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default ProjectLifeCycleRefactored;


