import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import EnhancedNotifications from '../components/EnhancedNotifications';
import {
  BellIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import enhancedNotificationsData from '../data/enhancedNotifications.json';

const NotificationsPage = () => {
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

  const getCategoryColor = (category) => {
    switch (category) {
      case 'HR': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'System': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Project': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Finance': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <BellIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {filteredNotifications.length} notifications • {unreadCount} unread
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <CogIcon className="h-5 w-5" />
                Settings
              </button>
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <CheckIcon className="h-5 w-5" />
                Mark All Read
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
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
                className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-4 py-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
              >
                {sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <BellIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                      !notification.read ? 'border-l-4 border-l-orange-500 bg-orange-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar with category icon */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                          {notification.avatar}
                        </div>
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm border-2 border-white shadow-sm">
                          {getCategoryIcon(notification.category)}
                        </div>
                        {/* Priority indicator */}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getPriorityColor(notification.priority)}`}></div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-lg font-bold ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                              notification.priority === 'High' ? 'bg-red-100 text-red-700 border-red-200' :
                              notification.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                              'bg-green-100 text-green-700 border-green-200'
                            }`}>
                              {notification.priority}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(notification.category)}`}>
                              {notification.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {notification.time}
                            </span>
                            {!notification.read && (
                              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                              {notification.action}
                            </button>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                              >
                                Mark as Read
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete notification"
                          >
                            <XMarkIcon className="h-5 w-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Notification Settings</h3>
              
              {/* Category Subscriptions */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-4">Categories</h4>
                <div className="space-y-3">
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
                <h4 className="font-medium text-gray-700 mb-4">Priorities</h4>
                <div className="space-y-3">
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
                <h4 className="font-medium text-gray-700 mb-4">General</h4>
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
                <h4 className="font-medium text-gray-700 mb-4">Snooze</h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                    Snooze for 1 hour
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                    Snooze until tomorrow
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                    Snooze until next week
                  </button>
                </div>
              </div>

              {/* Save Settings */}
              <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                Save Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
