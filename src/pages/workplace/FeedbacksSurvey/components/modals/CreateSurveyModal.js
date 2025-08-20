import React, { useState } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { QUESTION_TYPES, DEFAULT_NEW_QUESTION } from '../../constants';
import { validateSurvey, validateQuestion, createNewQuestion } from '../../utils';

const CreateSurveyModal = ({
  showCreateModal,
  setShowCreateModal,
  newSurvey,
  setNewSurvey,
  newQuestion,
  setNewQuestion,
  deliveryOptions,
  setDeliveryOptions,
  selectedEmployeeRecipients,
  setSelectedEmployeeRecipients,
  selectedClientRecipients,
  setSelectedClientRecipients,
  employees,
  clients,
  employeeSearchTerm,
  setEmployeeSearchTerm,
  clientSearchTerm,
  setClientSearchTerm,
  onCreateSurvey
}) => {
  const [activeTab, setActiveTab] = useState('details');

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) {
      alert("Please enter a question");
      return;
    }

    if (newQuestion.type === 'multiple_choice' && newQuestion.options.length < 2) {
      alert("Please add at least 2 options for multiple choice questions");
      return;
    }

    const question = createNewQuestion(
      newQuestion.question,
      newQuestion.type,
      newQuestion.options,
      newQuestion.placeholder
    );

    setNewSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, question]
    }));

    setNewQuestion(DEFAULT_NEW_QUESTION);
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

  const handleCreateSurvey = () => {
    const errors = validateSurvey(newSurvey);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    onCreateSurvey();
  };

  if (!showCreateModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create New Survey</h2>
          <button
            onClick={() => setShowCreateModal(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          {['details', 'questions', 'delivery'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Title *
              </label>
              <input
                type="text"
                value={newSurvey.title}
                onChange={(e) => setNewSurvey(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter survey description"
              />
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Existing Questions */}
            {newSurvey.questions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions ({newSurvey.questions.length})</h3>
                <div className="space-y-3">
                  {newSurvey.questions.map((question, index) => (
                    <div key={question.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{question.question}</h4>
                        <button
                          onClick={() => handleRemoveQuestion(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">Type: {question.type}</p>
                      {question.options.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Options:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {question.options.map((option, optIndex) => (
                              <li key={optIndex}>{option}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Question */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Question</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question *
                  </label>
                  <input
                    type="text"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your question"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type
                  </label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {QUESTION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {newQuestion.type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options *
                    </label>
                    <div className="space-y-2">
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Option ${index + 1}`}
                          />
                          {newQuestion.options.length > 1 && (
                            <button
                              onClick={() => handleRemoveOption(index)}
                              className="px-3 py-2 text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={handleAddOption}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add Option
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter placeholder text"
                    />
                  </div>
                )}

                <button
                  onClick={handleAddQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Question
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-6">
            {/* Employee Delivery */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Delivery</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={deliveryOptions.employeeSendViaEmail}
                      onChange={(e) => setDeliveryOptions(prev => ({ ...prev, employeeSendViaEmail: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Send via Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={deliveryOptions.employeeSendViaWhatsApp}
                      onChange={(e) => setDeliveryOptions(prev => ({ ...prev, employeeSendViaWhatsApp: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Send via WhatsApp</span>
                  </label>
                </div>

                {(deliveryOptions.employeeSendViaEmail || deliveryOptions.employeeSendViaWhatsApp) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Employees
                    </label>
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                      {employees
                        .filter(emp => emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()))
                        .map(employee => (
                          <label key={employee.id} className="flex items-center gap-2 p-2 hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={selectedEmployeeRecipients.includes(employee.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmployeeRecipients(prev => [...prev, employee.id]);
                                } else {
                                  setSelectedEmployeeRecipients(prev => prev.filter(id => id !== employee.id));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">{employee.name} ({employee.email})</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Client Delivery */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Delivery</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={deliveryOptions.clientSendViaEmail}
                      onChange={(e) => setDeliveryOptions(prev => ({ ...prev, clientSendViaEmail: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Send via Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={deliveryOptions.clientSendViaWhatsApp}
                      onChange={(e) => setDeliveryOptions(prev => ({ ...prev, clientSendViaWhatsApp: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Send via WhatsApp</span>
                  </label>
                </div>

                {(deliveryOptions.clientSendViaEmail || deliveryOptions.clientSendViaWhatsApp) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Clients
                    </label>
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                      {clients
                        .filter(client => client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()))
                        .map(client => (
                          <label key={client.id} className="flex items-center gap-2 p-2 hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={selectedClientRecipients.includes(client.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedClientRecipients(prev => [...prev, client.id]);
                                } else {
                                  setSelectedClientRecipients(prev => prev.filter(id => id !== client.id));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">{client.name} ({client.email})</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSurvey}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Survey
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSurveyModal;



