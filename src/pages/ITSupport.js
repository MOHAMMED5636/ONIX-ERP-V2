import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ComputerDesktopIcon,
  WifiIcon,
  EnvelopeIcon,
  ServerIcon,
  CpuChipIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

const ITSupport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  const canViewHistory = role === 'ADMIN' || role === 'HR';
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    priority: 'Medium',
    deviceInfo: {
      deviceType: '',
      os: '',
      ip: '',
      browser: ''
    },
    attachments: []
  });

  // Tickets state
  const [tickets, setTickets] = useState([
    {
      id: 'IT-001',
      category: 'Laptop/Desktop',
      status: 'Open',
      assignedIT: 'John Smith',
      submittedDate: '2024-01-15',
      priority: 'High',
      description: 'Laptop not booting up'
    },
    {
      id: 'IT-002',
      category: 'Network/Internet',
      status: 'In Progress',
      assignedIT: 'Sarah Johnson',
      submittedDate: '2024-01-14',
      priority: 'Medium',
      description: 'WiFi connection issues'
    },
    {
      id: 'IT-003',
      category: 'Outlook/Email',
      status: 'Resolved',
      assignedIT: 'Mike Wilson',
      submittedDate: '2024-01-13',
      priority: 'Low',
      description: 'Email not syncing'
    }
  ]);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Device info detection
  useEffect(() => {
    const detectDeviceInfo = () => {
      const deviceInfo = {
        deviceType: navigator.userAgent.includes('Mobile') ? 'Mobile' : 
                   navigator.userAgent.includes('Tablet') ? 'Tablet' : 'Desktop',
        os: navigator.platform,
        ip: 'Auto-detecting...',
        browser: navigator.userAgent.split(' ').pop().split('/')[0]
      };
      setFormData(prev => ({ ...prev, deviceInfo }));
    };

    detectDeviceInfo();
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newTicket = {
      id: `IT-${String(tickets.length + 1).padStart(3, '0')}`,
      category: formData.category,
      status: 'Open',
      assignedIT: 'Unassigned',
      submittedDate: new Date().toISOString().split('T')[0],
      priority: formData.priority,
      description: formData.description
    };

    setTickets(prev => [newTicket, ...prev]);

    // Reset form
    setFormData({
      category: '',
      description: '',
      priority: 'Medium',
      deviceInfo: { deviceType: '', os: '', ip: '', browser: '' },
      attachments: []
    });
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || ticket.category === filterCategory;
    const matchesStatus = !filterStatus || ticket.status === filterStatus;
    const matchesPriority = !filterPriority || ticket.priority === filterPriority;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  // Category icons
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Laptop/Desktop': return <ComputerDesktopIcon className="w-5 h-5" />;
      case 'Network/Internet': return <WifiIcon className="w-5 h-5" />;
      case 'Outlook/Email': return <EnvelopeIcon className="w-5 h-5" />;
      case 'Admin/Server': return <ServerIcon className="w-5 h-5" />;
      case 'Software/Application': return <CpuChipIcon className="w-5 h-5" />;
      default: return <QuestionMarkCircleIcon className="w-5 h-5" />;
    }
  };

  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'text-blue-600 bg-blue-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Resolved': return 'text-green-600 bg-green-100';
      case 'Closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <ComputerDesktopIcon className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">IT Support</h1>
              <p className="text-blue-100">Submit and track IT tickets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Admin shortcut: System Feedback */}
        {role === 'ADMIN' && (
          <div className="bg-white shadow-lg rounded-lg p-6 border border-indigo-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <QuestionMarkCircleIcon className="w-6 h-6 text-indigo-600" />
                  System Feedback
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Quick access for Ramiz to collect feedback and review submissions.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-system-feedback'))}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow"
                >
                  Submit feedback
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/system-feedback')}
                  className="px-5 py-2.5 rounded-lg border border-indigo-200 text-indigo-700 font-medium hover:bg-indigo-50"
                >
                  Review feedback inbox
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Submission Form */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6 text-blue-500" />
            Submit New Ticket
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { value: 'Laptop/Desktop', icon: <ComputerDesktopIcon className="w-4 h-4" />, color: 'blue' },
                  { value: 'Network/Internet', icon: <WifiIcon className="w-4 h-4" />, color: 'green' },
                  { value: 'Outlook/Email', icon: <EnvelopeIcon className="w-4 h-4" />, color: 'purple' },
                  { value: 'Admin/Server', icon: <ServerIcon className="w-4 h-4" />, color: 'red' },
                  { value: 'Software/Application', icon: <CpuChipIcon className="w-4 h-4" />, color: 'yellow' },
                  { value: 'Other', icon: <QuestionMarkCircleIcon className="w-4 h-4" />, color: 'gray' }
                ].map(({ value, icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: value }))}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
                      formData.category === value
                        ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {icon}
                    <span className="text-sm font-medium">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Issue Description */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="4"
                placeholder="Describe the issue in detail..."
              />
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'Low', color: 'green', icon: <CheckCircleIcon className="w-4 h-4" /> },
                  { value: 'Medium', color: 'yellow', icon: <ClockIcon className="w-4 h-4" /> },
                  { value: 'High', color: 'red', icon: <ExclamationTriangleIcon className="w-4 h-4" /> }
                ].map(({ value, color, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: value }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                      formData.priority === value
                        ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {icon}
                    <span className="text-sm font-medium">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Device Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Device Information (Auto-detected)</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Device Type:</span>
                  <span className="ml-2 font-medium">{formData.deviceInfo.deviceType}</span>
                </div>
                <div>
                  <span className="text-gray-500">OS:</span>
                  <span className="ml-2 font-medium">{formData.deviceInfo.os}</span>
                </div>
                <div>
                  <span className="text-gray-500">Browser:</span>
                  <span className="ml-2 font-medium">{formData.deviceInfo.browser}</span>
                </div>
                <div>
                  <span className="text-gray-500">IP:</span>
                  <span className="ml-2 font-medium">{formData.deviceInfo.ip}</span>
                </div>
              </div>
            </div>

            {/* File Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (Screenshots, Logs)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.txt,.log"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <ArrowUpTrayIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-600 font-medium">Click to upload files</span>
                  <span className="text-sm text-gray-500">PNG, JPG, PDF, TXT, LOG</span>
                </label>
              </div>
              
              {formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <PaperClipIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            attachments: prev.attachments.filter((_, i) => i !== index)
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    category: '',
                    description: '',
                    priority: 'Medium',
                    deviceInfo: { deviceType: '', os: '', ip: '', browser: '' },
                    attachments: []
                  });
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={!formData.category || !formData.description}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  formData.category && formData.description
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>

        {/* Ticket History & Status — only Admin/HR can see full history */}
        {canViewHistory && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-green-500" />
            Ticket History
          </h2>

          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <FunnelIcon className="w-4 h-4" />
                Filters
              </button>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Laptop/Desktop">Laptop/Desktop</option>
                <option value="Network/Internet">Network/Internet</option>
                <option value="Outlook/Email">Outlook/Email</option>
                <option value="Admin/Server">Admin/Server</option>
                <option value="Software/Application">Software/Application</option>
                <option value="Other">Other</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Ticket ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Assigned IT</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="py-3 px-4">
                      <span className="font-medium text-blue-600">{ticket.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(ticket.category)}
                        <span className="text-sm text-gray-700">{ticket.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{ticket.assignedIT}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500">{ticket.submittedDate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ITSupport;