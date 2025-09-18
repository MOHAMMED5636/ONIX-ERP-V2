import React, { useState, useRef } from 'react';
import { 
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  Squares2X2Icon,
  ChartBarIcon,
  ChartPieIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  AdjustmentsHorizontalIcon,
  PaintBrushIcon,
  ViewColumnsIcon,
  TableCellsIcon,
  RectangleGroupIcon,
  PhotoIcon,
  DocumentIcon,
  FolderIcon,
  StarIcon,
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClipboardDocumentIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const CustomizableView = () => {
  const [viewMode, setViewMode] = useState('view'); // view, edit, create
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customViews, setCustomViews] = useState([
    {
      id: 1,
      name: 'Construction Overview',
      description: 'Main dashboard for construction project management',
      isDefault: true,
      widgets: [
        { id: 'w1', type: 'task-summary', position: { x: 0, y: 0, w: 4, h: 2 }, data: {} },
        { id: 'w2', type: 'progress-chart', position: { x: 4, y: 0, w: 4, h: 2 }, data: {} },
        { id: 'w3', type: 'team-performance', position: { x: 8, y: 0, w: 4, h: 2 }, data: {} },
        { id: 'w4', type: 'recent-activity', position: { x: 0, y: 2, w: 6, h: 3 }, data: {} },
        { id: 'w5', type: 'upcoming-deadlines', position: { x: 6, y: 2, w: 6, h: 3 }, data: {} }
      ]
    },
    {
      id: 2,
      name: 'Safety Dashboard',
      description: 'Safety-focused view for construction safety management',
      isDefault: false,
      widgets: [
        { id: 'w6', type: 'safety-metrics', position: { x: 0, y: 0, w: 6, h: 2 }, data: {} },
        { id: 'w7', type: 'incident-reports', position: { x: 6, y: 0, w: 6, h: 2 }, data: {} },
        { id: 'w8', type: 'safety-checklist', position: { x: 0, y: 2, w: 12, h: 3 }, data: {} }
      ]
    }
  ]);
  
  const [currentView, setCurrentView] = useState(customViews[0]);
  const [newView, setNewView] = useState({ name: '', description: '' });
  const [showCreateView, setShowCreateView] = useState(false);

  const widgetTypes = [
    {
      id: 'task-summary',
      name: 'Task Summary',
      icon: ChartBarIcon,
      description: 'Overview of task statistics',
      category: 'Analytics',
      defaultSize: { w: 4, h: 2 }
    },
    {
      id: 'progress-chart',
      name: 'Progress Chart',
      icon: ChartPieIcon,
      description: 'Visual progress tracking',
      category: 'Charts',
      defaultSize: { w: 4, h: 2 }
    },
    {
      id: 'team-performance',
      name: 'Team Performance',
      icon: UsersIcon,
      description: 'Team member performance metrics',
      category: 'Analytics',
      defaultSize: { w: 4, h: 2 }
    },
    {
      id: 'recent-activity',
      name: 'Recent Activity',
      icon: ClockIcon,
      description: 'Latest project activities',
      category: 'Activity',
      defaultSize: { w: 6, h: 3 }
    },
    {
      id: 'upcoming-deadlines',
      name: 'Upcoming Deadlines',
      icon: CalendarIcon,
      description: 'Tasks and deadlines calendar',
      category: 'Calendar',
      defaultSize: { w: 6, h: 3 }
    },
    {
      id: 'safety-metrics',
      name: 'Safety Metrics',
      icon: ShieldCheckIcon,
      description: 'Safety performance indicators',
      category: 'Safety',
      defaultSize: { w: 6, h: 2 }
    },
    {
      id: 'incident-reports',
      name: 'Incident Reports',
      icon: ExclamationTriangleIcon,
      description: 'Safety incident tracking',
      category: 'Safety',
      defaultSize: { w: 6, h: 2 }
    },
    {
      id: 'safety-checklist',
      name: 'Safety Checklist',
      icon: CheckCircleIcon,
      description: 'Safety compliance checklist',
      category: 'Safety',
      defaultSize: { w: 12, h: 3 }
    },
    {
      id: 'file-gallery',
      name: 'File Gallery',
      icon: FolderIcon,
      description: 'Recent files and documents',
      category: 'Files',
      defaultSize: { w: 6, h: 3 }
    },
    {
      id: 'weather-widget',
      name: 'Weather',
      icon: PhotoIcon,
      description: 'Current weather conditions',
      category: 'External',
      defaultSize: { w: 3, h: 2 }
    }
  ];

  const getWidgetIcon = (type) => {
    const widget = widgetTypes.find(w => w.id === type);
    return widget ? widget.icon : Squares2X2Icon;
  };

  const getWidgetName = (type) => {
    const widget = widgetTypes.find(w => w.id === type);
    return widget ? widget.name : 'Unknown Widget';
  };

  const handleAddWidget = (widgetType) => {
    const widget = widgetTypes.find(w => w.id === widgetType);
    if (widget) {
      const newWidget = {
        id: `w${Date.now()}`,
        type: widgetType,
        position: { x: 0, y: 0, w: widget.defaultSize.w, h: widget.defaultSize.h },
        data: {}
      };
      setCurrentView(prev => ({
        ...prev,
        widgets: [...prev.widgets, newWidget]
      }));
    }
    setShowWidgetLibrary(false);
  };

  const handleRemoveWidget = (widgetId) => {
    setCurrentView(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }));
  };

  const handleCreateView = () => {
    const newViewData = {
      id: Date.now(),
      name: newView.name,
      description: newView.description,
      isDefault: false,
      widgets: []
    };
    setCustomViews(prev => [...prev, newViewData]);
    setCurrentView(newViewData);
    setNewView({ name: '', description: '' });
    setShowCreateView(false);
    setViewMode('edit');
  };

  const handleSaveView = () => {
    setCustomViews(prev => 
      prev.map(view => 
        view.id === currentView.id ? currentView : view
      )
    );
    setViewMode('view');
  };

  const renderWidget = (widget) => {
    const WidgetIcon = getWidgetIcon(widget.type);
    
    return (
      <div
        key={widget.id}
        className={`bg-white rounded-xl border-2 shadow-lg transition-all duration-200 ${
          viewMode === 'edit' 
            ? 'border-blue-300 hover:border-blue-500 cursor-move' 
            : 'border-gray-200'
        }`}
        style={{
          gridColumn: `span ${widget.position.w}`,
          gridRow: `span ${widget.position.h}`
        }}
      >
        <div className="p-4 h-full">
          {/* Widget Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <WidgetIcon className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">{getWidgetName(widget.type)}</h3>
            </div>
            {viewMode === 'edit' && (
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedWidget(widget)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Configure"
                >
                  <Cog6ToothIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => handleRemoveWidget(widget.id)}
                  className="p-1 hover:bg-red-100 rounded"
                  title="Remove"
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}
          </div>

          {/* Widget Content */}
          <div className="h-full">
            {widget.type === 'task-summary' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <div className="text-sm text-blue-800">Total Tasks</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">89</div>
                  <div className="text-sm text-green-800">Completed</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">42</div>
                  <div className="text-sm text-yellow-800">In Progress</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">25</div>
                  <div className="text-sm text-red-800">Pending</div>
                </div>
              </div>
            )}

            {widget.type === 'progress-chart' && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ChartPieIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm text-gray-600">Progress Chart</div>
                  <div className="text-xs text-gray-500">Visual progress tracking</div>
                </div>
              </div>
            )}

            {widget.type === 'team-performance' && (
              <div className="space-y-3">
                {['SA', 'MN', 'AH', 'MA'].map((member, index) => (
                  <div key={member} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${
                        ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500'][index]
                      } flex items-center justify-center text-white text-sm font-bold`}>
                        {member}
                      </div>
                      <span className="text-sm font-medium">{member}</span>
                    </div>
                    <div className="text-sm text-gray-600">{85 + index * 5}%</div>
                  </div>
                ))}
              </div>
            )}

            {widget.type === 'recent-activity' && (
              <div className="space-y-3">
                {[
                  { action: 'Task completed', user: 'SA', time: '2 min ago' },
                  { action: 'File uploaded', user: 'MN', time: '15 min ago' },
                  { action: 'Comment added', user: 'AH', time: '1 hour ago' },
                  { action: 'Status updated', user: 'MA', time: '2 hours ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                      <div className="text-xs text-gray-500">{activity.user} • {activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {widget.type === 'upcoming-deadlines' && (
              <div className="space-y-3">
                {[
                  { task: 'Foundation Excavation', deadline: 'Sep 20, 2025', priority: 'High' },
                  { task: 'Steel Frame Installation', deadline: 'Sep 25, 2025', priority: 'Medium' },
                  { task: 'Electrical Wiring', deadline: 'Oct 1, 2025', priority: 'High' }
                ].map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{deadline.task}</div>
                      <div className="text-xs text-gray-500">{deadline.deadline}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      deadline.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {deadline.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {widget.type === 'safety-metrics' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">0</div>
                  <div className="text-xs text-green-800">Incidents</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">100%</div>
                  <div className="text-xs text-blue-800">Compliance</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600">5</div>
                  <div className="text-xs text-yellow-800">Inspections</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">12</div>
                  <div className="text-xs text-purple-800">Training Hours</div>
                </div>
              </div>
            )}

            {widget.type === 'incident-reports' && (
              <div className="space-y-2">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-green-800">No incidents reported</div>
                  <div className="text-xs text-green-600">Last 30 days</div>
                </div>
              </div>
            )}

            {widget.type === 'safety-checklist' && (
              <div className="space-y-2">
                {[
                  'Safety equipment checked',
                  'Site inspection completed',
                  'Team safety briefing conducted',
                  'Emergency procedures reviewed'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            )}

            {widget.type === 'file-gallery' && (
              <div className="space-y-2">
                {[
                  { name: 'Blueprint.pdf', type: 'PDF', size: '2.4 MB' },
                  { name: 'Progress.jpg', type: 'Image', size: '1.8 MB' },
                  { name: 'Report.docx', type: 'Document', size: '456 KB' }
                ].map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <DocumentIcon className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{file.name}</div>
                      <div className="text-xs text-gray-500">{file.type} • {file.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {widget.type === 'weather-widget' && (
              <div className="text-center">
                <div className="text-3xl mb-2">☀️</div>
                <div className="text-lg font-bold text-gray-900">22°C</div>
                <div className="text-xs text-gray-500">Sunny</div>
                <div className="text-xs text-gray-400 mt-1">Good for construction</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - Customizable Views Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Bars3Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Customizable Views</h2>
              <p className="text-sm text-gray-600">Personalized dashboards</p>
            </div>
          </div>
          
          {/* Right side - Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
              <PlusIcon className="w-5 h-5" /> New View
            </button>
            
            <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
              <ClipboardDocumentIcon className="w-5 h-5" /> Templates
            </button>
            
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search views... (Ctrl+K to focus)"
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

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* View Selector */}
          <div className="flex gap-4">
            <select
              value={currentView.id}
              onChange={(e) => setCurrentView(customViews.find(v => v.id === parseInt(e.target.value)))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {customViews.map(view => (
                <option key={view.id} value={view.id}>{view.name}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'edit' ? 'view' : 'edit')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'edit' 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {viewMode === 'edit' ? (
                <>
                  <EyeIcon className="w-4 h-4" />
                  View Mode
                </>
              ) : (
                <>
                  <PencilIcon className="w-4 h-4" />
                  Edit Mode
                </>
              )}
            </button>

            {viewMode === 'edit' && (
              <>
                <button
                  onClick={() => setShowWidgetLibrary(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Widget
                </button>
                <button
                  onClick={handleSaveView}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Save View
                </button>
              </>
            )}

            <button
              onClick={() => setShowCreateView(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              New View
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="bg-gray-50 rounded-xl p-6 min-h-[600px]">
        {currentView.widgets.length > 0 ? (
          <div className="grid grid-cols-12 gap-4 auto-rows-min">
            {currentView.widgets.map(renderWidget)}
          </div>
        ) : (
          <div className="text-center py-12">
            <Squares2X2Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets added</h3>
            <p className="text-gray-500 mb-4">Add widgets to build your custom dashboard</p>
            {viewMode === 'edit' && (
              <button
                onClick={() => setShowWidgetLibrary(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Widget
              </button>
            )}
          </div>
        )}
      </div>

      {/* Widget Library Modal */}
      {showWidgetLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Widget Library</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgetTypes.map((widget) => (
                <div key={widget.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <widget.icon className="w-6 h-6 text-gray-600" />
                    <h4 className="font-medium text-gray-900">{widget.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{widget.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {widget.category}
                    </span>
                    <button
                      onClick={() => handleAddWidget(widget.id)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowWidgetLibrary(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create View Modal */}
      {showCreateView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New View</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View Name *</label>
                <input
                  type="text"
                  value={newView.name}
                  onChange={(e) => setNewView(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter view name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newView.description}
                  onChange={(e) => setNewView(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter view description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateView(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateView}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizableView;
