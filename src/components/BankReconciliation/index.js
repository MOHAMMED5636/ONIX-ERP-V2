// Bank Reconciliation Module - Main Export File
import React, { useState } from 'react';
import { 
  BanknotesIcon, 
  ArrowPathIcon, 
  ChartBarIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import ConnectBankAccount from './ConnectBankAccount';
import ReconciliationInbox from './ReconciliationInbox';
import InvoicePageUpdates from './InvoicePageUpdates';
import AlertsNotifications from './AlertsNotifications';

// Export individual components
export { default as ConnectBankAccount } from './ConnectBankAccount';
export { default as ReconciliationInbox } from './ReconciliationInbox';
export { default as InvoicePageUpdates } from './InvoicePageUpdates';
export { default as AlertsNotifications } from './AlertsNotifications';

const BankReconciliationDashboard = () => {
  const [activeTab, setActiveTab] = useState('connect');

  const tabs = [
    { id: 'connect', name: 'Connect Bank', icon: ShieldCheckIcon },
    { id: 'inbox', name: 'Reconciliation Inbox', icon: BanknotesIcon },
    { id: 'invoices', name: 'Invoice Updates', icon: ChartBarIcon },
    { id: 'alerts', name: 'Alerts & Notifications', icon: BellIcon }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'connect':
        return <ConnectBankAccount />;
      case 'inbox':
        return <ReconciliationInbox />;
      case 'invoices':
        return <InvoicePageUpdates />;
      case 'alerts':
        return <AlertsNotifications />;
      default:
        return <ConnectBankAccount />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default BankReconciliationDashboard;
