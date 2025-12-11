import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  PaperClipIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function TenderFees() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tender = location.state?.tender || null;
  const contractors = location.state?.contractors || [];
  const technicalSubmission = location.state?.technicalSubmission || null;

  const [hasApplicableFees, setHasApplicableFees] = useState(null);
  const [feeDocument, setFeeDocument] = useState(null);
  const [feeAmount] = useState(250); // Fixed fee amount

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxSize) {
        alert("File size exceeds 5 MB limit. Please select a smaller file.");
        return;
      }
      setFeeDocument(file);
    }
  };

  const handleRemoveDocument = () => {
    setFeeDocument(null);
  };

  const handleBack = () => {
    navigate("/tender/technical-submission", {
      state: {
        tender,
        contractors,
        technicalSubmission,
      },
    });
  };

  const handleReject = () => {
    if (window.confirm("Are you sure you want to reject this invitation?")) {
      alert("Invitation has been rejected.");
      navigate("/tender", {
        state: {
          message: "Invitation rejected - No applicable fees",
        },
      });
    }
  };

  const handleSubmit = () => {
    if (hasApplicableFees === null) {
      alert("Please select whether this invitation has applicable fees.");
      return;
    }

    if (hasApplicableFees && !feeDocument) {
      alert("Please upload the fee document.");
      return;
    }

    if (hasApplicableFees) {
      // Here you would typically make an API call to save the fees and document
      alert(
        `Fee payment of ${feeAmount} AED has been submitted for ${tender?.name}. This is a demo action.`
      );
    }

    // Navigate back to tender page
    navigate("/tender", {
      state: {
        successMessage: "Tender submission completed successfully",
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
              Applicable Fees
            </h1>
            <p className="text-slate-600 mt-3 max-w-3xl leading-relaxed">
              Confirm if this invitation has applicable fees and complete the payment process.
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

      {/* Fees Question Section */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Fees Confirmation</h2>
        </div>

        {/* Question */}
        <div>
          <label className="block text-lg font-semibold text-slate-800 mb-4">
            Does this invitation have applicable fees?
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setHasApplicableFees(true)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                hasApplicableFees === true
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => {
                setHasApplicableFees(false);
                setFeeDocument(null);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                hasApplicableFees === false
                  ? "bg-red-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* If Yes - Show Fees and Document Upload */}
        {hasApplicableFees === true && (
          <div className="border-t border-slate-200 pt-6 space-y-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Applicable Fees</h3>
                <span className="text-2xl font-bold text-green-700">{feeAmount} AED</span>
              </div>
              <p className="text-sm text-slate-600">
                Please upload the fee payment document to proceed.
              </p>
            </div>

            {/* Fee Document Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Upload Fee Document *
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-indigo-400 transition">
                <input
                  type="file"
                  id="fee-document-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="fee-document-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <ArrowUpTrayIcon className="h-12 w-12 text-slate-400 mb-3" />
                  <p className="text-sm text-slate-600 mb-1">
                    Click to upload or drag and drop fee document
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF, JPG, PNG (Max 5MB)
                  </p>
                </label>
              </div>
              {feeDocument && (
                <div className="mt-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PaperClipIcon className="h-5 w-5 text-slate-400" />
                      <span className="text-sm text-slate-700">{feeDocument.name}</span>
                      <span className="text-xs text-slate-500">
                        ({(feeDocument.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveDocument}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* If No - Show Rejection Option */}
        {hasApplicableFees === false && (
          <div className="border-t border-slate-200 pt-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <XMarkIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No Applicable Fees
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Since this invitation has no applicable fees, you can reject the invitation.
                  </p>
                  <button
                    onClick={handleReject}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
                  >
                    Reject Invitation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
          {hasApplicableFees === true && (
            <button
              onClick={handleSubmit}
              disabled={!feeDocument}
              className={`px-8 py-3 rounded-xl transition flex items-center gap-2 font-semibold shadow-lg ${
                !feeDocument
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-xl"
              }`}
            >
              <CheckCircleIcon className="h-5 w-5" />
              Submit Payment
            </button>
          )}
        </div>
      </section>
    </div>
  );
}





