import { useState, useEffect } from 'react';

const PhotoUpload = ({ currentPhoto, onPhotoChange, size = 'md' }) => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Helper function to get photo URL (similar to Navbar/Sidebar)
  const getPhotoUrl = (photo) => {
    if (!photo) {
      return null;
    }
    // If it's already a full URL or data URL, return as is
    if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:')) {
      return photo;
    }
    // Get backend URL from environment or use default
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    // Extract base URL (remove /api suffix if present)
    let BACKEND_URL = API_BASE_URL;
    if (BACKEND_URL.endsWith('/api')) {
      BACKEND_URL = BACKEND_URL.slice(0, -4); // Remove '/api'
    } else if (BACKEND_URL.endsWith('/api/')) {
      BACKEND_URL = BACKEND_URL.slice(0, -5); // Remove '/api/'
    }
    
    // If it's a relative path, construct full URL
    if (photo.startsWith('/uploads/')) {
      return `${BACKEND_URL}${photo}`;
    }
    // If it's just a filename, construct full URL
    return `${BACKEND_URL}/uploads/photos/${photo}`;
  };

  useEffect(() => {
    setImageError(false); // Reset error state when photo changes
    if (currentPhoto) {
      // If currentPhoto is a File object (from file input), use FileReader
      if (currentPhoto instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(currentPhoto);
      } else {
        // Otherwise, construct URL from filename or use as-is if already a URL
        setPreview(getPhotoUrl(currentPhoto));
      }
    } else {
      setPreview(null);
    }
  }, [currentPhoto]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      
      // Notify parent component
      if (onPhotoChange) {
        onPhotoChange(selectedFile);
      }
    }
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  return (
    <div className="photo-upload">
      <div className={`photo-preview ${sizeClasses[size]} mx-auto mb-4`}>
        {preview && !imageError ? (
          <img 
            src={preview} 
            alt="Profile preview" 
            className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-300`}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              console.error('[PhotoUpload] Failed to load image:', preview);
              setImageError(true);
            }}
            onLoad={() => {
              // Reset error state on successful load
              setImageError(false);
            }}
          />
        ) : (
          <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300`}>
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
      <label className="block">
        <span className="sr-only">Choose profile photo</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </label>
      {file && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </p>
      )}
    </div>
  );
};

export default PhotoUpload;

