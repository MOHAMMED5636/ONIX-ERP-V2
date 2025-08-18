// Refactored TeamProjectTracker component using modular components
import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import MapPicker from '../modules/WorkingLocations.js';
import ReorderableDropdown from "./tasks/ReorderableDropdown";
import ProjectRow from "./tasks/MainTable/ProjectRow";
import CompletedProjects from "./tasks/MainTable/CompletedProjects";
import Filters from "./tasks/MainTable/Filters";
import DraggableHeader from "./tasks/MainTable/DraggableHeader";
import CellRenderer from "./tasks/MainTable/CellRenderer";
import Modals from "./tasks/MainTable/Modals";
import {
  INITIAL_COLUMNS,
  calculateTaskTimelines,
  filterTasks,
  filterCompletedTasks,
  getDefaultColumnOrder,
  loadColumnOrderFromStorage,
  saveColumnOrderToStorage,
  getMissingColumns,
  validateTask,
  generateTaskId,
  createNewTask,
  createNewSubtask,
  calculateTaskProgress,
  areAllSubtasksComplete,
  createNewColumn,
  addColumnToTasks,
  formatLocationString
} from "./tasks/utils/tableUtils";

// Initial data for team projects
const initialTasks = [
  {
    id: 1,
    name: "Building construction",
    referenceNumber: "REF-001",
    category: "Development",
    status: "done",
    owner: "MN",
    timeline: [null, null],
    planDays: 10,
    remarks: "",
    assigneeNotes: "",
    attachments: [],
    priority: "Low",
    location: "Onix engineering co.",
    plotNumber: "PLOT-001",
    community: "Downtown District",
    projectType: "Residential",
    projectFloor: "5",
    developerProject: "Onix Development",
    checklist: false,
    rating: 3,
    progress: 50,
    color: "#60a5fa",
    subtasks: [
      {
        id: 11,
        name: "Subitem 1",
        referenceNumber: "REF-001-1",
        category: "Design",
        status: "done",
        owner: "SA",
        timeline: [null, null],
        remarks: "",
        assigneeNotes: "",
        attachments: [],
        priority: "Low",
        location: "",
        plotNumber: "PLOT-001-1",
        community: "Downtown District",
        projectType: "Residential",
        projectFloor: "5",
        developerProject: "Onix Development",
        completed: false,
        checklist: false,
        rating: 2,
        progress: 20,
        color: "#f59e42"
      },
      {
        id: 12,
        name: "Subitem 2",
        category: "Development",
        status: "working",
        owner: "MN",
        due: "2024-07-19",
        priority: "Medium",
        timeline: "2024-07-19 – 2024-07-20",
        location: "",
        completed: false,
        checklist: false,
        rating: 4,
        progress: 60,
        color: "#10b981"
      }
    ]
  }
];

// Google Map Picker Demo Component
function GoogleMapPickerDemo({ onPick, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Pick Location</h2>
        <div className="space-y-4">
          <button
            className="w-full bg-blue-500 text-white p-2 rounded"
            onClick={() => onPick(25.2048, 55.2708)} // Dubai coordinates
          >
            Pick Dubai
          </button>
          <button
            className="w-full bg-green-500 text-white p-2 rounded"
            onClick={() => onPick(40.7128, -74.0060)} // New York coordinates
          >
            Pick New York
          </button>
          <button
            className="w-full bg-red-500 text-white p-2 rounded"
            onClick={() => onPick(51.5074, -0.1278)} // London coordinates
          >
            Pick London
          </button>
        </div>
        <button
          className="mt-4 w-full bg-gray-500 text-white p-2 rounded"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function TeamProjectTracker() {
  // High-level state management
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [projectStartDate, setProjectStartDate] = useState(new Date());
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [columnOrder, setColumnOrder] = useState(() => {
    return loadColumnOrderFromStorage(getDefaultColumnOrder(columns));
  });

  // UI state
  const [showNewTask, setShowNewTask] = useState(false);
  const [showSubtaskForm, setShowSubtaskForm] = useState(null);
  const [expandedActive, setExpandedActive] = useState({});
  const [expandedCompleted, setExpandedCompleted] = useState({});
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskName, setEditingTaskName] = useState("");
  const [selectedProjectForSummary, setSelectedProjectForSummary] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [googleMapPickerOpen, setGoogleMapPickerOpen] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState(null);

  // Form state
  const [newTask, setNewTask] = useState(null);
  const [newSubtask, setNewSubtask] = useState(createNewSubtask());

  // Column management state
  const [showAddColumnMenu, setShowAddColumnMenu] = useState(false);
  const [addColumnMenuPos, setAddColumnMenuPos] = useState({ x: 0, y: 0 });
  const [addColumnSearch, setAddColumnSearch] = useState("");

  // Refs for arrow connections
  const mainTaskRefs = useRef({});
  const subTableRefs = useRef({});
  const mainTaskNameRefs = useRef({});
  const [arrowPos, setArrowPos] = useState({});

  // Computed values
  const filteredTasks = filterTasks(tasks, search);
  const completedTasks = filterCompletedTasks(tasks);
  const filteredColumnOptions = [
    { key: 'status', label: 'Status', icon: '🟢' },
    { key: 'text', label: 'Text', icon: '🔤' },
    { key: 'date', label: 'Date', icon: '📅' },
    { key: 'number', label: 'Number', icon: '🔢' },
    { key: 'dropdown', label: 'Dropdown', icon: '⬇️' },
    { key: 'files', label: 'Files', icon: '📎' },
    { key: 'priority', label: 'Priority', icon: '⚡' },
    { key: 'color', label: 'Color Picker', icon: '🎨' },
  ].filter(opt => opt.label.toLowerCase().includes(addColumnSearch.toLowerCase()));

  // Effects
  useEffect(() => {
    setTasks(ts => calculateTaskTimelines(ts, projectStartDate));
  }, [projectStartDate]);

  useEffect(() => {
    saveColumnOrderToStorage(columnOrder);
  }, [columnOrder]);

  useEffect(() => {
    const currentOrder = columnOrder;
    const allColumns = getDefaultColumnOrder(columns);
    const missingColumns = getMissingColumns(currentOrder, allColumns);
    
    if (missingColumns.length > 0) {
      const newOrder = [...currentOrder, ...missingColumns];
      setColumnOrder(newOrder);
      saveColumnOrderToStorage(newOrder);
    }
  }, [columns]);

  useLayoutEffect(() => {
    const newArrowPos = {};
    tasks.forEach(task => {
      if (
        task.expanded &&
        task.subtasks.length > 0 &&
        mainTaskNameRefs.current[task.id] &&
        subTableRefs.current[task.id]
      ) {
        const nameRect = mainTaskNameRefs.current[task.id].getBoundingClientRect();
        const subRect = subTableRefs.current[task.id].getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        newArrowPos[task.id] = {
          x1: nameRect.right - scrollX,
          y1: nameRect.top + nameRect.height / 2 - scrollY,
          x2: subRect.left - scrollX,
          y2: subRect.top + 24 - scrollY
        };
      }
    });
    setArrowPos(newArrowPos);
  }, [tasks, showSubtaskForm, search]);

  // Event handlers
  const handleProjectNameClick = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskName(task.name);
  };

  const handleProjectNameDoubleClick = (task) => {
    setSelectedProjectForSummary(task);
  };

  const handleProjectNameChange = (e) => setEditingTaskName(e.target.value);

  const handleProjectNameBlur = (task) => {
    if (editingTaskName.trim() !== "") {
      handleEdit(task, 'name', editingTaskName);
    }
    setEditingTaskId(null);
  };

  const handleProjectNameKeyDown = (e, task) => {
    if (e.key === "Enter") {
      if (editingTaskName.trim() !== "") {
        handleEdit(task, 'name', editingTaskName);
      }
      setEditingTaskId(null);
    } else if (e.key === "Escape") {
      setEditingTaskId(null);
    }
  };

  const toggleExpand = (taskId, type = 'active') => {
    if (type === 'active') {
      setExpandedActive(exp => ({ ...exp, [taskId]: !exp[taskId] }));
    } else {
      setExpandedCompleted(exp => ({ ...exp, [taskId]: !exp[taskId] }));
    }
  };

  const handleEdit = (task, col, value) => {
    setTasks(tasks => {
      const idx = tasks.findIndex(t => t.id === task.id);
      let updatedTasks = tasks.map(t => ({ ...t }));
      
      updatedTasks[idx] = { ...updatedTasks[idx], [col]: value };
      
      if (col === 'predecessors' || col === 'timeline' || col === 'planDays') {
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      }
      
      return updatedTasks;
    });
  };

  const handleEditSubtask = (taskId, subId, col, value) => {
    setTasks(tasks => {
      let updatedTasks = tasks.map(t => {
        if (t.id !== taskId) return t;
        const idx = t.subtasks.findIndex(sub => sub.id === subId);
        let updatedSubtasks = t.subtasks.map(sub => ({ ...sub }));
        
        updatedSubtasks[idx] = { ...updatedSubtasks[idx], [col]: value };
        
        const allDone = areAllSubtasksComplete(updatedSubtasks);
        const avgProgress = calculateTaskProgress(updatedSubtasks);
        
        return { 
          ...t, 
          subtasks: updatedSubtasks, 
          status: allDone ? 'done' : t.status, 
          progress: avgProgress 
        };
      });
      
      if (col === 'predecessors' || col === 'timeline' || col === 'planDays') {
        return calculateTaskTimelines(updatedTasks, projectStartDate);
      }
      
      return updatedTasks;
    });
  };

  const handleDeleteRow = (id, parentTaskId = null) => {
    setTasks(tasks => {
      let updatedTasks;
      if (parentTaskId) {
        updatedTasks = tasks.map(task =>
          task.id === parentTaskId
            ? { ...task, subtasks: task.subtasks.filter(sub => sub.id !== id) }
            : task
        );
      } else {
        updatedTasks = tasks.filter(task => task.id !== id);
      }
      return calculateTaskTimelines(updatedTasks, projectStartDate);
    });
  };

  const handleAddNewTask = () => {
    setNewTask(createNewTask(tasks, projectStartDate));
    setShowNewTask(true);
  };

  const handleCreateTask = () => {
    if (!newTask) return;
    
    const errors = validateTask(newTask);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    const taskToAdd = {
      ...newTask,
      id: generateTaskId(),
      expanded: false
    };
    
    setTasks(tasks => {
      const updatedTasks = [...tasks, taskToAdd];
      return calculateTaskTimelines(updatedTasks, projectStartDate);
    });
    
    setNewTask(null);
    setShowNewTask(false);
  };

  const handleAddSubtask = (taskId) => {
    const newSubtaskData = {
      ...createNewSubtask(),
      ...newSubtask
    };
    
    setTasks(tasks => {
      const updatedTasks = tasks.map(t =>
        t.id === taskId
          ? { ...t, subtasks: [...t.subtasks, newSubtaskData] }
          : t
      );
      return calculateTaskTimelines(updatedTasks, projectStartDate);
    });
    setShowSubtaskForm(null);
    setNewSubtask(createNewSubtask());
  };

  const handleProjectStartDateChange = (newStartDate) => {
    setProjectStartDate(newStartDate);
  };

  const handleOpenMapPicker = (type, taskId, subId, latLngStr) => {
    setMapPickerTarget({ type, taskId, subId });
    setGoogleMapPickerOpen(true);
  };

  const handlePickLocation = (lat, lng) => {
    if (!mapPickerTarget) return;
    const value = formatLocationString(lat, lng);
    if (mapPickerTarget.type === 'main') {
      setTasks(ts => ts.map(t => t.id === mapPickerTarget.taskId ? { ...t, location: value } : t));
    } else if (mapPickerTarget.type === 'sub') {
      setTasks(ts => ts.map(t => t.id === mapPickerTarget.taskId ? { ...t, subtasks: t.subtasks.map(s => s.id === mapPickerTarget.subId ? { ...s, location: value } : s) } : t));
    }
    setGoogleMapPickerOpen(false);
  };

  const handleAddColumn = (type) => {
    const newCol = createNewColumn(type);
    setColumns(cols => [...cols, newCol]);
    setColumnOrder(order => [...order, newCol.key]);
    setTasks(ts => addColumnToTasks(ts, newCol.key));
    setShowAddColumnMenu(false);
    setAddColumnSearch('');
  };

  const handleShowAddColumnMenu = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setAddColumnMenuPos({ x: rect.left, y: rect.bottom + 5 });
    setShowAddColumnMenu(true);
  };

  const resetColumnOrder = () => {
    const allColumns = getDefaultColumnOrder(columns);
    setColumnOrder(allColumns);
    saveColumnOrderToStorage(allColumns);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubtaskDragEnd = (event, taskId) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setTasks(tasks => tasks.map(task => {
        if (task.id !== taskId) return task;
        const oldIndex = task.subtasks.findIndex(sub => sub.id === active.id);
        const newIndex = task.subtasks.findIndex(sub => sub.id === over.id);
        const newSubtasks = arrayMove(task.subtasks, oldIndex, newIndex);
        return { ...task, subtasks: newSubtasks };
      }));
    }
  };

  // Cell renderer functions
  const renderMainCell = (col, row, onEdit) => (
    <CellRenderer 
      col={col} 
      row={row} 
      onEdit={onEdit} 
      onOpenMapPicker={handleOpenMapPicker}
      isSubtask={false}
    />
  );

  const renderSubtaskCell = (col, sub, task, subIdx) => (
    <CellRenderer 
      col={col} 
      row={sub} 
      onEdit={(field, value) => handleEditSubtask(task.id, sub.id, field, value)}
      onOpenMapPicker={handleOpenMapPicker}
      isSubtask={true}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Team-specific header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Project Tracker</h1>
            <p className="text-gray-600">Manage and track team projects collaboratively</p>
          </div>

          <Filters
            search={search}
            setSearch={setSearch}
            projectStartDate={projectStartDate}
            handleProjectStartDateChange={handleProjectStartDateChange}
            handleAddNewTask={handleAddNewTask}
            resetColumnOrder={resetColumnOrder}
            showAddColumnMenu={showAddColumnMenu}
            setShowAddColumnMenu={setShowAddColumnMenu}
            addColumnMenuPos={addColumnMenuPos}
            addColumnSearch={addColumnSearch}
            setAddColumnSearch={setAddColumnSearch}
            filteredColumnOptions={filteredColumnOptions}
            handleAddColumn={handleAddColumn}
            handleShowAddColumnMenu={handleShowAddColumnMenu}
            buttonText="New Team Project"
            searchPlaceholder="Search team projects..."
          />

          <div className="w-full px-4 py-0 mt-4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <table className="w-full table-auto bg-white">
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                    <tr>
                      {columnOrder.map(key => {
                        const col = columns.find(c => c.key === key);
                        if (!col) return null;
                        return <DraggableHeader key={col.key} col={col} colKey={col.key} />;
                      })}
                      <th key="add-column" className="px-4 py-4 text-center">
                        <button
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                          onClick={handleShowAddColumnMenu}
                          title="Add column"
                          type="button"
                        >
                          +
                        </button>
                      </th>
                    </tr>
                  </thead>
                </SortableContext>
              </DndContext>
              <tbody className="divide-y divide-blue-100">
                {filteredTasks.map(task => (
                  <React.Fragment key={task.id}>
                    <ProjectRow
                      task={task}
                      columnOrder={columnOrder}
                      columns={columns}
                      expandedActive={expandedActive}
                      editingTaskId={editingTaskId}
                      editingTaskName={editingTaskName}
                      onToggleExpand={toggleExpand}
                      onProjectNameClick={handleProjectNameClick}
                      onProjectNameDoubleClick={handleProjectNameDoubleClick}
                      onProjectNameChange={handleProjectNameChange}
                      onProjectNameBlur={handleProjectNameBlur}
                      onProjectNameKeyDown={handleProjectNameKeyDown}
                      onEdit={handleEdit}
                      onDelete={handleDeleteRow}
                      onShowAddColumnMenu={handleShowAddColumnMenu}
                    />
                    {expandedActive[task.id] && (
                      <tr>
                        <td colSpan={columnOrder.length} className="p-0 bg-gray-50">
                          <table className="ml-12 table-fixed min-w-full">
                            <thead>
                              <tr>
                                {columnOrder.map(colKey => {
                                  const col = columns.find(c => c.key === colKey);
                                  if (!col) return null;
                                  return (
                                    <th key={col.key} className={`px-3 py-2 text-xs font-bold text-gray-500 uppercase${col.key === 'delete' ? ' text-center w-12' : ''}`}>
                                      {col.label}
                                    </th>
                                  );
                                })}
                                <th key="add-column" className="px-3 py-2 text-xs font-bold text-gray-500 uppercase text-center w-12">
                                  <button
                                    className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 text-2xl flex items-center justify-center shadow"
                                    onClick={handleShowAddColumnMenu}
                                    title="Add column"
                                    type="button"
                                  >
                                    +
                                  </button>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <DndContext onDragEnd={event => handleSubtaskDragEnd(event, task.id)}>
                                <SortableContext items={task.subtasks.map(sub => sub.id)} strategy={verticalListSortingStrategy}>
                                  {task.subtasks.map((sub, subIdx) => (
                                    <tr key={sub.id} className="hover:bg-gray-50">
                                      {columnOrder.map(colKey => {
                                        const col = columns.find(c => c.key === colKey);
                                        if (!col) return null;
                                        return (
                                          <td key={col.key} className={`px-3 py-2 align-middle${col.key === 'delete' ? ' text-center w-12' : ''}`}>
                                            {renderSubtaskCell(col, sub, task, subIdx)}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </SortableContext>
                              </DndContext>
                              <tr>
                                <td colSpan={columnOrder.length + 1} className="px-3 py-2">
                                  {showSubtaskForm === task.id ? (
                                    <form onSubmit={(e) => { e.preventDefault(); handleAddSubtask(task.id); }}>
                                      <div className="grid grid-cols-2 gap-2 mb-2">
                                        {columnOrder.slice(0, 4).map(colKey => {
                                          const col = columns.find(c => c.key === colKey);
                                          if (!col) return null;
                                          return (
                                            <div key={col.key} className="space-y-1">
                                              <label className="text-xs font-medium text-gray-700">{col.label}</label>
                                              <CellRenderer
                                                col={col}
                                                row={newSubtask}
                                                onEdit={(field, value) => setNewSubtask(s => ({ ...s, [field]: value }))}
                                                onOpenMapPicker={handleOpenMapPicker}
                                                isSubtask={true}
                                              />
                                            </div>
                                          );
                                        })}
                                      </div>
                                      <div className="flex gap-2">
                                        <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                                          Add
                                        </button>
                                        <button type="button" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200" onClick={() => setShowSubtaskForm(null)}>
                                          Cancel
                                        </button>
                                      </div>
                                    </form>
                                  ) : (
                                    <button
                                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-semibold transition-all duration-200 flex items-center gap-1"
                                      onClick={() => setShowSubtaskForm(task.id)}
                                    >
                                      <PlusIcon className="w-4 h-4" />
                                      Add Subtask
                                    </button>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <CompletedProjects
            completedTasks={completedTasks}
            columnOrder={columnOrder}
            columns={columns}
            expandedCompleted={expandedCompleted}
            onToggleExpand={toggleExpand}
            onEdit={handleEdit}
            onDelete={handleDeleteRow}
            onShowAddColumnMenu={handleShowAddColumnMenu}
            onSubtaskDragEnd={handleSubtaskDragEnd}
            renderMainCell={renderMainCell}
            renderSubtaskCell={renderSubtaskCell}
            setSelectedProject={setSelectedProject}
            setShowProjectDialog={setShowProjectDialog}
            DraggableHeader={DraggableHeader}
            title="Completed Team Projects"
          />

          {/* Modals */}
          <Modals.NewTaskModal
            showNewTask={showNewTask}
            handleCreateTask={handleCreateTask}
            onClose={() => setShowNewTask(false)}
            title="Create New Team Project"
            buttonText="Create Team Project"
          />

          <Modals.ProjectSummaryModal
            selectedProjectForSummary={selectedProjectForSummary}
            onClose={() => setSelectedProjectForSummary(null)}
          />

          <Modals.RatingPromptModal
            showRatingPrompt={showRatingPrompt}
            onClose={() => setShowRatingPrompt(false)}
          />

          <Modals.ProjectDialogModal
            showProjectDialog={showProjectDialog}
            selectedProject={selectedProject}
            onClose={() => setShowProjectDialog(false)}
          />

          {googleMapPickerOpen && (
            <GoogleMapPickerDemo
              onPick={handlePickLocation}
              onClose={() => setGoogleMapPickerOpen(false)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
