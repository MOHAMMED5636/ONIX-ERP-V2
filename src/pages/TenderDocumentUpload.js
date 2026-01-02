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

      // Save form data to localStorage for retrieval on invitation page
      const formDataToSave = {
        attachmentFile: attachmentFile ? {
          name: attachmentFile.name,
          size: attachmentFile.size,
          type: attachmentFile.type,
        } : null,
        technicalDrawingsLink,
        hasInvitationFees,
        invitationFeeAmount,
        tenderAcceptanceDeadline,
        bidSubmissionDeadline,
        scopeOfWork,
        additionalNotes,
      };
      
      // Save to localStorage with tender ID as key
      const tenderId = tender.id || tender.referenceNumber || Date.now().toString();
      localStorage.setItem(`tenderFormData_${tenderId}`, JSON.stringify(formDataToSave));
      
      // Also save tender data with form info
      localStorage.setItem(`tenderData_${tenderId}`, JSON.stringify(tenderDataWithFormInfo));

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

        // Navigate back to tender page after successful send
        navigate("/tender", {
          state: {
            tender: tenderDataWithFormInfo,
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

        // Navigate back to tender page even with fallback
        navigate("/tender", {
          state: {
            tender: tenderDataWithFormInfo,
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
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-slate-50/40 min-h-screen overflow-x-hidden">
      {/* Header */}
      <section className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6 lg:p-8 space-y-4 lg:space-y-6">
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
      <section className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6 lg:p-8">
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
      <section className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Additional Information</h2>
            <p className="text-slate-600 leading-relaxed">
              Complete the following details to finalize your tender invitation. All information will be included in the email sent to contractors.
            </p>
          </div>
        </div>

        {/* File Upload & Technical Drawings */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <DocumentArrowUpIcon className="h-5 w-5 text-indigo-600" />
            Documents & Links
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Attachment (5MB max) */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Upload Attachment <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Upload the tender invitation letter or related documents (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG)
                </p>
                <p className="text-xs text-amber-600 font-medium">
                  ⚠ Maximum file size: 5 MB
                </p>
              </div>
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
              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-6 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group">
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
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition">
                    <DocumentArrowUpIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-500 text-center">Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG</p>
                </label>
              </div>
            )}
            </div>

            {/* Technical Drawings Link */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Technical Drawings Link
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Share a link to technical drawings, CAD files, or other online resources (optional)
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-indigo-500" />
                </div>
                <input
                  type="url"
                  value={technicalDrawingsLink}
                  onChange={(e) => setTechnicalDrawingsLink(e.target.value)}
                  placeholder="https://drive.google.com/drawings or https://example.com/technical-drawings"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invitation Fees */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-amber-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CurrencyDollarIcon className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Invitation Fees</h3>
              <p className="text-xs text-slate-600">Specify if contractors need to pay any fees to participate</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Is this invitation subject to any applicable fees?
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="hasFees"
                      checked={hasInvitationFees === true}
                      onChange={() => setHasInvitationFees(true)}
                      className="w-5 h-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition">Yes, fees apply</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="hasFees"
                      checked={hasInvitationFees === false}
                      onChange={() => {
                        setHasInvitationFees(false);
                        setInvitationFeeAmount("");
                      }}
                      className="w-5 h-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition">No fees</span>
                </label>
              </div>
            </div>
            {hasInvitationFees && (
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-amber-300">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Fee Amount <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-3">Enter the amount contractors need to pay to participate</p>
                <div className="relative max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <input
                    type="number"
                    value={invitationFeeAmount}
                    onChange={(e) => setInvitationFeeAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm font-medium"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">AED</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deadlines */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-purple-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CalendarIcon className="h-5 w-5 text-purple-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Important Deadlines</h3>
              <p className="text-xs text-slate-600">Set key dates for contractors to respond and submit bids</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Tender Acceptance Deadline
              </label>
              <p className="text-xs text-slate-500 mb-2">Last date for contractors to accept the invitation</p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-purple-600" />
                </div>
                <input
                  type="date"
                  value={tenderAcceptanceDeadline}
                  onChange={(e) => setTenderAcceptanceDeadline(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Bid Submission Deadline
              </label>
              <p className="text-xs text-slate-500 mb-2">Last date for contractors to submit their technical bids</p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-purple-600" />
                </div>
                <input
                  type="date"
                  value={bidSubmissionDeadline}
                  onChange={(e) => setBidSubmissionDeadline(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scope of Work & Additional Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Scope of Work */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-emerald-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DocumentTextIcon className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Scope of Work
                </label>
                <p className="text-xs text-slate-600">Describe what needs to be done in this project</p>
              </div>
            </div>
            <textarea
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              placeholder="Example: Construction of residential villa including foundation, structure, MEP works, finishing, and landscaping..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm resize-none bg-white"
            />
            <p className="text-xs text-slate-500 mt-2">
              💡 Tip: Be specific about deliverables, timelines, and requirements
            </p>
          </div>

          {/* Additional Notes */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-rose-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClipboardDocumentListIcon className="h-5 w-5 text-rose-700" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Additional Notes
                </label>
                <p className="text-xs text-slate-600">Any other important information for contractors</p>
              </div>
            </div>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Example: Site visit required before submission. Contact project manager for access. Special requirements: Environmental compliance certificate needed..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm resize-none bg-white"
            />
            <p className="text-xs text-slate-500 mt-2">
              💡 Tip: Include contact information, special requirements, or instructions
            </p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="bg-white rounded-2xl lg:rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <button
            onClick={handleBack}
            className="px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </button>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => navigate("/tender")}
              className="px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-red-200 hover:text-red-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvitation}
              disabled={isSending}
              className={`px-6 sm:px-8 py-2.5 sm:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 font-semibold text-sm sm:text-base ${
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
DXBonix2024$
