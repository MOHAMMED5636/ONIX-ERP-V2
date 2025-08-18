import React from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";
import { calculateAverageCompletionRate, calculateTotalResponses } from '../../utils';

const SurveyStatsModal = ({
  showStatsModal,
  setShowStatsModal,
  surveys
}) => {
  const averageCompletionRate = calculateAverageCompletionRate(surveys);
  const totalResponses = calculateTotalResponses(surveys);

  if (!showStatsModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Survey Statistics</h2>
          <button
            onClick={() => setShowStatsModal(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            <XMarkIcon className="w-6 h-6" />
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
              {surveys.map((survey) => {
                const completionRate = Math.round((survey.responses / survey.totalEmployees) * 100);
                return (
                  <div key={survey.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{survey.title}</p>
                      <p className="text-sm text-gray-600">{survey.responses} / {survey.totalEmployees} responses</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">
                        {completionRate}%
                      </p>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyStatsModal;


