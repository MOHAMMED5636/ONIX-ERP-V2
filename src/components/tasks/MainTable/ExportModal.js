import React, { useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ExportModal = ({ isOpen, onClose, exportData, totalCount }) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleCSVExport = () => {
    setIsExporting(true);
    try {
      if (exportData.length === 0) {
        alert('No data to export');
        setIsExporting(false);
        return;
      }

      // Convert to CSV
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes in CSV
            return `"${value.toString().replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `project_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onClose();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePDFExport = () => {
    setIsExporting(true);
    try {
      if (exportData.length === 0) {
        alert('No data to export');
        setIsExporting(false);
        return;
      }

      // Create new PDF document
      const doc = new jsPDF('landscape', 'pt', 'a4');
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Project Management Export', 40, 40);
      
      // Add export date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 40, 65);
      doc.text(`Total Projects: ${totalCount}`, 40, 80);

      // Prepare data for PDF table
      const tableData = exportData.map(row => [
        row['Project Name'] || '',
        row['Reference Number'] || '',
        row['Status'] || '',
        row['Owner'] || '',
        row['Priority'] || '',
        row['Progress'] || '',
        row['Start Date'] || '',
        row['End Date'] || '',
        row['Plan Days'] || '',
        row['Location'] || ''
      ]);

      const tableHeaders = [
        'Project Name',
        'Reference',
        'Status',
        'Owner',
        'Priority',
        'Progress',
        'Start Date',
        'End Date',
        'Plan Days',
        'Location'
      ];

      // Add table to PDF
      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: 100,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246], // Blue color
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251], // Light gray
        },
        columnStyles: {
          0: { cellWidth: 120 }, // Project Name
          1: { cellWidth: 80 },  // Reference
          2: { cellWidth: 60 },  // Status
          3: { cellWidth: 60 },  // Owner
          4: { cellWidth: 60 },  // Priority
          5: { cellWidth: 60 },  // Progress
          6: { cellWidth: 80 },  // Start Date
          7: { cellWidth: 80 },  // End Date
          8: { cellWidth: 60 },  // Plan Days
          9: { cellWidth: 100 }, // Location
        },
        margin: { top: 100, left: 40, right: 40, bottom: 40 },
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() - 100,
          doc.internal.pageSize.getHeight() - 20
        );
      }

      // Save the PDF
      doc.save(`project_export_${new Date().toISOString().split('T')[0]}.pdf`);
      onClose();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Choose the format to export your project data. You have {totalCount} project(s) ready to export.
          </p>

          <div className="space-y-4">
            {/* CSV Export Option */}
            <button
              onClick={handleCSVExport}
              disabled={isExporting}
              className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowDownTrayIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Export as CSV</h4>
                <p className="text-sm text-gray-500">Compatible with Excel, Google Sheets</p>
              </div>
            </button>

            {/* PDF Export Option */}
            <button
              onClick={handlePDFExport}
              disabled={isExporting}
              className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Export as PDF</h4>
                <p className="text-sm text-gray-500">Professional formatted report</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
