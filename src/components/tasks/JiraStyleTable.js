import React, { useState } from "react";

// Badge component for status
const StatusBadge = ({ status }) => {
  const colors = {
    "TO DO": "bg-gray-200 text-gray-700",
    "IN PROGRESS": "bg-yellow-200 text-yellow-800",
    DONE: "bg-green-200 text-green-800",
  };

  return (
    <span
      className={`px-1 py-1 rounded text-xs font-semibold ${
        colors[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

// Row component
const TableRow = ({ item, onToggle, isSelected }) => {
  return (
    <tr className="border-b hover:bg-gray-50 text-sm">
      <td className="px-3 py-2 border-r min-w-[50px]">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(item.key)}
          className="cursor-pointer"
        />
      </td>
      <td className="px-3 py-2 border-r min-w-[100px]">{item.type}</td>
      <td className="px-3 py-2 border-r min-w-[90px]">{item.key}</td>
      <td className="px-3 py-2 border-r min-w-[120px]">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-3 py-2 border-r min-w-[120px]">{item.owner}</td>
      <td className="px-3 py-2 border-r min-w-[150px]">{item.projectName}</td>
      <td className="px-3 py-2 border-r min-w-[120px]">{item.timeline}</td>
      <td className="px-3 py-2 border-r min-w-[120px]">{item.planDays}</td>
      <td className="px-3 py-2 border-r min-w-[120px]">{item.remarks}</td>
      <td className="px-3 py-2 border-r min-w-[150px]">{item.assigneeNotes}</td>
      <td className="px-3 py-2 border-r min-w-[120px]">{item.attachments}</td>
      <td className="px-3 py-2 border-r min-w-[100px]">{item.priority}</td>
      <td className="px-3 py-2 border-r min-w-[120px]">{item.location}</td>
      <td className="px-3 py-2 border-r min-w-[120px]">{item.plotNumber}</td>
      <td className="px-3 py-2 border-r min-w-[150px]">{item.community}</td>
      <td className="px-3 py-2 border-r min-w-[120px]">{item.projectType}</td>
      <td className="px-3 py-2 border-r min-w-[120px]">{item.projectFloor}</td>
      <td className="px-3 py-2 border-r min-w-[150px]">
        {item.developerProject}
      </td>
      <td className="px-3 py-2 border-r min-w-[90px]">{item.autoNumber}</td>
      <td className="px-3 py-2 border-r min-w-[150px]">{item.predecessors}</td>
      <td className="px-3 py-2 border-r min-w-[120px]">{item.checklist}</td>
      <td className="px-3 py-2 border-r min-w-[150px]">{item.link}</td>
      <td className="px-3 py-2 border-r min-w-[100px]">{item.rating}</td>
      <td className="px-3 py-2 border-r min-w-[120px]">{item.progress}</td>
      <td className="px-3 py-2 border-r min-w-[100px]">{item.color}</td>
    </tr>
  );
};

// Main Table Component
const JiraStyleTable = ({ data }) => {
  const [selectedKeys, setSelectedKeys] = useState([]);

  const toggleSelection = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">My Kanban Project</h2>
        <div className="space-x-2">
          <button className="px-3 py-1 border rounded text-sm">Sort</button>
          <button className="px-3 py-1 border rounded text-sm">Filter</button>
        </div>
      </div>

      {/* Enable horizontal scrolling */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full border-collapse bg-white text-left">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="px-3 py-2 border-r min-w-[50px]"></th>
              <th className="px-3 py-2 border-r min-w-[100px]">Type</th>
              <th className="px-3 py-2 border-r min-w-[90px]">Ref.No</th>
              <th className="px-3 py-2 border-r min-w-[120px]">Status</th>
              <th className="px-3 py-2 border-r min-w-[120px]">Owner</th>
              <th className="px-3 py-2 border-r min-w-[150px]">Project Name</th>
              <th className="px-3 py-2 border-r min-w-[120px]">Timeline</th>
              <th className="px-3 py-2 border-r min-w-[120px]">Plan Days</th>
              <th className="px-3 py-2 border-r min-w-[120px]">Remarks</th>
              <th className="px-3 py-2 border-r min-w-[150px]">
                Assignee Notes
              </th>
              <th className="px-3 py-2 border-r min-w-[120px]">Attachments</th>
              <th className="px-3 py-2 border-r min-w-[100px]">Priority</th>
              <th className="px-3 py-2 border-r min-w-[120px]">Location</th>
              <th className="px-3 py-2 border-r min-w-[120px]">Plot Number</th>
              <th className="px-3 py-2 border-r min-w-[150px]">Community</th>
              <th className="px-3 py-2 border-r min-w-[120px]">Project Type</th>
              <th className="px-3 py-2 border-r min-w-[120px]">
                Project Floor
              </th>
              <th className="px-3 py-2 border-r min-w-[150px]">
                Developer Project
              </th>
              <th className="px-3 py-2 border-r min-w-[90px]">Auto #</th>
              <th className="px-3 py-2 border-r min-w-[150px]">Predecessors</th>
              <th className="px-3 py-2 border-r min-w-[120px]">Checklist</th>
              <th className="px-3 py-2 border-r min-w-[150px]">Link</th>
              <th className="px-3 py-2 border-r min-w-[100px]">Rating</th>
              <th className="px-3 py-2 border-r min-w-[120px]">Progress</th>
              <th className="px-3 py-2 border-r min-w-[100px]">Color</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <TableRow
                key={item.key}
                item={item}
                isSelected={selectedKeys.includes(item.key)}
                onToggle={toggleSelection}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JiraStyleTable;
