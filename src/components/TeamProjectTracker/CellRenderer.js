import React from 'react';
import {
  MapPinIcon,
  StarIcon,
  TrashIcon,
  PencilSquareIcon,
  PaperClipIcon,
  LinkIcon
} from "@heroicons/react/24/outline";
import { format } from 'date-fns';
import TimelineCell from './TimelineCell';
import { statusColors, isAdmin } from './constants';
import ReorderableDropdown from "../tasks/ReorderableDropdown";

const CellRenderer = {
  // Render main task cells
  renderMainCell: (col, row, onEdit, handleOpenMapPicker, setShowRatingPrompt) => {
    switch (col.key) {
      case "task":
        return (
          <input
            className="border rounded px-2 py-1 text-sm font-bold text-gray-900 w-full"
            value={row.name}
            onChange={e => onEdit("name", e.target.value)}
          />
        );
      case "referenceNumber":
      case "reference number":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.referenceNumber || ""}
            onChange={e => onEdit("referenceNumber", e.target.value)}
          />
        );
      case "category":
      case "task category":
        return (
          <ReorderableDropdown
            label="Task Category"
            options={[
              { value: "Design", label: "Design" },
              { value: "Development", label: "Development" },
              { value: "Testing", label: "Testing" },
              { value: "Review", label: "Review" }
            ]}
            value={row.category || "Design"}
            onChange={val => onEdit("category", val)}
          />
        );
      case "status":
        return (
          <select
            className={`border rounded px-2 py-1 text-xs font-bold w-full ${statusColors[row.status] || 'bg-gray-400 text-white'}`}
            value={row.status}
            onChange={e => onEdit("status", e.target.value)}
          >
            <option value="not started">Not Started</option>
            <option value="working">Working</option>
            <option value="stuck">Stuck</option>
            <option value="done">Done</option>
          </select>
        );
      case "owner":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.owner || ""}
            onChange={e => onEdit("owner", e.target.value)}
            placeholder="Enter owner"
          />
        );
      case "client":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.client || ""}
            onChange={e => onEdit("client", e.target.value)}
            placeholder="Enter client name"
          />
        );
      case "timeline":
        const timelineHasPredecessors = row.predecessors && row.predecessors.toString().trim() !== '';
        return <TimelineCell value={row.timeline} onChange={val => onEdit("timeline", val)} hasPredecessors={timelineHasPredecessors} />;
      case "planDays":
        return (
          <input
            type="number"
            className="border rounded px-2 py-1 text-sm text-gray-900 w-full"
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
            placeholder="Add remarks"
          />
        );
      case "assigneeNotes":
      case "assignee notes":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.assigneeNotes || ""}
            onChange={e => onEdit("assigneeNotes", e.target.value)}
            placeholder="Add assignee notes"
          />
        );
      case "attachments":
        return (
          <div>
            <button
              type="button"
              onClick={() => onEdit("openAttachmentsModal", true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <PaperClipIcon className="w-4 h-4" />
              {row.attachments && row.attachments.length > 0 
                ? `${row.attachments.length} file(s)` 
                : 'Add files'
              }
            </button>
            {row.attachments && row.attachments.length > 0 && (
              <ul className="mt-2 text-xs text-gray-600">
                {row.attachments.slice(0, 2).map((file, idx) => (
                  <li key={idx} className="truncate">
                    {file.fileName || file.name || (typeof file === 'string' ? file : '')}
                  </li>
                ))}
                {row.attachments.length > 2 && (
                  <li className="text-gray-500">+{row.attachments.length - 2} more</li>
                )}
              </ul>
            )}
          </div>
        );
      case "priority":
        return (
          <select
            className="border rounded px-2 py-1 text-xs font-bold w-full"
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
              className="border rounded px-2 py-1 text-sm w-full"
              value={row.location}
              onChange={e => onEdit("location", e.target.value)}
              placeholder="Enter location or pick on map"
            />
            <button type="button" onClick={() => handleOpenMapPicker('main', row.id, null, row.location)} title="Pick on map">
              <MapPinIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
            </button>
          </div>
        );
      case "plotNumber":
      case "plot number":
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
      case "project type":
        return (
          <select
            className="border rounded px-2 py-1 text-sm w-full"
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
      case "project floor":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.projectFloor || ""}
            onChange={e => onEdit("projectFloor", e.target.value)}
            placeholder="Enter no. of floors"
          />
        );
      case "developerProject":
      case "developer project":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.developerProject || ""}
            onChange={e => onEdit("developerProject", e.target.value)}
            placeholder="Enter developer name"
          />
        );
      case "autoNumber":
      case "auto #":
        return <span>{row.autoNumber || row.id}</span>;
      case "predecessors":
        const predecessorsHasValue = row.predecessors && row.predecessors.toString().trim() !== '';
        return (
          <div className="relative">
            <input
              className={`border rounded px-2 py-1 text-sm pr-6 w-full ${predecessorsHasValue ? 'border-green-300 bg-green-50' : ''}`}
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
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.link}
            onChange={e => onEdit("link", e.target.value)}
          />
        );
      case "rating":
        if (row.status === 'done' && isAdmin) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 cursor-pointer transition ${i <= row.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => onEdit("rating", i)}
                  fill={i <= row.rating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        } else if (isAdmin) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 cursor-pointer transition ${i <= row.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setShowRatingPrompt(true)}
                  fill={i <= row.rating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        } else {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 transition ${i <= row.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill={i <= row.rating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        }
      case "progress":
        // If there are subtasks, make progress read-only and show average
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
            onClick={onEdit}
            title="Delete"
          >
            <TrashIcon className="w-5 h-5 text-red-500" />
          </button>
        );
      default:
        return row[col.key] || '';
    }
  },

  // Render subtask cells
  renderSubtaskCell: (col, sub, task, subIdx, handleEditSubtask, handleOpenMapPicker) => {
    switch (col.key) {
      case "task":
      case "project name":
        return (
          <input
            className="border rounded px-2 py-1 text-sm font-bold text-gray-900"
            value={sub.name}
            onChange={e => handleEditSubtask(task.id, sub.id, "name", e.target.value)}
            placeholder="Subtask name"
          />
        );
      case "category":
      case "task category":
        return (
          <ReorderableDropdown
            label="Task Category"
            options={[
              { value: "Design", label: "Design" },
              { value: "Development", label: "Development" },
              { value: "Testing", label: "Testing" },
              { value: "Review", label: "Review" }
            ]}
            value={sub.category || "Design"}
            onChange={val => handleEditSubtask(task.id, sub.id, "category", val)}
          />
        );
      case "referenceNumber":
      case "reference number":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.referenceNumber || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "referenceNumber", e.target.value)}
          />
        );
      case "status":
        return (
          <select
            className={`border rounded px-2 py-1 text-xs font-bold w-full ${statusColors[sub.status] || 'bg-gray-400 text-white'}`}
            value={sub.status}
            onChange={e => handleEditSubtask(task.id, sub.id, "status", e.target.value)}
          >
            <option value="not started">Not Started</option>
            <option value="working">Working</option>
            <option value="stuck">Stuck</option>
            <option value="done">Done</option>
          </select>
        );
      case "owner":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.owner || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "owner", e.target.value)}
            placeholder="Enter owner"
          />
        );
      case "timeline":
        const subTimelineHasPredecessors = sub.predecessors && sub.predecessors.toString().trim() !== '';
        return <TimelineCell value={sub.timeline} onChange={val => handleEditSubtask(task.id, sub.id, "timeline", val)} hasPredecessors={subTimelineHasPredecessors} />;
      case "planDays":
      case "plan days":
        return (
          <input
            type="number"
            className="border rounded px-2 py-1 text-sm text-gray-900 w-full"
            value={sub.planDays || 0}
            onChange={e => handleEditSubtask(task.id, sub.id, "planDays", Number(e.target.value))}
            placeholder="Enter plan days"
          />
        );
      case "remarks":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.remarks || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "remarks", e.target.value)}
            placeholder="Add remarks"
          />
        );
      case "assigneeNotes":
      case "assignee notes":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.assigneeNotes || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "assigneeNotes", e.target.value)}
            placeholder="Add assignee notes"
          />
        );
      case "attachments":
        return (
          <div>
            <button
              type="button"
              onClick={() => handleEditSubtask(task.id, sub.id, "openAttachmentsModal", true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <PaperClipIcon className="w-4 h-4" />
              {sub.attachments && sub.attachments.length > 0 
                ? `${sub.attachments.length} file(s)` 
                : 'Add files'
              }
            </button>
            {sub.attachments && sub.attachments.length > 0 && (
              <ul className="mt-2 text-xs text-gray-600">
                {sub.attachments.slice(0, 2).map((file, idx) => (
                  <li key={idx} className="truncate">
                    {file.fileName || file.name || (typeof file === 'string' ? file : '')}
                  </li>
                ))}
                {sub.attachments.length > 2 && (
                  <li className="text-gray-500">+{sub.attachments.length - 2} more</li>
                )}
              </ul>
            )}
          </div>
        );
      case "priority":
        return (
          <select
            className="border rounded px-2 py-1 text-xs font-bold w-full"
            value={sub.priority}
            onChange={e => handleEditSubtask(task.id, sub.id, "priority", e.target.value)}
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
              className="border rounded px-2 py-1 text-sm w-full"
              value={sub.location}
              onChange={e => handleEditSubtask(task.id, sub.id, "location", e.target.value)}
              placeholder="Enter location or pick on map"
            />
            <button type="button" onClick={() => handleOpenMapPicker('sub', task.id, sub.id, sub.location)} title="Pick on map">
              <MapPinIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
            </button>
          </div>
        );
      case "plotNumber":
      case "plot number":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.plotNumber || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "plotNumber", e.target.value)}
            placeholder="Enter plot number"
          />
        );
      case "community":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.community || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "community", e.target.value)}
            placeholder="Enter community"
          />
        );
      case "projectType":
      case "project type":
        return (
          <select
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.projectType || "Residential"}
            onChange={e => handleEditSubtask(task.id, sub.id, "projectType", e.target.value)}
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
            <option value="Mixed Use">Mixed Use</option>
            <option value="Infrastructure">Infrastructure</option>
          </select>
        );
      case "projectFloor":
      case "project floor":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.projectFloor || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "projectFloor", e.target.value)}
            placeholder="Enter no. of floors"
          />
        );
      case "developerProject":
      case "developer project":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.developerProject || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "developerProject", e.target.value)}
            placeholder="Enter developer name"
          />
        );
      case "autoNumber":
      case "auto #":
        return <span>{sub.autoNumber || sub.id}</span>;
      case "predecessors":
        const subPredecessorsHasValue = sub.predecessors && sub.predecessors.toString().trim() !== '';
        return (
          <div className="relative">
            <input
              className={`border rounded px-2 py-1 text-sm pr-6 w-full ${subPredecessorsHasValue ? 'border-green-300 bg-green-50' : ''}`}
              value={sub.predecessors}
              onChange={e => handleEditSubtask(task.id, sub.id, "predecessors", e.target.value)}
              placeholder="Enter task IDs (e.g., 1, 2, 3)"
            />
            {subPredecessorsHasValue && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600">🔗</span>
            )}
          </div>
        );
      case "checklist":
        return (
          <input
            type="checkbox"
            checked={!!sub.checklist}
            onChange={e => handleEditSubtask(task.id, sub.id, "checklist", e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        );
      case "link":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.link}
            onChange={e => handleEditSubtask(task.id, sub.id, "link", e.target.value)}
          />
        );
      case "rating":
        if (sub.status === 'done' && isAdmin) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 cursor-pointer transition ${i <= sub.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => handleEditSubtask(task.id, sub.id, "rating", i)}
                  fill={i <= sub.rating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        } else if (isAdmin) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 cursor-pointer transition ${i <= sub.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setShowRatingPrompt(true)}
                  fill={i <= sub.rating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        } else {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 transition ${i <= sub.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill={i <= sub.rating ? '#facc15' : 'none'}
                />
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
                style={{ width: `${sub.progress}%` }}
              ></div>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-gray-700">{sub.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={sub.progress}
              onChange={e => handleEditSubtask(task.id, sub.id, "progress", Number(e.target.value))}
              className="w-24"
            />
          </div>
        );
      case "color":
        return (
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <span className="inline-block w-6 h-6 rounded-full border-2 border-gray-200" style={{ background: sub.color }}></span>
            <input
              type="color"
              value={sub.color}
              onChange={e => handleEditSubtask(task.id, sub.id, "color", e.target.value)}
              className="w-6 h-6 p-0 border-0 bg-transparent"
              style={{ visibility: 'hidden', position: 'absolute' }}
            />
            <span className="text-xs text-gray-500">{sub.color}</span>
          </label>
        );
      case "delete":
        return (
          <button
            className="p-1 rounded hover:bg-red-100 transition"
            onClick={() => handleEditSubtask(task.id, sub.id, "delete")}
            title="Delete"
          >
            <TrashIcon className="w-5 h-5 text-red-500" />
          </button>
        );
      case "notes":
        return (
          <span className="flex items-center gap-1 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition">
            <span>{sub.notes || "Add note"}</span>
            <PencilSquareIcon className="w-4 h-4 text-gray-400" />
          </span>
        );
      default:
        return sub[col.key] || '';
    }
  }
};

export default CellRenderer;

