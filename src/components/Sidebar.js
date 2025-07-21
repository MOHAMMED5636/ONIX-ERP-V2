import React from "react";

export default function Sidebar() {
  return (
    <div className="w-16 lg:w-20 min-w-0 bg-white border-r border-gray-200 p-2 lg:p-4 h-full flex flex-col justify-start items-center space-y-4">
      {/* Logo/Home */}
      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm lg:text-base">
        ERP
      </div>
      
      {/* Navigation Icons */}
      <div className="flex flex-col space-y-2 flex-1">
        {/* Dashboard */}
        <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors group">
          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
          </svg>
        </button>
        
        {/* Users */}
        <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors group">
          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </button>
        
        {/* Chat - Active */}
        <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        
        {/* Calendar */}
        <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors group">
          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        
        {/* Documents */}
        <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors group">
          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
        
        {/* Analytics */}
        <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors group">
          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>
      
      {/* Settings */}
      <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors group">
        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
} 