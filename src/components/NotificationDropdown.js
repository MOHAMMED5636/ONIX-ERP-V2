import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  CogIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import enhancedNotificationsData from '../data/enhancedNotifications.json';

const NotificationDropdown = ({ isOpen, onClose, unreadCount = 0 }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showSettings, setShowSettings] = useState(false);

  const categories = ['All', 'HR', 'System', 'Project', 'Finance'];

  // Filter notifications
  useEffect(() => {
    let filtered = [...notifications];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(notification => notification.category === selectedCategory);
    }

    // Show only first 5 for dropdown
    filtered = filtered.slice(0, 5);

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, selectedCategory]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true, status: 'Read' }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => 
        ({ ...notification, read: true, status: 'Read' }))
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'HR': return '👥';
      case 'System': return '🔧';
      case 'Project': return '📋';
      case 'Finance': return '💰';
      default: return '📢';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <BellIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
              <p className="text-sm text-gray-600">
                {notifications.filter(n => !n.read).length} new updates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              title="Settings"
            >
              <CogIcon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <XMarkIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-1 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <BellIcon className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-sm font-medium">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-orange-50/50 border-l-4 border-l-orange-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar with category icon */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
                      {notification.avatar}
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs border border-white shadow-sm">
                      {getCategoryIcon(notification.category)}
                    </div>
                    {/* Priority indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white ${getPriorityColor(notification.priority)}`}></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          notification.priority === 'High' ? 'bg-red-100 text-red-700' :
                          notification.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {notification.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          notification.category === 'HR' ? 'bg-blue-100 text-blue-700' :
                          notification.category === 'System' ? 'bg-purple-100 text-purple-700' :
                          notification.category === 'Project' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {notification.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {notification.time}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-green-100 rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <CheckIcon className="h-3 w-3 text-green-600" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <button className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600 transition-colors">
                      {notification.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            className="flex-1 text-center text-sm bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Mark All Read
          </button>
          <button className="flex-1 text-center text-sm bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            View All
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-0 bg-white rounded-2xl p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <XMarkIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
              <div className="space-y-2">
                {['HR', 'System', 'Project', 'Finance'].map(category => (
                  <label key={category} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Priorities</h4>
              <div className="space-y-2">
                {['High', 'Medium', 'Low'].map(priority => (
                  <label key={priority} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">{priority}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

