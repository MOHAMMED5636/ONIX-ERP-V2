// Authentication utility for role-based access control

export const ROLES = {
  ADMIN: 'ADMIN',
  TENDER_ENGINEER: 'TENDER_ENGINEER',
};

// Get current user from localStorage (DEPRECATED - Use AuthContext instead)
// This is kept for backward compatibility with existing code
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      return JSON.parse(userStr);
    }
    // Fallback: try to get from token via API if available
    const token = localStorage.getItem('token');
    if (token) {
      // Return null - AuthContext will handle fetching
      return null;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  return null;
};

// Get current user role
export const getCurrentUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

// Check if user is authenticated (DEPRECATED - Use AuthContext instead)
// This checks for token existence as fallback
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token; // If token exists, consider authenticated (AuthContext will validate)
};

// Check if user has specific role
export const hasRole = (role) => {
  const userRole = getCurrentUserRole();
  return userRole === role;
};

// Check if user is admin
export const isAdmin = () => {
  return hasRole(ROLES.ADMIN);
};

// Check if user is tender engineer
export const isTenderEngineer = () => {
  return hasRole(ROLES.TENDER_ENGINEER);
};

// Set user authentication (DEPRECATED - Use AuthContext instead)
// This is kept for backward compatibility but should not be used
export const setAuth = (user, role) => {
  const userData = {
    ...user,
    role: role,
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem('currentUser', JSON.stringify(userData));
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userRole', role);
  // Note: Token should already be set by authAPI.login()
};

// Clear authentication
export const clearAuth = () => {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userRole');
};

// Get redirect path based on role
export const getRoleRedirectPath = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return '/dashboard';
    case ROLES.TENDER_ENGINEER:
      return '/tender-engineer/dashboard';
    default:
      return '/login';
  }
};

// Generate secure invitation token
export const generateInvitationToken = () => {
  return `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
};

// Validate invitation token
export const validateInvitationToken = (token) => {
  if (!token || !token.startsWith('inv_')) {
    return false;
  }
  
  // Check if token exists in localStorage
  const invitations = getTenderInvitations();
  const invitation = invitations.find(inv => inv.token === token);
  
  if (!invitation) {
    return false;
  }
  
  // Check if token is expired (30 days)
  const tokenAge = Date.now() - parseInt(invitation.token.split('_')[1]);
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  
  if (tokenAge > maxAge) {
    return false;
  }
  
  return invitation;
};

// Get tender invitations from localStorage
export const getTenderInvitations = () => {
  try {
    const invitations = localStorage.getItem('tenderInvitations');
    return invitations ? JSON.parse(invitations) : [];
  } catch (error) {
    console.error('Error loading tender invitations:', error);
    return [];
  }
};

// Save tender invitation
export const saveTenderInvitation = (invitation) => {
  const invitations = getTenderInvitations();
  invitations.push(invitation);
  localStorage.setItem('tenderInvitations', JSON.stringify(invitations));
};

// Get invitation by token
export const getInvitationByToken = (token) => {
  const invitations = getTenderInvitations();
  return invitations.find(inv => inv.token === token);
};

// Update invitation status
export const updateInvitationStatus = (token, status, engineerId = null) => {
  const invitations = getTenderInvitations();
  const index = invitations.findIndex(inv => inv.token === token);
  
  if (index !== -1) {
    invitations[index].status = status;
    invitations[index].acceptedAt = status === 'accepted' ? new Date().toISOString() : null;
    invitations[index].engineerId = engineerId;
    localStorage.setItem('tenderInvitations', JSON.stringify(invitations));
    return invitations[index];
  }
  
  return null;
};

