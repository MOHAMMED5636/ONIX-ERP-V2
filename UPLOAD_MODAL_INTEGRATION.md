# Upload Documents Modal Integration Guide

## 🎯 Quick Integration for Task Management Upload Modal

This guide shows you how to integrate the DocumentUploadForm into your existing "Upload Documents" modal in the Task Management system.

---

## 📁 Files to Modify

You need to modify the file that contains your "Upload Documents" modal. Based on your screenshot, this appears to be either:
- `src/pages/Clients.js` (for client documents)
- `src/components/tasks/ProjectDetailDrawer.js` (for task/project attachments)

---

## 🔧 Step-by-Step Integration

### Step 1: Import the Component

At the top of your file, add:

```javascript
import DocumentUploadForm, { DOCUMENT_TYPES_MASTER } from './components/DocumentUploadForm';
// Or adjust the path based on your file location:
// import DocumentUploadForm, { DOCUMENT_TYPES_MASTER } from '../components/DocumentUploadForm';
```

### Step 2: Add State for Uploaded Documents (if not already present)

```javascript
const [uploadedDocuments, setUploadedDocuments] = useState([]);
```

### Step 3: Replace the Upload Section

Find the section in your modal that looks like:

```jsx
{/* Upload Documents */}
<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
  <div className="flex items-center gap-3 mb-4">
    <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
  </div>
  
  {/* OLD UPLOAD SECTION - REPLACE THIS */}
  <div className="border-2 border-dashed...">
    ...existing upload code...
  </div>
</div>
```

Replace with:

```jsx
{/* Upload Documents */}
<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
  <DocumentUploadForm 
    onSubmit={handleDocumentUpload}
    onCancel={() => console.log('Upload cancelled')}
  />
</div>
```

### Step 4: Add the Upload Handler

Add this function to handle document uploads:

```javascript
const handleDocumentUpload = (documentData) => {
  console.log('Document uploaded:', documentData);
  
  // Get the document category label
  const docType = DOCUMENT_TYPES_MASTER.find(
    doc => doc.code === documentData.documentType && doc.module === documentData.module
  );
  
  // Create new document entry
  const newDocument = {
    id: Date.now(),
    fileName: documentData.fileName,
    systemRef: documentData.referenceCode,
    documentTitle: documentData.file.name,
    documentCategory: docType ? docType.label : 'Unknown',
    size: formatFileSize(documentData.file.size),
    uploadedOn: new Date().toLocaleDateString(),
    module: documentData.module,
    entityCode: documentData.entityCode,
    documentType: documentData.documentType,
    year: documentData.year,
    sequence: documentData.sequence,
    file: documentData.file
  };

  // Add to uploaded documents list
  setUploadedDocuments(prev => [...prev, newDocument]);
  
  // Show success message
  alert(`Document uploaded successfully!\nReference: ${documentData.referenceCode}`);
  
  // TODO: Send to backend API when ready
  // await uploadToBackend(newDocument);
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

### Step 5: Display Uploaded Documents Table (Optional)

If you want to show the uploaded documents in a table below the form:

```jsx
{/* Uploaded Documents Table */}
{uploadedDocuments.length > 0 && (
  <div className="mt-6 bg-white rounded-lg shadow p-6">
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
                <button 
                  onClick={() => removeDocument(doc.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
```

---

## 📊 Document Categories Available

The form now includes 23 document types across 5 modules:

### Project (PRJ) - 8 types
- **CNTR**: Project Contract
- **UND**: Undertaking Letter
- **DRW**: Drawing / CAD
- **RPT**: Report
- **SUP**: Supervision Form
- **MOM**: Minutes of Meeting
- **CORR**: Correspondence / Letters
- **APP**: Approval Documents

### Human Resources (HR) - 4 types
- **ID**: Employee ID / Passport
- **MED**: Medical Report
- **CERT**: HR Certificates
- **CNTR**: Employment Contract

### Client (CLI) - 3 types
- **ID**: Client ID / Passport
- **CNTR**: Client Contract
- **UND**: Client Undertaking

### Finance (FIN) - 4 types
- **INV**: Tax Invoice
- **PINV**: Proforma Invoice
- **QUO**: Quotation
- **PAY**: Payment / Finance Document

### General (GEN) - 4 types
- **DOC**: General Document
- **LET**: General Letter
- **SUB**: Subcontractor Letter
- **CORR**: General Correspondence

---

## ✨ New Features Added

1. **Description Helper Text**: When you select a document type, a description appears below showing what that category is for
2. **Updated Labels**: "Document Type" changed to "Document Type / Category"
3. **Tooltips**: Hover over options to see descriptions
4. **Exported Master Table**: Can be reused in other components

---

## 🎯 Complete Example for Clients.js

Here's a complete example for the Upload Documents section in your Clients.js file:

```javascript
// At the top of the file
import DocumentUploadForm, { DOCUMENT_TYPES_MASTER } from './components/DocumentUploadForm';

// In your component
const [uploadedDocuments, setUploadedDocuments] = useState([]);

const handleDocumentUpload = (documentData) => {
  const docType = DOCUMENT_TYPES_MASTER.find(
    doc => doc.code === documentData.documentType && doc.module === documentData.module
  );
  
  const newDocument = {
    id: Date.now(),
    fileName: documentData.fileName,
    systemRef: documentData.referenceCode,
    documentCategory: docType ? docType.label : 'Unknown',
    size: formatFileSize(documentData.file.size),
    uploadedOn: new Date().toLocaleDateString(),
    file: documentData.file
  };

  setUploadedDocuments(prev => [...prev, newDocument]);
  alert(`Document uploaded!\nRef: ${documentData.referenceCode}`);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// In your JSX, replace the upload section with:
<DocumentUploadForm 
  onSubmit={handleDocumentUpload}
  onCancel={() => setShowAddModal(false)}
/>
```

---

## 🚀 Quick Test

After integration:

1. Open your Upload Documents modal
2. Select a Module (e.g., PRJ)
3. Enter Entity Code (e.g., REF-002)
4. Select Document Type - you should see a description appear
5. Upload a file
6. Check the generated reference code

**Example Output:**
```
PRJ-REF-002-CNTR-2025-XXX
```

---

## 💡 Tips

1. **The description helper text** appears automatically when you select a document type
2. **Tooltips** show when you hover over dropdown options
3. **All validations** are built-in
4. **File types** are restricted to PDF, DOCX, XLSX, PNG, JPG
5. **Max file size** is 10MB

---

## 📞 Need Help?

If you need help with the integration, let me know which file you're modifying and I'll provide specific line-by-line instructions!

---

**Updated**: January 2025  
**Version**: 2.0 (with document descriptions)



