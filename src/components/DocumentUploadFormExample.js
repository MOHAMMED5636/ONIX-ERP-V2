// Example: How to integrate DocumentUploadForm into your Clients.js Upload Documents section

import React, { useState } from 'react';
import DocumentUploadForm from './DocumentUploadForm';

const ClientsWithDocumentUpload = () => {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(true);

  const handleDocumentUpload = (documentData) => {
    console.log('Document uploaded:', documentData);
    
    // Create a new document entry
    const newDocument = {
      id: Date.now(),
      fileName: documentData.fileName,
      systemRef: documentData.referenceCode,
      documentTitle: documentData.file.name,
      documentCategory: DOCUMENT_TYPES_MASTER.find(
        doc => doc.code === documentData.documentType
      )?.label || 'Unknown',
      size: formatFileSize(documentData.file.size),
      uploadedOn: new Date().toLocaleDateString(),
      module: documentData.module,
      entityCode: documentData.entityCode,
      year: documentData.year,
      sequence: documentData.sequence
    };

    // Add to uploaded documents list
    setUploadedDocuments(prev => [...prev, newDocument]);
    
    // Show success message
    alert(`Document uploaded successfully!\nReference: ${documentData.referenceCode}`);
    
    // You can hide the form after successful upload if needed
    // setShowUploadForm(false);
  };

  const handleCancel = () => {
    setShowUploadForm(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Document Upload Form */}
      {showUploadForm && (
        <DocumentUploadForm 
          onSubmit={handleDocumentUpload}
          onCancel={handleCancel}
        />
      )}

      {/* Uploaded Documents Table */}
      {uploadedDocuments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">System Ref</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded On</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploadedDocuments.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{doc.fileName}</td>
                    <td className="px-4 py-3 text-sm font-mono text-blue-600">{doc.systemRef}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{doc.documentCategory}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{doc.size}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{doc.uploadedOn}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Show form button if hidden */}
      {!showUploadForm && (
        <button
          onClick={() => setShowUploadForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Upload Another Document
        </button>
      )}
    </div>
  );
};

export default ClientsWithDocumentUpload;



