import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCompanySelection } from "../../context/CompanySelectionContext";
import { getEmployees } from "../../services/employeeAPI";
import ClientsAPI from "../../services/clientsAPI";
import * as feedbackSurveyAPI from "../../services/feedbackSurveyAPI";
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedCompany } = useCompanySelection();
  /** Only Admin/HR can create or delete (matches backend). */
  const canManageSurveys = Boolean(user?.role) && ["ADMIN", "HR"].includes(user.role);

  const [surveys, setSurveys] = useState([]);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [surveyLoadError, setSurveyLoadError] = useState(null);
  const [statsSummary, setStatsSummary] = useState(null);
  const [savingSurvey, setSavingSurvey] = useState(false);

  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSurveyForDelete, setSelectedSurveyForDelete] = useState(null);
  const [postCreateFormPrompt, setPostCreateFormPrompt] = useState(null);
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

  // Employee directory for recipient selection (loaded from backend by selected company)
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Real clients for recipient selection (loaded from backend)
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientsLoadError, setClientsLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadClients() {
      try {
        setLoadingClients(true);
        setClientsLoadError("");

        const res = await ClientsAPI.getClients({ limit: 500 });
        const list =
          (res && res.success && res.data && Array.isArray(res.data.clients) ? res.data.clients : null) ||
          (res && Array.isArray(res.data) ? res.data : null) ||
          (res && Array.isArray(res.clients) ? res.clients : null) ||
          [];

        if (!cancelled) setClients(list);
      } catch (e) {
        if (cancelled) return;
        setClients([]);
        setClientsLoadError("Unable to load clients from the server.");
        console.error("Error loading clients:", e);
      } finally {
        if (!cancelled) setLoadingClients(false);
      }
    }

    loadClients();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load employee directory from backend, filtered by the currently selected company
  useEffect(() => {
    let cancelled = false;

    async function loadEmployees() {
      try {
        setLoadingEmployees(true);

        // Employee directory is stored server-side; we filter by the selected company
        // CompanySelectionContext stores selectedCompany as a string (typically company name).
        const res = await getEmployees({
          // If no company is selected, fall back to "all active employees" (still real backend data).
          ...(selectedCompany ? { companyName: selectedCompany } : {}),
          page: 1,
          limit: 500,
        });

        if (!cancelled && res.success) {
          const mapped = (res.data || []).map((emp) => ({
            id: emp.id,
            name:
              [emp.firstName, emp.lastName].filter(Boolean).join(" ").trim() ||
              emp.email ||
              emp.employeeId ||
              emp.id,
            email: emp.email || "",
            whatsapp: emp.phone || "",
            type: "Employee",
            department: emp.department || "",
            position: emp.position || emp.jobTitle || "",
          }));
          setEmployees(mapped);
        }
      } catch (e) {
        if (!cancelled) setEmployees([]);
      } finally {
        if (!cancelled) setLoadingEmployees(false);
      }
    }

    loadEmployees();
    return () => {
      cancelled = true;
    };
  }, [selectedCompany]);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoadingSurveys(false);
      return;
    }
    setSurveyLoadError(null);
    setLoadingSurveys(true);
    try {
      const listRes = await feedbackSurveyAPI.listFeedbackSurveys();
      const rows = listRes.data || [];
      const enriched = rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description || "",
        questions: row.questionCount ?? 0,
        dueDate: row.dueDate,
        responses: row.completedCount ?? 0,
        totalEmployees: row.totalRecipients ?? 0,
        status:
          row.status === "PUBLISHED" || row.status === "ACTIVE"
            ? "active"
            : row.status === "DRAFT"
              ? "draft"
              : "completed",
        completed: !canManageSurveys && Boolean(row.myAssignment?.completedAt),
        completionRatePercent: row.completionRatePercent,
      }));
      setSurveys(enriched);
      if (canManageSurveys) {
        try {
          const st = await feedbackSurveyAPI.getFeedbackSurveyStats();
          setStatsSummary(st.data);
        } catch {
          setStatsSummary(null);
        }
      } else {
        setStatsSummary(null);
      }
    } catch (e) {
      setSurveyLoadError(e.message || "Failed to load surveys");
      setSurveys([]);
    } finally {
      setLoadingSurveys(false);
    }
  }, [user?.id, canManageSurveys]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartSurvey = (survey) => {
    navigate(`/workplace/forms/${encodeURIComponent(survey.id)}/fill`);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = async () => {
    if (!activeQuestions.length || !currentSurvey) return;
    const q = activeQuestions[currentQuestion];
    if (q.required) {
      const a = answers[q.id];
      if (a === undefined || a === null || String(a).trim() === "") {
        alert("Please answer this question.");
        return;
      }
    }
    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      return;
    }
    try {
      const answersPayload = {};
      for (const qq of activeQuestions) {
        const v = answers[qq.id];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          answersPayload[qq.id] = String(v).trim();
        }
      }
      await feedbackSurveyAPI.submitFeedbackResponses(currentSurvey.id, answersPayload);
      setShowThankYou(true);
      setTimeout(async () => {
        setShowSurveyModal(false);
        setShowThankYou(false);
        setCurrentSurvey(null);
        setCurrentQuestion(0);
        setAnswers({});
        setActiveQuestions([]);
        await loadData();
      }, 2000);
    } catch (e) {
      alert(e.message || "Submit failed");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleCreateSurvey = async () => {
    if (!newSurvey.title.trim() || !newSurvey.description.trim() || newSurvey.questions.length === 0) {
      alert("Please fill in all required fields and add at least one question");
      return;
    }

    const hasEmployeeDelivery = deliveryOptions.employeeSendViaEmail || deliveryOptions.employeeSendViaWhatsApp;
    const hasClientDelivery = deliveryOptions.clientSendViaEmail || deliveryOptions.clientSendViaWhatsApp;

    const due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const questionsPayload = newSurvey.questions.map((q, index) => {
      let questionType = "SHORT_TEXT";
      if (q.type === "multiple_choice") questionType = "MULTIPLE_CHOICE";
      else if (q.type === "rating") questionType = "RATING";
      return {
        questionText: q.question,
        description: q.placeholder ? String(q.placeholder) : null,
        order: index,
        questionType,
        options: q.type === "multiple_choice" ? q.options.filter((opt) => opt.trim()) : null,
        isRequired: q.required !== false,
      };
    });

    let createdId;
    try {
      setSavingSurvey(true);
      const created = await feedbackSurveyAPI.createFeedbackSurvey({
        title: newSurvey.title.trim(),
        description: newSurvey.description.trim(),
        dueDate: due.toISOString(),
        questions: questionsPayload,
      });
      createdId = created.data?.id;
      await loadData();
    } catch (e) {
      alert(e.message || "Failed to save survey");
      setSavingSurvey(false);
      return;
    } finally {
      setSavingSurvey(false);
    }

    if (hasEmployeeDelivery || hasClientDelivery) {
      const surveyLink = generateSurveyLink(createdId || "new");
      try {
        if (hasEmployeeDelivery && selectedEmployeeRecipients.length > 0) {
          const selectedEmployeeDetails = employees.filter((employee) =>
            selectedEmployeeRecipients.includes(employee.id)
          );
          if (deliveryOptions.employeeSendViaEmail) {
            for (const email of selectedEmployeeDetails.map((e) => e.email)) {
              await sendSurveyViaEmail(surveyLink, email);
            }
          }
          if (deliveryOptions.employeeSendViaWhatsApp) {
            for (const w of selectedEmployeeDetails.map((e) => e.whatsapp)) {
              await sendSurveyViaWhatsApp(surveyLink, w);
            }
          }
        }
        if (hasClientDelivery && selectedClientRecipients.length > 0) {
          const selectedClientDetails = clients.filter((client) =>
            selectedClientRecipients.includes(client.id)
          );
          if (deliveryOptions.clientSendViaEmail) {
            for (const email of selectedClientDetails.map((c) => c.email)) {
              await sendSurveyViaEmail(surveyLink, email);
            }
          }
          if (deliveryOptions.clientSendViaWhatsApp) {
            for (const w of selectedClientDetails.map((c) => c.whatsapp)) {
              await sendSurveyViaWhatsApp(surveyLink, w);
            }
          }
        }
      } catch (e) {
        console.warn("Optional delivery step failed:", e);
      }
    }

    setPostCreateFormPrompt({ id: createdId, title: newSurvey.title.trim() });

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

  const handleDeleteSurvey = async () => {
    if (!selectedSurveyForDelete) return;
    try {
      await feedbackSurveyAPI.deleteFeedbackSurvey(selectedSurveyForDelete.id);
      setShowDeleteModal(false);
      setSelectedSurveyForDelete(null);
      await loadData();
      alert("Survey deleted.");
    } catch (e) {
      alert(e.message || "Failed to delete survey");
    }
  };

  const handleClientSurvey = () => {
    alert(
      "Client-only surveys are not stored yet. Use Create Survey for org-wide surveys (saved to the server)."
    );
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

  const activeCount = statsSummary?.activeSurveys ?? surveys.filter((s) => s.status === "active").length;
  const completedCount = statsSummary?.closedSurveys ?? surveys.filter((s) => s.status === "completed").length;
  const totalSurveys = statsSummary?.totalSurveys ?? surveys.length;
  const totalResponses =
    statsSummary?.totalCompletedSubmissions ??
    surveys.reduce((sum, s) => sum + (s.responses || 0), 0);
  const averageCompletionRate =
    statsSummary?.avgCompletionPercent ??
    (surveys.length > 0
      ? Math.round(
          surveys.reduce(
            (sum, s) =>
              sum +
              (s.totalEmployees > 0 ? (s.responses / s.totalEmployees) * 100 : 0),
            0
          ) / surveys.length
        )
      : 0);

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
          
          {surveyLoadError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {surveyLoadError}
            </div>
          )}
          {loadingSurveys && (
            <div className="mb-4 text-sm text-gray-600">Loading surveys…</div>
          )}

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
              {/* View Stats and Client Survey are admin/HR only */}
              {canManageSurveys && (
                <>
                  <button
                    onClick={() => setShowStatsModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    View Stats
                  </button>

                  <button
                    onClick={() => handleClientSurvey()}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Client Survey
                  </button>
                </>
              )}

              {/* Create Survey — admin/HR only (already matches backend) */}
              {canManageSurveys && (
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
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(survey.status)}`}>
                        {survey.status}
                      </span>
                      {!canManageSurveys && (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCompletionColor(survey.completed)}`}>
                          {survey.completed ? "Completed" : "Pending"}
                        </span>
                      )}
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
                      {survey.completionRatePercent != null && survey.completionRatePercent !== undefined
                        ? `${survey.completionRatePercent}%`
                        : survey.totalEmployees > 0
                          ? `${Math.round((survey.responses / survey.totalEmployees) * 100)}%`
                          : "0%"}
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
                        {survey.dueDate
                          ? new Date(survey.dueDate).toLocaleDateString()
                          : "—"}
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
                    {!canManageSurveys && !survey.completed && (
                      <button
                        type="button"
                        onClick={() => handleStartSurvey(survey)}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors"
                      >
                        Start Survey
                      </button>
                    )}
                    {!canManageSurveys && survey.completed && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircleIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                    {canManageSurveys && (
                      <div className="flex flex-wrap gap-2">
                        {survey.status === "draft" && (
                          <button
                            type="button"
                            onClick={() => navigate(`/workplace/forms/${encodeURIComponent(survey.id)}/edit`)}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-md text-sm font-medium hover:bg-purple-200"
                          >
                            Edit form
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(`/workplace/forms/${encodeURIComponent(survey.id)}/insights`)}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-200"
                        >
                          Insights
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/workplace/forms/${encodeURIComponent(survey.id)}/fill`)}
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md text-sm font-medium hover:bg-indigo-200"
                        >
                          Preview
                        </button>
                        <span className="text-xs text-gray-500 self-center">Publish from editor when ready.</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {canManageSurveys && (
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
            {canManageSurveys && !searchTerm && filterStatus === "all" && (
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
      {showSurveyModal && currentSurvey && !showThankYou && activeQuestions.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentSurvey.title}</h2>
                <p className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {activeQuestions.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSurveyModal(false);
                  setActiveQuestions([]);
                  setAnswers({});
                  setCurrentQuestion(0);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestion + 1) / activeQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {activeQuestions[currentQuestion].question}
                {activeQuestions[currentQuestion].required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </h3>

              {activeQuestions[currentQuestion].type === "rating" && (
                <div className="flex items-center gap-4 flex-wrap">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      type="button"
                      key={rating}
                      onClick={() =>
                        handleAnswerChange(activeQuestions[currentQuestion].id, String(rating))
                      }
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold transition-all duration-200 ${
                        String(answers[activeQuestions[currentQuestion].id]) === String(rating)
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-indigo-300"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              )}

              {activeQuestions[currentQuestion].type === "multiple_choice" && (
                <div className="space-y-3">
                  {(activeQuestions[currentQuestion].options || []).map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${activeQuestions[currentQuestion].id}`}
                        value={option}
                        checked={answers[activeQuestions[currentQuestion].id] === option}
                        onChange={(e) =>
                          handleAnswerChange(activeQuestions[currentQuestion].id, e.target.value)
                        }
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {activeQuestions[currentQuestion].type === "text" && (
                <textarea
                  value={answers[activeQuestions[currentQuestion].id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(activeQuestions[currentQuestion].id, e.target.value)
                  }
                  placeholder={activeQuestions[currentQuestion].placeholder}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
              )}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentQuestion === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() => handleNextQuestion()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                {currentQuestion === activeQuestions.length - 1 ? "Submit" : "Next"}
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
      {showCreateModal && canManageSurveys && (
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
                          {loadingClients ? (
                            <div className="text-center py-4 text-gray-500">Loading clients...</div>
                          ) : clientsLoadError ? (
                            <div className="text-center py-4 text-red-600">{clientsLoadError}</div>
                          ) : filteredClients.length > 0 ? (
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
                type="button"
                disabled={savingSurvey}
                onClick={handleCreateSurvey}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingSurvey ? "Saving…" : "Create Survey"}
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

      {postCreateFormPrompt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setPostCreateFormPrompt(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2">Form created successfully</h2>
            <p className="text-gray-600 mb-4">
              Next step? The form is saved as <strong>Draft</strong>. Publish from the editor when it is ready.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="w-full py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                onClick={() => {
                  const id = postCreateFormPrompt.id;
                  setPostCreateFormPrompt(null);
                  navigate(`/workplace/forms/${encodeURIComponent(id)}/edit`);
                }}
              >
                Create Questions
              </button>
              <button
                type="button"
                className="w-full py-2 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50"
                onClick={() => {
                  const id = postCreateFormPrompt.id;
                  setPostCreateFormPrompt(null);
                  navigate(`/workplace/forms/${encodeURIComponent(id)}/fill`);
                }}
              >
                Preview Form
              </button>
              <button
                type="button"
                disabled
                className="w-full py-2 rounded-lg bg-gray-100 text-gray-400 font-medium cursor-not-allowed"
                title="Create a share link from the form editor (Phase 4)"
              >
                Share Form (after publish — share link in editor)
              </button>
              <button
                type="button"
                className="w-full py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setPostCreateFormPrompt(null)}
              >
                Stay here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && canManageSurveys && selectedSurveyForDelete && (
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