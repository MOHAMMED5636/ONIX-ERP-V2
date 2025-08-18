// Filter companies based on search term, status, and license status
export const filterCompanies = (companies, searchTerm, filterStatus, filterLicenseStatus) => {
  return companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || company.status === filterStatus;
    const matchesLicenseStatus = filterLicenseStatus === "all" || company.licenseStatus === filterLicenseStatus;
    return matchesSearch && matchesStatus && matchesLicenseStatus;
  });
};

// Get status color classes
export const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get industry color classes
export const getIndustryColor = (industry) => {
  const colors = {
    'Construction': 'bg-blue-100 text-blue-800',
    'Technology': 'bg-purple-100 text-purple-800',
    'Engineering': 'bg-orange-100 text-orange-800',
    'Healthcare': 'bg-pink-100 text-pink-800',
    'Finance': 'bg-green-100 text-green-800'
  };
  return colors[industry] || 'bg-gray-100 text-gray-800';
};

// Get license status color classes
export const getLicenseStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'expired': return 'bg-red-100 text-red-800';
    case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get license status text
export const getLicenseStatusText = (status) => {
  switch (status) {
    case 'active': return 'Active';
    case 'expired': return 'Expired';
    case 'expiring_soon': return 'Expiring Soon';
    default: return 'Unknown';
  }
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Calculate company statistics
export const calculateCompanyStats = (companies) => {
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const totalEmployees = companies.reduce((sum, c) => sum + (c.employees || 0), 0);
  const uniqueIndustries = new Set(companies.map(c => c.industry)).size;
  const activeLicenses = companies.filter(c => c.licenseStatus === 'active').length;
  
  return {
    totalCompanies,
    activeCompanies,
    totalEmployees,
    uniqueIndustries,
    activeLicenses
  };
};

// Delete company
export const deleteCompany = (companies, id) => {
  return companies.filter(company => company.id !== id);
};

// Load companies from localStorage
export const loadCompaniesFromStorage = () => {
  try {
    const savedCompanies = JSON.parse(localStorage.getItem('companies') || '[]');
    return savedCompanies;
  } catch (error) {
    console.error('Error loading companies from localStorage:', error);
    return [];
  }
};

// Save companies to localStorage
export const saveCompaniesToStorage = (companies) => {
  try {
    localStorage.setItem('companies', JSON.stringify(companies));
  } catch (error) {
    console.error('Error saving companies to localStorage:', error);
  }
};

// Merge companies with initial data
export const mergeCompaniesWithInitial = (savedCompanies, initialCompanies) => {
  const allCompanies = [...initialCompanies];
  savedCompanies.forEach(savedCompany => {
    if (!allCompanies.find(company => company.id === savedCompany.id)) {
      allCompanies.push(savedCompany);
    }
  });
  return allCompanies;
};
