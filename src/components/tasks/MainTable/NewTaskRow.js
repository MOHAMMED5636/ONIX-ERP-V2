import React from 'react';
import { MapPinIcon } from "@heroicons/react/24/outline";
import MultiSelectCheckbox from './MultiSelectCheckbox';
import TimelineCell from './TimelineCell';

const NewTaskRow = ({ 
  newTask, 
  setNewTask, 
  columnOrder, 
  columns, 
  handleNewTaskKeyDown, 
  handleCreateTask, 
  handleOpenMapPicker 
}) => {
  const renderCell = (col) => {
    switch (col.key) {
      case "task":
        return (
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
            value={newTask.name}
            onChange={e => setNewTask({ ...newTask, name: e.target.value })}
            onKeyDown={handleNewTaskKeyDown}
            autoFocus
          />
        );
      case "referenceNumber":
        return (
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
            value={newTask.referenceNumber || ""}
            onChange={e => setNewTask({ ...newTask, referenceNumber: e.target.value })}
            onKeyDown={handleNewTaskKeyDown}
          />
        );
      case "category":
        return (
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
            value={newTask.category}
            onChange={e => setNewTask({ ...newTask, category: e.target.value })}
            onKeyDown={handleNewTaskKeyDown}
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
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
            value={newTask.status}
            onChange={e => setNewTask({ ...newTask, status: e.target.value })}
            onKeyDown={handleNewTaskKeyDown}
          >
            <option value="Pending">pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Suspended">Suspended</option>
          </select>
        );
      case "owner":
        return (
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
            value={newTask.owner}
            onChange={e => setNewTask({ ...newTask, owner: e.target.value })}
            onKeyDown={handleNewTaskKeyDown}
          >
            <option value="MN">MN</option>
            <option value="SA">SA</option>
            <option value="AH">AH</option>
            <option value="MA">MA</option>
          </select>
        );
      case "timeline":
        return (
          <TimelineCell
            task={newTask}
            onTimelineChange={(timeline) => setNewTask({ ...newTask, timeline })}
            isEditing={true}
            onKeyDown={handleNewTaskKeyDown}
          />
        );
      case "planDays":
        return (
          <input
            type="number"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
            value={newTask.planDays || ""}
            onChange={e => setNewTask({ ...newTask, planDays: parseInt(e.target.value) || 0 })}
            onKeyDown={handleNewTaskKeyDown}
          />
        );
      case "location":
        return (
          <div className="flex items-center gap-2">
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 flex-1"
              value={newTask.location}
              onChange={e => setNewTask({ ...newTask, location: e.target.value })}
              onKeyDown={handleNewTaskKeyDown}
              placeholder="Enter location or pick on map"
            />
            <button 
              type="button" 
              onClick={() => handleOpenMapPicker('main', newTask.id, null, newTask.location)} 
              title="Pick on map" 
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              <MapPinIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
            </button>
          </div>
        );
      case "autoNumber":
        return <span className="text-gray-600 font-medium">{newTask.autoNumber}</span>;
      default:
        return (
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-full"
            value={newTask[col.key] || ""}
            onChange={e => setNewTask({ ...newTask, [col.key]: e.target.value })}
            onKeyDown={handleNewTaskKeyDown}
            placeholder={`Enter ${col.label?.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
      {/* Multi-select Checkbox Column for New Task */}
      <td className="px-4 py-3 align-middle text-center">
        <MultiSelectCheckbox
          task={newTask}
          isChecked={false}
          onToggle={() => {}} // No-op for new task
        />
      </td>
      {/* Pin Column for New Task */}
      <td className="px-4 py-3 align-middle text-center">
        <button
          onClick={() => setNewTask({ ...newTask, pinned: !newTask.pinned })}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
            newTask.pinned 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
          }`}
          title={newTask.pinned ? "Unpin task" : "Pin task"}
        >
          📌
        </button>
      </td>
      {columnOrder.map((colKey) => {
        const col = columns.find(c => c.key === colKey);
        if (!col) return null;
        return (
          <td key={col.key} className="px-4 py-3 align-middle">
            {renderCell(col)}
          </td>
        );
      })}
      <td key="add-column" className="px-4 py-3 align-middle">
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 font-medium"
            onClick={handleCreateTask}
            title="Save new project"
          >
            Save
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-all duration-200"
            onClick={() => setNewTask(null)}
            title="Cancel new project"
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
};

export default NewTaskRow;



