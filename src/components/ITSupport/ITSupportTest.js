import React from 'react';
import { ITSupportSidebar } from './index';

// Test component to verify IT Support sidebar integration
const ITSupportTest = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">IT Support Integration Test</h2>
      <p className="mb-4">This component tests the IT Support sidebar integration:</p>
      
      {/* Test the sidebar component */}
      <div className="border border-gray-300 rounded-lg p-4">
        <h3 className="font-semibold mb-2">IT Support Sidebar Button:</h3>
        <ITSupportSidebar collapsed={false} lang="en" />
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Expected behavior:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Button should appear with ComputerDesktopIcon</li>
          <li>Button should show "IT Support" text when not collapsed</li>
          <li>Clicking should open the IT Support panel</li>
          <li>Panel should slide in from the right side</li>
        </ul>
      </div>
    </div>
  );
};

export default ITSupportTest;





