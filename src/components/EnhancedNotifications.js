import React, { useState, useEffect, useRef } from 'react';
import {
  BellIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  CogIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import enhancedNotificationsData from '../data/enhancedNotifications.json';

const EnhancedNotifications = ({ isOpen, onClose, unreadCount = 0 }) => {
  const [notifications, setNotifications] = useState(enhancedNotificationsData);
  const [filteredNotifications, setFilteredNotifications] = useState(enhancedNotificationsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    categories: {
      'HR': true,
      'System': true,
      'Project': true,
      'Finance': true
    },
    priorities: {
      'High': true,
      'Medium': true,
      'Low': true
    },
    muteNotifications: false,
    snoozeUntil: null
  });

  const categories = ['All', 'HR', 'System', 'Project', 'Finance'];
  const priorities = ['High', 'Medium', 'Low'];
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' }
  ];

  // Filter and sort notifications
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

    // Apply enabled categories from settings
    const enabledCategories = Object.keys(notificationSettings.categories).filter(
      cat => notificationSettings.categories[cat]
    );
    filtered = filtered.filter(notification => 
      enabledCategories.includes(notification.category)
    );

    // Apply priority filter from settings
    const enabledPriorities = Object.keys(notificationSettings.priorities).filter(
      priority => notificationSettings.priorities[priority]
    );
    filtered = filtered.filter(notification => 
      enabledPriorities.includes(notification.priority)
    );

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.timestamp) - new Date(b.timestamp);
          break;
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.read - b.read; // Unread (false) comes first
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, selectedCategory, sortBy, sortOrder, notificationSettings]);

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

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const toggleCategorySubscription = (category) => {
    setNotificationSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }));
  };

  const togglePrioritySubscription = (priority) => {
    setNotificationSettings(prev => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [priority]: !prev.priorities[priority]
      }
    }));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <BellIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-xl">Notifications</h2>
                <p className="text-sm text-gray-600">
                  {filteredNotifications.length} notifications • {notifications.filter(n => !n.read).length} unread
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                title="Notification Settings"
              >
                <CogIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
              >
                {sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>

            {/* Mark All Read Button */}
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              Mark All Read
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto max-h-[60vh]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <BellIcon className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium">No notifications found</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar with category icon */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                          {notification.avatar}
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs border-2 border-white">
                          {getCategoryIcon(notification.category)}
                        </div>
                        {/* Priority indicator */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getPriorityColor(notification.priority)}`}></div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-sm font-bold ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notification.priority === 'High' ? 'bg-red-100 text-red-700' :
                                notification.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {notification.priority}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notification.category === 'HR' ? 'bg-blue-100 text-blue-700' :
                                notification.category === 'System' ? 'bg-purple-100 text-purple-700' :
                                notification.category === 'Project' ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {notification.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-500">
                                {notification.time}
                              </span>
                              <button className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600 transition-colors">
                                {notification.action}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-green-100 rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 hover:bg-red-100 rounded-full transition-colors"
                          title="Delete notification"
                        >
                          <XMarkIcon className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto max-h-[60vh]">
              <h3 className="font-bold text-gray-900 mb-4">Notification Settings</h3>
              
              {/* Category Subscriptions */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2">
                  {Object.keys(notificationSettings.categories).map(category => (
                    <label key={category} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notificationSettings.categories[category]}
                        onChange={() => toggleCategorySubscription(category)}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Subscriptions */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Priorities</h4>
                <div className="space-y-2">
                  {Object.keys(notificationSettings.priorities).map(priority => (
                    <label key={priority} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={notificationSettings.priorities[priority]}
                        onChange={() => togglePrioritySubscription(priority)}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mute Notifications */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">General</h4>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.muteNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      muteNotifications: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Mute all notifications</span>
                </label>
              </div>

              {/* Snooze */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Snooze</h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    Snooze for 1 hour
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    Snooze until tomorrow
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    Snooze until next week
                  </button>
                </div>
              </div>

              {/* Save Settings */}
              <button className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                Save Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedNotifications;
