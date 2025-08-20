// Initial leave requests data
export const initialLeaveRequests = [
  {
    id: 1,
    type: "Annual Leave",
    fromDate: "2024-02-15",
    toDate: "2024-02-17",
    reason: "Family vacation",
    status: "approved",
    submittedDate: "2024-01-20",
    approvedBy: "John Manager",
    approvedDate: "2024-01-22",
    days: 3
  },
  {
    id: 2,
    type: "Sick Leave",
    fromDate: "2024-02-08",
    toDate: "2024-02-09",
    reason: "Not feeling well",
    status: "approved",
    submittedDate: "2024-02-07",
    approvedBy: "Jane Supervisor",
    approvedDate: "2024-02-07",
    days: 2
  },
  {
    id: 3,
    type: "Personal Leave",
    fromDate: "2024-03-01",
    toDate: "2024-03-01",
    reason: "Personal appointment",
    status: "pending",
    submittedDate: "2024-02-25",
    days: 1
  },
  {
    id: 4,
    type: "Annual Leave",
    fromDate: "2024-01-10",
    toDate: "2024-01-12",
    reason: "Medical checkup",
    status: "rejected",
    submittedDate: "2024-01-05",
    rejectedBy: "HR Manager",
    rejectedDate: "2024-01-08",
    rejectionReason: "Insufficient notice period",
    days: 3
  }
];

// Initial leave balance data
export const initialLeaveBalance = {
  annual: { total: 25, used: 8, remaining: 17 },
  sick: { total: 15, used: 3, remaining: 12 },
  personal: { total: 10, used: 2, remaining: 8 },
  emergency: { total: 5, used: 0, remaining: 5 }
};

// Leave type options
export const leaveTypeOptions = [
  "Annual Leave",
  "Sick Leave", 
  "Personal Leave",
  "Emergency Leave"
];

// Status options
export const statusOptions = [
  "all",
  "pending",
  "approved", 
  "rejected",
  "cancelled"
];

// Default new request form data
export const defaultNewRequest = {
  type: '',
  fromDate: '',
  toDate: '',
  reason: ''
};

