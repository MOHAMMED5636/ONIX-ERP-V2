import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem } from '../ui/dropdown-menu';
import { MagnifyingGlassIcon, FunnelIcon, EyeIcon, PlusIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export const Toolbar = ({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  visibleColumns,
  onVisibleColumnsChange,
  onAddProject,
  onAddColumn,
  autoSuggestData,
  selectedCount = 0,
  onBulkDelete
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left side - Add buttons and bulk actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onAddProject}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 font-medium"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Project
          </Button>
          
          <Button
            onClick={onAddColumn}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-all duration-200"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Column
          </Button>

          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={onBulkDelete}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete ({selectedCount})
              </Button>
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Export ({selectedCount})
              </Button>
            </div>
          )}
        </div>

        {/* Right side - Search and filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 w-64"
            />
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, status: null })}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, status: 'To Do' })}>
                To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, status: 'In Progress' })}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, status: 'Done' })}>
                Done
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Priority
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, priority: null })}>
                All Priorities
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, priority: 'Low' })}>
                Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, priority: 'Medium' })}>
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, priority: 'High' })}>
                High
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Project Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, projectType: null })}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, projectType: 'Residential' })}>
                Residential
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, projectType: 'Commercial' })}>
                Commercial
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, projectType: 'Hospitality' })}>
                Hospitality
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, projectType: 'Industrial' })}>
                Industrial
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, projectType: 'Retail' })}>
                Retail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, projectType: 'Office' })}>
                Office
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, projectType: 'Sports' })}>
                Sports
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, projectType: 'Healthcare' })}>
                Healthcare
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, projectType: 'Education' })}>
                Education
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Owner Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Owner
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-h-60 overflow-y-auto">
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, owner: null })}>
                All Owners
              </DropdownMenuItem>
              {autoSuggestData.owners.map(owner => (
                <DropdownMenuItem 
                  key={owner} 
                  onClick={() => onFiltersChange({ ...filters, owner })}
                >
                  {owner}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Community Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200">
                <FunnelIcon className="w-4 h-4 mr-2" />
                Community
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 max-h-60 overflow-y-auto">
              <DropdownMenuItem onClick={() => onFiltersChange({ ...filters, community: null })}>
                All Communities
              </DropdownMenuItem>
              {autoSuggestData.communities.map(community => (
                <DropdownMenuItem 
                  key={community} 
                  onClick={() => onFiltersChange({ ...filters, community })}
                >
                  {community}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200">
                <EyeIcon className="w-4 h-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {Object.entries(visibleColumns).map(([key, visible]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={visible}
                  onCheckedChange={(checked) => {
                    onVisibleColumnsChange({
                      ...visibleColumns,
                      [key]: checked,
                    });
                  }}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
