import { useState, useEffect } from 'react';
import { updateProfile } from '../services/authAPI';
import PhotoUpload from './PhotoUpload';
import { useAuth } from '../contexts/AuthContext';

const ProfileForm = ({ onUpdate }) => {
  const { user, refreshUser } = useAuth();
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setJobTitle(user.jobTitle || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      if (photo) {
        formData.append('photo', photo);
      }
      if (jobTitle !== undefined) {
        formData.append('jobTitle', jobTitle);
      }

      const response = await updateProfile(formData);
      
      if (response.success) {
        setSuccess(true);
        // Refresh user data from context
        if (refreshUser) {
          await refreshUser();
        }
        if (onUpdate) {
          onUpdate(response.data);
        }
        // Clear photo file after successful upload
        setPhoto(null);
        
        // Force page refresh after 1 second to ensure photo displays everywhere
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Photo
        </label>
        <PhotoUpload 
          currentPhoto={user?.photo} 
          onPhotoChange={setPhoto}
          size="lg"
        />
        <p className="text-xs text-gray-500 mt-2">
          Accepted formats: JPEG, PNG, GIF, WebP (Max 5MB)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title / Designation
        </label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g., Senior Engineer, Project Manager, HR Specialist"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Your current position or job designation
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          Profile updated successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
};

export default ProfileForm;

