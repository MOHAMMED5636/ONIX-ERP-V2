# ✅ Frontend to Backend Connection - Status

## Connection Status: **READY** ✅

The frontend is now configured to connect to the backend API.

## What Has Been Set Up

### 1. API Services ✅
- **`src/services/authAPI.js`** - Backend authentication API service
  - `login(email, password, role)` - Connects to backend `/api/auth/login`
  - `getCurrentUser()` - Gets current user from backend
  - `logout()` - Clears auth and redirects
  - `apiRequest()` - Helper for authenticated API calls

- **`src/utils/apiClient.js`** - HTTP client for API calls
  - Automatically includes authentication tokens
  - Handles 401 errors and redirects to login
  - Methods: `get`, `post`, `put`, `patch`, `delete`

### 2. Login Component ✅
- **`src/modules/Login.js`** - Updated to use backend API
  - Tries backend API first
  - Falls back to mock login if backend unavailable (for development)
  - Supports email/username login

### 3. Routing & Authentication ✅
- **`src/App.js`** - Routes configured with:
  - Login route: `/login`
  - Protected routes using `PrivateRoute` component
  - Tender Engineer routes: `/tender-engineer/*`
  - Admin routes: `/*`

### 4. Backend Configuration
- Backend URL: `http://localhost:3001/api` (default)
- CORS configured to allow `http://localhost:3000`
- Authentication using JWT tokens

## How to Use

### Starting Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd ONIX-ERP-V2
npm start
```
Frontend runs on: `http://localhost:3000`

### Testing Login

1. Open frontend: `http://localhost:3000`
2. You'll be redirected to `/login` if not authenticated
3. Use backend test credentials:
   - **Email/Username:** `admin@onixgroup.ae` or `admin`
   - **Password:** `admin123`
   - Backend will authenticate and return JWT token

### Making API Calls in Components

**Using apiClient (Recommended):**
```javascript
import { apiClient } from '../utils/apiClient';

// GET request
const clients = await apiClient.get('/clients');

// POST request
const newClient = await apiClient.post('/clients', clientData);

// PUT request
const updated = await apiClient.put(`/clients/${id}`, updateData);

// DELETE request
await apiClient.delete(`/clients/${id}`);
```

**Using authAPI:**
```javascript
import { login, getCurrentUser, logout } from '../services/authAPI';

// Login
const response = await login('admin@onixgroup.ae', 'admin123', 'ADMIN');

// Get current user
const user = await getCurrentUser();

// Logout
logout();
```

## Available Backend Endpoints

### Authentication
- `POST /api/auth/login` - Login with email, password, role
- `GET /api/auth/me` - Get current user (requires auth token)

### Clients (when implemented)
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Tenders
- `POST /api/tenders/assign` - Assign tender to engineer (Admin only)
- `GET /api/tenders/invitation/:token` - Get invitation by token
- `POST /api/tenders/invitation/:token/accept` - Accept invitation (Engineer)

## Environment Variables (Optional)

Create `.env` file in frontend root:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

If not set, defaults to `http://localhost:3001/api`.

## Troubleshooting

### CORS Error
- ✅ Backend CORS already configured
- Make sure backend is running on port 3001
- Check `FRONTEND_URL` in backend `.env`

### Connection Refused
- Make sure backend server is running
- Check backend health: `http://localhost:3001/health`
- Verify frontend URL matches backend CORS settings

### 401 Unauthorized
- Check if token is stored in localStorage
- Token should be in format: `Bearer <token>`
- Try logging in again

### Token Not Found
- Login should store token in localStorage
- Check Application tab → LocalStorage
- Should see `token`, `user`, `currentUser`, `isAuthenticated`, `userRole`

## Next Steps

1. ✅ Backend connection configured
2. ✅ Login component updated to use backend
3. ⏭️ Update other components to use `apiClient` instead of mock data
4. ⏭️ Implement client CRUD operations
5. ⏭️ Add error handling and loading states
6. ⏭️ Implement refresh token logic (if needed)

---

**Connection is ready! Start both servers and test the login.** 🎉











