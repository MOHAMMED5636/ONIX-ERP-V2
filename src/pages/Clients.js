import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  StarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import ClientsAPI from '../services/clientsAPI';
import DocumentUploadForm, { DOCUMENT_TYPES_MASTER } from '../components/DocumentUploadForm';

// Mock data - replace with API call
const mockClients = [];

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCorporate, setFilterCorporate] = useState('all');
  const [filterLeadSource, setFilterLeadSource] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [viewModalEditMode, setViewModalEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editDocumentRows, setEditDocumentRows] = useState([]);
  const [savingClient, setSavingClient] = useState(false);
  const [editError, setEditError] = useState('');
  const [createUserAccount, setCreateUserAccount] = useState(false);
  const [userAccount, setUserAccount] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [documents, setDocuments] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  // Multiple documents in table form (like Contract upload)
  const [clientDocumentRows, setClientDocumentRows] = useState([
    { id: 1, documentType: '', file: null, fileName: '' },
  ]);
  const [clientType, setClientType] = useState('');
  const [clientFormData, setClientFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    leadSource: '',
    rank: '',
    nationality: '',
    idNumber: '',
    idExpiryDate: '',
    passportNumber: '',
    birthDate: ''
  });
  const [companyInfo, setCompanyInfo] = useState({
    corporateName: '',
    website: '',
    licenseNumber: '',
    address: '',
    description: '',
    trnNumber: '',
    ibanNumber: ''
  });

  // Extract fetchClients as a reusable function
  const fetchClients = async (page = currentPage) => {
    setLoading(true);
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const apiPromise = ClientsAPI.getClients({
        page: page,
        limit: itemsPerPage,
        search: searchQuery,
        corporate: filterCorporate !== 'all' ? filterCorporate : undefined,
        leadSource: filterLeadSource !== 'all' ? filterLeadSource : undefined,
      });
      
      // Race between API call and timeout
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      // Extract clients array from response structure
      // Backend returns: { success: true, data: { clients: [...], pagination: {...} } }
      const clientsArray = response?.data?.clients || response?.clients || (Array.isArray(response?.data) ? response.data : []);
      
      setClients(clientsArray);
      setFilteredClients(clientsArray);
      return clientsArray;
    } catch (error) {
      console.error('Error fetching clients from API, using mock data:', error);
      // Fallback to mock data if API fails
      setClients(mockClients);
      setFilteredClients(mockClients);
      return mockClients;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [currentPage, searchQuery, filterCorporate, filterLeadSource, itemsPerPage]);

  // Initial load effect to ensure loading state is properly managed
  useEffect(() => {
    const safeClients = Array.isArray(clients) ? clients : [];
    if (safeClients.length === 0 && !loading) {
      setClients(mockClients);
      setFilteredClients(mockClients);
    }
  }, [clients, loading]);

  useEffect(() => {
    // Ensure clients is an array before filtering
    if (!Array.isArray(clients)) {
      console.warn('Clients is not an array:', clients);
      setFilteredClients([]);
      return;
    }

    let filtered = [...clients]; // Create a copy to avoid mutating original

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(client =>
        client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client?.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Corporate filter
    if (filterCorporate !== 'all') {
      filtered = filtered.filter(client => client?.isCorporate === filterCorporate);
    }

    // Lead source filter
    if (filterLeadSource !== 'all') {
      filtered = filtered.filter(client => client?.leadSource === filterLeadSource);
    }

    setFilteredClients(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [clients, searchQuery, filterCorporate, filterLeadSource]);

  // Pagination logic - ensure filteredClients is an array
  const safeFilteredClients = Array.isArray(filteredClients) ? filteredClients : [];
  const totalPages = Math.ceil(safeFilteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = safeFilteredClients.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setViewModalEditMode(false);
    setEditFormData(null);
    setEditError('');
    setShowViewModal(true);
  };

  const handleStartEditClient = () => {
    if (!selectedClient) return;
    const c = selectedClient;
    const formatDate = (d) => {
      if (!d) return '';
      const date = new Date(d);
      return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
    };
    setEditFormData({
      name: c.name || '',
      referenceNumber: c.referenceNumber || '',
      isCorporate: c.isCorporate || 'Person',
      rank: c.rank || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      nationality: c.nationality || '',
      idNumber: c.idNumber || '',
      idExpiryDate: formatDate(c.idExpiryDate || c.idEndDate),
      passportNumber: c.passportNumber || '',
      birthDate: formatDate(c.birthDate),
      leadSource: c.leadSource || '',
    });
    // Load existing document attachments into edit rows (3-column table)
    let existing = [];
    try {
      const raw = c.documentAttachments;
      if (typeof raw === 'string' && raw) existing = JSON.parse(raw) || [];
      else if (Array.isArray(raw)) existing = raw;
    } catch (_) {}
    const rows = existing.length
      ? existing.map((att, i) => ({
          id: `existing-${i}-${att.path || ''}`,
          documentType: att.documentType || 'DOC',
          path: att.path,
          originalName: att.originalName || '',
          file: null,
          fileName: '',
        }))
      : [{ id: Date.now(), documentType: '', path: null, originalName: '', file: null, fileName: '' }];
    setEditDocumentRows(rows);
    setViewModalEditMode(true);
    setEditError('');
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleCancelEdit = () => {
    setViewModalEditMode(false);
    setEditFormData(null);
    setEditDocumentRows([]);
    setEditError('');
  };

  const handleSaveEdit = async () => {
    if (!selectedClient || !editFormData) return;
    setSavingClient(true);
    setEditError('');
    try {
      const payload = {
        name: editFormData.name?.trim(),
        isCorporate: editFormData.isCorporate,
        leadSource: editFormData.leadSource || null,
        rank: editFormData.rank || null,
        email: editFormData.email?.trim() || null,
        phone: editFormData.phone?.trim() || null,
        address: editFormData.address?.trim() || null,
        nationality: editFormData.nationality || null,
        idNumber: editFormData.idNumber?.trim() || null,
        idExpiryDate: editFormData.idExpiryDate || null,
        passportNumber: editFormData.passportNumber?.trim() || null,
        birthDate: editFormData.birthDate || null,
      };
      const existingAttachments = editDocumentRows
        .filter((r) => r.path && !r.file)
        .map((r) => ({ documentType: r.documentType || 'DOC', path: r.path, originalName: r.originalName || '' }));
      const newFileRows = editDocumentRows.filter((r) => r.file instanceof File);
      const hasNewFiles = newFileRows.length > 0;
      let response;
      if (hasNewFiles) {
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
          const v = payload[key];
          if (v !== null && v !== undefined && v !== '') formData.append(key, String(v));
        });
        formData.append('existingDocumentAttachments', JSON.stringify(existingAttachments));
        formData.append('documentTypes', JSON.stringify(newFileRows.map((r) => r.documentType || 'DOC')));
        newFileRows.forEach((r) => formData.append('documents', r.file));
        response = await ClientsAPI.updateClient(selectedClient.id, formData);
      } else {
        const body = { ...payload, existingDocumentAttachments: JSON.stringify(existingAttachments) };
        response = await ClientsAPI.updateClient(selectedClient.id, body);
      }
      if (response?.success && response?.data) {
        setSelectedClient(response.data);
        setClients((prev) => prev.map((c) => (c.id === selectedClient.id ? response.data : c)));
        setFilteredClients((prev) => prev.map((c) => (c.id === selectedClient.id ? response.data : c)));
        setViewModalEditMode(false);
        setEditFormData(null);
        setEditDocumentRows([]);
      } else {
        setEditError(response?.message || 'Failed to update client');
      }
    } catch (err) {
      setEditError(err?.message || 'Failed to update client');
    } finally {
      setSavingClient(false);
    }
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowViewModal(true);
    setViewModalEditMode(false);
    setEditFormData(null);
    setTimeout(() => handleStartEditClient(), 0);
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!clientFormData.name || !clientFormData.name.trim()) {
      alert('Client name is required');
      return;
    }

    if (!clientType) {
      alert('Client type (Person/Company) is required');
      return;
    }

    if (!clientFormData.email) {
      alert('Email is required');
      return;
    }

    if (!clientFormData.phone) {
      alert('Phone is required');
      return;
    }

    // Validate user account if creating one
    if (createUserAccount) {
      if (!userAccount.username || !userAccount.password || !userAccount.confirmPassword) {
        alert('Please fill in all user account fields.');
        return;
      }
      if (userAccount.password !== userAccount.confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    
    try {
      // Prepare client data
      const clientData = {
        name: clientFormData.name.trim(),
        isCorporate: clientType,
        email: clientFormData.email.trim(),
        phone: clientFormData.phone.trim(),
        address: clientFormData.address?.trim() || null,
        leadSource: clientFormData.leadSource || null,
        rank: clientFormData.rank || null,
        nationality: clientFormData.nationality || null,
        idNumber: clientFormData.idNumber?.trim() || null,
        idExpiryDate: clientFormData.idExpiryDate || null,
        passportNumber: clientFormData.passportNumber?.trim() || null,
        birthDate: clientFormData.birthDate || null,
      };

      // Build FormData: client fields + multiple documents (table form like Contract)
      const rowsWithFiles = clientDocumentRows.filter((r) => r.file instanceof File);
      const formDataToSend = new FormData();
      Object.keys(clientData).forEach((key) => {
        if (clientData[key] !== null && clientData[key] !== undefined && clientData[key] !== '') {
          formDataToSend.append(key, clientData[key]);
        }
      });
      if (rowsWithFiles.length > 0) {
        formDataToSend.append('documentTypes', JSON.stringify(rowsWithFiles.map((r) => r.documentType || 'DOC')));
        rowsWithFiles.forEach((r) => formDataToSend.append('documents', r.file));
      }

      // Call API to create client
      console.log('Creating client with data:', clientData);
      const response = await ClientsAPI.createClient(formDataToSend);
      console.log('Client creation response:', response);
      
      if (response && response.success) {
        // Close modal and reset form first
        setShowAddModal(false);
        setCreateUserAccount(false);
        setUserAccount({ username: '', password: '', confirmPassword: '' });
        setDocuments([]);
        setUploadedDocuments([]);
        setClientDocumentRows([{ id: 1, documentType: '', file: null, fileName: '' }]);
        setClientType('');
        setClientFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          leadSource: '',
          rank: '',
          nationality: '',
          idNumber: '',
          idExpiryDate: '',
          passportNumber: '',
          birthDate: ''
        });
        setCompanyInfo({
          corporateName: '',
          website: '',
          licenseNumber: '',
          address: '',
          description: '',
          trnNumber: '',
          ibanNumber: ''
        });
        
        // Show success message
        const message = 'Client created successfully!' + 
          (createUserAccount ? ' User account has been created and credentials will be sent via email.' : '') +
          (rowsWithFiles.length > 0 ? ` ${rowsWithFiles.length} document(s) uploaded.` : '');
        alert(message);
        
        // Refresh clients list by calling fetchClients
        // Reset to page 1 to see the new client
        setCurrentPage(1);
        // Wait a bit for the database to be updated, then refresh
        setTimeout(async () => {
          await fetchClients(1);
        }, 500);
      } else {
        throw new Error(response?.message || 'Failed to create client');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      alert(`Failed to create client: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setCreateUserAccount(false);
    setUserAccount({ username: '', password: '', confirmPassword: '' });
    setDocuments([]);
    setUploadedDocuments([]);
    setClientDocumentRows([{ id: 1, documentType: '', file: null, fileName: '' }]);
    setClientType('');
    setClientFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      leadSource: '',
      rank: '',
      nationality: '',
      idNumber: '',
      idExpiryDate: '',
      passportNumber: '',
      birthDate: ''
    });
    setCompanyInfo({
      corporateName: '',
      website: '',
      licenseNumber: '',
      address: '',
      description: '',
      trnNumber: '',
      ibanNumber: ''
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(prev => [...prev, ...files]);
    
    // Immediately add files to uploaded documents for instant preview
    const newUploadedDocs = files.map(file => ({
      id: Date.now() + Math.random(),
      fileName: file.name,
      systemRef: `REF-${Date.now()}`,
      documentTitle: file.name,
      documentCategory: 'General',
      size: formatFileSize(file.size),
      uploadedOn: new Date().toLocaleDateString(),
      file: file // Keep reference to original file
    }));
    
    setUploadedDocuments(prev => [...prev, ...newUploadedDocs]);
  };

  const handleDocumentUpload = (documentData) => {
    console.log('Document uploaded:', documentData);
    
    // Find the document type details from master table
    const docType = DOCUMENT_TYPES_MASTER.find(
      doc => doc.code === documentData.documentType && doc.module === documentData.module
    );
    
    // Create new attachment entry with all the structured data
    const newAttachment = {
      id: Date.now() + Math.random(),
      file: documentData.file,
      fileName: documentData.fileName,
      systemRef: documentData.referenceCode, // Use the generated reference code
      documentTitle: documentData.file.name,
      documentCategory: docType ? docType.label : 'General',
      module: documentData.module,
      entityCode: documentData.entityCode,
      documentType: documentData.documentType,
      year: documentData.year,
      sequence: documentData.sequence,
      size: formatFileSize(documentData.file.size),
      uploadedOn: new Date().toLocaleDateString(),
      description: docType ? docType.description : ''
    };
    
    setUploadedDocuments(prev => [...prev, newAttachment]);
    
    // Optional: Show success message
    console.log(`Document added with reference: ${documentData.referenceCode}`);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const removeDocumentFromPreview = (docId) => {
    const docToRemove = uploadedDocuments.find(doc => doc.id === docId);
    if (docToRemove) {
      setDocuments(prev => prev.filter(doc => doc.name !== docToRemove.fileName));
      setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
    }
  };

  // Multiple documents table (like Contract upload)
  const CLI_DOC_TYPES = DOCUMENT_TYPES_MASTER.filter((d) => d.module === 'CLI');
  const addClientDocumentRow = () => {
    setClientDocumentRows((prev) => [
      ...prev,
      { id: Date.now(), documentType: '', file: null, fileName: '' },
    ]);
  };
  const removeClientDocumentRow = (id) => {
    setClientDocumentRows((prev) => prev.filter((r) => r.id !== id));
  };
  const setClientDocumentRow = (id, field, value) => {
    setClientDocumentRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // Edit modal document rows (3-column table)
  const addEditDocumentRow = () => {
    setEditDocumentRows((prev) => [
      ...prev,
      { id: Date.now(), documentType: '', path: null, originalName: '', file: null, fileName: '' },
    ]);
  };
  const removeEditDocumentRow = (id) => {
    setEditDocumentRows((prev) => prev.filter((r) => r.id !== id));
  };
  const setEditDocumentRow = (id, field, value) => {
    setEditDocumentRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const uploadDocuments = async () => {
    if (documents.length === 0) return;
    
    setIsUploading(true);
    
    // Simulate upload process
    for (let i = 0; i < documents.length; i++) {
      const file = documents[i];
      const systemRef = `REF-${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const uploadedDoc = {
        id: systemRef,
        fileName: file.name,
        systemRef: systemRef,
        documentTitle: file.name.split('.')[0],
        documentCategory: 'General',
        size: (file.size / 1024).toFixed(2) + ' KB',
        uploadedOn: new Date().toLocaleDateString(),
        file: file
      };
      
      setUploadedDocuments(prev => [...prev, uploadedDoc]);
    }
    
    setDocuments([]);
    setIsUploading(false);
  };

  const removeUploadedDocument = (id) => {
    setUploadedDocuments(uploadedDocuments.filter(doc => doc.id !== id));
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        // Try API call first
        await ClientsAPI.deleteClient(clientId);
        // Update local state - ensure clients is an array
        const safeClients = Array.isArray(clients) ? clients : [];
        const safeFiltered = Array.isArray(filteredClients) ? filteredClients : [];
        setClients(safeClients.filter(client => client?.id !== clientId));
        setFilteredClients(safeFiltered.filter(client => client?.id !== clientId));
      } catch (error) {
        console.error('Error deleting client from API, removing from local state:', error);
        // If API fails, still remove from local state for demo purposes
        const safeClients = Array.isArray(clients) ? clients : [];
        const safeFiltered = Array.isArray(filteredClients) ? filteredClients : [];
        setClients(safeClients.filter(client => client?.id !== clientId));
        setFilteredClients(safeFiltered.filter(client => client?.id !== clientId));
        // Show success message since we removed it locally
        console.log('Client deleted locally (API unavailable)');
      }
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Diamond': return 'bg-blue-100 text-blue-800';
      case 'VIP': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCorporateIcon = (isCorporate) => {
    return isCorporate === 'Company' ? BuildingOfficeIcon : UserIcon;
  };

  // Calculate client statistics - ensure clients is an array
  const safeClients = Array.isArray(clients) ? clients : [];
  const clientStats = {
    total: safeClients.length,
    companies: safeClients.filter(client => client?.isCorporate === 'Company').length,
    persons: safeClients.filter(client => client?.isCorporate === 'Person').length,
    rankGold: safeClients.filter(client => client?.rank === 'Gold').length,
    rankSilver: safeClients.filter(client => client?.rank === 'Silver').length,
    rankDiamond: safeClients.filter(client => client?.rank === 'Diamond').length,
    rankVIP: safeClients.filter(client => client?.rank === 'VIP').length,
    socialMedia: safeClients.filter(client => client?.leadSource === 'Social Media').length,
    website: safeClients.filter(client => client?.leadSource === 'Company Website').length,
    friends: safeClients.filter(client => client?.leadSource === 'Friends').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your client database</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add Client
            </button>
          </div>
        </div>
      </div>

      {/* Client Statistics */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Client Statistics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Clients */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-blue-100 text-xs font-medium truncate">Total Clients</p>
                <p className="text-xl font-bold">{clientStats.total}</p>
              </div>
              <ChartBarIcon className="h-6 w-6 text-blue-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* Companies */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-green-100 text-xs font-medium truncate">Companies</p>
                <p className="text-xl font-bold">{clientStats.companies}</p>
              </div>
              <BuildingOfficeIcon className="h-6 w-6 text-green-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* Persons */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-purple-100 text-xs font-medium truncate">Persons</p>
                <p className="text-xl font-bold">{clientStats.persons}</p>
              </div>
              <UserIcon className="h-6 w-6 text-purple-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* Gold Clients */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-yellow-100 text-xs font-medium truncate">Gold</p>
                <p className="text-xl font-bold">{clientStats.rankGold}</p>
              </div>
              <CheckCircleIcon className="h-6 w-6 text-yellow-200 flex-shrink-0 ml-2" />
            </div>
          </div>
        </div>
        
        {/* Additional Statistics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Social Media Leads */}
          <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-pink-100 text-xs font-medium truncate">Social Media</p>
                <p className="text-xl font-bold">{clientStats.socialMedia}</p>
              </div>
              <ClockIcon className="h-6 w-6 text-pink-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* Website Leads */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-indigo-100 text-xs font-medium truncate">Website</p>
                <p className="text-xl font-bold">{clientStats.website}</p>
              </div>
              <ExclamationTriangleIcon className="h-6 w-6 text-indigo-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* Friends Leads */}
          <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-teal-100 text-xs font-medium truncate">Friends</p>
                <p className="text-xl font-bold">{clientStats.friends}</p>
              </div>
              <UserIcon className="h-6 w-6 text-teal-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* Silver Clients */}
          <div className="bg-gradient-to-br from-gray-500 to-slate-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-100 text-xs font-medium truncate">Silver</p>
                <p className="text-xl font-bold">{clientStats.rankSilver}</p>
              </div>
              <ClockIcon className="h-6 w-6 text-gray-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* Diamond Clients */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-blue-100 text-xs font-medium truncate">Diamond</p>
                <p className="text-xl font-bold">{clientStats.rankDiamond}</p>
              </div>
              <StarIcon className="h-6 w-6 text-blue-200 flex-shrink-0 ml-2" />
            </div>
          </div>
          
          {/* VIP Clients */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-purple-100 text-xs font-medium truncate">VIP</p>
                <p className="text-xl font-bold">{clientStats.rankVIP}</p>
              </div>
              <TrophyIcon className="h-6 w-6 text-purple-200 flex-shrink-0 ml-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name, reference number, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={filterCorporate}
              onChange={(e) => setFilterCorporate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Person">Person</option>
              <option value="Company">Company</option>
            </select>

            <select
              value={filterLeadSource}
              onChange={(e) => setFilterLeadSource(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sources</option>
              <option value="Social Media">Social Media</option>
              <option value="Company Website">Company Website</option>
              <option value="Friends">Friends</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Corporate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Options
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentClients.map((client, index) => {
                  const CorporateIcon = getCorporateIcon(client.isCorporate);
                  return (
                    <tr key={client.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {client.referenceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CorporateIcon className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.isCorporate === 'Company' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {client.isCorporate}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.leadSource}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRankColor(client.rank)}`}>
                          {client.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewClient(client)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            title="View"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClient(client)}
                            className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, safeFilteredClients.length)}</span> of{' '}
                    <span className="font-medium">{safeFilteredClients.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseAddModal}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PlusIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add New Client</h2>
                  <p className="text-sm text-gray-600">Fill in the client information below</p>
                </div>
              </div>
              <button
                onClick={handleCloseAddModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
              <form className="space-y-6" onSubmit={handleAddClient}>
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Auto-generated"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                      <input
                        type="text"
                        value={clientFormData.name}
                        onChange={(e) => setClientFormData({...clientFormData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter client name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                      <select 
                        value={clientType}
                        onChange={(e) => setClientType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select type</option>
                        <option value="Person">Person</option>
                        <option value="Company">Company</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
                      <select 
                        value={clientFormData.leadSource}
                        onChange={(e) => setClientFormData({...clientFormData, leadSource: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select source</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Company Website">Company Website</option>
                        <option value="Friends">Friends</option>
                        <option value="Referral">Referral</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rank</label>
                      <select 
                        value={clientFormData.rank}
                        onChange={(e) => setClientFormData({...clientFormData, rank: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select rank</option>
                        <option value="Gold">Gold</option>
                        <option value="Diamond">Diamond</option>
                        <option value="Silver">Silver</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={clientFormData.email}
                        onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="client@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={clientFormData.phone}
                        onChange={(e) => setClientFormData({...clientFormData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+971 50 123 4567"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        value={clientFormData.address}
                        onChange={(e) => setClientFormData({...clientFormData, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="Enter address"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Company Information - Only show when Company is selected */}
                {clientType === 'Company' && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                      Company Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Corporate Name *</label>
                        <input
                          type="text"
                          value={companyInfo.corporateName}
                          onChange={(e) => setCompanyInfo({...companyInfo, corporateName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter corporate name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <input
                          type="url"
                          value={companyInfo.website}
                          onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                        <input
                          type="text"
                          value={companyInfo.licenseNumber}
                          onChange={(e) => setCompanyInfo({...companyInfo, licenseNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter license number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Corporate Address</label>
                        <textarea
                          value={companyInfo.address}
                          onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows="3"
                          placeholder="Enter corporate address"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                        <textarea
                          value={companyInfo.description}
                          onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows="4"
                          placeholder="Enter company description, services, or business details"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">TRN Number</label>
                        <input
                          type="text"
                          value={companyInfo.trnNumber}
                          onChange={(e) => setCompanyInfo({...companyInfo, trnNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter TRN number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IBAN Number</label>
                        <input
                          type="text"
                          value={companyInfo.ibanNumber}
                          onChange={(e) => setCompanyInfo({...companyInfo, ibanNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter IBAN number"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BuildingOfficeIcon className="w-5 h-5 text-green-600" />
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                      <select 
                        value={clientFormData.nationality}
                        onChange={(e) => setClientFormData({...clientFormData, nationality: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select nationality</option>
                        <option value="Afghan">Afghan</option>
                        <option value="Albanian">Albanian</option>
                        <option value="Algerian">Algerian</option>
                        <option value="American">American</option>
                        <option value="Argentine">Argentine</option>
                        <option value="Armenian">Armenian</option>
                        <option value="Australian">Australian</option>
                        <option value="Austrian">Austrian</option>
                        <option value="Azerbaijani">Azerbaijani</option>
                        <option value="Bahraini">Bahraini</option>
                        <option value="Bangladeshi">Bangladeshi</option>
                        <option value="Belgian">Belgian</option>
                        <option value="Brazilian">Brazilian</option>
                        <option value="British">British</option>
                        <option value="Bulgarian">Bulgarian</option>
                        <option value="Burmese">Burmese</option>
                        <option value="Cambodian">Cambodian</option>
                        <option value="Canadian">Canadian</option>
                        <option value="Chilean">Chilean</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Colombian">Colombian</option>
                        <option value="Croatian">Croatian</option>
                        <option value="Cypriot">Cypriot</option>
                        <option value="Czech">Czech</option>
                        <option value="Danish">Danish</option>
                        <option value="Dutch">Dutch</option>
                        <option value="Egyptian">Egyptian</option>
                        <option value="Estonian">Estonian</option>
                        <option value="Ethiopian">Ethiopian</option>
                        <option value="Filipino">Filipino</option>
                        <option value="Finnish">Finnish</option>
                        <option value="French">French</option>
                        <option value="Georgian">Georgian</option>
                        <option value="German">German</option>
                        <option value="Ghanaian">Ghanaian</option>
                        <option value="Greek">Greek</option>
                        <option value="Hungarian">Hungarian</option>
                        <option value="Icelandic">Icelandic</option>
                        <option value="Indian">Indian</option>
                        <option value="Indonesian">Indonesian</option>
                        <option value="Iranian">Iranian</option>
                        <option value="Iraqi">Iraqi</option>
                        <option value="Irish">Irish</option>
                        <option value="Israeli">Israeli</option>
                        <option value="Italian">Italian</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Jordanian">Jordanian</option>
                        <option value="Kazakhstani">Kazakhstani</option>
                        <option value="Kenyan">Kenyan</option>
                        <option value="Korean">Korean</option>
                        <option value="Kuwaiti">Kuwaiti</option>
                        <option value="Latvian">Latvian</option>
                        <option value="Lebanese">Lebanese</option>
                        <option value="Libyan">Libyan</option>
                        <option value="Lithuanian">Lithuanian</option>
                        <option value="Luxembourgish">Luxembourgish</option>
                        <option value="Malaysian">Malaysian</option>
                        <option value="Maltese">Maltese</option>
                        <option value="Mexican">Mexican</option>
                        <option value="Moroccan">Moroccan</option>
                        <option value="Nepalese">Nepalese</option>
                        <option value="New Zealander">New Zealander</option>
                        <option value="Nigerian">Nigerian</option>
                        <option value="Norwegian">Norwegian</option>
                        <option value="Omani">Omani</option>
                        <option value="Pakistani">Pakistani</option>
                        <option value="Palestinian">Palestinian</option>
                        <option value="Peruvian">Peruvian</option>
                        <option value="Polish">Polish</option>
                        <option value="Portuguese">Portuguese</option>
                        <option value="Qatari">Qatari</option>
                        <option value="Romanian">Romanian</option>
                        <option value="Russian">Russian</option>
                        <option value="Saudi Arabian">Saudi Arabian</option>
                        <option value="Singaporean">Singaporean</option>
                        <option value="Slovak">Slovak</option>
                        <option value="Slovenian">Slovenian</option>
                        <option value="South African">South African</option>
                        <option value="Spanish">Spanish</option>
                        <option value="Sri Lankan">Sri Lankan</option>
                        <option value="Sudanese">Sudanese</option>
                        <option value="Swedish">Swedish</option>
                        <option value="Swiss">Swiss</option>
                        <option value="Syrian">Syrian</option>
                        <option value="Thai">Thai</option>
                        <option value="Tunisian">Tunisian</option>
                        <option value="Turkish">Turkish</option>
                        <option value="Ukrainian">Ukrainian</option>
                        <option value="Emirati">Emirati</option>
                        <option value="Uruguayan">Uruguayan</option>
                        <option value="Venezuelan">Venezuelan</option>
                        <option value="Vietnamese">Vietnamese</option>
                        <option value="Yemeni">Yemeni</option>
                        <option value="Zimbabwean">Zimbabwean</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                      <input
                        type="text"
                        value={clientFormData.idNumber}
                        onChange={(e) => setClientFormData({...clientFormData, idNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter ID number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Expiry Date</label>
                      <input
                        type="date"
                        value={clientFormData.idExpiryDate}
                        onChange={(e) => setClientFormData({...clientFormData, idExpiryDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                      <input
                        type="text"
                        value={clientFormData.passportNumber}
                        onChange={(e) => setClientFormData({...clientFormData, passportNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter passport number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                      <input
                        type="date"
                        value={clientFormData.birthDate}
                        onChange={(e) => setClientFormData({...clientFormData, birthDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* User Account Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="createUserAccount"
                      checked={createUserAccount}
                      onChange={(e) => setCreateUserAccount(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="createUserAccount" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                      Create User Account for ERP Access
                    </label>
                  </div>
                  
                  {createUserAccount && (
                    <div className="space-y-4 bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-gray-600 mb-4">
                        This will create login credentials for the client to access the ERP system.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                          <input
                            type="text"
                            value={userAccount.username}
                            onChange={(e) => setUserAccount({...userAccount, username: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter username"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                          <input
                            type="password"
                            value={userAccount.password}
                            onChange={(e) => setUserAccount({...userAccount, password: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter password"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                          <input
                            type="password"
                            value={userAccount.confirmPassword}
                            onChange={(e) => setUserAccount({...userAccount, confirmPassword: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Confirm password"
                            required
                          />
                          {userAccount.password && userAccount.confirmPassword && userAccount.password !== userAccount.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                          )}
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 text-blue-600 mt-0.5">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-blue-800 font-medium">Account Access Information</p>
                            <p className="text-xs text-blue-600 mt-1">
                              The client will receive login credentials via email and can access the ERP system to view their projects, tasks, and related information.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Documents Section - Multiple documents in table form (like Contract upload) */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                        {clientDocumentRows.filter((r) => r.file).length} file(s)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={addClientDocumentRow}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition"
                    >
                      <PlusIcon className="w-4 h-4" /> Add document
                    </button>
                  </div>
                  <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-green-50 border-b border-green-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Document Type</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">File</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Size</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientDocumentRows.map((row) => (
                          <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-4">
                              <select
                                value={row.documentType}
                                onChange={(e) => setClientDocumentRow(row.id, 'documentType', e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              >
                                <option value="">Select type</option>
                                {CLI_DOC_TYPES.map((d) => (
                                  <option key={d.code} value={d.code}>{d.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1.5 hover:bg-gray-50">
                                  {row.fileName || 'Choose file'}
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    setClientDocumentRows((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id
                                          ? { ...r, file: f || null, fileName: f ? f.name : '' }
                                          : r
                                      )
                                    );
                                  }}
                                />
                              </label>
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-600">
                              {row.file ? formatFileSize(row.file.size) : '—'}
                            </td>
                            <td className="py-2 px-4">
                              <button
                                type="button"
                                onClick={() => removeClientDocumentRow(row.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                title="Remove"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PDF, Word, Excel, images. Max 10MB per file. Add multiple rows for multiple documents.</p>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Client Modal */}
      {showViewModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => !viewModalEditMode && setShowViewModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Client Details</h2>
              <div className="flex items-center gap-2">
                {!viewModalEditMode ? (
                  <button
                    onClick={handleStartEditClient}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <PencilIcon className="w-4 h-4" /> Edit
                  </button>
                ) : null}
                <button
                  onClick={() => { setViewModalEditMode(false); setEditFormData(null); setShowViewModal(false); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 pb-8">
              {viewModalEditMode && editFormData ? (
                /* Edit form */
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-8">
                  {editError && <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{editError}</div>}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Reference Number</label>
                        <input type="text" readOnly className="w-full text-sm font-mono bg-gray-100 px-3 py-2 rounded border border-gray-200" value={editFormData.referenceNumber} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name *</label>
                        <input type="text" className="w-full text-sm px-3 py-2 rounded border border-gray-200" value={editFormData.name} onChange={(e) => handleEditFormChange('name', e.target.value)} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <select className="w-full text-sm px-3 py-2 rounded border border-gray-200" value={editFormData.isCorporate} onChange={(e) => handleEditFormChange('isCorporate', e.target.value)}>
                          <option value="Person">Person</option>
                          <option value="Company">Company</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Rank</label>
                        <input type="text" className="w-full text-sm px-3 py-2 rounded border border-gray-200" value={editFormData.rank} onChange={(e) => handleEditFormChange('rank', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">ID Number</label>
                        <input type="text" className="w-full text-sm px-3 py-2 rounded border border-gray-200" value={editFormData.idNumber} onChange={(e) => handleEditFormChange('idNumber', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">ID Expiry Date</label>
                        <input type="date" className="w-full text-sm px-3 py-2 rounded border border-gray-200" value={editFormData.idExpiryDate} onChange={(e) => handleEditFormChange('idExpiryDate', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Nationality</label>
                        <input type="text" className="w-full text-sm px-3 py-2 rounded border border-gray-200" value={editFormData.nationality} onChange={(e) => handleEditFormChange('nationality', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Passport Number</label>
                        <input type="text" className="w-full text-sm px-3 py-2 rounded border border-gray-200" value={editFormData.passportNumber} onChange={(e) => handleEditFormChange('passportNumber', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Birth Date</label>
                        <input type="date" className="w-full text-sm px-3 py-2 rounded border border-gray-200" value={editFormData.birthDate} onChange={(e) => handleEditFormChange('birthDate', e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input type="email" className="w-full text-sm px-3 py-2 rounded border border-gray-200" value={editFormData.email} onChange={(e) => handleEditFormChange('email', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <input type="text" className="w-full text-sm px-3 py-2 rounded border border-gray-200" value={editFormData.phone} onChange={(e) => handleEditFormChange('phone', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700">Address</label>
                        <textarea className="w-full text-sm px-3 py-2 rounded border border-gray-200 min-h-[60px]" value={editFormData.address} onChange={(e) => handleEditFormChange('address', e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Lead Source</label>
                        <input type="text" className="w-full text-sm px-3 py-2 rounded border border-gray-200" value={editFormData.leadSource} onChange={(e) => handleEditFormChange('leadSource', e.target.value)} />
                      </div>
                    </div>
                  </div>
                  {/* Edit: Upload Documents - 3 columns */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
                      <button
                        type="button"
                        onClick={addEditDocumentRow}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition"
                      >
                        <PlusIcon className="w-4 h-4" /> Add document
                      </button>
                    </div>
                    <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-green-50 border-b border-green-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Document Type</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">File</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-20">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editDocumentRows.map((row) => (
                            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2 px-4">
                                <select
                                  value={row.documentType}
                                  onChange={(e) => setEditDocumentRow(row.id, 'documentType', e.target.value)}
                                  className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                  <option value="">Select type</option>
                                  {CLI_DOC_TYPES.map((d) => (
                                    <option key={d.code} value={d.code}>{d.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 px-4">
                                {row.path && !row.file ? (
                                  <span className="text-sm text-gray-600">{row.originalName || row.path}</span>
                                ) : (
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1.5 hover:bg-gray-50">
                                      {row.fileName || 'Choose file'}
                                    </span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        setEditDocumentRows((prev) =>
                                          prev.map((r) =>
                                            r.id === row.id
                                              ? { ...r, file: f || null, fileName: f ? f.name : '', path: null, originalName: '' }
                                              : r
                                          )
                                        );
                                      }}
                                    />
                                  </label>
                                )}
                              </td>
                              <td className="py-2 px-4">
                                <button
                                  type="button"
                                  onClick={() => removeEditDocumentRow(row.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                  title="Remove"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Add or replace documents. Existing files are kept until you remove the row or upload a new file.</p>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                    <button type="submit" disabled={savingClient} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                      {savingClient ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Read-only view */
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Reference Number</label>
                        <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">{selectedClient.referenceNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <p className="text-sm text-gray-900 font-semibold bg-white px-3 py-2 rounded border">{selectedClient.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.isCorporate}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Rank</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.rank}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">ID Number</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.idNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">ID Expiry Date</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.idExpiryDate ? new Date(selectedClient.idExpiryDate).toLocaleDateString() : (selectedClient.idEndDate || 'N/A')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Nationality</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.nationality || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Passport Number</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.passportNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Birth Date</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.birthDate ? new Date(selectedClient.birthDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">📧 Email</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">📞 Phone</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.phone}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700">📍 Address</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border min-h-[60px]">{selectedClient.address || '—'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Lead Source</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.leadSource || '—'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Client Since</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.status || 'Active'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Priority</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.priority || 'Medium'}</p>
                      </div>
                      {selectedClient.isCorporate === 'Company' && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-700">TRN Number</label>
                            <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.trnNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">IBAN Number</label>
                            <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">{selectedClient.ibanNumber || 'N/A'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Documents section - 3 columns */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">4</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                    </div>
                    {(() => {
                      let docs = [];
                      try {
                        const raw = selectedClient.documentAttachments;
                        if (typeof raw === 'string' && raw) docs = JSON.parse(raw) || [];
                        else if (Array.isArray(raw)) docs = raw;
                      } catch (_) {}
                      if (docs.length === 0) {
                        return <p className="text-sm text-gray-600">No documents uploaded.</p>;
                      }
                      // Use backend root for static files (uploads are at /uploads/..., not /api/uploads/...)
                      const backendRoot = (process.env.REACT_APP_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');
                      return (
                        <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-green-50 border-b border-green-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Document Type</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">File Name</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-24">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {docs.map((doc, idx) => (
                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="py-2 px-4 text-sm text-gray-900">{doc.documentType || '—'}</td>
                                  <td className="py-2 px-4 text-sm text-gray-900">{doc.originalName || doc.path || '—'}</td>
                                  <td className="py-2 px-4">
                                    {doc.path ? (
                                      <a
                                        href={`${backendRoot}${doc.path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                      >
                                        View
                                      </a>
                                    ) : (
                                      <span className="text-gray-400 text-sm">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
