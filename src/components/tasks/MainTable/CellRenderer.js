import React from 'react';
import { MapPinIcon, StarIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import TimelineCell from './TimelineCell';
import { statusColors } from '../utils/tableUtils';

const CellRenderer = {
  renderSubtaskCell: (col, sub, task, subIdx, handleEditSubtask, isAdmin, handleSubtaskKeyDown, handleEditTask, handleDeleteTask, handleOpenChat, setAttachmentsModalTarget, handleOpenMapPicker, setAttachmentsModalItems, setAttachmentsModalOpen, onOpenQuestionnaireModal, onOpenQuestionnaireResponseModal, isManager) => {
    switch (col.key) {
      case "task":
      case "project name":
        return (
          <input
            className="border rounded px-2 py-1 text-sm font-bold text-gray-900 w-full"
            value={sub.name || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "name", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="Subtask name"
          />
        );
      case "category":
      case "task category":
        return (
          <select
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.category || "Design"}
            onChange={e => handleEditSubtask(task.id, sub.id, "category", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
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
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.referenceNumber || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "referenceNumber", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="Reference number"
          />
        );
      case "status":
        return (
          <select
            className={`border rounded px-2 py-1 text-xs font-bold w-full ${statusColors[sub.status] || 'bg-gray-200 text-gray-700'}`}
            value={sub.status || "not started"}
            onChange={e => handleEditSubtask(task.id, sub.id, "status", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
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
              // Handle engineer invite for subtask
              console.log('Subtask employee badge clicked for invite:', sub.owner);
            }}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs bg-pink-200 text-pink-700 border border-white shadow-sm hover:bg-pink-300 transition-colors cursor-pointer"
            title={`Click to invite engineer to ${sub.name}`}
          >
            {sub.owner || "?"}
          </button>
        );
      case "timeline":
        const subTimelineHasPredecessors = sub.predecessors && sub.predecessors.toString().trim() !== '';
        return (
          <TimelineCell 
            value={sub.timeline} 
            onChange={val => handleEditSubtask(task.id, sub.id, "timeline", val)} 
            hasPredecessors={subTimelineHasPredecessors} 
          />
        );
      case "priority":
        return (
          <select
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.priority || "Low"}
            onChange={e => handleEditSubtask(task.id, sub.id, "priority", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        );
      case "planDays":
        return (
          <input
            type="number"
            min={0}
            className="border rounded px-2 py-1 text-sm w-20 text-center bg-gray-100 cursor-not-allowed"
            value={sub.planDays || 0}
            readOnly={true}
            disabled={true}
            placeholder="Days"
            title="Plan days is not editable"
          />
        );
      case "remarks":
        return (
          <textarea
            className="border rounded px-2 py-1 text-xs w-full resize-none"
            value={sub.remarks || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "remarks", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="Remarks"
            rows={2}
          />
        );
      case "assigneeNotes":
        return (
          <textarea
            className="border rounded px-2 py-1 text-xs w-full resize-none"
            value={sub.assigneeNotes || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "assigneeNotes", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="Assignee notes"
            rows={2}
          />
        );
      case "attachments":
        return (
          <div>
            <button
              type="button"
              onClick={() => {
                if (setAttachmentsModalTarget && setAttachmentsModalItems && setAttachmentsModalOpen) {
                  setAttachmentsModalTarget({ type: 'sub', taskId: task.id, subId: sub.id });
                  setAttachmentsModalItems(sub.attachments || []);
                  setAttachmentsModalOpen(true);
                }
              }}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
            >
              <PaperClipIcon className="w-3 h-3" />
              {sub.attachments && sub.attachments.length > 0 
                ? `${sub.attachments.length} file(s)` 
                : 'Add files'
              }
            </button>
            {sub.attachments && sub.attachments.length > 0 && (
              <ul className="mt-1 text-xs text-gray-600">
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
      case "location":
        return (
          <div className="flex items-center gap-1">
            <input
              className="border rounded px-2 py-1 text-sm flex-1"
              value={sub.location || ""}
              onChange={e => handleEditSubtask(task.id, sub.id, "location", e.target.value)}
              onKeyDown={handleSubtaskKeyDown}
              placeholder="Location"
            />
            <button 
              type="button" 
              onClick={() => {
                if (handleOpenMapPicker) {
                  handleOpenMapPicker('sub', task.id, sub.id, sub.location);
                }
              }}
              title="Pick on map"
              className="text-blue-500 hover:text-blue-700"
            >
              <MapPinIcon className="w-4 h-4" />
            </button>
          </div>
        );
      case "plotNumber":
        return (
          <input
            className="border rounded px-2 py-1 text-xs w-full"
            value={sub.plotNumber || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "plotNumber", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="Plot #"
          />
        );
      case "community":
        return (
          <input
            className="border rounded px-2 py-1 text-xs w-full"
            value={sub.community || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "community", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="Community"
          />
        );
      case "projectType":
        return (
          <select
            className="border rounded px-2 py-1 text-xs w-full"
            value={sub.projectType || "Residential"}
            onChange={e => handleEditSubtask(task.id, sub.id, "projectType", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
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
            className="border rounded px-2 py-1 text-xs w-full"
            value={sub.projectFloor || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "projectFloor", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="Floor"
          />
        );
      case "developerProject":
        return (
          <input
            className="border rounded px-2 py-1 text-xs w-full"
            value={sub.developerProject || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "developerProject", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="Developer project"
          />
        );
      case "autoNumber":
      case "auto #":
        return <span className="text-sm text-gray-600 font-medium">{subIdx + 1}</span>;
      case "predecessors":
        const subPredecessorsHasValue = sub.predecessors && sub.predecessors.toString().trim() !== '';
        return (
          <div className="relative">
            <input
              className={`border rounded px-2 py-1 text-sm pr-6 w-full ${subPredecessorsHasValue ? 'border-green-300 bg-green-50' : ''}`}
              value={sub.predecessors || ""}
              onChange={e => handleEditSubtask(task.id, sub.id, "predecessors", e.target.value)}
              onKeyDown={handleSubtaskKeyDown}
              placeholder="Task IDs"
            />
            {subPredecessorsHasValue && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600">🔗</span>
            )}
          </div>
        );
      case "checklist":
        const checklistItems = sub.checklistItems || [];
        const hasChecklist = checklistItems.length > 0;
        
        // Determine which modal to open based on user role
        const handleChecklistClick = () => {
          if (isManager && onOpenQuestionnaireModal) {
            // Managers open questionnaire management modal for sub-task
            onOpenQuestionnaireModal({
              projectId: task.id,
              taskId: null, // Not for task, but for sub-task
              subtaskId: sub.id, // Use sub-task ID
            });
          } else if (!isManager && onOpenQuestionnaireResponseModal) {
            // Employees open response modal for sub-task
            onOpenQuestionnaireResponseModal({
              projectId: task.id,
              taskId: null,
              subtaskId: sub.id, // Use sub-task ID
            });
          }
        };
        
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={handleChecklistClick}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                hasChecklist 
                  ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
              }`}
              title={isManager ? 'Manage Questionnaire (Managers)' : 'Answer Questionnaire (Employees)'}
            >
              {hasChecklist ? (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {checklistItems.length} items
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {isManager ? 'Manage Checklist' : 'Answer Checklist'}
                </>
              )}
            </button>
          </div>
        );
      case "link":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.link || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "link", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="Enter link"
          />
        );
      case "rating":
        // Subtask rating: always editable so user can rate stars
        return (
          <span className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <StarIcon
                key={i}
                className={`w-5 h-5 cursor-pointer transition ${i <= (sub.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                onClick={() => handleEditSubtask(task.id, sub.id, "rating", i)}
                fill={i <= (sub.rating || 0) ? '#facc15' : 'none'}
              />
            ))}
          </span>
        );
      case "progress":
        return (
          <div className="flex flex-col items-center">
            <div className="w-24 h-2 bg-gray-200 rounded relative overflow-hidden mb-1">
              <div
                className="h-2 rounded bg-blue-500 transition-all duration-500"
                style={{ width: `${sub.progress || 0}%` }}
              ></div>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-gray-700">{sub.progress || 0}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={sub.progress || 0}
              onChange={e => handleEditSubtask(task.id, sub.id, "progress", Number(e.target.value))}
              className="w-24"
            />
          </div>
        );
      case "color":
        return (
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <span className="inline-block w-6 h-6 rounded-full border-2 border-gray-200" style={{ background: sub.color || '#3B82F6' }}></span>
            <input
              type="color"
              value={sub.color || '#3B82F6'}
              onChange={e => handleEditSubtask(task.id, sub.id, "color", e.target.value)}
              className="w-6 h-6 p-0 border-0 bg-transparent"
              style={{ visibility: 'hidden', position: 'absolute' }}
            />
            <span className="text-xs text-gray-500">{sub.color || '#3B82F6'}</span>
          </label>
        );
      case "client":
        return (
          <input
            className="border rounded px-2 py-1 text-sm w-full"
            value={sub.client || ""}
            onChange={e => handleEditSubtask(task.id, sub.id, "client", e.target.value)}
            onKeyDown={handleSubtaskKeyDown}
            placeholder="Client name"
          />
        );
      default:
        return <span className="text-sm text-gray-600">{sub[col.key] || ''}</span>;
    }
  }
};

export default CellRenderer;
