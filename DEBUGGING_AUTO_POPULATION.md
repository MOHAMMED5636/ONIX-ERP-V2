# 🐛 Debugging: Contract Auto-Population Not Working

## Quick Debugging Steps

### 1. Open Browser Developer Tools (F12)
- Go to **Console** tab
- Go to **Network** tab

### 2. Check Console Logs
When you enter a reference number (e.g., "1221"), you should see these logs:

```
🔍 useEffect triggered - referenceNumber: 1221
📡 Fetching contract for reference number: 1221
📡 Fetching contract from: http://localhost:3001/api/contracts/by-reference?referenceNumber=1221
🔑 Token exists: true
📥 Response status: 200 OK
📥 Contract API response: { success: true, data: {...} }
```

### 3. Check Network Tab
Look for a request to:
```
GET http://localhost:3001/api/contracts/by-reference?referenceNumber=1221
```

**If you see the request:**
- ✅ Click on it to see details
- Check **Status Code**: Should be `200` (success) or `404` (not found)
- Check **Response**: Should show the contract data or error message

**If you DON'T see the request:**
- ❌ The useEffect isn't triggering
- Check if `newTask` state is initialized
- Check if `referenceNumber` field is updating correctly

### 4. Common Issues & Solutions

#### Issue 1: No API Call in Network Tab
**Problem:** useEffect isn't triggering

**Check:**
1. Is `newTask` initialized? Check console for errors
2. Is the reference number field updating state?
3. Check if there are JavaScript errors in console

**Solution:**
- Make sure you clicked "New Project" button first
- Verify `newTask` state exists

#### Issue 2: API Call Returns 404
**Problem:** Contract not found

**Check:**
1. Does contract with reference number "1221" exist?
2. Is the reference number exactly correct? (case-sensitive)
3. Check backend database

**Solution:**
- Go to Contracts page and verify the reference number
- Try with a different reference number that you know exists

#### Issue 3: API Call Returns 401 (Unauthorized)
**Problem:** Authentication token missing or expired

**Check:**
- Console log should show: `🔑 Token exists: false`
- Check if you're logged in

**Solution:**
- Log out and log back in
- Check if token is in localStorage: `localStorage.getItem('token')`

#### Issue 4: API Call Returns 500 (Server Error)
**Problem:** Backend error

**Check:**
- Backend terminal for error messages
- Database connection

**Solution:**
- Restart backend server
- Check database connection

#### Issue 5: Contract Found But Fields Don't Populate
**Problem:** Contract status is not "ACTIVE"

**Check:**
- Console log should show contract data
- Check contract status in the response

**Solution:**
- Contract must have status "ACTIVE"
- Change contract status to "ACTIVE" in Contracts page

#### Issue 6: CORS Error
**Problem:** Frontend can't call backend API

**Check:**
- Console shows CORS error
- Backend CORS settings

**Solution:**
- Verify backend is running on correct port
- Check backend CORS configuration

---

## Step-by-Step Debugging

### Step 1: Verify Backend is Running
```bash
# Check backend health
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Step 2: Test API Directly
Open browser and go to:
```
http://localhost:3001/api/contracts/by-reference?referenceNumber=1221
```
(You'll need to add Authorization header, or use Postman)

### Step 3: Check Contract Exists
1. Go to Contracts page
2. Search for reference number "1221"
3. Verify it exists and status is "ACTIVE"

### Step 4: Check Frontend State
In browser console, type:
```javascript
// Check if newTask exists
console.log(window.newTask) // This won't work, but check React DevTools

// Check localStorage token
localStorage.getItem('token')
```

### Step 5: Manual API Test
In browser console, paste:
```javascript
fetch('http://localhost:3001/api/contracts/by-reference?referenceNumber=1221', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

---

## Expected Behavior

### ✅ Working Correctly:
1. Enter reference number → Loading spinner appears
2. API call made → See in Network tab
3. Contract found → Green checkmark appears
4. Fields populate → All contract fields filled
5. Fields locked → Gray background, lock icons

### ❌ Not Working:
1. Enter reference number → Nothing happens
2. No API call → Check useEffect
3. API call fails → Check error message
4. Contract found but fields don't populate → Check console logs
5. Fields populate but not locked → Check lockedFields state

---

## Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop both servers (Ctrl+C)
# Restart backend
cd C:\Users\Lenovo\Desktop\Onix-ERP-Backend\backend
npm run dev

# Restart frontend (new terminal)
cd C:\Users\Lenovo\Desktop\ERP-FRONTEND\ONIX-ERP-V2
npm start
```

### Fix 2: Clear Browser Cache
- Press `Ctrl+Shift+Delete`
- Clear cache and cookies
- Refresh page (`Ctrl+F5`)

### Fix 3: Check Environment Variables
Verify `.env` file has:
```
REACT_APP_API_URL=http://localhost:3001/api
```

### Fix 4: Verify Contract Status
1. Go to Contracts
2. Find contract "1221"
3. Edit it
4. Change status to "ACTIVE"
5. Save
6. Try again

---

## Still Not Working?

1. **Check all console errors** - Copy and share
2. **Check Network tab** - Screenshot the failed request
3. **Check backend terminal** - Any error messages?
4. **Verify contract exists** - Double-check reference number
5. **Try different reference number** - Use one you know works

---

## Test with Known Good Contract

1. Create a new contract:
   - Reference Number: `TEST-001`
   - Status: `ACTIVE`
   - Fill in all fields (Client, Location, Plot Number, etc.)
   - Save

2. In Project Management:
   - Enter `TEST-001` in reference number field
   - Should auto-populate immediately

If this works, the issue is with the specific contract "1221".
If this doesn't work, there's a code/configuration issue.
