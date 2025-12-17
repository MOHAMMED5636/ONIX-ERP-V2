import React, { useState, useEffect } from "react";
import {
  UserPlusIcon,
  XMarkIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { generateInvitationToken, saveTenderInvitation } from "../utils/auth";

export default function TenderEngineerAssignment({ project, onClose, onAssign }) {
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [engineerEmail, setEngineerEmail] = useState("");
  const [engineerName, setEngineerName] = useState("");
  const [showAddEngineer, setShowAddEngineer] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEngineers();
  }, []);

  const loadEngineers = () => {
    try {
      const engineersStr = localStorage.getItem('tenderEngineers');
      if (engineersStr) {
        const engineersList = JSON.parse(engineersStr);
        setEngineers(engineersList);
      } else {
        // Initialize with demo engineer
        const demoEngineers = [
          {
            id: 'demo-engineer-1',
            name: 'Demo Engineer',
            email: 'engineer@onixgroup.ae',
            password: 'engineer@123',
            firstName: 'Demo',
            lastName: 'Engineer',
          }
        ];
        localStorage.setItem('tenderEngineers', JSON.stringify(demoEngineers));
        setEngineers(demoEngineers);
      }
    } catch (error) {
      console.error('Error loading engineers:', error);
      setEngineers([]);
    }
  };

  const handleAddEngineer = () => {
    if (!engineerEmail || !engineerName) {
      alert("Please fill in all fields");
      return;
    }

    const newEngineer = {
      id: `engineer-${Date.now()}`,
      name: engineerName,
      email: engineerEmail,
      password: 'engineer@123', // Default password - should be changed on first login
      firstName: engineerName.split(' ')[0],
      lastName: engineerName.split(' ').slice(1).join(' ') || '',
    };

    const updatedEngineers = [...engineers, newEngineer];
    localStorage.setItem('tenderEngineers', JSON.stringify(updatedEngineers));
    setEngineers(updatedEngineers);
    setEngineerEmail("");
    setEngineerName("");
    setShowAddEngineer(false);
    setSelectedEngineer(newEngineer);
  };

  const handleAssign = async () => {
    if (!selectedEngineer || !project) {
      alert("Please select an engineer");
      return;
    }

    setLoading(true);

    try {
      // Generate invitation token
      const token = generateInvitationToken();
      
      // Create invitation
      const invitation = {
        token: token,
        projectId: project.id,
        projectReference: project.referenceNumber,
        tenderId: project.id,
        tenderName: project.name || project.projectName,
        client: project.client,
        referenceNumber: project.referenceNumber,
        engineerId: selectedEngineer.id,
        engineerEmail: selectedEngineer.email,
        engineer: selectedEngineer,
        status: 'pending',
        assignedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        invitationLink: `${window.location.origin}/tender/invitation/${token}`,
      };

      // Save invitation
      saveTenderInvitation(invitation);

      // Generate invitation email
      const emailSubject = `Tender Invitation: ${project.name || project.projectName}`;
      const emailBody = `Dear ${selectedEngineer.name},

You have been assigned to work on the following tender project:

Project Name: ${project.name || project.projectName}
Reference Number: ${project.referenceNumber || 'N/A'}
Client: ${project.client || 'N/A'}

Please click on the following link to view and accept the tender invitation:
${invitation.invitationLink}

Best regards,
ONIX Engineering Team`;

      // Create mailto link
      const mailtoLink = `mailto:${selectedEngineer.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // Show success message
      const userChoice = window.confirm(
        `✓ Tender assigned successfully to ${selectedEngineer.name}!\n\n` +
        `Invitation Link: ${invitation.invitationLink}\n\n` +
        `Would you like to open your email client to send the invitation?`
      );

      if (userChoice) {
        window.location.href = mailtoLink;
      } else {
        // Copy link to clipboard
        navigator.clipboard.writeText(invitation.invitationLink).then(() => {
          alert(`Invitation link copied to clipboard!\n\n${invitation.invitationLink}`);
        });
      }

      // Callback
      if (onAssign) {
        onAssign(invitation);
      }

      onClose();
    } catch (error) {
      console.error('Error assigning tender:', error);
      alert('Error assigning tender. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-1">
              Assign Tender to Engineer
            </h2>
            <p className="text-sm text-slate-600">
              {project?.name || project?.projectName || 'Project'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <XMarkIcon className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Info */}
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
            <h3 className="text-sm font-semibold text-indigo-900 mb-2">Project Details</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {project?.name || project?.projectName}</p>
              <p><span className="font-medium">Reference:</span> {project?.referenceNumber || 'N/A'}</p>
              <p><span className="font-medium">Client:</span> {project?.client || 'N/A'}</p>
            </div>
          </div>

          {/* Engineers List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Select Engineer</h3>
              <button
                onClick={() => setShowAddEngineer(!showAddEngineer)}
                className="px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition flex items-center gap-2"
              >
                <UserPlusIcon className="h-4 w-4" />
                Add Engineer
              </button>
            </div>

            {/* Add Engineer Form */}
            {showAddEngineer && (
              <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Engineer Name
                  </label>
                  <input
                    type="text"
                    value={engineerName}
                    onChange={(e) => setEngineerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter engineer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={engineerEmail}
                    onChange={(e) => setEngineerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="engineer@example.com"
                  />
                </div>
                <button
                  onClick={handleAddEngineer}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                >
                  Add Engineer
                </button>
              </div>
            )}

            {/* Engineers List */}
            <div className="space-y-2">
              {engineers.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No engineers available. Add one to continue.</p>
              ) : (
                engineers.map((engineer) => (
                  <div
                    key={engineer.id}
                    onClick={() => setSelectedEngineer(engineer)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      selectedEngineer?.id === engineer.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <UserPlusIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{engineer.name}</p>
                          <p className="text-sm text-slate-600">{engineer.email}</p>
                        </div>
                      </div>
                      {selectedEngineer?.id === engineer.id && (
                        <CheckCircleIcon className="h-6 w-6 text-indigo-600" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedEngineer || loading}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center gap-2 ${
              !selectedEngineer || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Assigning...
              </>
            ) : (
              <>
                <EnvelopeIcon className="h-5 w-5" />
                Assign & Send Invitation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

