import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CheckboxWithPopup from "./MainTable/CheckboxWithPopup";
import ProjectDetailDrawer from "./ProjectDetailDrawer";
import { 
  PlusIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const columns = [
  { key: "pending", label: "Pending", border: "border-orange-400" },
  { key: "inprogress", label: "In Progress", border: "border-blue-400" },
  { key: "done", label: "Done", border: "border-green-500" },
  { key: "cancelled", label: "Cancelled", border: "border-red-200" },
  { key: "suspended", label: "Suspended", border: "border-red-700" },
];

const initialTasks = [
  {
    id: "1",
    title: "Design Landing Page",
    assignee: { name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
    start: "2023-07-01",
    due: "2023-07-10",
    plan: "Ref#1234",
    percent: 40,
    status: "pending",
  },
  {
    id: "2",
    title: "API Integration",
    assignee: { name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
    start: "2023-07-05",
    due: "2023-07-15",
    plan: "Ref#5678",
    percent: 70,
    status: "inprogress",
  },
  {
    id: "3",
    title: "Testing & QA",
    assignee: { name: "Carol", avatar: "https://i.pravatar.cc/40?img=3" },
    start: "2023-07-10",
    due: "2023-07-20",
    plan: "Ref#9012",
    percent: 100,
    status: "done",
  },
  {
    id: "4",
    title: "Client Feedback",
    assignee: { name: "Dave", avatar: "https://i.pravatar.cc/40?img=4" },
    start: "2023-07-12",
    due: "2023-07-22",
    plan: "Ref#3456",
    percent: 0,
    status: "cancelled",
  },
  {
    id: "5",
    title: "Legal Review",
    assignee: { name: "Eve", avatar: "https://i.pravatar.cc/40?img=5" },
    start: "2023-07-15",
    due: "2023-07-25",
    plan: "Ref#7890",
    percent: 0,
    status: "suspended",
  },
];

// Demo data for dropdowns
const demoPlans = ["All Plans", "Ref#1234", "Ref#5678", "Ref#9012", "Ref#3456", "Ref#7890"];
const demoUsers = ["All Users", "Alice", "Bob", "Carol", "Dave", "Eve"];
const demoCategories = ["All Categories", "Design", "Development", "Testing", "Feedback", "Legal"];
const demoDates = [
  "2023-07-01",
  "2023-07-05",
  "2023-07-10",
  "2023-07-12",
  "2023-07-15",
  "2023-07-20",
  "2023-07-22",
  "2023-07-25",
];

function groupTasksByStatus(tasks) {
  const grouped = {};
  columns.forEach((col) => (grouped[col.key] = []));
  tasks.forEach((task) => {
    if (grouped[task.status]) grouped[task.status].push(task);
  });
  return grouped;
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks);
  // Filter state with toggle
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState({
    global: '',
    name: '',
    status: '',
    assignee: '',
    plan: '',
    category: '',
    dateFrom: '',
    dateTo: '',
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskName, setEditingTaskName] = useState("");
  const [summaryTask, setSummaryTask] = useState(null);
  
  // Project Detail Drawer state
  const [showProjectDrawer, setShowProjectDrawer] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  let clickTimer = null;

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilter({
      global: '',
      name: '',
      status: '',
      assignee: '',
      plan: '',
      category: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  // Filter tasks before grouping
  const filteredTasks = tasks.filter((task) => {
    // Global search: match if any field contains the global search string
    const globalMatch =
      filter.global === '' ||
      task.title.toLowerCase().includes(filter.global.toLowerCase()) ||
      task.assignee.name.toLowerCase().includes(filter.global.toLowerCase()) ||
      task.plan.toLowerCase().includes(filter.global.toLowerCase()) ||
      task.start.includes(filter.global) ||
      task.due.includes(filter.global);
    const nameMatch = filter.name === '' || task.title.toLowerCase().includes(filter.name.toLowerCase());
    const statusMatch = filter.status === '' || task.status === filter.status;
    const assigneeMatch = filter.assignee === '' || task.assignee.name === filter.assignee;
    const planMatch = filter.plan === '' || filter.plan === 'All Plans' || task.plan === filter.plan;
    // For demo, assign categories to tasks by id
    const taskCategory = (() => {
      if (task.id === '1') return 'Design';
      if (task.id === '2') return 'Development';
      if (task.id === '3') return 'Testing';
      if (task.id === '4') return 'Feedback';
      if (task.id === '5') return 'Legal';
      return '';
    })();
    const categoryMatch = filter.category === '' || filter.category === 'All Categories' || taskCategory === filter.category;
    // Date range filter
    const fromMatch = filter.dateFrom === '' || new Date(task.start) >= new Date(filter.dateFrom);
    const toMatch = filter.dateTo === '' || new Date(task.due) <= new Date(filter.dateTo);
    return globalMatch && nameMatch && statusMatch && assigneeMatch && planMatch && categoryMatch && fromMatch && toMatch;
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const sourceCol = result.source.droppableId;
    const destCol = result.destination.droppableId;
    if (sourceCol === destCol && result.source.index === result.destination.index) return;
    const grouped = groupTasksByStatus(tasks);
    const [removed] = grouped[sourceCol].splice(result.source.index, 1);
    removed.status = destCol;
    grouped[destCol].splice(result.destination.index, 0, removed);
    // Flatten grouped back to array
    const newTasks = [].concat(...columns.map((col) => grouped[col.key]));
    setTasks(newTasks);
  };

  const grouped = groupTasksByStatus(filteredTasks);

  // Inline edit handlers
  const handleTaskNameClick = (task) => {
    // Use timer to distinguish single vs double click
    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      setEditingTaskId(task.id);
      setEditingTaskName(task.title);
    }, 200);
  };
  const handleTaskNameDoubleClick = (task) => {
    if (clickTimer) clearTimeout(clickTimer);
    setSummaryTask(task);
  };
  const handleTaskNameChange = (e) => setEditingTaskName(e.target.value);
  const handleTaskNameBlur = (task) => {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, title: editingTaskName } : t));
    setEditingTaskId(null);
  };
  const handleTaskNameKeyDown = (e, task) => {
    if (e.key === "Enter") {
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, title: editingTaskName } : t));
      setEditingTaskId(null);
    } else if (e.key === "Escape") {
      setEditingTaskId(null);
    }
  };
  const closeSummary = () => setSummaryTask(null);

  // Handle card click to open project drawer
  const handleCardClick = (task) => {
    setSelectedProject(task);
    setShowProjectDrawer(true);
  };

  // Close project drawer
  const closeProjectDrawer = () => {
    setShowProjectDrawer(false);
    setSelectedProject(null);
  };

  // Checkbox column handlers for Kanban
  const handleEditTask = (task) => {
    // For Kanban, we can show a simple edit modal or inline edit
    setSummaryTask(task);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm(`Are you sure you want to delete this task?`)) {
      setTasks(tasks => tasks.filter(task => task.id !== taskId));
    }
  };

  const handleCopyTask = (taskData) => {
    const content = `Task: ${taskData.title}
Assignee: ${taskData.assignee.name}
Plan: ${taskData.plan}
Start: ${taskData.start}
Due: ${taskData.due}
Status: ${taskData.status}
Progress: ${taskData.percent}%`;
    
    navigator.clipboard.writeText(content).then(() => {
      // Show a brief success message
      const originalText = document.title;
      document.title = 'Copied to clipboard!';
      setTimeout(() => {
        document.title = originalText;
      }, 1000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard');
    });
  };

  return (
    <div className="w-full">
      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - Kanban Board Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Bars3Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Kanban Board</h2>
              <p className="text-sm text-gray-600">Project workflow management</p>
            </div>
          </div>
          
          {/* Right side - Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
              <PlusIcon className="w-5 h-5" /> New Task
            </button>
            
            <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
              <ArrowDownTrayIcon className="w-5 h-5" /> Export
            </button>
            
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks... (Ctrl+K to focus)"
                className="w-56 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            {/* Show Filters Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300 bg-white shadow-sm"
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filter Panel - Toggle Based */}
      {showFilters && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-4 mx-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Filter Tasks</h3>
          <div className="flex-1"></div>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Global Search Bar */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search All Tasks</label>
            <div className="relative">
              <input
                type="text"
                name="global"
                value={filter.global}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Search by title, assignee, plan, or dates..."
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Task Name Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Task Name</label>
            <input
              type="text"
              name="name"
              value={filter.name}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Search by name"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="">All Statuses</option>
              {columns.map((col) => (
                <option key={col.key} value={col.key}>{col.label}</option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Assignee</label>
            <select
              name="assignee"
              value={filter.assignee}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              {demoUsers.map((user) => (
                <option key={user} value={user === 'All Users' ? '' : user}>{user}</option>
              ))}
            </select>
          </div>

          {/* Part of Plan Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Part of Plan</label>
            <select
              name="plan"
              value={filter.plan}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              {demoPlans.map((plan) => (
                <option key={plan} value={plan === 'All Plans' ? '' : plan}>{plan}</option>
              ))}
            </select>
          </div>

          {/* Task Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Task Category</label>
            <select
              name="category"
              value={filter.category}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              {demoCategories.map((cat) => (
                <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date From Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
            <select
              name="dateFrom"
              value={filter.dateFrom}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="">Any Date</option>
              {demoDates.map((date) => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>

          {/* Date To Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
            <select
              name="dateTo"
              value={filter.dateTo}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="">Any Date</option>
              {demoDates.map((date) => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
        </div>

          {/* Active Filters Display */}
          {Object.values(filter).some(value => value !== '') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filter).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                    >
                      {key}: {value}
                      <button
                        onClick={() => setFilter(prev => ({ ...prev, [key]: '' }))}
                        className="ml-1 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
      </div>
      )}
      {/* Kanban Columns */}
      <div className="flex w-full overflow-x-auto gap-4 p-4 min-h-[70vh]">
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map((col) => (
            <Droppable droppableId={col.key} key={col.key}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col w-72 min-w-[18rem] bg-gray-50 rounded-xl border-2 ${col.border} shadow-md p-3 transition-all duration-200 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                  style={{ height: '80vh' }}
                >
                  <div className="font-bold text-lg mb-3 text-gray-700 flex items-center gap-2">
                    {col.label}
                    <span className="text-xs bg-gray-200 rounded px-2 py-0.5 ml-1">{grouped[col.key].length}</span>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {grouped[col.key].map((task, idx) => (
                      <Draggable draggableId={task.id} index={idx} key={task.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-lg shadow hover:shadow-lg border-l-4 ${col.border} p-3 flex flex-col gap-2 transition-all duration-150 ${snapshot.isDragging ? 'ring-2 ring-blue-300' : ''} cursor-pointer`}
                            style={{ minHeight: '110px', ...provided.draggableProps.style }}
                            onClick={(e) => {
                              // Prevent click when editing or interacting with checkbox
                              if (editingTaskId === task.id || e.target.closest('.checkbox-popup')) return;
                              handleCardClick(task);
                            }}
                          >
                            {/* Checkbox for Kanban card */}
                            <div className="flex justify-end mb-1">
                              <CheckboxWithPopup
                                task={task}
                                onEdit={handleEditTask}
                                onDelete={handleDeleteTask}
                                onCopy={handleCopyTask}
                                isSubtask={false}
                              />
                            </div>
                            <div
                              className="font-semibold text-gray-800 text-sm line-clamp-2 truncate cursor-pointer"
                              onClick={() => handleTaskNameClick(task)}
                              onDoubleClick={() => handleTaskNameDoubleClick(task)}
                            >
                              {editingTaskId === task.id ? (
                                <input
                                  type="text"
                                  value={editingTaskName}
                                  autoFocus
                                  onChange={handleTaskNameChange}
                                  onBlur={() => handleTaskNameBlur(task)}
                                  onKeyDown={(e) => handleTaskNameKeyDown(e, task)}
                                  className="border rounded px-1 py-0.5 text-sm w-full"
                                />
                              ) : (
                                task.title
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <img src={task.assignee.avatar} alt={task.assignee.name} className="w-7 h-7 rounded-full border" />
                              <span className="text-xs text-gray-600 font-medium truncate max-w-[80px]">{task.assignee.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                              <span>Start: <span className="font-medium text-gray-700">{task.start}</span></span>
                              <span>Due: <span className="font-medium text-gray-700">{task.due}</span></span>
                            </div>
                            <div className="flex items-center justify-between text-xs mt-1">
                              <span className="bg-gray-100 rounded px-2 py-0.5">{task.plan}</span>
                              {col.key === 'done' ? (
                                <span className="text-green-600 font-bold">Done</span>
                              ) : (
                                <span className="text-blue-600 font-semibold">{task.percent}%</span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
      {/* Summary Modal */}
      {summaryTask && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw] relative">
            <button onClick={closeSummary} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">&times;</button>
            <h2 className="text-lg font-bold mb-2">Task Summary</h2>
            <div className="mb-2"><b>Name:</b> {summaryTask.title}</div>
            <div className="mb-2"><b>Assignee:</b> {summaryTask.assignee.name}</div>
            <div className="mb-2"><b>Plan:</b> {summaryTask.plan}</div>
            <div className="mb-2"><b>Start:</b> {summaryTask.start}</div>
            <div className="mb-2"><b>Due:</b> {summaryTask.due}</div>
            <div className="mb-2"><b>Status:</b> {summaryTask.status}</div>
            <div className="mb-2"><b>Progress:</b> {summaryTask.percent}%</div>
          </div>
        </div>
      )}

      {/* Project Detail Drawer */}
      <ProjectDetailDrawer
        isOpen={showProjectDrawer}
        onClose={closeProjectDrawer}
        projectId={selectedProject?.id}
        projectData={selectedProject}
      />
    </div>
  );
} 