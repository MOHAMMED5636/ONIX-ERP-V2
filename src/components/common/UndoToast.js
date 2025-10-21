import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ArrowUturnLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const UndoToast = ({ 
  isVisible, 
  onUndo, 
  onDismiss, 
  message = "Item deleted",
  itemType = "item",
  count = 1,
  duration = 5000 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, onDismiss]);

  useEffect(() => {
    if (isVisible) {
      setTimeLeft(duration / 1000);
    }
  }, [isVisible, duration]);

  if (!isVisible) return null;

  const progressPercentage = (timeLeft / (duration / 1000)) * 100;
  const displayMessage = count > 1 
    ? `${count} ${itemType}s deleted` 
    : `${itemType} deleted`;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 animate-slide-up"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-orange-100 rounded-full">
              <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {displayMessage}
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-3">
          {message}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1 mb-3">
          <div 
            className={`h-1 rounded-full transition-all duration-1000 ${
              isHovered ? 'bg-orange-400' : 'bg-orange-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            <ArrowUturnLeftIcon className="h-4 w-4" />
            Undo
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            Dismiss
          </button>
        </div>

        {/* Time indicator */}
        <div className="text-xs text-gray-500 mt-2 text-center">
          {isHovered ? 'Paused' : `${Math.ceil(timeLeft)}s remaining`}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UndoToast;

