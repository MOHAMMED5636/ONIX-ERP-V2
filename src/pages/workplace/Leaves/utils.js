import {
  CheckCircleIcon, 
  XMarkIcon, 
  ClockIcon 
} from "@heroicons/react/24/outline";

// Filter leave requests based on search term, status, and type
export const filterLeaveRequests = (requests, searchTerm, filterStatus, filterType) => {
  return requests.filter(request => {
    const matchesSearch = request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    const matchesType = filterType === "all" || request.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });
};

// Get status color classes
export const getStatusColor = (status) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get leave type color classes
export const getTypeColor = (type) => {
  switch (type) {
    case 'Annual Leave': return 'bg-blue-100 text-blue-800';
    case 'Sick Leave': return 'bg-red-100 text-red-800';
    case 'Personal Leave': return 'bg-purple-100 text-purple-800';
    case 'Emergency Leave': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get status icon component
export const getStatusIcon = (status) => {
  switch (status) {
    case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
    case 'pending': return <ClockIcon className="h-4 w-4" />;
    case 'rejected': return <XMarkIcon className="h-4 w-4" />;
    case 'cancelled': return <XMarkIcon className="h-4 w-4" />;
    default: return null;
  }
};

// Calculate leave statistics
export const calculateLeaveStats = (requests) => {
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const totalRequests = requests.length;
  const totalDaysUsed = requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.days, 0);
  
  return {
    pendingCount,
    approvedCount,
    totalRequests,
    totalDaysUsed,
    successRate: totalRequests > 0 ? Math.round((approvedCount / totalRequests) * 100) : 0
  };
};

// Validate new leave request
export const validateNewRequest = (newRequest) => {
  if (!newRequest.type || !newRequest.fromDate || !newRequest.toDate || !newRequest.reason) {
    return { isValid: false, message: "Please fill in all required fields" };
  }
  
  const fromDate = new Date(newRequest.fromDate);
  const toDate = new Date(newRequest.toDate);
  
  if (fromDate > toDate) {
    return { isValid: false, message: "From date cannot be after to date" };
  }
  
  if (fromDate < new Date()) {
    return { isValid: false, message: "Cannot request leave for past dates" };
  }
  
  return { isValid: true };
};

// Create new leave request
export const createNewRequest = (newRequest) => {
  const fromDate = new Date(newRequest.fromDate);
  const toDate = new Date(newRequest.toDate);
  const days = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

  return {
    id: Date.now(),
    type: newRequest.type,
    fromDate: newRequest.fromDate,
    toDate: newRequest.toDate,
    reason: newRequest.reason,
    status: 'pending',
    submittedDate: new Date().toISOString().split('T')[0],
    days: days
  };
};

// Cancel leave request
export const cancelLeaveRequest = (requests, requestId) => {
  return requests.map(request => 
    request.id === requestId 
      ? { ...request, status: 'cancelled' }
      : request
  );
};

// Delete leave request
export const deleteLeaveRequest = (requests, requestId) => {
  return requests.filter(request => request.id !== requestId);
};

// Reset new request form
export const resetNewRequest = () => {
  return {
    type: '',
    fromDate: '',
    toDate: '',
    reason: ''
  };
};
