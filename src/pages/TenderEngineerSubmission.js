import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";

export default function TenderEngineerSubmission() {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    acceptanceStatus: 'accepted', // accepted, declined
    notes: '',
    documents: [],
  });

  useEffect(() => {
    if (!user || user.role !== 'TENDER_ENGINEER') {
      navigate('/login/tender-engineer', { replace: true });
      return;
    }

    loadTenderData();
  }, [tenderId, user, navigate]);

  const loadTenderData = () => {
    try {
      setLoading(true);
      
      // Load from localStorage (assigned tenders)
      const invitationsStr = localStorage.getItem('tenderInvitations');
      const projectsStr = localStorage.getItem('projectTasks');
      
      let invitations = [];
      let projects = [];
      
      if (invitationsStr) {
        invitations = JSON.parse(invitationsStr);
      }
      
      if (projectsStr) {
        projects = JSON.parse(projectsStr);
      }
      
      // Find the tender by ID or token
      const foundInvitation = invitations.find(inv => 
        inv.tenderId === tenderId || 
        inv.projectId === tenderId ||
        inv.token === tenderId ||
        inv.invitationToken === tenderId
      );
      
      if (foundInvitation) {
        // Find project data
        const project = projects.find(p => 
          p.id?.toString() === foundInvitation.projectId?.toString() ||
          p.referenceNumber === foundInvitation.projectReference
        );
        
        setTender({
          id: foundInvitation.tenderId || foundInvitation.projectId,
          name: project?.name || foundInvitation.tenderName || 'Unknown Project',
          client: project?.client || foundInvitation.client || 'N/A',
          referenceNumber: project?.referenceNumber || foundInvitation.referenceNumber || 'N/A',
          deadline: project?.timeline?.[0] || foundInvitation.deadline,
          status: foundInvitation.status || 'pending',
          invitation: foundInvitation,
          project: project,
        });
      } else {
        // Try to find by project ID
        const project = projects.find(p => 
          p.id?.toString() === tenderId || 
          p.referenceNumber === tenderId
        );
        
        if (project) {
          setTender({
            id: project.id,
            name: project.name || 'Unknown Project',
            client: project.client || 'N/A',
            referenceNumber: project.referenceNumber || 'N/A',
            deadline: project.timeline?.[0],
            status: 'pending',
            project: project,
          });
        } else {
          setError("Tender not found. Please check the tender ID.");
        }
      }
    } catch (err) {
      console.error('Error loading tender:', err);
      setError("Failed to load tender details.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Update invitation status in localStorage
      const invitationsStr = localStorage.getItem('tenderInvitations');
      if (invitationsStr) {
        const invitations = JSON.parse(invitationsStr);
        const invitationIndex = invitations.findIndex(inv => 
          inv.tenderId === tenderId || 
          inv.projectId === tenderId ||
          inv.token === tenderId
        );
        
        if (invitationIndex !== -1) {
          invitations[invitationIndex] = {
            ...invitations[invitationIndex],
            status: formData.acceptanceStatus,
            acceptedAt: formData.acceptanceStatus === 'accepted' ? new Date().toISOString() : null,
            notes: formData.notes,
            submittedDocuments: formData.documents.map(file => ({
              name: file.name,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString(),
            })),
          };
          
          localStorage.setItem('tenderInvitations', JSON.stringify(invitations));
        }
      }
      
      // TODO: Send to backend API
      // await submitTenderResponse(tenderId, formData);
      
      // Show success message
      alert(`Tender ${formData.acceptanceStatus === 'accepted' ? 'accepted' : 'declined'} successfully!`);
      
      // Redirect to dashboard
      navigate('/erp/tender/dashboard');
    } catch (err) {
      console.error('Error submitting tender:', err);
      alert('Failed to submit tender response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tender Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The tender you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate('/erp/tender/dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <button
            onClick={() => navigate('/erp/tender/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-4 transition"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="font-semibold">Back to Dashboard</span>
          </button>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Submit Tender Response
          </h1>
          <p className="text-slate-600">
            Review and submit your response for the assigned tender
          </p>
        </div>

        {/* Tender Details Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Tender Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{tender.name}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <BuildingOfficeIcon className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Client</p>
                  <p className="font-semibold text-slate-900">{tender.client}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <DocumentTextIcon className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Reference Number</p>
                  <p className="font-semibold text-slate-900">{tender.referenceNumber}</p>
                </div>
              </div>
              
              {tender.deadline && (
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Deadline</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(tender.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Your Response</h2>
          
          {/* Acceptance Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Response Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="acceptanceStatus"
                  value="accepted"
                  checked={formData.acceptanceStatus === 'accepted'}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptanceStatus: e.target.value }))}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="font-semibold text-green-700">Accept</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="acceptanceStatus"
                  value="declined"
                  checked={formData.acceptanceStatus === 'declined'}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptanceStatus: e.target.value }))}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="font-semibold text-red-700">Decline</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add any additional comments or notes..."
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload Documents (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <PaperClipIcon className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-indigo-600 font-semibold hover:text-indigo-700">
                  Click to upload
                </span>
                <span className="text-slate-600"> or drag and drop</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
              </label>
              <p className="text-xs text-slate-500 mt-2">
                PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB per file)
              </p>
            </div>
            
            {formData.documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5 text-slate-400" />
                      <span className="text-sm text-slate-700">{file.name}</span>
                      <span className="text-xs text-slate-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/erp/tender/dashboard')}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition ${
                formData.acceptanceStatus === 'accepted'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {submitting ? 'Submitting...' : formData.acceptanceStatus === 'accepted' ? 'Accept & Submit' : 'Decline & Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}





