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
  { "module": "PRJ", "code": "CNTR", "label": "Project Contract", "description": "Contracts with clients, contractors, vendors" },
  { "module": "PRJ", "code": "UND", "label": "Undertaking Letter", "description": "Undertaking or guarantee letters by clients or contractors" },
  { "module": "PRJ", "code": "DRW", "label": "Drawing / CAD", "description": "Engineering drawings, blueprints, CAD files" },
  { "module": "PRJ", "code": "RPT", "label": "Report", "description": "Site reports, inspection reports, technical reports" },
  { "module": "PRJ", "code": "SUP", "label": "Supervision Form", "description": "Site supervision forms, inspection checklists" },
  { "module": "PRJ", "code": "MOM", "label": "Minutes of Meeting", "description": "Meeting minutes related to project" },
  { "module": "PRJ", "code": "CORR", "label": "Correspondence / Letters", "description": "Letters, emails, communications related to project" },
  { "module": "PRJ", "code": "APP", "label": "Approval Documents", "description": "Approvals from client, authorities, or internal" },
  { "module": "HR", "code": "ID", "label": "Employee ID / Passport", "description": "Employee identification documents" },
  { "module": "HR", "code": "MED", "label": "Medical Report", "description": "Employee health checks, fitness certificates" },
  { "module": "HR", "code": "CERT", "label": "HR Certificates", "description": "Training certificates, qualification certificates" },
  { "module": "HR", "code": "CNTR", "label": "Employment Contract", "description": "Employee contracts or agreements" },
  { "module": "CLI", "code": "ID", "label": "Client ID / Passport", "description": "Client identification documents" },
  { "module": "CLI", "code": "CNTR", "label": "Client Contract", "description": "Contracts with clients" },
  { "module": "CLI", "code": "UND", "label": "Client Undertaking", "description": "Undertaking letters by clients" },
  { "module": "FIN", "code": "INV", "label": "Tax Invoice", "description": "Official tax invoices for clients or vendors" },
  { "module": "FIN", "code": "PINV", "label": "Proforma Invoice", "description": "Proforma invoices for quotations" },
  { "module": "FIN", "code": "QUO", "label": "Quotation", "description": "Price quotations, offers" },
  { "module": "FIN", "code": "PAY", "label": "Payment / Finance Document", "description": "Payment receipts, bank transfers, payment approvals" },
  { "module": "GEN", "code": "DOC", "label": "General Document", "description": "Miscellaneous files not classified elsewhere" },
  { "module": "GEN", "code": "LET", "label": "General Letter", "description": "Any letters not tied to project/client" },
  { "module": "GEN", "code": "SUB", "label": "Subcontractor Letter", "description": "Letters or agreements from subcontractors" },
  { "module": "GEN", "code": "CORR", "label": "General Correspondence", "description": "Emails or letters not tied to project/client" }
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

  // Update available document types when module changes
  useEffect(() => {
    // Always show all document types from all modules
    setAvailableDocTypes(DOCUMENT_TYPES_MASTER);
  }, []);

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
    if (file) {
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
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          file: 'File size must be less than 10MB' 
        }));
        return;
      }

      setFormData(prev => ({ ...prev, file }));
      setSelectedFileName(file.name);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.entityCode) {
      newErrors.entityCode = 'Entity Code is required';
    }
    if (!formData.documentType) {
      newErrors.documentType = 'Document Type is required';
    }
    if (!formData.file) {
      newErrors.file = 'File is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const documentData = {
        ...formData,
        module: 'PRJ', // Always use PRJ module for project context
        referenceCode: generatedRefCode,
        uploadedOn: new Date().toISOString(),
        fileName: selectedFileName
      };
      
      onSubmit(documentData);
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
          <div>
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
            <p className="mt-1 text-xs text-blue-600">
              Module automatically selected for {formData.module === 'CLI' ? 'client' : 
               formData.module === 'HR' ? 'employee' :
               formData.module === 'PRJ' ? 'project' :
               formData.module === 'FIN' ? 'finance' :
               formData.module === 'GEN' ? 'general' : 'context'} context
            </p>
          </div>

          {/* Entity Code */}
          <div>
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
            <p className="mt-1 text-xs text-gray-500">
              Enter the reference code of the {defaultModule === 'CLI' ? 'client' : defaultModule === 'HR' ? 'employee' : defaultModule === 'PRJ' ? 'project' : 'entity'}
            </p>
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
              <option value="">Select Document Type</option>
              {availableDocTypes.map(docType => (
                <option key={`${docType.module}-${docType.code}`} value={docType.code} title={docType.description}>
                  {docType.label} ({docType.code})
                </option>
              ))}
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

          {/* Year and Sequence Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="mt-1 text-xs text-gray-500">Auto-filled with current year</p>
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
              <p className="mt-1 text-xs text-gray-500">Auto-assigned by system</p>
            </div>
          </div>

          {/* Generated Reference Code */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Generated Reference Code
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border-2 border-blue-300">
              <p className="text-lg font-mono font-bold text-blue-600">
                {generatedRefCode || 'Fill in all fields to generate code'}
              </p>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Format: [MODULE]-[ENTITY_CODE]-[SUB_TYPE]-[YEAR]-[SEQUENCE]
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Document <span className="text-red-500">*</span>
            </label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              errors.file ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'
            }`}>
              <DocumentArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              
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
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop file here, or click to select
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
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Choose File
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
          <button
            type="submit"
            className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Upload Document
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploadForm;
export { DOCUMENT_TYPES_MASTER };

