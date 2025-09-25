import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  SparklesIcon,
  UserIcon,
  CpuChipIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const AIChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: "Hello! I'm your AI assistant for task management. I can help you with project insights, task analysis, productivity tips, and answer questions about your workflow. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Task management responses
    if (input.includes('task') || input.includes('project')) {
      return "I can help you with task management! Here are some insights:\n\n📊 **Current Stats:**\n• Total Tasks: 156\n• Completed: 89 (57%)\n• In Progress: 42 (27%)\n• Pending: 25 (16%)\n\n💡 **Recommendations:**\n• Focus on completing pending tasks first\n• Consider breaking down large tasks into smaller subtasks\n• Set realistic deadlines for better productivity";
    }
    
    if (input.includes('productivity') || input.includes('efficient')) {
      return "Here are some productivity tips for your task management:\n\n🚀 **Quick Wins:**\n• Use the 2-minute rule: if it takes less than 2 minutes, do it now\n• Batch similar tasks together\n• Set specific time blocks for focused work\n\n📈 **Analytics:**\n• Your completion rate is 57% - great progress!\n• Consider using time tracking for better insights\n• Review your workflow weekly for improvements";
    }
    
    if (input.includes('help') || input.includes('assist')) {
      return "I'm here to help with your task management! I can assist with:\n\n🤖 **What I can do:**\n• Analyze your task data and provide insights\n• Suggest productivity improvements\n• Help with project planning and organization\n• Answer questions about your workflow\n• Provide tips for better task management\n\nJust ask me anything about your projects, tasks, or productivity!";
    }
    
    if (input.includes('report') || input.includes('analytics')) {
      return "Here's your task analytics report:\n\n📊 **Performance Metrics:**\n• Task Completion Rate: 57%\n• Average Task Duration: 3.2 days\n• Most Productive Day: Tuesday\n• Peak Activity: 10 AM - 2 PM\n\n📈 **Trends:**\n• 15% increase in completed tasks this week\n• 8% decrease in pending tasks\n• 23% improvement in on-time delivery\n\n🎯 **Recommendations:**\n• Schedule complex tasks during peak hours\n• Use the morning for high-priority items\n• Consider task dependencies for better planning";
    }
    
    if (input.includes('schedule') || input.includes('time')) {
      return "Here are some scheduling insights:\n\n⏰ **Time Management Tips:**\n• Block 2-3 hours for deep work sessions\n• Use the Pomodoro Technique (25 min work, 5 min break)\n• Schedule buffer time between meetings\n• Plan your day the night before\n\n📅 **Optimal Scheduling:**\n• Morning (9-11 AM): High-priority, complex tasks\n• Afternoon (2-4 PM): Meetings and collaboration\n• Late afternoon (4-5 PM): Administrative tasks\n• End of day: Plan tomorrow's priorities";
    }
    
    // Default response
    return "I understand you're asking about: \"" + userInput + "\"\n\nI'm your AI assistant for task management. I can help you with:\n\n• Task analysis and insights\n• Productivity recommendations\n• Project planning assistance\n• Workflow optimization\n• Performance analytics\n\nCould you be more specific about what you'd like help with?";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: ChartBarIcon, text: "Show task analytics", action: () => setInputMessage("Show me task analytics and insights") },
    { icon: LightBulbIcon, text: "Productivity tips", action: () => setInputMessage("Give me productivity tips") },
    { icon: DocumentTextIcon, text: "Project insights", action: () => setInputMessage("Analyze my project performance") },
    { icon: ClockIcon, text: "Time management", action: () => setInputMessage("Help me with time management") }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Task Assistant</h3>
              <p className="text-sm text-blue-100">Your intelligent task management companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CpuChipIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <CpuChipIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-sm"
              >
                <action.icon className="w-4 h-4 text-blue-600" />
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your tasks..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;



