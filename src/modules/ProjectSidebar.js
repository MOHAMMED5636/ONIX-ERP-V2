import React from "react";

const mockProjects = [
  { id: 2, name: "HR Portal", unread: 0 },
  { id: 3, name: "Mobile App", unread: 5 }
];

export default function ProjectSidebar({ selectedProject, onSelect }) {
  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-200 flex-shrink-0 flex flex-col h-full pt-2">
      <div className="h-full pl-4 pr-2 pb-2 space-y-1 flex flex-col">
        <input
          type="text"
          placeholder="Search projects..."
          className="w-full px-2 py-1 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <h2 className="font-semibold text-gray-700 text-sm">Projects</h2>
        <ul className="space-y-1 flex-1 overflow-y-auto">
          {mockProjects.map((proj) => (
            <li
              key={proj.id}
              className={`hover:bg-gray-100 py-1 px-2 rounded text-sm flex items-center justify-between cursor-pointer ${
                selectedProject && selectedProject.id === proj.id
                  ? "bg-indigo-100 font-bold" : ""
              }`}
              onClick={() => onSelect(proj)}
            >
              <span>{proj.name}</span>
              {proj.unread > 0 && (
                <span className="bg-indigo-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                  {proj.unread}
                </span>
              )}
            </li>
          ))}
        </ul>
        <button className="w-full bg-indigo-500 text-white rounded py-1 text-sm hover:bg-indigo-600">+</button>
      </div>
    </aside>
  );
} 