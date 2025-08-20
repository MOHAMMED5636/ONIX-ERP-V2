// Initial companies data
export const initialCompanies = [
  { 
    id: 1, 
    name: "ONIX Construction", 
    tag: "ONIX", 
    address: "Dubai, UAE", 
    contact: "John Doe",
    contactDetails: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+971-50-123-4567",
      extension: "101"
    },
    logo: null, 
    header: null, 
    footer: null,
    employees: 45,
    status: "active",
    industry: "Construction",
    founded: "2018",
    licenseExpiry: "2025-12-31",
    licenseStatus: "active"
  },
  { 
    id: 2, 
    name: "Tech Solutions Ltd", 
    tag: "TECH", 
    address: "Abu Dhabi, UAE", 
    contact: "Jane Smith",
    contactDetails: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+971-50-987-6543",
      extension: "102"
    },
    logo: null, 
    header: null, 
    footer: null,
    employees: 32,
    status: "active",
    industry: "Technology",
    founded: "2020",
    licenseExpiry: "2024-06-15",
    licenseStatus: "expired"
  },
  { 
    id: 3, 
    name: "Global Engineering", 
    tag: "GLOB", 
    address: "Sharjah, UAE", 
    contact: "Mike Johnson",
    contactDetails: {
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+971-50-555-1234",
      extension: "103"
    },
    logo: null, 
    header: null, 
    footer: null,
    employees: 28,
    status: "active",
    industry: "Engineering",
    founded: "2019",
    licenseExpiry: "2025-03-20",
    licenseStatus: "active"
  },
];

// Status options
export const statusOptions = [
  "all",
  "active",
  "inactive", 
  "pending"
];

// License status options
export const licenseStatusOptions = [
  "all",
  "active",
  "expired",
  "expiring_soon"
];

// Industry options
export const industryOptions = [
  "Construction",
  "Technology",
  "Engineering",
  "Healthcare",
  "Finance"
];

// View mode options
export const viewModeOptions = [
  "cards",
  "table"
];

