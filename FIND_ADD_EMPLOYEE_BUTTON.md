# Where to Find "Add Employee" Button

## 📍 Location

### **Main Location: Employees Page**

1. **Navigate to:** `http://localhost:3000/employees`
2. **Look at:** Top-right corner of the page
3. **You'll see 3 buttons:**
   - 🔧 **Rules** (Purple button)
   - 📥 **Import/Export** (Orange button)  
   - ➕ **Add Employee** (Blue button) ← **THIS ONE!**

---

## ✅ Button Visibility Rules

The "Add Employee" button **ONLY shows** if:
- ✅ You are logged in as **ADMIN** or **HR**
- ✅ Your user profile has loaded
- ✅ You are on the `/employees` page

---

## 🔍 How to Check Your Role

### Method 1: Check Navbar
- Look at top-right of dashboard
- Your role should be displayed next to your name
- Should show: **"ADMIN"** or **"HR"**

### Method 2: Browser Console
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Type:
   ```javascript
   JSON.parse(localStorage.getItem('currentUser'))
   ```
4. Check the `role` field

### Method 3: Check Network Tab
1. Press **F12** → **Network** tab
2. Look for `/api/auth/me` request
3. Check response → `data.role` should be `"ADMIN"` or `"HR"`

---

## 🐛 Troubleshooting

### Issue: Button Not Showing

**Solution 1: Check Your Role**
- Login as Admin: `kaddour@onixgroup.ae` / `kadoour123`
- Or: `ramiz@onixgroup.ae` / `ramiz@123`

**Solution 2: Wait for Profile Load**
- Refresh the page
- Wait 2-3 seconds for user profile to load
- Button should appear

**Solution 3: Clear Cache**
```javascript
// In browser console:
localStorage.clear()
// Then refresh and login again
```

**Solution 4: Direct URL Access**
- Even if button doesn't show, you can access:
- `http://localhost:3000/employees/create`
- But you'll get "Forbidden" if not Admin/HR

---

## 🎯 Quick Test

1. **Login as Admin:**
   - Email: `kaddour@onixgroup.ae`
   - Password: `kadoour123`

2. **Go to Employees Page:**
   - Click "Employees" in sidebar
   - Or navigate to: `http://localhost:3000/employees`

3. **Look for Blue Button:**
   - Top-right corner
   - Text: "Add Employee"
   - Icon: ➕ (Plus icon)

4. **Click It:**
   - Should navigate to: `/employees/create`
   - Form should appear

---

## 📸 Visual Guide

```
┌─────────────────────────────────────────────────┐
│  Employees                    [Rules] [Import]   │
│                              [+ Add Employee] ← HERE
├─────────────────────────────────────────────────┤
│                                                 │
│  [Employee List Content]                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Alternative: Direct Access

If button doesn't show but you're Admin:
- **Direct URL:** `http://localhost:3000/employees/create`
- This bypasses the button check
- But route protection will still verify your role

---

## ✅ Expected Behavior

**As ADMIN/HR:**
- ✅ Button visible
- ✅ Can click and navigate to create form
- ✅ Can create employees

**As EMPLOYEE:**
- ❌ Button NOT visible
- ❌ Cannot access `/employees/create` (redirected)
- ❌ Cannot create employees

---

**Need Help?** Check browser console for errors or verify your role in localStorage!


