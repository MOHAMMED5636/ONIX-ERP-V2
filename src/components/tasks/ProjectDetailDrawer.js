import React, { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  PaperClipIcon, 
  UserCircleIcon, 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon,
  SparklesIcon,
  PlusIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import ChatDrawer from './ChatDrawer';

const ProjectDetailDrawer = ({ isOpen, onClose, projectId, projectData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const drawerRef = useRef();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
    { id: 'subtasks', name: 'Subtasks', icon: CheckCircleIcon },
    { id: 'chat', name: 'Chat', icon: ChatBubbleLeftRightIcon },
    { id: 'files', name: 'Files', icon: PaperClipIcon },
    { id: 'activity', name: 'Activity Log', icon: ClockIcon }
  ];

  // Fetch project data when drawer opens
  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectDetails();
    }
  }, [isOpen, projectId]);

  const fetchProjectDetails = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API
      const mockProject = {
        id: projectId,
        name: projectData?.title || projectData?.name || "Sample Project",
        referenceNumber: projectData?.plan || projectData?.referenceNumber || "REF-001",
        status: projectData?.status || "In Progress",
        priority: projectData?.priority || "High",
        assignee: projectData?.assignee?.name || projectData?.assignee || "John Doe",
        startDate: projectData?.start || projectData?.startDate || "2024-01-15",
        dueDate: projectData?.due || projectData?.dueDate || "2024-02-15",
        progress: projectData?.percent || projectData?.progress || 65,
        description: projectData?.description || "This is a detailed project description that explains the project requirements and objectives.",
        
        // Enhanced details from right screen
        plan: projectData?.plan || "2577-PRINCESS AL JOHARA & RANIA AGAMOU",
        category: projectData?.category || "MEP DESIGN",
        plannedStart: projectData?.plannedStart || "16 Sep 2025",
        plannedDeadline: projectData?.plannedDeadline || "24 Sep 2025",
        plannedDuration: projectData?.plannedDuration || "8 Days",
        actualStart: projectData?.actualStart || "10 Jun 2025",
        actualComplete: projectData?.actualComplete || "10 Jun 2025",
        actualDuration: projectData?.actualDuration || "0 Days",
        expectedStart: projectData?.expectedStart || "3 Jun 2025",
        scheduleStatus: projectData?.scheduleStatus || "106 Days - Ahead of Schedule",
        createdBy: projectData?.createdBy || "kaddour alkaddour",
        owner: projectData?.owner || "SA",
        clientId: projectData?.clientId || "CL-001",
        clientContact: projectData?.clientContact || "+1 234 567 8900",
        clientEmail: projectData?.clientEmail || "client@example.com",
        completionPercentage: projectData?.completionPercentage || 100,
        attachments: projectData?.attachments || [
          { name: "Project Plan.pdf", type: "pdf", size: "2.4 MB" },
          { name: "Design Mockup.png", type: "image", size: "1.2 MB" }
        ],
        planAttachments: projectData?.planAttachments || [
          { name: "Plan Document.pdf", type: "pdf", size: "3.2 MB" },
          { name: "Architecture Diagram.dwg", type: "dwg", size: "5.1 MB" }
        ],
        subtasks: projectData?.subtasks || [
          { id: 1, name: "Research Phase", status: "Completed", assignee: "Alice" },
          { id: 2, name: "Design Phase", status: "In Progress", assignee: "Bob" },
          { id: 3, name: "Development Phase", status: "Pending", assignee: "Carol" }
        ],
        activityLog: projectData?.activityLog || [
          { id: 1, action: "Task Created", user: "Admin", timestamp: "0/27/2020 7:08:18 AM" },
          { id: 2, action: "Planned Deadline Changed from (9/16/2025) to (9/16/2025)", user: "System", timestamp: "6/3/2025 11:24:47 AM" },
          { id: 3, action: "State Changed from (Pending) to (Completed)", user: "kaddour alkaddour", timestamp: "6/10/2025 9:31:23 AM" },
          { id: 4, action: "Completeness Percentage Changed from (5) to (100)", user: "kaddour alkaddour", timestamp: "6/10/2025 9:31:23 AM" }
        ]
      };
      
      setProject(mockProject);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Close on Esc key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Suspended': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
        
        {/* Drawer */}
        <div
          ref={drawerRef}
          className="ml-auto h-full w-full max-w-2xl bg-white/95 backdrop-blur-xl shadow-2xl border-l border-gray-200/50 flex flex-col transition-all duration-500 ease-out transform translate-x-0 animate-slide-in-right"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/60 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-blue-100/50">
                  {project?.name?.charAt(0) || 'P'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">{project?.name || 'Loading...'}</h2>
                <p className="text-sm text-gray-600 font-medium">Reference: {project?.referenceNumber}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {project?.status || 'Active'}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {project?.progress || 0}% Complete
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowChat(true)}
                className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Chat
              </button>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-gray-100/80 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all duration-300 relative ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50/80 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50/80'
                }`}
              >
                <tab.icon className={`w-4 h-4 transition-transform duration-300 ${
                  activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                }`} />
                {tab.name}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && <OverviewTab project={project} />}
                {activeTab === 'subtasks' && <SubtasksTab project={project} />}
                {activeTab === 'chat' && <ChatTab project={project} onOpenChat={() => setShowChat(true)} />}
                {activeTab === 'files' && <FilesTab project={project} />}
                {activeTab === 'activity' && <ActivityTab project={project} />}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Drawer */}
      {showChat && (
        <ChatDrawer
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          project={project}
          chatType="project"
        />
      )}
    </>
  );
};

// Overview Tab Component
const OverviewTab = ({ project }) => (
  <div className="p-6 space-y-6">
    {/* Project Status & Priority */}
    <div className="grid grid-cols-2 gap-4">
      <div className="group bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <CheckCircleIcon className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Status</h3>
        </div>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(project?.status)}`}>
          {project?.status}
        </span>
      </div>
      <div className="group bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <ExclamationTriangleIcon className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Priority</h3>
        </div>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getPriorityColor(project?.priority)}`}>
          {project?.priority}
        </span>
      </div>
    </div>

    {/* Progress Bar */}
    <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <ClockIcon className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700">Progress</h3>
        </div>
        <span className="text-lg font-bold text-blue-900">{project?.progress}%</span>
      </div>
      <div className="relative">
        <div className="w-full bg-gray-200/60 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${project?.progress}%` }}
          ></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse"></div>
      </div>
    </div>

    {/* Plan & Category */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Plan</h3>
        <p className="text-sm font-medium text-gray-900">{project?.plan}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Category</h3>
        <p className="text-sm font-medium text-gray-900">{project?.category}</p>
      </div>
    </div>

    {/* Client Details */}
    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-6 border border-purple-200/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <UserIcon className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="text-sm font-semibold text-purple-800">Client Details</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/60 rounded-xl p-4 border border-purple-200/30">
          <span className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Client Name</span>
          <p className="text-sm font-bold text-purple-900 mt-1">{project?.owner || "SA"}</p>
        </div>
        <div className="bg-white/60 rounded-xl p-4 border border-purple-200/30">
          <span className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Client ID</span>
          <p className="text-sm font-bold text-purple-900 mt-1">{project?.clientId || "CL-001"}</p>
        </div>
        <div className="bg-white/60 rounded-xl p-4 border border-purple-200/30">
          <span className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Contact</span>
          <p className="text-sm font-bold text-purple-900 mt-1">{project?.clientContact || "+1 234 567 8900"}</p>
        </div>
        <div className="bg-white/60 rounded-xl p-4 border border-purple-200/30">
          <span className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Email</span>
          <p className="text-sm font-bold text-purple-900 mt-1">{project?.clientEmail || "client@example.com"}</p>
        </div>
      </div>
    </div>

    {/* Timeline - Planned */}
    <div className="group bg-gradient-to-br from-blue-50 via-blue-100/50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <CalendarIcon className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-blue-800">Timeline (Planned)</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/60 rounded-xl p-4 border border-blue-200/30">
          <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Start</span>
          <p className="text-sm font-bold text-blue-900 mt-1">{project?.plannedStart}</p>
        </div>
        <div className="bg-white/60 rounded-xl p-4 border border-blue-200/30">
          <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Deadline</span>
          <p className="text-sm font-bold text-blue-900 mt-1">{project?.plannedDeadline}</p>
        </div>
        <div className="bg-white/60 rounded-xl p-4 border border-blue-200/30">
          <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Duration</span>
          <p className="text-sm font-bold text-blue-900 mt-1">{project?.plannedDuration}</p>
        </div>
      </div>
    </div>

    {/* Timeline - Actual */}
    <div className="group bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border border-green-200/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <CheckCircleIcon className="w-4 h-4 text-green-600" />
        </div>
        <h3 className="text-sm font-semibold text-green-800">Timeline (Actual)</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/60 rounded-xl p-4 border border-green-200/30">
          <span className="text-xs text-green-600 font-semibold uppercase tracking-wide">Start</span>
          <p className="text-sm font-bold text-green-900 mt-1">{project?.actualStart}</p>
        </div>
        <div className="bg-white/60 rounded-xl p-4 border border-green-200/30">
          <span className="text-xs text-green-600 font-semibold uppercase tracking-wide">Complete</span>
          <p className="text-sm font-bold text-green-900 mt-1">{project?.actualComplete}</p>
        </div>
        <div className="bg-white/60 rounded-xl p-4 border border-green-200/30">
          <span className="text-xs text-green-600 font-semibold uppercase tracking-wide">Duration</span>
          <p className="text-sm font-bold text-green-900 mt-1">{project?.actualDuration}</p>
        </div>
      </div>
    </div>

    {/* Expected Start & Schedule Status */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Expected Start</h3>
        <p className="text-sm font-medium text-gray-900">{project?.expectedStart}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Schedule Status</h3>
        <p className="text-sm font-medium text-blue-600">{project?.scheduleStatus}</p>
      </div>
    </div>

    {/* Assignee, Client Details & Created By */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Assigned To</h3>
        <div className="flex items-center gap-2">
          <UserCircleIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{project?.assignee}</span>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Client Details</h3>
        <div className="flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{project?.owner}</span>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Created By</h3>
        <div className="flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{project?.createdBy}</span>
        </div>
      </div>
    </div>

    {/* Completion Percentage */}
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">Completion</h3>
        <span className="text-sm font-medium text-gray-900">{project?.completionPercentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${project?.completionPercentage}%` }}
        ></div>
      </div>
    </div>

    {/* Description */}
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
      <p className="text-sm text-gray-700 leading-relaxed">{project?.description}</p>
    </div>
  </div>
);

// Subtasks Tab Component
const SubtasksTab = ({ project }) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Subtasks</h3>
      <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
        <PlusIcon className="w-4 h-4" />
        Add Subtask
      </button>
    </div>
    <div className="space-y-3">
      {project?.subtasks?.map((subtask) => (
        <div key={subtask.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{subtask.name}</h4>
              <p className="text-sm text-gray-600">Assigned to: {subtask.assignee}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subtask.status)}`}>
              {subtask.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Chat Tab Component
const ChatTab = ({ project, onOpenChat }) => (
  <div className="p-6">
    <div className="text-center py-8">
      <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Project Chat</h3>
      <p className="text-gray-600 mb-4">Start a conversation with your team about this project.</p>
      <button
        onClick={onOpenChat}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 mx-auto"
      >
        <ChatBubbleLeftRightIcon className="w-4 h-4" />
        Open Chat
      </button>
    </div>
  </div>
);

// Files Tab Component
const FilesTab = ({ project }) => {
  const [expandedSections, setExpandedSections] = useState({
    planAttachments: true,
    taskAttachments: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Plan Attachments */}
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
        <button
          onClick={() => toggleSection('planAttachments')}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/80 transition-all duration-300 rounded-t-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Plan Attachments</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              {project?.planAttachments?.length || 0} files
            </span>
            <span className="text-gray-500 transition-transform duration-300">
              {expandedSections.planAttachments ? '▼' : '▶'}
            </span>
          </div>
        </button>
        {expandedSections.planAttachments && (
          <div className="px-4 pb-4">
            <div className="space-y-3">
              {project?.planAttachments?.map((file, index) => (
                <div key={index} className="group bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/60 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <PaperClipIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">{file.name}</h4>
                      <p className="text-sm text-gray-600 font-medium">{file.size}</p>
                    </div>
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-sm">
                      Download
                    </button>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <PaperClipIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No plan attachments</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task Attachments */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('taskAttachments')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">Task Attachments</h3>
          <span className="text-gray-500">
            {expandedSections.taskAttachments ? '▼' : '▶'}
          </span>
        </button>
        {expandedSections.taskAttachments && (
          <div className="px-4 pb-4">
            <div className="space-y-3">
              {project?.attachments?.map((file, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <PaperClipIcon className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{file.name}</h4>
                      <p className="text-sm text-gray-600">{file.size}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <PlusIcon className="w-4 h-4" />
                Upload File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Activity Tab Component
const ActivityTab = ({ project }) => (
  <div className="p-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
        <ClockIcon className="w-4 h-4 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Task History</h3>
    </div>
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <table className="min-w-full divide-y divide-gray-200/60">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Summary
            </th>
          </tr>
        </thead>
        <tbody className="bg-white/50 divide-y divide-gray-200/60">
          {project?.activityLog?.map((activity, index) => (
            <tr key={activity.id} className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
                {activity.timestamp}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                {activity.action}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Helper functions
const getStatusColor = (status) => {
  const colors = {
    'Completed': 'bg-green-100 text-green-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Suspended': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getPriorityColor = (priority) => {
  const colors = {
    'High': 'bg-red-100 text-red-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-green-100 text-green-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};

export default ProjectDetailDrawer;

// Add custom CSS animations
const styles = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.5s ease-out;
  }
  
  .glass-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
