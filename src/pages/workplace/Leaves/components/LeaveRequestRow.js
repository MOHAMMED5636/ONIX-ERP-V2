import React from 'react';
import { 
  CalendarDaysIcon, 
  EyeIcon, 
  XMarkIcon, 
  TrashIcon 
} from "@heroicons/react/24/outline";
import { getStatusColor, getTypeColor, getStatusIcon } from '../utils';

const LeaveRequestRow = ({ 
  request, 
  onViewDetails, 
  onCancelRequest, 
  onDeleteRequest 
}) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
              <CalendarDaysIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {request.reason}
            </div>
            <div className="text-sm text-gray-500">
              {request.days} day{request.days > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(request.type)}`}>
          {request.type}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {new Date(request.fromDate).toLocaleDateString()} - {new Date(request.toDate).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
          {getStatusIcon(request.status)}
          <span className="ml-1 capitalize">{request.status}</span>
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(request.submittedDate).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(request)}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          {request.status === 'pending' && (
            <button
              onClick={() => onCancelRequest(request.id)}
              className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
              title="Cancel Request"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDeleteRequest(request)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Request"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default LeaveRequestRow;
