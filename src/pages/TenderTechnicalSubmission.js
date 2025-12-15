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
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import { sendTenderInvitations } from "../services/tenderAPI";

export default function TenderTechnicalSubmission() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const tender = location.state?.tender || null;
  
  // Load contractors from localStorage or from location state
  const loadContractorsFromStorage = () => {
    try {
      const savedContractors = localStorage.getItem('contractors');
      if (savedContractors) {
        return JSON.parse(savedContractors);
      }
    } catch (error) {
      console.error('Error loading contractors from localStorage:', error);
    }
    return [];
  };

  const [contractors, setContractors] = useState(location.state?.contractors || loadContractorsFromStorage());
  
  // Update contractors when localStorage changes or location state changes
  useEffect(() => {
    if (location.state?.contractors) {
      setContractors(location.state.contractors);
    } else {
      const handleStorageChange = (e) => {
        if (e.key === 'contractors') {
          setContractors(loadContractorsFromStorage());
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Check periodically for changes
      const interval = setInterval(() => {
        const updated = loadContractorsFromStorage();
        setContractors(updated);
      }, 1000);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, [location.state]);
  
  // Tender Operations Board state - load from project list
  const [tenderOperationsBoard, setTenderOperationsBoard] = useState([]);
  
  useEffect(() => {
    const loadTendersFromProjects = () => {
      try {
        const savedProjects = localStorage.getItem('projectTasks');
        if (savedProjects) {
          const projects = JSON.parse(savedProjects);
          // Load revised documents from localStorage
          const savedDocs = localStorage.getItem('revisedDocuments');
          const allDocs = savedDocs ? JSON.parse(savedDocs) : {};
          
          // Filter projects that are not deleted and convert to tenders
          const tenderList = projects
            .filter(project => !project.is_deleted)
            .map(project => {
              const tenderId = project.id?.toString() || project.referenceNumber || '';
              // Get documents from localStorage for this tender
              const storedDocs = allDocs[tenderId] || [];
              return {
                id: tenderId,
                name: project.name || project.projectName || '',
                client: project.client || '',
                date: project.timeline && project.timeline[0] 
                  ? new Date(project.timeline[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '')
                  : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', ''),
                owner: project.owner || '',
                status: project.status === 'done' ? 'Completed' : project.status === 'working' ? 'In Progress' : project.status === 'pending' ? 'Open' : 'Open',
                revisedDocuments: storedDocs.length > 0 ? storedDocs : [],
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
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTenderForUpload, setSelectedTenderForUpload] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [showViewDocumentsModal, setShowViewDocumentsModal] = useState(false);
  const [selectedTenderForView, setSelectedTenderForView] = useState(null);

  // Load contractor pricing from localStorage
  const loadContractorPricingFromStorage = () => {
    try {
      const savedPricing = localStorage.getItem('contractorPricing');
      if (savedPricing) {
        return JSON.parse(savedPricing);
      }
    } catch (error) {
      console.error('Error loading contractor pricing from localStorage:', error);
    }
    return {};
  };

  // Contractor pricing data - prices for each contractor per tender
  const [contractorPricing, setContractorPricing] = useState(loadContractorPricingFromStorage());

  // Invitation letters - stored per tender-contractor combination
  const [invitationLetters, setInvitationLetters] = useState(() => {
    try {
      const saved = localStorage.getItem('invitationLetters');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading invitation letters from localStorage:', error);
      return {};
    }
  });

  // Save contractor pricing to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('contractorPricing', JSON.stringify(contractorPricing));
    } catch (error) {
      console.error('Error saving contractor pricing to localStorage:', error);
    }
  }, [contractorPricing]);

  // Save invitation letters to localStorage whenever they change
  useEffect(() => {
    try {
      // Convert File objects to serializable format
      const serialized = {};
      Object.keys(invitationLetters).forEach(key => {
        const file = invitationLetters[key];
        if (file instanceof File) {
          // Store file metadata, will convert to base64 when needed
          serialized[key] = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            isFile: true,
          };
        } else {
          serialized[key] = file;
        }
      });
      localStorage.setItem('invitationLetters', JSON.stringify(serialized));
    } catch (error) {
      console.error('Error saving invitation letters to localStorage:', error);
    }
  }, [invitationLetters]);

  // Initialize contractor pricing when component mounts or data changes
  useEffect(() => {
    if (tenderOperationsBoard.length > 0 && contractors.length > 0) {
      setContractorPricing(prev => {
        const updated = { ...prev };
        tenderOperationsBoard.forEach(tender => {
          if (!updated[tender.id]) {
            updated[tender.id] = {};
          }
          contractors.forEach(contractor => {
            if (!updated[tender.id][contractor.id]) {
              // Initialize only if doesn't exist
              updated[tender.id][contractor.id] = {
                price: "",
                currency: "AED",
                status: "pending",
                submittedDate: null,
              };
            }
          });
        });
        return updated;
      });
    }
  }, [tenderOperationsBoard.length, contractors.length]);



  // Handle revised document uploads for Tender Operations Board
  const handleRevisedDocumentUpload = (files) => {
    const fileArray = Array.from(files);
    const maxSize = 10 * 1024 * 1024; // 10 MB per file
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert(`The following file(s) exceed the 10 MB limit:\n${oversizedFiles.map(f => f.name).join('\n')}\n\nPlease select files smaller than 10 MB.`);
      return;
    }
    
    setUploadFiles((prev) => [...prev, ...fileArray]);
  };

  const handleRemoveUploadFile = (index) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Save revised documents to localStorage (async conversion to base64)
  const saveRevisedDocumentsToStorage = async (tenderId, documents) => {
    try {
      const savedDocs = localStorage.getItem('revisedDocuments');
      const allDocs = savedDocs ? JSON.parse(savedDocs) : {};
      
      // Convert File objects to base64
      const serializedDocs = await Promise.all(
        documents.map(async (doc) => {
          if (doc instanceof File) {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve({
                  name: doc.name,
                  size: doc.size,
                  type: doc.type,
                  lastModified: doc.lastModified,
                  data: e.target.result, // base64 data URL
                });
              };
              reader.onerror = () => {
                resolve({
                  name: doc.name,
                  size: doc.size,
                  type: doc.type,
                  lastModified: doc.lastModified,
                  data: null,
                });
              };
              reader.readAsDataURL(doc);
            });
          } else {
            // Already serialized
            return doc;
          }
        })
      );
      
      allDocs[tenderId] = serializedDocs;
      localStorage.setItem('revisedDocuments', JSON.stringify(allDocs));
    } catch (error) {
      console.error('Error saving revised documents to localStorage:', error);
    }
  };

  // Load revised documents from localStorage
  const loadRevisedDocumentsFromStorage = (tenderId) => {
    try {
      const savedDocs = localStorage.getItem('revisedDocuments');
      if (savedDocs) {
        const allDocs = JSON.parse(savedDocs);
        return allDocs[tenderId] || [];
      }
    } catch (error) {
      console.error('Error loading revised documents from localStorage:', error);
    }
    return [];
  };

  const handleSaveRevisedDocuments = async () => {
    if (uploadFiles.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    if (!selectedTenderForUpload) return;

    // Update the tender operations board with new documents
    const updatedDocuments = [...selectedTenderForUpload.revisedDocuments, ...uploadFiles];
    setTenderOperationsBoard((prev) =>
      prev.map((tender) =>
        tender.id === selectedTenderForUpload.id
          ? {
              ...tender,
              revisedDocuments: updatedDocuments,
            }
          : tender
      )
    );

    // Save to localStorage (async)
    await saveRevisedDocumentsToStorage(selectedTenderForUpload.id, updatedDocuments);

    alert(`Successfully uploaded ${uploadFiles.length} revised document(s) for ${selectedTenderForUpload.name}.`);
    setShowUploadModal(false);
    setSelectedTenderForUpload(null);
    setUploadFiles([]);
  };

  // Handle viewing documents
  const handleViewDocuments = (tender) => {
    setSelectedTenderForView(tender);
    setShowViewDocumentsModal(true);
  };

  // Handle downloading a document
  const handleDownloadDocument = (file, index) => {
    if (file instanceof File) {
      // If it's a File object, create download link
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (file.data) {
      // If it's stored data, download from base64
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name || `document-${index + 1}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle viewing a document in new tab
  const handleViewDocument = (file, index) => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } else if (file.data) {
      window.open(file.data, '_blank');
    }
  };

  const handleBack = () => {
    // Navigate back to Document Upload page
    navigate("/tender/document-upload", {
      state: {
        tender,
        contractors,
        uploadedDocuments: location.state?.uploadedDocuments || [],
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

    // Contractor Pricing Section
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Contractor Pricing', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    tenderOperationsBoard.forEach((tender) => {
      checkPageBreak(15);
      doc.setFont('helvetica', 'bold');
      doc.text(`${tender.name}:`, margin, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      contractors.forEach((contractor) => {
        const pricing = contractorPricing[tender.id]?.[contractor.id] || {};
        checkPageBreak(6);
        doc.text(
          `  ${contractor.name}: ${pricing.price ? `${pricing.price} ${pricing.currency || 'AED'} (${pricing.status})` : 'Not submitted'}`,
          margin,
          yPosition
        );
        yPosition += 6;
      });
      yPosition += 5;
    });
    yPosition += 5;


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

  const handlePriceChange = (tenderId, contractorId, field, value) => {
    setContractorPricing(prev => ({
      ...prev,
      [tenderId]: {
        ...prev[tenderId],
        [contractorId]: {
          ...prev[tenderId][contractorId],
          [field]: value,
        },
      },
    }));
  };

  // Handle invitation letter upload
  const handleInvitationLetterUpload = (tenderId, contractorId, file) => {
    if (!file) return;

    // Validate file type (PDF or DOCX only)
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.docx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('Please upload only PDF or DOCX files for the invitation letter.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      alert(`File size exceeds 10 MB limit. Please select a smaller file.`);
      return;
    }

    const key = `${tenderId}-${contractorId}`;
    setInvitationLetters(prev => ({
      ...prev,
      [key]: file,
    }));

    alert(`Invitation letter "${file.name}" uploaded successfully for ${contractors.find(c => c.id === contractorId)?.name || 'contractor'}.`);
  };

  // Get invitation letter for a tender-contractor combination
  const getInvitationLetter = (tenderId, contractorId) => {
    const key = `${tenderId}-${contractorId}`;
    const letter = invitationLetters[key];
    
    // If letter exists but is stored metadata without file object, return null
    // (File objects can't be serialized to localStorage, so we store metadata)
    if (letter && letter.isFile && !(letter instanceof File) && !letter.data) {
      console.warn(`Invitation letter metadata found for ${key} but file object not available. Please re-upload.`);
      return null;
    }
    
    return letter || null;
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

      {/* Tender Operations Board */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-4">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Tender Operations Board
            </h2>
            <p className="text-slate-600">
              Upcoming deadlines, project managers, and live status for each opportunity. Contractors can upload revised documents here.
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
                  "Revised Documents",
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
                    <p className="font-medium text-slate-900">{row.name}</p>
                    <p className="text-xs text-slate-500">Tender Ref TBD</p>
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
                    {row.revisedDocuments.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-slate-700 font-medium">
                          {row.revisedDocuments.length} file(s)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDocuments(row)}
                            className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
                          >
                            <EyeIcon className="h-3 w-3" />
                            View Documents
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic">No documents</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedTenderForUpload(row);
                          setUploadFiles([]);
                          setShowUploadModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <CloudArrowUpIcon className="h-4 w-4" />
                        Upload Revised Docs
                      </button>
                      <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Contractor Pricing Table */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Contractor Pricing for All Tenders</h2>
            <p className="text-slate-600 mt-1">View and manage contractor prices/bids for each tender</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left">Tender Name</th>
                <th className="px-6 py-3 text-left">Contractor</th>
                <th className="px-6 py-3 text-left">Price (AED)</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Invitation Letter Upload</th>
                <th className="px-6 py-3 text-left">Submitted Date</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {tenderOperationsBoard.map((tender) =>
                contractors.map((contractor) => {
                  const pricing = contractorPricing[tender.id]?.[contractor.id] || {
                    price: "",
                    currency: "AED",
                    status: "pending",
                    submittedDate: null,
                  };
                  return (
                    <tr key={`${tender.id}-${contractor.id}`} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{tender.name}</p>
                        <p className="text-xs text-slate-500">{tender.client}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">{contractor.name}</p>
                        {contractor.specialty && (
                          <p className="text-xs text-slate-500">{contractor.specialty}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={pricing.price || ""}
                            onChange={(e) => handlePriceChange(tender.id, contractor.id, "price", e.target.value)}
                            className="w-40 px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm font-medium text-slate-900 bg-white"
                            placeholder="Enter price"
                          />
                          <span className="text-sm text-slate-600 font-medium">AED</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={pricing.status}
                          onChange={(e) => handlePriceChange(tender.id, contractor.id, "status", e.target.value)}
                          className="px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="submitted">Submitted</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <label className="relative cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleInvitationLetterUpload(tender.id, contractor.id, file);
                                }
                                // Reset input to allow re-uploading the same file
                                e.target.value = '';
                              }}
                              className="hidden"
                              id={`invitation-letter-${tender.id}-${contractor.id}`}
                            />
                            <span className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition border border-indigo-200">
                              <ArrowUpTrayIcon className="h-4 w-4" />
                              {getInvitationLetter(tender.id, contractor.id) ? 'Change File' : 'Upload Letter'}
                            </span>
                          </label>
                          {getInvitationLetter(tender.id, contractor.id) && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <DocumentTextIcon className="h-3 w-3 text-green-600" />
                              <span className="truncate max-w-[150px]" title={getInvitationLetter(tender.id, contractor.id).name}>
                                {getInvitationLetter(tender.id, contractor.id).name}
                              </span>
                              <button
                                onClick={() => {
                                  const key = `${tender.id}-${contractor.id}`;
                                  setInvitationLetters(prev => {
                                    const updated = { ...prev };
                                    delete updated[key];
                                    return updated;
                                  });
                                }}
                                className="text-red-600 hover:text-red-700"
                                title="Remove file"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {pricing.submittedDate ? (
                          new Date(pricing.submittedDate).toLocaleDateString()
                        ) : (
                          <span className="text-slate-400 italic">Not submitted</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            if (!pricing.price || parseFloat(pricing.price) <= 0) {
                              alert("Please enter a valid price before submitting.");
                              return;
                            }
                            handlePriceChange(tender.id, contractor.id, "status", "submitted");
                            handlePriceChange(tender.id, contractor.id, "submittedDate", new Date().toISOString());
                            alert(`Price submitted for ${contractor.name} - ${tender.name}`);
                          }}
                          className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                        >
                          Submit Price
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
              onClick={async () => {
                if (!tender || contractors.length === 0) {
                  alert("Please ensure tender and contractor information is available.");
                  return;
                }

                try {
                  // Prepare contractor data with invitation letters
                  const contractorData = await Promise.all(
                    contractors.map(async (contractor) => {
                      const invitationLetter = getInvitationLetter(tender.id, contractor.id);
                      let letterData = null;

                      try {
                        // Handle File object
                        if (invitationLetter instanceof File) {
                          letterData = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              console.log(`✓ Converted invitation letter for ${contractor.name}: ${invitationLetter.name}`);
                              resolve({
                                name: invitationLetter.name,
                                type: invitationLetter.type,
                                size: invitationLetter.size,
                                data: e.target.result, // base64 data URL
                              });
                            };
                            reader.onerror = (error) => {
                              console.error(`✗ Error reading file for ${contractor.name}:`, error);
                              reject(error);
                            };
                            reader.readAsDataURL(invitationLetter);
                          });
                        } 
                        // Handle stored data from localStorage (if it has data property)
                        else if (invitationLetter && invitationLetter.data) {
                          console.log(`✓ Using stored invitation letter for ${contractor.name}: ${invitationLetter.name}`);
                          letterData = invitationLetter;
                        }
                        // Handle stored metadata (need to reload from storage)
                        else if (invitationLetter && invitationLetter.name && !invitationLetter.data) {
                          console.warn(`⚠ Invitation letter metadata found for ${contractor.name} but file data missing. File may need to be re-uploaded.`);
                        }
                      } catch (error) {
                        console.error(`✗ Error processing invitation letter for ${contractor.name}:`, error);
                        // Continue without attachment if there's an error
                      }

                      return {
                        id: contractor.id,
                        name: contractor.name,
                        email: contractor.email || contractor.contactEmail || '',
                        specialty: contractor.specialty || '',
                        invitationLetter: letterData,
                      };
                    })
                  );

                  // Check if any invitation letters were uploaded
                  const hasInvitationLetters = contractorData.some(c => c.invitationLetter !== null);
                  const lettersCount = contractorData.filter(c => c.invitationLetter !== null).length;
                  
                  if (hasInvitationLetters) {
                    console.log(`✓ Preparing ${lettersCount} invitation letter(s) as email attachments`);
                    contractorData.forEach(c => {
                      if (c.invitationLetter) {
                        console.log(`  - ${c.name}: ${c.invitationLetter.name} (${(c.invitationLetter.size / 1024).toFixed(2)} KB)`);
                      }
                    });
                  } else {
                    console.log('⚠ No invitation letters uploaded - emails will be sent without attachments');
                  }

                  // Show loading state
                  const loadingMessage = `Sending tender invitations to ${contractors.length} contractor(s)${hasInvitationLetters ? ` with ${lettersCount} attachment(s)` : ''}...`;
                  console.log(loadingMessage);

                  // Send tender invitations with attachments
                  const result = await sendTenderInvitations(tender, contractorData);
                  
                  if (result.success) {
                    const letterInfo = result.attachmentsIncluded 
                      ? `\n✓ Invitation letters attached: ${result.attachmentCount} file(s)`
                      : '\n⚠ No invitation letters were attached';
                    
                    alert(
                      `✓ Tender invitations sent successfully!\n\n` +
                      `Tender: ${tender.name}\n` +
                      `Client: ${tender.client}\n` +
                      `Sent to: ${result.sentCount} contractor(s)${letterInfo}\n\n` +
                      `Tender Link: ${result.tenderLink}\n\n` +
                      `All selected contractors have been notified via email${result.attachmentsIncluded ? ' with invitation letter attachments' : ''}.`
                    );
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
                  } else {
                    alert(`Error sending invitations: ${result.error || 'Unknown error'}`);
                  }
                } catch (error) {
                  console.error("Error sending invitations:", error);
                  alert(`Error sending invitations: ${error.message}`);
                }
              }}
              className="px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-lg hover:shadow-xl"
              title="Send tender invitations to contractors"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
              Send Invitation
            </button>
            <button
              onClick={() => {
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
          </div>
        </div>
      </section>

      {/* Upload Revised Documents Modal */}
      {showUploadModal && selectedTenderForUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Upload Revised Documents
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Add revised documents for{" "}
                    <span className="font-semibold">{selectedTenderForUpload.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedTenderForUpload(null);
                    setUploadFiles([]);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <XMarkIcon className="h-6 w-6 text-slate-600" />
                </button>
              </div>

              {/* Tender Info */}
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-indigo-900">Tender:</span>
                    <p className="text-indigo-700">{selectedTenderForUpload.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-900">Client:</span>
                    <p className="text-indigo-700">{selectedTenderForUpload.client}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-900">Project Manager:</span>
                    <p className="text-indigo-700">{selectedTenderForUpload.owner}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-900">Status:</span>
                    <p className="text-indigo-700">{selectedTenderForUpload.status}</p>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Revised Documents *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-indigo-400 transition">
                  <input
                    type="file"
                    id="revised-docs-upload"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg,.dxf,.zip,.rar"
                    multiple
                    onChange={(e) => handleRevisedDocumentUpload(e.target.files)}
                  />
                  <label
                    htmlFor="revised-docs-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <ArrowUpTrayIcon className="h-12 w-12 text-slate-400 mb-3" />
                    <p className="text-sm text-slate-600 mb-1">
                      Click to upload or drag and drop revised documents
                    </p>
                    <p className="text-xs text-slate-500">
                      PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, DWG, DXF, ZIP, RAR (Max 10MB per file)
                    </p>
                  </label>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadFiles.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Files to Upload ({uploadFiles.length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uploadFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <PaperClipIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-700 truncate">{file.name}</span>
                          <span className="text-xs text-slate-500 flex-shrink-0">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveUploadFile(index)}
                          className="text-red-600 hover:text-red-700 flex-shrink-0 ml-2"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Documents */}
              {selectedTenderForUpload.revisedDocuments.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Existing Revised Documents ({selectedTenderForUpload.revisedDocuments.length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedTenderForUpload.revisedDocuments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <DocumentTextIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-slate-700 truncate">
                            {file.name || `Document ${index + 1}`}
                          </span>
                          {file.size && (
                            <span className="text-xs text-slate-500 flex-shrink-0">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <button
                            onClick={() => handleViewDocument(file, index)}
                            className="text-indigo-600 hover:text-indigo-700 p-1 rounded hover:bg-indigo-50"
                            title="View document"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(file, index)}
                            className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50"
                            title="Download document"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedTenderForUpload(null);
                    setUploadFiles([]);
                  }}
                  className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRevisedDocuments}
                  disabled={uploadFiles.length === 0}
                  className={`px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-lg hover:shadow-xl transition flex items-center gap-2 font-semibold ${
                    uploadFiles.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <CloudArrowUpIcon className="h-5 w-5" />
                  Upload Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Documents Modal */}
      {showViewDocumentsModal && selectedTenderForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Revised Documents
                  </h2>
                  <p className="text-slate-600 mt-1">
                    View and download revised documents for{" "}
                    <span className="font-semibold">{selectedTenderForView.name}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowViewDocumentsModal(false);
                    setSelectedTenderForView(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <XMarkIcon className="h-6 w-6 text-slate-600" />
                </button>
              </div>

              {/* Tender Info */}
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-indigo-900">Tender:</span>
                    <p className="text-indigo-700">{selectedTenderForView.name}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-900">Client:</span>
                    <p className="text-indigo-700">{selectedTenderForView.client}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-900">Project Manager:</span>
                    <p className="text-indigo-700">{selectedTenderForView.owner}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-indigo-900">Status:</span>
                    <p className="text-indigo-700">{selectedTenderForView.status}</p>
                  </div>
                </div>
              </div>

              {/* Documents List */}
              {selectedTenderForView.revisedDocuments && selectedTenderForView.revisedDocuments.length > 0 ? (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-4">
                    Documents ({selectedTenderForView.revisedDocuments.length})
                  </label>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedTenderForView.revisedDocuments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {file.name || `Document ${index + 1}`}
                            </p>
                            {file.size && (
                              <p className="text-xs text-slate-500 mt-1">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                {file.type && ` • ${file.type}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <button
                            onClick={() => handleViewDocument(file, index)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg transition"
                            title="View document"
                          >
                            <EyeIcon className="h-5 w-5" />
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(file, index)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition"
                            title="Download document"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg font-medium">No documents uploaded yet</p>
                  <p className="text-slate-400 text-sm mt-2">Upload revised documents to view them here</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowViewDocumentsModal(false);
                    setSelectedTenderForView(null);
                  }}
                  className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewDocumentsModal(false);
                    setSelectedTenderForView(null);
                    setSelectedTenderForUpload(selectedTenderForView);
                    setUploadFiles([]);
                    setShowUploadModal(true);
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-lg hover:shadow-xl transition flex items-center gap-2 font-semibold"
                >
                  <CloudArrowUpIcon className="h-5 w-5" />
                  Upload More Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

