import { useState, useEffect, useRef, useCallback } from 'react';

const OUTPUT_SIZE = 400;
// Keep zoom in the 0.00–1.00 range (cap at 1.00x).
// Note: true 0 would collapse image dimensions, so we use a tiny minimum.
const ZOOM_MIN = 0.01;
const ZOOM_MAX = 1;
const VIEWPORT_RADIUS_RATIO = 0.45; // fraction of min(container W, H)

const PhotoUploadEnhanced = ({ currentPhoto, onPhotoChange, size = 'md', shape = 'circle' }) => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const dragRef = useRef({ startX: 0, startY: 0, panX: 0, panY: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [photoKey, setPhotoKey] = useState(0);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

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

  /** Image layout: cover-scale * zoom, centered + pan, clamped so viewport stays on image */
  const computeLayout = useCallback(() => {
    const container = containerRef.current;
    const nw = natural.w;
    const nh = natural.h;
    if (!container || !nw || !nh) {
      return {
        W: 0,
        H: 0,
        cx: 0,
        cy: 0,
        R: 0,
        iw: 0,
        ih: 0,
        px: 0,
        py: 0,
        coverScale: 1,
      };
    }
    const W = container.clientWidth;
    const H = container.clientHeight;
    const cx = W / 2;
    const cy = H / 2;
    const R =
      shape === 'circle'
        ? Math.min(W, H) * VIEWPORT_RADIUS_RATIO
        : Math.min(W, H) * 0.4;
    const coverScale = Math.max(W / nw, H / nh);
    const s = coverScale * zoom;
    const iw = nw * s;
    const ih = nh * s;
    let px = (W - iw) / 2 + pan.x;
    let py = (H - ih) / 2 + pan.y;

    const pxMin = cx + R - iw;
    const pxMax = cx - R;
    if (pxMin <= pxMax) {
      px = Math.max(pxMin, Math.min(pxMax, px));
    } else {
      px = (W - iw) / 2;
    }
    const pyMin = cy + R - ih;
    const pyMax = cy - R;
    if (pyMin <= pyMax) {
      py = Math.max(pyMin, Math.min(pyMax, py));
    } else {
      py = (H - ih) / 2;
    }

    return { W, H, cx, cy, R, iw, ih, px, py, coverScale };
  }, [natural.w, natural.h, zoom, pan.x, pan.y, shape]);

  const resetAdjustState = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setNatural({ w: 0, h: 0 });
  };

  useEffect(() => {
    setImageError(false);
    if (currentPhoto) {
      if (currentPhoto instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.onerror = () => setImageError(true);
        reader.readAsDataURL(currentPhoto);
      } else if (typeof currentPhoto === 'string') {
        const photoUrl = getPhotoUrl(currentPhoto);
        if (photoUrl) {
          const separator = photoUrl.includes('?') ? '&' : '?';
          const timestamp = Date.now();
          const cacheBustedUrl = `${photoUrl}${separator}t=${timestamp}`;
          setPhotoKey(timestamp);
          setPreview(null);
          setTimeout(() => setPreview(cacheBustedUrl), 50);
        } else {
          setPreview(null);
        }
      } else {
        setPreview(null);
      }
    } else {
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
      if (onPhotoChange) {
        onPhotoChange(selectedFile);
      }
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      const reader = new FileReader();
      reader.onloadend = () => {
        resetAdjustState();
        setCropImage(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(selectedFile);
    }
    e.target.value = '';
  };

  const onCropImageLoad = (e) => {
    const img = e.currentTarget;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
  };

  const handleWheelNative = useCallback((e) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.08 : 1 / 1.08;
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z * factor)));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !showCropModal) return;
    el.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => el.removeEventListener('wheel', handleWheelNative);
  }, [showCropModal, handleWheelNative]);

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, z * 1.15));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, z / 1.15));

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan({
      x: dragRef.current.panX + dx,
      y: dragRef.current.panY + dy,
    });
  };

  const handlePointerUp = (e) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    draggingRef.current = false;
  };

  const cropAndResizeImage = () => {
    if (!cropImage || !canvasRef.current || !natural.w || !containerRef.current) {
      alert('Image is still loading. Please wait a moment.');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const layout = computeLayout();
        const { W, H, cx, cy, R, iw, ih, px, py } = layout;
        if (!W || !H) {
          alert('Could not read editor size.');
          return;
        }

        const off = document.createElement('canvas');
        off.width = W;
        off.height = H;
        const octx = off.getContext('2d');
        octx.drawImage(img, 0, 0, natural.w, natural.h, px, py, iw, ih);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;
        ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

        const side = R * 2;
        const sx = cx - R;
        const sy = cy - R;

        if (shape === 'circle') {
          ctx.beginPath();
          ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
          ctx.clip();
        }

        ctx.drawImage(off, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              alert('Failed to process image. Please try again.');
              return;
            }
            const croppedFile = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
            setFile(croppedFile);
            const previewUrl = URL.createObjectURL(blob);
            setPreview(previewUrl);
            setShowCropModal(false);
            setCropImage(null);
            resetAdjustState();
            if (onPhotoChange) {
              onPhotoChange(croppedFile);
            }
          },
          'image/jpeg',
          0.92
        );
      } catch (err) {
        console.error(err);
        alert('Error processing image. Please try again.');
      }
    };

    img.onerror = () => alert('Failed to load image. Please try again.');
    img.src = cropImage;
  };

  const cancelCrop = () => {
    setShowCropModal(false);
    setCropImage(null);
    resetAdjustState();
  };

  const layout = showCropModal && natural.w ? computeLayout() : null;

  return (
    <div className="photo-upload">
      <div className={`photo-preview ${sizeClasses[size]} mx-auto mb-4`}>
        {preview && !imageError ? (
          <img
            key={photoKey}
            src={preview}
            alt="Profile preview"
            className={`${sizeClasses[size]} ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} object-cover border-2 border-gray-300`}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <div
            className={`${sizeClasses[size]} ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} bg-gray-200 flex items-center justify-center border-2 border-gray-300`}
          >
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
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

      {showCropModal && cropImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
            <h3 className="text-lg font-semibold mb-1">Adjust Image</h3>
            <p className="text-sm text-gray-600 mb-3">
              <strong>Drag</strong> the photo to reposition. <strong>Scroll</strong> or use <strong>+ / −</strong> to zoom.
              Align your face inside the {shape === 'circle' ? 'circle' : 'frame'}.
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                type="button"
                onClick={zoomOut}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm"
                aria-label="Zoom out"
              >
                −
              </button>
              <button
                type="button"
                onClick={zoomIn}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm"
                aria-label="Zoom in"
              >
                +
              </button>
              <span className="text-xs text-gray-500 ml-1">
                Zoom: {zoom < 1 ? zoom.toFixed(2) : zoom.toFixed(2)}×
              </span>
            </div>

            <div
              ref={containerRef}
              className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden mb-4 select-none touch-none cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <img
                ref={imageRef}
                src={cropImage}
                alt="Adjust crop"
                className="absolute pointer-events-none"
                draggable={false}
                onLoad={onCropImageLoad}
                style={
                  layout
                    ? {
                        left: `${layout.px}px`,
                        top: `${layout.py}px`,
                        width: `${layout.iw}px`,
                        height: `${layout.ih}px`,
                      }
                    : { visibility: 'hidden' }
                }
              />

              {layout && (
                <>
                  <div
                    className="absolute pointer-events-none z-10 border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
                    style={{
                      left: `${layout.cx - layout.R}px`,
                      top: `${layout.cy - layout.R}px`,
                      width: `${layout.R * 2}px`,
                      height: `${layout.R * 2}px`,
                      borderRadius: shape === 'circle' ? '50%' : '12px',
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                    }}
                  />
                </>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={cancelCrop}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={cropAndResizeImage}
                disabled={!natural.w}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
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
