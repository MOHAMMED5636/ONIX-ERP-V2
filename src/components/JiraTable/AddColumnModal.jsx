import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';

export const AddColumnModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    type: 'text',
    width: 150,
    sortable: true,
    options: []
  });

  const columnTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'person', label: 'Person Selector' },
    { value: 'daterange', label: 'Date Range' },
    { value: 'file', label: 'File Upload' },
    { value: 'checklist', label: 'Checklist' },
    { value: 'url', label: 'URL' },
    { value: 'rating', label: 'Rating' },
    { value: 'progress', label: 'Progress Bar' },
    { value: 'color', label: 'Color Indicator' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add New Column</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Column Key */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Column Key *
            </label>
            <Input
              value={formData.key}
              onChange={(e) => handleInputChange('key', e.target.value)}
              placeholder="e.g., customField"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Unique identifier for the column (no spaces, lowercase)
            </p>
          </div>

          {/* Column Label */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Column Label *
            </label>
            <Input
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              placeholder="e.g., Custom Field"
              required
            />
          </div>

          {/* Column Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Column Type *
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {columnTypes.find(t => t.value === formData.type)?.label || 'Select Type'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {columnTypes.map(type => (
                  <DropdownMenuItem
                    key={type.value}
                    onClick={() => handleInputChange('type', type.value)}
                  >
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Width */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width (px)
            </label>
            <Input
              type="number"
              value={formData.width}
              onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 150)}
              placeholder="150"
            />
          </div>

          {/* Sortable */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.sortable}
                onChange={(e) => handleInputChange('sortable', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Sortable
              </span>
            </label>
          </div>

          {/* Options for dropdown type */}
          {formData.type === 'dropdown' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dropdown Options
              </label>
              <textarea
                value={formData.options.join('\n')}
                onChange={(e) => handleInputChange('options', e.target.value.split('\n').filter(Boolean))}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                className="w-full h-20 p-3 border rounded-md resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter each option on a new line
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Column
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
