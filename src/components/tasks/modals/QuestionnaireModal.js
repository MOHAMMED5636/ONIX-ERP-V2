import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, LockClosedIcon, LockOpenIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import questionnaireAPI from '../../../services/questionnaireAPI';
import { useAuth } from '../../../contexts/AuthContext';

const QuestionnaireModal = ({ 
  open, 
  onClose, 
  projectId, 
  taskId, 
  subtaskId,
  onUpdate 
}) => {
  const { user } = useAuth();
  const isManager = ['ADMIN', 'PROJECT_MANAGER', 'HR'].includes(user?.role);
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState(null);
  const [error, setError] = useState(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [responses, setResponses] = useState({}); // questionId -> { answer, remarks }
  const [status, setStatus] = useState(null);
  const [viewMode, setViewMode] = useState('answers'); // 'answers' or 'responses' (for managers)
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'answered', 'pending'
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    description: '',
    isRequired: true,
    order: 0,
  });

  // Load questions and responses when modal opens
  useEffect(() => {
    if (open) {
      loadQuestionsAndResponses();
      loadStatus();
    }
  }, [open, projectId, taskId, subtaskId]);

  const loadQuestionsAndResponses = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (projectId) filters.projectId = projectId;
      if (taskId) filters.taskId = taskId;
      if (subtaskId) filters.subtaskId = String(subtaskId); // Convert to string

      const response = await questionnaireAPI.getQuestions(filters);
      if (response.success) {
        const questionsData = response.data || [];
        setQuestions(questionsData);

        // Load current user's responses
        const responsesMap = {};
        for (const question of questionsData) {
          if (question.responses && question.responses.length > 0) {
            const userResponse = question.responses.find(r => r.employee.id === user?.id);
            if (userResponse) {
              responsesMap[question.id] = {
                answer: userResponse.answer,
                remarks: userResponse.remarks || '',
              };
            }
          }
        }
        setResponses(responsesMap);
      }
    } catch (err) {
      console.error('Error loading questions:', err);
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const filters = {};
      if (projectId) filters.projectId = projectId;
      if (taskId) filters.taskId = taskId;
      if (subtaskId) filters.subtaskId = String(subtaskId);

      const response = await questionnaireAPI.getQuestionnaireStatus(filters);
      if (response.success) {
        setStatus(response.data);
      }
    } catch (err) {
      console.error('Error loading status:', err);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.questionText.trim()) {
      alert('Please enter a question');
      return;
    }

    const questionToAdd = {
      ...newQuestion,
      order: questions.length,
      projectId: projectId || null,
      taskId: taskId || null,
      subtaskId: subtaskId || null,
    };

    if (isManager) {
      // Managers can create directly
      createQuestion(questionToAdd);
    } else {
      alert('Only managers can create questions');
    }
  };

  const createQuestion = async (questionData) => {
    setSaving(true);
    try {
      const response = await questionnaireAPI.createQuestion(questionData);
      if (response.success) {
        setQuestions([...questions, response.data]);
        setNewQuestion({
          questionText: '',
          description: '',
          isRequired: true,
          order: questions.length + 1,
        });
        setShowAddQuestion(false);
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error creating question:', err);
      alert(err.message || 'Failed to create question');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateQuestion = async (questionId, updates) => {
    if (!isManager) {
      alert('Only managers can update questions');
      return;
    }

    setSaving(true);
    try {
      const response = await questionnaireAPI.updateQuestion(questionId, updates);
      if (response.success) {
        setQuestions(questions.map(q => 
          q.id === questionId ? { ...q, ...updates } : q
        ));
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error updating question:', err);
      alert(err.message || 'Failed to update question');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!isManager) {
      alert('Only managers can delete questions');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this question? This will also delete all responses.')) {
      return;
    }

    setSaving(true);
    try {
      const response = await questionnaireAPI.deleteQuestion(questionId);
      if (response.success) {
        setQuestions(questions.filter(q => q.id !== questionId));
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      alert(err.message || 'Failed to delete question');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLock = async (questionId, currentLockedState) => {
    if (!isManager) {
      alert('Only managers can lock/unlock questions');
      return;
    }

    await handleUpdateQuestion(questionId, { isLocked: !currentLockedState });
  };

  // Handle answer change for employees (inline)
  const handleAnswerChange = async (questionId, answer) => {
    if (isManager) return; // Managers don't answer questions

    const question = questions.find(q => q.id === questionId);
    if (question?.isLocked) {
      alert('This question is locked and cannot be answered.');
      return;
    }

    // Update local state immediately
    setResponses({
      ...responses,
      [questionId]: {
        ...responses[questionId],
        answer,
      },
    });

    // Auto-save to backend
    await saveResponse(questionId, answer, responses[questionId]?.remarks || '');
  };

  // Handle remarks change for employees (inline)
  const handleRemarksChange = (questionId, remarks) => {
    if (isManager) return; // Managers don't answer questions

    setResponses({
      ...responses,
      [questionId]: {
        ...responses[questionId],
        remarks,
      },
    });
  };

  // Save response to backend
  const saveResponse = async (questionId, answer, remarks) => {
    if (!answer || answer === 'PENDING') {
      return; // Don't save if no answer selected
    }

    setSavingQuestionId(questionId);
    try {
      const response = await questionnaireAPI.submitResponse(questionId, {
        answer,
        remarks: remarks || null,
      });

      if (response.success) {
        await loadQuestionsAndResponses();
        await loadStatus();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error saving response:', err);
      alert(err.message || 'Failed to save answer');
    } finally {
      setSavingQuestionId(null);
    }
  };

  // Handle remarks blur (save when user finishes typing)
  const handleRemarksBlur = async (questionId) => {
    const response = responses[questionId];
    if (response && response.answer && response.answer !== 'PENDING') {
      await saveResponse(questionId, response.answer, response.remarks || '');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Questionnaire / Checklist</h2>
            <p className="text-sm text-blue-100 mt-1">
              {projectId && 'Project'} {taskId && 'Task'} {subtaskId && 'Sub-Task'} Checklist
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
              <span className="ml-3 text-gray-600">Loading questions...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No questions yet.</p>
              {isManager && (
                <p className="mt-2 text-sm">Click "Add Question" to create a checklist question.</p>
              )}
            </div>
          ) : isManager && viewMode === 'responses' ? (
            // Manager view: Show all responses with filtering
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              {/* Filter Controls */}
              <div className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg flex-shrink-0">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Employee</label>
                  <input
                    type="text"
                    value={filterEmployee}
                    onChange={(e) => setFilterEmployee(e.target.value)}
                    placeholder="Search employee name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="w-48">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="all">All</option>
                    <option value="answered">Answered</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Responses Table */}
              <div className="overflow-x-auto overflow-y-auto flex-1">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Question</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Employee</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Applied</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">N/A</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Not Applied</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Remarks</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date/Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.flatMap((question) => {
                      const questionResponses = question.responses || [];
                      return questionResponses
                        .filter((resp) => {
                          if (filterEmployee) {
                            const empName = `${resp.employee.firstName} ${resp.employee.lastName}`.toLowerCase();
                            if (!empName.includes(filterEmployee.toLowerCase())) return false;
                          }
                          if (filterStatus === 'answered' && resp.answer === 'PENDING') return false;
                          if (filterStatus === 'pending' && resp.answer !== 'PENDING') return false;
                          return true;
                        })
                        .map((resp) => (
                          <tr key={resp.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{question.questionText}</td>
                            <td className="px-4 py-3 text-sm text-center">
                              {resp.employee.firstName} {resp.employee.lastName}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {resp.answer === 'ACTION_PLAN_APPLIED' ? (
                                <span className="text-green-600 font-bold">✓</span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {resp.answer === 'NOT_AVAILABLE' ? (
                                <span className="text-yellow-600 font-bold">✓</span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {resp.answer === 'NOT_APPLIED' ? (
                                <span className="text-red-600 font-bold">✓</span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{resp.remarks || '—'}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              {new Date(resp.answeredAt).toLocaleString()}
                            </td>
                          </tr>
                        ));
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Table view with inline answers for employees and question management for managers
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full border-collapse min-w-[800px]">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[200px]">Question</th>
                    {!isManager && (
                      <>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-20">Applied</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-20">N/A</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-24">Not Applied</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[150px]">Remarks</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-24">Status</th>
                      </>
                    )}
                    {isManager && (
                      <>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-32">Responses</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-32">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question, index) => {
                    const currentResponse = responses[question.id] || { answer: 'PENDING', remarks: '' };
                    const isAnswered = currentResponse.answer && currentResponse.answer !== 'PENDING';
                    const isLocked = question.isLocked;
                    const isSaving = savingQuestionId === question.id;

                    return (
                      <tr
                        key={question.id}
                        className={`border-b hover:bg-gray-50 transition-colors ${
                          !isManager && isAnswered ? 'bg-green-50' : ''
                        } ${isLocked && !isManager ? 'opacity-60' : ''}`}
                      >
                        {/* Question Column */}
                        <td className="px-4 py-3 min-w-[200px] max-w-[300px]">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-medium text-gray-500 mt-1 flex-shrink-0">Q{index + 1}</span>
                            <div className="flex-1 min-w-0">
                              {isManager ? (
                                <input
                                  type="text"
                                  value={question.questionText}
                                  onChange={(e) => handleUpdateQuestion(question.id, { questionText: e.target.value })}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter question..."
                                  disabled={isLocked}
                                />
                              ) : (
                                <div>
                                  <p className="text-sm font-medium text-gray-900 break-words">{question.questionText}</p>
                                  {question.description && (
                                    <p className="text-xs text-gray-500 mt-1 break-words">{question.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {question.isRequired && (
                                      <span className="text-xs text-red-500">Required</span>
                                    )}
                                    {isLocked && (
                                      <span className="text-xs text-orange-500">Locked</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Employee Answer Columns */}
                        {!isManager && (
                          <>
                            {/* Applied Column */}
                            <td className="px-4 py-3 text-center">
                              <input
                                type="radio"
                                name={`answer-${question.id}`}
                                checked={currentResponse.answer === 'ACTION_PLAN_APPLIED'}
                                onChange={() => handleAnswerChange(question.id, 'ACTION_PLAN_APPLIED')}
                                disabled={isLocked || isSaving}
                                className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>

                            {/* N/A Column */}
                            <td className="px-4 py-3 text-center">
                              <input
                                type="radio"
                                name={`answer-${question.id}`}
                                checked={currentResponse.answer === 'NOT_AVAILABLE'}
                                onChange={() => handleAnswerChange(question.id, 'NOT_AVAILABLE')}
                                disabled={isLocked || isSaving}
                                className="w-5 h-5 text-yellow-600 focus:ring-yellow-500 cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>

                            {/* Not Applied Column */}
                            <td className="px-4 py-3 text-center">
                              <input
                                type="radio"
                                name={`answer-${question.id}`}
                                checked={currentResponse.answer === 'NOT_APPLIED'}
                                onChange={() => handleAnswerChange(question.id, 'NOT_APPLIED')}
                                disabled={isLocked || isSaving}
                                className="w-5 h-5 text-red-600 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed"
                              />
                            </td>

                            {/* Remarks Column */}
                            <td className="px-4 py-3 min-w-[150px] max-w-[250px]">
                              <input
                                type="text"
                                value={currentResponse.remarks || ''}
                                onChange={(e) => handleRemarksChange(question.id, e.target.value)}
                                onBlur={() => handleRemarksBlur(question.id)}
                                disabled={isLocked || isSaving}
                                placeholder="Add remarks..."
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                              />
                            </td>

                            {/* Status Column */}
                            <td className="px-4 py-3 text-center">
                              {isSaving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mx-auto" />
                              ) : isAnswered ? (
                                <span className="text-xs text-green-600 font-medium">✓ Answered</span>
                              ) : (
                                <span className="text-xs text-gray-400">Pending</span>
                              )}
                            </td>
                          </>
                        )}

                        {/* Manager Columns */}
                        {isManager && (
                          <>
                            {/* Response Count Column */}
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm text-gray-600">
                                {question.responses?.length || 0} response(s)
                              </span>
                            </td>

                            {/* Actions Column */}
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleToggleLock(question.id, question.isLocked)}
                                  className="p-1.5 text-gray-600 hover:text-orange-600 transition-colors"
                                  title={question.isLocked ? 'Unlock question' : 'Lock question'}
                                >
                                  {question.isLocked ? (
                                    <LockClosedIcon className="w-4 h-4" />
                                  ) : (
                                    <LockOpenIcon className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteQuestion(question.id)}
                                  className="p-1.5 text-red-600 hover:text-red-800 transition-colors"
                                  title="Delete question"
                                  disabled={question.isLocked}
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Question Form */}
          {isManager && showAddQuestion && (
            <div className="mt-6 border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Question</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter question text..."
                />
                <textarea
                  value={newQuestion.description}
                  onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description (optional)"
                  rows={2}
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newQuestion.isRequired}
                      onChange={(e) => setNewQuestion({ ...newQuestion, isRequired: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Required
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddQuestion}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Add Question'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddQuestion(false);
                        setNewQuestion({
                          questionText: '',
                          description: '',
                          isRequired: true,
                          order: questions.length,
                        });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Banner (for employees) */}
        {!isManager && status && (
          <div className={`px-6 py-3 border-t ${
            status.status === 'COMPLETED' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {status.status === 'COMPLETED' ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <ClockIcon className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`text-sm font-medium ${
                  status.status === 'COMPLETED' ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  Status: {status.status}
                </span>
              </div>
              <span className="text-xs text-gray-600">
                {status.answeredQuestions || 0} / {status.totalQuestions || questions.length} answered ({status.completionPercentage || 0}%)
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {questions.length} question(s)
            </div>
            {isManager && (
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('answers')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'answers' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Manage Questions
                </button>
                <button
                  onClick={() => setViewMode('responses')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'responses' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  View Responses
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {isManager && !showAddQuestion && viewMode === 'answers' && (
              <button
                onClick={() => setShowAddQuestion(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Add Question
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireModal;
