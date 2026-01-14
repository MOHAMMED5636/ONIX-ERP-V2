# Profile Photo Update Fix

## Issues Fixed

### 1. **Image Crop Calculation Error**
**Problem:** The crop calculation was using container dimensions instead of actual displayed image dimensions, causing incorrect cropping.

**Fix:** 
- Calculate actual displayed image size considering `object-contain` CSS property
- Account for image offsets when image doesn't fill container
- Properly scale crop coordinates from displayed size to original image size

### 2. **Error Handling**
**Problem:** No error handling for image loading or blob creation failures.

**Fix:**
- Added try-catch blocks
- Added error callbacks for image loading
- Added validation for blob creation
- User-friendly error messages

### 3. **Cache Busting**
**Problem:** Browser caching old photo URLs, preventing new photos from displaying.

**Fix:**
- Added timestamp query parameter to photo URLs
- Forces browser to fetch fresh image

### 4. **API Request Debugging**
**Problem:** No visibility into what's being sent to backend.

**Fix:**
- Added console logging in development mode
- Logs FormData contents before sending
- Logs API response for debugging

## Frontend Code Changes

### `PhotoUploadEnhanced.jsx`
- Fixed `cropAndResizeImage()` function to properly calculate crop coordinates
- Added proper error handling
- Improved image loading logic

### `ProfileForm.jsx`
- Improved error handling
- Better response validation
- Clearer success/error messages

### `authAPI.js`
- Added development mode logging
- Better error messages
- Response validation

## Backend Checks Required

### 1. **API Endpoint: `PUT /api/auth/profile`**

**Expected Request:**
- Method: `PUT`
- Headers: `Authorization: Bearer <token>`
- Content-Type: `multipart/form-data` (set automatically by browser)
- Body: FormData with:
  - `photo`: File object (optional)
  - `jobTitle`: String (optional)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "photo": "/uploads/photos/filename.jpg",
    "jobTitle": "Project Manager",
    ...
  },
  "message": "Profile updated successfully"
}
```

### 2. **File Upload Handling**

**Check:**
- [ ] Multer or similar middleware is configured
- [ ] File is saved to `/uploads/photos/` directory
- [ ] File name is unique (timestamp or UUID)
- [ ] File size validation (max 5MB)
- [ ] File type validation (images only)
- [ ] Old photo file is deleted when replaced
- [ ] Photo path is saved to database user record

### 3. **Database Update**

**Check:**
- [ ] User record is updated with new photo path
- [ ] Photo field is updated in database
- [ ] Transaction is committed properly

### 4. **Response Format**

**Check:**
- [ ] Response includes updated user data
- [ ] Photo path is relative (e.g., `/uploads/photos/photo.jpg`) or full URL
- [ ] Response has `success: true` on success

## Testing Steps

1. **Upload New Photo:**
   - Select image file
   - Crop image in modal
   - Click "Apply"
   - Click "Update Profile"
   - Check browser console for logs
   - Verify photo appears after page refresh

2. **Check Network Tab:**
   - Open browser DevTools → Network
   - Upload photo
   - Check `PUT /api/auth/profile` request
   - Verify FormData contains `photo` field
   - Check response status (should be 200)
   - Verify response contains updated photo path

3. **Check Backend Logs:**
   - Verify file is saved to disk
   - Verify database is updated
   - Check for any errors

## Common Backend Issues

### Issue 1: File Not Being Received
**Symptom:** Request sent but no file in backend
**Solution:** 
- Check multer configuration
- Verify field name is `photo` (not `file` or `image`)
- Check request Content-Type header

### Issue 2: File Saved But Path Not Updated
**Symptom:** File exists but user record not updated
**Solution:**
- Check database update query
- Verify transaction commits
- Check for database errors

### Issue 3: Old Photo Not Deleted
**Symptom:** Old photos accumulating in uploads folder
**Solution:**
- Add cleanup logic to delete old photo before saving new one
- Use file system operations to remove old file

### Issue 4: CORS Issues
**Symptom:** Request fails with CORS error
**Solution:**
- Check CORS configuration allows `multipart/form-data`
- Verify credentials are included

## Debugging Commands

### Check if file is being sent:
```javascript
// In browser console before upload
console.log('FormData entries:');
for (let pair of formData.entries()) {
  console.log(pair[0] + ': ', pair[1]);
}
```

### Check backend receives file:
```javascript
// In backend route handler
console.log('Request files:', req.files);
console.log('Request body:', req.body);
console.log('File received:', req.file);
```

## Next Steps

1. Test the frontend changes
2. Check backend logs when uploading
3. Verify file is saved correctly
4. Verify database is updated
5. Check photo URL in response matches saved file

