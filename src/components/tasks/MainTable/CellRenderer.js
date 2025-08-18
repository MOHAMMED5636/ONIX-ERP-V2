import React from 'react';
import { MapPinIcon, PaperClipIcon, LinkIcon } from "@heroicons/react/24/outline";
import { format } from 'date-fns';
import TimelineCell from './TimelineCell';
import { statusColors, getStatusColor, getPriorityColor } from '../utils/tableUtils';

const CellRenderer = ({ col, row, onEdit, onOpenMapPicker, isSubtask = false }) => {
  switch (col.key) {
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
          className={`border rounded px-2 py-1 text-xs font-bold ${getStatusColor(row.status)}`}
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
      return (
        <TimelineCell 
          value={row.timeline} 
          onChange={val => onEdit("timeline", val)} 
          hasPredecessors={timelineHasPredecessors} 
        />
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
          className={`border rounded px-2 py-1 text-xs font-bold ${getPriorityColor(row.priority)}`}
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
          <button 
            type="button" 
            onClick={() => onOpenMapPicker(isSubtask ? 'sub' : 'main', row.id, isSubtask ? row.id : null, row.location)} 
            title="Pick on map"
          >
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
          className="border rounded px-2 py-1 text-sm w-full"
          value={row.projectType || "Residential"}
          onChange={e => onEdit("projectType", e.target.value)}
        >
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Industrial">Industrial</option>
          <option value="Mixed">Mixed</option>
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
    case "autoNumber":
      return (
        <span className="text-sm text-gray-600">{row.autoNumber || ""}</span>
      );
    case "predecessors":
      return (
        <input
          className="border rounded px-2 py-1 text-sm w-full"
          value={row.predecessors || ""}
          onChange={e => onEdit("predecessors", e.target.value)}
          placeholder="Enter predecessor IDs (comma separated)"
        />
      );
    case "checklist":
      return (
        <input
          type="checkbox"
          checked={!!row.checklist}
          onChange={e => onEdit("checklist", e.target.checked)}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded"
        />
      );
    case "link":
      return (
        <div className="flex items-center gap-1">
          <input
            className="border rounded px-2 py-1 text-sm flex-1"
            value={row.link || ""}
            onChange={e => onEdit("link", e.target.value)}
            placeholder="Enter link"
          />
          {row.link && (
            <a href={row.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
              <LinkIcon className="w-4 h-4" />
            </a>
          )}
        </div>
      );
    case "rating":
      return (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => onEdit("rating", i)}
              className={`text-lg ${i <= (row.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>
      );
    case "progress":
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded relative overflow-hidden">
            <div 
              className="h-2 rounded bg-blue-500 transition-all duration-500" 
              style={{ width: `${row.progress || 0}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-700 w-8">{row.progress || 0}%</span>
        </div>
      );
    case "color":
      return (
        <input
          type="color"
          value={row.color || "#60a5fa"}
          onChange={e => onEdit("color", e.target.value)}
          className="w-8 h-8 border rounded cursor-pointer"
        />
      );
    case "delete":
      return (
        <button
          type="button"
          onClick={() => onEdit("delete", null)}
          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
          title="Delete"
        >
          🗑️
        </button>
      );
    default:
      return (
        <input
          className="border rounded px-2 py-1 text-sm w-full"
          value={row[col.key] || ""}
          onChange={e => onEdit(col.key, e.target.value)}
        />
      );
  }
};

export default CellRenderer;


