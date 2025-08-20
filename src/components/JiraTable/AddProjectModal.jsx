import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';

export const AddProjectModal = ({ onClose, onAdd, autoSuggestData }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    referenceNumber: '',
    status: 'To Do',
    owner: '',
    timeline: { startDate: '', endDate: '' },
    planDays: 0,
    remarks: '',
    assigneeNotes: '',
    attachments: [],
    priority: 'Medium',
    location: '',
    plotNumber: '',
    community: '',
    projectType: 'Residential',
    projectFloor: 1,
    developer: '',
    projectAutoPredecessor: '',
    checklist: [],
    link: '',
    rating: 3,
    progress: 0,
    colorIndicator: '#3B82F6'
  });

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add New Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <Input
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number *
              </label>
              <Input
                value={formData.referenceNumber}
                onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                placeholder="REF-XXX"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {formData.status}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {['To Do', 'In Progress', 'Done'].map(status => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleInputChange('status', status)}
                    >
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Owner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {formData.owner || 'Select Owner'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {autoSuggestData.owners.map(owner => (
                    <DropdownMenuItem
                      key={owner}
                      onClick={() => handleInputChange('owner', owner)}
                    >
                      {owner}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Timeline Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <Input
                type="date"
                value={formData.timeline.startDate}
                onChange={(e) => handleInputChange('timeline', {
                  ...formData.timeline,
                  startDate: e.target.value
                })}
              />
            </div>

            {/* Timeline End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <Input
                type="date"
                value={formData.timeline.endDate}
                onChange={(e) => handleInputChange('timeline', {
                  ...formData.timeline,
                  endDate: e.target.value
                })}
              />
            </div>

            {/* Plan Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Days
              </label>
              <Input
                type="number"
                value={formData.planDays}
                onChange={(e) => handleInputChange('planDays', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {formData.priority}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {['Low', 'Medium', 'High'].map(priority => (
                    <DropdownMenuItem
                      key={priority}
                      onClick={() => handleInputChange('priority', priority)}
                    >
                      {priority}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {formData.location || 'Select Location'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {autoSuggestData.locations.map(location => (
                    <DropdownMenuItem
                      key={location}
                      onClick={() => handleInputChange('location', location)}
                    >
                      {location}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Plot Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plot Number
              </label>
              <Input
                value={formData.plotNumber}
                onChange={(e) => handleInputChange('plotNumber', e.target.value)}
                placeholder="PL-YYYY-XXX"
              />
            </div>

            {/* Community */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {formData.community || 'Select Community'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {autoSuggestData.communities.map(community => (
                    <DropdownMenuItem
                      key={community}
                      onClick={() => handleInputChange('community', community)}
                    >
                      {community}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {formData.projectType}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {['Residential', 'Commercial', 'Hospitality', 'Industrial'].map(type => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => handleInputChange('projectType', type)}
                    >
                      {type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Project Floor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Floor
              </label>
              <Input
                type="number"
                value={formData.projectFloor}
                onChange={(e) => handleInputChange('projectFloor', parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>

            {/* Developer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developer
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {formData.developer || 'Select Developer'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {autoSuggestData.developers.map(developer => (
                    <DropdownMenuItem
                      key={developer}
                      onClick={() => handleInputChange('developer', developer)}
                    >
                      {developer}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Auto Predecessor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto Predecessor
              </label>
              <Input
                value={formData.projectAutoPredecessor}
                onChange={(e) => handleInputChange('projectAutoPredecessor', e.target.value)}
                placeholder="REF-XXX"
              />
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link
              </label>
              <Input
                value={formData.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>

            {/* Color Indicator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Indicator
              </label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded-full border cursor-pointer"
                  style={{ backgroundColor: formData.colorIndicator }}
                  onClick={() => {
                    const color = prompt('Enter color (hex):', formData.colorIndicator);
                    if (color) handleInputChange('colorIndicator', color);
                  }}
                />
                <Input
                  value={formData.colorIndicator}
                  onChange={(e) => handleInputChange('colorIndicator', e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="Enter project remarks..."
              className="w-full h-20 p-3 border rounded-md resize-none"
            />
          </div>

          {/* Assignee Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignee Notes
            </label>
            <textarea
              value={formData.assigneeNotes}
              onChange={(e) => handleInputChange('assigneeNotes', e.target.value)}
              placeholder="Enter assignee notes..."
              className="w-full h-20 p-3 border rounded-md resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

