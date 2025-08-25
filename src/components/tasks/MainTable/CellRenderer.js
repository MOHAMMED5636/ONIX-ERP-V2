import React from 'react';
import {
  StarIcon,
  MapPinIcon,
  PencilSquareIcon,
  PaperClipIcon,
  LinkIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { format } from 'date-fns';
import TimelineCell from './TimelineCell';
import { statusColors } from '../utils/tableUtils';
import CheckboxWithPopup from './CheckboxWithPopup';

const CellRenderer = {
  // Render main task cells
  renderMainCell: (col, row, onEdit, isAdmin = true, onEditTask = null, onDeleteTask = null, onCopyTask = null) => {
    switch (col.key) {
      case "checkbox":
        return (
          <CheckboxWithPopup
            task={row}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onCopy={onCopyTask}
            isSubtask={false}
          />
        );
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
        const timelineHasPredecessors = row.predecessors && row.predecessors.toString().trim() !== '';
        return <TimelineCell value={row.timeline} onChange={val => onEdit("timeline", val)} hasPredecessors={timelineHasPredecessors} />;
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
            <button type="button" onClick={() => onEdit("openMapPicker", { type: 'main', taskId: row.id, subId: null, location: row.location })} title="Pick on map">
              <MapPinIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
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
                  onClick={() => onEdit("showRatingPrompt", true)}
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
  renderSubtaskCell: (col, sub, task, subIdx, onEdit, isAdmin = true, onKeyDown = null, onEditSubtask = null, onDeleteSubtask = null, onCopySubtask = null) => {
    switch (col.key) {
      case "checkbox":
        return (
          <CheckboxWithPopup
            task={sub}
            onEdit={onEditSubtask}
            onDelete={onDeleteSubtask}
            onCopy={onCopySubtask}
            isSubtask={true}
            parentTaskId={task.id}
          />
        );
      case "task":
      case "project name":
        return (
          <input
            className="border rounded px-2 py-1 text-sm font-bold text-gray-900"
            value={sub.name}
            onChange={e => onEdit(task.id, sub.id, "name", e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Task Name"
          />
        );
      case "category":
      case "task category":
        return (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sub.category || "Design"}
            onChange={e => onEdit(task.id, sub.id, "category", e.target.value)}
          >
            <option value="Design">Design</option>
            <option value="Development">Development</option>
            <option value="Testing">Testing</option>
            <option value="Review">Review</option>
          </select>
        );
      case "referenceNumber":
      case "reference number":
        return (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={sub.referenceNumber || ""}
            onChange={e => onEdit(task.id, sub.id, "referenceNumber", e.target.value)}
          />
        );
      case "status":
        return (
          <select
            className={`border rounded px-2 py-1 text-xs font-bold ${statusColors[sub.status] || 'bg-gray-200 text-gray-700'}`}
            value={sub.status}
            onChange={e => onEdit(task.id, sub.id, "status", e.target.value)}
          >
            <option value="done">Done</option>
            <option value="working">Working</option>
            <option value="stuck">Stuck</option>
            <option value="not started">Not Started</option>
          </select>
        );
      case "owner":
        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs bg-pink-200 text-pink-700 border border-white shadow-sm">{sub.owner}</span>;
      case "timeline":
        const subTimelineHasPredecessors = sub.predecessors && sub.predecessors.toString().trim() !== '';
        return <TimelineCell value={sub.timeline} onChange={val => onEdit(task.id, sub.id, "timeline", val)} hasPredecessors={subTimelineHasPredecessors} />;
      case "priority":
        return <select
          className="border rounded px-2 py-1 text-sm"
          value={sub.priority}
          onChange={e => onEdit(task.id, sub.id, "priority", e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>;
      case "location":
        return (
          <div className="flex items-center gap-1">
            <input
              className="border rounded px-2 py-1 text-sm"
              value={sub.location}
              onChange={e => onEdit(task.id, sub.id, "location", e.target.value)}
              placeholder="Enter location or pick on map"
            />
            <button type="button" onClick={() => onEdit(task.id, sub.id, "openMapPicker", { type: 'sub', taskId: task.id, subId: sub.id, location: sub.location })} title="Pick on map">
              <MapPinIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
            </button>
          </div>
        );
      case "plotNumber":
        return (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={sub.plotNumber || ""}
            onChange={e => onEdit(task.id, sub.id, "plotNumber", e.target.value)}
          />
        );
      case "community":
        return (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={sub.community || ""}
            onChange={e => onEdit(task.id, sub.id, "community", e.target.value)}
          />
        );
      case "projectType":
        return (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sub.projectType || "Residential"}
            onChange={e => onEdit(task.id, sub.id, "projectType", e.target.value)}
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
            className="border rounded px-2 py-1 text-sm"
            value={sub.projectFloor || ""}
            onChange={e => onEdit(task.id, sub.id, "projectFloor", e.target.value)}
          />
        );
      case "developerProject":
        return (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={sub.developerProject || ""}
            onChange={e => onEdit(task.id, sub.id, "developerProject", e.target.value)}
          />
        );
      case "notes":
        return (
          <span className="flex items-center gap-1 cursor-pointer hover:bg-blue-50 px-1 py-1 rounded transition">
            <span className="text-xs">{sub.notes || "Add note"}</span>
          </span>
        );
      case "attachments":
        return (
          <div>
            <input
              type="file"
              multiple
              className="text-xs"
              onChange={e => {
                const files = Array.from(e.target.files);
                onEdit(task.id, sub.id, "attachments", files);
              }}
            />
          </div>
        );
      case "priority":
        return (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sub.priority}
            onChange={e => onEdit(task.id, sub.id, "priority", e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        );
      case "rating":
        return (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => onEdit(task.id, sub.id, "rating", star)}
                className={`text-xs ${sub.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        );
      case "progress":
        return (
          <div className="flex items-center gap-1">
            <input
              type="range"
              min="0"
              max="100"
              value={sub.progress || 0}
              onChange={e => onEdit(task.id, sub.id, "progress", parseInt(e.target.value))}
              className="w-16 h-2"
            />
            <span className="text-xs w-8">{sub.progress || 0}%</span>
          </div>
        );
      case "color":
        return (
          <div
            className="w-4 h-4 rounded-full border border-gray-300 cursor-pointer"
            style={{ backgroundColor: sub.color || "#60a5fa" }}
            onClick={() => {
              const colors = ["#60a5fa", "#f59e42", "#10d081", "#f44448", "#8b5cf6", "#06b6d4"];
              const currentIndex = colors.indexOf(sub.color || "#60a5fa");
              const nextColor = colors[(currentIndex + 1) % colors.length];
              onEdit(task.id, sub.id, "color", nextColor);
            }}
          />
        );
      case "delete":
        return (
          <button
            className="p-1 rounded hover:bg-red-100 transition"
            onClick={() => onEdit(task.id, sub.id, "delete")}
            title="Delete"
          >
            <TrashIcon className="w-5 h-5 text-red-500" />
          </button>
        );
      default:
        return sub[col.key] || '';
    }
  }
};

export default CellRenderer;


