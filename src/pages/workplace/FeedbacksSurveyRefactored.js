import React, { useState } from "react";
import { 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

// Import modular components
import SurveyCard from "./FeedbacksSurvey/components/SurveyCard";
import SurveyFilters from "./FeedbacksSurvey/components/SurveyFilters";
import CreateSurveyModal from "./FeedbacksSurvey/components/modals/CreateSurveyModal";
import SurveyStatsModal from "./FeedbacksSurvey/components/modals/SurveyStatsModal";
import DeleteConfirmationModal from "./FeedbacksSurvey/components/modals/DeleteConfirmationModal";

// Import constants and utilities
import {
  INITIAL_SURVEYS,
  INITIAL_EMPLOYEES,
  INITIAL_CLIENTS,
  DEFAULT_NEW_SURVEY,
  DEFAULT_NEW_QUESTION,
  DEFAULT_DELIVERY_OPTIONS
} from "./FeedbacksSurvey/constants";

import {
  filterSurveys,
  validateDeliveryOptions,
  generateSurveyLink,
  sendSurveyViaEmail,
  sendSurveyViaWhatsApp,
  createNewSurvey
} from "./FeedbacksSurvey/utils";

export default function FeedbacksSurvey() {
  // Main state
  const [surveys, setSurveys] = useState(INITIAL_SURVEYS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSurveyForDelete, setSelectedSurveyForDelete] = useState(null);

  // Form states
  const [newSurvey, setNewSurvey] = useState(DEFAULT_NEW_SURVEY);
  const [newQuestion, setNewQuestion] = useState(DEFAULT_NEW_QUESTION);
  const [deliveryOptions, setDeliveryOptions] = useState(DEFAULT_DELIVERY_OPTIONS);

  // Recipient states
  const [selectedEmployeeRecipients, setSelectedEmployeeRecipients] = useState([]);
  const [selectedClientRecipients, setSelectedClientRecipients] = useState([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");

  // Data
  const employees = INITIAL_EMPLOYEES;
  const clients = INITIAL_CLIENTS;

  // Computed values
  const filteredSurveys = filterSurveys(surveys, searchTerm, filterStatus);

  // Event handlers
  const handleCreateSurvey = async () => {
    const errors = validateDeliveryOptions(deliveryOptions, selectedEmployeeRecipients, selectedClientRecipients);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const survey = createNewSurvey(surveys, newSurvey.title, newSurvey.description, newSurvey.questions);
    setSurveys(prev => [survey, ...prev]);

    // Handle delivery if options are selected
    const hasEmployeeDelivery = deliveryOptions.employeeSendViaEmail || deliveryOptions.employeeSendViaWhatsApp;
    const hasClientDelivery = deliveryOptions.clientSendViaEmail || deliveryOptions.clientSendViaWhatsApp;
    
    if (hasEmployeeDelivery || hasClientDelivery) {
      const surveyLink = generateSurveyLink(survey.id);
      let deliveryResults = [];
      let deliverySummary = [];

      // Handle employee delivery
      if (hasEmployeeDelivery && selectedEmployeeRecipients.length > 0) {
        const selectedEmployeeDetails = employees.filter(employee => 
          selectedEmployeeRecipients.includes(employee.id)
        );

        if (deliveryOptions.employeeSendViaEmail) {
          const employeeEmails = selectedEmployeeDetails.map(employee => employee.email);
          for (const email of employeeEmails) {
            const emailResult = await sendSurveyViaEmail(surveyLink, email);
            deliveryResults.push(emailResult);
          }
          deliverySummary.push(`Email to ${selectedEmployeeDetails.length} employee(s)`);
        }

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

        if (deliveryOptions.clientSendViaEmail) {
          const clientEmails = selectedClientDetails.map(client => client.email);
          for (const email of clientEmails) {
            const emailResult = await sendSurveyViaEmail(surveyLink, email);
            deliveryResults.push(emailResult);
          }
          deliverySummary.push(`Email to ${selectedClientDetails.length} client(s)`);
        }

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
    setNewSurvey(DEFAULT_NEW_SURVEY);
    setDeliveryOptions(DEFAULT_DELIVERY_OPTIONS);
    setSelectedEmployeeRecipients([]);
    setSelectedClientRecipients([]);
    setEmployeeSearchTerm("");
    setClientSearchTerm("");
    setShowCreateModal(false);
  };

  const handleViewSurvey = (survey) => {
    // Handle view survey functionality
    console.log("View survey:", survey);
  };

  const handleDeleteSurvey = (survey) => {
    setSelectedSurveyForDelete(survey);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSurveyForDelete) {
      setSurveys(prev => prev.filter(s => s.id !== selectedSurveyForDelete.id));
      setShowDeleteModal(false);
      setSelectedSurveyForDelete(null);
    }
  };

  const handleStats = (survey) => {
    setShowStatsModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feedback & Surveys</h1>
              <p className="text-gray-600">Create and manage surveys to gather feedback from employees and clients</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                  <p className="text-2xl font-bold text-gray-900">{surveys.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Surveys</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {surveys.filter(s => s.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {surveys.reduce((sum, survey) => sum + survey.responses, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <SurveyFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          onCreateSurvey={() => setShowCreateModal(true)}
        />

        {/* Survey Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map(survey => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              onView={handleViewSurvey}
              onDelete={handleDeleteSurvey}
              onStats={handleStats}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredSurveys.length === 0 && (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first survey.'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Survey
              </button>
            )}
          </div>
        )}

        {/* Modals */}
        <CreateSurveyModal
          showCreateModal={showCreateModal}
          setShowCreateModal={setShowCreateModal}
          newSurvey={newSurvey}
          setNewSurvey={setNewSurvey}
          newQuestion={newQuestion}
          setNewQuestion={setNewQuestion}
          deliveryOptions={deliveryOptions}
          setDeliveryOptions={setDeliveryOptions}
          selectedEmployeeRecipients={selectedEmployeeRecipients}
          setSelectedEmployeeRecipients={setSelectedEmployeeRecipients}
          selectedClientRecipients={selectedClientRecipients}
          setSelectedClientRecipients={setSelectedClientRecipients}
          employees={employees}
          clients={clients}
          employeeSearchTerm={employeeSearchTerm}
          setEmployeeSearchTerm={setEmployeeSearchTerm}
          clientSearchTerm={clientSearchTerm}
          setClientSearchTerm={setClientSearchTerm}
          onCreateSurvey={handleCreateSurvey}
        />

        <SurveyStatsModal
          showStatsModal={showStatsModal}
          setShowStatsModal={setShowStatsModal}
          surveys={surveys}
        />

        <DeleteConfirmationModal
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          selectedSurveyForDelete={selectedSurveyForDelete}
          onDeleteSurvey={handleConfirmDelete}
        />
      </div>
    </div>
  );
}


