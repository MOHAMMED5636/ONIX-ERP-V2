import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const RuleContext = createContext();

// Initial rules data
const initialRules = [
  {
    id: 1,
    role: 'manager',
    action: 'view',
    field: 'salary',
    conditions: [
      { key: 'department', operator: 'equals', value: 'IT' }
    ],
    description: 'Managers can view salary only for IT department employees',
    isActive: true
  },
  {
    id: 2,
    role: 'employee',
    action: 'view',
    field: 'phone',
    conditions: [
      { key: 'department', operator: 'equals', value: 'HR' }
    ],
    description: 'Employees can view phone numbers only for HR department',
    isActive: true
  },
  {
    id: 3,
    role: 'hr_manager',
    action: 'edit',
    field: 'salary',
    conditions: [
      { key: 'role', operator: 'not_equals', value: 'admin' }
    ],
    description: 'HR managers can edit salary for non-admin employees',
    isActive: true
  }
];

// Provider component
export const RuleProvider = ({ children }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load rules from localStorage on mount
  useEffect(() => {
    const loadRules = () => {
      try {
        const savedRules = localStorage.getItem('accessRules');
        if (savedRules) {
          setRules(JSON.parse(savedRules));
        } else {
          // Set initial rules if none exist
          setRules(initialRules);
          localStorage.setItem('accessRules', JSON.stringify(initialRules));
        }
      } catch (error) {
        console.error('Error loading rules:', error);
        setRules(initialRules);
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  // Save rules to localStorage whenever rules change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('accessRules', JSON.stringify(rules));
    }
  }, [rules, loading]);

  // Add a new rule
  const addRule = (newRule) => {
    const ruleToAdd = {
      ...newRule,
      id: Math.max(...rules.map(r => r.id), 0) + 1,
      conditions: newRule.conditions.filter(c => c.key && c.value)
    };
    setRules(prevRules => [...prevRules, ruleToAdd]);
  };

  // Update an existing rule
  const updateRule = (ruleId, updatedRule) => {
    setRules(prevRules => 
      prevRules.map(rule => 
        rule.id === ruleId 
          ? { 
              ...updatedRule, 
              id: ruleId,
              conditions: updatedRule.conditions.filter(c => c.key && c.value)
            }
          : rule
      )
    );
  };

  // Delete a rule
  const deleteRule = (ruleId) => {
    setRules(prevRules => prevRules.filter(rule => rule.id !== ruleId));
  };

  // Toggle rule active status
  const toggleRuleStatus = (ruleId) => {
    setRules(prevRules => 
      prevRules.map(rule => 
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  // Get rules by role
  const getRulesByRole = (role) => {
    return rules.filter(rule => rule.role === role);
  };

  // Get rules by action
  const getRulesByAction = (action) => {
    return rules.filter(rule => rule.action === action);
  };

  // Get rules by field
  const getRulesByField = (field) => {
    return rules.filter(rule => rule.field === field);
  };

  // Get active rules
  const getActiveRules = () => {
    return rules.filter(rule => rule.isActive);
  };

  // Get inactive rules
  const getInactiveRules = () => {
    return rules.filter(rule => !rule.isActive);
  };

  // Get rules statistics
  const getRulesStats = () => {
    const totalRules = rules.length;
    const activeRules = rules.filter(rule => rule.isActive).length;
    const inactiveRules = rules.filter(rule => !rule.isActive).length;
    const viewRules = rules.filter(rule => rule.action === 'view').length;
    const editRules = rules.filter(rule => rule.action === 'edit').length;
    const deleteRules = rules.filter(rule => rule.action === 'delete').length;
    const createRules = rules.filter(rule => rule.action === 'create').length;

    return {
      totalRules,
      activeRules,
      inactiveRules,
      viewRules,
      editRules,
      deleteRules,
      createRules
    };
  };

  // Clear all rules
  const clearAllRules = () => {
    setRules([]);
  };

  // Reset to initial rules
  const resetToInitialRules = () => {
    setRules(initialRules);
  };

  // Export rules
  const exportRules = () => {
    const dataStr = JSON.stringify(rules, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'access-rules.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import rules
  const importRules = (rulesData) => {
    try {
      const parsedRules = typeof rulesData === 'string' ? JSON.parse(rulesData) : rulesData;
      if (Array.isArray(parsedRules)) {
        setRules(parsedRules);
        return { success: true, message: 'Rules imported successfully' };
      } else {
        return { success: false, message: 'Invalid rules format' };
      }
    } catch (error) {
      return { success: false, message: 'Error parsing rules data' };
    }
  };

  const value = {
    rules,
    loading,
    addRule,
    updateRule,
    deleteRule,
    toggleRuleStatus,
    getRulesByRole,
    getRulesByAction,
    getRulesByField,
    getActiveRules,
    getInactiveRules,
    getRulesStats,
    clearAllRules,
    resetToInitialRules,
    exportRules,
    importRules
  };

  return (
    <RuleContext.Provider value={value}>
      {children}
    </RuleContext.Provider>
  );
};

// Custom hook to use the rule context
export const useRules = () => {
  const context = useContext(RuleContext);
  if (!context) {
    throw new Error('useRules must be used within a RuleProvider');
  }
  return context;
};

export default RuleContext; 