# Profile Photo Update Troubleshooting Guide

## Current Issues from Console

1. **`TypeError: Failed to fetch`** - Request not reaching backend
2. **`Warning: Response does not include photo path`** - Backend not returning photo
3. **`GET /api/documents 404`** - Documents endpoint not implemented

## Frontend Fixes Applied

✅ Improved error handling in `authAPI.js`
✅ Better error messages for network failures
✅ Graceful handling of missing documents endpoint
✅ Enhanced logging for debugging

## Backend Requirements

### 1. Endpoint: `PUT /api/auth/profile`

**Must:**
- Accept `multipart/form-data`
- Receive `photo` field (File)
- Receive `jobTitle` field (String, optional)
- Save file to `/uploads/photos/` directory
- Update user record in database
- Return JSON response with updated user data

**Expected Request:**
```
PUT /api/auth/profile
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data (auto-set by browser)
Body (FormData):
  photo: <File object>
  jobTitle: "senior engineer" (optional)
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "photo": "/uploads/photos/photo-1234567890.jpg",  // ← CRITICAL: Must include this!
    "jobTitle": "senior engineer",
    "firstName": "...",
    "lastName": "...",
    ...
  },
  "message": "Profile updated successfully"
}
```

### 2. Backend Implementation Checklist

#### File Upload Middleware (Multer)
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = './uploads/photos';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});
```

#### Route Handler
```javascript
router.put('/profile', authenticate, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = {};
    
    // Handle photo upload
    if (req.file) {
      // Delete old photo if exists
      const user = await User.findById(userId);
      if (user.photo) {
        const oldPhotoPath = path.join('./uploads/photos', path.basename(user.photo));
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      
      // Save new photo path (relative path)
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
      { new: true, select: '-password' } // Don't return password
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return updated user data
    res.json({
      success: true,
      data: updatedUser,
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

### 3. Common Backend Issues

#### Issue 1: "Failed to fetch"
**Causes:**
- Backend server not running
- Wrong port/URL
- CORS not configured
- Network firewall blocking

**Solutions:**
- Verify backend is running on `http://192.168.1.54:3001`
- Check CORS configuration allows frontend origin
- Test endpoint with Postman/curl

#### Issue 2: "Response does not include photo path"
**Causes:**
- Backend not saving file
- Backend not updating database
- Backend not returning photo in response

**Solutions:**
- Check file is saved to disk
- Verify database update query
- Ensure response includes `data.photo` field

#### Issue 3: "404 Not Found"
**Causes:**
- Route not registered
- Wrong route path
- Middleware blocking request

**Solutions:**
- Verify route is registered: `router.put('/profile', ...)`
- Check route prefix: `/api/auth/profile`
- Verify authentication middleware

### 4. Testing Backend

#### Test with curl:
```bash
curl -X PUT http://192.168.1.54:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/image.jpg" \
  -F "jobTitle=senior engineer"
```

#### Test with Postman:
1. Method: PUT
2. URL: `http://192.168.1.54:3001/api/auth/profile`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Body: form-data
   - Key: `photo`, Type: File, Value: select image
   - Key: `jobTitle`, Type: Text, Value: "senior engineer"
5. Send request
6. Check response includes `data.photo`

### 5. Debugging Steps

1. **Check Backend Logs:**
   ```javascript
   console.log('Request received:', req.body, req.file);
   console.log('User ID:', req.user.id);
   console.log('File saved:', req.file?.filename);
   console.log('User updated:', updatedUser);
   ```

2. **Check File System:**
   - Verify file exists in `/uploads/photos/`
   - Check file permissions
   - Verify file size is correct

3. **Check Database:**
   ```javascript
   const user = await User.findById(userId);
   console.log('User photo in DB:', user.photo);
   ```

4. **Check Response:**
   ```javascript
   console.log('Sending response:', JSON.stringify({
     success: true,
     data: updatedUser
   }, null, 2));
   ```

## Frontend Debugging

1. **Open Browser Console**
2. **Check Network Tab:**
   - Find `PUT /api/auth/profile` request
   - Check Request Headers
   - Check Request Payload (FormData)
   - Check Response Status
   - Check Response Body

3. **Check Console Logs:**
   - "Uploading profile with FormData:" - Shows what's being sent
   - "Profile update response:" - Shows what's received
   - "New photo path received:" - Confirms photo is in response

## Next Steps

1. ✅ Frontend is ready and fixed
2. ⚠️ Backend needs implementation/verification:
   - Implement `PUT /api/auth/profile` endpoint
   - Ensure it accepts multipart/form-data
   - Ensure it saves file and updates database
   - Ensure it returns photo path in response
3. ⚠️ Test the complete flow
4. ⚠️ Verify photo displays after update

