import React, { useState, useEffect } from 'react';
import { 
  DocumentArrowUpIcon, 
  XMarkIcon,
  FolderIcon,
  CalendarIcon,
  HashtagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Master table for document types with descriptions
const DOCUMENT_TYPES_MASTER = [
  // Project Module (PRJ)
  { "module": "PRJ", "code": "CNTR", "label": "Project Contract", "description": "Contracts with clients, contractors, vendors" },
  { "module": "PRJ", "code": "UND", "label": "Undertaking Letter", "description": "Undertaking or guarantee letters by clients or contractors" },
  { "module": "PRJ", "code": "DRW", "label": "Drawing / CAD", "description": "Engineering drawings, blueprints, CAD files" },
  { "module": "PRJ", "code": "RPT", "label": "Report", "description": "Site reports, inspection reports, technical reports" },
  { "module": "PRJ", "code": "SUP", "label": "Supervision Form", "description": "Site supervision forms, inspection checklists" },
  { "module": "PRJ", "code": "MOM", "label": "Minutes of Meeting", "description": "Meeting minutes related to project" },
  { "module": "PRJ", "code": "CORR", "label": "Correspondence / Letters", "description": "Letters, emails, communications related to project" },
  { "module": "PRJ", "code": "APP", "label": "Approval Documents", "description": "Approvals from client, authorities, or internal" },
  { "module": "PRJ", "code": "PERM", "label": "Permits", "description": "Building permits, construction permits, regulatory approvals" },
  { "module": "PRJ", "code": "INSP", "label": "Inspection Reports", "description": "Site inspections, quality control inspections" },
  { "module": "PRJ", "code": "TECH", "label": "Technical Specifications", "description": "Technical requirements, specifications, standards" },
  { "module": "PRJ", "code": "SITE", "label": "Site Photos", "description": "Progress photos, site documentation, visual records" },
  { "module": "PRJ", "code": "COST", "label": "Cost Estimation", "description": "Budget estimates, cost breakdowns, financial projections" },
  { "module": "PRJ", "code": "SCHED", "label": "Project Schedule", "description": "Timeline plans, milestone schedules, Gantt charts" },
  { "module": "PRJ", "code": "RISK", "label": "Risk Assessment", "description": "Risk analysis, mitigation plans, safety assessments" },
  { "module": "PRJ", "code": "QUAL", "label": "Quality Control", "description": "QC checklists, quality standards, testing reports" },
  { "module": "PRJ", "code": "ENV", "label": "Environmental", "description": "Environmental impact assessments, sustainability reports" },
  { "module": "PRJ", "code": "SAFE", "label": "Safety Documents", "description": "Safety protocols, incident reports, safety training" },
  { "module": "PRJ", "code": "DESIGN", "label": "Design Documents", "description": "Architectural designs, engineering designs, concept drawings" },
  { "module": "PRJ", "code": "CONSTRUCTION", "label": "Construction", "description": "Construction plans, building specifications, work orders" },
  
  // Human Resources Module (HR)
  { "module": "HR", "code": "ID", "label": "Employee ID / Passport", "description": "Employee identification documents" },
  { "module": "HR", "code": "MED", "label": "Medical Report", "description": "Employee health checks, fitness certificates" },
  { "module": "HR", "code": "CERT", "label": "HR Certificates", "description": "Training certificates, qualification certificates" },
  { "module": "HR", "code": "CNTR", "label": "Employment Contract", "description": "Employee contracts or agreements" },
  { "module": "HR", "code": "RESUME", "label": "Resume / CV", "description": "Employee resumes, curriculum vitae" },
  { "module": "HR", "code": "PERF", "label": "Performance Review", "description": "Employee performance evaluations, appraisals" },
  { "module": "HR", "code": "PAY", "label": "Payroll Documents", "description": "Salary slips, payroll reports, compensation records" },
  { "module": "HR", "code": "LEAVE", "label": "Leave Records", "description": "Annual leave, sick leave, vacation requests" },
  { "module": "HR", "code": "TRAIN", "label": "Training Records", "description": "Training completion certificates, skill assessments" },
  { "module": "HR", "code": "DISC", "label": "Disciplinary", "description": "Disciplinary actions, warnings, corrective measures" },
  { "module": "HR", "code": "POLICY", "label": "HR Policies", "description": "Company policies, procedures, guidelines" },
  { "module": "HR", "code": "BENEFIT", "label": "Benefits", "description": "Insurance documents, benefit enrollment, coverage details" },
  { "module": "HR", "code": "ONBOARD", "label": "Onboarding", "description": "New employee onboarding documents, orientation materials" },
  { "module": "HR", "code": "TERMINATION", "label": "Termination", "description": "Exit interviews, termination notices, final settlements" },
  
  // Client Module (CLI)
  { "module": "CLI", "code": "ID", "label": "Client ID / Passport", "description": "Client identification documents" },
  { "module": "CLI", "code": "CNTR", "label": "Client Contract", "description": "Contracts with clients" },
  { "module": "CLI", "code": "UND", "label": "Client Undertaking", "description": "Undertaking letters by clients" },
  { "module": "CLI", "code": "PROFILE", "label": "Client Profile", "description": "Client information, company profiles, contact details" },
  { "module": "CLI", "code": "COMM", "label": "Communications", "description": "Client emails, phone records, meeting notes" },
  { "module": "CLI", "code": "FEEDBACK", "label": "Client Feedback", "description": "Customer feedback, satisfaction surveys, testimonials" },
  { "module": "CLI", "code": "PROPOSAL", "label": "Proposals", "description": "Project proposals, service offerings, bids" },
  { "module": "CLI", "code": "WARRANTY", "label": "Warranty", "description": "Warranty documents, guarantee certificates, service agreements" },
  { "module": "CLI", "code": "SERVICE", "label": "Service Records", "description": "Service delivery records, maintenance logs, support tickets" },
  { "module": "CLI", "code": "PAYMENT", "label": "Payment Records", "description": "Payment history, billing records, financial transactions" },
  
  // Finance Module (FIN)
  { "module": "FIN", "code": "INV", "label": "Tax Invoice", "description": "Official tax invoices for clients or vendors" },
  { "module": "FIN", "code": "PINV", "label": "Proforma Invoice", "description": "Proforma invoices for quotations" },
  { "module": "FIN", "code": "QUO", "label": "Quotation", "description": "Price quotations, offers" },
  { "module": "FIN", "code": "PAY", "label": "Payment / Finance Document", "description": "Payment receipts, bank transfers, payment approvals" },
  { "module": "FIN", "code": "BUDGET", "label": "Budget", "description": "Budget plans, financial forecasts, cost estimates" },
  { "module": "FIN", "code": "EXPENSE", "label": "Expense Reports", "description": "Expense claims, reimbursement requests, cost tracking" },
  { "module": "FIN", "code": "ACCOUNT", "label": "Accounting", "description": "Financial statements, balance sheets, profit/loss reports" },
  { "module": "FIN", "code": "TAX", "label": "Tax Documents", "description": "Tax returns, VAT documents, tax compliance records" },
  { "module": "FIN", "code": "AUDIT", "label": "Audit Reports", "description": "Internal audits, external audits, compliance reports" },
  { "module": "FIN", "code": "BANK", "label": "Banking", "description": "Bank statements, transaction records, financial transfers" },
  { "module": "FIN", "code": "CREDIT", "label": "Credit Notes", "description": "Credit memos, adjustment notes, refund documents" },
  { "module": "FIN", "code": "DEBIT", "label": "Debit Notes", "description": "Debit memos, charge adjustments, additional billing" },
  { "module": "FIN", "code": "RECONCILE", "label": "Reconciliation", "description": "Account reconciliation, balance verification, discrepancy reports" },
  
  // General Module (GEN)
  { "module": "GEN", "code": "DOC", "label": "General Document", "description": "Miscellaneous files not classified elsewhere" },
  { "module": "GEN", "code": "LET", "label": "General Letter", "description": "Any letters not tied to project/client" },
  { "module": "GEN", "code": "SUB", "label": "Subcontractor Letter", "description": "Letters or agreements from subcontractors" },
  { "module": "GEN", "code": "CORR", "label": "General Correspondence", "description": "Emails or letters not tied to project/client" },
  { "module": "GEN", "code": "MANUAL", "label": "Manuals", "description": "User manuals, operation guides, instruction documents" },
  { "module": "GEN", "code": "TEMPLATE", "label": "Templates", "description": "Document templates, forms, standard formats" },
  { "module": "GEN", "code": "ARCHIVE", "label": "Archive", "description": "Historical documents, old records, archived files" },
  { "module": "GEN", "code": "BACKUP", "label": "Backup", "description": "Data backups, system backups, file archives" },
  { "module": "GEN", "code": "REFERENCE", "label": "Reference", "description": "Reference materials, research documents, guides" },
  { "module": "GEN", "code": "LEGAL", "label": "Legal Documents", "description": "Legal agreements, compliance documents, regulatory filings" },
  { "module": "GEN", "code": "TECHNICAL", "label": "Technical", "description": "Technical documentation, specifications, standards" },
  { "module": "GEN", "code": "INSPECTIONS", "label": "Inspections", "description": "Inspection reports, quality assessments, compliance checks" }
];

const MODULES = [
  { value: 'PRJ', label: 'Project (PRJ)' },
  { value: 'HR', label: 'Human Resources (HR)' },
  { value: 'CLI', label: 'Client (CLI)' },
  { value: 'FIN', label: 'Finance (FIN)' },
  { value: 'GEN', label: 'General (GEN)' }
];

const DocumentUploadForm = ({ onSubmit, onCancel, defaultModule = '', projectReferenceNumber = '', clientReferenceNumber = '' }) => {
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState({
    module: defaultModule || '',
    entityCode: (defaultModule === 'CLI' ? clientReferenceNumber : projectReferenceNumber) || '',
    documentType: '',
    year: currentYear,
    sequence: 'XXX',
    file: null
  });

  const [errors, setErrors] = useState({});
  const [availableDocTypes, setAvailableDocTypes] = useState([]);
  const [generatedRefCode, setGeneratedRefCode] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Update available document types when module changes
  useEffect(() => {
    // Always show all document types from all modules
    setAvailableDocTypes(DOCUMENT_TYPES_MASTER);
  }, []);

  // Auto-submit when file is selected and form is ready
  useEffect(() => {
    console.log('Auto-submit effect triggered:', { shouldAutoSubmit, hasFile: !!formData.file, hasEntityCode: !!formData.entityCode, hasDocumentType: !!formData.documentType });
    
    if (shouldAutoSubmit && formData.file && formData.entityCode && formData.documentType) {
      console.log('Auto-submitting form with complete data:', formData);
      handleSubmit();
      setShouldAutoSubmit(false);
    }
  }, [shouldAutoSubmit, formData.file, formData.entityCode, formData.documentType]);

  // Update form when defaultModule changes
  useEffect(() => {
    if (defaultModule) {
      setFormData(prev => ({
        ...prev,
        module: defaultModule,
        entityCode: (defaultModule === 'CLI' ? clientReferenceNumber : projectReferenceNumber) || prev.entityCode
      }));
    }
  }, [defaultModule, clientReferenceNumber, projectReferenceNumber]);

  // Generate reference code dynamically
  useEffect(() => {
    const { module, entityCode, documentType, year, sequence } = formData;
    
    if (module && entityCode && documentType && year && sequence) {
      // Use the selected module (PRJ, HR, CLI, FIN, GEN)
      const refCode = `${module}-${entityCode}-${documentType}-${year}-${sequence}`;
      setGeneratedRefCode(refCode);
    } else {
      setGeneratedRefCode('');
    }
  }, [formData.module, formData.entityCode, formData.documentType, formData.year, formData.sequence]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndProcessFile(file);
  };

  const validateAndProcessFile = (file) => {
    if (!file) return false;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        file: 'Only PDF, DOCX, XLSX, PNG, and JPG files are allowed' 
      }));
      return false;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ 
        ...prev, 
        file: 'File size must be less than 10MB' 
      }));
      return false;
    }

    setFormData(prev => {
      const updated = { ...prev, file };
      console.log('Setting form data with file:', updated);
      return updated;
    });
    setSelectedFileName(file.name);
    setErrors(prev => ({ ...prev, file: '' }));
    
    // Auto-populate missing fields and trigger auto-submit
    const autoEntityCode = formData.entityCode || (defaultModule === 'CLI' ? `CLI-${Date.now()}` : `PRJ-${Date.now()}`);
    const autoDocType = formData.documentType || (availableDocTypes[0]?.code || 'DOC');
    
    setFormData(prev => ({
      ...prev,
      entityCode: autoEntityCode,
      documentType: autoDocType
    }));
    
    console.log('Auto-populated fields:', { autoEntityCode, autoDocType });
    setShouldAutoSubmit(true);
    return true;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      validateAndProcessFile(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    console.log('Validating form data:', formData);
    console.log('Entity Code:', formData.entityCode);
    console.log('Document Type:', formData.documentType);
    console.log('File:', formData.file);

    // For auto-submit, only require file
    if (!formData.file) {
      newErrors.file = 'File is required';
      console.log('File validation failed');
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    console.log('Form validation starting...', formData);
    const isValid = validateForm();
    console.log('Form validation result:', isValid, 'Errors:', errors);
    
    if (isValid) {
      const documentData = {
        ...formData,
        module: formData.module, // Use the actual module from formData
        referenceCode: generatedRefCode,
        uploadedOn: new Date().toISOString(),
        fileName: selectedFileName
      };
      
      console.log('Submitting document data:', documentData);
      onSubmit(documentData);
    } else {
      console.log('Form validation failed:', errors);
    }
  };

  const handleReset = () => {
    setFormData({
      module: '',
      entityCode: '',
      documentType: '',
      year: currentYear,
      sequence: 'XXX',
      file: null
    });
    setSelectedFileName('');
    setErrors({});
    setGeneratedRefCode('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <DocumentArrowUpIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Document Upload Form</h3>
            <p className="text-blue-100 text-sm">Fill in the details and upload your document</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          
          {/* Module Selection - Auto-selected based on context */}
          {/* Module - Hidden but functional */}
          <div className="hidden">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FolderIcon className="w-4 h-4 inline mr-1" />
              Module <span className="text-red-500">*</span>
            </label>
            <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-600">
              {formData.module === 'CLI' ? 'Client (CLI)' : 
               formData.module === 'HR' ? 'Human Resources (HR)' :
               formData.module === 'PRJ' ? 'Project (PRJ)' :
               formData.module === 'FIN' ? 'Finance (FIN)' :
               formData.module === 'GEN' ? 'General (GEN)' : 'Select Module'}
            </div>
          </div>

          {/* Entity Code - Hidden but functional */}
          <div className="hidden">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <HashtagIcon className="w-4 h-4 inline mr-1" />
              Entity Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.entityCode}
              onChange={(e) => handleChange('entityCode', e.target.value.toUpperCase())}
              placeholder={defaultModule === 'CLI' ? "e.g., CLI-123, CLI-456" : defaultModule === 'HR' ? "e.g., EMP-015, EMP-020" : defaultModule === 'PRJ' ? "e.g., REF-002, PRJ-001" : "e.g., REF-002, EMP-015, CLI-123"}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.entityCode ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.entityCode && (
              <p className="mt-1 text-sm text-red-500">{errors.entityCode}</p>
            )}
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <DocumentTextIcon className="w-4 h-4 inline mr-1" />
              Document Type / Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.documentType}
              onChange={(e) => handleChange('documentType', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                errors.documentType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Document Type / Category</option>
              
              {/* Project Module */}
              <optgroup label="📋 Project (PRJ) Documents">
                {availableDocTypes.filter(doc => doc.module === 'PRJ').map(docType => (
                  <option key={`${docType.module}-${docType.code}`} value={docType.code} title={docType.description}>
                    {docType.label} ({docType.code})
                  </option>
                ))}
              </optgroup>
              
              {/* Human Resources Module */}
              <optgroup label="👥 Human Resources (HR) Documents">
                {availableDocTypes.filter(doc => doc.module === 'HR').map(docType => (
                  <option key={`${docType.module}-${docType.code}`} value={docType.code} title={docType.description}>
                    {docType.label} ({docType.code})
                  </option>
                ))}
              </optgroup>
              
              {/* Client Module */}
              <optgroup label="🏢 Client (CLI) Documents">
                {availableDocTypes.filter(doc => doc.module === 'CLI').map(docType => (
                  <option key={`${docType.module}-${docType.code}`} value={docType.code} title={docType.description}>
                    {docType.label} ({docType.code})
                  </option>
                ))}
              </optgroup>
              
              {/* Finance Module */}
              <optgroup label="💰 Finance (FIN) Documents">
                {availableDocTypes.filter(doc => doc.module === 'FIN').map(docType => (
                  <option key={`${docType.module}-${docType.code}`} value={docType.code} title={docType.description}>
                    {docType.label} ({docType.code})
                  </option>
                ))}
              </optgroup>
              
              {/* General Module */}
              <optgroup label="📄 General (GEN) Documents">
                {availableDocTypes.filter(doc => doc.module === 'GEN').map(docType => (
                  <option key={`${docType.module}-${docType.code}`} value={docType.code} title={docType.description}>
                    {docType.label} ({docType.code})
                  </option>
                ))}
              </optgroup>
            </select>
            {errors.documentType && (
              <p className="mt-1 text-sm text-red-500">{errors.documentType}</p>
            )}
            {formData.documentType && (
              <p className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                <span className="font-semibold">Description:</span>{' '}
                {availableDocTypes.find(d => d.code === formData.documentType)?.description}
              </p>
            )}
          </div>

          {/* Year and Sequence Row - Hidden but functional */}
          <div className="hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Year */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Year
              </label>
              <input
                type="text"
                value={formData.year}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600"
              />
            </div>

            {/* Sequence */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sequence Number
              </label>
              <input
                type="text"
                value={formData.sequence}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600 font-mono"
              />
            </div>
          </div>

          {/* Generated Reference Code - Hidden but functional */}
          <div className="hidden bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Generated Reference Code
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border-2 border-blue-300">
              <p className="text-lg font-mono font-bold text-blue-600">
                {generatedRefCode || 'Fill in all fields to generate code'}
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Document <span className="text-red-500">*</span>
            </label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                errors.file 
                  ? 'border-red-500 bg-red-50' 
                  : isDragOver 
                    ? 'border-blue-500 bg-blue-100 scale-105 shadow-lg' 
                    : 'border-gray-300 hover:border-blue-400 bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <DocumentArrowUpIcon className={`w-12 h-12 mx-auto mb-3 transition-all ${
                isDragOver ? 'text-blue-500 animate-bounce' : 'text-gray-400'
              }`} />
              
              {selectedFileName ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected File:</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                    <DocumentTextIcon className="w-5 h-5" />
                    <span className="font-medium">{selectedFileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, file: null }));
                        setSelectedFileName('');
                      }}
                      className="ml-2 text-blue-700 hover:text-blue-900"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className={`text-sm mb-2 transition-colors ${
                    isDragOver ? 'text-blue-600 font-medium' : 'text-gray-600'
                  }`}>
                    {isDragOver 
                      ? 'Drop your file here!' 
                      : 'Drag & drop or click to select file - it will be uploaded automatically'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Accepted: PDF, DOCX, XLSX, PNG, JPG (Max 10MB)
                  </p>
                </div>
              )}
              
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                className="hidden"
                id="document-upload"
              />
              <label
                htmlFor="document-upload"
                className={`inline-block px-6 py-2 rounded-lg transition-all cursor-pointer ${
                  isDragOver 
                    ? 'bg-blue-700 text-white shadow-lg' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isDragOver ? 'Release to Upload' : 'Choose File'}
              </label>
            </div>
            {errors.file && (
              <p className="mt-2 text-sm text-red-500">{errors.file}</p>
            )}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Reset Form
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploadForm;
export { DOCUMENT_TYPES_MASTER };

