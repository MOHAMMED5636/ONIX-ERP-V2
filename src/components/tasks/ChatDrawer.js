import React, { useState, useEffect, useRef } from 'react';
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
  BellSlashIcon
} from '@heroicons/react/24/outline';

const ChatDrawer = ({ isOpen, onClose, project, socket }) => {
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

  // Enhanced sample messages with more attractive content
  const sampleMessages = [
    {
      id: 1,
      text: "🚀 Project kickoff meeting scheduled for tomorrow at 10 AM. Looking forward to working with everyone!",
      sender: "SA",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isOwn: false,
      type: 'text'
    },
    {
      id: 2,
      text: "Great! I'll prepare the requirements document and share it with the team 📋",
      sender: "MN",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isOwn: true,
      type: 'text'
    },
    {
      id: 3,
      text: "The design mockups are ready for review! 🎨 Check the shared folder for the latest versions.",
      sender: "AH",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isOwn: false,
      type: 'text'
    },
    {
      id: 4,
      text: "Thanks for the update! The designs look amazing ✨",
      sender: "FK",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isOwn: true,
      type: 'text'
    },
    {
      id: 5,
      text: "I've completed the user authentication module. Ready for testing! 🔐",
      sender: "SA",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      isOwn: false,
      type: 'text'
    },
    {
      id: 6,
      text: "Excellent work! Let's schedule a code review session for tomorrow.",
      sender: "MN",
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      isOwn: true,
      type: 'text'
    },
    {
      id: 7,
      text: "The database schema has been updated. Please check the migration files.",
      sender: "AH",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isOwn: false,
      type: 'text'
    },
    {
      id: 8,
      text: "I'll review the changes and provide feedback by end of day.",
      sender: "FK",
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      isOwn: true,
      type: 'text'
    },
    {
      id: 9,
      text: "Meeting notes from today's standup have been shared in the project folder.",
      sender: "SA",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      isOwn: false,
      type: 'text'
    },
    {
      id: 10,
      text: "Thanks for the update! Looking forward to the next sprint planning session.",
      sender: "MN",
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      isOwn: true,
      type: 'text'
    }
  ];

  // Initialize messages with sample data
  useEffect(() => {
    if (isOpen && project) {
      setMessages(sampleMessages);
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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
      
      {/* Drawer - Responsive Width */}
      <div className="absolute right-0 top-0 h-full w-full max-w-sm sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col">
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
                <p className="text-sm text-white/90 font-medium">Project Chat</p>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 flex-shrink-0 ml-2"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Action Buttons Row */}
          <div className="flex items-center justify-center gap-2 px-4 pb-4">
            {/* Voice Call Button */}
            <button
              onClick={() => handleStartCall('voice')}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg text-sm"
              title="Voice Call"
            >
              <PhoneIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Voice</span>
            </button>
            
            {/* Video Call Button */}
            <button
              onClick={() => handleStartCall('video')}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg text-sm"
              title="Video Call"
            >
              <VideoCameraIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Video</span>
            </button>
            
            {/* Notifications Toggle */}
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg"
              title={notificationsEnabled ? "Disable Notifications" : "Enable Notifications"}
            >
              {notificationsEnabled ? <BellIcon className="w-4 h-4" /> : <BellSlashIcon className="w-4 h-4" />}
            </button>
            
            {/* Invite Engineers Button */}
            <button
              onClick={() => setShowInviteEngineers(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 shadow-lg text-sm"
              title="Invite Engineers"
            >
              <UserPlusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Invite</span>
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
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
          className="chat-scroll flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-gray-50 via-blue-50/30 to-white relative"
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
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} group`}
              >
                <div className={`flex gap-3 max-w-xs ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Enhanced Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${getSenderColor(message.sender)}`}>
                    {getSenderInitials(message.sender)}
                  </div>
                  
                  {/* Enhanced Message */}
                  <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                      message.isOwn 
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-900 hover:border-gray-300'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <ClockIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 font-medium">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
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
        </div>

        {/* Enhanced Input - Responsive */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50">
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

      </div>
    </div>
    </>
  );
};

export default ChatDrawer;
