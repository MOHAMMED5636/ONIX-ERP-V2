import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  BanknotesIcon,
  ArrowPathIcon,
  EyeIcon,
  LinkIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const InvoicePageUpdates = () => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showBankTransactionModal, setShowBankTransactionModal] = useState(false);

  const mockInvoices = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      client: 'ABC Construction LLC',
      amount: 15000,
      dueDate: '2024-01-20',
      status: 'paid',
      paymentStatus: 'reconciled',
      bankTransaction: {
        id: 'TXN-789123456',
        date: '2024-01-15',
        amount: 15000,
        reference: 'INV-2024-001',
        bank: 'FAB',
        account: '****1234'
      },
      paymentHistory: [
        {
          id: 1,
          date: '2024-01-15',
          amount: 15000,
          method: 'Bank Transfer',
          status: 'reconciled',
          bankTransaction: 'TXN-789123456'
        }
      ]
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      client: 'XYZ Engineering',
      amount: 8500,
      dueDate: '2024-01-18',
      status: 'paid',
      paymentStatus: 'reconciled',
      bankTransaction: {
        id: 'TXN-789123457',
        date: '2024-01-14',
        amount: 8500,
        reference: 'INV-2024-002',
        bank: 'ENBD',
        account: '****5678'
      },
      paymentHistory: [
        {
          id: 1,
          date: '2024-01-14',
          amount: 8500,
          method: 'Bank Transfer',
          status: 'reconciled',
          bankTransaction: 'TXN-789123457'
        }
      ]
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      client: 'DEF Contractors',
      amount: 5000,
      dueDate: '2024-01-25',
      status: 'partial',
      paymentStatus: 'pending',
      bankTransaction: null,
      paymentHistory: [
        {
          id: 1,
          date: '2024-01-13',
          amount: 2500,
          method: 'Bank Transfer',
          status: 'pending',
          bankTransaction: 'TXN-789123458'
        }
      ]
    },
    {
      id: 4,
      invoiceNumber: 'INV-2024-004',
      client: 'GHI Suppliers',
      amount: 12000,
      dueDate: '2024-01-22',
      status: 'overdue',
      paymentStatus: 'unmatched',
      bankTransaction: null,
      paymentHistory: []
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3" />
            Paid
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ExclamationTriangleIcon className="h-3 w-3" />
            Partial
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ClockIcon className="h-3 w-3" />
            Overdue
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status) => {
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
            <ClockIcon className="h-3 w-3" />
            Pending Match
          </span>
        );
      case 'unmatched':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationTriangleIcon className="h-3 w-3" />
            Unmatched
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'reconciled':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unmatched':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
              <p className="text-gray-600 mt-2">Track payments and bank reconciliation status</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ArrowPathIcon className="h-4 w-4" />
                Sync Payments
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <SparklesIcon className="h-4 w-4" />
                AI Auto-Match
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BanknotesIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reconciled</p>
                <p className="text-2xl font-bold text-green-600">18</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">4</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unmatched</p>
                <p className="text-2xl font-bold text-red-600">2</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      AED {invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(invoice.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.bankTransaction ? (
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowBankTransactionModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <LinkIcon className="h-4 w-4" />
                          View Transaction
                        </button>
                      ) : (
                        <span className="text-gray-400">No transaction</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {invoice.paymentStatus === 'pending' && (
                          <button className="text-green-600 hover:text-green-900">
                            <SparklesIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Detail Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Invoice Details - {selectedInvoice.invoiceNumber}
                  </h2>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Invoice Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice Number:</span>
                        <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Client:</span>
                        <span className="font-medium">{selectedInvoice.client}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">AED {selectedInvoice.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        {getStatusBadge(selectedInvoice.status)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status</h3>
                    <div className={`p-4 rounded-lg border-2 ${getPaymentStatusColor(selectedInvoice.paymentStatus)}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {getPaymentStatusBadge(selectedInvoice.paymentStatus)}
                      </div>
                      {selectedInvoice.bankTransaction && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Bank Transaction:</span> {selectedInvoice.bankTransaction.id}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Bank:</span> {selectedInvoice.bankTransaction.bank}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Account:</span> {selectedInvoice.bankTransaction.account}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
                  {selectedInvoice.paymentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {selectedInvoice.paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              AED {payment.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(payment.date).toLocaleDateString()} • {payment.method}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPaymentStatusBadge(payment.status)}
                            {payment.bankTransaction && (
                              <button className="text-blue-600 hover:text-blue-900 text-sm">
                                View Transaction
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No payments recorded</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  {selectedInvoice.paymentStatus === 'pending' && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <SparklesIcon className="h-4 w-4" />
                      AI Auto-Match
                    </button>
                  )}
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <LinkIcon className="h-4 w-4" />
                    Link Transaction
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <EyeIcon className="h-4 w-4" />
                    View Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank Transaction Modal */}
        {showBankTransactionModal && selectedInvoice?.bankTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Bank Transaction Details</h2>
                  <button
                    onClick={() => setShowBankTransactionModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInvoice.bankTransaction.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedInvoice.bankTransaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="mt-1 text-sm text-gray-900">
                      AED {selectedInvoice.bankTransaction.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reference</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInvoice.bankTransaction.reference}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInvoice.bankTransaction.bank}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedInvoice.bankTransaction.account}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-800">Transaction Reconciled</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    This transaction has been automatically matched and reconciled with invoice {selectedInvoice.invoiceNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePageUpdates;
