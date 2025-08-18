import React from 'react';
import { 
  EyeIcon, 
  ArrowDownTrayIcon, 
  TrashIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { getStatusColor, getFileTypeColor } from '../utils';

const PolicyCard = ({ 
  policy, 
  onView, 
  onDownload, 
  onDelete, 
  onAcknowledge 
}) => {

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {policy.title}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFileTypeColor(policy.fileType)}`}>
                {policy.fileType}
              </span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {policy.department}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(policy.status)}`}>
                {policy.status === 'acknowledged' ? 'Acknowledged' : 'Pending'}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{policy.description}</p>
          </div>
        </div>
        
        {/* Policy Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-bold text-gray-900">{policy.fileSize}</p>
            <p className="text-xs text-gray-600">File Size</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-bold text-gray-900">{policy.lastUpdated}</p>
            <p className="text-xs text-gray-600">Last Updated</p>
          </div>
        </div>
        
        {/* Acknowledgment Status */}
        {policy.status === 'acknowledged' && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Acknowledged On</p>
                <p className="text-sm font-semibold text-gray-900">{policy.acknowledgedAt}</p>
              </div>
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        )}
      </div>
      
      {/* Card Body */}
      <div className="p-6">
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onView(policy)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Policy"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onDownload(policy)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Download Policy"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onDelete(policy)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Policy"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {policy.status === 'pending' && (
              <button 
                onClick={() => onAcknowledge(policy.id)}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors"
              >
                Acknowledge
              </button>
            )}
            {policy.status === 'acknowledged' && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Acknowledged</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;
