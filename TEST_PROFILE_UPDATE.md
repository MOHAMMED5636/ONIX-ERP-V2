# Test Profile Photo Update

## Backend is Running ✅

Your backend is running on `http://192.168.1.54:3001`

## Test the Profile Update Endpoint

### Option 1: Test with Browser Console

Open browser console on your frontend and run:

```javascript
// Test if endpoint exists
fetch('http://192.168.1.54:3001/api/auth/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  }
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### Option 2: Test with Postman

1. **Method:** `PUT`
2. **URL:** `http://192.168.1.54:3001/api/auth/profile`
3. **Headers:**
   - `Authorization: Bearer YOUR_TOKEN`
4. **Body:** `form-data`
   - Key: `photo`, Type: `File`, Value: select image file
   - Key: `jobTitle`, Type: `Text`, Value: `senior engineer`
5. **Send Request**
6. **Check Response:**
   - Should have `success: true`
   - Should have `data.photo` field with path like `/uploads/photos/photo-xxx.jpg`

### Option 3: Check Backend Route

Verify your backend has this route:

```javascript
// Should be in your backend routes file
router.put('/auth/profile', authenticate, upload.single('photo'), async (req, res) => {
  // ... handler code
});
```

## Expected Backend Response

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "...",
    "email": "...",
    "photo": "/uploads/photos/photo-1234567890.jpg",  // ← MUST BE PRESENT
    "jobTitle": "senior engineer",
    "firstName": "...",
    "lastName": "..."
  }
}
```

## Common Issues

### Issue 1: 404 Not Found
**Meaning:** Route doesn't exist
**Fix:** Add route to backend

### Issue 2: 401 Unauthorized
**Meaning:** Token invalid or missing
**Fix:** Check authentication middleware

### Issue 3: 500 Server Error
**Meaning:** Backend error
**Fix:** Check backend logs

### Issue 4: Response Missing Photo
**Meaning:** Backend not returning photo field
**Fix:** Ensure backend returns `data.photo` in response

## Next Steps

1. Test the endpoint with Postman/curl
2. Check backend logs when uploading
3. Verify response includes `data.photo`
4. Check if file is saved to `/uploads/photos/`
5. Verify database is updated with photo path

