import React, { createContext, useContext, useState, useEffect } from 'react';

const AIAssistantContext = createContext();

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
};

export const AIAssistantProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);
  const [aiPreferences, setAiPreferences] = useState({
    showWelcomeMessage: true,
    enableSuggestions: true,
    enableVoiceInput: false,
    dailyBriefing: true,
    showTips: true
  });

  // Detect current page based on URL or route
  useEffect(() => {
    const detectCurrentPage = () => {
      const path = window.location.pathname;
      if (path.includes('/tasks')) return 'tasks';
      if (path.includes('/attendance')) return 'attendance';
      if (path.includes('/payroll')) return 'payroll';
      if (path.includes('/employees')) return 'employees';
      if (path.includes('/invoices')) return 'invoices';
      if (path.includes('/reports')) return 'reports';
      return 'dashboard';
    };

    setCurrentPage(detectCurrentPage());

    // Listen for route changes
    const handleRouteChange = () => {
      setCurrentPage(detectCurrentPage());
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Load AI preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('aiAssistantPreferences');
    if (savedPreferences) {
      try {
        setAiPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.warn('Failed to load AI Assistant preferences:', error);
      }
    }
  }, []);

  // Save AI preferences to localStorage
  const updateAIPreferences = (newPreferences) => {
    const updatedPreferences = { ...aiPreferences, ...newPreferences };
    setAiPreferences(updatedPreferences);
    localStorage.setItem('aiAssistantPreferences', JSON.stringify(updatedPreferences));
  };

  // Toggle AI Assistant
  const toggleAIAssistant = () => {
    setAiAssistantEnabled(!aiAssistantEnabled);
  };

  // Get contextual help based on current page
  const getContextualHelp = (page = currentPage) => {
    const helpMap = {
      dashboard: {
        title: "Dashboard Overview",
        description: "Your command center for Onix Engineering operations",
        tips: [
          "Use the summary cards to quickly assess company status",
          "Check the calendar for upcoming deadlines",
          "Review pending tasks and urgent notifications"
        ],
        actions: [
          "Add new employee",
          "Create invoice",
          "View reports"
        ]
      },
      tasks: {
        title: "Task Management",
        description: "Organize and track project tasks efficiently",
        tips: [
          "Use bulk actions to update multiple tasks at once",
          "Set dependencies between tasks for better planning",
          "Track time spent on tasks for accurate billing"
        ],
        actions: [
          "Create subtask",
          "Bulk edit tasks",
          "Set deadlines"
        ]
      },
      attendance: {
        title: "Attendance Tracking",
        description: "Monitor employee attendance and working hours",
        tips: [
          "Set up automatic check-in reminders",
          "Export attendance reports for payroll",
          "Track overtime and late arrivals"
        ],
        actions: [
          "View late employees",
          "Export report",
          "Check attendance stats"
        ]
      },
      payroll: {
        title: "Payroll Management",
        description: "Process salaries and manage employee compensation",
        tips: [
          "Automate tax calculations",
          "Generate payslips automatically",
          "Track bonuses and deductions"
        ],
        actions: [
          "Process payroll",
          "Generate payslips",
          "Calculate taxes"
        ]
      }
    };

    return helpMap[page] || helpMap.dashboard;
  };

  // Get daily briefing
  const getDailyBriefing = () => {
    const currentHour = new Date().getHours();
    let greeting = '';
    
    if (currentHour < 12) greeting = 'Good morning';
    else if (currentHour < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    return {
      greeting,
      message: `${greeting}! Here's your daily briefing for Onix Engineering Consultancy.`,
      priorities: [
        "Review pending invoices",
        "Check employee attendance",
        "Update project timelines",
        "Process payroll if due"
      ],
      tips: [
        "Use keyboard shortcuts for faster navigation",
        "Enable notifications for important deadlines",
        "Export reports regularly for backup"
      ]
    };
  };

  const value = {
    currentPage,
    setCurrentPage,
    aiAssistantEnabled,
    setAiAssistantEnabled,
    aiPreferences,
    updateAIPreferences,
    toggleAIAssistant,
    getContextualHelp,
    getDailyBriefing
  };

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
};

export default AIAssistantContext;
