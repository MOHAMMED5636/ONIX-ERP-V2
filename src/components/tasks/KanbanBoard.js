import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
  // Expanded filter state
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

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
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

  return (
    <div className="w-full">
      {/* Filter UI */}
      <div className="flex flex-wrap gap-4 mb-4 p-4 bg-white rounded shadow items-end">
        {/* Global Search Bar */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Search</label>
          <input
            type="text"
            name="global"
            value={filter.global}
            onChange={handleFilterChange}
            className="border rounded px-2 py-1 text-sm"
            placeholder="Search all tasks"
          />
        </div>
        {/* Task Name Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Task Name</label>
          <input
            type="text"
            name="name"
            value={filter.name}
            onChange={handleFilterChange}
            className="border rounded px-2 py-1 text-sm"
            placeholder="Search by name"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
          <select
            name="status"
            value={filter.status}
            onChange={handleFilterChange}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">All</option>
            {columns.map((col) => (
              <option key={col.key} value={col.key}>{col.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Assignee</label>
          <select
            name="assignee"
            value={filter.assignee}
            onChange={handleFilterChange}
            className="border rounded px-2 py-1 text-sm"
          >
            {demoUsers.map((user) => (
              <option key={user} value={user === 'All Users' ? '' : user}>{user}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Part of Plan</label>
          <select
            name="plan"
            value={filter.plan}
            onChange={handleFilterChange}
            className="border rounded px-2 py-1 text-sm"
          >
            {demoPlans.map((plan) => (
              <option key={plan} value={plan === 'All Plans' ? '' : plan}>{plan}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Task Category</label>
          <select
            name="category"
            value={filter.category}
            onChange={handleFilterChange}
            className="border rounded px-2 py-1 text-sm"
          >
            {demoCategories.map((cat) => (
              <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">From</label>
          <select
            name="dateFrom"
            value={filter.dateFrom}
            onChange={handleFilterChange}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">Any</option>
            {demoDates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">To</label>
          <select
            name="dateTo"
            value={filter.dateTo}
            onChange={handleFilterChange}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="">Any</option>
            {demoDates.map((date) => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
      </div>
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
                            className={`bg-white rounded-lg shadow hover:shadow-lg border-l-4 ${col.border} p-3 flex flex-col gap-2 transition-all duration-150 ${snapshot.isDragging ? 'ring-2 ring-blue-300' : ''}`}
                            style={{ minHeight: '110px', ...provided.draggableProps.style }}
                          >
                            <div className="font-semibold text-gray-800 text-sm line-clamp-2 truncate">
                              {task.title}
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
    </div>
  );
} 