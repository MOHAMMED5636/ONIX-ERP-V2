# Tender Engineer Module - User Guide

## Overview
The Tender Engineer Module allows engineers to access and manage assigned tender projects within the ERP system.

## Access Points

### 1. Tender Engineer Login
**URL:** `http://localhost:3000/login/tender-engineer`

**Demo Credentials:**
- Email: `engineer@onixgroup.ae`
- Password: `engineer@123`

### 2. Tender Engineer Dashboard
**URL:** `http://localhost:3000/tender-engineer/dashboard`

**Features:**
- View all assigned tenders
- Filter by status (All, Pending, Accepted, Completed)
- View tender statistics
- Access tender invitation details

## Workflow

### For Admin Users:

#### Step 1: Assign Project to Engineer
1. Navigate to **Tender Page** (`/tender`)
2. In the **Tender Operations Board** table, find the project
3. Click **"Assign"** button in the Actions column
4. In the modal:
   - Select an existing engineer, OR
   - Click **"Add Engineer"** to create a new one
   - Fill in engineer name and email
   - Click **"Add Engineer"**
5. Select the engineer
6. Click **"Assign & Send Invitation"**
7. System generates a secure invitation link
8. Copy the link or use the email option to send to the engineer

#### Step 2: Invitation Link Format
The invitation link will look like:
```
http://localhost:3000/tender/invitation/inv_1234567890_abc123def456
```

### For Tender Engineers:

#### Step 1: Receive Invitation
- Admin sends you an invitation link via email
- Link format: `/tender/invitation/{token}`

#### Step 2: Access Invitation
1. Click the invitation link
2. If not logged in:
   - You'll be redirected to `/login/tender-engineer`
   - Enter your credentials
   - After login, you'll return to the invitation page
3. If already logged in:
   - You'll see the invitation page directly

#### Step 3: Review Tender Details
- View project name, client, reference number
- Check deadlines (Bid Submission, Tender Acceptance)
- Review scope of work and additional notes
- View technical drawings link (if provided)

#### Step 4: Accept Invitation
1. Click **"Accept Invitation & Submit Response"**
2. You'll be redirected to Technical Submission page
3. Upload required documents
4. Submit your technical submission

#### Step 5: View Dashboard
- Access your dashboard at `/tender-engineer/dashboard`
- See all assigned tenders
- Filter by status
- View statistics

## Features

### Dashboard Features
- **Statistics Cards:**
  - Total Tenders
  - Pending Tenders
  - Accepted Tenders
  - Completed Tenders

- **Filter Options:**
  - All Tenders
  - Pending
  - Accepted
  - Completed

- **Tender Cards:**
  - Project name
  - Client information
  - Reference number
  - Deadline
  - Status badge
  - Click to view details

### Invitation Features
- Secure token-based access
- Automatic login redirect if not authenticated
- Tender details display
- Acceptance workflow
- Navigation to technical submission

## Admin Features

### Engineer Management
- View list of all engineers
- Add new engineers
- Assign projects to engineers
- Generate secure invitation tokens
- Send invitation emails

### Assignment Process
1. Select project from Tender Operations Board
2. Click "Assign" button
3. Choose engineer (or add new)
4. System automatically:
   - Generates secure token
   - Creates invitation record
   - Provides invitation link
   - Option to send email

## Security Features

### Token System
- Each invitation has a unique secure token
- Tokens expire after 30 days
- Tokens are validated before access
- Engineer must match invitation assignment

### Role-Based Access
- Engineers can only see assigned tenders
- Engineers cannot access admin features
- Admin can see all tenders and manage assignments
- Separate login systems for admin and engineers

## Troubleshooting

### Cannot Access Dashboard
- **Issue:** Redirected to login page
- **Solution:** Make sure you're logged in with Tender Engineer credentials
- **Check:** URL should be `/tender-engineer/dashboard`

### Invitation Link Not Working
- **Issue:** "Invalid or expired invitation token"
- **Solution:** 
  - Token may have expired (30 days)
  - Contact admin to generate new invitation
  - Make sure you're using the correct link

### Cannot See Assigned Tenders
- **Issue:** Dashboard shows "No tenders assigned"
- **Solution:**
  - Verify admin has assigned project to your account
  - Check that your email matches the invitation
  - Contact admin to verify assignment

### Login Issues
- **Issue:** Cannot login with credentials
- **Solution:**
  - Use demo credentials: `engineer@onixgroup.ae` / `engineer@123`
  - Or contact admin to verify your account exists
  - Make sure you're using `/login/tender-engineer` (not `/login`)

## Technical Details

### Storage
- Engineers stored in: `localStorage.tenderEngineers`
- Invitations stored in: `localStorage.tenderInvitations`
- Tender data stored in: `localStorage.projectTasks`

### Routes
- Login: `/login/tender-engineer`
- Dashboard: `/tender-engineer/dashboard`
- Invitation: `/tender/invitation/:token`
- Technical Submission: `/tender/technical-submission`

### Roles
- `ADMIN`: Full access to all features
- `TENDER_ENGINEER`: Access to assigned tenders only

## Support

For issues or questions:
1. Check this guide
2. Verify your role and permissions
3. Contact system administrator
4. Check browser console for errors

