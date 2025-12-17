import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  PaperClipIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function TenderTechnicalSubmission() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tender = location.state?.tender || null;
  const contractorId = location.state?.contractorId || null;
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [tenderOperationsBoard, setTenderOperationsBoard] = useState([]);
  
  // Load tenders from project list (localStorage)
  useEffect(() => {
    const loadTendersFromProjects = () => {
      try {
        const savedProjects = localStorage.getItem('projectTasks');
        if (savedProjects) {
          const projects = JSON.parse(savedProjects);
          
          // Filter projects that are not deleted and convert to tenders
          const tenderList = projects
            .filter(project => !project.is_deleted)
            .map(project => {
              const tenderId = project.id?.toString() || project.referenceNumber || '';
              return {
                id: tenderId,
                name: project.name || project.projectName || '',
                client: project.client || '',
                date: project.timeline && project.timeline[0] 
                  ? new Date(project.timeline[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '')
                  : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', ''),
                owner: project.owner || '',
                status: project.status === 'done' ? 'Completed' : project.status === 'working' ? 'In Progress' : project.status === 'pending' ? 'Open' : 'Open',
                referenceNumber: project.referenceNumber || tenderId,
                description: project.description || '',
                deadline: project.timeline && project.timeline[1] 
                  ? new Date(project.timeline[1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '')
                  : null,
              };
            });
          setTenderOperationsBoard(tenderList);
        }
      } catch (error) {
        console.error('Error loading tenders from projects:', error);
        setTenderOperationsBoard([]);
      }
    };
    
    loadTendersFromProjects();
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'projectTasks') {
        loadTendersFromProjects();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically for changes
    const interval = setInterval(loadTendersFromProjects, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  // Load previously uploaded documents from localStorage
  useEffect(() => {
    if (tender?.id) {
      // Try to load from contractor-specific key
      if (contractorId) {
        const key = `technical_submission_${tender.id}_${contractorId}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            setUploadedFiles(JSON.parse(saved));
            return;
          } catch (error) {
            console.error('Error loading saved documents:', error);
          }
        }
      }
      
      // Also check general technical submissions storage
      const allSubmissions = localStorage.getItem('technicalSubmissions');
      if (allSubmissions) {
        try {
          const submissions = JSON.parse(allSubmissions);
          // Find submissions for this tender
          const tenderSubmissions = Object.values(submissions).filter(
            sub => sub.tenderId === tender.id || sub.tenderId?.toString() === tender.id?.toString()
          );
          
          if (tenderSubmissions.length > 0) {
            // Get files from the most recent submission
            const latestSubmission = tenderSubmissions.sort((a, b) => 
              new Date(b.submittedAt) - new Date(a.submittedAt)
            )[0];
            
            if (latestSubmission.files && latestSubmission.files.length > 0) {
              setUploadedFiles(latestSubmission.files);
            }
          }
        } catch (error) {
          console.error('Error loading technical submissions:', error);
        }
      }
    }
  }, [tender?.id, contractorId]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" exceeds 10MB limit. Please select a smaller file.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewFile = (file) => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } else if (file.data) {
      window.open(file.data, '_blank');
    }
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one document before submitting.");
      return;
    }

    setIsUploading(true);

    try {
      // Convert files to base64 for storage
      const filesToSave = await Promise.all(
        uploadedFiles.map(async (file) => {
          if (file instanceof File) {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  data: e.target.result,
                  uploadedAt: new Date().toISOString(),
                });
              };
              reader.onerror = () => {
                resolve({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  data: null,
                  uploadedAt: new Date().toISOString(),
                });
              };
              reader.readAsDataURL(file);
            });
          }
          return file;
        })
      );

      // Save to localStorage
      if (tender?.id && contractorId) {
        const key = `technical_submission_${tender.id}_${contractorId}`;
        localStorage.setItem(key, JSON.stringify(filesToSave));
      }

      // Also save to a general technical submissions storage
      const allSubmissions = JSON.parse(localStorage.getItem('technicalSubmissions') || '{}');
      const submissionKey = `${tender?.id}_${contractorId}`;
      allSubmissions[submissionKey] = {
        tenderId: tender?.id,
        contractorId,
        tenderName: tender?.name,
        files: filesToSave,
        submittedAt: new Date().toISOString(),
      };
      localStorage.setItem('technicalSubmissions', JSON.stringify(allSubmissions));

      alert(`Successfully submitted ${uploadedFiles.length} document(s) for technical review.`);
      
      // Navigate back to tender page
      navigate("/tender", {
        state: {
          submissionSuccess: true,
        },
      });
    } catch (error) {
      console.error("Error submitting documents:", error);
      alert("Error submitting documents. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!tender) {
    return (
      <div className="p-6 lg:p-10 space-y-8 bg-slate-50/40 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-md text-center">
          <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Tender Not Found
          </h2>
          <p className="text-slate-600 mb-6">
            Please go back and select a tender.
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
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50/40 min-h-screen">
      {/* Header */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/tender")}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            title="Go back"
          >
            <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                Step 2
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-500">Technical Submission</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 mt-2">
              Technical Submission
            </h1>
            <p className="text-slate-600 mt-3 max-w-3xl leading-relaxed">
              Upload your accepted invitation documents and technical submission materials for{" "}
              <span className="font-semibold text-indigo-600">{tender?.name}</span>.
            </p>
          </div>
        </div>

        {/* Tender Project Details Card */}
        <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">
              Tender Project Details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Project Name</p>
                <h3 className="text-lg font-bold text-slate-900">{tender.name}</h3>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Client</p>
                <p className="text-sm font-medium text-slate-700">{tender.client || 'N/A'}</p>
              </div>
              {tender.referenceNumber && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Reference Number</p>
                  <p className="text-sm font-medium text-slate-700">{tender.referenceNumber}</p>
                </div>
              )}
              {tender.owner && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Project Manager</p>
                  <p className="text-sm font-medium text-slate-700">{tender.owner}</p>
                </div>
              )}
              {tender.deadline && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Deadline</p>
                  <p className="text-sm font-medium text-slate-700">{tender.deadline}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <span className="inline-flex items-center px-3 py-1 text-xs rounded-full bg-amber-50 text-amber-700 font-medium">
                  {tender.status || 'Open'}
                </span>
              </div>
            </div>
            {tender.description && (
              <div className="mt-4 pt-4 border-t border-indigo-200">
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-700">{tender.description}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tender Operations Board */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-4">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Tender Operations Board
            </h2>
            <p className="text-slate-600">
              Upcoming deadlines, project managers, and live status for each opportunity.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition">
              Filter
            </button>
            <button className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition">
              Columns
            </button>
          </div>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                {[
                  "Tender Name",
                  "Client",
                  "Submission Date",
                  "Project Manager",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenderOperationsBoard.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        navigate("/tender/technical-submission", {
                          state: {
                            tender: {
                              id: row.id,
                              name: row.name,
                              client: row.client,
                              owner: row.owner,
                              date: row.date,
                              status: row.status,
                              referenceNumber: row.referenceNumber,
                              description: row.description,
                              deadline: row.deadline,
                            },
                            contractorId,
                          },
                        });
                      }}
                      className="text-left hover:text-indigo-600 transition-colors"
                    >
                      <p className="font-medium text-slate-900 hover:text-indigo-600">{row.name}</p>
                      <p className="text-xs text-slate-500">Tender Ref {row.referenceNumber || row.id}</p>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{row.client}</td>
                  <td className="px-6 py-4 text-slate-700">{row.date}</td>
                  <td className="px-6 py-4 text-slate-700">{row.owner}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-amber-50 text-amber-700 font-medium">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        navigate("/tender/technical-submission", {
                          state: {
                            tender: {
                              id: row.id,
                              name: row.name,
                              client: row.client,
                              owner: row.owner,
                              date: row.date,
                              status: row.status,
                              referenceNumber: row.referenceNumber,
                              description: row.description,
                              deadline: row.deadline,
                            },
                            contractorId,
                          },
                        });
                      }}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Previously Submitted Documents Section */}
      {uploadedFiles.length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Submitted Documents
            </h2>
            <p className="text-slate-600">
              Documents that have been submitted for technical review.
            </p>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DocumentTextIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {file.name || `Document ${index + 1}`}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                        {file.size && (
                          <span>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        )}
                        {file.uploadedAt && (
                          <span>
                            Submitted: {new Date(file.uploadedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleViewFile(file)}
                      className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                      title="View document"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upload Section */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            {uploadedFiles.length > 0 ? 'Upload Additional Documents' : 'Upload Accepted Invitation & Technical Documents'}
          </h2>
          <p className="text-slate-600">
            {uploadedFiles.length > 0 
              ? 'Upload additional documents or revise your submission.'
              : 'Please upload your accepted invitation letter and all required technical submission documents.'}
            Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, DWG, DXF (Max 10MB per file)
          </p>
        </div>

        {/* File Upload Area */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-indigo-400 transition">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg,.dxf"
            multiple
            onChange={handleFileSelect}
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <ArrowUpTrayIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1 font-medium">
              Click to upload or drag and drop files here
            </p>
            <p className="text-xs text-slate-500">
              PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, DWG, DXF (Max 10MB per file)
            </p>
          </label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Uploaded Documents ({uploadedFiles.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {file.name || `Document ${index + 1}`}
                      </p>
                      {file.size && (
                        <p className="text-xs text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleViewFile(file)}
                      className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                      title="View document"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      title="Remove document"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => navigate("/tender")}
            className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploadedFiles.length === 0 || isUploading}
            className={`px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg hover:shadow-xl ${
              uploadedFiles.length === 0 || isUploading
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isUploading ? (
              <>
                <CloudArrowUpIcon className="h-5 w-5 animate-pulse" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Submit Technical Documents
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

