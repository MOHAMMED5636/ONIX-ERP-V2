import React, { useState } from 'react';
import { 
  DocumentTextIcon,
  DocumentIcon,
  DocumentPlusIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const DocView = () => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: 'Project Safety Manual',
      type: 'Manual',
      category: 'Safety',
      status: 'Published',
      lastModified: '2025-09-15',
      modifiedBy: 'SA',
      version: '2.1',
      description: 'Comprehensive safety guidelines for construction site operations',
      tags: ['Safety', 'Manual', 'Guidelines', 'Construction'],
      associatedTask: 'Safety Inspection',
      content: 'This manual outlines all safety procedures...',
      isTemplate: false,
      templateId: null
    },
    {
      id: 2,
      title: 'Daily Progress Report Template',
      type: 'Template',
      category: 'Reports',
      status: 'Draft',
      lastModified: '2025-09-14',
      modifiedBy: 'MN',
      version: '1.0',
      description: 'Standard template for daily construction progress reports',
      tags: ['Template', 'Progress', 'Daily', 'Report'],
      associatedTask: 'Foundation Excavation',
      content: 'Daily Progress Report for [Date]...',
      isTemplate: true,
      templateId: 'DPR-001'
    },
    {
      id: 3,
      title: 'Material Inspection Checklist',
      type: 'Checklist',
      category: 'Quality Control',
      status: 'Published',
      lastModified: '2025-09-13',
      modifiedBy: 'AH',
      version: '1.3',
      description: 'Comprehensive checklist for material quality inspection',
      tags: ['Checklist', 'Materials', 'Quality', 'Inspection'],
      associatedTask: 'Steel Frame Installation',
      content: 'Material Inspection Checklist...',
      isTemplate: false,
      templateId: null
    },
    {
      id: 4,
      title: 'Equipment Maintenance Log',
      type: 'Log',
      category: 'Maintenance',
      status: 'Published',
      lastModified: '2025-09-12',
      modifiedBy: 'MA',
      version: '1.0',
      description: 'Log for tracking equipment maintenance schedules',
      tags: ['Equipment', 'Maintenance', 'Log', 'Schedule'],
      associatedTask: 'Concrete Pouring',
      content: 'Equipment Maintenance Log...',
      isTemplate: false,
      templateId: null
    },
    {
      id: 5,
      title: 'Incident Report Template',
      type: 'Template',
      category: 'Safety',
      status: 'Published',
      lastModified: '2025-09-11',
      modifiedBy: 'SA',
      version: '1.2',
      description: 'Standard template for reporting construction incidents',
      tags: ['Template', 'Incident', 'Safety', 'Report'],
      associatedTask: 'Safety Inspection',
      content: 'Incident Report Template...',
      isTemplate: true,
      templateId: 'IR-001'
    },
    {
      id: 6,
      title: 'Quality Assurance Plan',
      type: 'Plan',
      category: 'Quality Control',
      status: 'Draft',
      lastModified: '2025-09-10',
      modifiedBy: 'AH',
      version: '0.8',
      description: 'Comprehensive quality assurance plan for construction project',
      tags: ['Plan', 'Quality', 'Assurance', 'Construction'],
      associatedTask: 'Electrical Wiring',
      content: 'Quality Assurance Plan...',
      isTemplate: false,
      templateId: null
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('date'); // date, name, type, status
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showPreview, setShowPreview] = useState(null);
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: '',
    category: '',
    description: '',
    content: ''
  });

  const categories = ['All', 'Safety', 'Reports', 'Quality Control', 'Maintenance', 'Plans', 'Templates'];
  const types = ['All', 'Manual', 'Template', 'Checklist', 'Log', 'Plan', 'Report', 'Procedure'];
  const statuses = ['All', 'Draft', 'Published', 'Archived', 'Under Review'];

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'Manual': return <DocumentTextIcon className="w-6 h-6 text-blue-500" />;
      case 'Template': return <DocumentPlusIcon className="w-6 h-6 text-green-500" />;
      case 'Checklist': return <ClipboardDocumentListIcon className="w-6 h-6 text-orange-500" />;
      case 'Log': return <ChartBarIcon className="w-6 h-6 text-purple-500" />;
      case 'Plan': return <BuildingOfficeIcon className="w-6 h-6 text-indigo-500" />;
      case 'Report': return <DocumentIcon className="w-6 h-6 text-red-500" />;
      case 'Procedure': return <WrenchScrewdriverIcon className="w-6 h-6 text-gray-500" />;
      default: return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Safety': return 'bg-red-100 text-red-800';
      case 'Reports': return 'bg-blue-100 text-blue-800';
      case 'Quality Control': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-orange-100 text-orange-800';
      case 'Plans': return 'bg-purple-100 text-purple-800';
      case 'Templates': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesType = selectedType === 'All' || doc.type === selectedType;
    const matchesStatus = selectedStatus === 'All' || doc.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'date':
      default:
        return new Date(b.lastModified) - new Date(a.lastModified);
    }
  });

  const handleDocumentSelect = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleCreateDocument = () => {
    const newDoc = {
      id: documents.length + 1,
      ...newDocument,
      status: 'Draft',
      lastModified: new Date().toISOString().split('T')[0],
      modifiedBy: 'Current User',
      version: '1.0',
      tags: [],
      associatedTask: 'Unassigned',
      isTemplate: false,
      templateId: null
    };
    setDocuments(prev => [...prev, newDoc]);
    setNewDocument({ title: '', type: '', category: '', description: '', content: '' });
    setShowCreateModal(false);
  };

  const handleCreateFromTemplate = (templateId) => {
    const template = documents.find(doc => doc.templateId === templateId);
    if (template) {
      const newDoc = {
        id: documents.length + 1,
        title: `${template.title} - Copy`,
        type: template.type,
        category: template.category,
        description: template.description,
        content: template.content,
        status: 'Draft',
        lastModified: new Date().toISOString().split('T')[0],
        modifiedBy: 'Current User',
        version: '1.0',
        tags: [...template.tags],
        associatedTask: 'Unassigned',
        isTemplate: false,
        templateId: null
      };
      setDocuments(prev => [...prev, newDoc]);
    }
    setShowTemplateModal(false);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedDocuments.map((doc) => (
        <div
          key={doc.id}
          className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
            selectedDocs.includes(doc.id) 
              ? 'border-blue-500 shadow-lg' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="p-6">
            {/* Document Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedDocs.includes(doc.id)}
                  onChange={() => handleDocumentSelect(doc.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                {getDocumentIcon(doc.type)}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowPreview(doc)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Preview"
                >
                  <EyeIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                  <PencilIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded" title="Share">
                  <ShareIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded" title="Delete">
                  <TrashIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Document Info */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{doc.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{doc.description}</p>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                  {doc.category}
                </span>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {new Date(doc.lastModified).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <UserIcon className="w-3 h-3" />
                  {doc.modifiedBy}
                </div>
                <div className="flex items-center gap-1">
                  <TagIcon className="w-3 h-3" />
                  v{doc.version}
                </div>
              </div>

              <div className="text-xs text-gray-600">
                <span className="font-medium">Task:</span> {doc.associatedTask}
              </div>

              <div className="flex flex-wrap gap-1">
                {doc.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
                {doc.tags.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{doc.tags.length - 2}
                  </span>
                )}
              </div>

              {doc.isTemplate && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckIcon className="w-3 h-3" />
                  Template Available
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="w-4 h-4" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedDocuments.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={() => handleDocumentSelect(doc.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {getDocumentIcon(doc.type)}
                    <div>
                      <div className="font-medium text-gray-900">{doc.title}</div>
                      <div className="text-sm text-gray-500">{doc.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{doc.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}>
                    {doc.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(doc.lastModified).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreview(doc)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Preview"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-800" title="Edit">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="text-purple-600 hover:text-purple-800" title="Share">
                      <ShareIcon className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800" title="Delete">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-3xl font-bold mb-2">Document Management</h2>
          <p className="text-indigo-100 text-lg">Create, manage, and organize construction documents and templates</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>

          {/* View Mode & Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Create
            </button>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <DocumentPlusIcon className="w-4 h-4" />
              Templates
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDocs.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedDocs.length} document(s) selected
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Export
              </button>
              <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                Publish
              </button>
              <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Document Display */}
      {sortedDocuments.length > 0 ? (
        viewMode === 'grid' ? renderGridView() : renderListView()
      ) : (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500 mb-4">Create your first document to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Document
          </button>
        </div>
      )}

      {/* Create Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={newDocument.type}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select type</option>
                    {types.slice(1).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={newDocument.category}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select category</option>
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter document description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create from Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.filter(doc => doc.isTemplate).map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    {getDocumentIcon(template.type)}
                    <h4 className="font-medium text-gray-900">{template.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <button
                    onClick={() => handleCreateFromTemplate(template.templateId)}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{showPreview.title}</h3>
              <button
                onClick={() => setShowPreview(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Type:</span> {showPreview.type}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span> {showPreview.status}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Version:</span> {showPreview.version}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Modified:</span> {new Date(showPreview.lastModified).toLocaleDateString()}
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Content Preview</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-700">{showPreview.content}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Edit
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Download
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocView;
