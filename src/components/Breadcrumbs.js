import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const Breadcrumbs = ({ names = {} }) => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Department names mapping
  const departmentNames = {
    "board-of-directors": "Board of Directors",
    "project-management": "Project Management", 
    "design-management": "Design Management"
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

  // Get the current path segments
  const pathSegments = location.pathname.split('/').filter(segment => segment);

  // Define the breadcrumb structure based on the current route
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { name: 'Home', path: '/companies', icon: HomeIcon }
    ];

    // Departments page
    if (pathSegments.includes('departments') && pathSegments.length === 1) {
      breadcrumbs.push({ name: 'ONIX Construction', path: '/departments' });
    }
    
    // SubDepartments page
    else if (pathSegments.includes('departments') && pathSegments.length >= 3 && pathSegments.includes('sub-departments') && pathSegments.length === 4) {
      const departmentId = pathSegments[2];
      const departmentName = departmentNames[departmentId] || names.department || 'Department';
      
      breadcrumbs.push(
        { name: 'ONIX Construction', path: '/departments' },
        { name: departmentName, path: `/company-resources/departments/${departmentId}/sub-departments` }
      );
    }
    
    // Individual SubDepartment page
    else if (pathSegments.includes('departments') && pathSegments.length >= 5 && pathSegments.includes('sub-departments') && pathSegments.includes('positions')) {
      const departmentId = pathSegments[2];
      const subDepartmentId = pathSegments[4];
      const departmentName = departmentNames[departmentId] || names.department || 'Department';
      const subDepartmentName = subDepartmentNames[subDepartmentId] || names.subdepartment || 'Sub Department';
      
      breadcrumbs.push(
        { name: 'ONIX Construction', path: '/departments' },
        { name: departmentName, path: `/company-resources/departments/${departmentId}/sub-departments` },
        { name: subDepartmentName, path: `/company-resources/departments/${departmentId}/sub-departments/${subDepartmentId}/positions` }
      );
    }
    
    // Department page (without sub-departments) - this should not happen with current routing
    else if (pathSegments.includes('departments') && pathSegments.length >= 3 && !pathSegments.includes('sub-departments')) {
      const departmentId = pathSegments[2];
      const departmentName = departmentNames[departmentId] || names.department || 'Department';
      
      breadcrumbs.push(
        { name: 'ONIX Construction', path: '/departments' },
        { name: departmentName, path: `/company-resources/departments/${departmentId}/sub-departments` }
      );
    }
    
    // Positions page
    else if (pathSegments.includes('positions') && pathSegments.length >= 5) {
      const departmentId = pathSegments[2];
      const subDepartmentId = pathSegments[4];
      const departmentName = departmentNames[departmentId] || names.department || 'Department';
      const subDepartmentName = subDepartmentNames[subDepartmentId] || names.subdepartment || 'Sub Department';
      
      breadcrumbs.push(
        { name: 'ONIX Construction', path: '/departments' },
        { name: departmentName, path: `/company-resources/departments/${departmentId}` },
        { name: subDepartmentName, path: `/company-resources/departments/${departmentId}/sub-departments/${subDepartmentId}` }
      );
    }
    
    // Employees page
    else if (pathSegments.includes('employees') && pathSegments.length >= 7) {
      const departmentId = pathSegments[2];
      const subDepartmentId = pathSegments[4];
      const positionId = pathSegments[6];
      const departmentName = departmentNames[departmentId] || names.department || 'Department';
      const subDepartmentName = subDepartmentNames[subDepartmentId] || names.subdepartment || 'Sub Department';
      const positionName = names.position || 'Position';
      
      breadcrumbs.push(
        { name: 'ONIX Construction', path: '/departments' },
        { name: departmentName, path: `/company-resources/departments/${departmentId}` },
        { name: subDepartmentName, path: `/company-resources/departments/${departmentId}/sub-departments/${subDepartmentId}` },
        { name: positionName, path: `/company-resources/departments/${departmentId}/sub-departments/${subDepartmentId}/positions/${positionId}` }
      );
    }
    
    // Employees directory page
    else if (pathSegments.includes('employees') && pathSegments.length === 1) {
      breadcrumbs.push(
        { name: 'ONIX Construction', path: '/departments' },
        { name: 'Board of Directors', path: '/company-resources/departments/board-of-directors/sub-departments' },
        { name: 'Executive Committee', path: '/company-resources/departments/board-of-directors/sub-departments/executive-committee/positions' },
        { name: 'Employees', path: '/employees' }
      );
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleBreadcrumbClick = (breadcrumb) => {
    if (breadcrumb.path !== location.pathname) {
      navigate(breadcrumb.path);
    }
  };

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 px-4 sm:px-6 lg:px-10 py-3 bg-white border-b border-gray-100">
      <div className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.path}>
            <button
              onClick={() => handleBreadcrumbClick(breadcrumb)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                index === breadcrumbs.length - 1
                  ? 'text-indigo-600 font-semibold bg-indigo-50'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              {breadcrumb.icon && <breadcrumb.icon className="h-4 w-4" />}
              <span>{breadcrumb.name}</span>
            </button>
            {index < breadcrumbs.length - 1 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumbs; 