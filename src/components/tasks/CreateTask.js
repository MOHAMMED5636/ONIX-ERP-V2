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
    <div className="w-full h-full px-2 sm:px-4 md:px-8 py-2 sm:py-4 md:py-8 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-blue-600 text-2xl font-bold">+</span>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Create Task</h1>
      </div>
      <div className="flex-1 w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 md:p-8">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Task Name & Priority */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Task Name <span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full p-2 rounded border text-sm" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Priority <span className="text-red-500">*</span></label>
            <select name="priority" value={form.priority} onChange={handleChange} className="w-full p-2 rounded border text-sm">
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${priorityOptions.find(opt => opt.value === form.priority)?.color}`}>{priorityOptions.find(opt => opt.value === form.priority)?.label}</span>
          </div>
          {/* Owner & Assignee */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Owner <span className="text-red-500">*</span></label>
            <select name="owner" value={form.owner} onChange={handleChange} className="w-full p-2 rounded border text-sm">
              <option value="">Select owner</option>
              {owners.map(o => (
                <option key={o.name} value={o.name}>{o.name}</option>
              ))}
            </select>
            {form.owner && (
              <span className="inline-flex items-center mt-2 px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                {owners.find(o => o.name === form.owner)?.initials}
              </span>
            )}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Assignee <span className="text-red-500">*</span></label>
            <select name="assignee" value={form.assignee} onChange={handleChange} className="w-full p-2 rounded border text-sm">
              <option value="">Select assignee</option>
              {assignees.map(a => (
                <option key={a.name} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
          {/* Status & Category */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 rounded border text-sm">
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${statusOptions.find(opt => opt.value === form.status)?.color}`}>{statusOptions.find(opt => opt.value === form.status)?.label}</span>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Task Category <span className="text-red-500">*</span></label>
            <input name="category" value={form.category} onChange={handleChange} className="w-full p-2 rounded border text-sm" />
          </div>
          {/* Timeline */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Start Date <span className="text-red-500">*</span></label>
            <input type="date" name="start" value={form.start} onChange={handleChange} className="w-full p-2 rounded border text-sm" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">End Date <span className="text-red-500">*</span></label>
            <input type="date" name="end" value={form.end} onChange={handleChange} className="w-full p-2 rounded border text-sm" />
          </div>
          {/* Budget & Plan */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Budget</label>
            <input name="budget" value={form.budget} onChange={handleChange} className="w-full p-2 rounded border text-sm" placeholder="$" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Plan</label>
            <input name="plan" value={form.plan} onChange={handleChange} className="w-full p-2 rounded border text-sm" />
          </div>
          {/* Description (full width) */}
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full p-2 rounded border text-sm" />
          </div>
          {/* File Upload (full width) */}
          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium text-gray-700">File Upload</label>
            <input type="file" name="file" onChange={handleChange} className="w-full p-2 rounded border text-sm" />
            {fileName && <div className="mt-2 text-xs text-gray-600">{fileName}</div>}
          </div>
        </form>
        <div className="flex flex-col md:flex-row justify-end gap-2 mt-8 w-full">
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded shadow text-sm w-full md:w-auto"
          >
            Back to List
          </button>
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded shadow text-sm w-full md:w-auto md:ml-auto"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
} 