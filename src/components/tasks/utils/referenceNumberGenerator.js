// Reference Number Generator Utility
// Automatically generates unique reference numbers for projects and subtasks

// Configuration for reference number format
const REF_CONFIG = {
  PROJECT_PREFIX: 'REF',
  SUBTASK_PREFIX: 'SUB',
  SEPARATOR: '-',
  PADDING_LENGTH: 3, // 001, 002, etc.
  YEAR_PREFIX: true, // Include year in reference
  CATEGORY_PREFIX: true, // Include category prefix
};

// Store for tracking used reference numbers
let usedReferences = new Set();

// Initialize with existing references (call this when app loads)
export const initializeReferenceTracker = (existingTasks) => {
  usedReferences.clear();
  
  // Add existing project references
  existingTasks.forEach(task => {
    if (task.referenceNumber) {
      usedReferences.add(task.referenceNumber);
    }
    
    // Add existing subtask references
    if (task.subtasks) {
      task.subtasks.forEach(subtask => {
        if (subtask.referenceNumber) {
          usedReferences.add(subtask.referenceNumber);
        }
      });
    }
  });
};

// Generate unique project reference number
export const generateProjectReference = (category = 'GEN', existingTasks = []) => {
  // Initialize tracker if not done
  if (usedReferences.size === 0) {
    initializeReferenceTracker(existingTasks);
  }
  
  const currentYear = new Date().getFullYear().toString().slice(-2); // Last 2 digits
  const categoryCode = getCategoryCode(category);
  
  let counter = 1;
  let referenceNumber;
  
  do {
    const paddedCounter = counter.toString().padStart(REF_CONFIG.PADDING_LENGTH, '0');
    
    if (REF_CONFIG.YEAR_PREFIX && REF_CONFIG.CATEGORY_PREFIX) {
      referenceNumber = `${REF_CONFIG.PROJECT_PREFIX}-${currentYear}${categoryCode}-${paddedCounter}`;
    } else if (REF_CONFIG.YEAR_PREFIX) {
      referenceNumber = `${REF_CONFIG.PROJECT_PREFIX}-${currentYear}-${paddedCounter}`;
    } else if (REF_CONFIG.CATEGORY_PREFIX) {
      referenceNumber = `${REF_CONFIG.PROJECT_PREFIX}-${categoryCode}-${paddedCounter}`;
    } else {
      referenceNumber = `${REF_CONFIG.PROJECT_PREFIX}-${paddedCounter}`;
    }
    
    counter++;
  } while (usedReferences.has(referenceNumber));
  
  // Add to used references
  usedReferences.add(referenceNumber);
  
  return referenceNumber;
};

// Generate unique subtask reference number
export const generateSubtaskReference = (parentReference, existingSubtasks = []) => {
  // Initialize tracker if not done
  if (usedReferences.size === 0) {
    // Add existing subtask references to tracker
    existingSubtasks.forEach(subtask => {
      if (subtask.referenceNumber) {
        usedReferences.add(subtask.referenceNumber);
      }
    });
  }
  
  let counter = 1;
  let referenceNumber;
  
  do {
    const paddedCounter = counter.toString().padStart(REF_CONFIG.PADDING_LENGTH, '0');
    referenceNumber = `${parentReference}-${paddedCounter}`;
    counter++;
  } while (usedReferences.has(referenceNumber));
  
  // Add to used references
  usedReferences.add(referenceNumber);
  
  return referenceNumber;
};

// Get category code for reference number
const getCategoryCode = (category) => {
  const categoryMap = {
    'Design': 'DSN',
    'Development': 'DEV',
    'Testing': 'TST',
    'Review': 'REV',
    'Planning': 'PLN',
    'Research': 'RES',
    'Documentation': 'DOC',
    'Maintenance': 'MNT',
    'Support': 'SUP',
    'Training': 'TRN',
    'General': 'GEN',
    'Residential': 'RES',
    'Commercial': 'COM',
    'Industrial': 'IND',
    'Infrastructure': 'INF',
    'Healthcare': 'HTH',
    'Education': 'EDU',
    'Entertainment': 'ENT',
    'Technology': 'TEC',
    'Finance': 'FIN',
    'Manufacturing': 'MFG',
    'Construction': 'CST',
    'Architecture': 'ARC',
    'Engineering': 'ENG',
    'Consulting': 'CON',
    'Marketing': 'MKT',
    'Sales': 'SLS',
    'Human Resources': 'HR',
    'Legal': 'LGL',
    'Accounting': 'ACC',
    'Operations': 'OPS',
  };
  
  return categoryMap[category] || 'GEN';
};

// Reset reference counter (useful for testing or new year)
export const resetReferenceCounter = () => {
  usedReferences.clear();
};

// Get next available reference number without consuming it
export const peekNextReference = (category = 'GEN', existingTasks = []) => {
  const tempReferences = new Set(usedReferences);
  
  // Add existing references to temp set
  existingTasks.forEach(task => {
    if (task.referenceNumber) {
      tempReferences.add(task.referenceNumber);
    }
    
    if (task.subtasks) {
      task.subtasks.forEach(subtask => {
        if (subtask.referenceNumber) {
          tempReferences.add(subtask.referenceNumber);
        }
      });
    }
  });
  
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const categoryCode = getCategoryCode(category);
  
  let counter = 1;
  let referenceNumber;
  
  do {
    const paddedCounter = counter.toString().padStart(REF_CONFIG.PADDING_LENGTH, '0');
    
    if (REF_CONFIG.YEAR_PREFIX && REF_CONFIG.CATEGORY_PREFIX) {
      referenceNumber = `${REF_CONFIG.PROJECT_PREFIX}-${currentYear}${categoryCode}-${paddedCounter}`;
    } else if (REF_CONFIG.YEAR_PREFIX) {
      referenceNumber = `${REF_CONFIG.PROJECT_PREFIX}-${currentYear}-${paddedCounter}`;
    } else if (REF_CONFIG.CATEGORY_PREFIX) {
      referenceNumber = `${REF_CONFIG.PROJECT_PREFIX}-${categoryCode}-${paddedCounter}`;
    } else {
      referenceNumber = `${REF_CONFIG.PROJECT_PREFIX}-${paddedCounter}`;
    }
    
    counter++;
  } while (tempReferences.has(referenceNumber));
  
  return referenceNumber;
};

// Validate reference number format
export const validateReferenceNumber = (referenceNumber) => {
  if (!referenceNumber) return false;
  
  // Check if it follows the expected format
  const pattern = /^REF-(\d{2}[A-Z]{3}-)?\d{3}$/;
  return pattern.test(referenceNumber);
};

// Extract information from reference number
export const parseReferenceNumber = (referenceNumber) => {
  if (!validateReferenceNumber(referenceNumber)) {
    return null;
  }
  
  const parts = referenceNumber.split('-');
  
  if (parts.length === 2) {
    // Format: REF-001
    return {
      type: 'project',
      sequence: parseInt(parts[1]),
      year: null,
      category: null
    };
  } else if (parts.length === 3) {
    // Format: REF-25DEV-001 or REF-25-001
    const middlePart = parts[1];
    
    if (middlePart.length === 5 && /^\d{2}[A-Z]{3}$/.test(middlePart)) {
      // Format: REF-25DEV-001
      return {
        type: 'project',
        sequence: parseInt(parts[2]),
        year: parseInt('20' + middlePart.slice(0, 2)),
        category: middlePart.slice(2)
      };
    } else if (middlePart.length === 2 && /^\d{2}$/.test(middlePart)) {
      // Format: REF-25-001
      return {
        type: 'project',
        sequence: parseInt(parts[2]),
        year: parseInt('20' + middlePart),
        category: null
      };
    }
  } else if (parts.length === 4) {
    // Format: REF-25DEV-001-001 (subtask)
    return {
      type: 'subtask',
      parentReference: `${parts[0]}-${parts[1]}-${parts[2]}`,
      sequence: parseInt(parts[3]),
      year: parseInt('20' + parts[1].slice(0, 2)),
      category: parts[1].slice(2)
    };
  }
  
  return null;
};

// Get reference number statistics
export const getReferenceStats = () => {
  const references = Array.from(usedReferences);
  const projects = references.filter(ref => !ref.includes('-', ref.lastIndexOf('-')));
  const subtasks = references.filter(ref => ref.includes('-', ref.lastIndexOf('-')));
  
  return {
    total: references.length,
    projects: projects.length,
    subtasks: subtasks.length,
    usedReferences: references
  };
};

