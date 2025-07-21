import React from "react";

export default function ProjectChatHeader({ project }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
      <div className="font-bold text-lg">{project.name}</div>
      <button className="text-gray-500 hover:text-indigo-600">
        <svg width="24" height="24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/></svg>
      </button>
    </div>
  );
} 