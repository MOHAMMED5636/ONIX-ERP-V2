import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { getCurrentUser, isTenderEngineer } from "../utils/auth";

export default function TenderEngineerDashboard() {
  const navigate = useNavigate();
  const [assignedTenders, setAssignedTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, accepted, completed

  useEffect(() => {
    // Check authentication
    if (!isTenderEngineer()) {
      navigate("/login/tender-engineer", { replace: true });
      return;
    }

    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Load assigned tenders
    loadAssignedTenders(currentUser?.id || currentUser?.email);
  }, [navigate]);

  const loadAssignedTenders = (engineerId) => {
    try {
      setLoading(true);
      
      // Get invitations from localStorage
      const invitationsStr = localStorage.getItem('tenderInvitations');
      let invitations = [];
      
      if (invitationsStr) {
        invitations = JSON.parse(invitationsStr);
      }
      
      // Filter invitations for this engineer
      const engineerInvitations = invitations.filter(inv => {
        // Match by engineer ID or email
        return inv.engineerId === engineerId || 
               inv.engineerEmail?.toLowerCase() === engineerId?.toLowerCase() ||
               (inv.engineer && (inv.engineer.id === engineerId || inv.engineer.email?.toLowerCase() === engineerId?.toLowerCase()));
      });
      
      // Get project data from localStorage
      const projectsStr = localStorage.getItem('projectTasks');
      let projects = [];
      
      if (projectsStr) {
        projects = JSON.parse(projectsStr);
      }
      
      // Combine invitation data with project data
      const tenders = engineerInvitations.map(inv => {
        const project = projects.find(p => 
          p.id?.toString() === inv.projectId?.toString() ||
          p.referenceNumber === inv.projectReference
        );
        
        return {
          id: inv.tenderId || inv.projectId,
          invitationToken: inv.token,
          name: project?.name || inv.tenderName || 'Unknown Project',
          client: project?.client || inv.client || 'N/A',
          referenceNumber: project?.referenceNumber || inv.referenceNumber || 'N/A',
          status: inv.status || 'pending', // pending, accepted, completed
          assignedAt: inv.assignedAt || inv.createdAt,
          acceptedAt: inv.acceptedAt,
          deadline: project?.timeline?.[0] || inv.deadline,
          project: project,
          invitation: inv,
        };
      });
      
      setAssignedTenders(tenders);
    } catch (error) {
      console.error('Error loading assigned tenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTenders = () => {
    if (filter === "all") return assignedTenders;
    return assignedTenders.filter(t => t.status === filter);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Accepted
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <ClockIcon className="h-4 w-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  const handleViewTender = (tender) => {
    // Navigate to tender engineer's own submission page, NOT main ERP invitation page
    // Tender Engineers should NOT access /tender/invitation/* routes
    const tenderId = tender.invitationToken || tender.id;
    if (tenderId) {
      navigate(`/erp/tender/submit/${tenderId}`);
    }
  };

  const stats = {
    total: assignedTenders.length,
    pending: assignedTenders.filter(t => t.status === 'pending').length,
    accepted: assignedTenders.filter(t => t.status === 'accepted').length,
    completed: assignedTenders.filter(t => t.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 mb-2">
              Tender Engineer Dashboard
            </h1>
            <p className="text-slate-600">
              Welcome back, <span className="font-semibold text-indigo-600">{user?.name || user?.email}</span>
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Tenders</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Accepted</p>
                <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All Tenders" },
              { value: "pending", label: "Pending" },
              { value: "accepted", label: "Accepted" },
              { value: "completed", label: "Completed" },
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filter === filterOption.value
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tenders List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            Assigned Tenders
          </h2>
          
          {getFilteredTenders().length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium mb-2">
                No tenders assigned yet
              </p>
              <p className="text-slate-400 text-sm">
                You will see assigned tenders here once the admin assigns projects to you.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredTenders().map((tender) => (
                <div
                  key={tender.id}
                  className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleViewTender(tender)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">
                        {tender.name}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <BuildingOfficeIcon className="h-4 w-4 text-slate-400" />
                          <span>{tender.client}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <DocumentTextIcon className="h-4 w-4 text-slate-400" />
                          <span>Ref: {tender.referenceNumber}</span>
                        </div>
                        {tender.deadline && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarIcon className="h-4 w-4 text-slate-400" />
                            <span>
                              {new Date(tender.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    {getStatusBadge(tender.status)}
                    <ArrowRightIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

