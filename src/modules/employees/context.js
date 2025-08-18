import React, { createContext, useContext } from 'react';

// Form context for multi-step form state
export const EmployeeFormContext = createContext();

export function useEmployeeForm() { 
  return useContext(EmployeeFormContext); 
}

export const EmployeeFormProvider = ({ children, value }) => {
  return (
    <EmployeeFormContext.Provider value={value}>
      {children}
    </EmployeeFormContext.Provider>
  );
};

