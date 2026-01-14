import React, { useState, useEffect } from 'react';
import {
  DocumentIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  DocumentTextIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import {
  getDocuments,
  uploadDocument,
  replaceDocument,
  deleteDocument,
  downloadDocument,
} from '../services/documentAPI';
import { useAuth } from '../contexts/AuthContext';

const DOCUMENT_TYPES = [
  { value: 'labour_contract', label: 'Labour Contract' },
  { value: 'emirates_id_front', label: 'Emirates ID (Front)' },
  { value: 'emirates_id_back', label: 'Emirates ID (Back)' },
  { value: 'passport', label: 'Passport Copy' },
  { value: 'visa', label: 'Visa Copy' },
  { value: 'other', label: 'Other Official Document' },
];

const DocumentManagement = ({ userId = null, readOnly = false }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [documentType, setDocumentType] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  // Check if user is Admin
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchDocuments();
  }, [userId]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDocuments(userId);
      setDocuments(response.data || response || []);
      
      // Only show error if it's not a connection/404 issue (those are handled gracefully)
      if (response.data && response.data.length === 0 && !response.success) {
        setError('No documents found');
      }
    } catch (err) {
      // Don't show error for connection issues - backend might not be implemented yet
      if (!err.message.includes('Failed to fetch') && !err.message.includes('ERR_CONNECTION_REFUSED')) {
        setError(err.message || 'Failed to load documents');
      }
      // For demo purposes, use empty array if API fails
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload PDF, JPG, or PNG files only.');
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !documentType) {
      setError('Please select a document type and file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);
      if (userId) {
        formData.append('userId', userId);
      }

      await uploadDocument(formData);
      setSuccess('Document uploaded successfully!');
      setShowUploadModal(false);
      resetForm();
      fetchDocuments();
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleReplace = async (documentId, newFile) => {
    if (!newFile) {
      setError('Please select a file to replace');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('document', newFile);

      await replaceDocument(documentId, formData);
      setSuccess('Document replaced successfully!');
      fetchDocuments();
    } catch (err) {
      setError(err.message || 'Failed to replace document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await deleteDocument(documentId);
      setSuccess('Document deleted successfully!');
      fetchDocuments();
    } catch (err) {
      setError(err.message || 'Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      const blob = await downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.fileName || `document-${document.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || 'Failed to download document');
    }
  };

  const handleView = (document) => {
    setSelectedDocument(document);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFile(null);
    setFileName('');
    setDocumentType('');
    setError(null);
  };

  const getDocumentTypeLabel = (type) => {
    const docType = DOCUMENT_TYPES.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <DocumentIcon className="h-8 w-8" />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    }
    return <DocumentTextIcon className="h-8 w-8 text-red-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Admin Documents</h3>
          <p className="text-sm text-gray-600">Manage your official documents</p>
        </div>
        {!readOnly && isAdmin && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <PlusIcon className="h-5 w-5" />
            Upload Document
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No documents uploaded yet</p>
          {!readOnly && isAdmin && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Upload your first document
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {!readOnly && isAdmin && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.fileName)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {doc.fileName || `Document ${doc.id}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {getDocumentTypeLabel(doc.documentType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          doc.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {doc.status || 'active'}
                      </span>
                    </td>
                    {!readOnly && isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(doc)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="text-green-600 hover:text-green-900"
                            title="Download"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                          <label className="text-yellow-600 hover:text-yellow-900 cursor-pointer" title="Replace">
                            <PencilIcon className="h-5 w-5" />
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                const newFile = e.target.files[0];
                                if (newFile) {
                                  handleReplace(doc.id, newFile);
                                }
                              }}
                            />
                          </label>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={deleting}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select document type</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document File *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition">
                  <div className="space-y-1 text-center">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="sr-only"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                    {fileName && (
                      <p className="text-sm text-indigo-600 mt-2">{fileName}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !file || !documentType}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDocument.fileName || 'Document Preview'}
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedDocument(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2 text-gray-900">
                    {getDocumentTypeLabel(selectedDocument.documentType)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Upload Date:</span>
                  <span className="ml-2 text-gray-900">
                    {formatDate(selectedDocument.uploadedAt)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2 text-gray-900">{selectedDocument.status || 'active'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">File Size:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedDocument.fileSize
                      ? `${(selectedDocument.fileSize / 1024).toFixed(2)} KB`
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8 min-h-[400px]">
                  {selectedDocument.fileUrl ? (
                    <iframe
                      src={selectedDocument.fileUrl}
                      className="w-full h-[600px] border-0"
                      title="Document Preview"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <DocumentIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p>Document preview not available</p>
                      <button
                        onClick={() => handleDownload(selectedDocument)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Download to View
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleDownload(selectedDocument)}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Download Document
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedDocument(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;

