import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const ConnectBankAccount = () => {
  const [selectedBank, setSelectedBank] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [showOAuthModal, setShowOAuthModal] = useState(false);

  const uaeBanks = [
    { id: 'fab', name: 'First Abu Dhabi Bank (FAB)', logo: '🏦', color: 'bg-blue-600' },
    { id: 'enbd', name: 'Emirates NBD', logo: '🏛️', color: 'bg-green-600' },
    { id: 'adcb', name: 'Abu Dhabi Commercial Bank (ADCB)', logo: '🏢', color: 'bg-purple-600' }
  ];

  const handleConnectBank = () => {
    if (!selectedBank) return;
    setConnectionStatus('connecting');
    setShowOAuthModal(true);
    
    // Simulate OAuth process
    setTimeout(() => {
      setConnectionStatus('connected');
      setShowOAuthModal(false);
    }, 3000);
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'connecting':
        return <ArrowPathIcon className="h-6 w-6 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Bank Account Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Failed';
      default:
        return 'No Bank Account Connected';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'connecting':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <BanknotesIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bank Reconciliation</h1>
              <p className="text-gray-600">Connect your bank accounts for automated reconciliation</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connect Bank Account Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Connect Bank Account</h2>
              <p className="text-blue-100 text-sm">Secure OAuth connection to UAE banks</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Bank Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Your Bank
                </label>
                <div className="space-y-3">
                  {uaeBanks.map((bank) => (
                    <div
                      key={bank.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedBank === bank.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedBank(bank.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${bank.color} text-white text-lg`}>
                          {bank.logo}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{bank.name}</h3>
                          <p className="text-sm text-gray-500">Secure OAuth connection</p>
                        </div>
                        {selectedBank === bank.id && (
                          <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Features */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Bank-Grade Security</h4>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• OAuth 2.0 secure authentication</li>
                  <li>• Read-only access to transactions</li>
                  <li>• 256-bit SSL encryption</li>
                  <li>• UAE Central Bank compliant</li>
                </ul>
              </div>

              {/* Connect Button */}
              <button
                onClick={handleConnectBank}
                disabled={!selectedBank || connectionStatus === 'connecting'}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {connectionStatus === 'connecting' ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <BanknotesIcon className="h-5 w-5" />
                    Connect Bank Account
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status & Information Card */}
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h3>
              
              <div className={`p-4 rounded-xl border-2 ${getStatusColor()}`}>
                <div className="flex items-center gap-3">
                  {getStatusIcon()}
                  <div>
                    <h4 className="font-medium">{getStatusText()}</h4>
                    {connectionStatus === 'connected' && (
                      <p className="text-sm text-green-600 mt-1">
                        Last sync: 2 minutes ago
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {connectionStatus === 'connected' && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Account Number</span>
                    <span className="font-medium">****1234</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Account Type</span>
                    <span className="font-medium">Business Current</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Currency</span>
                    <span className="font-medium">AED</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reconciliation Overview</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <div className="text-sm text-green-700">Auto-Reconciled</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-600">23</div>
                  <div className="text-sm text-yellow-700">Pending Matches</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-2xl font-bold text-red-600">7</div>
                  <div className="text-sm text-red-700">Unmatched</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">186</div>
                  <div className="text-sm text-blue-700">Total Transactions</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Payment received</p>
                    <p className="text-xs text-green-600">AED 15,000 • 2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">Manual review needed</p>
                    <p className="text-xs text-yellow-600">AED 2,500 • 5 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <ArrowPathIcon className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">Bank sync completed</p>
                    <p className="text-xs text-blue-600">23 new transactions • 10 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OAuth Modal */}
        {showOAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Secure Bank Connection
                </h3>
                <p className="text-gray-600 mb-6">
                  You will be redirected to your bank's secure login page. 
                  This process is completely secure and encrypted.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  <span>Connecting to {uaeBanks.find(b => b.id === selectedBank)?.name}...</span>
                </div>
                <button
                  onClick={() => {
                    setShowOAuthModal(false);
                    setConnectionStatus('disconnected');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel Connection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectBankAccount;


