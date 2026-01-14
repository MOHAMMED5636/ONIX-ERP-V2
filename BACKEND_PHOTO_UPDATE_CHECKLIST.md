# Backend Photo Update Checklist

## Critical: Backend Must Return Photo Path

The frontend expects the backend to return the updated photo path in the response. If it doesn't, the photo won't update.

## Expected Backend Response Format

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "photo": "/uploads/photos/photo-1234567890.jpg",  // ← THIS IS REQUIRED!
    "jobTitle": "senior engineer",
    "firstName": "...",
    "lastName": "...",
    ...
  }
}
```

## Backend Implementation Checklist

### 1. Route Handler
```javascript
router.put('/profile', authenticate, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = {};
    
    // Handle photo upload
    if (req.file) {
      // Delete old photo if exists
      const user = await User.findById(userId);
      if (user && user.photo) {
        const oldPhotoPath = path.join('./uploads/photos', path.basename(user.photo));
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      
      // Save new photo path (relative path starting with /uploads/)
      updateData.photo = `/uploads/photos/${req.file.filename}`;
    }
    
    // Handle job title
    if (req.body.jobTitle !== undefined) {
      updateData.jobTitle = req.body.jobTitle;
    }
    
    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, select: '-password' }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // CRITICAL: Return updated user data with photo path
    res.json({
      success: true,
      data: updatedUser,  // Must include photo field
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
});
```

### 2. Common Backend Issues

#### Issue 1: Photo Not in Response
**Symptom:** Frontend shows "Warning: Response does not include photo path"

**Cause:** Backend not including photo in response data

**Fix:** Ensure `updatedUser` includes the `photo` field when returned

#### Issue 2: Photo Path Format Wrong
**Symptom:** Photo path exists but image doesn't load

**Fix:** Return relative path like `/uploads/photos/filename.jpg` (not absolute path)

#### Issue 3: Database Not Updated
**Symptom:** File saved but photo doesn't update

**Fix:** Verify database update query includes photo field

### 3. Testing Backend

#### Test with Postman:
1. Method: `PUT`
2. URL: `http://192.168.1.54:3001/api/auth/profile`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Body: `form-data`
   - Key: `photo`, Type: `File`, Value: select image
   - Key: `jobTitle`, Type: `Text`, Value: "senior engineer"
5. Send
6. **Check Response:**
   - Must have `success: true`
   - Must have `data.photo` field
   - Photo path should be like `/uploads/photos/photo-xxx.jpg`

#### Test with curl:
```bash
curl -X PUT http://192.168.1.54:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/image.jpg" \
  -F "jobTitle=senior engineer"
```

### 4. Debugging Steps

1. **Check Backend Logs:**
   ```javascript
   console.log('File received:', req.file);
   console.log('Photo path set:', updateData.photo);
   console.log('User before update:', user.photo);
   console.log('User after update:', updatedUser.photo);
   console.log('Response data:', JSON.stringify(updatedUser, null, 2));
   ```

2. **Verify File is Saved:**
   - Check `/uploads/photos/` directory
   - Verify file exists with correct name
   - Check file permissions

3. **Verify Database:**
   ```javascript
   const user = await User.findById(userId);
   console.log('Photo in database:', user.photo);
   ```

4. **Verify Response:**
   - Check response includes `data.photo`
   - Verify photo path format is correct
   - Test photo URL in browser

## Frontend Debugging

Open browser console and check:

1. **"Profile update response:"** - Should show full response
2. **"✅ New photo path received:"** - Should show the photo path
3. **"⚠️ WARNING: Response does not include photo path"** - Means backend issue

If you see the warning, the backend is NOT returning the photo path correctly.

## Quick Fix

If backend is working but photo still doesn't update:

1. Check browser console for the response
2. Verify `response.data.photo` exists
3. Check if photo URL is correct format
4. Try hard refresh (Ctrl+F5) to clear cache
5. Check Network tab to see if photo file is accessible

