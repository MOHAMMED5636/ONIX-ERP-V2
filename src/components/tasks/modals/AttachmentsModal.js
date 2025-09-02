import React, { useState, useCallback } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon, DocumentIcon } from '@heroicons/react/24/outline';

const AttachmentsModal = ({ open, onClose, attachments = [], onSave }) => {
  const [localAttachments, setLocalAttachments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [systemRef, setSystemRef] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentCategory, setDocumentCategory] = useState('');

  // Initialize local attachments when modal opens
  React.useEffect(() => {
    if (open) {
      setLocalAttachments([...attachments]);
    }
  }, [open, attachments]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      const newAttachment = {
        id: Date.now() + Math.random(),
        file: file,
        fileName: file.name,
        systemRef: systemRef || `REF-${Date.now()}`,
        documentTitle: documentTitle || file.name,
        documentCategory: documentCategory || 'General',
        size: file.size,
        uploadedOn: new Date().toISOString()
      };
      setLocalAttachments(prev => [...prev, newAttachment]);
    });
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
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
          {/* Step 1: Upload Area */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Step 1: Drag and drop files in the area below OR click Upload File button
            </h3>
            
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg text-gray-600 mb-4">Drop files here</p>
              <p className="text-sm text-gray-500 mb-4">
                The total size of all uploaded files should not exceed 1000 MB.
              </p>
              
              {/* Upload Button */}
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <PlusIcon className="w-4 h-4 mr-2" />
                Upload a File
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="*/*"
                />
              </label>
            </div>
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
                              setLocalAttachments(prev => 
                                prev.map(att => 
                                  att.id === attachment.id 
                                    ? { ...att, documentCategory: e.target.value }
                                    : att
                                )
                              );
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="General">General</option>
                            <option value="Technical">Technical</option>
                            <option value="Financial">Financial</option>
                            <option value="Legal">Legal</option>
                            <option value="Design">Design</option>
                            <option value="Construction">Construction</option>
                            <option value="Permits">Permits</option>
                            <option value="Inspections">Inspections</option>
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
