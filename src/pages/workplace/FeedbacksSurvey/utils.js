// Utility functions for FeedbacksSurvey module

/**
 * Generate a survey link for a given survey ID
 */
export function generateSurveyLink(surveyId) {
  return `${window.location.origin}/survey/${surveyId}`;
}

/**
 * Send survey via email
 */
export async function sendSurveyViaEmail(surveyLink, email) {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Survey sent via email to: ${email}`);
    return { success: true, method: 'email', recipient: email };
  } catch (error) {
    console.error('Error sending survey via email:', error);
    return { success: false, method: 'email', recipient: email, error: error.message };
  }
}

/**
 * Send survey via WhatsApp
 */
export async function sendSurveyViaWhatsApp(surveyLink, whatsapp) {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Survey sent via WhatsApp to: ${whatsapp}`);
    return { success: true, method: 'whatsapp', recipient: whatsapp };
  } catch (error) {
    console.error('Error sending survey via WhatsApp:', error);
    return { success: false, method: 'whatsapp', recipient: whatsapp, error: error.message };
  }
}

/**
 * Filter surveys based on search term and status
 */
export function filterSurveys(surveys, searchTerm, filterStatus) {
  return surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || survey.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });
}

/**
 * Calculate average completion rate
 */
export function calculateAverageCompletionRate(surveys) {
  if (surveys.length === 0) return 0;
  
  const totalRate = surveys.reduce((sum, survey) => {
    return sum + (survey.responses / survey.totalEmployees) * 100;
  }, 0);
  
  return Math.round(totalRate / surveys.length);
}

/**
 * Calculate total responses
 */
export function calculateTotalResponses(surveys) {
  return surveys.reduce((sum, survey) => sum + survey.responses, 0);
}

/**
 * Validate survey data
 */
export function validateSurvey(survey) {
  const errors = [];
  
  if (!survey.title.trim()) {
    errors.push("Survey title is required");
  }
  
  if (!survey.description.trim()) {
    errors.push("Survey description is required");
  }
  
  if (survey.questions.length === 0) {
    errors.push("At least one question is required");
  }
  
  return errors;
}

/**
 * Validate question data
 */
export function validateQuestion(question) {
  const errors = [];
  
  if (!question.question.trim()) {
    errors.push("Question text is required");
  }
  
  if (question.type === 'multiple_choice' && question.options.length < 2) {
    errors.push("Multiple choice questions require at least 2 options");
  }
  
  return errors;
}

/**
 * Create a new survey object
 */
export function createNewSurvey(surveys, title, description, questions) {
  return {
    id: Date.now(),
    title,
    description,
    questions: questions.length,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    responses: 0,
    totalEmployees: 60,
    status: "active",
    completed: false
  };
}

/**
 * Create a new question object
 */
export function createNewQuestion(question, type, options = [], placeholder = '') {
  return {
    id: Date.now(),
    question,
    type,
    options: type === 'multiple_choice' ? options.filter(opt => opt.trim()) : [],
    placeholder,
    required: true
  };
}

/**
 * Format survey statistics for display
 */
export function formatSurveyStats(surveys) {
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter(s => s.status === 'active').length;
  const completedSurveys = surveys.filter(s => s.status === 'completed').length;
  const totalResponses = calculateTotalResponses(surveys);
  const avgCompletionRate = calculateAverageCompletionRate(surveys);
  
  return {
    totalSurveys,
    activeSurveys,
    completedSurveys,
    totalResponses,
    avgCompletionRate
  };
}

/**
 * Get survey status color
 */
export function getSurveyStatusColor(status) {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'completed':
      return 'text-blue-600 bg-blue-100';
    case 'draft':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Get completion percentage for a survey
 */
export function getCompletionPercentage(survey) {
  return Math.round((survey.responses / survey.totalEmployees) * 100);
}

/**
 * Check if delivery options are valid
 */
export function validateDeliveryOptions(deliveryOptions, selectedEmployeeRecipients, selectedClientRecipients) {
  const errors = [];
  
  const hasEmployeeDelivery = deliveryOptions.employeeSendViaEmail || deliveryOptions.employeeSendViaWhatsApp;
  const hasClientDelivery = deliveryOptions.clientSendViaEmail || deliveryOptions.clientSendViaWhatsApp;
  
  if (hasEmployeeDelivery && selectedEmployeeRecipients.length === 0) {
    errors.push("Please select at least one employee when choosing employee delivery methods");
  }
  
  if (hasClientDelivery && selectedClientRecipients.length === 0) {
    errors.push("Please select at least one client when choosing client delivery methods");
  }
  
  return errors;
}



