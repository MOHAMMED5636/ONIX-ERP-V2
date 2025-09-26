import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';

const EngineerInviteModal = ({ isOpen, onClose, taskId, taskName, currentAssignee, onInviteEngineer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [showEngineerDetails, setShowEngineerDetails] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Mock engineers data
  const engineers = [
    {
      id: 'SA',
      name: 'Sarah Ahmed',
      position: 'Senior Developer',
      department: 'Engineering',
      email: 'sarah.ahmed@company.com',
      phone: '+971 50 123 4567',
      avatar: 'SA',
      skills: ['React', 'Node.js', 'Python', 'AWS'],
      availability: 'Available',
      currentTasks: 3,
      qualifications: 'Bachelor of Computer Science, AWS Certified Developer',
      experience: '5 years',
      location: 'Dubai, UAE',
      joinDate: '2020-03-15'
    },
    {
      id: 'MN',
      name: 'Mohammed Nasser',
      position: 'Project Manager',
      department: 'Project Management',
      email: 'mohammed.nasser@company.com',
      phone: '+971 50 234 5678',
      avatar: 'MN',
      skills: ['Agile', 'Scrum', 'Leadership'],
      availability: 'Available',
      currentTasks: 2,
      qualifications: 'MBA in Project Management, PMP Certified',
      experience: '7 years',
      location: 'Abu Dhabi, UAE',
      joinDate: '2019-08-20'
    },
    {
      id: 'AH',
      name: 'Ahmed Hassan',
      position: 'UI/UX Designer',
      department: 'Design',
      email: 'ahmed.hassan@company.com',
      phone: '+971 50 345 6789',
      avatar: 'AH',
      skills: ['Figma', 'Adobe XD', 'User Research'],
      availability: 'Busy',
      currentTasks: 5,
      qualifications: 'Bachelor of Design, UX/UI Certification',
      experience: '4 years',
      location: 'Sharjah, UAE',
      joinDate: '2021-01-10'
    },
    {
      id: 'MA',
      name: 'Mariam Ali',
      position: 'Quality Assurance Engineer',
      department: 'Testing',
      email: 'mariam.ali@company.com',
      phone: '+971 50 456 7890',
      avatar: 'MA',
      skills: ['Testing', 'Automation', 'Quality Control'],
      availability: 'Available',
      currentTasks: 1,
      qualifications: 'Bachelor of Computer Science, ISTQB Certified',
      experience: '3 years',
      location: 'Dubai, UAE',
      joinDate: '2022-06-01'
    },
    {
      id: 'AL',
      name: 'Ali Lakhani',
      position: 'DevOps Engineer',
      department: 'Infrastructure',
      email: 'ali.lakhani@company.com',
      phone: '+971 50 567 8901',
      avatar: 'AL',
      skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
      availability: 'Available',
      currentTasks: 2,
      qualifications: 'Bachelor of Engineering, AWS Certified Solutions Architect',
      experience: '6 years',
      location: 'Dubai, UAE',
      joinDate: '2020-11-15'
    }
  ];

  // Filter engineers based on search term
  const filteredEngineers = engineers.filter(engineer =>
    engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedEngineer(null);
      setInviteMessage(`Hi! I'd like to invite you to work on the task: ${taskName}`);
      setShowEngineerDetails(false);
      setIsConfirming(false);
    }
  }, [isOpen, taskName]);

  const handleEngineerSelect = (engineer) => {
    setSelectedEngineer(engineer);
    setShowEngineerDetails(true);
  };

  const handleConfirmInvite = () => {
    setIsConfirming(true);
    // Simulate API call delay
    setTimeout(() => {
      if (selectedEngineer && onInviteEngineer) {
        onInviteEngineer({
          taskId,
          taskName,
          engineerId: selectedEngineer.id,
          engineerName: selectedEngineer.name,
          message: inviteMessage
        });
        alert(`✅ Engineer ${selectedEngineer.name} has been successfully assigned to "${taskName}"!`);
        onClose();
      }
      setIsConfirming(false);
    }, 1000);
  };

  const handleBackToSelection = () => {
    setShowEngineerDetails(false);
    setSelectedEngineer(null);
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Busy': return 'bg-red-100 text-red-800';
      case 'Away': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Invite Engineer</h2>
              <p className="text-sm text-gray-600">Assign engineer to: {taskName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Current Assignee */}
          {currentAssignee && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Current Assignee</h3>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {currentAssignee.charAt(0)}
                </div>
                <span className="text-sm text-blue-700">{currentAssignee}</span>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Engineers</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, position, or skills..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Engineers List */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-gray-900">Available Engineers</h3>
            {filteredEngineers.map((engineer) => (
              <div
                key={engineer.id}
                onClick={() => handleEngineerSelect(engineer)}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedEngineer?.id === engineer.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {engineer.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{engineer.name}</h4>
                      <p className="text-sm text-gray-600">{engineer.position}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(engineer.availability)}`}>
                          {engineer.availability}
                        </span>
                        <span className="text-xs text-gray-500">{engineer.currentTasks} current tasks</span>
                      </div>
                    </div>
                  </div>
                  {selectedEngineer?.id === engineer.id && (
                    <CheckIcon className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {engineer.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Engineer Details View */}
          {showEngineerDetails && selectedEngineer && (
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Engineer Details</h3>
                <button
                  onClick={handleBackToSelection}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {selectedEngineer.avatar}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{selectedEngineer.name}</h4>
                      <p className="text-lg text-gray-600">{selectedEngineer.position}</p>
                      <p className="text-sm text-gray-500">{selectedEngineer.department}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">📧 Email:</span>
                      <span className="text-sm text-gray-600">{selectedEngineer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">📞 Phone:</span>
                      <span className="text-sm text-gray-600">{selectedEngineer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">📍 Location:</span>
                      <span className="text-sm text-gray-600">{selectedEngineer.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">⏰ Experience:</span>
                      <span className="text-sm text-gray-600">{selectedEngineer.experience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">📅 Joined:</span>
                      <span className="text-sm text-gray-600">{selectedEngineer.joinDate}</span>
                    </div>
                  </div>
                </div>
                
                {/* Additional Info */}
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Qualifications</h5>
                    <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">{selectedEngineer.qualifications}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedEngineer.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(selectedEngineer.availability)}`}>
                        {selectedEngineer.availability}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Current Tasks:</span>
                      <span className="text-sm text-gray-600">{selectedEngineer.currentTasks}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invite Message */}
          {selectedEngineer && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Invite Message</label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write a message to the engineer..."
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200 bg-gray-50">
          {showEngineerDetails ? (
            <>
              <button
                onClick={handleBackToSelection}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to Selection
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmInvite}
                  disabled={isConfirming}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isConfirming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Confirm & Save
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setSelectedEngineer(null)}
                disabled={!selectedEngineer}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Select Engineer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngineerInviteModal;
