// Authentication utility for role-based access control
// IMPORTANT: For auth/role decisions, use AuthContext (useAuth()).
// These helpers read from per-tab sessionStorage (authStorage).

import * as authStorage from './authStorage';

export const ROLES = {
  ADMIN: 'ADMIN',
  TENDER_ENGINEER: 'TENDER_ENGINEER',
};

/** DEPRECATED for auth/role: use useAuth().user. Reads from per-tab sessionStorage. */
export const getCurrentUser = () => {
  return authStorage.getAuthItemJson('currentUser');
};

/** DEPRECATED for auth/role: use useAuth().user?.role. */
export const getCurrentUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

/** DEPRECATED: use useAuth().isAuthenticated. */
export const isAuthenticated = () => {
  return !!authStorage.getToken();
};

/** DEPRECATED for routing/access: use useAuth().user?.role === role. */
export const hasRole = (role) => {
  const userRole = getCurrentUserRole();
  return userRole === role;
};

/** DEPRECATED for routing/access: use useAuth().user?.role === 'ADMIN'. */
export const isAdmin = () => {
  return hasRole(ROLES.ADMIN);
};

/** DEPRECATED for routing/access: use useAuth().user?.role === 'TENDER_ENGINEER'. */
export const isTenderEngineer = () => {
  return hasRole(ROLES.TENDER_ENGINEER);
};

/** Do not use; AuthContext sets user from /auth/me only. */
export const setAuth = (user, role) => {
  const userData = { ...user, role, loginTime: new Date().toISOString() };
  authStorage.setAuthItem('currentUser', userData);
  authStorage.setAuthItem('isAuthenticated', 'true');
  authStorage.setAuthItem('userRole', role);
};

/** Clear per-tab auth (sessionStorage). */
export const clearAuth = () => {
  authStorage.clearAuth();
};

// Get redirect path based on role (unified login: Admin ERP vs Employee ERP)
export const getRoleRedirectPath = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return '/dashboard';
    case ROLES.TENDER_ENGINEER:
      return '/erp/tender/dashboard';
    case 'HR':
    case 'PROJECT_MANAGER':
    case 'CONTRACTOR':
      return '/dashboard';
    case 'EMPLOYEE':
      return '/employee/dashboard';
    default:
      return '/dashboard';
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

