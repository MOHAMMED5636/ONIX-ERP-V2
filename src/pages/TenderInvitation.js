import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  EnvelopeIcon,
  CalendarIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { validateInvitationToken, getCurrentUser, isTenderEngineer, updateInvitationStatus, ROLES } from "../utils/auth";

export default function TenderInvitation() {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    const loadTenderData = async () => {
      try {
        setLoading(true);
        
        // Check if tenderId is a token (starts with 'inv_')
        const isToken = tenderId && tenderId.startsWith('inv_');
        let foundInvitation = null;
        
        if (isToken) {
          // Validate token
          foundInvitation = validateInvitationToken(tenderId);
          
          if (!foundInvitation) {
            setError("Invalid or expired invitation token.");
            setLoading(false);
            return;
          }
          
          setInvitation(foundInvitation);
          
          // Check if user is logged in
          const currentUser = getCurrentUser();
          const isEngineer = isTenderEngineer();
          
          if (!currentUser || !isEngineer) {
            // Redirect to login with return path
            setRequiresLogin(true);
            navigate("/login/tender-engineer", {
              state: { from: { pathname: `/tender/invitation/${tenderId}` } },
              replace: true
            });
            return;
          }
          
          // Verify engineer matches invitation
          const userEmail = currentUser.email?.toLowerCase();
          const invEmail = foundInvitation.engineerEmail?.toLowerCase();
          const invEngineerId = foundInvitation.engineerId;
          const userId = currentUser.id;
          
          if (invEmail && userEmail !== invEmail && invEngineerId !== userId) {
            setError("This invitation is not assigned to your account.");
            setLoading(false);
            return;
          }
        }
        
        // Load tender data from invitation or projectTasks
        let foundTender = null;
        
        if (foundInvitation) {
          // Get project from invitation
          const projectId = foundInvitation.projectId || foundInvitation.tenderId;
          const savedProjects = localStorage.getItem('projectTasks');
          
          if (savedProjects) {
            const projects = JSON.parse(savedProjects);
            foundTender = projects.find(project => 
              project.id?.toString() === projectId?.toString() ||
              project.referenceNumber === foundInvitation.projectReference
            );
          }
          
          // Use invitation tender data if available
          if (foundInvitation.tender) {
            foundTender = foundInvitation.tender;
          }
        } else {
          // Legacy: Load by ID
          const savedProjects = localStorage.getItem('projectTasks');
          if (savedProjects) {
            const projects = JSON.parse(savedProjects);
            foundTender = projects.find(project => 
              project.id?.toString() === tenderId || 
              project.referenceNumber === tenderId
            );
          }
        }
        
        // Check for saved tender data with form info
        const savedTenderData = localStorage.getItem(`tenderData_${tenderId}`);
        if (savedTenderData) {
          const tenderData = JSON.parse(savedTenderData);
          setTender(tenderData);
          setError(null);
        } else if (foundTender) {
          // Also check for form data
          const savedFormData = localStorage.getItem(`tenderFormData_${foundTender.id || tenderId}`);
          const formData = savedFormData ? JSON.parse(savedFormData) : null;
          
          // Map project data to tender format
          const tenderData = {
            id: foundTender.id || tenderId,
            name: foundTender.name || foundTender.projectName || 'Tender Project',
            referenceNumber: foundTender.referenceNumber || `REF-${tenderId}`,
            client: foundTender.client || 'Client',
            owner: foundTender.owner || foundTender.projectManager || '',
            description: foundTender.description || formData?.scopeOfWork || 'Please review all details and submit your technical documentation.',
            deadline: foundTender.deadline || foundTender.timeline?.[1] || formData?.bidSubmissionDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: foundTender.status === 'done' ? 'Completed' : foundTender.status === 'working' ? 'In Progress' : foundTender.status === 'pending' ? 'Open' : 'Open',
            // Include form data
            scopeOfWork: formData?.scopeOfWork || '',
            additionalNotes: formData?.additionalNotes || '',
            technicalDrawingsLink: formData?.technicalDrawingsLink || '',
            hasInvitationFees: formData?.hasInvitationFees || false,
            invitationFeeAmount: formData?.invitationFeeAmount || '',
            tenderAcceptanceDeadline: formData?.tenderAcceptanceDeadline || '',
            bidSubmissionDeadline: formData?.bidSubmissionDeadline || '',
          };
          
          setTender(tenderData);
          setError(null);
        } else {
          setError("Tender invitation not found. Please check the invitation link.");
        }
      } catch (err) {
        setError("Failed to load tender details. Please check the invitation link.");
        console.error("Error loading tender:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tenderId) {
      loadTenderData();
    } else {
      setError("Invalid tender invitation link.");
      setLoading(false);
    }
  }, [tenderId, navigate]);

  const handleAcceptInvitation = () => {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !isTenderEngineer()) {
      navigate("/login/tender-engineer", {
        state: { from: { pathname: `/tender/invitation/${tenderId}` } }
      });
      return;
    }
    
    // Update invitation status if token-based
    if (invitation && invitation.token) {
      updateInvitationStatus(invitation.token, 'accepted', currentUser.id);
    }
    
    // Navigate to technical submission
    navigate("/tender/technical-submission", {
      state: {
        tender,
        invitationId: tenderId,
        invitation: invitation,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/40 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tender invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="min-h-screen bg-slate-50/40 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-md text-center">
          <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Invalid Invitation
          </h2>
          <p className="text-slate-600 mb-6">
            {error || "This tender invitation link is invalid or has expired."}
          </p>
          <button
            onClick={() => navigate("/tender")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition"
          >
            Go to Tender Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/40 p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/tender")}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              title="Go back"
            >
              <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <EnvelopeIcon className="h-6 w-6 text-indigo-600" />
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                  Tender Invitation
                </p>
              </div>
              <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900">
                {tender.name}
              </h1>
            </div>
          </div>

          {/* Tender Info Card */}
          <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <BuildingOfficeIcon className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                    Client
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{tender.client}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DocumentTextIcon className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                    Reference Number
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{tender.referenceNumber}</p>
                </div>
              </div>
              {tender.bidSubmissionDeadline && (
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                      Bid Submission Deadline
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {new Date(tender.bidSubmissionDeadline).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
              {!tender.bidSubmissionDeadline && tender.deadline && (
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                      Submission Deadline
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {new Date(tender.deadline).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
              {tender.tenderAcceptanceDeadline && (
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                      Tender Acceptance Deadline
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {new Date(tender.tenderAcceptanceDeadline).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                    Status
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{tender.status}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tender Description */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Tender Details</h2>
          <div className="prose max-w-none">
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {tender.description}
            </p>
          </div>
        </section>

        {/* Instructions */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Next Steps</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Review Tender Details</h3>
                <p className="text-sm text-slate-600">
                  Carefully review all tender requirements, specifications, and deadlines.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Prepare Technical Submission</h3>
                <p className="text-sm text-slate-600">
                  Gather all required documents, technical specifications, and supporting materials.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Submit Your Response</h3>
                <p className="text-sm text-slate-600">
                  Click the button below to access the technical submission form and submit your bid.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() => {
                if (isTenderEngineer()) {
                  navigate("/erp/tender/dashboard");
                } else {
                  navigate("/tender");
                }
              }}
              className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              {isTenderEngineer() ? 'Back to Dashboard' : 'Back to Tender Page'}
            </button>
            <button
              onClick={handleAcceptInvitation}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-lg hover:shadow-xl transition flex items-center gap-2 font-semibold"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Accept Invitation & Submit Response
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}





