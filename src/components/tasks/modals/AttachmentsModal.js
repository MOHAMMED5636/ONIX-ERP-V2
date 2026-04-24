import React, { useState, useCallback } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, DocumentIcon } from '@heroicons/react/24/outline';
import DocumentUploadForm, { DOCUMENT_TYPES_MASTER } from '../../DocumentUploadForm';
import { uploadDocument, getDocuments } from '../../../services/documentAPI';

const AttachmentsModal = ({ open, onClose, attachments = [], onSave, defaultModule = '', projectReferenceNumber = '' }) => {
  const [localAttachments, setLocalAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize local attachments when modal opens
  React.useEffect(() => {
    const loadExistingDocuments = async () => {
      if (!open) return;
      setLoading(true);
      try {
        // Use entityCode (project reference) + module to fetch documents for this project
        const entityCode = projectReferenceNumber || '';
        const module = defaultModule || 'PRJ';
        const response = await getDocuments(null);
        const docs = (response && response.data) || [];

        const filtered = docs.filter(
          (doc) =>
            (!entityCode || doc.entityCode === entityCode) &&
            (!module || doc.module === module)
        );

        const mapped = filtered.map((doc) => {
          const docType = DOCUMENT_TYPES_MASTER.find(
            (t) => t.code === doc.documentType && t.module === doc.module
          );
          return {
            id: doc.id,
            file: null,
            fileName: doc.fileName,
            systemRef: doc.referenceCode,
            documentTitle: doc.fileName,
            documentCategory: docType ? docType.label : 'General',
            module: doc.module,
            entityCode: doc.entityCode,
            documentType: doc.documentType,
            year: doc.year,
            sequence: doc.sequence,
            size: doc.fileSize,
            uploadedOn: doc.uploadedAt,
            description: docType ? docType.description : '',
          };
        });

        setLocalAttachments(mapped);
      } catch (err) {
        console.error('Failed to load project documents:', err);
        setLocalAttachments(attachments || []);
      } finally {
        setLoading(false);
      }
    };

    loadExistingDocuments();
  }, [open, attachments, defaultModule, projectReferenceNumber]);

  const handleDocumentUpload = async (documentData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('file', documentData.file);
      formData.append('module', documentData.module || defaultModule || 'PRJ');
      formData.append('entityCode', documentData.entityCode || projectReferenceNumber || '');
      formData.append('documentType', documentData.documentType || 'DOC');
      formData.append('year', String(documentData.year));
      formData.append('sequence', documentData.sequence || 'XXX');

      const response = await uploadDocument(formData);
      const saved = response?.data;

      const docType = DOCUMENT_TYPES_MASTER.find(
        (doc) => doc.code === saved.documentType && doc.module === saved.module
      );

      const newAttachment = {
        id: saved.id,
        file: null,
        fileName: saved.fileName,
        systemRef: saved.referenceCode,
        documentTitle: saved.fileName,
        documentCategory: docType ? docType.label : 'General',
        module: saved.module,
        entityCode: saved.entityCode,
        documentType: saved.documentType,
        year: saved.year,
        sequence: saved.sequence,
        size: saved.fileSize,
        uploadedOn: saved.uploadedAt,
        description: docType ? docType.description : '',
      };

      setLocalAttachments((prev) => [...prev, newAttachment]);
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert(error.message || 'Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeAttachment = (id) => {
    setLocalAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleSave = () => {
    onSave(localAttachments);
    onClose();
  };

  const handleCancel = () => {
    setLocalAttachments(attachments);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upload Documents</h2>
          <button
            onClick={handleCancel}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
          {/* Document Upload Form */}
          <div className="mb-6">
            <DocumentUploadForm 
              onSubmit={handleDocumentUpload}
              onCancel={handleCancel}
              defaultModule={defaultModule}
              projectReferenceNumber={projectReferenceNumber}
            />
          </div>

          {/* Step 2: Submitted Documents */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Step 2: Review and manage uploaded documents
            </h3>
            
            {localAttachments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-left">File Name</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-left">System Ref #</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-left">Document Title</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-left">Document Category</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-left">Size</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-left">Uploaded On</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localAttachments.map((attachment) => (
                      <tr key={attachment.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-sm">
                          <div className="flex items-center">
                            <DocumentIcon className="w-4 h-4 text-gray-500 mr-2" />
                            {attachment.fileName}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm">
                          <input
                            type="text"
                            value={attachment.systemRef}
                            onChange={(e) => {
                              setLocalAttachments(prev => 
                                prev.map(att => 
                                  att.id === attachment.id 
                                    ? { ...att, systemRef: e.target.value }
                                    : att
                                )
                              );
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="System reference..."
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm">
                          <input
                            type="text"
                            value={attachment.documentTitle}
                            onChange={(e) => {
                              setLocalAttachments(prev => 
                                prev.map(att => 
                                  att.id === attachment.id 
                                    ? { ...att, documentTitle: e.target.value }
                                    : att
                                )
                              );
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Document title..."
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm">
                          <select
                            value={attachment.documentCategory}
                            onChange={(e) => {
                              const selectedCategory = e.target.value;
                              
                              // Find the document type object for the selected category
                              const docType = DOCUMENT_TYPES_MASTER.find(doc => doc.label === selectedCategory);
                              
                              // Generate new system reference based on document type
                              const generateNewSystemRef = (docType, existingRef) => {
                                if (!docType) return existingRef;
                                
                                const currentYear = new Date().getFullYear();
                                const sequence = String(Date.now()).slice(-3); // Last 3 digits of timestamp
                                
                                // Extract module and entity code from existing ref or use defaults
                                let module = docType.module;
                                let entityCode = 'REF-002'; // Default entity code
                                
                                // Try to extract entity code from existing system ref
                                if (existingRef && existingRef.includes('-')) {
                                  const parts = existingRef.split('-');
                                  if (parts.length >= 2) {
                                    entityCode = parts[1];
                                  }
                                }
                                
                                return `${module}-${entityCode}-${docType.code}-${currentYear}-${sequence}`;
                              };
                              
                              const newSystemRef = generateNewSystemRef(docType, attachment.systemRef);
                              
                              setLocalAttachments(prev => 
                                prev.map(att => 
                                  att.id === attachment.id 
                                    ? { 
                                        ...att, 
                                        documentCategory: selectedCategory,
                                        systemRef: newSystemRef,
                                        documentType: docType?.code || att.documentType,
                                        module: docType?.module || att.module
                                      }
                                    : att
                                )
                              );
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Category</option>
                            
                            {/* Project Module */}
                            <optgroup label="📋 Project (PRJ) Documents">
                              {DOCUMENT_TYPES_MASTER.filter(doc => doc.module === 'PRJ').map(docType => (
                                <option key={`${docType.module}-${docType.code}`} value={docType.label}>
                                  {docType.label}
                                </option>
                              ))}
                            </optgroup>
                            
                            {/* Human Resources Module */}
                            <optgroup label="👥 Human Resources (HR) Documents">
                              {DOCUMENT_TYPES_MASTER.filter(doc => doc.module === 'HR').map(docType => (
                                <option key={`${docType.module}-${docType.code}`} value={docType.label}>
                                  {docType.label}
                                </option>
                              ))}
                            </optgroup>
                            
                            {/* Client Module */}
                            <optgroup label="🏢 Client (CLI) Documents">
                              {DOCUMENT_TYPES_MASTER.filter(doc => doc.module === 'CLI').map(docType => (
                                <option key={`${docType.module}-${docType.code}`} value={docType.label}>
                                  {docType.label}
                                </option>
                              ))}
                            </optgroup>
                            
                            {/* Finance Module */}
                            <optgroup label="💰 Finance (FIN) Documents">
                              {DOCUMENT_TYPES_MASTER.filter(doc => doc.module === 'FIN').map(docType => (
                                <option key={`${docType.module}-${docType.code}`} value={docType.label}>
                                  {docType.label}
                                </option>
                              ))}
                            </optgroup>
                            
                            {/* General Module */}
                            <optgroup label="📄 General (GEN) Documents">
                              {DOCUMENT_TYPES_MASTER.filter(doc => doc.module === 'GEN').map(docType => (
                                <option key={`${docType.module}-${docType.code}`} value={docType.label}>
                                  {docType.label}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                          {formatFileSize(attachment.size)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                          {new Date(attachment.uploadedOn).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <button
                            onClick={() => removeAttachment(attachment.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete file"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No documents uploaded yet</p>
                <p className="text-sm">Upload files to see them listed here</p>
              </div>
            )}
          </div>

          {/* Step 3: Completion */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Step 3: Click Done when you are finished
            </h3>
            <p className="text-sm text-gray-600">
              Depending on your connection speed and the size of the files you are uploading, 
              this operation may take anywhere from 10 seconds to 20 minutes. Please be patient 
              and do not click "Done" repeatedly.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachmentsModal;
