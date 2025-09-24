import React, { useState } from 'react';
import { ComputerDesktopIcon } from '@heroicons/react/24/outline';
import ITSupportPanel from './ITSupportPanel';

const ITSupportSidebar = ({ collapsed, lang }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleOpenPanel = () => {
    console.log('IT Support panel opening...');
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    console.log('IT Support panel closing...');
    setIsPanelOpen(false);
  };

  return (
    <>
      {/* Sidebar Button - styled like other navigation items */}
      <button
        onClick={handleOpenPanel}
        className={`flex items-center justify-center w-full lg:w-12 h-12 rounded-xl transition text-indigo-500 mb-2 hover:bg-indigo-100 hover:scale-105 nav-pop ${collapsed ? "lg:flex-col" : "lg:flex-row lg:gap-2 lg:px-3"}`}
        title="IT Support"
        style={{ border: '2px solid red' }} // Debug border to make it visible
      >
        <ComputerDesktopIcon className="h-6 w-6" />
        {!collapsed && (
          <span className="text-sm font-medium lg:hidden">IT Support</span>
        )}
      </button>

      {/* IT Support Panel */}
      <ITSupportPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </>
  );
};

export default ITSupportSidebar;
