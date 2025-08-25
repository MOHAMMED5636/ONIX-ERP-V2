// TaskTable component for displaying and managing tasks
import React from 'react';
import { useTaskContext } from '../context';
import { 
  getStatusColor, 
  getPriorityColor, 
  formatTimeline,
  isTaskOverdue 
} from '../utils';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  PlusIcon, 
  TrashIcon,
  CheckCircleIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import SortableSubtaskRow from './SortableSubtaskRow';

const TaskTable = ({ 
  onEditTask, 
  onDeleteTask, 
  onViewTask, 
  onAddSubtask,
  onToggleExpand,
  onMarkSubtaskComplete 
}) => {
  const { state, actions } = useTaskContext();
  const { tasks, search, editingTaskId, editingTaskName } = state;

  const handleProjectNameClick = (task) => {
    actions.setEditingTask(task.id, task.name);
  };

  const handleProjectNameDoubleClick = (task) => {
    actions.setSelectedProject(task);
  };

  const handleProjectNameChange = (e) => {
    actions.setEditSubValue(e.target.value);
  };

  const handleProjectNameBlur = (task) => {
    if (editingTaskName.trim() !== "") {
      onEditTask(task, 'name', editingTaskName);
    }
    actions.setEditingTask(null, "");
  };

  const handleProjectNameKeyDown = (e, task) => {
    if (e.key === "Enter") {
      if (editingTaskName.trim() !== "") {
        onEditTask(task, 'name', editingTaskName);
      }
      actions.setEditingTask(null, "");
    } else if (e.key === "Escape") {
      actions.setEditingTask(null, "");
    }
  };

  const renderTaskRow = (task) => (
    <React.Fragment key={task.id}>
      <tr className="hover:bg-gray-50 border-b">
        {/* Expand/Collapse */}
        <td className="px-4 py-3">
          <button
            onClick={() => onToggleExpand(task.id)}
            className="text-gray-500 hover:text-gray-700"
          >
            {task.expanded ? (
              <ChevronDownIcon className="w-5 h-5" />
            ) : (
              <ChevronRightIcon className="w-5 h-5" />
            )}
          </button>
        </td>

        {/* Project Name */}
        <td className="px-4 py-3">
          {editingTaskId === task.id ? (
            <input
              type="text"
              value={editingTaskName}
              onChange={handleProjectNameChange}
              onBlur={() => handleProjectNameBlur(task)}
              onKeyDown={(e) => handleProjectNameKeyDown(e, task)}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <div className="flex items-center space-x-2">
              <span
                onClick={() => handleProjectNameClick(task)}
                onDoubleClick={() => handleProjectNameDoubleClick(task)}
                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              >
                {task.name}
              </span>
              {isTaskOverdue(task) && (
                <span className="text-red-500 text-xs">⚠️ Overdue</span>
              )}
            </div>
          )}
        </td>

        {/* Reference Number */}
        <td className="px-4 py-3 text-sm text-gray-600">
          {task.referenceNumber}
        </td>

        {/* Category */}
        <td className="px-4 py-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {task.category}
          </span>
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </td>

        {/* Owner */}
        <td className="px-4 py-3 text-sm text-gray-600">
          {task.owner}
        </td>

        {/* Timeline */}
        <td className="px-4 py-3 text-sm text-gray-600">
          {formatTimeline(task.timeline)}
        </td>

        {/* Plan Days */}
        <td className="px-4 py-3 text-sm text-gray-600">
          {task.planDays}
        </td>

        {/* Priority */}
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </td>

        {/* Location */}
        <td className="px-4 py-3 text-sm text-gray-600">
          {task.location}
        </td>

        {/* Progress */}
        <td className="px-4 py-3">
          <div className="flex items-center">
            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${task.progress || 0}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">{task.progress || 0}%</span>
          </div>
        </td>

        {/* Rating */}
        <td className="px-4 py-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`w-4 h-4 ${
                  i < (task.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewTask(task)}
              className="text-blue-600 hover:text-blue-800 p-1"
              title="View"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAddSubtask(task.id)}
              className="text-green-600 hover:text-green-800 p-1"
              title="Add Subtask"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteTask(task.id)}
              className="text-red-600 hover:text-red-800 p-1"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* Subtasks */}
      {task.expanded && task.subtasks && task.subtasks.length > 0 && (
        <tr>
          <td colSpan="12" className="px-4 py-0">
            <div className="bg-gray-50 rounded-lg p-4 ml-8">
              <table className="w-full">
                <tbody>
                  {task.subtasks.map((subtask, subIdx) => (
                    <SortableSubtaskRow key={subtask.id} sub={subtask} subIdx={subIdx} task={task}>
                      <td className="py-2">
                        <span className="text-sm font-medium text-gray-900">
                          {subtask.name}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subtask.status)}`}>
                          {subtask.status}
                        </span>
                      </td>
                      <td className="py-2 text-sm text-gray-600">
                        {subtask.owner}
                      </td>
                      <td className="py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(subtask.priority)}`}>
                          {subtask.priority}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center">
                          <div className="w-12 bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${subtask.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{subtask.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onMarkSubtaskComplete(task.id, subtask.id)}
                            className={`p-1 rounded ${
                              subtask.status === 'done' 
                                ? 'text-green-600 bg-green-100' 
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={subtask.status === 'done' ? 'Completed' : 'Mark Complete'}
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </SortableSubtaskRow>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expand
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Project Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reference
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Owner
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timeline
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plan Days
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map(renderTaskRow)}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;



