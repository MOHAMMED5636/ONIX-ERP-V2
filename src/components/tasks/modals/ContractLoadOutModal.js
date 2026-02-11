import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ContractsAPI from '../../../services/contractsAPI';

const ContractLoadOutModal = ({ 
  open, 
  onClose, 
  onSuccess 
}) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOut, setLoadingOut] = useState(false);
  const [error, setError] = useState(null);
  const [selectedContracts, setSelectedContracts] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Load contracts when modal opens
  useEffect(() => {
    if (open) {
      loadContracts();
      setSelectedContracts(new Set());
      setSearchTerm('');
      setError(null);
    }
  }, [open]);

  const loadContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ContractsAPI.getContracts({
        limit: 1000, // Get all contracts
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      
      if (response.success) {
        // Handle both response formats: { data: { contracts: [...] } } or { data: [...] }
        const contractsList = response.data?.contracts || response.data || [];
        // Show all contracts - allow loading out the same contract multiple times
        setContracts(contractsList);
        console.log(`✅ Loaded ${contractsList.length} contracts for load-out`);
      } else {
        setError(response.message || 'Failed to load contracts');
      }
    } catch (err) {
      console.error('Error loading contracts:', err);
      setError(err.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (contractId) => {
    const newSelected = new Set(selectedContracts);
    if (newSelected.has(contractId)) {
      newSelected.delete(contractId);
    } else {
      newSelected.add(contractId);
    }
    setSelectedContracts(newSelected);
  };

  const handleSelectAll = () => {
    const filteredContracts = getFilteredContracts();
    if (selectedContracts.size === filteredContracts.length) {
      setSelectedContracts(new Set());
    } else {
      setSelectedContracts(new Set(filteredContracts.map(c => c.id)));
    }
  };

  const handleLoadOutSingle = async (contractId) => {
    setLoadingOut(true);
    setError(null);
    try {
      const response = await ContractsAPI.loadOutContract(contractId);
      
      if (response.success) {
        if (onSuccess) {
          onSuccess([response.data.project]);
        }
        onClose();
      } else {
        setError(response.message || 'Failed to load out contract');
      }
    } catch (err) {
      console.error('Error loading out contract:', err);
      setError(err.message || 'Failed to load out contract');
    } finally {
      setLoadingOut(false);
    }
  };

  const handleLoadOutMultiple = async () => {
    if (selectedContracts.size === 0) {
      setError('Please select at least one contract');
      return;
    }

    setLoadingOut(true);
    setError(null);
    try {
      const contractIds = Array.from(selectedContracts);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/contracts/bulk-load-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ contractIds }),
      });

      const result = await response.json();

      if (result.success || result.data?.totalSuccessful > 0) {
        // Reload contracts to refresh the list
        await loadContracts();
        
        // Show success message with details
        const successCount = result.data?.totalSuccessful || 0;
        const failCount = result.data?.totalFailed || 0;
        
        if (failCount === 0) {
          if (onSuccess && result.data?.successful) {
            // Note: We'd need to fetch the created projects, but for now just refresh
            onSuccess([]); // Empty array triggers refresh
          }
          onClose();
        } else {
          setError(`${successCount} project(s) created successfully. ${failCount} failed. Check console for details.`);
          // Still close modal if at least one succeeded
          if (successCount > 0) {
            setTimeout(() => {
              if (onSuccess) onSuccess([]);
              onClose();
            }, 2000);
          }
        }
      } else {
        setError(result.message || 'Failed to load out contracts');
      }
    } catch (err) {
      console.error('Error loading out contracts:', err);
      setError(err.message || 'Failed to load out contracts');
    } finally {
      setLoadingOut(false);
      setSelectedContracts(new Set());
    }
  };

  const getFilteredContracts = () => {
    if (!searchTerm.trim()) {
      return contracts;
    }
    const term = searchTerm.toLowerCase();
    return contracts.filter(contract => 
      contract.referenceNumber?.toLowerCase().includes(term) ||
      contract.title?.toLowerCase().includes(term) ||
      contract.contractCategory?.toLowerCase().includes(term) ||
      contract.client?.name?.toLowerCase().includes(term)
    );
  };

  const filteredContracts = getFilteredContracts();
  const allSelected = filteredContracts.length > 0 && selectedContracts.size === filteredContracts.length;

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Load Out Contracts to Projects</h2>
            <p className="text-sm text-blue-100 mt-1">
              Select contracts to create projects. Contracts can be loaded out multiple times.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            disabled={loadingOut}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search contracts by reference, title, category, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={loadContracts}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
              <span className="ml-4 text-gray-600">Loading contracts...</span>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium mb-2">
                {searchTerm ? 'No contracts found matching your search' : 'No available contracts'}
              </p>
              <p className="text-sm">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'No contracts found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[150px]">
                      Contract Reference
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contract Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContracts.map((contract) => {
                    const isSelected = selectedContracts.has(contract.id);
                    const isProcessing = loadingOut && isSelected;
                    
                    return (
                      <tr
                        key={contract.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(contract.id)}
                            disabled={loadingOut}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                              {contract.referenceNumber || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {contract.contractCategory || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {contract.title || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(contract.startDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(contract.endDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {contract.client?.name || contract.clientName || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {contract.project?.referenceNumber ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              {contract.project.referenceNumber}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleLoadOutSingle(contract.id)}
                            disabled={loadingOut}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto"
                          >
                            {isProcessing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                Loading...
                              </>
                            ) : (
                              'Load Out'
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {filteredContracts.length} contract(s) available
            {selectedContracts.size > 0 && (
              <span className="ml-2 font-medium text-blue-600">
                ({selectedContracts.size} selected)
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loadingOut}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleLoadOutMultiple}
              disabled={loadingOut || selectedContracts.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loadingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Loading Out...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Load Selected Contracts ({selectedContracts.size})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractLoadOutModal;
