import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ReconciliationInbox = () => {
  const [activeTab, setActiveTab] = useState('auto-reconciled');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const tabs = [
    { id: 'auto-reconciled', name: 'Auto-Reconciled', count: 156, icon: CheckCircleIcon, color: 'green' },
    { id: 'pending-matches', name: 'Pending Matches', count: 23, icon: ExclamationTriangleIcon, color: 'yellow' },
    { id: 'unmatched', name: 'Unmatched', count: 7, icon: XCircleIcon, color: 'red' }
  ];

  const mockTransactions = {
    'auto-reconciled': [
      {
        id: 1,
        date: '2024-01-15',
        amount: 15000,
        reference: 'INV-2024-001',
        sender: 'ABC Construction LLC',
        invoiceNumber: 'INV-2024-001',
        status: 'reconciled',
        confidence: 95,
        bankTransaction: 'TXN-789123456'
      },
      {
        id: 2,
        date: '2024-01-14',
        amount: 8500,
        reference: 'INV-2024-002',
        sender: 'XYZ Engineering',
        invoiceNumber: 'INV-2024-002',
        status: 'reconciled',
        confidence: 98,
        bankTransaction: 'TXN-789123457'
      }
    ],
    'pending-matches': [
      {
        id: 3,
        date: '2024-01-13',
        amount: 2500,
        reference: 'Partial Payment',
        sender: 'DEF Contractors',
        invoiceNumber: 'INV-2024-003',
        status: 'pending',
        confidence: 75,
        bankTransaction: 'TXN-789123458',
        aiSuggestions: [
          { invoice: 'INV-2024-003', confidence: 75, reason: 'Amount matches 50% of invoice' },
          { invoice: 'INV-2024-004', confidence: 60, reason: 'Similar amount and date' }
        ]
      },
      {
        id: 4,
        date: '2024-01-12',
        amount: 12000,
        reference: 'Payment Ref: 12345',
        sender: 'GHI Suppliers',
        invoiceNumber: null,
        status: 'pending',
        confidence: 80,
        bankTransaction: 'TXN-789123459',
        aiSuggestions: [
          { invoice: 'INV-2024-005', confidence: 80, reason: 'Amount and date match' },
          { invoice: 'INV-2024-006', confidence: 65, reason: 'Similar amount' }
        ]
      }
    ],
    'unmatched': [
      {
        id: 5,
        date: '2024-01-11',
        amount: 500,
        reference: 'Bank Charges',
        sender: 'Bank Fee',
        invoiceNumber: null,
        status: 'unmatched',
        confidence: 0,
        bankTransaction: 'TXN-789123460'
      },
      {
        id: 6,
        date: '2024-01-10',
        amount: 3000,
        reference: 'Unknown Payment',
        sender: 'Unknown Sender',
        invoiceNumber: null,
        status: 'unmatched',
        confidence: 0,
        bankTransaction: 'TXN-789123461'
      }
    ]
  };

  const getStatusBadge = (status, confidence) => {
    switch (status) {
      case 'reconciled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3" />
            Reconciled
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ExclamationTriangleIcon className="h-3 w-3" />
            Pending ({confidence}%)
          </span>
        );
      case 'unmatched':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3" />
            Unmatched
          </span>
        );
      default:
        return null;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk ${action} for transactions:`, selectedTransactions);
    setSelectedTransactions([]);
  };

  const currentTransactions = mockTransactions[activeTab] || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bank Reconciliation Inbox</h1>
              <p className="text-gray-600 mt-2">Review and match bank transactions with invoices</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ArrowPathIcon className="h-4 w-4" />
                Sync Bank
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <SparklesIcon className="h-4 w-4" />
                AI Auto-Match
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
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
                    <Icon className={`h-4 w-4 ${
                      tab.color === 'green' ? 'text-green-500' :
                      tab.color === 'yellow' ? 'text-yellow-500' :
                      'text-red-500'
                    }`} />
                    {tab.name}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tab.color === 'green' ? 'bg-green-100 text-green-800' :
                      tab.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="h-4 w-4" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>All amounts</option>
                      <option>Under AED 1,000</option>
                      <option>AED 1,000 - 10,000</option>
                      <option>Over AED 10,000</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confidence</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>All confidence levels</option>
                      <option>High (90%+)</option>
                      <option>Medium (70-89%)</option>
                      <option>Low (Under 70%)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedTransactions.length > 0 && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  {selectedTransactions.length} transaction(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction('reconcile')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Reconcile Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('ignore')}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Ignore Selected
                  </button>
                  <button
                    onClick={() => setSelectedTransactions([])}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTransactions(currentTransactions.map(t => t.id));
                        } else {
                          setSelectedTransactions([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(transaction.id)}
                        onChange={() => handleSelectTransaction(transaction.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      AED {transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.sender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.invoiceNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status, transaction.confidence)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900">
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Suggestions Modal for Pending Matches */}
        {activeTab === 'pending-matches' && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-purple-600" />
              AI Suggestions for Pending Matches
            </h3>
            
            <div className="space-y-4">
              {currentTransactions
                .filter(t => t.aiSuggestions)
                .map(transaction => (
                  <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Transaction: {transaction.reference}
                        </h4>
                        <p className="text-sm text-gray-600">
                          AED {transaction.amount.toLocaleString()} • {transaction.sender}
                        </p>
                      </div>
                      <span className={`text-sm font-medium ${getConfidenceColor(transaction.confidence)}`}>
                        {transaction.confidence}% confidence
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {transaction.aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{suggestion.invoice}</p>
                            <p className="text-sm text-gray-600">{suggestion.reason}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                              {suggestion.confidence}%
                            </span>
                            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                              Match
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {currentTransactions.length} of {currentTransactions.length} transactions
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationInbox;

