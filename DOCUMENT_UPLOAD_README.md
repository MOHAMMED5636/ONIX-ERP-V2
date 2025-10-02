# Document Upload Form - Integration Guide

## 📋 Overview

This is a production-ready document upload module for the ONIX ERP system with intelligent reference code generation and module-specific document types.

## ✨ Features

- **5 Module Support**: PRJ, HR, CLI, FIN, GEN
- **Auto Reference Code Generation**: `[MODULE]-[ENTITY_CODE]-[SUB_TYPE]-[YEAR]-[SEQUENCE]`
- **Dynamic Document Types**: Filtered based on selected module
- **File Validation**: Type and size validation
- **Beautiful UI**: Clean Tailwind CSS design
- **Real-time Updates**: Reference code updates as you fill the form

## 🎯 Form Fields

1. **Module** (Required) - Dropdown
   - PRJ: Project
   - HR: Human Resources
   - CLI: Client
   - FIN: Finance
   - GEN: General

2. **Entity Code** (Required) - Text Input
   - Format: REF-002, EMP-015, CLI-123
   - Auto-converts to uppercase

3. **Document Type** (Required) - Dropdown
   - Dynamically loaded based on selected module
   - 23 predefined document types

4. **Year** (Auto-filled) - Read-only
   - Current year

5. **Sequence** (Auto-assigned) - Read-only
   - Placeholder: XXX
   - Will be replaced by backend with actual sequence number

6. **File Upload** (Required)
   - Accepted formats: PDF, DOCX, XLSX, PNG, JPG
   - Max size: 10MB

## 📦 Reference Code Format

```
[MODULE]-[ENTITY_CODE]-[SUB_TYPE]-[YEAR]-[SEQUENCE]

Example: PRJ-REF-002-CNTR-2025-001
         ↓   ↓       ↓    ↓    ↓
      Module │    Document│  Sequence
           Entity   Year
           Code
```

## 🔧 Integration into Clients.js

### Step 1: Import the Component

```javascript
import DocumentUploadForm from './components/DocumentUploadForm';
```

### Step 2: Replace Upload Documents Section

Find the "Upload Documents" section in your `Clients.js` modal (around line 1155) and replace with:

```javascript
{/* Upload Documents */}
<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
  <DocumentUploadForm 
    onSubmit={handleDocumentUpload}
    onCancel={() => setShowAddModal(false)}
  />
</div>
```

### Step 3: Add Handler Function

Add this function to handle document uploads:

```javascript
const handleDocumentUpload = (documentData) => {
  console.log('Document uploaded:', documentData);
  
  // Create formatted document entry
  const newDocument = {
    id: Date.now(),
    fileName: documentData.fileName,
    systemRef: documentData.referenceCode,
    documentTitle: documentData.file.name,
    documentCategory: getDocumentCategoryLabel(documentData.documentType, documentData.module),
    size: formatFileSize(documentData.file.size),
    uploadedOn: new Date().toLocaleDateString(),
    module: documentData.module,
    entityCode: documentData.entityCode,
    year: documentData.year,
    sequence: documentData.sequence,
    file: documentData.file
  };

  // Add to uploaded documents list
  setUploadedDocuments(prev => [...prev, newDocument]);
  
  // Show success message
  alert(`Document uploaded successfully!\nReference: ${documentData.referenceCode}`);
  
  // TODO: Send to backend API
  // uploadToBackend(newDocument);
};

// Helper function to get document category label
const getDocumentCategoryLabel = (code, module) => {
  const DOCUMENT_TYPES_MASTER = [
    { "module": "PRJ", "code": "CNTR", "label": "Project Contract" },
    { "module": "PRJ", "code": "UND", "label": "Undertaking Letter" },
    // ... (include full master table)
  ];
  
  const docType = DOCUMENT_TYPES_MASTER.find(
    doc => doc.code === code && doc.module === module
  );
  return docType ? docType.label : 'Unknown';
};

// Helper function for file size formatting
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
```

## 📊 Document Types Master Table

### Project (PRJ)
- **CNTR**: Project Contract
- **UND**: Undertaking Letter
- **DRW**: Drawing / CAD
- **RPT**: Report
- **SUP**: Supervision Form
- **MOM**: Minutes of Meeting
- **CORR**: Correspondence / Letters
- **APP**: Approval Documents

### Human Resources (HR)
- **ID**: Employee ID / Passport
- **MED**: Medical Report
- **CERT**: HR Certificates
- **CNTR**: Employment Contract

### Client (CLI)
- **ID**: Client ID / Passport
- **CNTR**: Client Contract
- **UND**: Client Undertaking

### Finance (FIN)
- **INV**: Tax Invoice
- **PINV**: Proforma Invoice
- **QUO**: Quotation
- **PAY**: Payment / Finance Document

### General (GEN)
- **DOC**: General Document
- **LET**: General Letter
- **SUB**: Subcontractor Letter
- **CORR**: General Correspondence

## 🚀 Backend Integration

### Expected API Endpoint

```javascript
POST /api/documents/upload

Request:
{
  "module": "PRJ",
  "entityCode": "REF-002",
  "documentType": "CNTR",
  "year": 2025,
  "sequence": "XXX",  // Backend will replace with actual sequence
  "file": File object
}

Response:
{
  "success": true,
  "data": {
    "referenceCode": "PRJ-REF-002-CNTR-2025-001",
    "sequence": "001",  // Actual sequence number from backend
    "fileUrl": "https://server.com/uploads/documents/...",
    "uploadedAt": "2025-01-02T10:30:00Z"
  }
}
```

### Example Backend Integration

```javascript
const handleDocumentUpload = async (documentData) => {
  try {
    const formData = new FormData();
    formData.append('module', documentData.module);
    formData.append('entityCode', documentData.entityCode);
    formData.append('documentType', documentData.documentType);
    formData.append('year', documentData.year);
    formData.append('file', documentData.file);

    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      // Update with actual reference code from backend
      const newDocument = {
        id: result.data.id,
        fileName: documentData.fileName,
        systemRef: result.data.referenceCode,  // Actual ref with sequence
        documentCategory: getDocumentCategoryLabel(documentData.documentType, documentData.module),
        size: formatFileSize(documentData.file.size),
        uploadedOn: new Date(result.data.uploadedAt).toLocaleDateString(),
        fileUrl: result.data.fileUrl
      };

      setUploadedDocuments(prev => [...prev, newDocument]);
      alert(`Document uploaded successfully!\nReference: ${result.data.referenceCode}`);
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Failed to upload document. Please try again.');
  }
};
```

## 🎨 Customization

### Change Colors

The component uses Tailwind CSS. To change the primary color from blue to another color:

1. Find all instances of `blue-` classes
2. Replace with your preferred color (e.g., `green-`, `purple-`, `indigo-`)

Example:
```javascript
// Current
className="bg-blue-600 hover:bg-blue-700"

// Change to green
className="bg-green-600 hover:bg-green-700"
```

### Add New Modules

To add a new module:

1. Add to MODULES array:
```javascript
const MODULES = [
  // ... existing modules
  { value: 'ACC', label: 'Accounting (ACC)' }
];
```

2. Add document types to DOCUMENT_TYPES_MASTER:
```javascript
{ "module": "ACC", "code": "BAL", "label": "Balance Sheet" },
{ "module": "ACC", "code": "P&L", "label": "Profit & Loss" },
```

### Modify File Size Limit

Change the max file size (currently 10MB):

```javascript
// In handleFileChange function
if (file.size > 20 * 1024 * 1024) {  // Change to 20MB
  setErrors(prev => ({ 
    ...prev, 
    file: 'File size must be less than 20MB' 
  }));
  return;
}
```

## 🧪 Testing

### Test Cases

1. **Module Selection**
   - Select each module
   - Verify document types are filtered correctly

2. **Entity Code**
   - Enter lowercase text → should convert to uppercase
   - Leave empty → should show validation error

3. **Reference Code Generation**
   - Fill all fields → should auto-generate code
   - Change any field → should update immediately

4. **File Upload**
   - Upload valid file types (PDF, DOCX, etc.) → should accept
   - Upload invalid file type (e.g., .exe) → should reject
   - Upload file > 10MB → should reject

5. **Form Validation**
   - Submit empty form → should show all required field errors
   - Submit with missing fields → should show specific errors
   - Submit complete form → should call onSubmit handler

## 📝 Usage Example

```javascript
import React, { useState } from 'react';
import DocumentUploadForm from './components/DocumentUploadForm';

function App() {
  const [documents, setDocuments] = useState([]);

  const handleUpload = (documentData) => {
    console.log('Uploaded:', documentData);
    setDocuments(prev => [...prev, documentData]);
  };

  return (
    <div className="container mx-auto p-6">
      <DocumentUploadForm 
        onSubmit={handleUpload}
        onCancel={() => console.log('Cancelled')}
      />
      
      {/* Display uploaded documents */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-4">Uploaded Documents</h3>
        {documents.map((doc, index) => (
          <div key={index} className="p-4 border rounded mb-2">
            <p className="font-mono text-blue-600">{doc.referenceCode}</p>
            <p className="text-sm text-gray-600">{doc.fileName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🐛 Troubleshooting

### Issue: Document types not showing
**Solution**: Make sure you've selected a module first. Document types are filtered based on the selected module.

### Issue: File upload not working
**Solution**: Check browser console for errors. Verify file type and size are within limits.

### Issue: Reference code not generating
**Solution**: Ensure all required fields are filled (Module, Entity Code, Document Type).

### Issue: Styling looks different
**Solution**: Make sure Tailwind CSS is properly configured in your project.

## 📞 Support

For issues or questions, please refer to the main ERP documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Author**: ONIX ERP Development Team

