import React from 'react';
import { ComputerDesktopIcon } from '@heroicons/react/24/outline';

// Debug component to test IT Support visibility
const ITSupportDebug = () => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-red-500 text-white p-4 rounded-lg shadow-lg">
      <h3 className="font-bold">IT Support Debug</h3>
      <p>This should be visible if IT Support is working</p>
      <div className="flex items-center gap-2 mt-2">
        <ComputerDesktopIcon className="w-6 h-6" />
        <span>IT Support Icon</span>
      </div>
    </div>
  );
};

export default ITSupportDebug;



