import { useState, useEffect } from 'react';
import { updateProfile } from '../services/authAPI';
import PhotoUploadEnhanced from './PhotoUploadEnhanced';
import { useAuth } from '../contexts/AuthContext';

const ProfileForm = ({ onUpdate }) => {
  const { user, refreshUser, updateUserData } = useAuth();
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [photoUpdateKey, setPhotoUpdateKey] = useState(0); // Force photo component refresh

  useEffect(() => {
    if (user) {
      setJobTitle(user.jobTitle || '');
    }
  }, [user]);
  
  // Separate effect to watch for photo changes and force refresh
  useEffect(() => {
    if (user?.photo) {
      console.log('[ProfileForm] User photo detected:', user.photo);
      // Force PhotoUploadEnhanced to re-render with new photo
      setPhotoUpdateKey(prev => prev + 1);
    }
  }, [user?.photo]); // Only watch photo changes

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
      
      console.log('Profile update response:', response);
      
      if (response && response.success) {
        setSuccess(true);
        
        // Update user data immediately from response (before refresh)
        // This ensures the photo shows up right away without waiting for API call
        if (response.data) {
          console.log('Profile update response data:', JSON.stringify(response.data, null, 2));
          
          // Check if photo is in response
          if (response.data.photo) {
            console.log('✅ New photo path received from backend:', response.data.photo);
            console.log('✅ Old photo was:', user?.photo);
            console.log('✅ Photo path changed:', user?.photo !== response.data.photo);
          } else {
            console.warn('⚠️ WARNING: Response does not include photo path!');
            console.warn('Backend response structure:', Object.keys(response.data));
            console.warn('This means the backend is NOT returning the updated photo path.');
            console.warn('Please check backend implementation - it should return data.photo with the new photo path.');
          }
          
          if (updateUserData) {
            console.log('Calling updateUserData with:', response.data);
            updateUserData(response.data);
            console.log('User data updated in context');
            
            // Force PhotoUploadEnhanced to re-render with new photo
            if (response.data.photo) {
              setPhotoUpdateKey(prev => prev + 1);
              console.log('Photo update key incremented to force re-render');
            }
            
            // Force a re-render by updating a state that triggers useEffect
            // The PhotoUploadEnhanced component should pick up the new user.photo
            setTimeout(() => {
              console.log('Verifying user photo after update:', user?.photo);
              console.log('Expected photo:', response.data.photo);
            }, 200);
          } else {
            console.error('updateUserData function not available!');
          }
        } else {
          console.error('Response does not include data field!', response);
        }
        
        // Clear photo file after successful upload
        setPhoto(null);
        
        // Also refresh from server to ensure we have the latest data
        if (refreshUser) {
          // Wait a bit for the file to be fully saved on server
          setTimeout(async () => {
            console.log('Refreshing user data from server...');
            await refreshUser();
            console.log('User refreshed, new photo:', user?.photo);
          }, 1000);
        }
        
        if (onUpdate) {
          onUpdate(response.data);
        }
        
        // Force page refresh after 3 seconds to ensure photo displays everywhere
        setTimeout(() => {
          console.log('Reloading page to show updated photo...');
          window.location.reload();
        }, 3000);
      } else {
        const errorMsg = response?.message || 'Failed to update profile';
        console.error('Profile update failed:', errorMsg, response);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Profile update error details:', err);
      let errorMessage = err.message || 'Failed to update profile';
      
      // Provide more helpful error messages
      if (errorMessage.includes('Failed to fetch')) {
        const backendUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3001';
        errorMessage = `Cannot connect to backend server. Please ensure:\n1. Backend is running on ${backendUrl}\n2. CORS is configured\n3. Network connection is working`;
      } else if (errorMessage.includes('404')) {
        errorMessage = 'Profile update endpoint not found. Please check backend implementation.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Server error occurred. Please check backend logs.';
      }
      
      setError(errorMessage);
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
        <PhotoUploadEnhanced 
          key={photoUpdateKey} // Force re-render when photo updates
          currentPhoto={user?.photo} 
          onPhotoChange={setPhoto}
          size="lg"
          shape="circle"
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

