import React from 'react';
import { 
  ClipboardDocumentIcon, 
  ClipboardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const CopyPasteDemo = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
        <ClipboardDocumentIcon className="w-5 h-5" />
        Copy-Paste Feature Guide
      </h3>
      
      <div className="space-y-3 text-sm text-blue-700">
        <div className="flex items-start gap-2">
          <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <strong>✅ Valid Copy Operations:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Select parent tasks only (with subtasks)</li>
              <li>• Multiple parent tasks can be selected together</li>
              <li>• All child tasks are automatically included</li>
            </ul>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <strong>❌ Invalid Copy Operations:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Cannot copy child tasks independently</li>
              <li>• Cannot copy subtasks without their parent</li>
              <li>• Cannot copy mixed parent/child selections</li>
            </ul>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <ClipboardIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <strong>📋 How to Use:</strong>
            <ol className="ml-4 mt-1 space-y-1">
              <li>1. Select parent task(s) using checkboxes</li>
              <li>2. Click "Copy" button in bulk action bar</li>
              <li>3. Navigate to target project</li>
              <li>4. Click "Paste" button and select target project</li>
              <li>5. Tasks are pasted with new IDs and preserved hierarchy</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyPasteDemo;
