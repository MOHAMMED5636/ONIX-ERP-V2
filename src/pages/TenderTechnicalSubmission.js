import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  PaperClipIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import { sendTenderInvitations } from "../services/tenderAPI";

export default function TenderTechnicalSubmission() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tender = location.state?.tender || null;
  const contractors = location.state?.contractors || [];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  const [formData, setFormData] = useState({
    projectScope: "",
    attachments: [],
    drawingsLink: "",
    documents: [],
    hasApplicableFees: null,
    feeAmount: "",
    tenderResponse: null, // "accept" or "interest"
    bidSubmissionDeadline: "",
    complianceChecklist: {
      meetsRequirements: false,
      qualityStandards: false,
      safetyCompliance: false,
      environmentalCompliance: false,
    },
    additionalNotes: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChecklistChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      complianceChecklist: {
        ...prev.complianceChecklist,
        [key]: value,
      },
    }));
  };

  const handleFileUpload = (type, files) => {
    const fileArray = Array.from(files);
    
    // Validate file size for attachments (max 5 MB)
    if (type === "attachments") {
      const maxSize = 5 * 1024 * 1024; // 5 MB in bytes
      const oversizedFiles = fileArray.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        alert(`The following file(s) exceed the 5 MB limit:\n${oversizedFiles.map(f => f.name).join('\n')}\n\nPlease select files smaller than 5 MB.`);
        return;
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], ...fileArray],
    }));
  };

  const handleRemoveFile = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleBack = () => {
    navigate("/tender/confirmation", {
      state: {
        tender,
        contractors,
      },
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = doc.internal.pageSize.width - (margin * 2);

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Technical Submission Report', margin, yPosition);
    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 10;

    // Tender Information Section
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Tender Information', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tender Name: ${tender?.name || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Client: ${tender?.client || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Number of Contractors: ${contractors.length}`, margin, yPosition);
    yPosition += 10;

    // Project Scope Section
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Scope', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const projectScopeLines = doc.splitTextToSize(formData.projectScope || 'Not provided', maxWidth);
    projectScopeLines.forEach((line) => {
      checkPageBreak(6);
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 5;

    // Attachments Section
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Attachments', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (formData.attachments.length > 0) {
      formData.attachments.forEach((file, index) => {
        checkPageBreak(6);
        doc.text(`${index + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`, margin, yPosition);
        yPosition += 6;
      });
    } else {
      doc.text('No attachments uploaded', margin, yPosition);
      yPosition += 6;
    }
    yPosition += 5;

    // Technical Drawings Link
    checkPageBreak(15);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Technical Drawings', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Link: ${formData.drawingsLink || 'Not provided'}`, margin, yPosition);
    yPosition += 10;

    // Applicable Fees Section
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Applicable Fees', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (formData.hasApplicableFees === true) {
      doc.text(`Has Applicable Fees: Yes`, margin, yPosition);
      yPosition += 6;
      doc.text(`Fee Amount: ${formData.feeAmount || 'N/A'} AED`, margin, yPosition);
    } else if (formData.hasApplicableFees === false) {
      doc.text(`Has Applicable Fees: No (Invitation Rejected)`, margin, yPosition);
    } else {
      doc.text(`Has Applicable Fees: Not specified`, margin, yPosition);
    }
    yPosition += 10;

    // Supporting Documents Section
    checkPageBreak(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Supporting Documents', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (formData.documents.length > 0) {
      formData.documents.forEach((file, index) => {
        checkPageBreak(6);
        doc.text(`${index + 1}. ${file.name}`, margin, yPosition);
        yPosition += 6;
      });
    } else {
      doc.text('No supporting documents uploaded', margin, yPosition);
      yPosition += 6;
    }
    yPosition += 5;

    // Tender Response Section
    checkPageBreak(15);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Tender Response', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const responseText = formData.tenderResponse === 'accept' ? 'Accept' : 
                        formData.tenderResponse === 'interest' ? 'Interest' : 'Not specified';
    doc.text(`Response: ${responseText}`, margin, yPosition);
    yPosition += 10;

    // Bid Submission Deadline
    checkPageBreak(15);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Bid Submission Deadline', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (formData.bidSubmissionDeadline) {
      const deadlineDate = new Date(formData.bidSubmissionDeadline);
      doc.text(`Deadline: ${deadlineDate.toLocaleString()}`, margin, yPosition);
    } else {
      doc.text('Deadline: Not specified', margin, yPosition);
    }
    yPosition += 10;

    // Compliance Checklist Section
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Compliance Checklist', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const checklistItems = [
      { key: 'meetsRequirements', label: 'Meets all tender requirements' },
      { key: 'qualityStandards', label: 'Complies with quality standards' },
      { key: 'safetyCompliance', label: 'Meets safety compliance requirements' },
      { key: 'environmentalCompliance', label: 'Meets environmental compliance requirements' },
    ];

    checklistItems.forEach((item) => {
      checkPageBreak(6);
      const checkmark = formData.complianceChecklist[item.key] ? '✓' : '✗';
      doc.text(`${checkmark} ${item.label}`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 5;

    // Additional Notes Section
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Notes', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (formData.additionalNotes) {
      const notesLines = doc.splitTextToSize(formData.additionalNotes, maxWidth);
      notesLines.forEach((line) => {
        checkPageBreak(6);
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });
    } else {
      doc.text('No additional notes provided', margin, yPosition);
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Page ${i} of ${totalPages} - Technical Submission Report`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Generate filename
    const filename = `Technical_Submission_${tender?.name?.replace(/\s+/g, '_') || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save PDF
    doc.save(filename);
    
    return filename;
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.projectScope.trim()) {
      alert("Please provide project scope.");
      return;
    }

    if (formData.attachments.length === 0) {
      alert("Please upload at least one attachment.");
      return;
    }

    // Check if fees question is answered
    if (formData.hasApplicableFees === null) {
      alert("Please indicate whether this invitation has applicable fees.");
      return;
    }

    // If fees are applicable, validate fee amount
    if (formData.hasApplicableFees === true) {
      if (!formData.feeAmount || parseFloat(formData.feeAmount) <= 0) {
        alert("Please enter a valid fee amount.");
        return;
      }
    }

    // Check if tender response is selected
    if (formData.tenderResponse === null) {
      alert("Please select whether you Accept or show Interest in this tender.");
      return;
    }

    // If no fees, reject the invitation
    if (formData.hasApplicableFees === false) {
      if (window.confirm("Are you sure you want to reject this invitation? (No applicable fees)")) {
        alert("Invitation has been rejected - No applicable fees.");
        navigate("/tender", {
          state: {
            message: "Invitation rejected - No applicable fees",
          },
        });
        return;
      } else {
        return; // User cancelled rejection
      }
    }

    // Set submitting state
    setIsSubmitting(true);

    // Generate PDF
    let pdfFilename = null;
    try {
      pdfFilename = generatePDF();
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Continue with submission even if PDF generation fails
    }

    // Prepare contractors/engineers for email sending
    // Map contractors to engineers format (with email field)
    const engineersForEmail = contractors.map((contractor) => {
      // Try to extract email from contractor object
      // Contractors might have email, or we might need to use contact field
      const email = contractor.email || 
                   (contractor.contact && contractor.contact.includes('@') ? contractor.contact : null) ||
                   `${contractor.name.toLowerCase().replace(/\s+/g, '.')}@example.com`; // Fallback email
      
      return {
        id: contractor.id,
        name: contractor.name,
        email: email,
        specialty: contractor.specialty || contractor.licensedActivities || 'N/A',
      };
    });

    // Send tender invitation emails to contractors/engineers
    let emailResult = null;
    let emailSuccess = false;
    let emailMessage = "";

    if (engineersForEmail.length > 0) {
      try {
        emailResult = await sendTenderInvitations(tender, engineersForEmail);
        
        if (emailResult.success) {
          emailSuccess = true;
          emailMessage = `✓ Tender invitation emails sent successfully to ${emailResult.sentCount} contractor(s)/engineer(s).`;
        } else if (emailResult.fallback) {
          // Fallback scenario - show mailto option
          emailMessage = `⚠ Email API unavailable. Please send invitations manually using the provided link.`;
        } else {
          emailMessage = `⚠ Email sending encountered an issue: ${emailResult.error || 'Unknown error'}`;
        }
      } catch (error) {
        console.error("Error sending tender invitations:", error);
        emailMessage = `⚠ Error sending invitation emails: ${error.message}`;
      }
    }

    // Prepare confirmation data
    const confirmationInfo = {
      tenderName: tender?.name,
      pdfFilename: pdfFilename,
      feeAmount: formData.feeAmount,
      emailSuccess: emailSuccess,
      emailMessage: emailMessage,
      emailResult: emailResult,
      sentCount: emailResult?.sentCount || engineersForEmail.length,
    };

    setIsSubmitting(false);
    
    // Show custom confirmation modal
    setConfirmationData(confirmationInfo);
    setShowConfirmationModal(true);
  };

  const handleConfirmationClose = () => {
    setShowConfirmationModal(false);
    setConfirmationData(null);
    
    // Navigate back to tender page
    navigate("/tender", {
      state: {
        successMessage: confirmationData?.emailSuccess 
          ? "Technical submission completed successfully. PDF report downloaded and invitation emails sent."
          : "Technical submission completed successfully. PDF report downloaded.",
      },
    });
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
            Please go back and complete the previous steps.
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
              Technical Submission
            </h1>
            <p className="text-slate-600 mt-3 max-w-3xl leading-relaxed">
              Complete the technical submission for{" "}
              <span className="font-semibold text-indigo-600">{tender?.name}</span>.
              Provide all required technical documentation and specifications.
            </p>
          </div>
        </div>

        {/* Tender Info Card */}
        <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                Tender Information
              </p>
              <h3 className="text-xl font-bold text-slate-900">{tender.name}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                <span>
                  <span className="font-semibold">Client:</span> {tender.client}
                </span>
                <span>
                  <span className="font-semibold">Contractors:</span> {contractors.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Submission Form */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Submission Details</h2>
        </div>

        {/* Project Scope */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Project Scope *
          </label>
          <textarea
            value={formData.projectScope}
            onChange={(e) => handleInputChange("projectScope", e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 resize-none"
            rows={6}
            placeholder="Describe the project scope, objectives, and deliverables..."
            required
          />
        </div>

        {/* Upload Attachment */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Upload Attachment *
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-indigo-400 transition">
            <input
              type="file"
              id="attachments-upload"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg,.dxf"
              multiple
              onChange={(e) => handleFileUpload("attachments", e.target.files)}
            />
            <label
              htmlFor="attachments-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <ArrowUpTrayIcon className="h-12 w-12 text-slate-400 mb-3" />
              <p className="text-sm text-slate-600 mb-1">
                Click to upload or drag and drop attachments
              </p>
              <p className="text-xs text-slate-500">
                PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, DWG, DXF (Max 5MB per file)
              </p>
            </label>
          </div>
          {formData.attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <PaperClipIcon className="h-5 w-5 text-slate-400" />
                    <span className="text-sm text-slate-700">{file.name}</span>
                    <span className="text-xs text-slate-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile("attachments", index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Technical Drawings Link */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Technical Drawings
          </label>
          <input
            type="url"
            value={formData.drawingsLink}
            onChange={(e) => handleInputChange("drawingsLink", e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            placeholder="Enter link to technical drawings..."
          />
        </div>

        {/* Applicable Fees Question */}
        <div className="border-t border-slate-200 pt-6">
          <label className="block text-sm font-semibold text-slate-700 mb-4">
            Does this invitation have applicable fees? *
          </label>
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => handleInputChange("hasApplicableFees", true)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                formData.hasApplicableFees === true
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                handleInputChange("hasApplicableFees", false);
                handleInputChange("feeAmount", "");
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                formData.hasApplicableFees === false
                  ? "bg-red-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              No
            </button>
          </div>

          {/* If Yes - Show Fee Amount Input */}
          {formData.hasApplicableFees === true && (
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fee Amount (AED) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.feeAmount}
                onChange={(e) => handleInputChange("feeAmount", e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter fee amount (e.g., 250)"
                required
              />
            </div>
          )}

          {/* If No - Show Rejection Message */}
          {formData.hasApplicableFees === false && (
            <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <XMarkIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    No Applicable Fees
                  </p>
                  <p className="text-xs text-slate-600">
                    If you proceed with submission, the invitation will be rejected due to no applicable fees.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Documents Upload */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Supporting Documents
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-indigo-400 transition">
            <input
              type="file"
              id="documents-upload"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              multiple
              onChange={(e) => handleFileUpload("documents", e.target.files)}
            />
            <label
              htmlFor="documents-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <ArrowUpTrayIcon className="h-12 w-12 text-slate-400 mb-3" />
              <p className="text-sm text-slate-600 mb-1">
                Click to upload or drag and drop documents
              </p>
              <p className="text-xs text-slate-500">
                PDF, DOC, DOCX, XLS, XLSX (Max 10MB per file)
              </p>
            </label>
          </div>
          {formData.documents.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.documents.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <PaperClipIcon className="h-5 w-5 text-slate-400" />
                    <span className="text-sm text-slate-700">{file.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile("documents", index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tender Acceptance or Interest */}
        <div className="border-t border-slate-200 pt-6">
          <label className="block text-sm font-semibold text-slate-700 mb-4">
            Tender Response *
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleInputChange("tenderResponse", "accept")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                formData.tenderResponse === "accept"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => handleInputChange("tenderResponse", "interest")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                formData.tenderResponse === "interest"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Interest
            </button>
          </div>
        </div>

        {/* Next Deadline of Bid Submission */}
        <div className="border-t border-slate-200 pt-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Next Deadline of Bid Submission
          </label>
          <input
            type="datetime-local"
            value={formData.bidSubmissionDeadline}
            onChange={(e) => handleInputChange("bidSubmissionDeadline", e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
            placeholder="Select deadline date and time"
          />
          {formData.bidSubmissionDeadline && (
            <p className="mt-2 text-sm text-slate-600">
              Deadline: {new Date(formData.bidSubmissionDeadline).toLocaleString()}
            </p>
          )}
        </div>

        {/* Compliance Checklist */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Compliance Checklist
          </h3>
          <div className="space-y-3">
            {[
              { key: "meetsRequirements", label: "Meets all tender requirements" },
              { key: "qualityStandards", label: "Complies with quality standards" },
              { key: "safetyCompliance", label: "Meets safety compliance requirements" },
              {
                key: "environmentalCompliance",
                label: "Meets environmental compliance requirements",
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={formData.complianceChecklist[item.key]}
                  onChange={(e) => handleChecklistChange(item.key, e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.additionalNotes}
            onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 resize-none"
            rows={4}
            placeholder="Any additional information or notes..."
          />
        </div>
      </section>

      {/* Action Buttons */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={handleBack}
            className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!formData.projectScope.trim()) {
                  alert("Please provide project scope before generating PDF.");
                  return;
                }
                try {
                  const pdfFilename = generatePDF();
                  alert(`PDF Report "${pdfFilename}" has been generated and downloaded for review.`);
                } catch (error) {
                  console.error("Error generating PDF:", error);
                  alert(`Error generating PDF: ${error.message}`);
                }
              }}
              className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition flex items-center gap-2"
              title="Generate and download PDF for review"
            >
              <DocumentTextIcon className="h-5 w-5" />
              Generate PDF for Review
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-lg hover:shadow-xl transition flex items-center gap-2 font-semibold ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting & Sending Emails...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  Submit Technical Documentation & Send Invitations
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {showConfirmationModal && confirmationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Submission Successful!</h2>
                    <p className="text-slate-600 mt-1">Technical documentation has been submitted</p>
                  </div>
                </div>
                <button
                  onClick={handleConfirmationClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <XMarkIcon className="h-6 w-6 text-slate-600" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Success Message */}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                  <p className="text-lg font-semibold text-green-900 mb-2">
                    ✓ Technical submission for "{confirmationData.tenderName}" has been submitted successfully!
                  </p>
                </div>

                {/* PDF Report */}
                {confirmationData.pdfFilename && (
                  <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <DocumentTextIcon className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-indigo-900 mb-1">PDF Report Generated</p>
                        <p className="text-sm text-indigo-700">
                          "{confirmationData.pdfFilename}" has been downloaded for your review.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fee Amount */}
                {confirmationData.feeAmount && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💰</div>
                      <div className="flex-1">
                        <p className="font-semibold text-amber-900 mb-1">Fee Amount</p>
                        <p className="text-lg font-bold text-amber-700">
                          {confirmationData.feeAmount} AED
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Status */}
                {confirmationData.emailSuccess && confirmationData.emailResult && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <EnvelopeIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900 mb-2">
                          ✓ Tender invitation emails sent successfully!
                        </p>
                        <p className="text-sm text-blue-700 mb-3">
                          {confirmationData.sentCount} contractor(s)/engineer(s) have been notified via email.
                        </p>
                        {confirmationData.emailResult.tenderLink && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                            <p className="text-xs font-semibold text-blue-600 mb-1">Tender Invitation Link:</p>
                            <p className="text-xs text-blue-700 break-all font-mono">
                              {confirmationData.emailResult.tenderLink}
                            </p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(confirmationData.emailResult.tenderLink);
                                alert("Link copied to clipboard!");
                              }}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline"
                            >
                              Copy Link
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Warning/Fallback */}
                {!confirmationData.emailSuccess && confirmationData.emailMessage && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">⚠️</div>
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-900 mb-2">
                          {confirmationData.emailMessage}
                        </p>
                        {confirmationData.emailResult?.tenderLink && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-yellow-200">
                            <p className="text-xs font-semibold text-yellow-600 mb-1">Tender Invitation Link:</p>
                            <p className="text-xs text-yellow-700 break-all font-mono">
                              {confirmationData.emailResult.tenderLink}
                            </p>
                            <p className="text-xs text-yellow-600 mt-2">
                              Please share this link with the selected contractors/engineers manually.
                            </p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(confirmationData.emailResult.tenderLink);
                                alert("Link copied to clipboard!");
                              }}
                              className="mt-2 text-xs text-yellow-600 hover:text-yellow-700 underline"
                            >
                              Copy Link
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Next Steps:</span> All selected contractors/engineers will receive 
                    the tender invitation link via email. You can also share the link manually if needed.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleConfirmationClose}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-lg hover:shadow-xl transition flex items-center gap-2 font-semibold"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

