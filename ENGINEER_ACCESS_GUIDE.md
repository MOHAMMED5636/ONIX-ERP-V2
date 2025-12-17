# How Engineers Access ERP After Receiving Invitation Email

## Complete Access Flow

### Step 1: Admin Sends Invitation
When admin assigns a project to an engineer:
1. Admin clicks **"Assign"** button in Tender Operations Board
2. Selects engineer (or adds new one)
3. Clicks **"Assign & Send Invitation"**
4. System generates a **secure invitation link** like:
   ```
   http://localhost:3000/tender/invitation/inv_1234567890_abc123def456
   ```
5. Admin can:
   - Copy the link manually
   - Use email option (mailto link opens)
   - Send email with invitation link

### Step 2: Engineer Receives Email
The engineer receives an email containing:
- **Subject:** "Tender Invitation: [Project Name]"
- **Content:** Project details and invitation link
- **Invitation Link:** Clickable URL to access the tender

**Example Email:**
```
Dear [Engineer Name],

You have been assigned to work on the following tender project:

Project Name: RESIDENTIAL VILLA (G+1+R)
Reference Number: 2475
Client: DIVINDER SINGH KAINTH

Please click on the following link to view and accept the tender invitation:
http://localhost:3000/tender/invitation/inv_1234567890_abc123def456

Best regards,
ONIX Engineering Team
```

### Step 3: Engineer Clicks Invitation Link
When engineer clicks the invitation link:

**Scenario A: Engineer is NOT logged in**
1. System detects no authentication
2. **Automatically redirects** to: `/login/tender-engineer`
3. Login page shows with invitation link preserved
4. Engineer enters credentials:
   - **Email:** `engineer@onixgroup.ae` (or their assigned email)
   - **Password:** `engineer@123` (or their assigned password)
5. After successful login:
   - System **automatically returns** to invitation page
   - Shows tender invitation details

**Scenario B: Engineer is already logged in**
1. System validates the invitation token
2. Checks if engineer matches the invitation
3. Shows tender invitation page directly

### Step 4: Engineer Views Invitation
The invitation page displays:
- **Project Name**
- **Client Information**
- **Reference Number**
- **Deadlines** (Bid Submission, Tender Acceptance)
- **Scope of Work**
- **Technical Drawings Link** (if provided)
- **Additional Notes**

### Step 5: Engineer Accepts Invitation
1. Engineer reviews all tender details
2. Clicks **"Accept Invitation & Submit Response"** button
3. System updates invitation status to "accepted"
4. Redirects to **Technical Submission** page
5. Engineer can upload required documents

### Step 6: Engineer Accesses Dashboard
After accepting invitation, engineer can:
- Access dashboard at: `/tender-engineer/dashboard`
- View all assigned tenders
- See tender statistics
- Filter tenders by status
- Access tender details anytime

## Login Credentials

### For New Engineers
When admin adds a new engineer:
- **Default Password:** `engineer@123`
- Engineer should change password on first login (if password change feature is implemented)
- Email is used as username

### Demo Engineer Credentials
- **Email:** `engineer@onixgroup.ae`
- **Password:** `engineer@123`

## Important URLs

### Engineer Login
```
http://localhost:3000/login/tender-engineer
```

### Engineer Dashboard
```
http://localhost:3000/tender-engineer/dashboard
```

### Invitation Link Format
```
http://localhost:3000/tender/invitation/{token}
```
Example: `http://localhost:3000/tender/invitation/inv_1234567890_abc123def456`

## Security Features

### Token Validation
- Each invitation has a **unique secure token**
- Tokens start with `inv_` prefix
- Tokens expire after **30 days**
- Tokens are validated before access

### Access Control
- Only assigned engineer can access their invitation
- System verifies email/ID matches invitation
- Engineers can only see their assigned tenders
- Separate login system from admin

### Authentication Flow
1. Token validation
2. User authentication check
3. Role verification (TENDER_ENGINEER)
4. Engineer assignment verification
5. Access granted

## Troubleshooting

### Issue: "Invalid or expired invitation token"
**Solution:**
- Token may have expired (30 days)
- Contact admin to generate new invitation
- Make sure you're using the correct link

### Issue: Redirected to login but can't login
**Solution:**
- Verify your email matches the invitation
- Use default password: `engineer@123`
- Contact admin to verify your account exists
- Make sure you're using `/login/tender-engineer` (not `/login`)

### Issue: "This invitation is not assigned to your account"
**Solution:**
- Your email/ID doesn't match the invitation
- Contact admin to verify assignment
- Make sure you're logged in with correct account

### Issue: Can't see invitation after login
**Solution:**
- Check browser console for errors
- Verify token is still valid
- Try refreshing the page
- Clear browser cache and try again

## Step-by-Step Visual Guide

```
1. Engineer receives email
   ↓
2. Clicks invitation link
   ↓
3. System checks authentication
   ├─→ NOT logged in → Redirect to login
   │                    ↓
   │                 Enter credentials
   │                    ↓
   │                 Login successful
   │                    ↓
   └─→ Already logged in → Continue
   ↓
4. System validates token
   ↓
5. Shows invitation page
   ↓
6. Engineer accepts invitation
   ↓
7. Redirects to Technical Submission
   ↓
8. Engineer can access dashboard anytime
```

## Email Template (What Engineer Receives)

```
Subject: Tender Invitation: [Project Name]

Dear [Engineer Name],

You have been assigned to work on the following tender project:

Project Name: [Project Name]
Reference Number: [Reference Number]
Client: [Client Name]

Please click on the following link to view and accept the tender invitation:
[Invitation Link]

Best regards,
ONIX Engineering Team
```

## Quick Reference

**For Engineers:**
1. Check your email for invitation
2. Click the invitation link
3. Login if prompted (use your email and password)
4. Review tender details
5. Accept invitation
6. Upload technical documents

**For Admin:**
1. Assign project to engineer
2. Copy invitation link
3. Send email to engineer
4. Engineer will receive and access automatically

