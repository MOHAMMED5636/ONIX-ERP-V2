import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export default function EmployeeProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) {
      setLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setProject(data.data);
        } else {
          setError(data.message || "Project not found");
        }
      })
      .catch((err) => setError(err.message || "Failed to load project"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }
  if (error || !project) {
    return (
      <div className="p-6">
        <p className="text-red-600 mb-4">{error || "Project not found"}</p>
        <button
          onClick={() => navigate("/employee/projects")}
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to My Projects
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/employee/projects")}
        className="flex items-center gap-1 text-slate-600 hover:text-slate-800 mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to My Projects
      </button>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">{project.name}</h1>
      <p className="text-slate-500 text-sm mb-6">
        {project.referenceNumber && `${project.referenceNumber} · `}
        {project.status || "—"}
      </p>
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {project.client && (
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Client</p>
            <p className="text-slate-800">{project.client.name || project.clientId}</p>
          </div>
        )}
        {project.description && (
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Description</p>
            <p className="text-slate-700">{project.description}</p>
          </div>
        )}
        {project._count && (
          <div className="flex gap-4 text-sm text-slate-500">
            <span>Tasks: {project._count.tasks ?? 0}</span>
            <span>Documents: {project._count.documents ?? 0}</span>
          </div>
        )}
      </div>
    </div>
  );
}
