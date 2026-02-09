# 🧪 Testing Guide: Contract Reference Number Auto-Population

## Prerequisites

1. **Backend Server** must be running (Onix-ERP-Backend)
2. **Frontend Server** must be running (ONIX-ERP-V2)
3. You must be **logged in** to the ERP system
4. You need at least **one contract** with status "ACTIVE" in the database

---

## Step 1: Start the Servers

### Option A: Quick Start (Windows)
```bash
cd C:\Users\Lenovo\Desktop\Onix-ERP-Backend
start-all.bat
```

### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd C:\Users\Lenovo\Desktop\Onix-ERP-Backend\backend
npm run dev
```
Backend should start on: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd C:\Users\Lenovo\Desktop\ERP-FRONTEND\ONIX-ERP-V2
npm start
```
Frontend should start on: `http://localhost:3000`

---

## Step 2: Verify Backend is Working

Open your browser and check:
```
http://localhost:3001/health
```
Should return: `{"status":"ok","timestamp":"..."}`

---

## Step 3: Get a Contract Reference Number

### Option A: Use Existing Contract
1. Go to **Contracts** page in the ERP
2. Find a contract with status **"ACTIVE"**
3. Copy the **Reference Number** (e.g., `O-CT-ABC123` or `1221`)

### Option B: Create a Test Contract
1. Go to **Contracts** → **Create Contract**
2. Fill in required fields:
   - **Title**: "Test Contract for Auto-Population"
   - **Status**: Select **"ACTIVE"** (Important!)
   - **Reference Number**: Note this down (or let it auto-generate)
   - Fill in other fields like:
     - Client Name
     - Location/Region
     - Plot Number
     - Community
     - Project Type
     - Number of Floors
     - Developer Name
     - Attachments (optional)
3. **Save** the contract
4. Copy the **Reference Number**

---

## Step 4: Test Auto-Population

### Navigate to Project Management
1. Go to **Project Tracker** or **Project Management** module
2. Click **"New Project"** or **"Add Task"** button
3. You should see a form with a **"Reference Number"** field

### Test Scenario 1: Valid Active Contract
1. **Enter the Contract Reference Number** in the Reference Number field
2. **Watch for:**
   - ⏳ **Loading spinner** appears next to the field
   - ✅ **Green checkmark** appears when contract is found
   - 📋 **All fields auto-populate** with contract data:
     - Client Name
     - Location
     - Plot Number
     - Community
     - Project Type
     - Number of Floors
     - Developer Name
     - Attachments (as view-only links)
   - 🔒 **Lock icons** appear on all auto-filled fields
   - 🎨 **Fields turn gray** (read-only appearance)

### Test Scenario 2: Invalid Reference Number
1. Enter a **non-existent** reference number (e.g., `INVALID-123`)
2. **Watch for:**
   - ⏳ Loading spinner appears
   - ❌ **Red error icon** appears
   - ⚠️ **Error message**: "Contract not found with the provided reference number"
   - Fields remain empty and editable

### Test Scenario 3: Inactive Contract
1. Create or find a contract with status **"DRAFT"** or **"EXPIRED"**
2. Enter its reference number
3. **Watch for:**
   - ⏳ Loading spinner appears
   - ❌ **Red error icon** appears
   - ⚠️ **Error message**: "Contract status is 'DRAFT'. Only Active contracts can be used to create projects."
   - Fields remain empty and editable

### Test Scenario 4: Change Reference Number
1. Enter a valid reference number → Fields populate
2. **Change** the reference number to a different valid one
3. **Watch for:**
   - Fields **refresh** with new contract data
   - Old values are **replaced** with new values
   - Lock icons remain on all fields

### Test Scenario 5: Clear Reference Number
1. Enter a valid reference number → Fields populate
2. **Delete/clear** the reference number field
3. **Watch for:**
   - All auto-populated fields **clear**
   - Lock icons **disappear**
   - Fields become **editable** again

---

## Step 5: Verify Field Locking

1. After entering a valid reference number and fields are populated:
2. **Try to edit** any locked field (Client Name, Location, Plot Number, etc.)
3. **Expected behavior:**
   - Fields are **grayed out**
   - **Cannot type** in the fields
   - **Lock icon** visible
   - **Cursor shows "not-allowed"** when hovering

---

## Step 6: Test Project Creation

1. Enter a valid **ACTIVE** contract reference number
2. Fill in other required fields (Project Name, etc.)
3. Click **"Create Project"** or **"Save"**
4. **Expected behavior:**
   - ✅ Project is created successfully
   - All contract data is included in the project

### Test Validation (Inactive Contract)
1. Enter a **non-ACTIVE** contract reference number
2. Try to create the project
3. **Expected behavior:**
   - ❌ **Alert/Error**: "Cannot create project: Contract status is 'DRAFT'. Only Active contracts can be used."
   - Project creation is **blocked**

---

## Step 7: Check Browser Console

Open **Developer Tools** (F12) → **Console** tab

### What to Look For:
- ✅ **Success messages** when contract is fetched
- ❌ **Error messages** if something goes wrong
- 📡 **API calls** to `/api/contracts/by-reference?referenceNumber=...`

### Expected API Call:
```
GET http://localhost:3001/api/contracts/by-reference?referenceNumber=YOUR_REF_NUMBER
Response: { success: true, data: { ...contract data... } }
```

---

## Step 8: Verify All Contract Fields Are Mapped

After entering a reference number, verify these fields are populated:

### ✅ Basic Fields
- [ ] Client Name
- [ ] Location/Region
- [ ] Plot Number
- [ ] Community
- [ ] Project Type
- [ ] Number of Floors
- [ ] Developer Name

### ✅ Location Details
- [ ] Latitude (if available)
- [ ] Longitude (if available)
- [ ] Makani Number (if available)

### ✅ Building Details
- [ ] Building Cost (if available)
- [ ] Built Up Area (if available)
- [ ] Building Height (if available)
- [ ] Structural System (if available)

### ✅ Financial Details
- [ ] Contract Value (if available)
- [ ] Payment Terms (if available)

### ✅ Documents
- [ ] Contract Document (view-only link)
- [ ] Attachments (view-only links)

---

## Troubleshooting

### Issue: Fields don't auto-populate
**Solutions:**
1. Check browser console for errors
2. Verify backend is running: `http://localhost:3001/health`
3. Check network tab - is API call successful?
4. Verify contract status is "ACTIVE"
5. Check authentication token is valid

### Issue: "Contract not found" error
**Solutions:**
1. Verify the reference number is correct (case-sensitive)
2. Check if contract exists in database
3. Verify backend API endpoint: `/api/contracts/by-reference`

### Issue: Fields are not locked
**Solutions:**
1. Check browser console for JavaScript errors
2. Verify `lockedFields` state is being set
3. Check if CSS classes are applied (`bg-gray-100`, `cursor-not-allowed`)

### Issue: Backend not responding
**Solutions:**
1. Check backend terminal for errors
2. Verify database connection
3. Check `.env` file has correct `DATABASE_URL`
4. Restart backend server

---

## Success Criteria ✅

Your implementation is working correctly if:

1. ✅ Entering a valid ACTIVE contract reference number auto-populates all fields
2. ✅ All auto-populated fields are locked (grayed out, cannot edit)
3. ✅ Lock icons are visible on locked fields
4. ✅ Loading spinner shows while fetching
5. ✅ Success checkmark appears when contract found
6. ✅ Error icon appears for invalid/inactive contracts
7. ✅ Changing reference number refreshes fields
8. ✅ Clearing reference number clears all fields and unlocks them
9. ✅ Project creation is blocked for non-ACTIVE contracts
10. ✅ All contract details are visible in project management

---

## Quick Test Checklist

- [ ] Backend server running
- [ ] Frontend server running
- [ ] Logged into ERP system
- [ ] Have an ACTIVE contract reference number
- [ ] Navigated to Project Management → New Project
- [ ] Entered reference number → Fields populated
- [ ] Fields are locked (grayed out)
- [ ] Lock icons visible
- [ ] Can create project with ACTIVE contract
- [ ] Cannot create project with non-ACTIVE contract

---

## Need Help?

If you encounter issues:
1. Check browser console (F12) for errors
2. Check backend terminal for errors
3. Verify API endpoint is accessible
4. Check network tab in browser DevTools
5. Verify contract exists and has status "ACTIVE"
