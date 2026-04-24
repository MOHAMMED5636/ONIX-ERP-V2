import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContractsAPI from '../../services/contractsAPI';
import { ContractForm } from './CreateContract';

export default function EditContract() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await ContractsAPI.getContract(id);
        if (cancelled) return;
        if (res && (res.data || res.success)) {
          const c = res.data || res.contract || res;
          setContract(c);
        } else {
          setError('Contract not found');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load contract');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-600">Loading contract...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error || 'Contract not found'}</p>
        <button
          type="button"
          onClick={() => navigate('/contracts')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Contracts
        </button>
      </div>
    );
  }

  // Render the exact same form/UI/logic as Create, but prefilled and submitted as update.
  return <ContractForm mode="edit" contractId={id} initialContract={contract} />;
}
