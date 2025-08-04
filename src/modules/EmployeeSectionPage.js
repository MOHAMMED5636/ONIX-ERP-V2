import React, { useState } from "react";
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon, ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';

const demoEmployees = {
  "ceo-global": [
    { id: 1, name: "John Smith", email: "john.smith@company.com", phone: "+1-555-0123", status: "Active", hireDate: "2023-01-15" },
    { id: 2, name: "Sarah Johnson", email: "sarah.johnson@company.com", phone: "+1-555-0124", status: "Active", hireDate: "2023-03-20" },
  ],
  "ceo-regional": [
    { id: 1, name: "Michael Brown", email: "michael.brown@company.com", phone: "+1-555-0125", status: "Active", hireDate: "2023-02-10" },
  ],
  "cfo-north-america": [
    { id: 1, name: "Emily Davis", email: "emily.davis@company.com", phone: "+1-555-0126", status: "Active", hireDate: "2023-01-05" },
    { id: 2, name: "David Wilson", email: "david.wilson@company.com", phone: "+1-555-0127", status: "Inactive", hireDate: "2022-11-15" },
  ],
  "senior-project-manager": [
    { id: 1, name: "Lisa Anderson", email: "lisa.anderson@company.com", phone: "+1-555-0128", status: "Active", hireDate: "2023-04-12" },
    { id: 2, name: "Robert Taylor", email: "robert.taylor@company.com", phone: "+1-555-0129", status: "Active", hireDate: "2023-05-08" },
  ],
  "junior-project-manager": [
    { id: 1, name: "Jennifer Martinez", email: "jennifer.martinez@company.com", phone: "+1-555-0130", status: "Active", hireDate: "2023-06-15" },
  ],
  "lead-designer": [
    { id: 1, name: "Alex Thompson", email: "alex.thompson@company.com", phone: "+1-555-0131", status: "Active", hireDate: "2023-03-01" },
  ],
  "ui-ux-designer": [
    { id: 1, name: "Maria Garcia", email: "maria.garcia@company.com", phone: "+1-555-0132", status: "Active", hireDate: "2023-04-20" },
    { id: 2, name: "James Rodriguez", email: "james.rodriguez@company.com", phone: "+1-555-0133", status: "Active", hireDate: "2023-05-10" },
  ],
  "creative-director": [
    { id: 1, name: "Amanda Lee", email: "amanda.lee@company.com", phone: "+1-555-0134", status: "Active", hireDate: "2023-02-28" },
  ],
  "art-director": [
    { id: 1, name: "Christopher White", email: "christopher.white@company.com", phone: "+1-555-0135", status: "Active", hireDate: "2023-01-20" },
  ],
  "committee-chair": [
    { id: 1, name: "Patricia Clark", email: "patricia.clark@company.com", phone: "+1-555-0136", status: "Active", hireDate: "2023-03-15" },
  ],
  "committee-member": [
    { id: 1, name: "Daniel Lewis", email: "daniel.lewis@company.com", phone: "+1-555-0137", status: "Active", hireDate: "2023-04-05" },
    { id: 2, name: "Nancy Hall", email: "nancy.hall@company.com", phone: "+1-555-0138", status: "Active", hireDate: "2023-05-12" },
  ],
  "strategic-planner": [
    { id: 1, name: "Kevin Young", email: "kevin.young@company.com", phone: "+1-555-0139", status: "Active", hireDate: "2023-02-10" },
  ],
  "business-analyst": [
    { id: 1, name: "Stephanie King", email: "stephanie.king@company.com", phone: "+1-555-0140", status: "Active", hireDate: "2023-03-25" },
  ],
  "risk-manager": [
    { id: 1, name: "Thomas Wright", email: "thomas.wright@company.com", phone: "+1-555-0141", status: "Active", hireDate: "2023-01-30" },
  ],
  "compliance-officer": [
    { id: 1, name: "Rebecca Green", email: "rebecca.green@company.com", phone: "+1-555-0142", status: "Active", hireDate: "2023-04-08" },
  ],
  "senior-agile-coach": [
    { id: 1, name: "Steven Baker", email: "steven.baker@company.com", phone: "+1-555-0143", status: "Active", hireDate: "2023-02-15" },
  ],
  "scrum-master": [
    { id: 1, name: "Michelle Adams", email: "michelle.adams@company.com", phone: "+1-555-0144", status: "Active", hireDate: "2023-03-10" },
  ],
  "product-owner": [
    { id: 1, name: "Jason Nelson", email: "jason.nelson@company.com", phone: "+1-555-0145", status: "Active", hireDate: "2023-01-25" },
  ],
  "product-manager": [
    { id: 1, name: "Heather Carter", email: "heather.carter@company.com", phone: "+1-555-0146", status: "Active", hireDate: "2023-04-18" },
  ],
  "technical-lead": [
    { id: 1, name: "Ryan Mitchell", email: "ryan.mitchell@company.com", phone: "+1-555-0147", status: "Active", hireDate: "2023-02-05" },
  ],
  "senior-developer": [
    { id: 1, name: "Nicole Perez", email: "nicole.perez@company.com", phone: "+1-555-0148", status: "Active", hireDate: "2023-03-20" },
    { id: 2, name: "Andrew Roberts", email: "andrew.roberts@company.com", phone: "+1-555-0149", status: "Active", hireDate: "2023-05-05" },
  ],
  "senior-graphic-designer": [
    { id: 1, name: "Rachel Turner", email: "rachel.turner@company.com", phone: "+1-555-0150", status: "Active", hireDate: "2023-01-12" },
  ],
  "junior-graphic-designer": [
    { id: 1, name: "Brandon Phillips", email: "brandon.phillips@company.com", phone: "+1-555-0151", status: "Active", hireDate: "2023-04-30" },
  ],
  "web-designer": [
    { id: 1, name: "Lauren Campbell", email: "lauren.campbell@company.com", phone: "+1-555-0152", status: "Active", hireDate: "2023-02-22" },
  ],
  "frontend-designer": [
    { id: 1, name: "Gregory Parker", email: "gregory.parker@company.com", phone: "+1-555-0153", status: "Active", hireDate: "2023-03-18" },
  ],
  "brand-designer": [
    { id: 1, name: "Samantha Evans", email: "samantha.evans@company.com", phone: "+1-555-0154", status: "Active", hireDate: "2023-01-08" },
  ],
  "visual-designer": [
    { id: 1, name: "Eric Edwards", email: "eric.edwards@company.com", phone: "+1-555-0155", status: "Active", hireDate: "2023-04-14" },
  ],
};

export default function EmployeeSectionPage() {
  const { jobTitleId } = useParams();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState(demoEmployees[jobTitleId] || []);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', phone: '', status: 'Active', hireDate: '' });
  const [editEmployee, setEditEmployee] = useState({ name: '', email: '', phone: '', status: 'Active', hireDate: '' });

  const handleCreateEmployee = () => {
    const newId = Math.max(...employees.map(emp => emp.id), 0) + 1;
    const employeeToAdd = { ...newEmployee, id: newId };
    setEmployees([...employees, employeeToAdd]);
    setShowCreateModal(false);
    setNewEmployee({ name: '', email: '', phone: '', status: 'Active', hireDate: '' });
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEditEmployee({ ...employee });
    setShowEditModal(true);
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleUpdateEmployee = () => {
    setEmployees(employees.map(emp => 
      emp.id === selectedEmployee.id ? { ...editEmployee, id: emp.id } : emp
    ));
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const confirmDeleteEmployee = () => {
    setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
    setShowDeleteModal(false);
    setSelectedEmployee(null);
  };

  const getJobTitleName = (jobTitleId) => {
    return jobTitleId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Employee Section</h1>
                <p className="text-gray-600 mt-1">Managing employees for {getJobTitleName(jobTitleId)}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
          {employees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{employee.name}</h3>
                  <p className="text-gray-600 text-xs">{employee.email}</p>
                  <p className="text-gray-500 text-xs">{employee.phone}</p>
                  <div className="flex items-center mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status}
                    </span>
                    <span className="text-gray-500 text-xs ml-2">Hired: {employee.hireDate}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewEmployee(employee)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="View employee"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditEmployee(employee)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                    title="Edit employee"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(employee)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete employee"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Employees ({employees.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="h-8 w-8 text-purple-400" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.email}</div>
                      <div className="text-sm text-gray-500">{employee.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.hireDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewEmployee(employee)}
                          className="text-blue-600 hover:text-blue-900 transition"
                          title="View employee"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="text-yellow-600 hover:text-yellow-900 transition"
                          title="Edit employee"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          className="text-red-600 hover:text-red-900 transition"
                          title="Delete employee"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter employee name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newEmployee.status}
                    onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    value={newEmployee.hireDate}
                    onChange={(e) => setNewEmployee({...newEmployee, hireDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEmployee}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Employee</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editEmployee.name}
                    onChange={(e) => setEditEmployee({...editEmployee, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmployee.email}
                    onChange={(e) => setEditEmployee({...editEmployee, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editEmployee.phone}
                    onChange={(e) => setEditEmployee({...editEmployee, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editEmployee.status}
                    onChange={(e) => setEditEmployee({...editEmployee, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    value={editEmployee.hireDate}
                    onChange={(e) => setEditEmployee({...editEmployee, hireDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEmployee}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Update Employee
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Employee Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900">{selectedEmployee.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900">{selectedEmployee.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-sm text-gray-900">{selectedEmployee.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedEmployee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedEmployee.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <p className="text-sm text-gray-900">{selectedEmployee.hireDate}</p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Delete Employee</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{selectedEmployee.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteEmployee}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete Employee
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 