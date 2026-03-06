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
      
      // Log photo details before appending
      console.log('📸 Preparing FormData for profile update:', {
        hasPhoto: !!photo,
        photoType: photo?.constructor?.name,
        photoName: photo?.name,
        photoSize: photo?.size,
        jobTitle: jobTitle
      });
      
      if (photo) {
        if (photo instanceof File) {
          formData.append('photo', photo);
          console.log('✅ Photo file appended to FormData:', photo.name, `(${photo.size} bytes)`);
        } else {
          console.error('❌ Photo is not a File object:', typeof photo, photo);
          throw new Error('Invalid photo file. Please select a valid image file.');
        }
      } else {
        console.log('ℹ️  No photo file selected for upload');
      }
      
      if (jobTitle !== undefined && jobTitle !== null && jobTitle !== '') {
        formData.append('jobTitle', jobTitle);
        console.log('✅ Job title appended:', jobTitle);
      }

      // Log FormData contents (for debugging)
      console.log('📦 FormData contents:');
      for (let pair of formData.entries()) {
        console.log(`   ${pair[0]}:`, pair[1] instanceof File ? `${pair[1].name} (${pair[1].size} bytes, ${pair[1].type})` : pair[1]);
      }

      const response = await updateProfile(formData);
      
      console.log('Profile update response:', response);
      
      if (response && response.success) {
        setSuccess(true);
        console.log('✅ Profile update successful!');
        console.log('📸 Response data:', JSON.stringify(response.data, null, 2));
        
        // Check if photo is in response
        if (response.data && response.data.photo) {
          console.log('✅ New photo URL received:', response.data.photo);
          console.log('   Old photo was:', user?.photo);
          console.log('   Photo changed:', user?.photo !== response.data.photo);
          
          // Update user data immediately with the new photo URL
          if (updateUserData) {
            console.log('📝 Updating user data in context with new photo...');
            updateUserData({
              ...response.data,
              photo: response.data.photo // Ensure photo URL is included
            });
            
            // Force PhotoUploadEnhanced to re-render with new photo
            setPhotoUpdateKey(prev => prev + 1);
            console.log('✅ Photo component will re-render with new photo');
          } else {
            console.error('❌ updateUserData function not available in AuthContext!');
          }
        } else {
          console.warn('⚠️ WARNING: Response does not include photo URL!');
          console.warn('   Response structure:', Object.keys(response.data || {}));
          if (photo) {
            console.warn('   ⚠️ Photo was uploaded but not returned in response!');
            console.warn('   This indicates a backend issue - check backend logs.');
          }
        }
        
        // Clear photo file after successful upload
        setPhoto(null);
        
        // Refresh user data from server to ensure consistency
        if (refreshUser) {
          setTimeout(async () => {
            console.log('🔄 Refreshing user data from server...');
            try {
              await refreshUser();
              console.log('✅ User data refreshed');
            } catch (refreshError) {
              console.error('❌ Error refreshing user:', refreshError);
            }
          }, 500); // Reduced delay - 500ms should be enough
        }
        
        if (onUpdate) {
          onUpdate(response.data);
        }
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

