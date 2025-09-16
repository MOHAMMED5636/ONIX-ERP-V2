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
  TrashIcon
} from '@heroicons/react/24/outline';

const CardsView = () => {
  const [tasks] = useState([
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Construction Task Cards</h2>
        <p className="text-gray-600">Jira-style task cards for construction project management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 group">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">TASK-{task.id}</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <EyeIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <PencilIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <TrashIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Card Title */}
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{task.title}</h3>
            
            {/* Card Description */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">{task.description}</p>

            {/* Labels */}
            <div className="flex flex-wrap gap-1 mb-3">
              {task.labels.map((label, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                  {label}
                </span>
              ))}
            </div>

            {/* Progress Bar */}
            {task.progress > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Card Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Assignee Avatar */}
                <div className={`w-6 h-6 rounded-full ${getAssigneeColor(task.assignee)} flex items-center justify-center text-white text-xs font-medium`}>
                  {task.assignee}
                </div>
                
                {/* Story Points */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <StarIcon className="w-3 h-3" />
                  <span>{task.storyPoints}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Attachments */}
                {task.attachments > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <PaperClipIcon className="w-3 h-3" />
                    <span>{task.attachments}</span>
                  </div>
                )}

                {/* Comments */}
                {task.comments > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <ChatBubbleLeftRightIcon className="w-3 h-3" />
                    <span>{task.comments}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status and Due Date */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <CalendarIcon className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
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
