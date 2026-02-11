import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import questionnaireAPI from '../../../services/questionnaireAPI';
import { useAuth } from '../../../contexts/AuthContext';

const QuestionnaireResponseModal = ({ 
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
  const [responses, setResponses] = useState({}); // questionId -> response data
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

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
      if (subtaskId) filters.subtaskId = subtaskId;

      const response = await questionnaireAPI.getQuestions(filters);
      if (response.success) {
        const questionsData = response.data || [];
        setQuestions(questionsData);

        // Load existing responses
        const responsesMap = {};
        for (const question of questionsData) {
          if (question.responses && question.responses.length > 0) {
            // Find current user's response
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
      if (subtaskId) filters.subtaskId = subtaskId;

      const response = await questionnaireAPI.getQuestionnaireStatus(filters);
      if (response.success) {
        setStatus(response.data);
      }
    } catch (err) {
      console.error('Error loading status:', err);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    if (!isManager) {
      // Employees can only answer if question is not locked
      const question = questions.find(q => q.id === questionId);
      if (question?.isLocked) {
        alert('This question is locked and cannot be answered.');
        return;
      }
    }

    setResponses({
      ...responses,
      [questionId]: {
        ...responses[questionId],
        answer,
      },
    });
  };

  const handleRemarksChange = (questionId, remarks) => {
    setResponses({
      ...responses,
      [questionId]: {
        ...responses[questionId],
        remarks,
      },
    });
  };

  const handleSubmitResponse = async (questionId) => {
    const responseData = responses[questionId];
    if (!responseData || !responseData.answer || responseData.answer === 'PENDING') {
      alert('Please select an answer');
      return;
    }

    setSaving(true);
    try {
      const response = await questionnaireAPI.submitResponse(questionId, {
        answer: responseData.answer,
        remarks: responseData.remarks || null,
      });

      if (response.success) {
        await loadQuestionsAndResponses();
        await loadStatus();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      alert(err.message || 'Failed to submit response');
    } finally {
      setSaving(false);
    }
  };

  const getAnswerLabel = (answer) => {
    const labels = {
      'ACTION_PLAN_APPLIED': 'Action Plan Applied',
      'NOT_AVAILABLE': 'Not Available',
      'NOT_APPLIED': 'Not Applied',
      'PENDING': 'Pending',
    };
    return labels[answer] || answer;
  };

  const getAnswerColor = (answer) => {
    const colors = {
      'ACTION_PLAN_APPLIED': 'bg-green-100 text-green-800 border-green-300',
      'NOT_AVAILABLE': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'NOT_APPLIED': 'bg-red-100 text-red-800 border-red-300',
      'PENDING': 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[answer] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Answer Questionnaire</h2>
            <p className="text-sm text-green-100 mt-1">
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

        {/* Status Banner */}
        {status && (
          <div className={`px-6 py-3 ${
            status.status === 'COMPLETED' 
              ? 'bg-green-50 border-b border-green-200' 
              : 'bg-yellow-50 border-b border-yellow-200'
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
                {status.answeredQuestions} / {status.totalQuestions} answered ({status.completionPercentage}%)
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
              <span className="ml-3 text-gray-600">Loading questions...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No questions available.</p>
              <p className="mt-2 text-sm">Managers need to create questions first.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => {
                const currentResponse = responses[question.id] || { answer: 'PENDING', remarks: '' };
                const isAnswered = currentResponse.answer && currentResponse.answer !== 'PENDING';
                const isLocked = question.isLocked || (currentResponse.isLocked && !isManager);

                return (
                  <div
                    key={question.id}
                    className={`border rounded-lg p-4 ${
                      isAnswered 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white'
                    } ${isLocked ? 'opacity-75' : ''}`}
                  >
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                        {question.isRequired && (
                          <span className="text-xs text-red-500">Required</span>
                        )}
                        {question.isLocked && (
                          <span className="text-xs text-orange-500">Locked</span>
                        )}
                        {isAnswered && (
                          <span className="text-xs text-green-600 font-medium">✓ Answered</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{question.questionText}</p>
                      {question.description && (
                        <p className="text-xs text-gray-500 mt-1">{question.description}</p>
                      )}
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-2 mb-3">
                      <label className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name={`answer-${question.id}`}
                          value="ACTION_PLAN_APPLIED"
                          checked={currentResponse.answer === 'ACTION_PLAN_APPLIED'}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          disabled={isLocked}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm">Action Plan Applied</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name={`answer-${question.id}`}
                          value="NOT_AVAILABLE"
                          checked={currentResponse.answer === 'NOT_AVAILABLE'}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          disabled={isLocked}
                          className="text-yellow-600 focus:ring-yellow-500"
                        />
                        <span className="text-sm">Not Available</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name={`answer-${question.id}`}
                          value="NOT_APPLIED"
                          checked={currentResponse.answer === 'NOT_APPLIED'}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          disabled={isLocked}
                          className="text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm">Not Applied</span>
                      </label>
                    </div>

                    {/* Remarks */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Remarks (Optional)
                      </label>
                      <textarea
                        value={currentResponse.remarks || ''}
                        onChange={(e) => handleRemarksChange(question.id, e.target.value)}
                        disabled={isLocked}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                        placeholder="Add remarks..."
                        rows={2}
                      />
                    </div>

                    {/* Submit Button */}
                    {!isLocked && (
                      <button
                        onClick={() => handleSubmitResponse(question.id)}
                        disabled={saving || !currentResponse.answer || currentResponse.answer === 'PENDING'}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : isAnswered ? 'Update Response' : 'Submit Answer'}
                      </button>
                    )}

                    {/* Show existing response if locked */}
                    {isLocked && isAnswered && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                        <span className="font-medium">Your Answer: </span>
                        <span className={`px-2 py-1 rounded border ${getAnswerColor(currentResponse.answer)}`}>
                          {getAnswerLabel(currentResponse.answer)}
                        </span>
                        {currentResponse.remarks && (
                          <div className="mt-2 text-gray-600">
                            <span className="font-medium">Remarks: </span>
                            {currentResponse.remarks}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {questions.length} question(s)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireResponseModal;
