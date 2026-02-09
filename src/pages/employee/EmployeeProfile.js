import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile } from "../../services/authAPI";
import PhotoUploadEnhanced from "../../components/PhotoUploadEnhanced";
import {
  UserCircleIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function EmployeeProfile() {
  const { user, refreshUser, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [photoUpdateKey, setPhotoUpdateKey] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    position: "",
    phone: "",
    department: "",
    employeeId: "",
    nationalIdNumber: "",
    nationalIdExpiryDate: "",
  });

  const [photo, setPhoto] = useState(null);

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        jobTitle: user.jobTitle || "",
        position: user.position || "",
        phone: user.phone || "",
        department: user.department || "",
        employeeId: user.employeeId || "",
        nationalIdNumber: user.nationalIdNumber || "",
        nationalIdExpiryDate: user.nationalIdExpiryDate
          ? new Date(user.nationalIdExpiryDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.photo) {
      setPhotoUpdateKey((prev) => prev + 1);
    }
  }, [user?.photo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      
      // Add photo if selected
      if (photo) {
        formDataToSend.append("photo", photo);
      }
      
      // Add editable fields
      if (formData.jobTitle !== undefined) {
        formDataToSend.append("jobTitle", formData.jobTitle);
      }
      if (formData.phone !== undefined) {
        formDataToSend.append("phone", formData.phone);
      }
      if (formData.position !== undefined) {
        formDataToSend.append("position", formData.position);
      }
      if (formData.nationalIdNumber !== undefined) {
        formDataToSend.append("nationalIdNumber", formData.nationalIdNumber);
      }
      if (formData.nationalIdExpiryDate) {
        formDataToSend.append("nationalIdExpiryDate", formData.nationalIdExpiryDate);
      }

      const response = await updateProfile(formDataToSend);

      if (response && response.success) {
        setSuccess(true);
        setIsEditing(false);
        
        if (response.data && updateUserData) {
          updateUserData(response.data);
        }
        
        if (photo) {
          setPhoto(null);
          setPhotoUpdateKey((prev) => prev + 1);
        }
        
        if (refreshUser) {
          setTimeout(async () => {
            await refreshUser();
          }, 1000);
        }
        
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error(response?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 
                      process.env.REACT_APP_API_URL?.replace('/api', '') || 
                      'http://localhost:3001';
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    if (photoPath.startsWith('/uploads/')) {
      return `${backendUrl}${photoPath}`;
    }
    return `${backendUrl}/uploads/photos/${photoPath}`;
  };

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email?.split("@")[0] || "Employee";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">My Profile</h1>
          <p className="text-slate-600">View and update your profile information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21h-4.5A2.25 2.25 0 019 18.75V14.5" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          <p className="text-green-700">Profile updated successfully!</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <XCircleIcon className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {/* Photo Section - Large and prominent */}
          <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <PhotoUploadEnhanced
                  key={photoUpdateKey}
                  currentPhoto={user?.photo}
                  onPhotoChange={setPhoto}
                  size="lg"
                  shape="circle"
                />
                {isEditing && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-slate-600">
                      Click photo to change
                    </p>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">
                  {displayName}
                </h2>
                <p className="text-slate-600">{user?.email}</p>
                {user?.role && (
                  <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information Grid */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name - Read Only */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <UserCircleIcon className="w-4 h-4" />
                  Full Name
                </label>
                <div className="text-slate-800 font-medium">
                  {formData.firstName} {formData.lastName}
                </div>
                <p className="text-xs text-slate-500">Name cannot be changed</p>
              </div>

              {/* Email - Read Only */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <EnvelopeIcon className="w-4 h-4" />
                  Email
                </label>
                <div className="text-slate-800 font-medium">{formData.email}</div>
                <p className="text-xs text-slate-500">Email cannot be changed</p>
              </div>

              {/* Job Title - Editable */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <BriefcaseIcon className="w-4 h-4" />
                  Job Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Engineer"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
                  />
                ) : (
                  <div className="text-slate-800 font-medium">
                    {formData.jobTitle || "—"}
                  </div>
                )}
              </div>

              {/* Position - Editable */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <BriefcaseIcon className="w-4 h-4" />
                  Position
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
                  />
                ) : (
                  <div className="text-slate-800 font-medium">
                    {formData.position || "—"}
                  </div>
                )}
              </div>

              {/* Phone - Editable */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <PhoneIcon className="w-4 h-4" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+971 XX XXX XXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
                  />
                ) : (
                  <div className="text-slate-800 font-medium">
                    {formData.phone || "—"}
                  </div>
                )}
              </div>

              {/* Department - Read Only */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  Department
                </label>
                <div className="text-slate-800 font-medium">
                  {formData.department || "—"}
                </div>
                <p className="text-xs text-slate-500">Contact HR to change</p>
              </div>

              {/* Employee ID - Read Only */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <IdentificationIcon className="w-4 h-4" />
                  Employee ID
                </label>
                <div className="text-slate-800 font-medium">
                  {formData.employeeId || "—"}
                </div>
                <p className="text-xs text-slate-500">Assigned by HR</p>
              </div>
            </div>

            {/* Emirates ID Section */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                Emirates ID Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <IdentificationIcon className="w-4 h-4" />
                    Emirates ID Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nationalIdNumber"
                      value={formData.nationalIdNumber}
                      onChange={handleInputChange}
                      placeholder="784-XXXX-XXXXXXX-X"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
                    />
                  ) : (
                    <div className="text-slate-800 font-medium">
                      {formData.nationalIdNumber || "—"}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <CalendarIcon className="w-4 h-4" />
                    Emirates ID Expiry Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="nationalIdExpiryDate"
                      value={formData.nationalIdExpiryDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
                    />
                  ) : (
                    <div className="text-slate-800 font-medium">
                      {formData.nationalIdExpiryDate
                        ? new Date(formData.nationalIdExpiryDate).toLocaleDateString()
                        : "—"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  setSuccess(false);
                  // Reset form data
                  if (user) {
                    setFormData({
                      firstName: user.firstName || "",
                      lastName: user.lastName || "",
                      email: user.email || "",
                      jobTitle: user.jobTitle || "",
                      position: user.position || "",
                      phone: user.phone || "",
                      department: user.department || "",
                      employeeId: user.employeeId || "",
                      nationalIdNumber: user.nationalIdNumber || "",
                      nationalIdExpiryDate: user.nationalIdExpiryDate
                        ? new Date(user.nationalIdExpiryDate).toISOString().split("T")[0]
                        : "",
                    });
                  }
                  setPhoto(null);
                }}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
