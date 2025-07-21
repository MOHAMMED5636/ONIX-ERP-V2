import React, { useEffect, useRef, useState } from "react";
import { XMarkIcon, PaperClipIcon, UserCircleIcon, InboxArrowDownIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const tabs = ["Updates", "Files", "Activity Log"];

export default function TaskDrawer({ open, onClose, task }) {
  const [activeTab, setActiveTab] = useState("Updates");
  const drawerRef = useRef();

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="ml-auto h-full w-full max-w-[480px] bg-white shadow-2xl rounded-l-2xl flex flex-col transition-transform duration-300 ease-in-out transform translate-x-0"
        style={{ fontFamily: 'Inter, Arial, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-bold text-xs ${task?.owner?.color || 'bg-gray-200 text-gray-700'} border border-white shadow-sm`}>{task?.owner?.initials || <UserCircleIcon className="h-7 w-7 text-gray-400" />}</span>
            <div>
              <div className="font-semibold text-lg text-gray-900">{task?.name}</div>
              <div className="mt-1"><span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${task?.status?.color || 'bg-gray-100 text-gray-700'} shadow-sm border border-gray-200`}>{task?.status?.label}</span></div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100"><XMarkIcon className="h-6 w-6 text-gray-400" /></button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-t font-medium text-sm transition-all duration-150 focus:outline-none ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === "Updates" && <UpdatesTab task={task} />}
          {activeTab === "Files" && <FilesTab task={task} />}
          {activeTab === "Activity Log" && <ActivityLogTab task={task} />}
        </div>
      </aside>
    </div>
  );
}

function UpdatesTab({ task }) {
  const [value, setValue] = useState("");
  // Demo: mention users with @, emoji, attachments (UI only)
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-gray-500 text-sm">Write an update and mention others with <span className="font-mono">@</span></span>
        <button className="text-xs text-blue-600 font-semibold border border-blue-100 rounded px-3 py-1 hover:bg-blue-50">Update via email</button>
      </div>
      <div className="relative mb-2">
        <textarea
          className="w-full min-h-[60px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
          placeholder="Write an update..."
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <div className="absolute right-2 bottom-2 flex gap-2">
          <button className="p-1 rounded hover:bg-gray-100" title="Emoji"><span role="img" aria-label="emoji">😊</span></button>
          <button className="p-1 rounded hover:bg-gray-100" title="Attach file"><PaperClipIcon className="h-5 w-5 text-blue-500" /></button>
          <button className="p-1 rounded hover:bg-gray-100" title="Mention"><span className="font-mono text-blue-500">@</span></button>
        </div>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow text-sm mt-2">Post Update</button>
      {/* Demo: no updates yet */}
      <div className="mt-8 text-center text-gray-400 text-sm">No updates yet</div>
    </div>
  );
}

function FilesTab({ task }) {
  const [files, setFiles] = useState([]);
  const handleDrop = (e) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    setFiles(f => [...f, ...newFiles]);
  };
  return (
    <div>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-400 mb-4 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <InboxArrowDownIcon className="h-10 w-10 mx-auto mb-2" />
        <div>Drag and drop files here, or click to upload</div>
        <input type="file" multiple className="hidden" />
      </div>
      <ul className="space-y-2">
        {files.map((file, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
            <PaperClipIcon className="h-4 w-4 text-blue-500" /> {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivityLogTab({ task }) {
  // Demo: static log
  const log = [
    { time: "2 hours ago", action: "Status changed to Done" },
    { time: "3 hours ago", action: "Owner updated to Bob" },
    { time: "5 hours ago", action: "Task created" },
  ];
  return (
    <ul className="space-y-3">
      {log.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
          <span className="font-medium">{item.action}</span>
          <span className="ml-auto text-xs text-gray-400">{item.time}</span>
        </li>
      ))}
    </ul>
  );
} 