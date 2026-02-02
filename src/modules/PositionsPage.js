import React, { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, PlusIcon, UserGroupIcon, DocumentTextIcon, UserIcon, UsersIcon, ArrowLeftIcon, EyeIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { getDepartmentSubDepartments, getSubDepartmentById, getSubDepartmentPositions, createPosition, updatePosition, deletePosition } from '../services/departmentAPI';
import { getEmployees } from '../services/employeeAPI';

// Demo positions data for each sub-department
const demoPositions = {
  "executive-committee": [
    { id: 1, name: "Chief Executive Officer", description: "Overall company leadership and strategic direction", manager: "Rameez Alkadour", employees: 1, status: "Active", salary: "$150,000", requirements: "MBA, 10+ years experience" },
    { id: 2, name: "Chief Financial Officer", description: "Financial planning and corporate finance", manager: "Sarah Johnson", employees: 1, status: "Active", salary: "$120,000", requirements: "CPA, 8+ years experience" },
  ],
  "board-secretariat": [
    { id: 1, name: "Board Secretary", description: "Administrative support and board coordination", manager: "Sarah Johnson", employees: 1, status: "Active", salary: "$80,000", requirements: "Bachelor's degree, 5+ years experience" },
    { id: 2, name: "Executive Assistant", description: "Support for board members and executives", manager: "Mike Chen", employees: 2, status: "Active", salary: "$60,000", requirements: "Associate's degree, 3+ years experience" },
  ],
  "project-planning": [
    { id: 1, name: "Project Manager", description: "Lead project planning and execution", manager: "Abd Aljabar Alabd", employees: 2, status: "Active", salary: "$90,000", requirements: "PMP certification, 5+ years experience" },
    { id: 2, name: "Project Coordinator", description: "Coordinate project activities and resources", manager: "Lisa Wang", employees: 3, status: "Active", salary: "$65,000", requirements: "Bachelor's degree, 3+ years experience" },
  ],
  "project-execution": [
    { id: 1, name: "Senior Developer", description: "Lead technical implementation and development", manager: "Mike Chen", employees: 2, status: "Active", salary: "$110,000", requirements: "Computer Science degree, 7+ years experience" },
    { id: 2, name: "Quality Assurance Engineer", description: "Ensure project quality and testing", manager: "Emma Davis", employees: 2, status: "Active", salary: "$75,000", requirements: "IT degree, 4+ years experience" },
  ],
  "project-monitoring": [
    { id: 1, name: "Project Analyst", description: "Monitor project progress and metrics", manager: "Lisa Wang", employees: 2, status: "Active", salary: "$70,000", requirements: "Business degree, 3+ years experience" },
    { id: 2, name: "Reporting Specialist", description: "Generate project reports and insights", manager: "Alex Rodriguez", employees: 1, status: "Active", salary: "$60,000", requirements: "Data analysis skills, 2+ years experience" },
  ],
  "ui-ux-design": [
    { id: 1, name: "Senior UX Designer", description: "Lead user experience design and research", manager: "Kaddour Alkaodir", employees: 2, status: "Active", salary: "$95,000", requirements: "Design degree, 6+ years experience" },
    { id: 2, name: "UI Designer", description: "Create user interface designs and prototypes", manager: "Emma Davis", employees: 2, status: "Active", salary: "$75,000", requirements: "Design degree, 3+ years experience" },
  ],
  "graphic-design": [
    { id: 1, name: "Creative Director", description: "Lead creative direction and brand strategy", manager: "Emma Davis", employees: 1, status: "Active", salary: "$85,000", requirements: "Art degree, 8+ years experience" },
    { id: 2, name: "Graphic Designer", description: "Create visual designs and marketing materials", manager: "Alex Rodriguez", employees: 2, status: "Active", salary: "$60,000", requirements: "Art degree, 2+ years experience" },
  ],
  "product-design": [
    { id: 1, name: "Product Designer", description: "Design product concepts and user flows", manager: "Alex Rodriguez", employees: 1, status: "Active", salary: "$80,000", requirements: "Design degree, 4+ years experience" },
    { id: 2, name: "Industrial Designer", description: "Design physical product concepts", manager: "Kaddour Alkaodir", employees: 1, status: "Active", salary: "$70,000", requirements: "Industrial design degree, 3+ years experience" },
  ]
};

// Sub-department names mapping
const subDepartmentNames = {
  "executive-committee": "Executive Committee",
  "board-secretariat": "Board Secretariat",
  "project-planning": "Project Planning",
  "project-execution": "Project Execution",
  "project-monitoring": "Project Monitoring",
  "ui-ux-design": "UI/UX Design",
  "graphic-design": "Graphic Design",
  "product-design": "Product Design"
};

export default function PositionsPage() {
  const { departmentId, subDepartmentId } = useParams();
  const navigate = useNavigate();
  
  const [positions, setPositions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [newPosition, setNewPosition] = useState({ name: '', description: '', managerId: '', status: 'Active', requirements: '' });
  const [editPosition, setEditPosition] = useState({ name: '', description: '', managerId: '', status: 'Active', requirements: '' });
  const [subDepartment, setSubDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Fetch sub-department data and positions from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        let actualSubDeptId = subDepartmentId;
        let foundSubDept = null;

        // Check if subDepartmentId is a UUID (length 36 with hyphens) or a slug
        const isUUID = subDepartmentId && subDepartmentId.length === 36 && subDepartmentId.includes('-');
        
        if (isUUID) {
          // It's a UUID, fetch directly
          const deptResponse = await getSubDepartmentById(subDepartmentId);
          if (deptResponse.success && deptResponse.data) {
            foundSubDept = deptResponse.data;
            actualSubDeptId = deptResponse.data.id;
          }
        } else {
          // It's a slug, fetch all sub-departments for the department and find matching one
          if (departmentId) {
            const subDeptsResponse = await getDepartmentSubDepartments(departmentId);
            if (subDeptsResponse.success && subDeptsResponse.data) {
              // Find sub-department by matching slug (name converted to slug)
              const slugToMatch = subDepartmentId.toLowerCase();
              foundSubDept = subDeptsResponse.data.find(subDept => {
                const subDeptSlug = subDept.name.toLowerCase().replace(/\s+/g, '-');
                return subDeptSlug === slugToMatch || subDept.id === subDepartmentId;
              });
              
              if (foundSubDept) {
                actualSubDeptId = foundSubDept.id;
              }
            }
          }
        }
        
        if (foundSubDept) {
          setSubDepartment(foundSubDept);
        }
        
        // Load positions
        if (actualSubDeptId) {
          const positionsResponse = await getSubDepartmentPositions(actualSubDeptId);
          if (positionsResponse.success && positionsResponse.data) {
            // Transform backend data to match frontend format
            const transformed = positionsResponse.data.map(position => {
              // Determine manager display name
              let managerName = 'No Manager';
              if (position.manager) {
                if (position.manager.firstName && position.manager.lastName) {
                  managerName = `${position.manager.firstName} ${position.manager.lastName}`;
                } else if (position.manager.firstName) {
                  managerName = position.manager.firstName;
                } else if (position.manager.email) {
                  managerName = position.manager.email;
                } else {
                  managerName = 'Manager (No name)';
                }
              } else if (position.managerId) {
                managerName = `Manager (ID: ${position.managerId})`;
              }
              
              return {
                id: position.id,
                name: position.name,
                description: position.description || '',
                manager: managerName,
                managerId: position.managerId,
                employees: 0, // Backend doesn't track employees per position yet
                status: position.status === 'ACTIVE' ? 'Active' : 'Inactive',
                requirements: '', // Backend doesn't have requirements field
                // Keep full backend data for updates
                _backendData: position
              };
            });
            setPositions(transformed);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (subDepartmentId && departmentId) {
      loadData();
    }
  }, [subDepartmentId, departmentId]);

  const subDepartmentName = subDepartment?.name || subDepartmentNames[subDepartmentId] || "Sub Department";
  const companyName = subDepartment?.department?.company?.name || null;
  const departmentName = subDepartment?.department?.name || null;
  const company = subDepartment?.department?.company || null;

  // Load employees for manager selection
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const response = await getEmployees();
        if (response.success && response.data) {
          // Backend returns { data: { employees: [...], pagination: {...} } }
          // Handle both formats: direct array or nested object
          let employeesList = [];
          if (Array.isArray(response.data)) {
            employeesList = response.data;
          } else if (response.data.employees && Array.isArray(response.data.employees)) {
            employeesList = response.data.employees;
          } else if (Array.isArray(response.data.data)) {
            employeesList = response.data.data;
          }
          
          setEmployees(employeesList);
          console.log('✅ Loaded employees for manager selection:', employeesList.length);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error('Error loading employees:', error);
        setEmployees([]); // Set to empty array on error
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  // Filter positions based on search term
  const filteredPositions = positions.filter(position =>
    position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.requirements.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.id.toString().includes(searchTerm)
  );

  // Job titles functionality removed

  const handlePositionClick = (position) => {
    // Navigate to employees page when position is clicked with full context
    navigate('/employees', {
      state: {
        company: company,
        department: subDepartment?.department || null,
        departmentId: departmentId,
        subDepartment: subDepartment,
        subDepartmentId: subDepartment?.id || subDepartmentId,
        position: position,
        positionId: position?.id || null
      }
    });
  };

  const handleCreatePosition = async () => {
    if (newPosition.name && newPosition.description) {
      try {
        const actualSubDeptId = subDepartment?.id || subDepartmentId;
        if (!actualSubDeptId) {
          alert('Sub-department ID not found');
          return;
        }

        const positionData = {
          name: newPosition.name,
          description: newPosition.description,
          status: newPosition.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
          managerId: newPosition.managerId || null,
        };

        const response = await createPosition(actualSubDeptId, positionData);
        if (response.success) {
          // Reload positions
          const positionsResponse = await getSubDepartmentPositions(actualSubDeptId);
          if (positionsResponse.success && positionsResponse.data) {
            const transformed = positionsResponse.data.map(position => ({
              id: position.id,
              name: position.name,
              description: position.description || '',
              manager: '',
              employees: 0,
              status: position.status === 'ACTIVE' ? 'Active' : 'Inactive',
              requirements: '',
              _backendData: position
            }));
            setPositions(transformed);
          }
          setNewPosition({ name: '', description: '', managerId: '', status: 'Active', requirements: '' });
          setShowCreateModal(false);
        } else {
          alert(`Failed to create position: ${response.message}`);
        }
      } catch (error) {
        console.error('Error creating position:', error);
        alert(`Error creating position: ${error.message}`);
      }
    }
  };

  const handleEditPosition = (position) => {
    setSelectedPosition(position);
    setEditPosition({
      name: position.name,
      description: position.description || '',
      managerId: position.managerId || '',
      status: position.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
      requirements: position.requirements || ''
    });
    setShowEditModal(true);
  };

  const handleViewPosition = (position) => {
    setSelectedPosition(position);
    setShowViewModal(true);
  };

  const handleUpdatePosition = async () => {
    if (editPosition.name && editPosition.description) {
      try {
        const positionData = {
          name: editPosition.name,
          description: editPosition.description,
          status: editPosition.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
          managerId: editPosition.managerId || null,
        };

        const response = await updatePosition(selectedPosition.id, positionData);
        if (response.success) {
          // Reload positions
          const actualSubDeptId = subDepartment?.id || subDepartmentId;
          const positionsResponse = await getSubDepartmentPositions(actualSubDeptId);
          if (positionsResponse.success && positionsResponse.data) {
            const transformed = positionsResponse.data.map(position => ({
              id: position.id,
              name: position.name,
              description: position.description || '',
              manager: '',
              employees: 0,
              status: position.status === 'ACTIVE' ? 'Active' : 'Inactive',
              requirements: '',
              _backendData: position
            }));
            setPositions(transformed);
          }
          setShowEditModal(false);
          setSelectedPosition(null);
          setEditPosition({ name: '', description: '', managerId: '', status: 'Active', requirements: '' });
        } else {
          alert(`Failed to update position: ${response.message}`);
        }
      } catch (error) {
        console.error('Error updating position:', error);
        alert(`Error updating position: ${error.message}`);
      }
    }
  };

  const handleDeletePosition = (position) => {
    setSelectedPosition(position);
    setShowDeleteModal(true);
  };

  const confirmDeletePosition = async () => {
    try {
      const response = await deletePosition(selectedPosition.id);
      if (response.success) {
        // Reload positions
        const actualSubDeptId = subDepartment?.id || subDepartmentId;
        const positionsResponse = await getSubDepartmentPositions(actualSubDeptId);
        if (positionsResponse.success && positionsResponse.data) {
          const transformed = positionsResponse.data.map(position => ({
            id: position.id,
            name: position.name,
            description: position.description || '',
            manager: '',
            employees: 0,
            status: position.status === 'ACTIVE' ? 'Active' : 'Inactive',
            requirements: '',
            _backendData: position
          }));
          setPositions(transformed);
        }
        setShowDeleteModal(false);
        setSelectedPosition(null);
      } else {
        alert(`Failed to delete position: ${response.message}`);
      }
    } catch (error) {
      console.error('Error deleting position:', error);
      alert(`Error deleting position: ${error.message}`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Breadcrumbs names={{ company: companyName, department: departmentName, subdepartment: subDepartmentName }} company={company} />
      
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 px-4 sm:px-6 lg:px-10 border-b bg-white shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Back to Sub Departments"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <UserGroupIcon className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500" /> 
            {subDepartmentName} - Positions
          </h1>
        </div>
        <button
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto justify-center"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Position
        </button>
      </div>
      
      {/* Enhanced Section Header */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-3xl shadow-2xl p-8">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>
          <div className="absolute top-1/2 right-8 w-16 h-16 bg-white bg-opacity-5 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
                  <UserGroupIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-purple-100 text-lg leading-relaxed">Manage positions under {subDepartmentName}.</p>
                </div>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
                <div className="px-6 py-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <span className="text-white text-lg font-semibold">{filteredPositions.length} Positions</span>
                </div>
                <div className="px-6 py-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <span className="text-white text-lg font-semibold">
                    {searchTerm ? 'Filtered' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-white text-2xl font-bold">{filteredPositions.length}</div>
                <div className="text-purple-100 text-sm">
                  {searchTerm ? 'Filtered Positions' : 'Total Positions'}
                </div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-white text-2xl font-bold">{filteredPositions.reduce((sum, position) => sum + position.employees, 0)}</div>
                <div className="text-purple-100 text-sm">Total Employees</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-white text-2xl font-bold">{filteredPositions.filter(position => position.status === 'Active').length}</div>
                <div className="text-purple-100 text-sm">
                  {searchTerm ? 'Filtered Active' : 'Active Positions'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-10 mb-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search positions by name, description, manager, requirements, status, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                {filteredPositions.length} of {positions.length} positions
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )}
            </div>
          </div>
          {searchTerm && (
            <div className="mt-3 text-sm text-purple-600">
              Searching for: <span className="font-semibold">"{searchTerm}"</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 w-full flex justify-center items-start bg-gradient-to-br from-purple-50 to-white min-h-[60vh] px-2 sm:px-6 lg:px-10">
        <div className="w-full mt-4 sm:mt-8">
          {/* Enhanced Mobile Cards View */}
          <div className="lg:hidden space-y-6">
            {searchTerm && filteredPositions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No positions found</h3>
                <p className="text-gray-500 mb-4">No positions match your search criteria.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredPositions.map(position => (
              <div 
                key={position.id} 
                className="group bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:border-purple-300 transition-all duration-500 cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02]"
                onClick={() => handlePositionClick(position)}
                title="Click to view employees"
              >
                <div className="relative overflow-hidden">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                          <BriefcaseIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-900 transition-colors">{position.name}</h3>
                          <p className="text-gray-500 text-sm">Position</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPosition(position);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="View Position"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPosition(position);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Edit Position"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePosition(position);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
                          title="Delete Position"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed flex-1">{position.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="p-1.5 bg-purple-100 rounded-lg">
                            <UserIcon className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Manager</p>
                            <p className="font-semibold text-gray-900 text-sm">{position.manager}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="p-1.5 bg-violet-100 rounded-lg">
                            <UsersIcon className="h-4 w-4 text-violet-600" />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">Employees</p>
                            <p className="font-semibold text-gray-900 text-sm">{position.employees}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          position.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            position.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          {position.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Click to view employees</span>
                        <div className="flex items-center gap-2 text-purple-600 text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                          <span>View Employees</span>
                          <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
          
          {/* Enhanced Desktop Table View */}
          <div className="hidden lg:block">
            {searchTerm && filteredPositions.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No positions found</h3>
                  <p className="text-gray-500 mb-4">No positions match your search criteria.</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600">
                      <tr>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Position</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Description</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Manager</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Employees</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Status</th>
                        <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {filteredPositions.map(position => (
                      <tr 
                        key={position.id} 
                        className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all duration-300 cursor-pointer group" 
                        onClick={() => handlePositionClick(position)}
                        title="Click to view employees"
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                              <BriefcaseIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-base group-hover:text-purple-900 transition-colors">{position.name}</div>
                              <div className="text-gray-500 text-sm">Position</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="max-w-md">
                            <p className="text-gray-700 text-sm leading-relaxed">{position.description}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center shadow-sm">
                              <UserIcon className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <span className="text-gray-900 text-sm font-semibold">{position.manager}</span>
                              <div className="text-gray-500 text-xs">Manager</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center shadow-sm">
                              <UsersIcon className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-violet-100 text-violet-700 shadow-sm">
                                {position.employees} employees
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                            position.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              position.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            {position.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPosition(position);
                              }}
                              className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                              title="View Position"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPosition(position);
                              }}
                              className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                              title="Edit Position"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePosition(position);
                              }}
                              className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                              title="Delete Position"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* View Position Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 px-4 sm:px-5 py-3 sm:py-4">
              <EyeIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">View Position</h3>
            </div>
            {/* Modal Body */}
            <div className="p-3 sm:p-6 bg-gradient-to-br from-purple-50 to-white">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <BriefcaseIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedPosition?.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">{selectedPosition?.description}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Manager:</span>
                    <span className="text-gray-900">{selectedPosition?.manager}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Employees:</span>
                    <span className="text-gray-900">{selectedPosition?.employees}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Requirements:</span>
                    <span className="text-gray-900">{selectedPosition?.requirements}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      selectedPosition?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedPosition?.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button type="button" className="btn bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={() => setShowViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Position Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-1 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md relative animate-fade-in overflow-hidden border border-gray-100">
            {/* Modal Header with enhanced styling */}
            <div className="relative overflow-hidden">
              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 px-6 py-4">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <BriefcaseIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add Position</h3>
                  <p className="text-purple-100 text-sm">Create a new position under {subDepartmentName}</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>
            </div>
            
            {/* Modal Body with enhanced styling */}
            <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-purple-50">
              <div className="space-y-5">
                {/* Position Name Field */}
                <div className="group">
                  <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Position Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-sm bg-white shadow-sm" 
                      placeholder="e.g., Chief Executive Officer" 
                      value={newPosition.name} 
                      onChange={e => setNewPosition(f => ({ ...f, name: e.target.value }))} 
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-2 h-2 bg-purple-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </div>
                </div>

                {/* Description Field */}
                <div className="group">
                  <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-200 text-sm bg-white shadow-sm resize-none" 
                      rows="3"
                      placeholder="Describe the position's role and responsibilities..." 
                      value={newPosition.description} 
                      onChange={e => setNewPosition(f => ({ ...f, description: e.target.value }))} 
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-2 h-2 bg-pink-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </div>
                </div>

                {/* Manager Field */}
                <div className="group">
                  <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                    Manager <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 text-sm bg-white shadow-sm appearance-none" 
                      value={newPosition.managerId || ''} 
                      onChange={e => setNewPosition(f => ({ ...f, managerId: e.target.value }))} 
                    >
                      <option value="">Select a manager (optional)</option>
                      {loadingEmployees ? (
                        <option disabled>Loading employees...</option>
                      ) : Array.isArray(employees) && employees.length > 0 ? (
                        employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} {emp.email ? `(${emp.email})` : ''}
                          </option>
                        ))
                      ) : (
                        <option disabled>No employees available</option>
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Requirements Field */}
                <div className="group">
                  <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Requirements
                  </label>
                  <div className="relative">
                    <textarea 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm resize-none" 
                      rows="2"
                      placeholder="Enter job requirements and qualifications..." 
                      value={newPosition.requirements} 
                      onChange={e => setNewPosition(f => ({ ...f, requirements: e.target.value }))} 
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </div>
                </div>

                {/* Status Field */}
                <div className="group">
                  <label className="block font-semibold mb-2 text-gray-800 text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    Status
                  </label>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all duration-200 text-sm bg-white shadow-sm appearance-none" 
                      value={newPosition.status} 
                      onChange={e => setNewPosition(f => ({ ...f, status: e.target.value }))} 
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-0" 
                  onClick={handleCreatePosition}
                >
                  <span className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Create Position
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Position Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 px-4 sm:px-5 py-3 sm:py-4">
              <PencilIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">Edit Position</h3>
            </div>
            {/* Modal Body */}
            <div className="p-3 sm:p-6 bg-gradient-to-br from-blue-50 to-white">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Position Name <span className="text-red-500">*</span></label>
                  <input 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    placeholder="Enter position name" 
                    value={editPosition.name} 
                    onChange={e => setEditPosition(f => ({ ...f, name: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    rows="3"
                    placeholder="Enter position description" 
                    value={editPosition.description} 
                    onChange={e => setEditPosition(f => ({ ...f, description: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Manager</label>
                  <select 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm appearance-none" 
                    value={editPosition.managerId || ''} 
                    onChange={e => setEditPosition(f => ({ ...f, managerId: e.target.value }))} 
                  >
                    <option value="">No Manager</option>
                    {loadingEmployees ? (
                      <option disabled>Loading employees...</option>
                    ) : Array.isArray(employees) && employees.length > 0 ? (
                      employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} {emp.email ? `(${emp.email})` : ''}
                        </option>
                      ))
                    ) : (
                      <option disabled>No employees available</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Requirements</label>
                  <textarea 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    rows="2"
                    placeholder="Enter job requirements" 
                    value={editPosition.requirements} 
                    onChange={e => setEditPosition(f => ({ ...f, requirements: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-gray-700 text-sm">Status</label>
                  <select 
                    className="input focus:ring-2 focus:ring-blue-300 text-sm" 
                    value={editPosition.status} 
                    onChange={e => setEditPosition(f => ({ ...f, status: e.target.value }))} 
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 w-full sm:w-auto" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-0 w-full sm:w-auto" onClick={handleUpdatePosition}>Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-1 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md relative animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 px-4 sm:px-5 py-3 sm:py-4">
              <TrashIcon className="h-6 w-6 text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">Delete Position</h3>
            </div>
            {/* Modal Body */}
            <div className="p-3 sm:p-6 bg-gradient-to-br from-red-50 to-white">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <TrashIcon className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Are you sure?</h4>
                  <p className="text-gray-600 text-sm">
                    You are about to delete the position <strong>"{selectedPosition?.name}"</strong>. 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8 w-full">
                <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 w-full sm:w-auto" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-0 w-full sm:w-auto" onClick={confirmDeletePosition}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .input { @apply border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-200; }
        .btn { @apply px-4 py-2 rounded font-semibold transition bg-white border border-gray-200 hover:bg-purple-50 hover:text-purple-700 shadow-sm; }
        .btn-primary { @apply bg-purple-600 text-white hover:bg-purple-700 border-0; }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
} 