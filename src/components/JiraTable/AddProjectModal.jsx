import React, { useState } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import ContractsAPI from '../../services/contractsAPI';

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
    colorIndicator: '#3B82F6',
    contractReferenceNumber: '', // Contract reference for auto-fill
  });

  // Contract auto-fill state
  const [contractReference, setContractReference] = useState('');
  const [contractLoading, setContractLoading] = useState(false);
  const [contractError, setContractError] = useState('');
  const [contractSuccess, setContractSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch contract data and auto-fill project form
  const fetchContractData = async (referenceNumber) => {
    if (!referenceNumber || referenceNumber.trim() === '') {
      setContractError('');
      setContractSuccess(false);
      return;
    }

    const refNum = referenceNumber.trim();
    console.log('🔍 Fetching contract data for reference:', refNum);
    
    setContractLoading(true);
    setContractError('');
    setContractSuccess(false);

    try {
      console.log('📡 Calling ContractsAPI.getContractByReferenceNumber...');
      const response = await ContractsAPI.getContractByReferenceNumber(refNum);
      
      console.log('📥 API Response received:', {
        success: response.success,
        hasProjectData: !!response.projectData,
        projectData: response.projectData,
        message: response.message,
        fullResponse: response
      });
      
      if (response.success && response.projectData) {
        console.log('✅ Contract found! Auto-filling form with:', response.projectData);
        
        // Auto-fill project form fields from contract data
        setFormData(prev => {
          const updated = {
            ...prev,
            // Map contract data to project fields
            projectName: response.projectData.name || prev.projectName,
            owner: response.projectData.owner || prev.owner,
            timeline: {
              startDate: response.projectData.startDate || prev.timeline.startDate,
              endDate: response.projectData.endDate || prev.timeline.endDate,
            },
            remarks: response.projectData.description || prev.remarks,
            plotNumber: response.projectData.plotNumber || prev.plotNumber,
            community: response.projectData.community || prev.community,
            projectFloor: response.projectData.numberOfFloors || prev.projectFloor,
            developer: response.projectData.owner || prev.developer,
            // Store contract reference for linking
            contractReferenceNumber: refNum,
          };
          
          console.log('📝 Form data updated:', updated);
          return updated;
        });

        setContractSuccess(true);
        setContractError('');
        
        // Clear success message after 3 seconds
        setTimeout(() => setContractSuccess(false), 3000);
      } else {
        const errorMsg = response.message || 'Contract not found. Please verify the reference number.';
        console.warn('⚠️ Contract not found:', errorMsg);
        setContractError(errorMsg);
        setContractSuccess(false);
      }
    } catch (error) {
      console.error('❌ Error fetching contract:', error);
      setContractError(`Failed to fetch contract data: ${error.message || 'Please try again.'}`);
      setContractSuccess(false);
    } finally {
      setContractLoading(false);
    }
  };

  // Handle contract reference input change
  const handleContractReferenceChange = (value) => {
    setContractReference(value);
    setContractError('');
    setContractSuccess(false);
  };

  // Handle contract reference blur (when user leaves the field)
  const handleContractReferenceBlur = () => {
    if (contractReference.trim()) {
      fetchContractData(contractReference);
    }
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
          {/* Contract Reference Number - Auto-Fill Section */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contract Reference Number (Optional - Auto-Fill)
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={contractReference}
                onChange={(e) => handleContractReferenceChange(e.target.value)}
                onBlur={handleContractReferenceBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (contractReference.trim()) {
                      fetchContractData(contractReference);
                    }
                  }
                }}
                placeholder="Enter contract reference (e.g., O-CT-ABC123)"
                className="flex-1"
                disabled={contractLoading}
              />
              <Button
                type="button"
                onClick={() => {
                  if (contractReference.trim()) {
                    fetchContractData(contractReference);
                  }
                }}
                disabled={contractLoading || !contractReference.trim()}
                variant="outline"
                className="whitespace-nowrap"
              >
                {contractLoading ? 'Loading...' : 'Load Contract'}
              </Button>
            </div>
            <div className="mt-2">
              {contractLoading && (
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Fetching contract data...</span>
                </div>
              )}
              {contractSuccess && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Contract data loaded successfully! Form fields have been auto-filled.</span>
                </div>
              )}
              {contractError && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span>{contractError}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Enter a contract reference number and click "Load Contract" or press Enter to automatically fill project details from the contract.
            </p>
          </div>

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

