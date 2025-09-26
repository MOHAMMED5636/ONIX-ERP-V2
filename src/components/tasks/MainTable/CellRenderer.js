import React, { useState } from 'react';
import {
  StarIcon,
  MapPinIcon,
  PencilSquareIcon,
  PaperClipIcon,
  LinkIcon,
  TrashIcon,
  CheckIcon,
  ClipboardDocumentIcon
} from "@heroicons/react/24/outline";
import { format } from 'date-fns';
import TimelineCell from './TimelineCell';
import TruncatedTextCell from './TruncatedTextCell';
import { statusColors } from '../utils/tableUtils';
import ChecklistModal from '../modals/ChecklistModal';

const CellRenderer = {
  // Render main task cells
  renderMainCell: (col, row, onEdit, isAdmin = true, onEditTask = null, onDeleteTask = null, onCopyTask = null, onKeyDown = null) => {
    switch (col.key) {
      case "task":
        return (
          <input
            className="border rounded px-2 py-1 text-sm font-bold text-gray-900"
            value={row.name}
            onChange={e => onEdit("name", e.target.value)}
            onKeyDown={onKeyDown}
          />
        );
      case "referenceNumber":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.referenceNumber || ""}
            onChange={e => onEdit("referenceNumber", e.target.value)}
            onKeyDown={onKeyDown}
          />
        );
      case "category":
        return (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={row.category || "Design"}
            onChange={e => onEdit("category", e.target.value)}
            onKeyDown={onKeyDown}
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
            onKeyDown={onKeyDown}
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
            onKeyDown={onKeyDown}
          >
            <option value="">Select project manager</option>
            <option value="MN">MN</option>
            <option value="SA">SA</option>
            <option value="AL">AL</option>
          </select>
        );
      case "timeline":
        const timelineHasPredecessors = row.predecessors && row.predecessors.toString().trim() !== '';
        // Use calculated dates from TimelineCalc if available, otherwise fall back to timeline array
        const timelineValue = row.start && row.end ? [row.start, row.end] : row.timeline;
        return <TimelineCell value={timelineValue} onChange={val => onEdit(row, "timeline", val)} hasPredecessors={timelineHasPredecessors} />;
      case "planDays":
        return (
          <input
            type="number"
            min={0}
            className="border rounded px-2 py-1 text-sm w-20 text-center"
            value={row.planDays || 0}
            onChange={e => onEdit("planDays", Number(e.target.value))}
            onKeyDown={onKeyDown}
            placeholder="Enter plan days"
          />
        );
      case "remarks":
        return (
          <TruncatedTextCell
            value={row.remarks || ""}
            onChange={e => onEdit("remarks", e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter remarks"
            maxWidth="w-40"
          />
        );
      case "assigneeNotes":
        return (
          <TruncatedTextCell
            value={row.assigneeNotes || ""}
            onChange={e => onEdit("assigneeNotes", e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter assignee notes"
            maxWidth="w-40"
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
            className="border rounded px-2 py-1 text-xs font-bold"
            value={row.priority}
            onChange={e => onEdit("priority", e.target.value)}
            onKeyDown={onKeyDown}
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
              onKeyDown={onKeyDown}
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
            onKeyDown={onKeyDown}
            placeholder="Enter plot number"
          />
        );
      case "community":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.community || ""}
            onChange={e => onEdit("community", e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter community"
          />
        );
      case "projectType":
        return (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={row.projectType || "Residential"}
            onChange={e => onEdit("projectType", e.target.value)}
            onKeyDown={onKeyDown}
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
            onKeyDown={onKeyDown}
            placeholder="Enter project floor"
          />
        );
      case "developerProject":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={row.developerProject || ""}
            onChange={e => onEdit("developerProject", e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter developer project"
          />
        );
      case "notes":
        return (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={row.notes}
            onChange={e => onEdit("notes", e.target.value)}
            onKeyDown={onKeyDown}
          />
        );
      case "autoNumber":
        return <span className="text-sm text-gray-600">{row.autoNumber || row.id}</span>;
      case "predecessors":
        const predecessorsHasValue = row.predecessors && row.predecessors.toString().trim() !== '';
        return (
          <div className="relative">
            <input
              className={`border rounded px-2 py-1 text-sm pr-6 w-24 ${predecessorsHasValue ? 'border-green-300 bg-green-50' : ''}`}
              value={row.predecessors}
              onChange={e => onEdit("predecessors", e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Task IDs"
            />
            {predecessorsHasValue && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600">🔗</span>
            )}
          </div>
        );
      case "checklist":
        const checklistItems = row.checklistItems || [];
        const hasChecklist = checklistItems.length > 0;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // This will be handled by the parent component
                if (onEdit && typeof onEdit === 'function') {
                  onEdit("openChecklistModal", true);
                }
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                hasChecklist 
                  ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              {hasChecklist ? (
                <>
                  <CheckIcon className="w-3 h-3" />
                  {checklistItems.length} items
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-3 h-3" />
                  Add checklist
                </>
              )}
            </button>
          </div>
        );
      case "link":
        return (
          <div className="flex items-center gap-2">
            <input
              className="border rounded px-2 py-1 text-sm flex-1"
              value={row.link || ""}
              onChange={e => onEdit("link", e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Enter link"
            />
            {/* Rating stars */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {[1, 2, 3, 4, 5].map(i => {
                const rating = row.rating || 0;
                if (row.status === 'done' && isAdmin) {
                  return (
                    <StarIcon
                      key={i}
                      className={`w-4 h-4 cursor-pointer transition ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      onClick={() => onEdit("rating", i)}
                      fill={i <= rating ? '#facc15' : 'none'}
                    />
                  );
                } else if (isAdmin) {
                  return (
                    <StarIcon
                      key={i}
                      className={`w-4 h-4 cursor-pointer transition ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      onClick={() => onEdit("showRatingPrompt", true)}
                      fill={i <= rating ? '#facc15' : 'none'}
                    />
                  );
                } else {
                  return (
                    <StarIcon
                      key={i}
                      className={`w-4 h-4 transition ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill={i <= rating ? '#facc15' : 'none'}
                    />
                  );
                }
              })}
            </div>
          </div>
        );
      // Rating is now combined with link case above
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
  renderSubtaskCell: (col, sub, task, subIdx, onEdit, isAdmin = true, onKeyDown = null, onEditSubtask = null, onDeleteSubtask = null, onOpenChat = null) => {
    switch (col.key) {
      case "task":
      case "project name":
        return (
          <div className="flex items-center gap-2">
            <input
              className="border rounded px-2 py-1 text-sm font-bold text-gray-900 flex-1"
              value={sub.name}
              onChange={e => onEdit(task.id, sub.id, "name", e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Task Name"
            />
            <button
              onClick={() => onOpenChat && onOpenChat(sub, 'task')}
              className="p-1 rounded-full hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
              title="Open Chat"
            >
              💬
            </button>
          </div>
        );
      case "category":
      case "task category":
        return (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sub.category || "Design"}
            onChange={e => onEdit(task.id, sub.id, "category", e.target.value)}
            onKeyDown={onKeyDown}
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
            onKeyDown={onKeyDown}
          />
        );
      case "status":
        return (
          <select
            className={`border rounded px-2 py-1 text-xs font-bold ${statusColors[sub.status] || 'bg-gray-200 text-gray-700'}`}
            value={sub.status}
            onChange={e => onEdit(task.id, sub.id, "status", e.target.value)}
            onKeyDown={onKeyDown}
          >
            <option value="done">Done</option>
            <option value="working">Working</option>
            <option value="stuck">Stuck</option>
            <option value="not started">Not Started</option>
          </select>
        );
      case "owner":
        return (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Employee badge clicked for invite:', sub.owner);
              if (onEdit) {
                onEdit(task.id, sub.id, "inviteEngineer", sub.owner);
              }
            }}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs bg-pink-200 text-pink-700 border border-white shadow-sm hover:bg-pink-300 transition-colors cursor-pointer"
            title={`Click to invite engineer to ${sub.name}`}
          >
            {sub.owner}
          </button>
        );
      case "timeline":
        const subTimelineHasPredecessors = sub.predecessors && sub.predecessors.toString().trim() !== '';
        // Use calculated dates from TimelineCalc if available, otherwise fall back to timeline array
        const subTimelineValue = sub.start && sub.end ? [sub.start, sub.end] : sub.timeline;
        return <TimelineCell value={subTimelineValue} onChange={val => onEdit(task.id, sub.id, "timeline", val)} hasPredecessors={subTimelineHasPredecessors} />;
      case "planDays":
        return (
          <input
            type="number"
            min={0}
            className="border rounded px-2 py-1 text-sm w-20 text-center"
            value={sub.planDays || 0}
            onChange={e => onEdit(task.id, sub.id, "planDays", Number(e.target.value))}
            onKeyDown={onKeyDown}
            placeholder="Enter plan days"
          />
        );
      case "remarks":
        return (
          <TruncatedTextCell
            value={sub.remarks || ""}
            onChange={e => onEdit(task.id, sub.id, "remarks", e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter remarks"
            maxWidth="w-32"
          />
        );
      case "assigneeNotes":
        return (
          <TruncatedTextCell
            value={sub.assigneeNotes || ""}
            onChange={e => onEdit(task.id, sub.id, "assigneeNotes", e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter assignee notes"
            maxWidth="w-32"
          />
        );
      case "attachments":
        return (
          <div>
            <button
              type="button"
              onClick={() => onEdit(task.id, sub.id, "openAttachmentsModal", true)}
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
        return <select
          className="border rounded px-2 py-1 text-sm"
          value={sub.priority}
          onChange={e => onEdit(task.id, sub.id, "priority", e.target.value)}
          onKeyDown={onKeyDown}
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
            onKeyDown={onKeyDown}
            placeholder="Enter plot number"
          />
        );
      case "community":
        return (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={sub.community || ""}
            onChange={e => onEdit(task.id, sub.id, "community", e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter community"
          />
        );
      case "projectType":
        return (
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sub.projectType || "Residential"}
            onChange={e => onEdit(task.id, sub.id, "projectType", e.target.value)}
            onKeyDown={onKeyDown}
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
            onKeyDown={onKeyDown}
            placeholder="Enter project floor"
          />
        );
      case "developerProject":
        return (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={sub.developerProject || ""}
            onChange={e => onEdit(task.id, sub.id, "developerProject", e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter developer project"
          />
        );
      case "notes":
        return (
          <input
            className="border rounded px-2 py-1 text-sm"
            value={sub.notes || ""}
            onChange={e => onEdit(task.id, sub.id, "notes", e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter notes"
          />
        );
      case "autoNumber":
        return <span className="text-sm text-gray-600">{sub.autoNumber || sub.id}</span>;
      case "predecessors":
        const predecessorsHasValue = sub.predecessors && sub.predecessors.toString().trim() !== '';
        return (
          <div className="relative">
            <input
              className={`border rounded px-2 py-1 text-sm pr-6 w-24 ${predecessorsHasValue ? 'border-green-300 bg-green-50' : ''}`}
              value={sub.predecessors || ""}
              onChange={e => onEdit(task.id, sub.id, "predecessors", e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Task IDs"
            />
            {predecessorsHasValue && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600">🔗</span>
            )}
          </div>
        );
      case "checklist":
        const subChecklistItems = sub.checklistItems || [];
        const subHasChecklist = subChecklistItems.length > 0;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // This will be handled by the parent component
                if (onEdit && typeof onEdit === 'function') {
                  onEdit(task.id, sub.id, "openChecklistModal", true);
                }
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                subHasChecklist 
                  ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              {subHasChecklist ? (
                <>
                  <CheckIcon className="w-3 h-3" />
                  {subChecklistItems.length} items
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-3 h-3" />
                  Add checklist
                </>
              )}
            </button>
          </div>
        );
      case "link":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-32"
            value={sub.link || ""}
            onChange={e => onEdit(task.id, sub.id, "link", e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter link"
          />
        );
      case "rating":
        // Always show stars, but only highlight filled ones
        const subRating = sub.rating || 0;
        if (sub.status === 'done' && isAdmin) {
          return (
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 cursor-pointer transition ${i <= subRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => onEdit(task.id, sub.id, "rating", i)}
                  fill={i <= subRating ? '#facc15' : 'none'}
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
                  className={`w-5 h-5 cursor-pointer transition ${i <= subRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => onEdit(task.id, sub.id, "showRatingPrompt", true)}
                  fill={i <= subRating ? '#facc15' : 'none'}
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
                  className={`w-5 h-5 transition ${i <= subRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill={i <= subRating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          );
        }
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


