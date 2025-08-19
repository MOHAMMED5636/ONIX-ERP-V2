import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { arrayMove } from '@dnd-kit/sortable';
import MapPicker from '../../modules/WorkingLocations.js';

// Import extracted components and utilities
import {
  GoogleMapPickerDemo,
  CellRenderer,
  Modals,
  ProjectTable,
  Header,
  SearchFilters,
  initialTasks,
  calculateTaskTimelines,
  handleTaskEdit,
  handleSubtaskEdit,
  handleLocationPick
} from './index';
import { INITIAL_COLUMNS } from './columnConfig';

export default function TeamProjectTrackerMain() {
  // State management
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [showNewTask, setShowNewTask] = useState(false);
  const [expandedActive, setExpandedActive] = useState({});
  const [expandedCompleted, setExpandedCompleted] = useState({});
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState(null);
  const [mapPickerCoords, setMapPickerCoords] = useState({ lat: null, lng: null });
  const [googleMapPickerOpen, setGoogleMapPickerOpen] = useState(false);
  const [projectStartDate, setProjectStartDate] = useState(new Date());

  // Arrow connection logic refs
  const mainTaskRefs = useRef({});
  const subTableRefs = useRef({});
  const [arrowPos, setArrowPos] = useState({});
  const mainTaskNameRefs = useRef({});

  // Column configuration
  const [columns, setColumns] = useState(INITIAL_COLUMNS);

  // Column order management
  const defaultColumnOrder = columns.map(col => col.key);
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('columnOrder');
    const parsed = saved ? JSON.parse(saved) : defaultColumnOrder;
    const allColumns = [...new Set([...parsed, ...defaultColumnOrder])];
    return allColumns;
  });

  // Effects
  useEffect(() => {
    localStorage.setItem('columnOrder', JSON.stringify(columnOrder));
  }, [columnOrder]);

  useEffect(() => {
    const currentOrder = columnOrder;
    const allColumns = columns.map(col => col.key);
    const missingColumns = allColumns.filter(col => !currentOrder.includes(col));
    
    if (missingColumns.length > 0) {
      const newOrder = [...currentOrder, ...missingColumns];
      setColumnOrder(newOrder);
      localStorage.setItem('columnOrder', JSON.stringify(newOrder));
    }
  }, [columns]);

  useEffect(() => {
    setTasks(ts => calculateTaskTimelines(ts, projectStartDate));
  }, [projectStartDate]);

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
  }, [tasks, search]);

  // Computed values
  const filteredTasks = tasks.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const completedTasks = tasks.filter(t => t.status === "done");

  // Event handlers
  const handleProjectStartDateChange = (newStartDate) => {
    setProjectStartDate(newStartDate);
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
      setTasks(tasks => {
        return tasks.map(task => {
          if (task.id !== taskId) return task;
          
          const oldIndex = task.subtasks.findIndex(sub => sub.id === active.id);
          const newIndex = task.subtasks.findIndex(sub => sub.id === over.id);
          
          return {
            ...task,
            subtasks: arrayMove(task.subtasks, oldIndex, newIndex)
          };
        });
      });
    }
  };

  const handleShowAddColumnMenu = () => {
    console.log('Add column menu clicked');
  };

  const handleCreateTask = () => {
    const newTask = {
      id: Date.now(),
      name: "New Team Project",
      referenceNumber: "",
      category: "Design",
      status: "not started",
      owner: "",
      timeline: [null, null],
      planDays: 0,
      remarks: "",
      assigneeNotes: "",
      attachments: [],
      priority: "Low",
      location: "",
      plotNumber: "",
      community: "",
      projectType: "Residential",
      projectFloor: "",
      developerProject: "",
      notes: "",
      autoNumber: tasks.length + 1,
      predecessors: "",
      checklist: false,
      link: "",
      rating: 0,
      progress: 0,
      color: "#60a5fa",
      subtasks: []
    };
    setTasks(prev => [...prev, newTask]);
    setShowNewTask(false);
  };

  const handleEdit = (task, col, value) => {
    setTasks(tasks => handleTaskEdit(tasks, task, col, value, projectStartDate));
  };

  const handleEditSubtask = (taskId, subId, col, value) => {
    setTasks(tasks => handleSubtaskEdit(tasks, tasks.find(t => t.id === taskId), subId, col, value, projectStartDate));
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
    // This function is called by the Header component
  };

  const handleOpenMapPicker = (type, taskId, subId, latLngStr) => {
    setMapPickerTarget({ type, taskId, subId });
    setGoogleMapPickerOpen(true);
  };

  const handlePickLocation = (lat, lng) => {
    setTasks(tasks => handleLocationPick(tasks, mapPickerTarget, lat, lng));
    setGoogleMapPickerOpen(false);
  };

  const toggleExpand = (taskId, type = 'active') => {
    if (type === 'active') {
      setExpandedActive(exp => ({ ...exp, [taskId]: !exp[taskId] }));
    } else {
      setExpandedCompleted(exp => ({ ...exp, [taskId]: !exp[taskId] }));
    }
  };

  const renderMainCell = (col, row, onEdit) => {
    return CellRenderer.renderMainCell(col, row, onEdit, handleOpenMapPicker, setShowRatingPrompt);
  };

  const renderSubtaskCell = (col, sub, task, subIdx) => {
    return CellRenderer.renderSubtaskCell(col, sub, task, subIdx, handleEditSubtask, handleOpenMapPicker);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <style>{`
        .glass-card { background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); }
        .animate-logo-glow { animation: logoGlow 2.5s infinite alternate; }
        @keyframes logoGlow { 0% { box-shadow: 0 0 0 0 #a5b4fc33, 0 0 0 0 #67e8f933; } 100% { box-shadow: 0 0 16px 4px #a5b4fc66, 0 0 32px 8px #67e8f966; } }
        .fab-pop { animation: fabPop 0.7s cubic-bezier(.4,0,.2,1); }
        @keyframes fabPop { from { transform: scale(0.7);} to { transform: scale(1);} }
        .nav-pop { transition: box-shadow 0.2s, transform: 0.2s; }
        .nav-pop:hover, .nav-pop:focus { box-shadow: 0 2px 8px 0 #a5b4fc33; }
      `}</style>
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <Header 
          projectStartDate={projectStartDate}
          handleProjectStartDateChange={handleProjectStartDateChange}
          handleAddNewTask={handleAddNewTask}
          setShowNewTask={setShowNewTask}
        />

        {/* Search and Filters */}
        <SearchFilters search={search} setSearch={setSearch} />

        {/* Active Projects Table */}
        <div className="glass-card rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{filteredTasks.length}</span>
              </div>
              Active Team Projects
            </h2>
          </div>
          <div className="overflow-x-auto">
            <ProjectTable
              tasks={filteredTasks}
              columns={columns}
              columnOrder={columnOrder}
              expandedActive={expandedActive}
              expandedCompleted={expandedCompleted}
              renderMainCell={renderMainCell}
              renderSubtaskCell={renderSubtaskCell}
              handleDragEnd={handleDragEnd}
              handleSubtaskDragEnd={handleSubtaskDragEnd}
              handleShowAddColumnMenu={handleShowAddColumnMenu}
              toggleExpand={toggleExpand}
              setSelectedProject={setSelectedProject}
              setShowProjectDialog={setShowProjectDialog}
              handleDeleteRow={handleDeleteRow}
              handleEdit={handleEdit}
              isCompleted={false}
            />
          </div>
        </div>

        {/* Completed Projects Section */}
        {completedTasks.length > 0 && (
          <div className="mt-12 flex items-center gap-3 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
              Completed Team Projects
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent"></div>
          </div>
        )}
        {completedTasks.length > 0 && (
          <ProjectTable
            tasks={completedTasks}
            columns={columns}
            columnOrder={columnOrder}
            expandedActive={expandedActive}
            expandedCompleted={expandedCompleted}
            renderMainCell={renderMainCell}
            renderSubtaskCell={renderSubtaskCell}
            handleDragEnd={handleDragEnd}
            handleSubtaskDragEnd={handleSubtaskDragEnd}
            handleShowAddColumnMenu={handleShowAddColumnMenu}
            toggleExpand={toggleExpand}
            setSelectedProject={setSelectedProject}
            setShowProjectDialog={setShowProjectDialog}
            handleDeleteRow={handleDeleteRow}
            handleEdit={handleEdit}
            isCompleted={true}
          />
        )}

        {/* Modals */}
        <Modals.RatingPrompt 
          showRatingPrompt={showRatingPrompt} 
          setShowRatingPrompt={setShowRatingPrompt} 
        />
        
        <Modals.ProjectDialog 
          showProjectDialog={showProjectDialog} 
          selectedProject={selectedProject} 
          setShowProjectDialog={setShowProjectDialog} 
        />
        
        <Modals.NewTaskModal 
          showNewTask={showNewTask} 
          setShowNewTask={setShowNewTask} 
          handleCreateTask={handleCreateTask} 
        />

        {/* Map Pickers */}
        {mapPickerOpen && (
          <MapPicker
            lat={mapPickerCoords.lat}
            lng={mapPickerCoords.lng}
            onPick={handlePickLocation}
            onClose={() => setMapPickerOpen(false)}
          />
        )}
        {googleMapPickerOpen && (
          <GoogleMapPickerDemo
            onPick={handlePickLocation}
            onClose={() => setGoogleMapPickerOpen(false)}
          />
        )}
      </main>
    </div>
  );
}
