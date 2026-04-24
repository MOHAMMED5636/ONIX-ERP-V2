import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon, ChevronDownIcon, ChevronRightIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import MultiSelectCheckbox from './MultiSelectCheckbox';
import CellRenderer from './CellRenderer';
import { getSubtaskColumnOrder, getHierarchicalAutoNumber, calculateTotalPlanDaysFromSubtasks, calculateAggregateRatingFromSubtasks, getDeadlineClass } from '../utils/tableUtils';
import { getTaskCategories } from '../modular/constants';
import { useAuth } from '../../../contexts/AuthContext';

const SortableProjectRow = ({
  task,
  projectIndex = 0,
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
  onOpenChat,
  onTenderClick,
  visibleColumns,
  onToggleColumn,
  onResetColumns,
  onOpenQuestionnaireModal,
  onOpenQuestionnaireResponseModal
}) => {
  const { user } = useAuth();
  const isManager = ['ADMIN', 'PROJECT_MANAGER', 'HR'].includes(user?.role);
  const isEmployee = user?.role === 'EMPLOYEE';
  
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

  // Helper renderers for Monday.com style columns. When isEmployeeParam is true, project row is read-only (employee can only edit subtasks/child tasks).
  const renderMainCell = (col, row, onEdit, isEmployeeParam) => {
    const readOnly = !!isEmployeeParam;
    const inputClass = readOnly ? 'bg-gray-100 cursor-not-allowed' : '';
    switch (col.key) {
      case "checkbox":
        return (
          <div className="flex items-center justify-center bg-yellow-100 p-1 rounded">
            <span className="text-xs">✓</span>
          </div>
        );
      case "task":
        return (
          <input
            className={`border rounded px-2 py-1 text-sm font-bold text-gray-900 ${inputClass}`}
            value={row.name}
            onChange={e => !readOnly && onEdit("name", e.target.value)}
            readOnly={readOnly}
            disabled={readOnly}
          />
        );
      case "referenceNumber":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full bg-gray-100 cursor-not-allowed"
            value={row.referenceNumber || ""}
            readOnly={true}
            disabled={true}
            title="Reference number is not editable"
          />
        );
      case "client":
        return (
          <span className="px-2 py-1 text-sm w-full block">
            {row.client || "—"}
          </span>
        );
      case "category": {
        const catOpts = getTaskCategories();
        const val = row.category || catOpts[0] || "Design";
        return (
          <select
            className={`border rounded px-2 py-1 text-sm ${inputClass}`}
            value={val}
            onChange={e => !readOnly && onEdit("category", e.target.value)}
            disabled={readOnly}
          >
            {catOpts.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      }
      case "status":
        const statusColors = {
          done: "bg-green-500 text-white",
          working: "bg-yellow-500 text-white",
          stuck: "bg-red-500 text-white",
          "not started": "bg-gray-400 text-white"
        };
        return (
          <select
            className={`border rounded px-2 py-1 text-xs font-bold ${statusColors[row.status] || 'bg-gray-200 text-gray-700'} ${inputClass}`}
            value={row.status}
            onChange={e => !readOnly && onEdit("status", e.target.value)}
            disabled={readOnly}
          >
             <option value="done">Done</option>
             <option value="suspended">Suspended</option>
             <option value="cancelled">Cancelled</option>
             <option value="in progress">In Progress</option>
            <option value="pending">Pending</option>
          </select>
        );
      case "owner":
        // Display project manager name as read-only text input
        return (
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm w-full bg-gray-100 cursor-not-allowed"
            value={row.owner || ""}
            readOnly={true}
            disabled={true}
            placeholder="Project manager name"
            title="Project manager name is not editable"
          />
        );
      case "timeline": {
        const startDate = row.start || (row.timeline && row.timeline[0]);
        const endDate = row.end || (row.timeline && row.timeline[1]);
        const deadlineBorder = getDeadlineClass(startDate, endDate, row.status);
        return (
          <div className="relative inline-block">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition ${deadlineBorder} ${readOnly ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
              {startDate && endDate
                ? `${new Date(startDate).toLocaleDateString()} – ${new Date(endDate).toLocaleDateString()}`
                : 'Set dates'}
            </span>
          </div>
        );
      }
      case "planDays":
        // Calculate total plan days from all subtasks and child subtasks
        const totalPlanDays = calculateTotalPlanDaysFromSubtasks(row);
        const displayValue = totalPlanDays > 0 ? totalPlanDays : (row.planDays || 0);
        return (
          <input
            type="number"
            min={0}
            className="border rounded px-2 py-1 text-sm w-20 text-center bg-gray-100 cursor-not-allowed"
            value={displayValue}
            readOnly={true}
            disabled={true}
            placeholder="Plan days"
            title={`Total plan days from subtasks: ${totalPlanDays > 0 ? totalPlanDays : 'No subtasks'}`}
          />
        );
      case "remarks":
        return (
          <input
            className={`border rounded px-2 py-1 text-sm w-full ${inputClass}`}
            value={row.remarks || ""}
            onChange={e => !readOnly && onEdit("remarks", e.target.value)}
            placeholder="Enter remarks"
            readOnly={readOnly}
            disabled={readOnly}
          />
        );
      case "assigneeNotes":
        return (
          <input
            className={`border rounded px-2 py-1 text-sm w-full ${inputClass}`}
            value={row.assigneeNotes || ""}
            onChange={e => !readOnly && onEdit("assigneeNotes", e.target.value)}
            placeholder="Enter assignee notes"
            readOnly={readOnly}
            disabled={readOnly}
          />
        );
      case "attachments":
        return (
          <div>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onEdit("openAttachmentsModal", true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${readOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              📎 {row.attachments && row.attachments.length > 0 
                ? `${row.attachments.length} file(s)` 
                : 'Add files'
              }
            </button>
          </div>
        );
      case "priority":
        return (
          <select
            className={`border rounded px-2 py-1 text-xs font-bold ${inputClass}`}
            value={row.priority}
            onChange={e => !readOnly && onEdit("priority", e.target.value)}
            disabled={readOnly}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        );
      case "location":
        return (
          <div className="flex items-center gap-1">
            <input
              className="border rounded px-2 py-1 text-sm bg-gray-100 cursor-not-allowed"
              value={row.location || ""}
              readOnly={true}
              disabled={true}
              placeholder="Location"
              title="Location is not editable"
            />
            <button type="button" title="Pick on map" disabled className="opacity-50 cursor-not-allowed">
              📍
            </button>
          </div>
        );
      case "plotNumber":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full bg-gray-50 cursor-not-allowed"
            value={row.plotNumber || ""}
            readOnly
            placeholder="—"
          />
        );
      case "community":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full bg-gray-100 cursor-not-allowed"
            value={row.community || ""}
            readOnly={true}
            disabled={true}
            placeholder="Community"
            title="Community is not editable"
          />
        );
      case "projectType":
        return (
          <select
            className="border rounded px-2 py-1 text-sm bg-gray-100 cursor-not-allowed"
            value={row.projectType || "Residential"}
            readOnly={true}
            disabled={true}
            title="Project type is not editable"
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Mixed Use">Mixed Use</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>
        );
      case "projectFloor":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full bg-gray-100 cursor-not-allowed"
            value={row.projectFloor || ""}
            readOnly={true}
            disabled={true}
            placeholder="No. of floors"
            title="No. of floors is not editable"
          />
        );
      case "developerProject":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full bg-gray-100 cursor-not-allowed"
            value={row.developerProject || ""}
            readOnly={true}
            disabled={true}
            placeholder="Developer name"
            title="Developer name is not editable"
          />
        );
      case "rating": {
        // Parent task rating = aggregate (average) of all subtask + child task ratings, shown as stars (read-only)
        const displayRating = calculateAggregateRatingFromSubtasks(row);
        return (
          <span className="flex items-center gap-1" title="Total of subtasks and child tasks">
            {[1, 2, 3, 4, 5].map(i => (
              <svg
                key={i}
                className={`w-5 h-5 transition ${i <= displayRating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill={i <= displayRating ? '#facc15' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            ))}
          </span>
        );
      }
      case "progress":
        return (
          <div className="flex flex-col items-center">
            <div className="w-24 h-2 bg-gray-200 rounded relative overflow-hidden mb-1">
              <div
                className="h-2 rounded bg-blue-500 transition-all duration-500"
                style={{ width: `${row.progress}%` }}
              ></div>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-gray-700">{row.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={row.progress}
              onChange={e => !readOnly && onEdit("progress", Number(e.target.value))}
              className="w-24"
              disabled={readOnly}
            />
          </div>
        );
      case "color":
        return (
          <label className={`inline-flex items-center gap-2 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
            <span className="inline-block w-6 h-6 rounded-full border-2 border-gray-200" style={{ background: row.color }}></span>
            <input
              type="color"
              value={row.color}
              onChange={e => !readOnly && onEdit("color", e.target.value)}
              className="w-6 h-6 p-0 border-0 bg-transparent"
              style={{ visibility: 'hidden', position: 'absolute' }}
              disabled={readOnly}
            />
            <span className="text-xs text-gray-500">{row.color}</span>
          </label>
        );
      case "delete":
        return (
          <button
            className={`p-1 rounded transition ${readOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100'}`}
            onClick={() => !readOnly && onDelete(task.id)}
            title={readOnly ? 'You can only edit subtasks and child tasks' : 'Delete'}
            disabled={readOnly}
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        );
      case "autoNumber":
        return <span className="text-sm text-gray-600 font-medium">{getHierarchicalAutoNumber(projectIndex, null, null)}</span>;
      case "predecessors":
        const predecessorsHasValue = row.predecessors && row.predecessors.toString().trim() !== '';
        return (
          <div className="relative">
            <input
              className={`border rounded px-2 py-1 text-sm pr-6 w-full ${predecessorsHasValue ? 'border-green-300 bg-green-50' : ''} ${inputClass}`}
              value={row.predecessors || ""}
              onChange={e => !readOnly && onEdit("predecessors", e.target.value)}
              placeholder="Enter task IDs (e.g., 1, 2, 3)"
              readOnly={readOnly}
              disabled={readOnly}
            />
            {predecessorsHasValue && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600">🔗</span>
            )}
          </div>
        );
      case "checklist":
        // Checklist is now only for sub-tasks, not for tasks
        // Return empty or disabled state for task level
        return (
          <div className="text-xs text-gray-400 italic">
            Use sub-task checklist
          </div>
        );
      case "link":
        return (
          <input
            className={`border rounded px-2 py-1 text-sm w-full ${inputClass}`}
            value={row.link || ""}
            onChange={e => !readOnly && onEdit("link", e.target.value)}
            placeholder="Enter link"
            readOnly={readOnly}
            disabled={readOnly}
          />
        );
      default:
        return row[col.key] || '';
    }
  };

  // Deadline styling: red left border if overdue, orange if due today (only when not finished)
  const taskStart = task.start || (task.timeline && task.timeline[0]);
  const taskEnd = task.end || (task.timeline && task.timeline[1]);
  const deadlineClass = getDeadlineClass(taskStart, taskEnd, task.status);
  const rowBorderClass = deadlineClass ? (deadlineClass.includes('red') ? 'border-l-4 border-red-500' : 'border-l-4 border-orange-400') : '';

  return (
    <>
    <tr
      ref={setNodeRef}
      style={style}
      className={`bg-white ${isDragging ? 'shadow-2xl' : ''} transition-all duration-200 hover:bg-gray-50/50 ${rowBorderClass}`}
    >
      {/* Drag Handle Column */}
      <td className="px-2 py-3 align-middle text-center w-16 border border-gray-200">
        <button
          {...attributes}
          {...listeners}
          className="w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 flex items-center justify-center border border-gray-200 hover:border-gray-300"
          title="Drag to reorder project"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
      </td>
      
      {/* Select Column */}
      <td className="px-4 py-3 align-middle text-center border border-gray-200">
        <MultiSelectCheckbox
          task={task}
          isChecked={isSelected}
          onToggle={onToggleSelection}
        />
      </td>
      
      {/* Pin Column */}
      <td className="px-4 py-3 align-middle text-center border border-gray-200">
        <button
          onClick={() => !isEmployee && onTogglePin(task.id)}
          disabled={isEmployee}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
            isEmployee ? 'opacity-50 cursor-not-allowed bg-gray-100' : task.pinned 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
          }`}
          title={isEmployee ? "You can only edit subtasks and child tasks" : (task.pinned ? "Unpin task" : "Pin task")}
        >
          📌
        </button>
      </td>
      
      {/* Data Columns */}
      {columnOrder
        .filter(key => key !== 'category' && visibleColumns.includes(key))
        .map((colKey, idx) => {
          const col = columns.find(c => c.key === colKey);
          if (!col) return null;
          return (
            <td key={col.key} className={`px-3 py-3 align-middle border border-gray-200 ${
              col.key === 'referenceNumber' ? 'w-32 min-w-32' : ''
            } ${
              col.key === 'remarks' || col.key === 'assigneeNotes' ? 'w-48 min-w-48' : ''
            } ${
              col.key === 'plotNumber' || col.key === 'community' || col.key === 'projectType' ? 'w-40 min-w-40' : ''
            } ${
              col.key === 'projectFloor' || col.key === 'developerProject' ? 'w-40 min-w-40' : ''
            } ${
              col.key === 'owner' ? 'w-36 min-w-36' : ''
            }`} style={{ overflow: 'visible' }}>
              {col.key === 'task' ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleExpand(task.id, 'active')}
                      className="focus:outline-none p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                      title={expandedActive[task.id] ? 'Collapse' : 'Expand'}
                    >
                      {expandedActive[task.id] ? 
                        <ChevronDownIcon className="w-5 h-5 text-gray-500" /> : 
                        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                      }
                    </button>
                    {editingTaskId === task.id && !isEmployee ? (
                      <input
                        type="text"
                        value={editingTaskName}
                        autoFocus
                        onChange={onProjectNameChange}
                        onBlur={() => onProjectNameBlur(task)}
                        onKeyDown={e => onProjectNameKeyDown(e, task)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-blue-700 focus:outline-none transition-all duration-200 ${isEmployee ? 'cursor-default no-underline' : 'hover:text-blue-800 hover:underline cursor-pointer'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTaskDrawer(task);
                          }}
                          onDoubleClick={() => !isEmployee && onProjectNameDoubleClick(task)}
                          title={isEmployee ? 'Project is read-only. You can only edit subtasks and child tasks assigned to you.' : undefined}
                        >
                          {task.name}
                        </span>
                        <button
                          onClick={() => onOpenChat && onOpenChat(task, 'project')}
                          className="p-1 rounded-full hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
                          title="Open Chat"
                        >
                          💬
                        </button>
                        {onTenderClick && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTenderClick(task);
                            }}
                            className="px-2 py-1 text-xs rounded bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-1 shadow-sm hover:shadow-md"
                            title="Go to Tender Section"
                          >
                            <ClipboardDocumentListIcon className="w-3 h-3" />
                            Tender
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {!isEmployee && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowSubtaskForm(task.id)}
                        className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 w-fit"
                        title="Add Task"
                      >
                        + Add Task
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                renderMainCell(col, task, (field, value) => {
                  if (col.key === 'delete') onDelete(task.id);
                  else onEdit(task, field, value);
                }, isEmployee, onEditTask, onDeleteTask, onCopyTask)
              )}
            </td>
          );
        })}
      
      {/* Empty cell to align with header Column Settings */}
      <td className="px-3 py-3 text-center border border-gray-200 min-w-[3.5rem] w-14" />
    </tr>
    
    {/* Add Subtask Button and Form */}
    {showSubtaskForm === task.id && (
      <tr className="bg-blue-50/30">
        <td colSpan={columnOrder.length + 4} className="px-4 py-3 border border-gray-200">
          <form
            className="flex flex-wrap gap-3 items-center bg-white p-4 rounded border border-gray-200 shadow-sm"
            onSubmit={e => {
              e.preventDefault();
              onAddSubtask(task.id);
            }}
          >
            {getSubtaskColumnOrder(columnOrder).slice(0, 6).map(colKey => {
              const col = columns.find(c => c.key === colKey);
              if (!col) return null;
              
              return (
                <div key={col.key} className="flex flex-col gap-1 min-w-32">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {col.label}
                  </label>
                  {col.key === 'task' ? (
                    <input
                      type="text"
                      value={newSubtask.name}
                      onChange={e => setNewSubtask({...newSubtask, name: e.target.value})}
                      onKeyDown={e => handleSubtaskKeyDown(e, task.id)}
                      className="border rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      placeholder="Enter subtask name"
                      autoFocus
                    />
                  ) : col.key === 'category' ? (
                    <select
                      value={newSubtask.category || getTaskCategories()[0]}
                      onChange={e => setNewSubtask({...newSubtask, category: e.target.value})}
                      onKeyDown={e => handleSubtaskKeyDown(e, task.id)}
                      className="border rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    >
                      {getTaskCategories().map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : col.key === 'status' ? (
                    <select
                      value={newSubtask.status}
                      onChange={e => setNewSubtask({...newSubtask, status: e.target.value})}
                      onKeyDown={e => handleSubtaskKeyDown(e, task.id)}
                      className="border rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    >
                      <option value="not started">Not Started</option>
                      <option value="working">Working</option>
                      <option value="done">Done</option>
                      <option value="stuck">Stuck</option>
                    </select>
                  ) : col.key === 'owner' ? (
                    <select
                      value={newSubtask.owner}
                      onChange={e => setNewSubtask({...newSubtask, owner: e.target.value})}
                      onKeyDown={e => handleSubtaskKeyDown(e, task.id)}
                      className="border rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    >
                      <option value="">Select owner</option>
                      <option value="MN">MN</option>
                      <option value="SA">SA</option>
                      <option value="AL">AL</option>
                      <option value="AH">AH</option>
                    </select>
                  ) : col.key === 'priority' ? (
                    <select
                      value={newSubtask.priority}
                      onChange={e => setNewSubtask({...newSubtask, priority: e.target.value})}
                      onKeyDown={e => handleSubtaskKeyDown(e, task.id)}
                      className="border rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  ) : col.key === 'planDays' ? (
                    <input
                      type="number"
                      min="0"
                      value={newSubtask.planDays}
                      onChange={e => setNewSubtask({...newSubtask, planDays: Number(e.target.value)})}
                      onKeyDown={e => handleSubtaskKeyDown(e, task.id)}
                      className="border rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      placeholder="Plan days"
                    />
                  ) : (
                    <input
                      type="text"
                      value={newSubtask[col.key] || ""}
                      onChange={e => setNewSubtask({...newSubtask, [col.key]: e.target.value})}
                      onKeyDown={e => handleSubtaskKeyDown(e, task.id)}
                      className="border rounded px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      placeholder={`Enter ${col.label.toLowerCase()}`}
                    />
                  )}
                </div>
              );
            })}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs rounded hover:shadow-md transition-all duration-200 font-medium"
              >
                Add Subtask
              </button>
              <button
                type="button"
                onClick={() => setShowSubtaskForm(null)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </td>
      </tr>
    )}
    </>
  );
};

export default SortableProjectRow;
