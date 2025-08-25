import React from 'react';
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import CheckboxWithPopup from './CheckboxWithPopup';
import MultiSelectCheckbox from './MultiSelectCheckbox';

const ProjectRow = ({
  task,
  columnOrder,
  columns,
  expandedActive,
  editingTaskId,
  editingTaskName,
  onToggleExpand,
  onProjectNameClick,
  onProjectNameDoubleClick,
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
  onToggleSelection
}) => {
  // Helper renderers for Monday.com style columns
  const renderMainCell = (col, row, onEdit) => {
    switch (col.key) {
      case "checkbox":
        console.log('Rendering checkbox for task:', row.name, 'Handlers:', { onEditTask, onDeleteTask, onCopyTask });
        try {
          return (
            <div className="flex items-center justify-center bg-yellow-100 p-1 rounded">
              <CheckboxWithPopup
                task={row}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onCopy={onCopyTask}
                isSubtask={false}
              />
            </div>
          );
        } catch (error) {
          console.error('Error rendering checkbox:', error);
          return <div className="text-red-500 bg-red-100 p-1 rounded">❌</div>;
        }
      case "task":
        return (
          <input
            className="border rounded px-2 py-1 text-sm font-bold text-gray-900"
            value={row.name}
            onChange={e => onEdit("name", e.target.value)}
          />
        );
      case "referenceNumber":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.referenceNumber || ""}
            onChange={e => onEdit("referenceNumber", e.target.value)}
          />
        );
      case "category":
        return (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={row.category || "Design"}
            onChange={e => onEdit("category", e.target.value)}
          >
            <option value="Design">Design</option>
            <option value="Development">Development</option>
            <option value="Testing">Testing</option>
            <option value="Review">Review</option>
          </select>
        );
      case "status":
        const statusColors = {
          done: "bg-green-500 text-white",
          working: "bg-yellow-500 text-white",
          stuck: "bg-red-500 text-white",
          "not started": "bg-gray-400 text-white"
        };
        return (
          <select
            className={`border rounded px-2 py-1 text-xs font-bold ${statusColors[row.status] || 'bg-gray-200 text-gray-700'}`}
            value={row.status}
            onChange={e => onEdit("status", e.target.value)}
          >
             <option value="done">Done</option>
             <option value="suspended">Suspended</option>
             <option value="cancelled">Cancelled</option>
             <option value="in progress">In Progress</option>
            <option value="pending">Pending</option>
          </select>
        );
      case "owner":
        return (
          <select
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.owner || ""}
            onChange={e => onEdit("owner", e.target.value)}
          >
            <option value="">Select owner</option>
            <option value="MN">MN</option>
            <option value="SA">SA</option>
            <option value="AL">AL</option>
          </select>
        );
      case "timeline":
        // TimelineCell component would be imported or defined here
        return (
          <div className="relative inline-block">
            <button className="inline-block px-3 py-1 rounded-full text-xs font-bold transition bg-blue-100 text-blue-700 hover:bg-blue-200">
              {row.timeline && row.timeline[0] && row.timeline[1] 
                ? `${new Date(row.timeline[0]).toLocaleDateString()} – ${new Date(row.timeline[1]).toLocaleDateString()}`
                : 'Set dates'}
            </button>
          </div>
        );
      case "planDays":
        return (
          <input
            type="number"
            min={0}
            className="border rounded px-2 py-1 text-sm w-20 text-center"
            value={row.planDays || 0}
            onChange={e => onEdit("planDays", Number(e.target.value))}
            placeholder="Enter plan days"
          />
        );
      case "remarks":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.remarks || ""}
            onChange={e => onEdit("remarks", e.target.value)}
            placeholder="Enter remarks"
          />
        );
      case "assigneeNotes":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.assigneeNotes || ""}
            onChange={e => onEdit("assigneeNotes", e.target.value)}
            placeholder="Enter assignee notes"
          />
        );
      case "attachments":
        return (
          <div>
            <input
              type="file"
              multiple
              onChange={e => {
                const files = Array.from(e.target.files);
                onEdit("attachments", files);
              }}
            />
            <ul className="mt-1 text-xs text-gray-600">
              {(row.attachments || []).map((file, idx) => (
                <li key={idx}>{file.name || (typeof file === 'string' ? file : '')}</li>
              ))}
            </ul>
          </div>
        );
      case "priority":
        return (
          <select
            className="border rounded px-2 py-1 text-xs font-bold"
            value={row.priority}
            onChange={e => onEdit("priority", e.target.value)}
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
              className="border rounded px-2 py-1 text-sm"
              value={row.location}
              onChange={e => onEdit("location", e.target.value)}
              placeholder="Enter location or pick on map"
            />
            <button type="button" title="Pick on map">
              <svg className="w-5 h-5 text-blue-500 hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        );
      case "plotNumber":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.plotNumber || ""}
            onChange={e => onEdit("plotNumber", e.target.value)}
            placeholder="Enter plot number"
          />
        );
      case "community":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.community || ""}
            onChange={e => onEdit("community", e.target.value)}
            placeholder="Enter community"
          />
        );
      case "projectType":
        return (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={row.projectType || "Residential"}
            onChange={e => onEdit("projectType", e.target.value)}
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
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.projectFloor || ""}
            onChange={e => onEdit("projectFloor", e.target.value)}
            placeholder="Enter project floor"
          />
        );
      case "developerProject":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.developerProject || ""}
            onChange={e => onEdit("developerProject", e.target.value)}
            placeholder="Enter developer project"
          />
        );
      case "notes":
        return (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={row.notes}
            onChange={e => onEdit("notes", e.target.value)}
          />
        );
      case "autoNumber":
        return <span>{row.autoNumber || row.id}</span>;
      case "predecessors":
        const predecessorsHasValue = row.predecessors && row.predecessors.toString().trim() !== '';
        return (
          <div className="relative">
            <input
              className={`border rounded px-2 py-1 text-sm pr-6 ${predecessorsHasValue ? 'border-green-300 bg-green-50' : ''}`}
              value={row.predecessors}
              onChange={e => onEdit("predecessors", e.target.value)}
              placeholder="Enter task IDs (e.g., 1, 2, 3)"
            />
            {predecessorsHasValue && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600">🔗</span>
            )}
          </div>
        );
      case "checklist":
        return (
          <input
            type="checkbox"
            checked={!!row.checklist}
            onChange={e => onEdit("checklist", e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        );
      case "link":
        return (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={row.link}
            onChange={e => onEdit("link", e.target.value)}
          />
        );
      case "rating":
        const isAdmin = true; // TODO: Replace with real authentication logic
        if (row.status === 'done' && isAdmin) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <svg
                  key={i}
                  className={`w-5 h-5 cursor-pointer transition ${i <= row.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => onEdit("rating", i)}
                  fill={i <= row.rating ? '#facc15' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ))}
            </span>
          );
        } else {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <svg
                  key={i}
                  className={`w-5 h-5 transition ${i <= row.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill={i <= row.rating ? '#facc15' : 'none'}
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
        const hasSubtasks = row.subtasks && row.subtasks.length > 0;
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
              onChange={e => onEdit("progress", Number(e.target.value))}
              className="w-24"
              disabled={hasSubtasks}
              readOnly={hasSubtasks}
            />
          </div>
        );
      case "color":
        return (
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <span className="inline-block w-6 h-6 rounded-full border-2 border-gray-200" style={{ background: row.color }}></span>
            <input
              type="color"
              value={row.color}
              onChange={e => onEdit("color", e.target.value)}
              className="w-6 h-6 p-0 border-0 bg-transparent"
              style={{ visibility: 'hidden', position: 'absolute' }}
            />
            <span className="text-xs text-gray-500">{row.color}</span>
          </label>
        );
      case "delete":
        return (
          <button
            className="p-1 rounded hover:bg-red-100 transition"
            onClick={() => onDelete(task.id)}
            title="Delete"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        );
      default:
        return row[col.key] || '';
    }
  };

  return (
    <tr className="project-row bg-white hover:bg-blue-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-b border-gray-100" style={{ overflow: 'visible' }}>
      {console.log('ProjectRow columnOrder:', columnOrder)}
      {/* Multi-select Checkbox Column */}
      <td className="px-4 py-4 align-middle text-center">
        <MultiSelectCheckbox
          task={task}
          isChecked={isSelected}
          onToggle={onToggleSelection}
        />
      </td>
      {/* Pin Column */}
      <td className="px-4 py-4 align-middle text-center">
        <button
          onClick={() => onTogglePin(task.id)}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
            task.pinned 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
          }`}
          title={task.pinned ? "Unpin task" : "Pin task"}
        >
          📌
        </button>
      </td>
      {columnOrder
        .filter(key => key !== 'category') // REMOVE TASK CATEGORY ONLY FOR MAIN TASK ROWS
        .map((colKey, idx) => {
          console.log('Rendering column:', colKey, 'at index:', idx);
          const col = columns.find(c => c.key === colKey);
          if (!col) return null;
          return (
            <td key={col.key} className="px-4 py-4 align-middle" style={{ overflow: 'visible' }}>
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
                    {editingTaskId === task.id ? (
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
                      <span
                        className="font-bold text-blue-700 hover:text-blue-800 hover:underline focus:outline-none cursor-pointer transition-all duration-200"
                        onClick={() => onProjectNameClick(task)}
                        onDoubleClick={() => onProjectNameDoubleClick(task)}
                      >
                        {task.name}
                      </span>
                    )}
                  </div>
                  {/* Add Task Button */}
                  <button
                    onClick={() => onAddSubtask(task.id)}
                    className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 w-fit"
                    title="Add Task"
                  >
                    + Add Task
                  </button>
                </div>
              ) : (
                renderMainCell(col, task, (field, value) => {
                  if (col.key === 'delete') onDelete(task.id);
                  else onEdit(task, field, value);
                }, true, onEditTask, onDeleteTask, onCopyTask)
              )}
            </td>
          );
        })}
      <td key="add-column" className="px-4 py-4 align-middle">
        <button
          className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
          onClick={onShowAddColumnMenu}
          title="Add column"
          type="button"
        >
          +
        </button>
      </td>
    </tr>
  );
};

export default ProjectRow;



