# How to Create Employee Username & Password

## 🎯 Quick Answer

**The username (email) and password are AUTO-GENERATED** when you create an employee. You don't manually enter them - the system creates them automatically!

---

## 📍 Step-by-Step Guide

### Step 1: Navigate to Employee Creation Page

**Option A: Via Button**
1. Go to: `http://localhost:3000/employees`
2. Click the **"+ Add Employee"** button (blue button, top-right)
3. You'll be taken to: `http://localhost:3000/employees/create`

**Option B: Direct URL**
- Go directly to: `http://localhost:3000/employees/create`

---

### Step 2: Fill the Employee Form

You'll see a form with these fields:

**Required Fields:**
- ✅ **First Name** (e.g., "John")
- ✅ **Last Name** (e.g., "Doe")
- ✅ **Role** (Select: Employee, Project Manager, or Tender Engineer)

**Optional Fields:**
- Phone
- Department
- Position
- Employee ID
- Assign to Projects

**⚠️ IMPORTANT:** 
- You **DO NOT** enter username/email or password here
- The system will **AUTO-GENERATE** them based on the name you enter

---

### Step 3: Submit the Form

1. Fill in at least First Name and Last Name
2. Select a Role
3. Click **"Create Employee"** button

---

### Step 4: Get the Auto-Generated Credentials

**After clicking "Create Employee", a modal will appear showing:**

```
┌─────────────────────────────────────────┐
│  Employee Credentials                   │
│                                         │
│  ⚠️ Important: Save these now!          │
│                                         │
│  Email (Username):                      │
│  ┌─────────────────────────────────┐   │
│  │ john.doe@onixgroup.ae    [Copy] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Temporary Password:                    │
│  ┌─────────────────────────────────┐   │
│  │ aB3$kL9mN2pQ          [Copy]   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [I've Saved the Credentials]          │
└─────────────────────────────────────────┘
```

**This is where you get the username and password!**

---

## 🔑 How Credentials Are Generated

### Username (Email) Generation:
- **Format:** `firstname.lastname@onixgroup.ae`
- **Example:** 
  - First Name: "John"
  - Last Name: "Doe"
  - **Generated Email:** `john.doe@onixgroup.ae`

- **If email exists:** System adds number
  - `john.doe@onixgroup.ae` (if taken)
  - `john.doe1@onixgroup.ae` (next available)

### Password Generation:
- **Length:** 12 characters
- **Contains:** Uppercase, lowercase, numbers, special characters
- **Example:** `aB3$kL9mN2pQ`
- **Secure:** Randomly generated, cryptographically secure

---

## ⚠️ IMPORTANT: Save Credentials Immediately!

1. **The credentials are shown ONLY ONCE**
2. **After you close the modal, they won't be shown again**
3. **Copy them immediately:**
   - Click "Copy" button next to email
   - Click "Copy" button next to password
   - Or manually copy them
4. **Share with employee:**
   - Give them the email and temporary password
   - Tell them they must change password on first login

---

## 📋 Complete Example

### Creating Employee "John Doe":

1. **Go to:** `http://localhost:3000/employees/create`

2. **Fill Form:**
   ```
   First Name: John
   Last Name: Doe
   Role: Employee
   Department: Engineering
   ```

3. **Click:** "Create Employee"

4. **Modal Shows:**
   ```
   Email: john.doe@onixgroup.ae
   Password: aB3$kL9mN2pQ
   ```

5. **Copy & Save** these credentials

6. **Share with employee:**
   - Email: `john.doe@onixgroup.ae`
   - Password: `aB3$kL9mN2pQ`
   - Instructions: "Login and change your password"

---

## 🎯 Visual Guide

```
┌─────────────────────────────────────────────┐
│  Create New Employee                        │
├─────────────────────────────────────────────┤
│                                             │
│  First Name: [John        ]                 │
│  Last Name:  [Doe         ]                 │
│  Role:       [Employee ▼ ]                 │
│                                             │
│  [Cancel]  [Create Employee] ← Click Here  │
│                                             │
└─────────────────────────────────────────────┘
                    ↓
         (After clicking)
                    ↓
┌─────────────────────────────────────────────┐
│  ⚠️ Employee Credentials                    │
│                                             │
│  Email: john.doe@onixgroup.ae    [Copy]   │
│  Password: aB3$kL9mN2pQ          [Copy]   │
│                                             │
│  [I've Saved the Credentials]              │
└─────────────────────────────────────────────┘
```

---

## 🔍 Where Are Credentials Stored?

- **Backend:** Password is hashed and stored securely
- **Email:** Stored in database as username
- **You:** Only shown once in the modal (not stored anywhere else)

---

## ❓ FAQ

### Q: Can I set a custom username/password?
**A:** No, they are auto-generated for security. The system ensures:
- Unique emails
- Secure passwords
- Consistent format

### Q: What if I lose the credentials?
**A:** You can reset the password:
- Go to employee list
- Find the employee
- Use "Reset Password" option (Admin/HR only)

### Q: Can I see credentials again after closing modal?
**A:** No, they're shown only once. You must reset password if lost.

### Q: How does employee login?
**A:** 
1. Employee goes to login page
2. Enters: `john.doe@onixgroup.ae` / `aB3$kL9mN2pQ`
3. System redirects to password change page
4. Employee sets new password
5. Can now access system

---

## ✅ Checklist

- [ ] Navigate to `/employees/create`
- [ ] Fill First Name and Last Name
- [ ] Select Role
- [ ] Click "Create Employee"
- [ ] **SAVE credentials from modal immediately**
- [ ] Copy email and password
- [ ] Share with employee
- [ ] Employee changes password on first login

---

**Remember: Credentials are auto-generated - you just need to save them when shown!** 🎉


