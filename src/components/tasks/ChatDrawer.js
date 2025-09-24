import React, { useState, useEffect, useRef } from 'react';

/**
 * ChatDrawer Component - Multi-level chat interface
 * 
 * Usage Examples:
 * 
 * // Project Chat
 * <ChatDrawer 
 *   isOpen={true} 
 *   onClose={handleClose} 
 *   project={projectData} 
 *   chatType="project" 
 * />
 * 
 * // Task Chat
 * <ChatDrawer 
 *   isOpen={true} 
 *   onClose={handleClose} 
 *   project={taskData} 
 *   chatType="task" 
 * />
 * 
 * // Child Task Chat
 * <ChatDrawer 
 *   isOpen={true} 
 *   onClose={handleClose} 
 *   project={childTaskData} 
 *   chatType="child-task" 
 * />
 */
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
  UserPlusIcon,
  UsersIcon,
  CheckIcon,
  XMarkIcon as CloseIcon,
  PhoneIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  CameraIcon,
  FaceSmileIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  BellIcon,
  BellSlashIcon,
  StarIcon,
  EllipsisVerticalIcon,
  ArrowUturnLeftIcon,
  ShareIcon,
  DocumentIcon,
  LinkIcon,
  PhotoIcon,
  VideoCameraIcon as VideoIcon,
  SpeakerWaveIcon,
  BookmarkIcon,
  EyeIcon,
  EyeSlashIcon,
  HeartIcon,
  TrashIcon,
  ForwardIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const ChatDrawer = ({ isOpen, onClose, project, socket, chatType = 'project' }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [showInviteEngineers, setShowInviteEngineers] = useState(false);
  const [selectedEngineers, setSelectedEngineers] = useState([]);
  const [inviteMessage, setInviteMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Enhanced chat features
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState('voice'); // 'voice' or 'video'
  const [isCallActive, setIsCallActive] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // WhatsApp-style features
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [messageMenuPosition, setMessageMenuPosition] = useState({ x: 0, y: 0 });
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [pinnedChats, setPinnedChats] = useState([]);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [messageGroups, setMessageGroups] = useState({});
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [attachmentFilter, setAttachmentFilter] = useState('all'); // all, media, docs, links

  // Available engineers for invitation
  const availableEngineers = [
    { id: 'SA', name: 'Sarah Ahmed', role: 'Senior Developer', avatar: 'SA', status: 'online' },
    { id: 'MN', name: 'Mohammed Nasser', role: 'Project Manager', avatar: 'MN', status: 'online' },
    { id: 'AH', name: 'Ahmed Hassan', role: 'Frontend Developer', avatar: 'AH', status: 'away' },
    { id: 'MA', name: 'Mariam Ali', role: 'Backend Developer', avatar: 'MA', status: 'offline' },
    { id: 'FK', name: 'Fatima Khalil', role: 'UI/UX Designer', avatar: 'FK', status: 'online' },
    { id: 'OS', name: 'Omar Salem', role: 'DevOps Engineer', avatar: 'OS', status: 'online' },
    { id: 'RA', name: 'Rana Ahmed', role: 'QA Engineer', avatar: 'RA', status: 'away' },
    { id: 'YK', name: 'Youssef Khalil', role: 'Database Admin', avatar: 'YK', status: 'offline' }
  ];

  // Current chat participants (sample data)
  const [chatParticipants, setChatParticipants] = useState([
    { id: 'SA', name: 'Sarah Ahmed', role: 'Senior Developer', avatar: 'SA', status: 'online' },
    { id: 'MN', name: 'Mohammed Nasser', role: 'Project Manager', avatar: 'MN', status: 'online' }
  ]);

  // Get context-appropriate sample messages based on chat type
  const getSampleMessages = () => {
    const baseMessages = [
    {
      id: 1,
      chatId: project?.id || 'default',
      senderId: "SA",
      text: "🚀 Project kickoff meeting scheduled for tomorrow at 10 AM. Looking forward to working with everyone!",
      type: "text",
      status: "read",
      createdAt: Date.now() - 2 * 60 * 60 * 1000, // Use timestamp directly
      isOwn: false,
      starredBy: [],
      replyTo: null,
      forwarded: false
    },
    {
      id: 2,
      chatId: project?.id || 'default',
      senderId: "MN",
      text: "Great! I'll prepare the requirements document and share it with the team 📋",
      type: "text",
      status: "read",
      createdAt: Date.now() - 1 * 60 * 60 * 1000,
      isOwn: true,
      starredBy: [],
      replyTo: null,
      forwarded: false
    },
    {
      id: 3,
      chatId: project?.id || 'default',
      senderId: "AH",
      text: "The design mockups are ready for review! 🎨 Check the shared folder for the latest versions.",
      type: "text",
      status: "delivered",
      createdAt: Date.now() - 30 * 60 * 1000,
      isOwn: false,
      starredBy: ["MN"],
      replyTo: null,
      forwarded: false
    },
    {
      id: 4,
      chatId: project?.id || 'default',
      senderId: "FK",
      text: "Thanks for the update! The designs look amazing ✨",
      type: "text",
      status: "read",
      createdAt: Date.now() - 15 * 60 * 1000,
      isOwn: true,
      starredBy: [],
      replyTo: null,
      forwarded: false
    },
    {
      id: 5,
      chatId: project?.id || 'default',
      senderId: "SA",
      text: "I've completed the user authentication module. Ready for testing! 🔐",
      type: "text",
      status: "delivered",
      createdAt: Date.now() - 10 * 60 * 1000,
      isOwn: false,
      starredBy: [],
      replyTo: null,
      forwarded: false
    },
    {
      id: 6,
      chatId: project?.id || 'default',
      senderId: "MN",
      text: "Excellent work! Let's schedule a code review session for tomorrow.",
      type: "text",
      status: "read",
      createdAt: Date.now() - 8 * 60 * 1000,
      isOwn: true,
      starredBy: ["SA"],
      replyTo: null,
      forwarded: false
    },
    {
      id: 7,
      chatId: project?.id || 'default',
      senderId: "AH",
      text: "The database schema has been updated. Please check the migration files.",
      type: "text",
      status: "sent",
      createdAt: Date.now() - 5 * 60 * 1000,
      isOwn: false,
      starredBy: [],
      replyTo: null,
      forwarded: false
    },
    {
      id: 8,
      chatId: project?.id || 'default',
      senderId: "FK",
      text: "I'll review the changes and provide feedback by end of day.",
      type: "text",
      status: "read",
      createdAt: Date.now() - 3 * 60 * 1000,
      isOwn: true,
      starredBy: [],
      replyTo: null,
      forwarded: false
    },
    {
      id: 9,
      chatId: project?.id || 'default',
      senderId: "SA",
      text: "Meeting notes from today's standup have been shared in the project folder.",
      type: "text",
      status: "delivered",
      createdAt: Date.now() - 2 * 60 * 1000,
      isOwn: false,
      starredBy: [],
      replyTo: null,
      forwarded: false
    },
    {
      id: 10,
      chatId: project?.id || 'default',
      senderId: "MN",
      text: "Thanks for the update! Looking forward to the next sprint planning session.",
      type: "text",
      status: "read",
      createdAt: Date.now() - 1 * 60 * 1000,
      isOwn: true,
      starredBy: [],
      replyTo: null,
      forwarded: false
    }
  ];

    // Customize messages based on chat type
    switch (chatType) {
      case 'project':
        return baseMessages.map(msg => ({
          ...msg,
          text: msg.text.replace(/task/gi, 'project').replace(/Task/gi, 'Project')
        }));
      case 'task':
        return baseMessages; // Keep as is for task chat
      case 'child-task':
        return baseMessages.map(msg => ({
          ...msg,
          text: msg.text.replace(/project/gi, 'child task').replace(/Project/gi, 'Child Task')
        }));
      default:
        return baseMessages;
    }
  };

  const sampleMessages = getSampleMessages();

  // Initialize messages with sample data
  useEffect(() => {
    if (isOpen && project) {
      // Ensure all messages have required properties with defaults
      const messagesWithDefaults = sampleMessages.map(msg => ({
        ...msg,
        starredBy: msg.starredBy || [],
        replyTo: msg.replyTo || null,
        forwarded: msg.forwarded || false,
        createdAt: ensureTimestamp(msg.createdAt)
      }));
      setMessages(messagesWithDefaults);
    }
  }, [isOpen, project]);

  // Socket.IO integration
  useEffect(() => {
    if (!socket || !project) return;

    const roomName = `project-${project.id}`;
    
    // Join project room
    socket.emit('join-room', roomName);
    setIsConnected(true);

    // Listen for new messages
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: message.text,
        sender: message.sender,
        timestamp: new Date(message.timestamp),
        isOwn: message.sender === 'Current User' // Replace with actual user logic
      }]);
    };

    socket.on('new-message', handleNewMessage);

    // Cleanup
    return () => {
      socket.emit('leave-room', roomName);
      socket.off('new-message', handleNewMessage);
      setIsConnected(false);
    };
  }, [socket, project]);

  // Enhanced auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [messages]);

  // Scroll to bottom function for manual use
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  // Handle scroll to bottom button
  const handleScrollToBottom = () => {
    scrollToBottom();
  };

  // Handle expand/collapse toggle
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // WhatsApp-style handlers
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = messages.filter(msg => 
        msg.text.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  };

  const handleMessageRightClick = (e, message) => {
    e.preventDefault();
    setSelectedMessage(message);
    setMessageMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMessageMenu(true);
  };

  const handleMessageDoubleClick = (message) => {
    // Double-click to show message details modal
    setSelectedMessage(message);
    setShowMessageDetails(true);
  };

  const handleMessageAction = (action, message) => {
    switch (action) {
      case 'reply':
        setReplyToMessage(message);
        // Focus on the input field
        const inputElement = document.querySelector('input[placeholder="Type a message..."]');
        if (inputElement) {
          inputElement.focus();
        }
        break;
      case 'forward':
        // Implement forward functionality - for now, just copy to clipboard
        navigator.clipboard.writeText(`Forwarded: ${message.text}`);
        alert('Message copied to clipboard for forwarding');
        break;
      case 'copy':
        navigator.clipboard.writeText(message.text);
        alert('Message copied to clipboard');
        break;
      case 'star':
        // Toggle star status
        const updatedMessages = messages.map(msg => {
          if (msg.id === message.id) {
            const isStarred = msg.starredBy && msg.starredBy.includes('currentUser');
            return {
              ...msg,
              starredBy: isStarred 
                ? msg.starredBy.filter(id => id !== 'currentUser')
                : [...(msg.starredBy || []), 'currentUser']
            };
          }
          return msg;
        });
        setMessages(updatedMessages);
        break;
      case 'delete':
        // Delete message
        if (window.confirm('Are you sure you want to delete this message?')) {
          const updatedMessages = messages.filter(msg => msg.id !== message.id);
          setMessages(updatedMessages);
        }
        break;
    }
    setShowMessageMenu(false);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Implement voice recording
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Stop recording and send
  };

  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handlePinChat = () => {
    if (pinnedChats.includes(project.id)) {
      setPinnedChats(pinnedChats.filter(id => id !== project.id));
    } else {
      setPinnedChats([...pinnedChats, project.id]);
    }
  };

  // Handle click outside to close context menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMessageMenu && !event.target.closest('.message-context-menu')) {
        setShowMessageMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMessageMenu]);

  // Handle scroll detection
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom && messages.length > 5);
    
    // Reset unread count when scrolled to bottom
    if (isNearBottom) {
      setUnreadCount(0);
    }
  };

  // Handle new message arrival
  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
    setUnreadCount(prev => prev + 1);
  };

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !project) return;

    const message = {
      text: newMessage.trim(),
      sender: 'Current User', // Replace with actual user logic
      timestamp: new Date(),
      projectId: project.id
    };

    // Emit message to server
    socket.emit('send-message', {
      room: `project-${project.id}`,
      message: message
    });

    // Add message to local state immediately
    setMessages(prev => [...prev, {
      id: Date.now(),
      ...message,
      isOwn: true
    }]);

    setNewMessage('');
  };

  // Enhanced chat handlers
  const handleStartCall = (type) => {
    setCallType(type);
    setShowCallModal(true);
  };

  const handleJoinCall = () => {
    setIsCallActive(true);
    setShowCallModal(false);
    // Here you would integrate with WebRTC or your preferred video calling service
    console.log(`Starting ${callType} call for project: ${project.name}`);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    console.log('Call ended');
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = () => {
    setShowFileUpload(!showFileUpload);
    console.log('File upload clicked');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket) {
      socket.emit('typing', { room: project.id, isTyping: true });
    }
  };

  const handleStopTyping = () => {
    if (socket) {
      socket.emit('typing', { room: project.id, isTyping: false });
    }
  };

  // Engineer invitation handlers
  const handleToggleEngineerSelection = (engineer) => {
    setSelectedEngineers(prev => 
      prev.some(e => e.id === engineer.id)
        ? prev.filter(e => e.id !== engineer.id)
        : [...prev, engineer]
    );
  };

  const handleSendInvitations = () => {
    if (selectedEngineers.length === 0) return;

    // Send invitation message to chat
    const invitationMessage = {
      id: Date.now(),
      text: `Invited ${selectedEngineers.map(e => e.name).join(', ')} to the project chat${inviteMessage ? ': ' + inviteMessage : ''}`,
      sender: 'System',
      timestamp: new Date(),
      isOwn: false,
      type: 'invitation'
    };

    setMessages(prev => [...prev, invitationMessage]);

    // Add engineers to participants
    setChatParticipants(prev => {
      const newParticipants = selectedEngineers.filter(engineer => 
        !prev.some(p => p.id === engineer.id)
      );
      return [...prev, ...newParticipants];
    });

    // Emit invitation to server
    if (socket) {
      socket.emit('invite-engineers', {
        room: `project-${project.id}`,
        engineers: selectedEngineers,
        message: inviteMessage,
        project: project
      });
    }

    // Reset form
    setSelectedEngineers([]);
    setInviteMessage('');
    setShowInviteEngineers(false);
  };

  const handleRemoveParticipant = (participantId) => {
    setChatParticipants(prev => prev.filter(p => p.id !== participantId));
    
    // Send removal message
    const removalMessage = {
      id: Date.now(),
      text: `Removed ${chatParticipants.find(p => p.id === participantId)?.name} from the project chat`,
      sender: 'System',
      timestamp: new Date(),
      isOwn: false,
      type: 'removal'
    };
    
    setMessages(prev => [...prev, removalMessage]);
  };

  const getSenderInitials = (sender) => {
    return sender ? sender.charAt(0).toUpperCase() : 'U';
  };

  const getSenderColor = (sender) => {
    const colors = {
      'SA': 'bg-blue-500',
      'MN': 'bg-green-500',
      'AH': 'bg-purple-500',
      'MA': 'bg-orange-500',
      'Current User': 'bg-indigo-500'
    };
    return colors[sender] || 'bg-gray-500';
  };

  // WhatsApp-style utility functions
  const ensureTimestamp = (dateOrTimestamp) => {
    if (dateOrTimestamp instanceof Date) {
      return dateOrTimestamp.getTime();
    }
    if (typeof dateOrTimestamp === 'number') {
      return dateOrTimestamp;
    }
    // If it's a string, try to parse it
    const parsed = new Date(dateOrTimestamp);
    return isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckIcon className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return (
          <div className="flex">
            <CheckIcon className="w-3 h-3 text-gray-400" />
            <CheckIcon className="w-3 h-3 text-gray-400 -ml-1" />
          </div>
        );
      case 'read':
        return (
          <div className="flex">
            <CheckIcon className="w-3 h-3 text-blue-500" />
            <CheckIcon className="w-3 h-3 text-blue-500 -ml-1" />
          </div>
        );
      default:
        return null;
    }
  };

  const formatTime = (dateOrTimestamp) => {
    const timestamp = ensureTimestamp(dateOrTimestamp);
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      // Return current time as fallback for invalid dates
      return new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateOrTimestamp) => {
    const timestamp = ensureTimestamp(dateOrTimestamp);
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Today'; // Default to today for invalid dates
    }
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const getAttachmentIcon = (type) => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="w-4 h-4" />;
      case 'video':
        return <VideoIcon className="w-4 h-4" />;
      case 'audio':
        return <SpeakerWaveIcon className="w-4 h-4" />;
      case 'file':
        return <DocumentIcon className="w-4 h-4" />;
      case 'link':
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <PaperClipIcon className="w-4 h-4" />;
    }
  };

  // Get chat title based on chat type
  const getChatTitle = () => {
    switch (chatType) {
      case 'project':
        return 'Project Chat';
      case 'task':
        return 'Task Chat';
      case 'child-task':
        return 'Child Task Chat';
      default:
        return 'Project Chat';
    }
  };

  if (!isOpen || !project) return null;

  return (
    <>
      <style jsx>{`
        .chat-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .chat-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer - Responsive Width with Expand */}
      <div className={`absolute right-0 top-0 h-full bg-white shadow-2xl transform transition-all duration-300 ease-in-out flex flex-col ${
        isExpanded 
          ? 'w-full max-w-4xl sm:w-[800px]' 
          : 'w-full max-w-sm sm:w-96'
      }`}>
        {/* Enhanced Header - Responsive */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
          {/* Main Header Row */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-white drop-shadow-sm truncate">{project.name}</h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white/90 font-medium">
                    {getChatTitle()} {isExpanded && <span className="text-white/70">(Expanded)</span>}
                  </p>
                  {project.referenceNumber && (
                    <>
                      <span className="text-white/60">•</span>
                      <p className="text-sm text-white/80 font-medium bg-white/20 px-2 py-1 rounded-full">
                        {project.referenceNumber}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Expand/Collapse Button */}
            <button
              onClick={handleToggleExpand}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 flex-shrink-0"
              title={isExpanded ? "Collapse Chat" : "Expand Chat"}
            >
              {isExpanded ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9V4.5M15 9H19.5M15 9L20.5 3.5M9 15V19.5M9 15H4.5M9 15L3.5 20.5M15 15V19.5M15 15H19.5M15 15L20.5 20.5" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 flex-shrink-0 ml-2"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* WhatsApp-style Action Buttons Row */}
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg"
                title="Search Messages"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
              </button>
              
              {/* Starred Messages Button */}
              <button
                onClick={() => setShowStarred(!showStarred)}
                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg"
                title="Starred Messages"
              >
                <StarIcon className="w-4 h-4" />
              </button>
              
              {/* Attachments Button */}
              <button
                onClick={() => setShowAttachments(!showAttachments)}
                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg"
                title="Attachments"
              >
                <PaperClipIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Voice Call Button */}
              <button
                onClick={() => handleStartCall('voice')}
                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg"
                title="Voice Call"
              >
                <PhoneIcon className="w-4 h-4" />
              </button>
              
              {/* Video Call Button */}
              <button
                onClick={() => handleStartCall('video')}
                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg"
                title="Video Call"
              >
                <VideoCameraIcon className="w-4 h-4" />
              </button>
              
              {/* Options Button */}
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg"
                title="Options"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-6 py-3 bg-gray-100 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-500"
              />
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                  setFilteredMessages(messages);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            {project.referenceNumber && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Ref:</span>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                  {project.referenceNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Participants Section */}
        <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Participants ({chatParticipants.length})</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {chatParticipants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-blue-200 shadow-sm"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  participant.status === 'online' ? 'bg-green-500' :
                  participant.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}>
                  {participant.avatar}
                </div>
                <span className="text-sm text-gray-700">{participant.name}</span>
                <button
                  onClick={() => handleRemoveParticipant(participant.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove from chat"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Messages - Proper Scrolling */}
        <div 
          className={`chat-scroll flex-1 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50 via-blue-50/30 to-white relative ${
            isExpanded ? 'p-6 sm:p-8' : 'p-4 sm:p-6'
          }`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9',
            overflowY: 'scroll'
          }}
          onScroll={handleScroll}
        >
          {/* Unread Messages Indicator */}
          {unreadCount > 0 && (
            <div className="sticky top-0 z-20 bg-indigo-100 border border-indigo-200 rounded-lg p-3 mb-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-indigo-700">
                    {unreadCount} new message{unreadCount > 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={handleScrollToBottom}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
                >
                  Go to latest
                </button>
              </div>
            </div>
          )}
          
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600 font-medium text-lg">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Start the conversation! 💬</p>
            </div>
          ) : (
            Object.entries(groupMessagesByDate(showStarred ? messages.filter(m => m.starredBy && m.starredBy.length > 0) : (searchQuery ? filteredMessages : messages))).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                    {date}
                  </div>
                </div>
                
                {/* Messages for this date */}
                {dateMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} group mb-2`}
                    onContextMenu={(e) => handleMessageRightClick(e, message)}
                    onDoubleClick={() => handleMessageDoubleClick(message)}
                  >
                    <div className={`flex gap-3 ${isExpanded ? 'max-w-2xl' : 'max-w-xs'} ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* WhatsApp-style Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${getSenderColor(message.senderId)}`}>
                        {getSenderInitials(message.senderId)}
                      </div>
                      
                      {/* WhatsApp-style Message Bubble */}
                      <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'}`}>
                        {/* Reply Context */}
                        {message.replyTo && (
                          <div className="mb-2 p-2 bg-gray-100 rounded-lg border-l-4 border-indigo-500 max-w-xs">
                            <p className="text-xs text-gray-500 font-medium">Replying to {message.replyTo.senderId}</p>
                            <p className="text-sm text-gray-700 truncate">{message.replyTo.text}</p>
                          </div>
                        )}
                        
                        <div className={`px-4 py-2 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md max-w-xs ${
                          message.isOwn 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white rounded-br-md' 
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                        }`}>
                          <p className="text-sm leading-relaxed break-words">{message.text}</p>
                        </div>
                        
                        {/* Message Footer with Status */}
                        <div className={`flex items-center gap-1 mt-1 ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.createdAt)}
                          </span>
                          {message.isOwn && (
                            <div className="flex items-center">
                              {getMessageStatusIcon(message.status)}
                            </div>
                          )}
                          {message.starredBy && message.starredBy.length > 0 && (
                            <StarIcon className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
          
          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              onClick={handleScrollToBottom}
              className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 hover:scale-105 z-10 border border-indigo-500 animate-bounce"
              title="Scroll to bottom"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
          
          {/* Scroll Indicator */}
          <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full shadow-sm">
            {messages.length} messages
          </div>
          
          {/* Project Reference Badge */}
          {project.referenceNumber && (
            <div className="absolute top-2 left-2 text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full shadow-sm font-medium">
              {project.referenceNumber}
            </div>
          )}
        </div>

        {/* Reply Context */}
        {replyToMessage && (
          <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">
                  {getSenderInitials(replyToMessage.senderId)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Replying to {replyToMessage.senderId}</p>
                  <p className="text-sm text-gray-700 truncate max-w-xs">{replyToMessage.text}</p>
                </div>
              </div>
              <button
                onClick={() => setReplyToMessage(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Input - Responsive */}
        <div className={`flex-shrink-0 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50 ${
          isExpanded ? 'p-6 sm:p-8' : 'p-4 sm:p-6'
        }`}>
          <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
            {/* File Upload Button */}
            <button
              type="button"
              onClick={handleFileUpload}
              className="p-2 sm:p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-105"
              title="Attach File"
            >
              <PaperClipIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 sm:p-3 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200 hover:scale-105"
              title="Add Emoji"
            >
              <FaceSmileIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Voice Message Button */}
            <button
              type="button"
              className="p-2 sm:p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-105"
              title="Voice Message"
            >
              <MicrophoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleTyping}
                onBlur={handleStopTyping}
                placeholder="Type a message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
                disabled={!isConnected}
              />
            </div>

            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-1 sm:gap-2"
            >
              <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>

          {/* Emoji Picker - Responsive */}
          {showEmojiPicker && (
            <div className="mt-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 shadow-lg">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 sm:gap-2">
                {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏'].map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="p-2 text-lg hover:bg-gray-100 rounded-lg transition-colors hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Options - Responsive */}
          {showFileUpload && (
            <div className="mt-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  <CameraIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Photo</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                  <PaperClipIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Document</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                  <VideoCameraIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Video</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Engineer Invitation Modal */}
        {showInviteEngineers && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Invite Engineers</h3>
                <button
                  onClick={() => setShowInviteEngineers(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Engineers
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                  {availableEngineers
                    .filter(engineer => !chatParticipants.some(p => p.id === engineer.id))
                    .map((engineer) => (
                    <div
                      key={engineer.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedEngineers.some(e => e.id === engineer.id)
                          ? 'bg-blue-100 border border-blue-300'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleToggleEngineerSelection(engineer)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        engineer.status === 'online' ? 'bg-green-500' :
                        engineer.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}>
                        {engineer.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{engineer.name}</div>
                        <div className="text-sm text-gray-500">{engineer.role}</div>
                      </div>
                      {selectedEngineers.some(e => e.id === engineer.id) && (
                        <CheckIcon className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows="3"
                />
              </div>
              image.png
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowInviteEngineers(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvitations}
                  disabled={selectedEngineers.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Send Invitations ({selectedEngineers.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Call Modal */}
        {showCallModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  {callType === 'voice' ? (
                    <PhoneIcon className="w-10 h-10 text-white" />
                  ) : (
                    <VideoCameraIcon className="w-10 h-10 text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {callType === 'voice' ? 'Voice Call' : 'Video Call'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Starting {callType} call with <span className="font-semibold text-indigo-600">{project.name}</span> team...
                </p>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowCallModal(false)}
                    className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 hover:scale-105 shadow-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinCall}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 shadow-lg font-medium"
                  >
                    Join Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Call Overlay */}
        {isCallActive && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                  {callType === 'voice' ? (
                    <PhoneIcon className="w-12 h-12 text-white" />
                  ) : (
                    <VideoCameraIcon className="w-12 h-12 text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {callType === 'voice' ? 'Voice Call Active' : 'Video Call Active'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Connected to <span className="font-semibold text-indigo-600">{project.name}</span> team
                </p>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleEndCall}
                    className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 hover:scale-105 shadow-lg font-medium"
                  >
                    End Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message Context Menu */}
        {showMessageMenu && selectedMessage && (
          <div 
            className="message-context-menu fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48"
            style={{ 
              left: messageMenuPosition.x, 
              top: messageMenuPosition.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <button
              onClick={() => handleMessageAction('reply', selectedMessage)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
              Reply
            </button>
            <button
              onClick={() => handleMessageAction('forward', selectedMessage)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <ForwardIcon className="w-4 h-4" />
              Forward
            </button>
            <button
              onClick={() => handleMessageAction('copy', selectedMessage)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              Copy
            </button>
            <button
              onClick={() => handleMessageAction('star', selectedMessage)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <StarIcon className="w-4 h-4" />
              {selectedMessage.starredBy && selectedMessage.starredBy.length > 0 ? 'Unstar' : 'Star'}
            </button>
            <button
              onClick={() => handleMessageAction('delete', selectedMessage)}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}

        {/* Options Modal */}
        {showOptions && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Chat Options</h3>
                <button
                  onClick={() => setShowOptions(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleThemeToggle}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium">Dark Theme</span>
                  <div className={`w-10 h-6 rounded-full transition-colors ${isDarkTheme ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${isDarkTheme ? 'translate-x-4' : 'translate-x-0.5'} mt-0.5`} />
                  </div>
                </button>
                
                <button
                  onClick={handlePinChat}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <BookmarkIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">
                    {pinnedChats.includes(project.id) ? 'Unpin Chat' : 'Pin Chat'}
                  </span>
                </button>
                
                <button
                  onClick={() => setShowInviteEngineers(true)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <UserPlusIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium">Add Participants</span>
                </button>
                
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {notificationsEnabled ? <BellSlashIcon className="w-5 h-5 text-gray-600" /> : <BellIcon className="w-5 h-5 text-gray-600" />}
                  <span className="text-sm font-medium">
                    {notificationsEnabled ? 'Mute Notifications' : 'Enable Notifications'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attachments View */}
        {showAttachments && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Attachments</h3>
                <button
                  onClick={() => setShowAttachments(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setAttachmentFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    attachmentFilter === 'all' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setAttachmentFilter('media')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    attachmentFilter === 'media' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Media
                </button>
                <button
                  onClick={() => setAttachmentFilter('docs')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    attachmentFilter === 'docs' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Documents
                </button>
                <button
                  onClick={() => setAttachmentFilter('links')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    attachmentFilter === 'links' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Links
                </button>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <PaperClipIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No attachments found</p>
                <p className="text-sm">Files and media shared in this chat will appear here</p>
              </div>
            </div>
          </div>
        )}

        {/* Message Details Modal */}
        {showMessageDetails && selectedMessage && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold text-gray-900">{getChatTitle()} - Message Details</h3>
                <button
                  onClick={() => setShowMessageDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              {/* Message Content */}
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getSenderColor(selectedMessage.senderId)}`}>
                      {getSenderInitials(selectedMessage.senderId)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedMessage.senderId}</p>
                      <p className="text-sm text-gray-500">{formatTime(selectedMessage.createdAt)} • {formatDate(selectedMessage.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{selectedMessage.text}</p>
                </div>
              </div>

              {/* Message Information */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Message Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-mono text-xs">{selectedMessage.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">{selectedMessage.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="capitalize text-green-600">{selectedMessage.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Own Message:</span>
                      <span>{selectedMessage.isOwn ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Engagement</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Starred by:</span>
                      <span>{selectedMessage.starredBy?.length || 0} users</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Replied to:</span>
                      <span>{selectedMessage.replyTo ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Forwarded:</span>
                      <span>{selectedMessage.forwarded ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chat ID:</span>
                      <span className="font-mono text-xs">{selectedMessage.chatId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedMessage.text);
                    alert('Message copied to clipboard!');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  Copy Text
                </button>

                <button
                  onClick={() => {
                    const isStarred = selectedMessage.starredBy && selectedMessage.starredBy.includes('currentUser');
                    const updatedMessages = messages.map(msg => {
                      if (msg.id === selectedMessage.id) {
                        return {
                          ...msg,
                          starredBy: isStarred 
                            ? msg.starredBy.filter(id => id !== 'currentUser')
                            : [...(msg.starredBy || []), 'currentUser']
                        };
                      }
                      return msg;
                    });
                    setMessages(updatedMessages);
                    alert(isStarred ? 'Message unstarred!' : 'Message starred!');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <StarIcon className="w-4 h-4" />
                  {selectedMessage.starredBy?.includes('currentUser') ? 'Unstar' : 'Star'}
                </button>

                <button
                  onClick={() => {
                    setReplyToMessage(selectedMessage);
                    setShowMessageDetails(false);
                    const inputElement = document.querySelector('input[placeholder="Type a message..."]');
                    if (inputElement) {
                      inputElement.focus();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <ArrowUturnLeftIcon className="w-4 h-4" />
                  Reply
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Forwarded: ${selectedMessage.text}`);
                    alert('Message copied for forwarding!');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <ForwardIcon className="w-4 h-4" />
                  Forward
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this message?')) {
                      const updatedMessages = messages.filter(msg => msg.id !== selectedMessage.id);
                      setMessages(updatedMessages);
                      setShowMessageDetails(false);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>

                <button
                  onClick={() => {
                    // Pin message functionality
                    alert('Message pinned! (Feature coming soon)');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  <BookmarkIcon className="w-4 h-4" />
                  Pin
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
    </>
  );
};

export default ChatDrawer;
