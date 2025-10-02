import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { PlusIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import ProjectSelector from './ProjectLifeCycle/ProjectSelector';

// Import modular components and utilities
import {
  SortableStageCard,
  StageModal,
  DeleteConfirmationModal,
  initialStages,
  availableIcons,
  defaultFormData,
  generateId,
  validateStage,
  createNewStage,
  updateStageTasks,
  deleteTaskFromStage,
  addTaskToStage,
  resetFormData
} from './ProjectLifeCycleWithDates';

const ProjectLifeCycleWithDatesRefactored = () => {
  const navigate = useNavigate();
  const [hoveredStage, setHoveredStage] = useState(null);
  const [stages, setStages] = useState(initialStages);
  const [selectedProject, setSelectedProject] = useState(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [deletingStage, setDeletingStage] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);

  // Task editing states
  const [editingTask, setEditingTask] = useState(null);
  const [editingTaskValue, setEditingTaskValue] = useState('');

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleStageClick = (stage) => {
    navigate(stage.route);
  };

  const handleAdd = () => {
    setFormData(resetFormData());
    setShowAddModal(true);
  };

  const handleEdit = (stage) => {
    setEditingStage(stage);
    setFormData({
      name: stage.name,
      description: stage.description,
      color: stage.color,
      startDate: stage.startDate,
      endDate: stage.endDate,
      tasks: [...stage.tasks]
    });
    setShowEditModal(true);
  };

  const handleDelete = (stage) => {
    setDeletingStage(stage);
    setShowDeleteModal(true);
  };

  const handleSaveAdd = () => {
    const errors = validateStage(formData);
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    const selectedIcon = availableIcons.find(icon => icon.name === 'PaintBrush')?.icon;
    const newStage = createNewStage(formData, selectedIcon);
    
    setStages(prev => [...prev, newStage]);
    setShowAddModal(false);
    setFormData(resetFormData());
  };

  const handleSaveEdit = () => {
    const errors = validateStage(formData);
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    setStages(prev => prev.map(stage => 
      stage.id === editingStage.id 
        ? {
            ...stage,
            name: formData.name,
            description: formData.description,
            color: formData.color,
            startDate: formData.startDate,
            endDate: formData.endDate,
            tasks: formData.tasks.filter(task => task.trim() !== '')
          }
        : stage
    ));

    setShowEditModal(false);
    setEditingStage(null);
    setFormData(resetFormData());
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

    setStages(prev => updateStageTasks(prev, editingTask.stageId, editingTask.taskIndex, editingTaskValue.trim()));
    setEditingTask(null);
    setEditingTaskValue('');
  };

  const cancelTaskEdit = () => {
    setEditingTask(null);
    setEditingTaskValue('');
  };

  const deleteTask = (stageId, taskIndex) => {
    setStages(prev => deleteTaskFromStage(prev, stageId, taskIndex));
  };

  const addTaskToStageHandler = (stageId) => {
    setStages(prev => addTaskToStage(prev, stageId));
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    // You can add logic here to filter stages based on selected project
    // For now, we'll just update the selected project
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Project Management Life Cycle
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
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
                  addTaskToStage={addTaskToStageHandler}
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
                  addTaskToStage={addTaskToStageHandler}
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
      <StageModal
        showEditModal={showEditModal}
        showAddModal={showAddModal}
        formData={formData}
        setFormData={setFormData}
        onClose={() => {
          setShowEditModal(false);
          setShowAddModal(false);
          setEditingStage(null);
        }}
        onSave={showEditModal ? handleSaveEdit : handleSaveAdd}
        updateTask={updateTask}
        removeTask={removeTask}
        addTask={addTask}
      />

      <DeleteConfirmationModal
        showDeleteModal={showDeleteModal}
        deletingStage={deletingStage}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingStage(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ProjectLifeCycleWithDatesRefactored;
