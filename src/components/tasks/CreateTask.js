import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const owners = [
  { name: "Alice", initials: "AL" },
  { name: "Bob", initials: "BO" },
  { name: "Charlie", initials: "CH" },
];
const assignees = [
  { name: "Alice" },
  { name: "Bob" },
  { name: "Charlie" },
];
const statusOptions = [
  { value: "not_started", label: "Not Started", color: "bg-gray-300 text-gray-700" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-200 text-blue-800" },
  { value: "done", label: "Done", color: "bg-green-200 text-green-800" },
  { value: "stuck", label: "Stuck", color: "bg-red-200 text-red-800" },
];
const priorityOptions = [
  { value: "low", label: "Low", color: "bg-blue-100 text-blue-700" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  { value: "high", label: "High", color: "bg-red-100 text-red-700" },
];

export default function CreateTask() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    owner: "",
    assignee: "",
    status: "not_started",
    priority: "low",
    category: "",
    start: "",
    end: "",
    budget: "",
    description: "",
    file: null,
  });
  const [fileName, setFileName] = useState("");

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm(f => ({ ...f, file: files[0] }));
      setFileName(files[0]?.name || "");
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskName, setEditingTaskName] = useState("");
  const [summaryTask, setSummaryTask] = useState(null);
  const clickTimerRef = useRef(null);

  const handleEdit = (task, field, value) => {
    // Update your task list state here
    // Example:
    // setTasks(prev =>
    //   prev.map(t =>
    //     t.id === task.id ? { ...t, [field]: value } : t
    //   )
    // );
  };

  const handleTaskNameClick = (task) => {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setEditingTaskId(task.id);
      setEditingTaskName(task.name);
    }, 200);
  };
  const handleTaskNameDoubleClick = (task) => {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    setSummaryTask(task);
  };
  const handleTaskNameChange = (e) => setEditingTaskName(e.target.value);
  const handleTaskNameBlur = (task) => {
    handleEdit(task, "name", editingTaskName);
    setEditingTaskId(null);
  };
  const handleTaskNameKeyDown = (e, task) => {
    if (e.key === "Enter") {
      handleEdit(task, "name", editingTaskName);
      setEditingTaskId(null);
    } else if (e.key === "Escape") {
      setEditingTaskId(null);
    }
  };
  const closeSummary = () => setSummaryTask(null);

  return (
    <div className="w-full h-full px-2 sm:px-4 md:px-8 py-2 sm:py-4 md:py-8 flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg">
          <span className="text-white text-2xl font-bold">+</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Create Task</h1>
      </div>
      <div className="flex-1 w-full max-w-5xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 md:p-10">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Task Name & Priority */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Task Name <span className="text-red-500">*</span></label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Priority <span className="text-red-500">*</span></label>
            <select 
              name="priority" 
              value={form.priority} 
              onChange={handleChange} 
              className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${priorityOptions.find(opt => opt.value === form.priority)?.color}`}>
              {priorityOptions.find(opt => opt.value === form.priority)?.label}
            </span>
          </div>
          {/* Owner & Assignee */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Owner <span className="text-red-500">*</span></label>
            <select 
              name="owner" 
              value={form.owner} 
              onChange={handleChange} 
              className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <option value="">Select owner</option>
              {owners.map(o => (
                <option key={o.name} value={o.name}>{o.name}</option>
              ))}
            </select>
            {form.owner && (
              <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-bold shadow-sm">
                {owners.find(o => o.name === form.owner)?.initials}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Assignee <span className="text-red-500">*</span></label>
            <select 
              name="assignee" 
              value={form.assignee} 
              onChange={handleChange} 
              className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <option value="">Select assignee</option>
              {assignees.map(a => (
                <option key={a.name} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
          {/* Status & Category */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Status <span className="text-red-500">*</span></label>
            <select 
              name="status" 
              value={form.status} 
              onChange={handleChange} 
              className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${statusOptions.find(opt => opt.value === form.status)?.color}`}>
              {statusOptions.find(opt => opt.value === form.status)?.label}
            </span>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Task Category <span className="text-red-500">*</span></label>
            <input 
              name="category" 
              value={form.category} 
              onChange={handleChange} 
              className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md" 
            />
          </div>
          {/* Timeline */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Start Date <span className="text-red-500">*</span></label>
            <input 
              type="date" 
              name="start" 
              value={form.start} 
              onChange={handleChange} 
              className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">End Date <span className="text-red-500">*</span></label>
            <input 
              type="date" 
              name="end" 
              value={form.end} 
              onChange={handleChange} 
              className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md" 
            />
          </div>
          {/* Budget & Plan */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Budget</label>
            <input 
              name="budget" 
              value={form.budget} 
              onChange={handleChange} 
              className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md" 
              placeholder="$" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Plan</label>
            <input 
              name="plan" 
              value={form.plan} 
              onChange={handleChange} 
              className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md" 
            />
          </div>
          {/* Description (full width) */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Description <span className="text-red-500">*</span></label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              rows={4} 
              className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md resize-none" 
            />
          </div>
          {/* File Upload (full width) */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">File Upload</label>
            <input 
              type="file" 
              name="file" 
              onChange={handleChange} 
              className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            />
            {fileName && (
              <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200">
                {fileName}
              </div>
            )}
          </div>
        </form>
        <div className="flex flex-col md:flex-row justify-end gap-3 mt-10 w-full">
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-sm w-full md:w-auto"
          >
            Back to List
          </button>
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-sm w-full md:w-auto md:ml-auto"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
} 