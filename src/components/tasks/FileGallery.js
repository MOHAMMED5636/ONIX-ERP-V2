import React, { useState, useRef } from 'react';
import { 
  PhotoIcon,
  DocumentTextIcon,
  DocumentIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PencilIcon,
  ShareIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const FileGallery = () => {
  const [files, setFiles] = useState([
    {
      id: 1,
      name: 'Foundation Blueprint.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadDate: '2025-09-15',
      uploadedBy: 'SA',
      category: 'Blueprints',
      tags: ['Foundation', 'Structural', 'Critical'],
      associatedTask: 'Foundation Excavation',
      thumbnail: null,
      url: '#'
    },
    {
      id: 2,
      name: 'Site Photos - Week 1.jpg',
      type: 'image',
      size: '1.8 MB',
      uploadDate: '2025-09-14',
      uploadedBy: 'MN',
      category: 'Photos',
      tags: ['Progress', 'Site', 'Week1'],
      associatedTask: 'Foundation Excavation',
      thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=200&fit=crop',
      url: '#'
    },
    {
      id: 3,
      name: 'Safety Inspection Report.docx',
      type: 'document',
      size: '456 KB',
      uploadDate: '2025-09-13',
      uploadedBy: 'AH',
      category: 'Reports',
      tags: ['Safety', 'Inspection', 'Compliance'],
      associatedTask: 'Safety Inspection',
      thumbnail: null,
      url: '#'
    },
    {
      id: 4,
      name: 'Material Specifications.xlsx',
      type: 'spreadsheet',
      size: '892 KB',
      uploadDate: '2025-09-12',
      uploadedBy: 'MA',
      category: 'Specifications',
      tags: ['Materials', 'Specs', 'Procurement'],
      associatedTask: 'Steel Frame Installation',
      thumbnail: null,
      url: '#'
    },
    {
      id: 5,
      name: 'Progress Video - Concrete Pour.mp4',
      type: 'video',
      size: '15.2 MB',
      uploadDate: '2025-09-11',
      uploadedBy: 'SA',
      category: 'Videos',
      tags: ['Progress', 'Concrete', 'Video'],
      associatedTask: 'Concrete Pouring',
      thumbnail: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
      url: '#'
    },
    {
      id: 6,
      name: 'Electrical Wiring Diagram.dwg',
      type: 'cad',
      size: '3.1 MB',
      uploadDate: '2025-09-10',
      uploadedBy: 'AH',
      category: 'Technical Drawings',
      tags: ['Electrical', 'Wiring', 'Technical'],
      associatedTask: 'Electrical Wiring',
      thumbnail: null,
      url: '#'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTask, setSelectedTask] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('date'); // date, name, size, type
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showPreview, setShowPreview] = useState(null);
  const fileInputRef = useRef(null);

  const categories = ['All', 'Blueprints', 'Photos', 'Reports', 'Specifications', 'Videos', 'Technical Drawings'];
  const tasks = ['All', 'Foundation Excavation', 'Steel Frame Installation', 'Electrical Wiring', 'Safety Inspection', 'Concrete Pouring'];

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <DocumentTextIcon className="w-8 h-8 text-red-500" />;
      case 'image': return <PhotoIcon className="w-8 h-8 text-green-500" />;
      case 'document': return <DocumentIcon className="w-8 h-8 text-blue-500" />;
      case 'spreadsheet': return <DocumentIcon className="w-8 h-8 text-green-600" />;
      case 'video': return <PhotoIcon className="w-8 h-8 text-purple-500" />;
      case 'cad': return <DocumentIcon className="w-8 h-8 text-orange-500" />;
      default: return <DocumentIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'spreadsheet': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'cad': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;
    const matchesTask = selectedTask === 'All' || file.associatedTask === selectedTask;
    return matchesSearch && matchesCategory && matchesTask;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return parseFloat(b.size) - parseFloat(a.size);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'date':
      default:
        return new Date(b.uploadDate) - new Date(a.uploadDate);
    }
  });

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleBulkAction = (action) => {
    if (action === 'delete') {
      setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
    }
    // Add other bulk actions here
  };

  const handleFileUpload = (event) => {
    const newFiles = Array.from(event.target.files).map((file, index) => ({
      id: files.length + index + 1,
      name: file.name,
      type: file.type.split('/')[0],
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Current User',
      category: 'Uploads',
      tags: [],
      associatedTask: 'Unassigned',
      thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      url: '#'
    }));
    setFiles(prev => [...prev, ...newFiles]);
    setShowUploadModal(false);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedFiles.map((file) => (
        <div
          key={file.id}
          className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
            selectedFiles.includes(file.id) 
              ? 'border-blue-500 shadow-lg' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="p-4">
            {/* File Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => handleFileSelect(file.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                {getFileIcon(file.type)}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowPreview(file)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Preview"
                >
                  <EyeIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded" title="Download">
                  <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded" title="Delete">
                  <TrashIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* File Thumbnail/Preview */}
            <div className="mb-3">
              {file.thumbnail ? (
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{file.name}</h3>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{file.size}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(file.type)}`}>
                  {file.type.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {new Date(file.uploadDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <UserIcon className="w-3 h-3" />
                  {file.uploadedBy}
                </div>
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-medium">Task:</span> {file.associatedTask}
              </div>
              <div className="flex flex-wrap gap-1">
                {file.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
                {file.tags.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{file.tags.length - 2}
                  </span>
                )}
              </div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedFiles.map((file) => (
              <tr key={file.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => handleFileSelect(file.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div>
                      <div className="font-medium text-gray-900">{file.name}</div>
                      <div className="text-sm text-gray-500">{file.uploadedBy}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{file.size}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(file.type)}`}>
                    {file.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{file.associatedTask}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(file.uploadDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreview(file)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Preview"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-800" title="Download">
                      <ArrowDownTrayIcon className="w-4 h-4" />
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
      {/* Filter Bar */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-lg border border-gray-200 mb-6 -mt-6">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - File Gallery Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Bars3Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">File Gallery</h2>
              <p className="text-sm text-gray-600">Project files and documents</p>
            </div>
          </div>
          
          {/* Right side - Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
              <PlusIcon className="w-5 h-5" /> New Folder
            </button>
            
            <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
              <ClipboardDocumentIcon className="w-5 h-5" /> Import
            </button>
            
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search files... (Ctrl+K to focus)"
                className="w-56 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            {/* Show Filters Button */}
            <button className="flex items-center gap-1.5 px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300 bg-white shadow-sm">
              <FunnelIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Show Filters</span>
            </button>
          </div>
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
                placeholder="Search files..."
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
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {tasks.map(task => (
                <option key={task} value={task}>{task}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
              <option value="type">Sort by Type</option>
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
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedFiles.length} file(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('download')}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Download
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* File Display */}
      {sortedFiles.length > 0 ? (
        viewMode === 'grid' ? renderGridView() : renderListView()
      ) : (
        <div className="text-center py-12">
          <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-500 mb-4">Upload some files to get started</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Upload Files
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Files</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Drag and drop files here or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Choose Files
              </button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{showPreview.name}</h3>
              <button
                onClick={() => setShowPreview(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {showPreview.thumbnail ? (
                <img
                  src={showPreview.thumbnail}
                  alt={showPreview.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getFileIcon(showPreview.type)}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Size:</span> {showPreview.size}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span> {showPreview.type.toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Uploaded:</span> {new Date(showPreview.uploadDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium text-gray-700">By:</span> {showPreview.uploadedBy}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Download
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
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

export default FileGallery;


