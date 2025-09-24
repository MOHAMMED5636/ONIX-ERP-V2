import React from 'react';
import {
  XMarkIcon,
  StarIcon,
  PaperClipIcon,
  LinkIcon
} from "@heroicons/react/24/outline";
import { format } from 'date-fns';
import { statusColors } from './constants';

const Modals = {
  // Rating prompt modal
  RatingPrompt: ({ showRatingPrompt, setShowRatingPrompt }) => {
    if (!showRatingPrompt) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full text-center">
          <div className="text-lg font-semibold mb-4">Please set status to Done and then come back to rate.</div>
          <button
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
            onClick={() => setShowRatingPrompt(false)}
          >
            OK
          </button>
        </div>
      </div>
    );
  },

  // Project dialog modal
  ProjectDialog: ({ showProjectDialog, selectedProject, setShowProjectDialog }) => {
    if (!showProjectDialog || !selectedProject) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
          <button
            className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
            onClick={() => setShowProjectDialog(false)}
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
          <div className="text-2xl font-bold mb-2">{selectedProject.name}</div>
          <div className="mb-4 text-sm text-gray-500">Reference #: <span className="font-semibold text-gray-700">{selectedProject.referenceNumber}</span></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><span className="font-semibold">Status:</span> <span className="inline-block px-2 py-1 rounded text-white" style={{ background: statusColors[selectedProject.status] || '#ccc' }}>{selectedProject.status}</span></div>
            <div><span className="font-semibold">Client Details:</span> {selectedProject.owner}</div>
            <div><span className="font-semibold">Priority:</span> {selectedProject.priority}</div>
            <div><span className="font-semibold">Category:</span> {selectedProject.category}</div>
            <div><span className="font-semibold">Timeline:</span> {selectedProject.timeline && selectedProject.timeline[0] && selectedProject.timeline[1] ? `${format(new Date(selectedProject.timeline[0]), 'MMM d, yyyy')} – ${format(new Date(selectedProject.timeline[1]), 'MMM d, yyyy')}` : '—'}</div>
            <div><span className="font-semibold">Plan Days:</span> {selectedProject.planDays}</div>
            <div><span className="font-semibold">Location:</span> {selectedProject.location}</div>
            <div><span className="font-semibold">Plot Number:</span> {selectedProject.plotNumber}</div>
            <div><span className="font-semibold">Community:</span> {selectedProject.community}</div>
            <div><span className="font-semibold">Project Type:</span> {selectedProject.projectType}</div>
            <div><span className="font-semibold">Project Floor:</span> {selectedProject.projectFloor}</div>
            <div><span className="font-semibold">Developer Project:</span> {selectedProject.developerProject}</div>
            <div><span className="font-semibold">Remarks:</span> {selectedProject.remarks}</div>
            <div><span className="font-semibold">Assignee Notes:</span> {selectedProject.assigneeNotes}</div>
            <div><span className="font-semibold">Checklist:</span> <input type="checkbox" checked={!!selectedProject.checklist} readOnly className="w-5 h-5 text-blue-600 border-gray-300 rounded" /></div>
            <div><span className="font-semibold">Link:</span> {selectedProject.link && (<a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline inline-flex items-center gap-1"><LinkIcon className="w-4 h-4" />{selectedProject.link}</a>)}</div>
            <div><span className="font-semibold">Files:</span> {selectedProject.attachments && selectedProject.attachments.length > 0 ? (<ul className="mt-1 text-xs text-gray-600">{selectedProject.attachments.map((file, idx) => (<li key={idx} className="flex items-center gap-1"><PaperClipIcon className="w-4 h-4" />{file.name || (typeof file === 'string' ? file : '')}</li>))}</ul>) : 'No files'}</div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">Rating:</span>
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 ${i <= selectedProject.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill={i <= selectedProject.rating ? '#facc15' : 'none'}
                />
              ))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Progress:</span>
            <div className="w-32 h-3 bg-gray-200 rounded relative overflow-hidden">
              <div className="h-3 rounded bg-blue-500 transition-all duration-500" style={{ width: `${selectedProject.progress || 0}%` }}></div>
            </div>
            <span className="text-xs text-gray-700">{selectedProject.progress || 0}%</span>
          </div>
        </div>
      </div>
    );
  },

  // Project summary modal
  ProjectSummary: ({ selectedProjectForSummary, closeProjectSummary }) => {
    if (!selectedProjectForSummary) return null;
    return (
      <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40">
        <div className="bg-white h-full w-full max-w-4xl shadow-2xl rounded-l-2xl p-0 overflow-y-auto relative flex flex-col">
          {/* Accent bar */}
          <div className="h-3 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-400 rounded-tl-2xl" />
          <button
            onClick={closeProjectSummary}
            className="absolute top-6 right-8 text-gray-400 hover:text-red-500 text-3xl font-bold z-10"
            aria-label="Close"
          >
            &times;
          </button>
          <div className="p-16 pt-10 flex-1 flex flex-col">
            <h2 className="text-3xl font-extrabold mb-2 text-gray-900 tracking-tight">{selectedProjectForSummary.name}</h2>
            <div className="text-base text-gray-500 mb-8">Reference #: <span className="font-semibold text-gray-700">{selectedProjectForSummary.referenceNumber}</span></div>
            <div className="space-y-8">
              {/* Project Info Section */}
              <div>
                <div className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                  <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6m-6 0h6" /></svg>
                  Project Info
                </div>
                <div className="space-y-2">
                  <div><span className="text-gray-500">Category: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.category}</span></div>
                  <div><span className="text-gray-500">Type: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.projectType}</span></div>
                  <div><span className="text-gray-500">Plot Number: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.plotNumber}</span></div>
                  <div><span className="text-gray-500">Community: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.community}</span></div>
                  <div><span className="text-gray-500">Project Floor: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.projectFloor}</span></div>
                  <div><span className="text-gray-500">Developer Project: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.developerProject}</span></div>
                </div>
              </div>
              <hr className="my-4 border-gray-200" />
              {/* Status Section */}
              <div>
                <div className="text-lg font-semibold text-cyan-700 mb-4 flex items-center gap-2">
                  <svg className="h-6 w-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
                  Status
                </div>
                <div className="space-y-2">
                  <div><span className="text-gray-500">Status: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.status}</span></div>
                  <div><span className="text-gray-500">Owner: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.owner}</span></div>
                  <div><span className="text-gray-500">Priority: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.priority}</span></div>
                  <div><span className="text-gray-500">Timeline: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.timeline && selectedProjectForSummary.timeline.join(' - ')}</span></div>
                  <div><span className="text-gray-500">Plan Days: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.planDays}</span></div>
                </div>
              </div>
              <hr className="my-4 border-gray-200" />
              {/* Other Info Section */}
              <div>
                <div className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
                  <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 5h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg>
                  Other Info
                </div>
                <div className="space-y-2">
                  <div><span className="text-gray-500">Location: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.location}</span></div>
                  <div><span className="text-gray-500">Remarks: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.remarks}</span></div>
                  <div><span className="text-gray-500">Assignee Notes: </span><span className="font-medium text-gray-900">{selectedProjectForSummary.assigneeNotes}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

  // New task modal
  NewTaskModal: ({ showNewTask, setShowNewTask, handleCreateTask }) => {
    if (!showNewTask) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-bold mb-4">Create New Team Project</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-700 transition w-full"
            onClick={handleCreateTask}
          >
            Create Team Project
          </button>
          <button
            className="mt-2 text-gray-500 hover:underline w-full"
            onClick={() => setShowNewTask(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
};

export default Modals;

