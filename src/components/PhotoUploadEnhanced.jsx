import { useState, useEffect, useRef } from 'react';

const PhotoUploadEnhanced = ({ currentPhoto, onPhotoChange, size = 'md', shape = 'circle' }) => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [photoKey, setPhotoKey] = useState(0); // Force re-render when photo changes
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  // Helper function to get photo URL
  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:')) {
      return photo;
    }
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    let BACKEND_URL = API_BASE_URL;
    if (BACKEND_URL.endsWith('/api')) {
      BACKEND_URL = BACKEND_URL.slice(0, -4);
    } else if (BACKEND_URL.endsWith('/api/')) {
      BACKEND_URL = BACKEND_URL.slice(0, -5);
    }
    if (photo.startsWith('/uploads/')) {
      return `${BACKEND_URL}${photo}`;
    }
    return `${BACKEND_URL}/uploads/photos/${photo}`;
  };

  useEffect(() => {
    console.log('[PhotoUploadEnhanced] currentPhoto changed:', currentPhoto);
    setImageError(false);
    
    // Reset preview first to force reload
    setPreview(null);
    
    if (currentPhoto) {
      if (currentPhoto instanceof File) {
        // If it's a File object, show it directly
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(currentPhoto);
      } else {
        // If it's a string (URL/path), get the URL with cache busting
        const photoUrl = getPhotoUrl(currentPhoto);
        if (photoUrl) {
          // Add cache-busting timestamp to photo URL - use a new timestamp each time
          const separator = photoUrl.includes('?') ? '&' : '?';
          const timestamp = Date.now();
          const cacheBustedUrl = `${photoUrl}${separator}t=${timestamp}`;
          console.log('[PhotoUploadEnhanced] Setting preview URL:', cacheBustedUrl);
          console.log('[PhotoUploadEnhanced] Photo key updated to force re-render');
          
          // Force component to re-render by updating key
          setPhotoKey(timestamp);
          setPreview(cacheBustedUrl);
        } else {
          console.log('[PhotoUploadEnhanced] No photo URL generated from:', currentPhoto);
          setPreview(null);
        }
      }
    } else {
      console.log('[PhotoUploadEnhanced] No currentPhoto provided');
      setPreview(null);
    }
  }, [currentPhoto]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Load image for cropping
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImage(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const initializeCropArea = () => {
    if (imageRef.current && containerRef.current) {
      const img = imageRef.current;
      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = containerWidth / containerHeight;
      
      let displayWidth, displayHeight, offsetX = 0, offsetY = 0;
      
      if (imgAspect > containerAspect) {
        displayHeight = containerHeight;
        displayWidth = displayHeight * imgAspect;
        offsetX = (containerWidth - displayWidth) / 2;
      } else {
        displayWidth = containerWidth;
        displayHeight = displayWidth / imgAspect;
        offsetY = (containerHeight - displayHeight) / 2;
      }
      
      const cropSize = Math.min(displayWidth, displayHeight) * 0.8;
      const cropX = offsetX + (displayWidth - cropSize) / 2;
      const cropY = offsetY + (displayHeight - cropSize) / 2;
      
      setCropArea({
        x: cropX,
        y: cropY,
        width: cropSize,
        height: cropSize,
      });
    }
  };

  useEffect(() => {
    if (showCropModal && imageRef.current) {
      imageRef.current.onload = initializeCropArea;
      if (imageRef.current.complete) {
        initializeCropArea();
      }
    }
  }, [showCropModal, cropImage]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropArea.x,
      y: e.clientY - cropArea.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragStart.x;
    const newY = e.clientY - rect.top - dragStart.y;
    
    const maxX = container.offsetWidth - cropArea.width;
    const maxY = container.offsetHeight - cropArea.height;
    
    setCropArea({
      ...cropArea,
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResize = (direction, e) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    let newCropArea = { ...cropArea };
    
    if (direction.includes('right')) {
      newCropArea.width = Math.max(100, mouseX - cropArea.x);
    }
    if (direction.includes('bottom')) {
      newCropArea.height = Math.max(100, mouseY - cropArea.y);
    }
    if (direction.includes('left')) {
      const diff = cropArea.x - mouseX;
      newCropArea.x = Math.max(0, mouseX);
      newCropArea.width = cropArea.width + diff;
    }
    if (direction.includes('top')) {
      const diff = cropArea.y - mouseY;
      newCropArea.y = Math.max(0, mouseY);
      newCropArea.height = cropArea.height + diff;
    }
    
    // Maintain square aspect ratio for circle shape
    if (shape === 'circle') {
      const size = Math.min(newCropArea.width, newCropArea.height);
      newCropArea.width = size;
      newCropArea.height = size;
    }
    
    setCropArea(newCropArea);
  };

  const cropAndResizeImage = () => {
    if (!cropImage || !canvasRef.current || !imageRef.current || !containerRef.current) {
      console.error('Missing required refs for cropping');
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = containerRef.current;
        const displayedImg = imageRef.current;
        
        // Get actual displayed image dimensions (considering object-contain)
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const containerAspect = containerWidth / containerHeight;
        
        let displayedWidth, displayedHeight, offsetX = 0, offsetY = 0;
        
        if (imgAspect > containerAspect) {
          // Image is wider - fit to height
          displayedHeight = containerHeight;
          displayedWidth = displayedHeight * imgAspect;
          offsetX = (containerWidth - displayedWidth) / 2;
        } else {
          // Image is taller - fit to width
          displayedWidth = containerWidth;
          displayedHeight = displayedWidth / imgAspect;
          offsetY = (containerHeight - displayedHeight) / 2;
        }
        
        // Calculate scale factors based on actual displayed size
        const scaleX = img.naturalWidth / displayedWidth;
        const scaleY = img.naturalHeight / displayedHeight;
        
        // Adjust crop coordinates to account for image offset
        const adjustedCropX = cropArea.x - offsetX;
        const adjustedCropY = cropArea.y - offsetY;
        
        // Calculate crop coordinates in original image
        const sourceX = Math.max(0, adjustedCropX * scaleX);
        const sourceY = Math.max(0, adjustedCropY * scaleY);
        const sourceWidth = Math.min(cropArea.width * scaleX, img.naturalWidth - sourceX);
        const sourceHeight = Math.min(cropArea.height * scaleY, img.naturalHeight - sourceY);
        
        // Set canvas size (output size)
        const outputSize = 400;
        canvas.width = outputSize;
        canvas.height = outputSize;
        
        // Clear canvas
        ctx.clearRect(0, 0, outputSize, outputSize);
        
        // Draw cropped and resized image
        if (shape === 'circle') {
          ctx.beginPath();
          ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, 2 * Math.PI);
          ctx.clip();
        }
        
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          outputSize,
          outputSize
        );
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('Failed to create blob from canvas');
            alert('Failed to process image. Please try again.');
            return;
          }
          
          const croppedFile = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
          setFile(croppedFile);
          const previewUrl = URL.createObjectURL(blob);
          setPreview(previewUrl);
          setShowCropModal(false);
          setCropImage(null);
          
          if (onPhotoChange) {
            onPhotoChange(croppedFile);
          }
        }, 'image/jpeg', 0.92);
      } catch (error) {
        console.error('Error during image cropping:', error);
        alert('Error processing image. Please try again.');
      }
    };
    
    img.onerror = () => {
      console.error('Failed to load image for cropping');
      alert('Failed to load image. Please try again.');
    };
    
    img.src = cropImage;
  };

  const cancelCrop = () => {
    setShowCropModal(false);
    setCropImage(null);
  };

  return (
    <div className="photo-upload">
      <div className={`photo-preview ${sizeClasses[size]} mx-auto mb-4`}>
        {preview && !imageError ? (
          <img
            key={photoKey} // Force re-render when photo changes
            src={preview}
            alt="Profile preview"
            className={`${sizeClasses[size]} ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} object-cover border-2 border-gray-300`}
            onError={(e) => {
              console.error('[PhotoUploadEnhanced] Failed to load image:', preview);
              setImageError(true);
            }}
            onLoad={() => {
              console.log('[PhotoUploadEnhanced] Image loaded successfully:', preview);
              setImageError(false);
            }}
          />
        ) : (
          <div className={`${sizeClasses[size]} ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} bg-gray-200 flex items-center justify-center border-2 border-gray-300`}>
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

      {/* Crop Modal */}
      {showCropModal && cropImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold mb-4">Adjust Image</h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag the image to adjust position. Resize using the corners.
            </p>
            
            <div
              ref={containerRef}
              className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden mb-4"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={cropImage}
                alt="Crop"
                className="absolute inset-0 w-full h-full object-contain"
                draggable={false}
              />
              
              {/* Crop Overlay */}
              <div
                className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 cursor-move"
                style={{
                  left: `${cropArea.x}px`,
                  top: `${cropArea.y}px`,
                  width: `${cropArea.width}px`,
                  height: `${cropArea.height}px`,
                  borderRadius: shape === 'circle' ? '50%' : '0',
                }}
                onMouseDown={handleMouseDown}
              >
                {/* Resize Handles */}
                {shape === 'square' && (
                  <>
                    <div
                      className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize"
                      onMouseDown={(e) => handleResize('top-left', e)}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize"
                      onMouseDown={(e) => handleResize('top-right', e)}
                    />
                    <div
                      className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize"
                      onMouseDown={(e) => handleResize('bottom-left', e)}
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize"
                      onMouseDown={(e) => handleResize('bottom-right', e)}
                    />
                  </>
                )}
              </div>
              
              {/* Dark Overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={
                  shape === 'circle'
                    ? {
                        background: `radial-gradient(circle at ${cropArea.x + cropArea.width / 2}px ${cropArea.y + cropArea.height / 2}px, transparent ${cropArea.width / 2}px, rgba(0,0,0,0.5) ${cropArea.width / 2 + 20}px)`,
                      }
                    : {
                        background: `linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.5) ${cropArea.y}px, transparent ${cropArea.y}px, transparent ${cropArea.y + cropArea.height}px, rgba(0,0,0,0.5) ${cropArea.y + cropArea.height}px, rgba(0,0,0,0.5) 100%),
                                    linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.5) ${cropArea.x}px, transparent ${cropArea.x}px, transparent ${cropArea.x + cropArea.width}px, rgba(0,0,0,0.5) ${cropArea.x + cropArea.width}px, rgba(0,0,0,0.5) 100%)`,
                      }
                }
              />
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex gap-3">
              <button
                onClick={cancelCrop}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={cropAndResizeImage}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadEnhanced;

