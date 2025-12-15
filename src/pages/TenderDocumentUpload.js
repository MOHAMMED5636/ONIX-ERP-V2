import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
  PaperClipIcon,
  CalendarIcon,
  LinkIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { sendTenderInvitations } from "../services/tenderAPI";

export default function TenderDocumentUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tender = location.state?.tender || null;
  const contractors = location.state?.contractors || [];
  const uploadedDocuments = location.state?.uploadedDocuments || [];
  const formData = location.state?.formData || {};

  const [documents, setDocuments] = useState(uploadedDocuments);
  
  // Additional form fields state
  const [attachmentFile, setAttachmentFile] = useState(formData.attachmentFile || null);
  const [technicalDrawingsLink, setTechnicalDrawingsLink] = useState(formData.technicalDrawingsLink || "");
  const [hasInvitationFees, setHasInvitationFees] = useState(formData.hasInvitationFees || false);
  const [invitationFeeAmount, setInvitationFeeAmount] = useState(formData.invitationFeeAmount || "");
  const [tenderAcceptanceDeadline, setTenderAcceptanceDeadline] = useState(formData.tenderAcceptanceDeadline || "");
  const [bidSubmissionDeadline, setBidSubmissionDeadline] = useState(formData.bidSubmissionDeadline || "");
  const [scopeOfWork, setScopeOfWork] = useState(formData.scopeOfWork || "");
  const [additionalNotes, setAdditionalNotes] = useState(formData.additionalNotes || "");
  const [isSending, setIsSending] = useState(false);

  const handleBack = () => {
    navigate("/tender/confirmation", {
      state: {
        tender,
        contractors,
        uploadedDocuments: documents,
        formData: {
          attachmentFile,
          technicalDrawingsLink,
          hasInvitationFees,
          invitationFeeAmount,
          tenderAcceptanceDeadline,
          bidSubmissionDeadline,
          scopeOfWork,
          additionalNotes,
        },
      },
    });
  };



  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAttachmentFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxSize) {
        alert(`File size exceeds 5 MB limit. Please select a smaller file.`);
        e.target.value = '';
        return;
      }
      setAttachmentFile(file);
    }
  };

  const removeAttachmentFile = () => {
    setAttachmentFile(null);
  };

  const handleSendInvitation = async () => {
    if (!tender || contractors.length === 0) {
      alert("Please ensure tender and contractor information is available.");
      return;
    }

    // Validate required fields
    if (!attachmentFile) {
      alert("Please upload an attachment before sending the invitation.");
      return;
    }

    setIsSending(true);

    try {
      // Prepare contractor data with form information
      const contractorData = await Promise.all(
        contractors.map(async (contractor) => {
          let attachmentData = null;

          // Process attachment file if available
          if (attachmentFile instanceof File) {
            attachmentData = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                console.log(`✓ Converted attachment for ${contractor.name}: ${attachmentFile.name}`);
                resolve({
                  name: attachmentFile.name,
                  type: attachmentFile.type,
                  size: attachmentFile.size,
                  data: e.target.result, // base64 data URL
                });
              };
              reader.onerror = (error) => {
                console.error(`✗ Error reading file for ${contractor.name}:`, error);
                reject(error);
              };
              reader.readAsDataURL(attachmentFile);
            });
          }

          return {
            id: contractor.id,
            name: contractor.name,
            email: contractor.email || contractor.contactEmail || '',
            specialty: contractor.specialty || '',
            invitationLetter: attachmentData, // Use attachment as invitation letter
          };
        })
      );

      // Prepare tender data with all form information
      const tenderDataWithFormInfo = {
        ...tender,
        technicalDrawingsLink,
        hasInvitationFees,
        invitationFeeAmount,
        tenderAcceptanceDeadline,
        bidSubmissionDeadline,
        scopeOfWork,
        additionalNotes,
      };

      // Show loading state
      const loadingMessage = `Sending tender invitations to ${contractors.length} contractor(s)...`;
      console.log(loadingMessage);

      // Send tender invitations
      const result = await sendTenderInvitations(tenderDataWithFormInfo, contractorData);
      
      if (result.success) {
        const attachmentInfo = result.attachmentsIncluded 
          ? `\n✓ Attachments included: ${result.attachmentCount} file(s)`
          : '\n⚠ No attachments were included';
        
        alert(
          `✓ Tender invitations sent successfully!\n\n` +
          `Tender: ${tender.name}\n` +
          `Client: ${tender.client}\n` +
          `Sent to: ${result.sentCount} contractor(s)${attachmentInfo}\n\n` +
          `Tender Link: ${result.tenderLink}\n\n` +
          `All selected contractors have been notified via email.`
        );

        // Navigate to Technical Submission after successful send
        navigate("/tender/technical-submission", {
          state: {
            tender: tenderDataWithFormInfo,
            contractors,
            uploadedDocuments: documents,
            formData: {
              attachmentFile,
              technicalDrawingsLink,
              hasInvitationFees,
              invitationFeeAmount,
              tenderAcceptanceDeadline,
              bidSubmissionDeadline,
              scopeOfWork,
              additionalNotes,
            },
            invitationsSent: true,
          },
        });
      } else if (result.fallback) {
        const contractorList = contractors.map(c => `  • ${c.name} (${c.email || 'No email'})`).join('\n');
        const userChoice = window.confirm(
          `⚠ Email API is not available. Would you like to send invitations manually?\n\n` +
          `Selected Contractors:\n${contractorList}\n\n` +
          `Tender Link: ${result.tenderLink}\n\n` +
          `Click OK to open email clients, or Cancel to copy the link.`
        );
        
        if (userChoice) {
          result.mailtoLinks.forEach((link, index) => {
            setTimeout(() => {
              window.location.href = link.mailto;
            }, index * 500);
          });
        } else {
          navigator.clipboard.writeText(result.tenderLink).then(() => {
            alert(
              `Tender link copied to clipboard!\n\n` +
              `Link: ${result.tenderLink}\n\n` +
              `You can share this link with the selected contractors manually.`
            );
          });
        }

        // Still navigate to Technical Submission even with fallback
        navigate("/tender/technical-submission", {
          state: {
            tender: tenderDataWithFormInfo,
            contractors,
            uploadedDocuments: documents,
            formData: {
              attachmentFile,
              technicalDrawingsLink,
              hasInvitationFees,
              invitationFeeAmount,
              tenderAcceptanceDeadline,
              bidSubmissionDeadline,
              scopeOfWork,
              additionalNotes,
            },
            invitationsSent: false,
          },
        });
      } else {
        alert(`Error sending invitations: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error sending invitations:", error);
      alert(`Error sending invitations: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  if (!tender || contractors.length === 0) {
    return (
      <div className="p-6 lg:p-10 space-y-8 bg-slate-50/40 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-md text-center">
          <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Missing Information
          </h2>
          <p className="text-slate-600 mb-6">
            Please go back and select a tender and contractors.
          </p>
          <button
            onClick={() => navigate("/tender")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition"
          >
            Go to Tender Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50/40 min-h-screen">
      {/* Header */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Go back"
          >
            <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 mt-2">
              Upload Required Documents
            </h1>
            <p className="text-slate-600 mt-3 max-w-3xl leading-relaxed">
              Please provide all required information for{" "}
              <span className="font-semibold text-indigo-600">{tender?.name}</span> before proceeding to technical submission.
            </p>
          </div>
        </div>
      </section>

      {/* Tender Info Card */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <DocumentArrowUpIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Tender Information</h2>
            <p className="text-slate-600 mt-1">Review tender details</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Tender Name
            </p>
            <p className="text-lg font-semibold text-slate-900">{tender.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Client
            </p>
            <p className="text-lg text-slate-900">{tender.client}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Project Manager
            </p>
            <p className="text-lg text-slate-900">{tender.owner}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Contractors
            </p>
            <p className="text-lg text-slate-900">{contractors.length} selected</p>
          </div>
        </div>
      </section>

      {/* Additional Information Section */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Additional Information</h2>
            <p className="text-slate-600 mt-1">Provide additional details for this tender</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Attachment (5MB max) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Upload Attachment <span className="text-red-500">*</span>
              <span className="text-xs font-normal text-slate-500 ml-2">(maximum file size: 5 MB)</span>
            </label>
            {attachmentFile ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <PaperClipIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{attachmentFile.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(attachmentFile.size)}</p>
                  </div>
                </div>
                <button
                  onClick={removeAttachmentFile}
                  className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition flex-shrink-0 ml-2"
                  title="Remove file"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition">
                <input
                  type="file"
                  id="attachment-upload"
                  className="hidden"
                  onChange={handleAttachmentFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="attachment-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <DocumentArrowUpIcon className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 mb-1">Click to upload attachment</p>
                  <p className="text-xs text-slate-500">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 5MB)</p>
                </label>
              </div>
            )}
          </div>

          {/* Technical Drawings Link */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Technical Drawings Link
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="url"
                value={technicalDrawingsLink}
                onChange={(e) => setTechnicalDrawingsLink(e.target.value)}
                placeholder="https://example.com/drawings"
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Invitation Fees */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <CurrencyDollarIcon className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Invitation Fees</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Is this invitation subject to any applicable fees?
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasFees"
                    checked={hasInvitationFees === true}
                    onChange={() => setHasInvitationFees(true)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasFees"
                    checked={hasInvitationFees === false}
                    onChange={() => {
                      setHasInvitationFees(false);
                      setInvitationFeeAmount("");
                    }}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">No</span>
                </label>
              </div>
            </div>
            {hasInvitationFees && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Please specify the amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    value={invitationFeeAmount}
                    onChange={(e) => setInvitationFeeAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Deadline for Tender Acceptance Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="date"
                value={tenderAcceptanceDeadline}
                onChange={(e) => setTenderAcceptanceDeadline(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Deadline for Submission of Bid Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="date"
                value={bidSubmissionDeadline}
                onChange={(e) => setBidSubmissionDeadline(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Scope of Work */}
        <div className="space-y-2 pt-4 border-t border-slate-200">
          <label className="block text-sm font-semibold text-slate-700">
            Scope of Work
          </label>
          <textarea
            value={scopeOfWork}
            onChange={(e) => setScopeOfWork(e.target.value)}
            placeholder="Describe the scope of work for this tender..."
            rows={4}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm resize-none"
          />
        </div>

        {/* Additional Notes */}
        <div className="space-y-2 pt-4 border-t border-slate-200">
          <label className="block text-sm font-semibold text-slate-700">
            Additional Notes
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Add any additional notes or comments..."
            rows={4}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm resize-none"
          />
        </div>
      </section>

      {/* Action Buttons */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/tender")}
              className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-red-200 hover:text-red-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvitation}
              disabled={isSending}
              className={`px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg hover:shadow-xl transition flex items-center gap-2 font-semibold ${
                isSending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <EnvelopeIcon className="h-5 w-5" />
                  Send Tender Invitation
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

