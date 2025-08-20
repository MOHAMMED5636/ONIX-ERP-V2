import React from 'react';
import { 
  EyeIcon, 
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { getSurveyStatusColor, getCompletionPercentage } from '../utils';

const SurveyCard = ({ 
  survey, 
  onView, 
  onDelete, 
  onStats 
}) => {
  const completionPercentage = getCompletionPercentage(survey);
  const statusColor = getSurveyStatusColor(survey.status);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{survey.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{survey.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <ChartBarIcon className="w-4 h-4" />
              {survey.questions} questions
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              Due: {survey.dueDate}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {survey.status}
          </span>
          {survey.completed && (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Completion Rate</span>
          <span className="text-sm font-semibold text-gray-900">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {survey.responses} of {survey.totalEmployees} responses
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => onView(survey)}
            className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            <EyeIcon className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => onStats(survey)}
            className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
          >
            <ChartBarIcon className="w-4 h-4" />
            Stats
          </button>
        </div>
        
        <button
          onClick={() => onDelete(survey)}
          className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
        >
          <TrashIcon className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default SurveyCard;



