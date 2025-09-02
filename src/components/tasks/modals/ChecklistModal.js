import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

const ChecklistModal = ({ open, onClose, items = [], setItems, onSave }) => {
  const [localItems, setLocalItems] = useState([]);

  useEffect(() => {
    if (open) {
      // Initialize with existing items or default structure
      if (items && items.length > 0) {
        // Migrate old field names to new ones if needed
        const migratedItems = items.map(item => ({
          ...item,
          employeeConfirmation: item.employeeConfirmation !== undefined ? item.employeeConfirmation : (item.consultantConfirmation || false),
          projectManagerYes: item.projectManagerYes !== undefined ? item.projectManagerYes : (item.dmEngineerYes || false),
          projectManagerNo: item.projectManagerNo !== undefined ? item.projectManagerNo : (item.dmEngineerNo || false)
        }));
        setLocalItems(migratedItems);
      } else {
        // Create default empty row
        setLocalItems([{
          id: Date.now(),
          primaryNotes: '',
          employeeConfirmation: false,
          projectManagerYes: false,
          projectManagerNo: false,
          noteCategory: '',
          remarks: ''
        }]);
      }
    }
  }, [open, items]);

  const addRow = () => {
    const newRow = {
      id: Date.now() + Math.random(),
      primaryNotes: '',
      employeeConfirmation: false,
      projectManagerYes: false,
      projectManagerNo: false,
      noteCategory: '',
      remarks: ''
    };
    setLocalItems([...localItems, newRow]);
  };

  const removeRow = (id) => {
    if (localItems.length > 1) {
      setLocalItems(localItems.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setLocalItems(localItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = () => {
    onSave(localItems);
    onClose();
  };

  const handleCancel = () => {
    setLocalItems(items || []);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Submission Checklist</h2>
          <button
            onClick={handleCancel}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              {/* Table Header */}
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-center w-16">#</th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Primary Notes</th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-center w-32">Employee Confirmation</th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-center w-32" colSpan="2">Project Manager Confirmation</th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium w-32">Note Category</th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium w-32">Remarks</th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium w-20">Actions</th>
                </tr>
                <tr className="bg-blue-500 text-white">
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium"></th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium"></th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium"></th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-center w-16">Yes</th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium text-center w-16">No</th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium"></th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium"></th>
                  <th className="border border-gray-300 px-3 py-2 text-sm font-medium"></th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {localItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={item.primaryNotes}
                        onChange={(e) => updateItem(item.id, 'primaryNotes', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter primary notes..."
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.employeeConfirmation}
                        onChange={(e) => updateItem(item.id, 'employeeConfirmation', e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.projectManagerYes}
                        onChange={(e) => {
                          updateItem(item.id, 'projectManagerYes', e.target.checked);
                          if (e.target.checked) {
                            updateItem(item.id, 'projectManagerNo', false);
                          }
                        }}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.projectManagerNo}
                        onChange={(e) => {
                          updateItem(item.id, 'projectManagerNo', e.target.checked);
                          if (e.target.checked) {
                            updateItem(item.id, 'projectManagerYes', false);
                          }
                        }}
                        className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={item.noteCategory}
                        onChange={(e) => updateItem(item.id, 'noteCategory', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Category..."
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Remarks..."
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {localItems.length > 1 && (
                        <button
                          onClick={() => removeRow(item.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Remove row"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={addRow}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Row
            </button>
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
            Save Checklist
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistModal;
