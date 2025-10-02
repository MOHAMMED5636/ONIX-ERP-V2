import React, { useState, useRef, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  UserGroupIcon,
  ChartBarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const AIEmployeeEvaluationsChatbot = ({ employees = [], kpiWeights = {}, isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "👋 Hi there! I'm Sarah, your AI HR Assistant. I specialize in employee performance analysis and can help you with insights, recommendations, and evaluations. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState('happy'); // happy, professional, friendly, excited
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Different avatar styles
  const renderAvatar = (size = 'w-8 h-8') => {
    const baseClasses = `${size} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-md`;
    
    switch (avatarStyle) {
      case 'professional':
        return (
          <div className={baseClasses}>
            <div className="w-5 h-5 relative">
              {/* Professional eyes - smaller, focused */}
              <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
              {/* Professional mouth - straight line */}
              <div className="absolute bottom-0.5 left-0.5 right-0.5 h-0.5 bg-white rounded-full"></div>
            </div>
          </div>
        );
      
      case 'friendly':
        return (
          <div className={baseClasses}>
            <div className="w-5 h-5 relative">
              {/* Friendly eyes - slightly larger */}
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white rounded-full"></div>
              {/* Friendly smile */}
              <div className="absolute bottom-0 left-0.5 right-0.5 h-0.5 border-b-2 border-white rounded-full"></div>
            </div>
          </div>
        );
      
      case 'excited':
        return (
          <div className={baseClasses}>
            <div className="w-5 h-5 relative">
              {/* Excited eyes - wide open */}
              <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-white rounded-full"></div>
              {/* Big excited smile */}
              <div className="absolute bottom-0 left-0 right-0 h-1 border-b-2 border-white rounded-full"></div>
            </div>
          </div>
        );
      
      case 'happy':
      default:
        return (
          <div className={baseClasses}>
            <div className="w-5 h-5 relative">
              {/* Happy eyes */}
              <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
              {/* Happy smile */}
              <div className="absolute bottom-0 left-0.5 right-0.5 h-0.5 border-b border-white rounded-full"></div>
            </div>
          </div>
        );
    }
  };

  const getPerformanceInsights = () => {
    if (!employees.length) return "No employee data available.";
    
    const totalEmployees = employees.length;
    const topPerformers = employees.filter(emp => emp.overall >= 90).length;
    const needsImprovement = employees.filter(emp => emp.overall < 70).length;
    const avgPerformance = Math.round(employees.reduce((sum, emp) => sum + emp.overall, 0) / totalEmployees);
    
    return `📊 **Performance Overview:**
• Total Employees: ${totalEmployees}
• Top Performers (90%+): ${topPerformers} (${Math.round(topPerformers/totalEmployees*100)}%)
• Needs Improvement (<70%): ${needsImprovement} (${Math.round(needsImprovement/totalEmployees*100)}%)
• Average Performance: ${avgPerformance}%

🎯 **Key Insights:**
${topPerformers > 0 ? `• ${topPerformers} employees are exceeding expectations` : ''}
${needsImprovement > 0 ? `• ${needsImprovement} employees need performance improvement` : ''}
• Overall team performance is ${avgPerformance >= 80 ? 'strong' : avgPerformance >= 70 ? 'moderate' : 'needs attention'}`;
  };

  const getEmployeeAnalysis = (employeeName) => {
    const employee = employees.find(emp => emp.name.toLowerCase().includes(employeeName.toLowerCase()));
    if (!employee) return "Employee not found. Please check the name and try again.";
    
    const strengths = [];
    const improvements = [];
    
    if (employee.attendance >= 90) strengths.push("Excellent attendance");
    else if (employee.attendance < 80) improvements.push("Improve attendance");
    
    if (employee.projects >= 90) strengths.push("Strong project completion");
    else if (employee.projects < 80) improvements.push("Enhance project management");
    
    if (employee.compliance >= 90) strengths.push("High compliance");
    else if (employee.compliance < 80) improvements.push("Improve policy compliance");
    
    if (employee.manager >= 90) strengths.push("Excellent manager rating");
    else if (employee.manager < 80) improvements.push("Improve manager relationship");
    
    return `👤 **${employee.name} Analysis:**
📊 **Performance Scores:**
• Attendance: ${employee.attendance}%
• Projects: ${employee.projects}%
• Compliance: ${employee.compliance}%
• Manager Rating: ${employee.manager}%
• Overall: ${employee.overall}%

${strengths.length > 0 ? `✅ **Strengths:**
${strengths.map(s => `• ${s}`).join('\n')}` : ''}

${improvements.length > 0 ? `⚠️ **Areas for Improvement:**
${improvements.map(i => `• ${i}`).join('\n')}` : ''}

🎯 **Recommendations:**
${employee.overall >= 90 ? '• Consider for promotion or leadership role' : ''}
${employee.overall < 70 ? '• Develop performance improvement plan' : ''}
${employee.attendance < 80 ? '• Address attendance issues' : ''}
${employee.projects < 80 ? '• Provide project management training' : ''}`;
  };

  const getKPIInsights = () => {
    const totalWeight = Object.values(kpiWeights).reduce((sum, weight) => sum + weight, 0);
    const isBalanced = totalWeight === 100;
    
    return `⚙️ **KPI Weight Analysis:**
📋 Project Completion: ${kpiWeights.projects || 0}%
👨‍💼 Manager Evaluation: ${kpiWeights.manager || 0}%
✅ Compliance: ${kpiWeights.compliance || 0}%
⏰ Attendance: ${kpiWeights.attendance || 0}%
**Total: ${totalWeight}%**

${isBalanced ? '✅ KPI weights are perfectly balanced!' : '⚠️ KPI weights need adjustment to reach 100%'}

🎯 **Recommendations:**
${kpiWeights.projects > 40 ? '• Consider reducing project weight - may be too high' : ''}
${kpiWeights.attendance < 20 ? '• Attendance weight might be too low' : ''}
${kpiWeights.manager < 15 ? '• Manager evaluation weight could be increased' : ''}`;
  };

  const getDepartmentAnalysis = () => {
    const departments = [...new Set(employees.map(emp => emp.department))];
    const deptAnalysis = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept);
      const avgScore = Math.round(deptEmployees.reduce((sum, emp) => sum + emp.overall, 0) / deptEmployees.length);
      return `• ${dept}: ${avgScore}% (${deptEmployees.length} employees)`;
    }).join('\n');
    
    return `🏢 **Department Performance:**
${deptAnalysis}

📈 **Department Insights:**
${departments.map(dept => {
  const deptEmployees = employees.filter(emp => emp.department === dept);
  const topPerformers = deptEmployees.filter(emp => emp.overall >= 90).length;
  return `• ${dept}: ${topPerformers}/${deptEmployees.length} top performers`;
}).join('\n')}`;
  };

  const generateRecommendations = () => {
    const topPerformers = employees.filter(emp => emp.overall >= 90);
    const needsImprovement = employees.filter(emp => emp.overall < 70);
    
    return `💡 **AI Recommendations:**

${topPerformers.length > 0 ? `🏆 **Recognition Opportunities:**
${topPerformers.map(emp => `• ${emp.name} - Consider for promotion, bonus, or leadership role`).join('\n')}` : ''}

${needsImprovement.length > 0 ? `⚠️ **Performance Improvement Plans:**
${needsImprovement.map(emp => `• ${emp.name} - Develop targeted improvement plan`).join('\n')}` : ''}

📚 **Training Recommendations:**
• Project Management: For employees with low project scores
• Time Management: For attendance issues
• Policy Training: For compliance issues
• Leadership Development: For high performers

🎯 **Strategic Actions:**
• Review KPI weights for better balance
• Implement mentorship programs
• Create performance improvement plans
• Recognize and reward top performers`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let botResponse = '';
      const message = inputMessage.toLowerCase();

      if (message.includes('overview') || message.includes('summary') || message.includes('performance')) {
        botResponse = getPerformanceInsights();
      } else if (message.includes('employee') || message.includes('analysis')) {
        const employeeName = inputMessage.match(/employee\s+(\w+)|analysis\s+(\w+)|(\w+)\s+analysis/i);
        if (employeeName) {
          const name = employeeName[1] || employeeName[2] || employeeName[3];
          botResponse = getEmployeeAnalysis(name);
        } else {
          botResponse = "Please specify which employee you'd like to analyze. Example: 'Analyze Ahmed Hassan' or 'Employee analysis for Sarah Johnson'";
        }
      } else if (message.includes('kpi') || message.includes('weight') || message.includes('settings')) {
        botResponse = getKPIInsights();
      } else if (message.includes('department') || message.includes('team')) {
        botResponse = getDepartmentAnalysis();
      } else if (message.includes('recommendation') || message.includes('suggest') || message.includes('advice')) {
        botResponse = generateRecommendations();
      } else if (message.includes('help') || message.includes('what can you do')) {
        botResponse = `👋 **Hi! I'm Sarah, your AI HR Assistant. Here's what I can help you with:**

📊 **Performance Analysis:**
• Ask me "performance overview" to see team statistics
• Say "analyze [employee name]" for individual analysis
• Request "department analysis" for team insights

⚙️ **KPI Management:**
• Ask about "KPI weights" or "settings"
• I can provide insights on weight distribution

💡 **Recommendations:**
• Ask for "recommendations" for my AI suggestions
• I can give training and development advice

🎯 **Try asking me:**
• "Show me performance overview"
• "Analyze Ahmed Hassan"
• "Department analysis"
• "KPI insights"
• "Give me recommendations"

I'm here to make your HR work easier! 😊`;
      } else {
        botResponse = `I understand you're asking about "${inputMessage}". 

Here are some things I can help you with:
• Performance analysis and insights
• Individual employee evaluations
• KPI weight analysis
• Department performance
• AI recommendations

Try asking:
• "Show me performance overview"
• "Analyze [employee name]"
• "Department analysis"
• "Give me recommendations"`;
      }

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            {/* Human-like Avatar */}
            <div className="relative mr-4">
              {renderAvatar('w-12 h-12')}
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Sarah - AI HR Assistant</h3>
              <p className="text-blue-100 text-sm">👋 Hi! I'm here to help with employee evaluations</p>
              {/* Avatar Style Selector */}
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => setAvatarStyle('happy')}
                  className={`px-2 py-1 text-xs rounded-full transition-all ${
                    avatarStyle === 'happy' ? 'bg-white bg-opacity-30 text-white' : 'text-blue-200 hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  😊 Happy
                </button>
                <button
                  onClick={() => setAvatarStyle('professional')}
                  className={`px-2 py-1 text-xs rounded-full transition-all ${
                    avatarStyle === 'professional' ? 'bg-white bg-opacity-30 text-white' : 'text-blue-200 hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  🧑‍💼 Pro
                </button>
                <button
                  onClick={() => setAvatarStyle('friendly')}
                  className={`px-2 py-1 text-xs rounded-full transition-all ${
                    avatarStyle === 'friendly' ? 'bg-white bg-opacity-30 text-white' : 'text-blue-200 hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  😄 Friendly
                </button>
                <button
                  onClick={() => setAvatarStyle('excited')}
                  className={`px-2 py-1 text-xs rounded-full transition-all ${
                    avatarStyle === 'excited' ? 'bg-white bg-opacity-30 text-white' : 'text-blue-200 hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  🤩 Excited
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} items-start space-x-3`}
            >
              {message.type === 'bot' && (
                <div className="flex-shrink-0">
                  {renderAvatar('w-8 h-8')}
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
                <div className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              {message.type === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-md">
                    <span className="text-white text-xs font-bold">You</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start items-start space-x-3">
              <div className="flex-shrink-0">
                {renderAvatar('w-8 h-8')}
              </div>
              <div className="bg-gray-100 text-gray-900 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about performance analysis, employee insights, or recommendations..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            💡 Try: "Show me performance overview", "Analyze Ahmed Hassan", or "Give me recommendations"
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEmployeeEvaluationsChatbot;
