import React, { useState, useEffect } from "react";
import { 
  ChatBubbleLeftRightIcon, 
  PlusIcon, 
  EyeIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export default function FeedbacksSurvey() {
  const [surveys, setSurveys] = useState([
    {
      id: 1,
      title: "Employee Satisfaction Survey 2024",
      description: "Annual survey to measure employee satisfaction and identify areas for improvement",
      questions: 15,
      dueDate: "2024-03-15",
      responses: 45,
      totalEmployees: 60,
      status: "active",
      completed: false
    },
    {
      id: 2,
      title: "Workplace Environment Feedback",
      description: "Gather feedback about the workplace environment and facilities",
      questions: 8,
      dueDate: "2024-02-28",
      responses: 52,
      totalEmployees: 60,
      status: "completed",
      completed: true
    },
    {
      id: 3,
      title: "Training Program Evaluation",
      description: "Evaluate the effectiveness of recent training programs",
      questions: 12,
      dueDate: "2024-03-20",
      responses: 28,
      totalEmployees: 60,
      status: "active",
      completed: false
    },
    {
      id: 4,
      title: "Remote Work Experience",
      description: "Survey about remote work experience and preferences",
      questions: 10,
      dueDate: "2024-02-15",
      responses: 60,
      totalEmployees: 60,
      status: "completed",
      completed: true
    }
  ]);

  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSurveyForDelete, setSelectedSurveyForDelete] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    questions: []
  });

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    type: 'multiple_choice',
    options: [''],
    placeholder: ''
  });

  // Delivery options state
  const [deliveryOptions, setDeliveryOptions] = useState({
    // Employee delivery options
    employeeSendViaEmail: false,
    employeeSendViaWhatsApp: false,
    // Client delivery options
    clientSendViaEmail: false,
    clientSendViaWhatsApp: false,
    // Legacy fields (keeping for backward compatibility)
    sendViaEmail: false,
    sendViaWhatsApp: false,
    recipientEmail: '',
    recipientWhatsApp: '',
    selectedClient: ''
  });

  // Selected recipients state for searchable checklist
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [selectedEmployeeRecipients, setSelectedEmployeeRecipients] = useState([]);
  const [selectedClientRecipients, setSelectedClientRecipients] = useState([]);
  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  // Mock employees data for recipient selection
  const [employees] = useState([
    { id: 'emp_1', name: 'Ahmed Ali', email: 'ahmed.ali@email.com', whatsapp: '+971501234567', type: 'Employee', department: 'HR', position: 'Manager' },
    { id: 'emp_2', name: 'Sara Youssef', email: 'sara.y@email.com', whatsapp: '+971509876543', type: 'Employee', department: 'Finance', position: 'Accountant' },
    { id: 'emp_3', name: 'John Smith', email: 'john.smith@email.com', whatsapp: '+971505555555', type: 'Employee', department: 'IT', position: 'Developer' },
    { id: 'emp_4', name: 'Fatima Noor', email: 'fatima.noor@email.com', whatsapp: '+971506666666', type: 'Employee', department: 'Sales', position: 'Sales Rep' },
    { id: 'emp_5', name: 'Michael Brown', email: 'michael.brown@company.com', whatsapp: '+971507777777', type: 'Employee', department: 'IT', position: 'Team Lead' },
    { id: 'emp_6', name: 'Emily Davis', email: 'emily.davis@company.com', whatsapp: '+971508888888', type: 'Employee', department: 'HR', position: 'HR Specialist' },
    { id: 'emp_7', name: 'David Wilson', email: 'david.wilson@company.com', whatsapp: '+971509999999', type: 'Employee', department: 'Finance', position: 'Senior Accountant' },
    { id: 'emp_8', name: 'Lisa Anderson', email: 'lisa.anderson@company.com', whatsapp: '+971500000000', type: 'Employee', department: 'IT', position: 'Project Manager' }
  ]);

  // Mock clients data for recipient selection
  const [clients] = useState([
    { id: 'client_1', name: 'John Smith', email: 'john.smith@example.com', whatsapp: '+1234567890', type: 'Client', company: 'ABC Corp' },
    { id: 'client_2', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', whatsapp: '+1234567891', type: 'Client', company: 'XYZ Ltd' },
    { id: 'client_3', name: 'Mike Davis', email: 'mike.davis@example.com', whatsapp: '+1234567892', type: 'Client', company: 'Tech Solutions' },
    { id: 'client_4', name: 'Lisa Wilson', email: 'lisa.wilson@example.com', whatsapp: '+1234567893', type: 'Client', company: 'Global Engineering' },
    { id: 'client_5', name: 'Robert Taylor', email: 'robert.taylor@example.com', whatsapp: '+1234567894', type: 'Client', company: 'Innovation Inc' },
    { id: 'client_6', name: 'Jennifer Martinez', email: 'jennifer.martinez@example.com', whatsapp: '+1234567895', type: 'Client', company: 'Future Systems' }
  ]);

  const isAdmin = true; // Mock admin status

  const sampleQuestions = [
    {
      id: 1,
      question: "How satisfied are you with your current role?",
      type: "rating",
      required: true
    },
    {
      id: 2,
      question: "Which department do you work in?",
      type: "multiple_choice",
      options: ["Engineering", "Marketing", "Sales", "HR", "Finance"],
      required: true
    },
    {
      id: 3,
      question: "What would you like to see improved in the workplace?",
      type: "text",
      placeholder: "Please share your suggestions...",
      required: false
    },
    {
      id: 4,
      question: "How likely are you to recommend this company to others?",
      type: "rating",
      required: true
    }
  ];

  const handleStartSurvey = (survey) => {
    setCurrentSurvey(survey);
    setCurrentQuestion(0);
    setAnswers({});
    setShowSurveyModal(true);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Survey completed
      setShowThankYou(true);
      setTimeout(() => {
        setShowSurveyModal(false);
        setShowThankYou(false);
        setCurrentSurvey(null);
        setCurrentQuestion(0);
        setAnswers({});
        
        // Mark survey as completed
        setSurveys(prev => prev.map(survey => 
          survey.id === currentSurvey.id 
            ? { ...survey, completed: true, responses: survey.responses + 1 }
            : survey
        ));
      }, 3000);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleCreateSurvey = async () => {
    if (!newSurvey.title.trim() || !newSurvey.description.trim() || newSurvey.questions.length === 0) {
      alert("Please fill in all required fields and add at least one question");
      return;
    }

    // Validate delivery options if any are selected
    const hasEmployeeDelivery = deliveryOptions.employeeSendViaEmail || deliveryOptions.employeeSendViaWhatsApp;
    const hasClientDelivery = deliveryOptions.clientSendViaEmail || deliveryOptions.clientSendViaWhatsApp;
    
    if (hasEmployeeDelivery && selectedEmployeeRecipients.length === 0) {
      alert("Please select at least one employee when choosing employee delivery methods");
      return;
    }
    
    if (hasClientDelivery && selectedClientRecipients.length === 0) {
      alert("Please select at least one client when choosing client delivery methods");
      return;
    }

    const survey = {
      id: Date.now(),
      title: newSurvey.title,
      description: newSurvey.description,
      questions: newSurvey.questions.length,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      responses: 0,
      totalEmployees: 60,
      status: "active",
      completed: false
    };

    setSurveys(prev => [survey, ...prev]);

    // Handle delivery if options are selected
    
    if (hasEmployeeDelivery || hasClientDelivery) {
      const surveyLink = generateSurveyLink(survey.id);
      let deliveryResults = [];
      let deliverySummary = [];

      // Handle employee delivery
      if (hasEmployeeDelivery && selectedEmployeeRecipients.length > 0) {
        const selectedEmployeeDetails = employees.filter(employee => 
          selectedEmployeeRecipients.includes(employee.id)
        );

        // Send to employees via email if selected
        if (deliveryOptions.employeeSendViaEmail) {
          const employeeEmails = selectedEmployeeDetails.map(employee => employee.email);
          for (const email of employeeEmails) {
            const emailResult = await sendSurveyViaEmail(surveyLink, email);
            deliveryResults.push(emailResult);
          }
          deliverySummary.push(`Email to ${selectedEmployeeDetails.length} employee(s)`);
        }

        // Send to employees via WhatsApp if selected
        if (deliveryOptions.employeeSendViaWhatsApp) {
          const employeeWhatsApps = selectedEmployeeDetails.map(employee => employee.whatsapp);
          for (const whatsapp of employeeWhatsApps) {
            const whatsappResult = await sendSurveyViaWhatsApp(surveyLink, whatsapp);
            deliveryResults.push(whatsappResult);
          }
          deliverySummary.push(`WhatsApp to ${selectedEmployeeDetails.length} employee(s)`);
        }
      }

      // Handle client delivery
      if (hasClientDelivery && selectedClientRecipients.length > 0) {
        const selectedClientDetails = clients.filter(client => 
          selectedClientRecipients.includes(client.id)
        );

        // Send to clients via email if selected
        if (deliveryOptions.clientSendViaEmail) {
          const clientEmails = selectedClientDetails.map(client => client.email);
          for (const email of clientEmails) {
            const emailResult = await sendSurveyViaEmail(surveyLink, email);
            deliveryResults.push(emailResult);
          }
          deliverySummary.push(`Email to ${selectedClientDetails.length} client(s)`);
        }

        // Send to clients via WhatsApp if selected
        if (deliveryOptions.clientSendViaWhatsApp) {
          const clientWhatsApps = selectedClientDetails.map(client => client.whatsapp);
          for (const whatsapp of clientWhatsApps) {
            const whatsappResult = await sendSurveyViaWhatsApp(surveyLink, whatsapp);
            deliveryResults.push(whatsappResult);
          }
          deliverySummary.push(`WhatsApp to ${selectedClientDetails.length} client(s)`);
        }
      }

      // Show delivery results
      const successCount = deliveryResults.filter(result => result.success).length;
      const totalCount = deliveryResults.length;
      
      if (successCount === totalCount) {
        alert(`Survey created successfully! Survey sent via: ${deliverySummary.join(', ')}.`);
      } else {
        alert(`Survey created successfully! ${successCount}/${totalCount} delivery methods succeeded.`);
      }
    } else {
      alert("Survey created successfully!");
    }

    // Reset form
    setNewSurvey({ title: '', description: '', questions: [] });
    setDeliveryOptions({
      employeeSendViaEmail: false,
      employeeSendViaWhatsApp: false,
      clientSendViaEmail: false,
      clientSendViaWhatsApp: false,
      sendViaEmail: false,
      sendViaWhatsApp: false,
      recipientEmail: '',
      recipientWhatsApp: '',
      selectedClient: ''
    });
    setSelectedRecipients([]);
    setSelectedEmployeeRecipients([]);
    setSelectedClientRecipients([]);
    setRecipientSearchTerm('');
    setEmployeeSearchTerm('');
    setClientSearchTerm('');
    setShowCreateModal(false);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) {
      alert("Please enter a question");
      return;
    }

    if (newQuestion.type === 'multiple_choice' && newQuestion.options.length < 2) {
      alert("Please add at least 2 options for multiple choice questions");
      return;
    }

    const question = {
      id: Date.now(),
      question: newQuestion.question,
      type: newQuestion.type,
      options: newQuestion.type === 'multiple_choice' ? newQuestion.options.filter(opt => opt.trim()) : [],
      placeholder: newQuestion.placeholder,
      required: true
    };

    setNewSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, question]
    }));

    setNewQuestion({
      question: '',
      type: 'multiple_choice',
      options: [''],
      placeholder: ''
    });
  };

  const handleRemoveQuestion = (index) => {
    setNewSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleAddOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index, value) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleDeleteSurvey = () => {
    if (selectedSurveyForDelete) {
      setSurveys(prev => prev.filter(survey => survey.id !== selectedSurveyForDelete.id));
      setShowDeleteModal(false);
      setSelectedSurveyForDelete(null);
    }
  };

  const handleClientSurvey = () => {
    // Create a new client survey
    const clientSurvey = {
      id: Date.now(),
      title: "Client Satisfaction Survey",
      description: "Gather feedback from clients about our services and support",
      questions: 8,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
      responses: 0,
      totalEmployees: 60,
      status: "active",
      completed: false,
      type: "client"
    };

    setSurveys(prev => [clientSurvey, ...prev]);
    
    // Show success message
    alert("Client Survey created successfully! It will be available for clients to complete.");
  };

  // Delivery option handlers
  const handleDeliveryOptionChange = (field, value) => {
    setDeliveryOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmployeeDeliveryOptionChange = (field, value) => {
    setDeliveryOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClientDeliveryOptionChange = (field, value) => {
    setDeliveryOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClientSelection = (clientId) => {
    const selectedClient = clients.find(client => client.id === parseInt(clientId));
    setDeliveryOptions(prev => ({
      ...prev,
      selectedClient: clientId,
      recipientEmail: selectedClient ? selectedClient.email : '',
      recipientWhatsApp: selectedClient ? selectedClient.whatsapp : ''
    }));
  };

  // Searchable checklist handlers
  const handleRecipientToggle = (recipientId) => {
    setSelectedRecipients(prev => {
      if (prev.includes(recipientId)) {
        return prev.filter(id => id !== recipientId);
      } else {
        return [...prev, recipientId];
      }
    });
  };

  // Employee recipient handlers
  const handleEmployeeRecipientToggle = (employeeId) => {
    setSelectedEmployeeRecipients(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSelectAllEmployees = () => {
    const allEmployeeIds = employees.map(employee => employee.id);
    setSelectedEmployeeRecipients(allEmployeeIds);
  };

  const handleClearAllEmployees = () => {
    setSelectedEmployeeRecipients([]);
  };

  // Client recipient handlers
  const handleClientRecipientToggle = (clientId) => {
    setSelectedClientRecipients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const handleSelectAllClients = () => {
    const allClientIds = clients.map(client => client.id);
    setSelectedClientRecipients(allClientIds);
  };

  const handleClearAllClients = () => {
    setSelectedClientRecipients([]);
  };

  const handleSelectAllRecipients = () => {
    const allRecipients = [...employees, ...clients].map(recipient => recipient.id);
    setSelectedRecipients(allRecipients);
  };

  const handleClearAllRecipients = () => {
    setSelectedRecipients([]);
  };

  // Filter recipients based on search term
  const filteredRecipients = [...employees, ...clients].filter(recipient =>
    recipient.name.toLowerCase().includes(recipientSearchTerm.toLowerCase()) ||
    recipient.email.toLowerCase().includes(recipientSearchTerm.toLowerCase()) ||
    recipient.type.toLowerCase().includes(recipientSearchTerm.toLowerCase()) ||
    (recipient.department && recipient.department.toLowerCase().includes(recipientSearchTerm.toLowerCase())) ||
    (recipient.company && recipient.company.toLowerCase().includes(recipientSearchTerm.toLowerCase()))
  );

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const generateSurveyLink = (surveyId) => {
    // Generate a unique trackable link
    return `${window.location.origin}/survey/${surveyId}?tracking=${btoa(`survey_${surveyId}_${Date.now()}`)}`;
  };

  const sendSurveyViaEmail = async (surveyLink, recipientEmail) => {
    try {
      // Mock API call to backend email service
      console.log('Sending survey via email to:', recipientEmail);
      console.log('Survey link:', surveyLink);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, message: 'Survey sent via email successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, message: 'Failed to send email' };
    }
  };

  const sendSurveyViaWhatsApp = async (surveyLink, recipientWhatsApp) => {
    try {
      // Mock API call to backend WhatsApp service
      console.log('Sending survey via WhatsApp to:', recipientWhatsApp);
      console.log('Survey link:', surveyLink);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, message: 'Survey sent via WhatsApp successfully' };
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      return { success: false, message: 'Failed to send WhatsApp' };
    }
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || survey.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionColor = (completed) => {
    return completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const activeCount = surveys.filter(s => s.status === 'active').length;
  const completedCount = surveys.filter(s => s.status === 'completed').length;
  const totalSurveys = surveys.length;
  const totalResponses = surveys.reduce((sum, s) => sum + s.responses, 0);
  const averageCompletionRate = surveys.length > 0 ? Math.round(surveys.reduce((sum, s) => sum + (s.responses / s.totalEmployees * 100), 0) / surveys.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Feedbacks & Surveys
              </h1>
              <p className="text-gray-600 mt-1">Participate in surveys and provide valuable feedback</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSurveys}</p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{completedCount}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold text-purple-600">{totalResponses}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                  <p className="text-2xl font-bold text-orange-600">{averageCompletionRate}%</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search surveys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              {/* Status Filter */}
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Stats Button */}
              <button
                onClick={() => setShowStatsModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Stats
              </button>
              
              {/* Client Survey Button */}
              <button
                onClick={() => handleClientSurvey()}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Client Survey
              </button>
              
              {/* Create Survey Button (Admin Only) */}
              {isAdmin && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Survey
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Surveys Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {survey.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(survey.status)}`}>
                        {survey.status}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCompletionColor(survey.completed)}`}>
                        {survey.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{survey.description}</p>
                  </div>
                </div>
                
                {/* Survey Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-bold text-gray-900">{survey.questions}</p>
                    <p className="text-xs text-gray-600">Questions</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-bold text-gray-900">{survey.responses}</p>
                    <p className="text-xs text-gray-600">Responses</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-bold text-gray-900">
                      {Math.round((survey.responses / survey.totalEmployees) * 100)}%
                    </p>
                    <p className="text-xs text-gray-600">Completion</p>
                  </div>
                </div>
                
                {/* Due Date */}
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Due Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(survey.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <ClockIcon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-6">
                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {!survey.completed ? (
                      <button 
                        onClick={() => handleStartSurvey(survey)}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors"
                      >
                        Start Survey
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircleIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          setSelectedSurveyForDelete(survey);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Survey"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSurveys.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <ChatBubbleLeftRightIcon className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No surveys are currently available."
              }
            </p>
            {isAdmin && !searchTerm && filterStatus === "all" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Survey
              </button>
            )}
          </div>
        )}
      </div>

      {/* Survey Modal */}
      {showSurveyModal && currentSurvey && !showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentSurvey.title}</h2>
                <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {sampleQuestions.length}</p>
              </div>
              <button
                onClick={() => setShowSurveyModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Current Question */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {sampleQuestions[currentQuestion].question}
                {sampleQuestions[currentQuestion].required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              
              {/* Question Input */}
              {sampleQuestions[currentQuestion].type === 'rating' && (
                <div className="flex items-center gap-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleAnswerChange(sampleQuestions[currentQuestion].id, rating)}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold transition-all duration-200 ${
                        answers[sampleQuestions[currentQuestion].id] === rating
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              )}
              
              {sampleQuestions[currentQuestion].type === 'multiple_choice' && (
                <div className="space-y-3">
                  {sampleQuestions[currentQuestion].options.map((option, index) => (
                    <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${sampleQuestions[currentQuestion].id}`}
                        value={option}
                        checked={answers[sampleQuestions[currentQuestion].id] === option}
                        onChange={(e) => handleAnswerChange(sampleQuestions[currentQuestion].id, e.target.value)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {sampleQuestions[currentQuestion].type === 'text' && (
                <textarea
                  value={answers[sampleQuestions[currentQuestion].id] || ''}
                  onChange={(e) => handleAnswerChange(sampleQuestions[currentQuestion].id, e.target.value)}
                  placeholder={sampleQuestions[currentQuestion].placeholder}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
              )}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentQuestion === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                {currentQuestion === sampleQuestions.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 text-center">
            <div className="mb-6">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
              <p className="text-gray-600">Your response has been submitted successfully.</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Survey Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Survey</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setDeliveryOptions({
                    employeeSendViaEmail: false,
                    employeeSendViaWhatsApp: false,
                    clientSendViaEmail: false,
                    clientSendViaWhatsApp: false,
                    sendViaEmail: false,
                    sendViaWhatsApp: false,
                    recipientEmail: '',
                    recipientWhatsApp: '',
                    selectedClient: ''
                  });
                  setSelectedRecipients([]);
                  setSelectedEmployeeRecipients([]);
                  setSelectedClientRecipients([]);
                  setRecipientSearchTerm('');
                  setEmployeeSearchTerm('');
                  setClientSearchTerm('');
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Survey Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Survey Title *
                  </label>
                  <input
                    type="text"
                    value={newSurvey.title}
                    onChange={(e) => setNewSurvey(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter survey title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newSurvey.description}
                    onChange={(e) => setNewSurvey(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    placeholder="Enter survey description"
                  />
                </div>
              </div>
              
              {/* Add Question Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Questions</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question *
                    </label>
                    <input
                      type="text"
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your question"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type *
                    </label>
                    <select
                      value={newQuestion.type}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="rating">Rating (1-5)</option>
                      <option value="text">Text Input</option>
                    </select>
                  </div>
                  
                  {newQuestion.type === 'multiple_choice' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options *
                      </label>
                      <div className="space-y-2">
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder={`Option ${index + 1}`}
                            />
                            {newQuestion.options.length > 1 && (
                              <button
                                onClick={() => handleRemoveOption(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={handleAddOption}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {newQuestion.type === 'text' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Placeholder Text
                      </label>
                      <input
                        type="text"
                        value={newQuestion.placeholder}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, placeholder: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter placeholder text"
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={handleAddQuestion}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Question
                  </button>
                </div>
              </div>
              
              {/* Questions List */}
              {newSurvey.questions.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions ({newSurvey.questions.length})</h3>
                  <div className="space-y-3">
                    {newSurvey.questions.map((question, index) => (
                      <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{question.question}</p>
                          <p className="text-sm text-gray-600 capitalize">{question.type.replace('_', ' ')}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveQuestion(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Delivery Options Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Options</h3>
                
                <div className="space-y-6">
                  {/* Employee Delivery Section */}
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <UserGroupIcon className="h-5 w-5" />
                      Employee Delivery
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Employee Selection */}
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          Select Employees
                        </label>
                        
                        {/* Employee Search Input */}
                        <div className="relative mb-3">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={employeeSearchTerm}
                            onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                            placeholder="Search employees..."
                            className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        {/* Employee Select All/Clear All Buttons */}
                        <div className="flex gap-2 mb-3">
                          <button
                            type="button"
                            onClick={handleSelectAllEmployees}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            Select All Employees
                          </button>
                          <button
                            type="button"
                            onClick={handleClearAllEmployees}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            Clear All
                          </button>
                          <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md">
                            {selectedEmployeeRecipients.length} selected
                          </span>
                        </div>

                        {/* Employees Checklist */}
                        <div className="max-h-40 overflow-y-auto border border-blue-300 rounded-lg p-2 bg-white">
                          {filteredEmployees.length > 0 ? (
                            <div className="space-y-2">
                              {filteredEmployees.map((employee) => (
                                <label
                                  key={employee.id}
                                  className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedEmployeeRecipients.includes(employee.id)}
                                    onChange={() => handleEmployeeRecipientToggle(employee.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900 truncate">
                                        {employee.name}
                                      </span>
                                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                        Employee
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600 truncate">
                                      {employee.email}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {employee.department} - {employee.position}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No employees found matching your search.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Employee Delivery Methods */}
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="employeeSendViaEmail"
                            checked={deliveryOptions.employeeSendViaEmail}
                            onChange={(e) => handleEmployeeDeliveryOptionChange('employeeSendViaEmail', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="employeeSendViaEmail" className="ml-2 text-sm text-blue-700 cursor-pointer">
                            Send to Employees via Email
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="employeeSendViaWhatsApp"
                            checked={deliveryOptions.employeeSendViaWhatsApp}
                            onChange={(e) => handleEmployeeDeliveryOptionChange('employeeSendViaWhatsApp', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="employeeSendViaWhatsApp" className="ml-2 text-sm text-blue-700 cursor-pointer">
                            Send to Employees via WhatsApp
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Client Delivery Section */}
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <h4 className="text-md font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <UserGroupIcon className="h-5 w-5" />
                      Client Delivery
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Client Selection */}
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                          Select Clients
                        </label>
                        
                        {/* Client Search Input */}
                        <div className="relative mb-3">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={clientSearchTerm}
                            onChange={(e) => setClientSearchTerm(e.target.value)}
                            placeholder="Search clients..."
                            className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                        </div>

                        {/* Client Select All/Clear All Buttons */}
                        <div className="flex gap-2 mb-3">
                          <button
                            type="button"
                            onClick={handleSelectAllClients}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                          >
                            Select All Clients
                          </button>
                          <button
                            type="button"
                            onClick={handleClearAllClients}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            Clear All
                          </button>
                          <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md">
                            {selectedClientRecipients.length} selected
                          </span>
                        </div>

                        {/* Clients Checklist */}
                        <div className="max-h-40 overflow-y-auto border border-green-300 rounded-lg p-2 bg-white">
                          {filteredClients.length > 0 ? (
                            <div className="space-y-2">
                              {filteredClients.map((client) => (
                                <label
                                  key={client.id}
                                  className="flex items-center gap-3 p-2 hover:bg-green-50 rounded cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedClientRecipients.includes(client.id)}
                                    onChange={() => handleClientRecipientToggle(client.id)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-900 truncate">
                                        {client.name}
                                      </span>
                                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                        Client
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600 truncate">
                                      {client.email}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {client.company}
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No clients found matching your search.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Client Delivery Methods */}
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="clientSendViaEmail"
                            checked={deliveryOptions.clientSendViaEmail}
                            onChange={(e) => handleClientDeliveryOptionChange('clientSendViaEmail', e.target.checked)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor="clientSendViaEmail" className="ml-2 text-sm text-green-700 cursor-pointer">
                            Send to Clients via Email
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="clientSendViaWhatsApp"
                            checked={deliveryOptions.clientSendViaWhatsApp}
                            onChange={(e) => handleClientDeliveryOptionChange('clientSendViaWhatsApp', e.target.checked)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor="clientSendViaWhatsApp" className="ml-2 text-sm text-green-700 cursor-pointer">
                            Send to Clients via WhatsApp
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {(deliveryOptions.employeeSendViaEmail || deliveryOptions.employeeSendViaWhatsApp || 
                    deliveryOptions.clientSendViaEmail || deliveryOptions.clientSendViaWhatsApp) && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> When you create the survey, a unique trackable link will be generated and sent to:
                        {selectedEmployeeRecipients.length > 0 && (
                          <span className="block mt-1">• {selectedEmployeeRecipients.length} employee(s)</span>
                        )}
                        {selectedClientRecipients.length > 0 && (
                          <span className="block mt-1">• {selectedClientRecipients.length} client(s)</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setDeliveryOptions({
                    employeeSendViaEmail: false,
                    employeeSendViaWhatsApp: false,
                    clientSendViaEmail: false,
                    clientSendViaWhatsApp: false,
                    sendViaEmail: false,
                    sendViaWhatsApp: false,
                    recipientEmail: '',
                    recipientWhatsApp: '',
                    selectedClient: ''
                  });
                  setSelectedRecipients([]);
                  setSelectedEmployeeRecipients([]);
                  setSelectedClientRecipients([]);
                  setRecipientSearchTerm('');
                  setEmployeeSearchTerm('');
                  setClientSearchTerm('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSurvey}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Survey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Survey Statistics Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Survey Statistics</h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Overall Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Completion Rate</h3>
                  <p className="text-3xl font-bold text-indigo-600">{averageCompletionRate}%</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Responses</h3>
                  <p className="text-3xl font-bold text-green-600">{totalResponses}</p>
                </div>
              </div>
              
              {/* Per Survey Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Completion Rates</h3>
                <div className="space-y-3">
                  {surveys.map((survey) => (
                    <div key={survey.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{survey.title}</p>
                        <p className="text-sm text-gray-600">{survey.responses} / {survey.totalEmployees} responses</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">
                          {Math.round((survey.responses / survey.totalEmployees) * 100)}%
                        </p>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${(survey.responses / survey.totalEmployees) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSurveyForDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Delete Survey</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedSurveyForDelete.title}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSurvey}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 