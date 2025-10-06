import React, { useState } from 'react';
import { 
  UserIcon, 
  CalendarIcon, 
  ClockIcon, 
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  FlagIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  ArchiveBoxIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const CardsView = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Foundation Excavation",
      description: "Excavate and prepare foundation for the new residential building project",
      status: "In Progress",
      priority: "High",
      assignee: "SA",
      dueDate: "2025-09-30",
      storyPoints: 8,
      labels: ["Excavation", "Foundation", "Site Prep"],
      attachments: 3,
      comments: 5,
      progress: 65
    },
    {
      id: 2,
      title: "Steel Frame Installation",
      description: "Install steel structural framework for the commercial building",
      status: "To Do",
      priority: "Medium",
      assignee: "MN",
      dueDate: "2025-10-15",
      storyPoints: 5,
      labels: ["Steel Work", "Structure", "Installation"],
      attachments: 2,
      comments: 2,
      progress: 0
    },
    {
      id: 3,
      title: "Electrical Wiring",
      description: "Complete electrical installation and wiring for all floors",
      status: "Done",
      priority: "Low",
      assignee: "AH",
      dueDate: "2025-09-20",
      storyPoints: 3,
      labels: ["Electrical", "Wiring", "Installation"],
      attachments: 1,
      comments: 8,
      progress: 100
    },
    {
      id: 4,
      title: "Plumbing Installation",
      description: "Install plumbing systems including water supply and drainage",
      status: "In Progress",
      priority: "High",
      assignee: "MA",
      dueDate: "2025-10-05",
      storyPoints: 6,
      labels: ["Plumbing", "Water Supply", "Drainage"],
      attachments: 4,
      comments: 3,
      progress: 40
    },
    {
      id: 5,
      title: "Safety Inspection",
      description: "Conduct comprehensive safety inspection of construction site",
      status: "To Do",
      priority: "Medium",
      assignee: "SA",
      dueDate: "2025-10-20",
      storyPoints: 4,
      labels: ["Safety", "Inspection", "Compliance"],
      attachments: 0,
      comments: 1,
      progress: 0
    },
    {
      id: 6,
      title: "Concrete Pouring",
      description: "Pour concrete for foundation and structural elements",
      status: "In Progress",
      priority: "High",
      assignee: "MN",
      dueDate: "2025-09-25",
      storyPoints: 7,
      labels: ["Concrete", "Foundation", "Structural"],
      attachments: 5,
      comments: 4,
      progress: 30
    },
    {
      id: 7,
      title: "Roof Installation",
      description: "Install roofing materials and waterproofing system",
      status: "To Do",
      priority: "Medium",
      assignee: "AH",
      dueDate: "2025-11-10",
      storyPoints: 6,
      labels: ["Roofing", "Waterproofing", "Installation"],
      attachments: 2,
      comments: 2,
      progress: 0
    },
    {
      id: 8,
      title: "HVAC System Setup",
      description: "Install heating, ventilation, and air conditioning systems",
      status: "To Do",
      priority: "Low",
      assignee: "MA",
      dueDate: "2025-11-15",
      storyPoints: 5,
      labels: ["HVAC", "Ventilation", "Climate Control"],
      attachments: 1,
      comments: 1,
      progress: 0
    }
  ]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'To Do': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssigneeColor = (assignee) => {
    const colors = {
      'SA': 'bg-purple-500',
      'MN': 'bg-blue-500',
      'AH': 'bg-green-500',
      'MA': 'bg-orange-500'
    };
    return colors[assignee] || 'bg-gray-500';
  };

  // Action handlers with better functionality
  const handleViewTask = async (taskId) => {
    setLoading(true);
    try {
      const task = tasks.find(t => t.id === taskId);
      alert(`Viewing Task: ${task?.title}\nStatus: ${task?.status}\nAssignee: ${task?.assignee}\nProgress: ${task?.progress}%`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (taskId) => {
    setLoading(true);
    try {
      const task = tasks.find(t => t.id === taskId);
      const newTitle = prompt('Edit task title:', task?.title);
      if (newTitle && newTitle !== task?.title) {
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === taskId ? { ...t, title: newTitle } : t
          )
        );
        alert('Task updated successfully!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setLoading(true);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (window.confirm(`Are you sure you want to delete "${task?.title}"?`)) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        alert('Task deleted successfully!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateTask = async (taskId) => {
    setLoading(true);
    try {
      const taskToDuplicate = tasks.find(task => task.id === taskId);
      if (taskToDuplicate) {
        const newTask = {
          ...taskToDuplicate,
          id: Math.max(...tasks.map(t => t.id)) + 1,
          title: `${taskToDuplicate.title} (Copy)`,
          status: 'To Do',
          progress: 0
        };
        setTasks(prevTasks => [...prevTasks, newTask]);
        alert('Task duplicated successfully!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShareTask = async (taskId) => {
    setLoading(true);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (navigator.share) {
        await navigator.share({
          title: `Task: ${task?.title}`,
          text: `Check out this construction task: ${task?.title}`,
          url: window.location.href
        });
      } else {
        alert(`Sharing task: ${task?.title}\nCopy this link to share: ${window.location.href}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveTask = async (taskId) => {
    setLoading(true);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (window.confirm(`Archive task "${task?.title}"?`)) {
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === taskId ? { ...t, status: 'Archived' } : t
          )
        );
        alert('Task archived successfully!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-lg border border-gray-200 mb-6 -mt-6">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - Cards View Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Bars3Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Task Cards</h2>
              <p className="text-sm text-gray-600">Construction project management</p>
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
            <button className="flex items-center gap-1.5 px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300 bg-white shadow-sm">
              <FunnelIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Show Filters</span>
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="mb-4 text-sm text-blue-600 flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Processing action...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 -mt-6">
        {tasks.map((task, index) => (
          <div 
            key={task.id} 
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 p-6 group transform hover:scale-105 hover:-translate-y-2"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  TASK-{task.id}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border-2 shadow-sm ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button 
                  onClick={() => handleViewTask(task.id)}
                  disabled={loading}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 shadow-sm hover:shadow-md" 
                  title="View Task"
                >
                  <EyeIcon className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                </button>
                <button 
                  onClick={() => handleEditTask(task.id)}
                  disabled={loading}
                  className="p-2 hover:bg-green-100 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 shadow-sm hover:shadow-md" 
                  title="Edit Task"
                >
                  <PencilIcon className="w-4 h-4 text-green-600 hover:text-green-800" />
                </button>
                <button 
                  onClick={() => handleDuplicateTask(task.id)}
                  disabled={loading}
                  className="p-2 hover:bg-purple-100 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 shadow-sm hover:shadow-md" 
                  title="Duplicate Task"
                >
                  <DocumentDuplicateIcon className="w-4 h-4 text-purple-600 hover:text-purple-800" />
                </button>
                <button 
                  onClick={() => handleShareTask(task.id)}
                  disabled={loading}
                  className="p-2 hover:bg-yellow-100 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 shadow-sm hover:shadow-md" 
                  title="Share Task"
                >
                  <ShareIcon className="w-4 h-4 text-yellow-600 hover:text-yellow-800" />
                </button>
                <button 
                  onClick={() => handleArchiveTask(task.id)}
                  disabled={loading}
                  className="p-2 hover:bg-orange-100 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 shadow-sm hover:shadow-md" 
                  title="Archive Task"
                >
                  <ArchiveBoxIcon className="w-4 h-4 text-orange-600 hover:text-orange-800" />
                </button>
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={loading}
                  className="p-2 hover:bg-red-100 rounded-lg transition-all duration-200 disabled:opacity-50 hover:scale-110 shadow-sm hover:shadow-md" 
                  title="Delete Task"
                >
                  <TrashIcon className="w-4 h-4 text-red-600 hover:text-red-800" />
                </button>
              </div>
            </div>

            {/* Card Title */}
            <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 text-lg leading-tight">{task.title}</h3>
            
            {/* Card Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">{task.description}</p>

            {/* Labels */}
            <div className="flex flex-wrap gap-2 mb-4">
              {task.labels.map((label, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs font-medium rounded-full shadow-sm border border-blue-300">
                  {label}
                </span>
              ))}
            </div>

            {/* Progress Bar */}
            {task.progress > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-2">
                  <span>Progress</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                {/* Assignee Avatar */}
                <div className={`w-8 h-8 rounded-full ${getAssigneeColor(task.assignee)} flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white`}>
                  {task.assignee}
                </div>
                
                {/* Story Points */}
                <div className="flex items-center gap-1 text-xs text-gray-600 bg-yellow-100 px-2 py-1 rounded-full">
                  <StarIcon className="w-3 h-3 text-yellow-600" />
                  <span className="font-medium">{task.storyPoints}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Attachments */}
                {task.attachments > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    <PaperClipIcon className="w-3 h-3" />
                    <span className="font-medium">{task.attachments}</span>
                  </div>
                )}

                {/* Comments */}
                {task.comments > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 bg-green-100 px-2 py-1 rounded-full">
                    <ChatBubbleLeftRightIcon className="w-3 h-3 text-green-600" />
                    <span className="font-medium">{task.comments}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status and Due Date */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(task.status)}`}>
                {task.status}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                <CalendarIcon className="w-3 h-3 text-gray-500" />
                <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FlagIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No construction tasks found</h3>
          <p className="text-gray-500">Create your first construction task to get started with the cards view.</p>
        </div>
      )}
    </div>
  );
};

export default CardsView;
