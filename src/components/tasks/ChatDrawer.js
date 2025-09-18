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
  XMarkIcon as CloseIcon
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

  // Sample messages for demonstration
  const sampleMessages = [
    {
      id: 1,
      text: "Project kickoff meeting scheduled for tomorrow at 10 AM",
      sender: "SA",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isOwn: false
    },
    {
      id: 2,
      text: "Great! I'll prepare the requirements document",
      sender: "MN",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      isOwn: true
    },
    {
      id: 3,
      text: "The design mockups are ready for review",
      sender: "AH",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isOwn: false
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{project.name}</h2>
              <p className="text-sm text-white/80">Project Chat</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Invite Engineers Button */}
            <button
              onClick={() => setShowInviteEngineers(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
              title="Invite Engineers"
            >
              <UserPlusIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Invite</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-xs ${message.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getSenderColor(message.sender)}`}>
                    {getSenderInitials(message.sender)}
                  </div>
                  
                  {/* Message */}
                  <div className={`flex flex-col ${message.isOwn ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl ${
                      message.isOwn 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-white border border-gray-200 text-gray-900'
                    } shadow-sm`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <ClockIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
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
      </div>
    </div>
  );
};

export default ChatDrawer;
