import React, { createContext, useContext, useState, useEffect } from 'react';

const CompanySelectionContext = createContext();

export const useCompanySelection = () => {
  const context = useContext(CompanySelectionContext);
  if (!context) {
    throw new Error('useCompanySelection must be used within a CompanySelectionProvider');
  }
  return context;
};

export const CompanySelectionProvider = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const savedCompany = localStorage.getItem('selectedCompany');
    const savedDepartment = localStorage.getItem('selectedDepartment');
    
    if (savedCompany) setSelectedCompany(savedCompany);
    if (savedDepartment) setSelectedDepartment(savedDepartment);
  }, []);

  // Save to localStorage whenever values change
  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem('selectedCompany', selectedCompany);
    } else {
      localStorage.removeItem('selectedCompany');
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedDepartment) {
      localStorage.setItem('selectedDepartment', selectedDepartment);
    } else {
      localStorage.removeItem('selectedDepartment');
    }
  }, [selectedDepartment]);

  const selectCompany = (company) => {
    setSelectedCompany(company);
  };

  const selectDepartment = (department) => {
    setSelectedDepartment(department);
  };

  const clearSelection = () => {
    setSelectedCompany('');
    setSelectedDepartment('');
  };

  const clearCompany = () => {
    setSelectedCompany('');
  };

  const clearDepartment = () => {
    setSelectedDepartment('');
  };

  const value = {
    selectedCompany,
    selectedDepartment,
    selectCompany,
    selectDepartment,
    clearSelection,
    clearCompany,
    clearDepartment
  };

  return (
    <CompanySelectionContext.Provider value={value}>
      {children}
    </CompanySelectionContext.Provider>
  );
}; 