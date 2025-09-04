import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  MagnifyingGlassIcon,
  LightBulbIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const AIAssistant = ({ currentPage = 'dashboard' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [isButtonDragging, setIsButtonDragging] = useState(false);
  const [buttonDragOffset, setButtonDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dragRef = useRef(null);
  const buttonDragRef = useRef(null);

  // Initialize positions
  useEffect(() => {
    // Set initial button position (dashboard area)
    setButtonPosition({ x: window.innerWidth - 320, y: 500 });
    // Set initial chat panel position
    setPosition({ x: window.innerWidth - 340, y: 100 });
  }, []);

  // Context-aware suggestions based on current page
  const getContextualSuggestions = (page) => {
    const suggestionsMap = {
      dashboard: [
        { icon: UserGroupIcon, text: "Add New Employee", action: "add_employee", color: "bg-blue-500" },
        { icon: DocumentTextIcon, text: "Generate Invoice", action: "generate_invoice", color: "bg-green-500" },
        { icon: CalendarIcon, text: "View Calendar", action: "view_calendar", color: "bg-purple-500" }
      ],
      tasks: [
        { icon: DocumentTextIcon, text: "Create Subtask", action: "create_subtask", color: "bg-blue-500" },
        { icon: CogIcon, text: "Bulk Edit Tasks", action: "bulk_edit", color: "bg-green-500" },
        { icon: CalendarIcon, text: "Check Deadlines", action: "check_deadlines", color: "bg-red-500" }
      ],
      attendance: [
        { icon: UserGroupIcon, text: "View Late Employees", action: "view_late_employees", color: "bg-red-500" },
        { icon: DocumentTextIcon, text: "Export Report", action: "export_report", color: "bg-blue-500" },
        { icon: ChartBarIcon, text: "Attendance Stats", action: "attendance_stats", color: "bg-green-500" }
      ],
      payroll: [
        { icon: DocumentTextIcon, text: "Process Payroll", action: "process_payroll", color: "bg-green-500" },
        { icon: ChartBarIcon, text: "View Reports", action: "view_reports", color: "bg-blue-500" },
        { icon: CogIcon, text: "Tax Calculations", action: "tax_calculations", color: "bg-purple-500" }
      ]
    };
    
    return suggestionsMap[page] || suggestionsMap.dashboard;
  };

  // Initialize with welcome message and suggestions
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: 1,
        type: 'ai',
        content: `Hello! I'm your AI Assistant for Onix Engineering Consultancy. I can help you with tasks, explain features, and guide you through the ERP system. What would you like to do today?`,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
      setSuggestions(getContextualSuggestions(currentPage));
    }
  }, [isOpen, currentPage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: suggestion.text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(suggestion.action);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  // Generate AI responses based on actions
  const generateAIResponse = (action) => {
    const responses = {
      add_employee: {
        content: "Great choice! To add a new employee, go to the Employees section and click 'Add Employee'. You'll need their basic information, position, and start date. Would you like me to guide you through the process?",
        suggestions: ["Show me the form", "What documents do I need?", "Set up employee account"]
      },
      generate_invoice: {
        content: "I can help you generate an invoice! Navigate to the Invoices section and select 'Create New Invoice'. You'll need to select the client, add line items, and set payment terms. Need help with any specific part?",
        suggestions: ["Show invoice form", "How to add line items?", "Set payment terms"]
      },
      create_subtask: {
        content: "Creating subtasks is easy! In the task view, click on any task and use the 'Add Subtask' button. You can set deadlines, assign team members, and track progress separately. Want me to show you how?",
        suggestions: ["Show subtask form", "How to assign subtasks?", "Track subtask progress"]
      },
      bulk_edit: {
        content: "Bulk editing saves time! Select multiple tasks using checkboxes, then click 'Bulk Edit' in the toolbar. You can update status, priority, or assignee for all selected tasks at once. Ready to try it?",
        suggestions: ["Show bulk edit form", "Select multiple tasks", "Update task status"]
      }
    };
    
    const response = responses[action] || {
      content: "I understand you want to work with that feature. Let me guide you through it step by step. What specific aspect would you like help with?",
      suggestions: ["Show me how", "Explain the process", "Common issues"]
    };
    
    return {
      id: Date.now(),
      type: 'ai',
      content: response.content,
      timestamp: new Date(),
      suggestions: response.suggestions
    };
  };

  // Handle user input submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = {
        id: Date.now(),
        type: 'ai',
        content: `I understand you're asking about "${inputValue}". Let me help you with that. You can search for specific features, ask for explanations, or request step-by-step guidance. What would you like me to focus on?`,
        timestamp: new Date(),
        suggestions: ["Search for features", "Get explanation", "Step-by-step guide"]
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Handle quick actions
  const handleQuickAction = (action) => {
    const actions = {
      search: () => inputRef.current?.focus(),
      help: () => setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        content: "I'm here to help! I can explain features, guide you through processes, and suggest next steps. Just ask me anything about the ERP system!",
        timestamp: new Date()
      }]),
      tips: () => setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        content: "💡 Pro Tips: Use keyboard shortcuts (Ctrl+N for new items), enable notifications for deadlines, and use the bulk actions to save time!",
        timestamp: new Date()
      }])
    };
    
    actions[action]?.();
  };

  // Chat panel drag functionality
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    
    setIsDragging(true);
    const rect = dragRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Button drag functionality
  const handleButtonMouseDown = (e) => {
    if (e.target.closest('button')) return;
    
    setIsButtonDragging(true);
    const rect = buttonDragRef.current.getBoundingClientRect();
    setButtonDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleButtonMouseMove = (e) => {
    if (!isButtonDragging) return;
    
    setButtonPosition({
      x: e.clientX - buttonDragOffset.x,
      y: e.clientY - buttonDragOffset.y
    });
  };

  const handleButtonMouseUp = () => {
    setIsButtonDragging(false);
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  useEffect(() => {
    if (isButtonDragging) {
      document.addEventListener('mousemove', handleButtonMouseMove);
      document.addEventListener('mouseup', handleButtonMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleButtonMouseMove);
        document.removeEventListener('mouseup', handleButtonMouseUp);
      };
    }
  }, [isButtonDragging, buttonDragOffset]);

  return (
    <>
      {/* Desktop AI Assistant Button - Fully Draggable */}
      <div 
        ref={buttonDragRef}
        className="fixed z-50 cursor-move"
        style={{
          left: buttonPosition.x,
          top: buttonPosition.y,
          zIndex: 1000
        }}
        onMouseDown={handleButtonMouseDown}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative w-full flex justify-center transition-all duration-300 transform hover:animate-bounce ${
            isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-110'
          }`}
        >
          {/* Drag indicator */}
          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          
          {/* AI Robot Avatar */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full shadow-2xl flex items-center justify-center border-4 border-white">
              <div className="relative">
                {/* Robot Head */}
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  {/* Eyes */}
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                {/* Antenna */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-3 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
            
            {/* Pulse Ring */}
            <div className="absolute inset-0 w-16 h-16 bg-blue-400 rounded-full animate-ping opacity-20 group-hover:animate-pulse"></div>
            
            {/* Onix Branding */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
              AI
            </div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            AI Assistant (Drag to move)
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>

      {/* Desktop AI Assistant Chat Panel - Also Draggable */}
      {isOpen && (
        <div 
          ref={dragRef}
          className="fixed w-[320px] h-[500px] bg-white rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden cursor-move"
          style={{
            left: position.x,
            top: position.y,
            zIndex: 1000
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Assistant</h3>
                  <p className="text-blue-100 text-sm">Onix Engineering ERP</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <div className="w-4 h-4 border-2 border-white rounded"></div>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Actions Bar */}
              <div className="bg-gray-50 p-3 border-b">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickAction('search')}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    Search
                  </button>
                  <button
                    onClick={() => handleQuickAction('help')}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border"
                  >
                    <LightBulbIcon className="w-4 h-4" />
                    Help
                  </button>
                  <button
                    onClick={() => handleQuickAction('tips')}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    Tips
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ height: '280px' }}>
                {messages.map((message) => (
                  <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.type === 'ai' && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                            <div className="flex gap-0.5">
                              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                        <div className="max-w-xs">
                          <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border">
                            <p className="text-gray-800 text-sm">{message.content}</p>
                          </div>
                          {message.suggestions && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestionClick({ text: suggestion, action: 'custom' })}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {message.type === 'user' && (
                      <div className="inline-block bg-blue-500 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Contextual Suggestions */}
              <div className="p-4 bg-white border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <LightBulbIcon className="w-4 h-4 text-blue-500" />
                  Suggested Actions
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 ${
                        suggestion.color
                      } text-white shadow-md hover:shadow-lg`}
                    >
                      <suggestion.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 bg-gray-50 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything about the ERP system..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mobile AI Assistant Button - Fallback for small screens */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative transition-all duration-300 transform hover:animate-bounce ${
            isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-110'
          }`}
        >
          {/* AI Robot Avatar */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full shadow-2xl flex items-center justify-center border-4 border-white">
              <div className="relative">
                {/* Robot Head */}
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  {/* Eyes */}
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
                {/* Antenna */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-3 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
            
            {/* Pulse Ring */}
            <div className="absolute inset-0 w-16 h-16 bg-blue-400 rounded-full animate-ping opacity-20 group-hover:animate-pulse"></div>
            
            {/* Onix Branding */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
              AI
            </div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            AI Assistant
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>

      {/* Mobile AI Assistant Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden lg:hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white p-4 cursor-move" onMouseDown={handleMouseDown}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Assistant</h3>
                  <p className="text-blue-100 text-sm">Onix Engineering ERP</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                  title="Minimize"
                >
                  <div className="w-4 h-4 border-2 border-white rounded"></div>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded transition-colors bg-red-500/20 hover:bg-red-500/40"
                  title="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Drag indicator */}
            <div className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Actions Bar */}
              <div className="bg-gray-50 p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium">💡 Drag the header to move this window</span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickAction('search')}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    Search
                  </button>
                  <button
                    onClick={() => handleQuickAction('help')}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border"
                  >
                    <LightBulbIcon className="w-4 h-4" />
                    Help
                  </button>
                  <button
                    onClick={() => handleQuickAction('tips')}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    Tips
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ height: '280px' }}>
                {messages.map((message) => (
                  <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.type === 'ai' && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                            <div className="flex gap-0.5">
                              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                        <div className="max-w-xs">
                          <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border">
                            <p className="text-gray-800 text-sm">{message.content}</p>
                          </div>
                          {message.suggestions && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestionClick({ text: suggestion, action: 'custom' })}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {message.type === 'user' && (
                      <div className="inline-block bg-blue-500 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Contextual Suggestions */}
              <div className="p-4 bg-white border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <LightBulbIcon className="w-4 h-4 text-blue-500" />
                  Suggested Actions
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 ${
                        suggestion.color
                      } text-white shadow-md hover:shadow-lg`}
                    >
                      <suggestion.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 bg-gray-50 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything about the ERP system..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIAssistant;
