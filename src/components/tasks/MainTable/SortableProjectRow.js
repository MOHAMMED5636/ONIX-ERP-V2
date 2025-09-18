import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon } from '@heroicons/react/24/outline';
import ProjectRow from './ProjectRow';

const SortableProjectRow = ({
  task,
  columnOrder,
  columns,
  expandedActive,
  editingTaskId,
  editingTaskName,
  onToggleExpand,
  onProjectNameClick,
  onProjectNameDoubleClick,
  onOpenTaskDrawer,
  onProjectNameChange,
  onProjectNameBlur,
  onProjectNameKeyDown,
  onEdit,
  onDelete,
  onShowAddColumnMenu,
  onTogglePin,
  onAddSubtask,
  onEditTask,
  onDeleteTask,
  onCopyTask,
  isSelected,
  onToggleSelection,
  showSubtaskForm,
  setShowSubtaskForm,
  newSubtask,
  setNewSubtask,
  handleSubtaskKeyDown,
  onOpenAttachmentsModal,
  onOpenChat
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    cursor: isDragging ? 'grabbing' : 'default',
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'shadow-2xl' : ''} transition-all duration-200`}
    >
      {/* Drag Handle Column */}
      <td className="px-2 py-3 align-middle text-center w-16">
        <button
          {...attributes}
          {...listeners}
          className="w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 flex items-center justify-center border border-gray-200 hover:border-gray-300"
          title="Drag to reorder project"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
      </td>
      
      {/* Project Row Content */}
      <td colSpan={columnOrder.length + 2} className="p-0">
        <ProjectRow
          task={task}
          columnOrder={columnOrder}
          columns={columns}
          expandedActive={expandedActive}
          editingTaskId={editingTaskId}
          editingTaskName={editingTaskName}
          onToggleExpand={onToggleExpand}
          onProjectNameClick={onProjectNameClick}
          onProjectNameDoubleClick={onProjectNameDoubleClick}
          onOpenTaskDrawer={onOpenTaskDrawer}
          onProjectNameChange={onProjectNameChange}
          onProjectNameBlur={onProjectNameBlur}
          onProjectNameKeyDown={onProjectNameKeyDown}
          onEdit={onEdit}
          onDelete={onDelete}
          onShowAddColumnMenu={onShowAddColumnMenu}
          onTogglePin={onTogglePin}
          onAddSubtask={onAddSubtask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onCopyTask={onCopyTask}
          isSelected={isSelected}
          onToggleSelection={onToggleSelection}
          showSubtaskForm={showSubtaskForm}
          setShowSubtaskForm={setShowSubtaskForm}
          newSubtask={newSubtask}
          setNewSubtask={setNewSubtask}
          handleSubtaskKeyDown={handleSubtaskKeyDown}
          onOpenAttachmentsModal={onOpenAttachmentsModal}
          onOpenChat={onOpenChat}
        />
      </td>
    </tr>
  );
};

export default SortableProjectRow;
