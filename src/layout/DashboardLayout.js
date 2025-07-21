import React from "react";
// import Sidebar from "./Sidebar"; // Remove Sidebar import

export default function DashboardLayout({ children }) {
  // Remove sidebar state and logic
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 relative">
        {/* Remove Sidebar rendering here */}
        {/* Main content: margin-left on md+, full width on mobile */}
        <main className="flex-1 w-full px-2 md:px-6 transition-all duration-300 md:ml-16 lg:ml-20 xl:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
} 