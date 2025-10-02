import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon, BuildingOfficeIcon, CalendarDaysIcon, UserIcon } from '@heroicons/react/24/outline';

const ProjectSelector = ({ selectedProject, onProjectSelect, projects = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(projects);

  // Sample projects data if none provided
  const defaultProjects = [
    {
      id: '1',
      name: 'Residential Complex Alpha',
      referenceNumber: 'REF-001',
      status: 'In Progress',
      owner: 'John Smith',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      progress: 35,
      color: '#3B82F6'
    },
    {
      id: '2',
      name: 'Commercial Plaza Beta',
      referenceNumber: 'REF-002',
      status: 'Planning',
      owner: 'Sarah Johnson',
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      progress: 15,
      color: '#10B981'
    },
    {
      id: '3',
      name: 'Industrial Warehouse Gamma',
      referenceNumber: 'REF-003',
      status: 'Development',
      owner: 'Mike Wilson',
      startDate: '2024-02-01',
      endDate: '2024-08-15',
      progress: 60,
      color: '#F59E0B'
    },
    {
      id: '4',
      name: 'Mixed-Use Development Delta',
      referenceNumber: 'REF-004',
      status: 'Review',
      owner: 'Emily Davis',
      startDate: '2024-01-01',
      endDate: '2024-09-30',
      progress: 45,
      color: '#8B5CF6'
    },
    {
      id: '5',
      name: 'Infrastructure Project Epsilon',
      referenceNumber: 'REF-005',
      status: 'Testing',
      owner: 'David Brown',
      startDate: '2024-04-01',
      endDate: '2024-11-30',
      progress: 25,
      color: '#EF4444'
    }
  ];

  const projectsList = projects.length > 0 ? projects : defaultProjects;

  useEffect(() => {
    if (searchTerm) {
      const filtered = projectsList.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projectsList);
    }
  }, [searchTerm, projectsList]);

  const handleProjectSelect = (project) => {
    onProjectSelect(project);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      case 'development': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'testing': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      {/* Project Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-left flex items-center justify-between hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center space-x-3">
          <BuildingOfficeIcon className="w-5 h-5 text-gray-500" />
          <div>
            {selectedProject ? (
              <div>
                <div className="font-semibold text-gray-900">{selectedProject.name}</div>
                <div className="text-sm text-gray-500">{selectedProject.referenceNumber}</div>
              </div>
            ) : (
              <div className="text-gray-500">Select a project to view lifecycle</div>
            )}
          </div>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Projects List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: project.color }}
                        ></div>
                        <div>
                          <div className="font-semibold text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.referenceNumber}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-3 h-3" />
                          <span>{project.owner}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CalendarDaysIcon className="w-3 h-3" />
                          <span>{project.startDate} - {project.endDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <div className="text-xs text-gray-500">{project.progress}%</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${project.progress}%`,
                        backgroundColor: project.color
                      }}
                    ></div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <BuildingOfficeIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No projects found</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
