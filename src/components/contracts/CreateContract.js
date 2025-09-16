import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  MapPinIcon,
  DocumentTextIcon,
  PaperClipIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import GoogleMap from '../GoogleMap';

const CreateContract = () => {
  // Form state
  const [formData, setFormData] = useState({
    // Questionnaire
    projectTypes: [], // array of 'exterior' and/or 'interior'
    selectedPhases: [],
    
    // General Information
    referenceNumber: '',
    contractCategory: '',
    company: '',
    
    // Client Information
    selectedClients: [],
    
    // Start Date
    startDate: new Date().toISOString().split('T')[0],
    
    // Location
    latitude: '',
    longitude: '',
    region: '',
    plotNumber: '',
    devNumber: '',
    authorityApproval: '',
    community: '',
    numberOfFloors: '',
    
    // Financial Details
    fees: [
      {
        id: 1,
        name: '',
        amount: '',
        type: 'fixed', // 'fixed', 'percentage', 'monthly', 'quarterly'
        squareFeetPrice: '',
        sizeInSquareFeet: '',
        profitPercentage: 0,
        months: 1,
        quarters: 1,
        paymentPeriod: 'One-Time', // 'One-Time', 'Monthly', 'Quarterly', 'Yearly'
        dueDate: '',
        calculatedAmount: 0,
        generateInvoice: false,
        // Custom installment fields
        customInstallments: false,
        numberOfInstallments: 1,
        installments: [
          {
            id: 1,
            installmentNumber: 1,
            amount: 0,
            dueDate: ''
          }
        ]
      }
    ],
    
    // Description & Attachments
    description: '',
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    type: 'Person',
    phone: ''
  });
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [newApprovalStatus, setNewApprovalStatus] = useState('');
  const [approvalStatuses, setApprovalStatuses] = useState([
    'Pending',
    'Approved', 
    'Rejected',
    'Under Review'
  ]);
  const [showCustomProjectTypeModal, setShowCustomProjectTypeModal] = useState(false);
  const [newProjectType, setNewProjectType] = useState({
    name: '',
    description: '',
    phases: [{ name: '', nameAr: '' }]
  });
  const [customProjectTypes, setCustomProjectTypes] = useState([]);
  const [customPhases, setCustomPhases] = useState([]);
  const [showCustomPhaseModal, setShowCustomPhaseModal] = useState(false);
  const [newPhase, setNewPhase] = useState({
    name: '',
    description: ''
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  // Sample data
  const contractCategories = [
    'Service Agreement',
    'Consulting Contract',
    'Development Contract',
    'Maintenance Agreement',
    'Support Contract'
  ];

  const companies = [
    'Tech Solutions Inc.',
    'Creative Agency Ltd.',
    'Digital Innovations',
    'Business Solutions Co.',
    'Enterprise Systems'
  ];


  const [clients, setClients] = useState([
    { id: 1, name: 'SEYED MEHDI HASSANZADEH', type: 'Person', email: 'mehdi@example.com' },
    { id: 2, name: 'SAMER SAMRA', type: 'Person', email: 'samer@example.com' },
    { id: 3, name: 'MOHAMMED ALAMERI', type: 'Person', email: 'mohammed@example.com' },
    { id: 4, name: 'MOHAMMED AL MOHAMMADI', type: 'Person', email: 'mohammed2@example.com' },
    { id: 5, name: 'ABC Corporation', type: 'Company', email: 'contact@abc.com' },
    { id: 6, name: 'XYZ Enterprises', type: 'Company', email: 'info@xyz.com' }
  ]);

  const regions = [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain'
  ];

  // Project phases data
  const projectPhases = {
    interior: [
      { id: 'int-1', phaseNumber: 1, name: 'Concept Design', nameAr: 'التصميم الابتدائي' },
      { id: 'int-3', phaseNumber: 3, name: 'Detailed Design', nameAr: 'التصميم التفصيلي' },
      { id: 'int-4', phaseNumber: 4, name: 'Specs & Tender', nameAr: 'إعداد المواصفات والمناقصة' },
      { id: 'int-6', phaseNumber: 6, name: 'Supervision', nameAr: 'الإشراف' }
    ],
    exterior: [
      { id: 'ext-1', phaseNumber: 1, name: 'Concept Design', nameAr: 'التصميم الابتدائي' },
      { id: 'ext-2', phaseNumber: 2, name: 'Schematic Design', nameAr: 'التصميم التخطيطي' },
      { id: 'ext-3', phaseNumber: 3, name: 'Detailed Design', nameAr: 'التصميم التفصيلي' },
      { id: 'ext-4', phaseNumber: 4, name: 'Specs & Tender', nameAr: 'إعداد المواصفات والمناقصة' },
      { id: 'ext-5', phaseNumber: 5, name: 'AOR / Authority Approvals', nameAr: 'التقديم للاعتماد' },
      { id: 'ext-6', phaseNumber: 6, name: 'Supervision', nameAr: 'الإشراف' }
    ],
    projectManagement: [
      { id: 'pm-1', phaseNumber: 1, name: 'Project Initiation', nameAr: 'بدء المشروع' },
      { id: 'pm-2', phaseNumber: 2, name: 'Planning & Scheduling', nameAr: 'التخطيط والجدولة' },
      { id: 'pm-3', phaseNumber: 3, name: 'Execution & Monitoring', nameAr: 'التنفيذ والمراقبة' },
      { id: 'pm-4', phaseNumber: 4, name: 'Quality Control', nameAr: 'مراقبة الجودة' },
      { id: 'pm-5', phaseNumber: 5, name: 'Project Closure', nameAr: 'إغلاق المشروع' }
    ],
    landscapingDesign: [
      { id: 'land-1', phaseNumber: 1, name: 'Site Analysis', nameAr: 'تحليل الموقع' },
      { id: 'land-2', phaseNumber: 2, name: 'Conceptual Design', nameAr: 'التصميم المفاهيمي' },
      { id: 'land-3', phaseNumber: 3, name: 'Master Planning', nameAr: 'التخطيط الرئيسي' },
      { id: 'land-4', phaseNumber: 4, name: 'Detailed Design', nameAr: 'التصميم التفصيلي' },
      { id: 'land-5', phaseNumber: 5, name: 'Plant Selection', nameAr: 'اختيار النباتات' },
      { id: 'land-6', phaseNumber: 6, name: 'Implementation', nameAr: 'التنفيذ' }
    ],
    clientRepresentative: [
      { id: 'cr-1', phaseNumber: 1, name: 'Contract Review', nameAr: 'مراجعة العقد' },
      { id: 'cr-2', phaseNumber: 2, name: 'Design Review', nameAr: 'مراجعة التصميم' },
      { id: 'cr-3', phaseNumber: 3, name: 'Construction Monitoring', nameAr: 'مراقبة البناء' },
      { id: 'cr-4', phaseNumber: 4, name: 'Quality Assurance', nameAr: 'ضمان الجودة' },
      { id: 'cr-5', phaseNumber: 5, name: 'Final Inspection', nameAr: 'التفتيش النهائي' }
    ]
  };

  // Function to get merged phases based on selected project types
  const getMergedPhases = (selectedTypes) => {
    const allPhases = [];
    
    // Add phases from selected project types
    selectedTypes.forEach(type => {
      // Check if it's a custom project type
      const customType = customProjectTypes.find(ct => ct.id === type);
      if (customType) {
        // Add custom phases with proper structure
        customType.phases.forEach((phase, index) => {
          allPhases.push({
            id: `${customType.id}-${index}`,
            phaseNumber: index + 1,
            name: phase.name,
            nameAr: phase.nameAr || phase.name,
            isCustom: true
          });
        });
      } else if (projectPhases[type]) {
        // Add predefined phases
        allPhases.push(...projectPhases[type]);
      }
    });
    
    // Add custom phases (independent of project types)
    customPhases.forEach(phase => {
      allPhases.push(phase);
    });
    
    // Remove duplicates based on phase number and name
    const uniquePhases = allPhases.reduce((acc, current) => {
      const existingPhase = acc.find(phase => 
        phase.phaseNumber === current.phaseNumber && phase.name === current.name
      );
      if (!existingPhase) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    // Sort by phase number
    return uniquePhases.sort((a, b) => a.phaseNumber - b.phaseNumber);
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle client selection
  const handleClientToggle = (clientId) => {
    setFormData(prev => ({
      ...prev,
      selectedClients: prev.selectedClients.includes(clientId)
        ? prev.selectedClients.filter(id => id !== clientId)
        : [...prev.selectedClients, clientId]
    }));
  };

  // Handle project type toggle (multi-select)
  const handleProjectTypeToggle = (projectType) => {
    setFormData(prev => {
      const newProjectTypes = prev.projectTypes.includes(projectType)
        ? prev.projectTypes.filter(type => type !== projectType)
        : [...prev.projectTypes, projectType];
      
      // Reset selected phases when project types change
      return {
        ...prev,
        projectTypes: newProjectTypes,
        selectedPhases: []
      };
    });
  };

  // Handle phase selection
  const handlePhaseToggle = (phaseId) => {
    setFormData(prev => ({
      ...prev,
      selectedPhases: prev.selectedPhases.includes(phaseId)
        ? prev.selectedPhases.filter(id => id !== phaseId)
        : [...prev.selectedPhases, phaseId]
    }));
  };


  // Calculate fees based on type
  const calculateFees = () => {
    let calculatedFees = 0;
    
    if (formData.isFixedFeesBase && formData.squareFeetPrice && formData.sizeInSquareFeet) {
      // Calculate based on square feet
      const baseAmount = parseFloat(formData.squareFeetPrice) * parseFloat(formData.sizeInSquareFeet);
      calculatedFees = baseAmount;
      
      // Add profit percentage
      if (formData.profitPercentage > 0) {
        calculatedFees = baseAmount * (1 + formData.profitPercentage / 100);
      }
    } else if (formData.contractFee) {
      // Use direct contract fee
      calculatedFees = parseFloat(formData.contractFee);
    }
    
    return calculatedFees;
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Handle new client creation
  const handleNewClientSubmit = () => {
    if (!newClient.name.trim() || !newClient.email.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const clientId = Math.max(...clients.map(c => c.id)) + 1;
    const newClientData = {
      id: clientId,
      name: newClient.name.trim(),
      email: newClient.email.trim(),
      type: newClient.type,
      phone: newClient.phone.trim()
    };

    setClients(prev => [...prev, newClientData]);
    
    // Auto-select the new client
    setFormData(prev => ({
      ...prev,
      selectedClients: [...prev.selectedClients, clientId]
    }));

    // Reset form and close modal
    setNewClient({
      name: '',
      email: '',
      type: 'Person',
      phone: ''
    });
    setShowNewClientModal(false);
  };

  // Handle new client input changes
  const handleNewClientChange = (field, value) => {
    setNewClient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle fee changes
  const handleFeeChange = (feeId, field, value) => {
    setFormData(prev => ({
      ...prev,
      fees: prev.fees.map(fee => 
        fee.id === feeId 
          ? { ...fee, [field]: value }
          : fee
      )
    }));
  };

  // Add new fee
  const addFee = () => {
    const newFeeId = Math.max(...formData.fees.map(f => f.id)) + 1;
    setFormData(prev => ({
      ...prev,
      fees: [...prev.fees, {
        id: newFeeId,
        name: '',
        amount: '',
        type: 'fixed',
        squareFeetPrice: '',
        sizeInSquareFeet: '',
        profitPercentage: 0,
        months: 1,
        quarters: 1,
        paymentPeriod: 'One-Time',
        dueDate: '',
        calculatedAmount: 0,
        generateInvoice: false,
        // Custom installment fields
        customInstallments: false,
        numberOfInstallments: 1,
        installments: [
          {
            id: 1,
            installmentNumber: 1,
            amount: 0,
            dueDate: ''
          }
        ]
      }]
    }));
  };

  // Remove fee
  const removeFee = (feeId) => {
    if (formData.fees.length > 1) {
      setFormData(prev => ({
        ...prev,
        fees: prev.fees.filter(fee => fee.id !== feeId)
      }));
    }
  };

  // Handle custom installment toggle
  const handleCustomInstallmentsToggle = (feeId, enabled) => {
    setFormData(prev => ({
      ...prev,
      fees: prev.fees.map(fee => 
        fee.id === feeId 
          ? { 
              ...fee, 
              customInstallments: enabled,
              numberOfInstallments: enabled ? fee.numberOfInstallments : 1,
              installments: enabled ? generateInstallments(fee.calculatedAmount, fee.numberOfInstallments) : [
                {
                  id: 1,
                  installmentNumber: 1,
                  amount: fee.calculatedAmount,
                  dueDate: fee.dueDate
                }
              ]
            }
          : fee
      )
    }));
  };

  // Generate installments based on total amount and number of installments
  const generateInstallments = (totalAmount, numberOfInstallments) => {
    const installments = [];
    const baseAmount = Math.floor(totalAmount / numberOfInstallments);
    const remainder = totalAmount % numberOfInstallments;
    
    for (let i = 0; i < numberOfInstallments; i++) {
      const amount = baseAmount + (i < remainder ? 1 : 0);
      installments.push({
        id: i + 1,
        installmentNumber: i + 1,
        amount: amount,
        dueDate: ''
      });
    }
    
    return installments;
  };

  // Handle number of installments change
  const handleNumberOfInstallmentsChange = (feeId, numberOfInstallments) => {
    const fee = formData.fees.find(f => f.id === feeId);
    if (fee) {
      setFormData(prev => ({
        ...prev,
        fees: prev.fees.map(f => 
          f.id === feeId 
            ? { 
                ...f, 
                numberOfInstallments: parseInt(numberOfInstallments) || 1,
                installments: generateInstallments(f.calculatedAmount, parseInt(numberOfInstallments) || 1)
              }
            : f
        )
      }));
    }
  };

  // Handle installment amount change
  const handleInstallmentAmountChange = (feeId, installmentId, amount) => {
    setFormData(prev => ({
      ...prev,
      fees: prev.fees.map(fee => 
        fee.id === feeId 
          ? {
              ...fee,
              installments: fee.installments.map(installment =>
                installment.id === installmentId
                  ? { ...installment, amount: parseFloat(amount) || 0 }
                  : installment
              )
            }
          : fee
      )
    }));
  };

  // Handle installment due date change
  const handleInstallmentDueDateChange = (feeId, installmentId, dueDate) => {
    setFormData(prev => ({
      ...prev,
      fees: prev.fees.map(fee => 
        fee.id === feeId 
          ? {
              ...fee,
              installments: fee.installments.map(installment =>
                installment.id === installmentId
                  ? { ...installment, dueDate }
                  : installment
              )
            }
          : fee
      )
    }));
  };

  // Calculate total of custom installments
  const calculateInstallmentTotal = (installments) => {
    return installments.reduce((total, installment) => total + (installment.amount || 0), 0);
  };

  // Calculate fee amount based on fee type
  const calculateFeeAmount = (fee) => {
    switch (fee.type) {
      case 'fixed':
        return parseFloat(fee.amount) || 0;
      
      case 'percentage':
        const sqFtPrice = parseFloat(fee.squareFeetPrice) || 0;
        const sizeSqFt = parseFloat(fee.sizeInSquareFeet) || 0;
        const profitPercent = parseFloat(fee.profitPercentage) || 0;
        const buildingCost = sqFtPrice * sizeSqFt;
        const feeAmount = (buildingCost * profitPercent) / 100;
        return feeAmount;
      
      case 'monthly':
        const monthlyAmount = parseFloat(fee.amount) || 0;
        const months = parseInt(fee.months) || 1;
        return monthlyAmount * months;
      
      case 'quarterly':
        const quarterlyAmount = parseFloat(fee.amount) || 0;
        const quarters = parseInt(fee.quarters) || 1;
        return quarterlyAmount * quarters;
      
      default:
        return 0;
    }
  };

  // Calculate installment information
  const calculateInstallmentInfo = (fee) => {
    const totalAmount = calculateFeeAmount(fee);
    const paymentPeriod = fee.paymentPeriod || 'One-Time';
    
    if (paymentPeriod === 'One-Time') {
      return {
        numberOfInstallments: 1,
        installmentAmount: totalAmount,
        period: 'One-Time'
      };
    }
    
    // For other periods, we need to determine how many installments based on the fee type
    let numberOfInstallments = 1;
    
    if (fee.type === 'monthly') {
      numberOfInstallments = parseInt(fee.months) || 1;
    } else if (fee.type === 'quarterly') {
      numberOfInstallments = parseInt(fee.quarters) || 1;
    } else {
      // For fixed and percentage fees, calculate installments based on payment period
      switch (paymentPeriod) {
        case 'Monthly':
          numberOfInstallments = 12; // Assume 12 months for a year
          break;
        case 'Quarterly':
          numberOfInstallments = 4; // 4 quarters in a year
          break;
        case 'Yearly':
          numberOfInstallments = 1; // 1 payment per year
          break;
        default:
          numberOfInstallments = 1;
      }
    }
    
    const installmentAmount = totalAmount / numberOfInstallments;
    
    return {
      numberOfInstallments,
      installmentAmount,
      period: paymentPeriod
    };
  };

  // Handle map location change
  const handleMapLocationChange = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString()
    }));
  };

  // Auto-recalculate fees when relevant inputs change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      fees: prev.fees.map(fee => {
        const newCalculatedAmount = calculateFeeAmount(fee);
        return {
          ...fee,
          calculatedAmount: newCalculatedAmount,
          // Update installments if custom installments are enabled
          installments: fee.customInstallments 
            ? generateInstallments(newCalculatedAmount, fee.numberOfInstallments)
            : fee.installments
        };
      })
    }));
  }, [formData.fees.map(fee => `${fee.type}-${fee.amount}-${fee.squareFeetPrice}-${fee.sizeInSquareFeet}-${fee.profitPercentage}-${fee.months}-${fee.quarters}`).join(',')]);

  // Handle adding new approval status
  const handleAddApprovalStatus = () => {
    if (newApprovalStatus.trim() && !approvalStatuses.includes(newApprovalStatus.trim())) {
      setApprovalStatuses(prev => [...prev, newApprovalStatus.trim()]);
      setNewApprovalStatus('');
      setShowApprovalModal(false);
    }
  };

  // Handle removing approval status
  const handleRemoveApprovalStatus = (statusToRemove) => {
    if (approvalStatuses.length > 1) { // Keep at least one status
      setApprovalStatuses(prev => prev.filter(status => status !== statusToRemove));
      // Clear form data if the removed status was selected
      if (formData.authorityApproval === statusToRemove) {
        setFormData(prev => ({ ...prev, authorityApproval: '' }));
      }
    }
  };

  // Handle custom project type changes
  const handleCustomProjectTypeChange = (field, value) => {
    setNewProjectType(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhaseChange = (index, field, value) => {
    setNewProjectType(prev => ({
      ...prev,
      phases: prev.phases.map((phase, i) => 
        i === index ? { ...phase, [field]: value } : phase
      )
    }));
  };

  const addPhase = () => {
    setNewProjectType(prev => ({
      ...prev,
      phases: [...prev.phases, { name: '', nameAr: '' }]
    }));
  };

  const removePhase = (index) => {
    if (newProjectType.phases.length > 1) {
      setNewProjectType(prev => ({
        ...prev,
        phases: prev.phases.filter((_, i) => i !== index)
      }));
    }
  };

  const handleAddCustomProjectType = () => {
    if (newProjectType.name.trim() && newProjectType.description.trim()) {
      const customType = {
        id: `custom-${Date.now()}`,
        name: newProjectType.name.trim(),
        description: newProjectType.description.trim(),
        phases: newProjectType.phases.filter(phase => phase.name.trim())
      };
      
      setCustomProjectTypes(prev => [...prev, customType]);
      // Automatically select the new custom project type
      setFormData(prev => ({
        ...prev,
        projectTypes: [...prev.projectTypes, customType.id]
      }));
      setNewProjectType({
        name: '',
        description: '',
        phases: [{ name: '', nameAr: '' }]
      });
      setShowCustomProjectTypeModal(false);
    }
  };

  const handleRemoveCustomProjectType = (typeId) => {
    setCustomProjectTypes(prev => prev.filter(type => type.id !== typeId));
    // Remove from selected project types if it was selected
    setFormData(prev => ({
      ...prev,
      projectTypes: prev.projectTypes.filter(type => type !== typeId)
    }));
  };

  // Custom Phase Functions
  const handleCustomPhaseChange = (field, value) => {
    setNewPhase(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddCustomPhase = () => {
    if (newPhase.name.trim() && newPhase.description.trim()) {
      const customPhase = {
        id: `custom-phase-${Date.now()}`,
        name: newPhase.name.trim(),
        description: newPhase.description.trim(),
        phaseNumber: customPhases.length + 7, // Start from 7 since we have 6 default phases
        isCustom: true
      };
      
      setCustomPhases(prev => [...prev, customPhase]);
      // Automatically select the new custom phase
      setFormData(prev => ({
        ...prev,
        selectedPhases: [...prev.selectedPhases, customPhase.id]
      }));
      setNewPhase({
        name: '',
        description: ''
      });
      setShowCustomPhaseModal(false);
    }
  };

  const handleRemoveCustomPhase = (phaseId) => {
    setCustomPhases(prev => prev.filter(phase => phase.id !== phaseId));
    // Remove from selected phases if it was selected
    setFormData(prev => ({
      ...prev,
      selectedPhases: prev.selectedPhases.filter(phase => phase !== phaseId)
    }));
  };

  const handleRemoveCustomProjectTypePhase = (customTypeId, phaseIndex) => {
    setCustomProjectTypes(prev => prev.map(type => {
      if (type.id === customTypeId) {
        const updatedPhases = type.phases.filter((_, index) => index !== phaseIndex);
        return {
          ...type,
          phases: updatedPhases
        };
      }
      return type;
    }));
    
    // Remove from selected phases if it was selected
    const phaseId = `${customTypeId}-${phaseIndex}`;
    setFormData(prev => ({
      ...prev,
      selectedPhases: prev.selectedPhases.filter(phase => phase !== phaseId)
    }));
  };

  const handleRemoveDefaultPhase = (phaseId) => {
    // Remove from selected phases if it was selected
    setFormData(prev => ({
      ...prev,
      selectedPhases: prev.selectedPhases.filter(phase => phase !== phaseId)
    }));
  };

  // Upload Modal Functions
  const handleModalFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      systemRef: `REF-${Date.now()}`,
      category: 'General',
      uploadedOn: new Date().toLocaleDateString()
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const updateFileCategory = (fileId, category) => {
    setUploadedFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, category } : file
    ));
  };

  const handleUploadDone = () => {
    // Add uploaded files to form data
    const files = uploadedFiles.map(item => item.file);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
    
    // Reset modal state
    setUploadedFiles([]);
    setCurrentStep(1);
    setShowUploadModal(false);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.referenceNumber.trim()) {
      newErrors.referenceNumber = 'Reference number is required';
    }
    if (!formData.contractCategory) {
      newErrors.contractCategory = 'Contract category is required';
    }
    if (!formData.company) {
      newErrors.company = 'Company is required';
    }
    if (formData.selectedClients.length === 0) {
      newErrors.selectedClients = 'At least one client must be selected';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.contractFee) {
      newErrors.contractFee = 'Contract fee is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Contract data:', {
        ...formData,
        status: isDraft ? 'draft' : 'submitted'
      });
      
      // Show success message
      alert(`Contract ${isDraft ? 'saved as draft' : 'submitted'} successfully!`);
      
      // Reset form if not draft
      if (!isDraft) {
        setFormData({
          projectTypes: [],
          selectedPhases: [],
          referenceNumber: '',
          contractCategory: '',
          company: '',
          selectedClients: [],
          startDate: new Date().toISOString().split('T')[0],
          latitude: '',
          longitude: '',
          region: '',
          plotNumber: '',
          devNumber: '',
          authorityApproval: '',
          community: '',
          numberOfFloors: '',
          fees: [
            {
              id: 1,
              name: '',
              amount: '',
              type: 'fixed',
              squareFeetPrice: '',
              sizeInSquareFeet: '',
              profitPercentage: 0,
              months: 1,
              quarters: 1,
              paymentPeriod: 'One-Time',
              dueDate: '',
              calculatedAmount: 0,
              generateInvoice: false,
              // Custom installment fields
              customInstallments: false,
              numberOfInstallments: 1,
              installments: [
                {
                  id: 1,
                  installmentNumber: 1,
                  amount: 0,
                  dueDate: ''
                }
              ]
            }
          ],
          description: '',
          attachments: []
        });
      }
    } catch (error) {
      console.error('Error submitting contract:', error);
      alert('Error submitting contract. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      {/* Main Content */}
      <div className="relative flex flex-col">
        {/* Enhanced Top Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-xl border-b border-white/20 px-6 py-6">
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <DocumentTextIcon className="w-7 h-7 text-white" />
              </div>
          <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create Contract
                </h1>
                <p className="text-sm text-gray-600 mt-1">Design your project contract with precision</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Form */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-8">
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  
                  {/* Questionnaire Module */}
                  <div className="mb-8">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                        <span className="text-white text-lg">🏗️</span>
          </div>
          <div>
                        <h2 className="text-2xl font-bold text-gray-900">Project Nature</h2>
                        <p className="text-sm text-gray-600">Define your project type and phases</p>
          </div>
                    </div>
                    
                    <div className="relative bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-3xl p-8 border-2 border-orange-200 shadow-2xl overflow-hidden">
                      {/* Decorative Background Elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200 to-orange-200 rounded-full opacity-20 transform -translate-x-12 translate-y-12"></div>
                      <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-15 transform -translate-x-8 -translate-y-8"></div>
                      
                      {/* Project Type Selection */}
                      <div className="relative mb-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg mr-4">
                              <span className="text-white text-xl">🎯</span>
          </div>
          <div>
                              <p className="text-lg font-semibold text-gray-800">What type of project is this?</p>
                              <p className="text-sm text-gray-600">Select one or multiple project types (multi-select allowed)</p>
          </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowCustomProjectTypeModal(true)}
                            className="group flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-2xl hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
                          >
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3 group-hover:rotate-90 transition-transform duration-300">
                              <PlusIcon className="w-5 h-5" />
                            </div>
                            <span className="font-semibold">Add Custom Type</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <label className={`group relative flex items-start p-6 border-2 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 ${
                            formData.projectTypes.includes('interior') 
                              ? 'border-orange-500 bg-gradient-to-br from-orange-100 to-red-100 shadow-2xl scale-105 -translate-y-2' 
                              : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50'
                          }`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-start w-full">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 mt-1 transition-all duration-300 ${
                                formData.projectTypes.includes('interior')
                                  ? 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-500'
                                  : 'border-gray-300 group-hover:border-orange-400'
                              }`}>
                                {formData.projectTypes.includes('interior') && (
                                  <CheckIcon className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">🏠</span>
                                  </div>
                                  <span className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">Interior Project</span>
                                </div>
                                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Design and construction of interior spaces</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.projectTypes.includes('interior')}
                              onChange={() => handleProjectTypeToggle('interior')}
                              className="absolute opacity-0 pointer-events-none"
                            />
                          </label>
                          
                          <label className={`group relative flex items-start p-6 border-2 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 ${
                            formData.projectTypes.includes('exterior') 
                              ? 'border-orange-500 bg-gradient-to-br from-orange-100 to-red-100 shadow-2xl scale-105 -translate-y-2' 
                              : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50'
                          }`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-start w-full">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 mt-1 transition-all duration-300 ${
                                formData.projectTypes.includes('exterior')
                                  ? 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-500'
                                  : 'border-gray-300 group-hover:border-orange-400'
                              }`}>
                                {formData.projectTypes.includes('exterior') && (
                                  <CheckIcon className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">🏢</span>
                                  </div>
                                  <span className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">Exterior Project</span>
                                </div>
                                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Building facade and external construction</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.projectTypes.includes('exterior')}
                              onChange={() => handleProjectTypeToggle('exterior')}
                              className="absolute opacity-0 pointer-events-none"
                            />
                          </label>

                          <label className={`group relative flex items-start p-6 border-2 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 ${
                            formData.projectTypes.includes('projectManagement') 
                              ? 'border-orange-500 bg-gradient-to-br from-orange-100 to-red-100 shadow-2xl scale-105 -translate-y-2' 
                              : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50'
                          }`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-start w-full">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 mt-1 transition-all duration-300 ${
                                formData.projectTypes.includes('projectManagement')
                                  ? 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-500'
                                  : 'border-gray-300 group-hover:border-orange-400'
                              }`}>
                                {formData.projectTypes.includes('projectManagement') && (
                                  <CheckIcon className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">📋</span>
                                  </div>
                                  <span className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">Project Management</span>
                                </div>
                                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Comprehensive project planning and execution</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.projectTypes.includes('projectManagement')}
                              onChange={() => handleProjectTypeToggle('projectManagement')}
                              className="absolute opacity-0 pointer-events-none"
                            />
                          </label>

                          <label className={`group relative flex items-start p-6 border-2 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 ${
                            formData.projectTypes.includes('landscapingDesign') 
                              ? 'border-orange-500 bg-gradient-to-br from-orange-100 to-red-100 shadow-2xl scale-105 -translate-y-2' 
                              : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50'
                          }`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-start w-full">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 mt-1 transition-all duration-300 ${
                                formData.projectTypes.includes('landscapingDesign')
                                  ? 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-500'
                                  : 'border-gray-300 group-hover:border-orange-400'
                              }`}>
                                {formData.projectTypes.includes('landscapingDesign') && (
                                  <CheckIcon className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">🌿</span>
                                  </div>
                                  <span className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">Landscaping Design</span>
                                </div>
                                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Outdoor space design and landscape planning</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.projectTypes.includes('landscapingDesign')}
                              onChange={() => handleProjectTypeToggle('landscapingDesign')}
                              className="absolute opacity-0 pointer-events-none"
                            />
                          </label>

                          <label className={`group relative flex items-start p-6 border-2 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 ${
                            formData.projectTypes.includes('clientRepresentative') 
                              ? 'border-orange-500 bg-gradient-to-br from-orange-100 to-red-100 shadow-2xl scale-105 -translate-y-2' 
                              : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50'
                          }`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-start w-full">
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 mt-1 transition-all duration-300 ${
                                formData.projectTypes.includes('clientRepresentative')
                                  ? 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-500'
                                  : 'border-gray-300 group-hover:border-orange-400'
                              }`}>
                                {formData.projectTypes.includes('clientRepresentative') && (
                                  <CheckIcon className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">👥</span>
                                  </div>
                                  <span className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">Client Representative</span>
                                </div>
                                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Client liaison and project oversight services</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.projectTypes.includes('clientRepresentative')}
                              onChange={() => handleProjectTypeToggle('clientRepresentative')}
                              className="absolute opacity-0 pointer-events-none"
                            />
                          </label>

                          {/* Custom Project Types */}
                          {customProjectTypes.map((customType) => (
                            <div key={customType.id} className="relative">
                              <label className={`group relative flex items-start p-6 border-2 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 ${
                                formData.projectTypes.includes(customType.id) 
                                  ? 'border-orange-500 bg-gradient-to-br from-orange-100 to-red-100 shadow-2xl scale-105 -translate-y-2' 
                                  : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50'
                              }`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative flex items-start w-full">
                                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 mt-1 transition-all duration-300 ${
                                    formData.projectTypes.includes(customType.id)
                                      ? 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-500'
                                      : 'border-gray-300 group-hover:border-orange-400'
                                  }`}>
                                    {formData.projectTypes.includes(customType.id) && (
                                      <CheckIcon className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center mr-3">
                                        <span className="text-white text-sm">⭐</span>
                                      </div>
                                      <span className="text-xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">{customType.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{customType.description}</p>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={formData.projectTypes.includes(customType.id)}
                                  onChange={() => handleProjectTypeToggle(customType.id)}
                                  className="absolute opacity-0 pointer-events-none"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomProjectType(customType.id)}
                                className="absolute top-3 right-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                                title="Remove custom project type"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
            </div>
          </div>
                      
                      {/* Contract Agreement Section */}
                      {formData.projectTypes.length > 0 && (
          <div className="relative mt-8">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                                <span className="text-white text-lg">🚀</span>
          </div>
          <div>
                                <h3 className="text-2xl font-bold text-gray-900">Contract Agreement</h3>
                                <p className="text-sm text-gray-600">Select the phases that apply to your contract</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowCustomPhaseModal(true)}
                              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <span className="mr-2">➕</span>
                              Add Custom Phase
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {getMergedPhases(formData.projectTypes).map((phase) => (
                              <div
                                key={phase.id}
                                className={`group relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 ${
                                  formData.selectedPhases.includes(phase.id)
                                    ? 'border-blue-500 bg-gradient-to-br from-blue-100 to-purple-100 shadow-2xl scale-105 -translate-y-2'
                                    : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50'
                                }`}
                                onClick={() => handlePhaseToggle(phase.id)}
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative flex items-center w-full">
                                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 transition-all duration-300 ${
                                    formData.selectedPhases.includes(phase.id)
                                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 border-blue-500'
                                      : 'border-gray-300 group-hover:border-blue-400'
                                  }`}>
                                    {formData.selectedPhases.includes(phase.id) && (
                                      <CheckIcon className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center shadow-lg">
                                        <span className="text-white text-sm font-bold">{phase.phaseNumber}</span>
                                      </div>
                                      <p className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                                        {phase.name}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Remove button for all phases */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Check if this is a custom phase
                                    if (phase.isCustom) {
                                      // Check if this is a phase from a custom project type
                                      if (phase.id.includes('-') && !phase.id.startsWith('custom-phase-')) {
                                        // This is a phase from a custom project type
                                        const customTypeId = phase.id.split('-')[0] + '-' + phase.id.split('-')[1];
                                        const phaseIndex = parseInt(phase.id.split('-')[2]);
                                        handleRemoveCustomProjectTypePhase(customTypeId, phaseIndex);
                                      } else {
                                        // This is a standalone custom phase
                                        handleRemoveCustomPhase(phase.id);
                                      }
                                    } else {
                                      // This is a default phase
                                      handleRemoveDefaultPhase(phase.id);
                                    }
                                  }}
                                  className="absolute top-3 right-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                                  title="Remove phase"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                                
                                <input
                                  type="checkbox"
                                  checked={formData.selectedPhases.includes(phase.id)}
                                  onChange={() => handlePhaseToggle(phase.id)}
                                  className="absolute opacity-0 pointer-events-none"
                                />
                              </div>
                            ))}
            </div>
                          
                          {/* Show merge info when both types are selected */}
                          {formData.projectTypes.length === 2 && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                                  <span className="text-white text-sm">✨</span>
                                </div>
                                <p className="text-sm text-blue-800">
                                  <strong>Smart Merge:</strong> Duplicate phases are automatically combined for efficiency.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* General Information */}
                  <div className="mb-8">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl mr-4">
                        <span className="text-white text-xl">📄</span>
          </div>
          <div>
                        <h2 className="text-2xl font-bold text-gray-900">General Information</h2>
                        <p className="text-sm text-gray-600">Basic contract details and categorization</p>
          </div>
                    </div>
                    
                    <div className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-3xl p-8 border-2 border-blue-200 shadow-2xl overflow-hidden">
                      {/* Decorative Background Elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-200 to-blue-200 rounded-full opacity-20 transform -translate-x-12 translate-y-12"></div>
                      <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full opacity-15 transform -translate-x-8 -translate-y-8"></div>
                    
                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Reference Number Field */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mr-2">
                            <span className="text-white text-xs">#</span>
                          </div>
                          Reference Number *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.referenceNumber}
                            onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                            className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 ${
                              errors.referenceNumber ? 'border-red-500 bg-red-50/80' : 'border-gray-200 hover:border-blue-300'
                            }`}
                            placeholder="Enter reference number"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                        {errors.referenceNumber && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <span className="w-4 h-4 mr-1">⚠️</span>
                            {errors.referenceNumber}
                          </p>
                        )}
                      </div>
                      
                      {/* Contract Category Field */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-lg flex items-center justify-center mr-2">
                            <span className="text-white text-xs">📋</span>
                          </div>
                          Contract Category *
                        </label>
                        <div className="relative">
                          <select
                            value={formData.contractCategory}
                            onChange={(e) => handleInputChange('contractCategory', e.target.value)}
                            className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 appearance-none cursor-pointer ${
                              errors.contractCategory ? 'border-red-500 bg-red-50/80' : 'border-gray-200 hover:border-cyan-300'
                            }`}
                          >
                            <option value="">Select category</option>
                            {contractCategories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {errors.contractCategory && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <span className="w-4 h-4 mr-1">⚠️</span>
                            {errors.contractCategory}
                          </p>
                        )}
                      </div>
                      
                      {/* Company Field */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-blue-400 rounded-lg flex items-center justify-center mr-2">
                            <span className="text-white text-xs">🏢</span>
                          </div>
                          Company *
                        </label>
                        <div className="relative">
                          <select
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 appearance-none cursor-pointer ${
                              errors.company ? 'border-red-500 bg-red-50/80' : 'border-gray-200 hover:border-teal-300'
                            }`}
                          >
                            <option value="">Select company</option>
                            {companies.map(company => (
                              <option key={company} value={company}>{company}</option>
                            ))}
                          </select>
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {errors.company && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <span className="w-4 h-4 mr-1">⚠️</span>
                            {errors.company}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                  {/* Client Information */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                          <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <div>
                          <h2 className="text-2xl font-bold text-gray-900">Select Clients</h2>
                          <p className="text-sm text-gray-600">Choose existing clients or add new ones</p>
          </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewClientModal(true)}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add New Client
                      </button>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {clients.map(client => (
                          <div
                            key={client.id}
                            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                              formData.selectedClients.includes(client.id)
                                ? 'border-green-500 bg-green-100 shadow-lg transform scale-105'
                                : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                            }`}
                            onClick={() => handleClientToggle(client.id)}
                          >
                            <input
                              type="checkbox"
                              checked={formData.selectedClients.includes(client.id)}
                              onChange={() => handleClientToggle(client.id)}
                              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <div className="ml-4 flex-1">
                              <p className="text-base font-semibold text-gray-900">{client.name}</p>
                              <p className="text-sm text-gray-600">{client.type} • {client.email}</p>
                            </div>
                            {client.type === 'Person' && (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-xs font-bold text-white">AI</span>
                              </div>
                            )}
                            {client.type === 'Company' && (
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-xs font-bold text-white">CO</span>
          </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {errors.selectedClients && (
                        <p className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                          {errors.selectedClients}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="mb-8">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-xl mr-4">
                        <span className="text-white text-xl">📅</span>
          </div>
          <div>
                        <h2 className="text-2xl font-bold text-gray-900">Start Date</h2>
                        <p className="text-sm text-gray-600">Set the contract start date</p>
          </div>
          </div>
                    
                    <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl p-8 border-2 border-purple-200 shadow-2xl overflow-hidden max-w-lg">
                      {/* Decorative Background Elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200 to-purple-200 rounded-full opacity-20 transform -translate-x-12 translate-y-12"></div>
                      <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-15 transform -translate-x-8 -translate-y-8"></div>
                      
                      <div className="relative">
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mr-2">
                              <span className="text-white text-xs">📅</span>
          </div>
                            Start Date *
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={formData.startDate}
                              onChange={(e) => handleInputChange('startDate', e.target.value)}
                              className={`w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 border-gray-200 hover:border-purple-300 ${errors.startDate ? 'border-red-500 bg-red-50/80' : ''}`}
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
                          {errors.startDate && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <span className="w-4 h-4 mr-1">⚠️</span>
                              {errors.startDate}
                            </p>
            )}
          </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-8">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl mr-4">
                        <span className="text-white text-xl">📍</span>
          </div>
          <div>
                        <h2 className="text-2xl font-bold text-gray-900">Location</h2>
                        <p className="text-sm text-gray-600">Define the project location and coordinates</p>
          </div>
          </div>
                    
                    <div className="relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl p-8 border-2 border-emerald-200 shadow-2xl overflow-hidden">
                      {/* Decorative Background Elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200 to-green-200 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-200 to-emerald-200 rounded-full opacity-20 transform -translate-x-12 translate-y-12"></div>
                      <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-15 transform -translate-x-8 -translate-y-8"></div>
                      {/* Basic Location Information */}
                      <div className="relative mb-8">
                        <div className="flex items-center mb-6">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-sm">🌍</span>
          </div>
                          <h3 className="text-xl font-bold text-gray-900">Basic Location</h3>
          </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                              <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center mr-2">
                                <span className="text-white text-xs">📐</span>
                              </div>
                              Latitude
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={formData.latitude}
                                onChange={(e) => handleInputChange('latitude', e.target.value)}
                                className="w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 border-gray-200 hover:border-emerald-300"
                                placeholder="25.2048"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                          </div>
                          
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-teal-400 rounded-lg flex items-center justify-center mr-2">
                                <span className="text-white text-xs">📏</span>
                              </div>
                              Longitude
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={formData.longitude}
                                onChange={(e) => handleInputChange('longitude', e.target.value)}
                                className="w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 border-gray-200 hover:border-green-300"
                                placeholder="55.2708"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                          </div>
                          
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                              <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-lg flex items-center justify-center mr-2">
                                <span className="text-white text-xs">🗺️</span>
                              </div>
                              Region
                            </label>
                            <div className="relative">
                              <select
                                value={formData.region}
                                onChange={(e) => handleInputChange('region', e.target.value)}
                                className="w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 appearance-none cursor-pointer border-gray-200 hover:border-teal-300"
                              >
                                <option value="">Select region</option>
                                {regions.map(region => (
                                  <option key={region} value={region}>{region}</option>
                                ))}
                              </select>
                              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Property Details */}
                      <div className="relative mb-8">
                        <div className="flex items-center mb-6">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-sm">🏗️</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Property Details</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                              <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center mr-2">
                                <span className="text-white text-xs">🏠</span>
                              </div>
                              Plot Number
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={formData.plotNumber}
                                onChange={(e) => handleInputChange('plotNumber', e.target.value)}
                                className="w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 border-gray-200 hover:border-emerald-300"
                                placeholder="Enter plot number"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                          </div>
                          
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-teal-400 rounded-lg flex items-center justify-center mr-2">
                                <span className="text-white text-xs">🏘️</span>
                              </div>
                              Community
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={formData.community}
                                onChange={(e) => handleInputChange('community', e.target.value)}
                                className="w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 border-gray-200 hover:border-green-300"
                                placeholder="Enter community name"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                          </div>
                          
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                              <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-lg flex items-center justify-center mr-2">
                                <span className="text-white text-xs">🏢</span>
                              </div>
                              No. of Floors
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={formData.numberOfFloors}
                                onChange={(e) => handleInputChange('numberOfFloors', e.target.value)}
                                className="w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 border-gray-200 hover:border-teal-300"
                                placeholder="Enter number of floors"
                                min="1"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Authority & Community */}
                      <div className="relative mb-8">
                        <div className="flex items-center mb-6">
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-sm">🏛️</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Authority & Community</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="group">
                            <div className="flex items-center justify-between mb-3">
                              <label className="block text-sm font-semibold text-gray-800 flex items-center">
                                <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center mr-2">
                                  <span className="text-white text-xs">✅</span>
                                </div>
                                Authority Approval
                              </label>
          <button
            type="button"
                                onClick={() => setShowApprovalModal(true)}
                                className="flex items-center px-3 py-1 text-xs bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
                                <span className="mr-1">+</span>
                                Add Custom Status
          </button>
                            </div>
                            <div className="relative">
                              <select
                                value={formData.authorityApproval}
                                onChange={(e) => handleInputChange('authorityApproval', e.target.value)}
                                className="w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 appearance-none cursor-pointer border-gray-200 hover:border-emerald-300"
                              >
                                <option value="">Select approval status</option>
                                {approvalStatuses.map((status, index) => (
                                  <option key={index} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                            {approvalStatuses.length > 1 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {approvalStatuses.map((status, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200 shadow-sm"
                                  >
                                    {status}
          <button
                                      type="button"
                                      onClick={() => handleRemoveApprovalStatus(status)}
                                      className="ml-2 text-emerald-600 hover:text-red-500 transition-colors duration-200"
                                    >
                                      ×
          </button>
                                  </span>
                                ))}
        </div>
            )}
          </div>
                          
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-teal-400 rounded-lg flex items-center justify-center mr-2">
                                <span className="text-white text-xs">🏘️</span>
                              </div>
                              Developer Name
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={formData.devNumber}
                                onChange={(e) => handleInputChange('devNumber', e.target.value)}
                                className="w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 border-gray-200 hover:border-green-300"
                                placeholder="Enter developer name"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Interactive Map */}
                      <div className="relative">
                        <div className="flex items-center mb-6">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-sm">🗺️</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Interactive Map</h3>
                        </div>
                        <div className="relative group">
                          <GoogleMap
                            latitude={formData.latitude || 25.2048}
                            longitude={formData.longitude || 55.2708}
                            zoom={15}
                            onLocationChange={handleMapLocationChange}
                            plotNumber={formData.plotNumber}
                            className="w-full h-80 rounded-2xl border-2 border-emerald-200 shadow-2xl hover:shadow-3xl transition-all duration-300 transform group-hover:scale-105"
                          />
                          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl border border-emerald-200">
                            <div className="flex items-center mb-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center mr-2">
                                <span className="text-white text-xs">📍</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-800">Location Info</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">Plot:</span> {formData.plotNumber || 'Not specified'}
                            </p>
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Coords:</span> {formData.latitude || '25.2048'}, {formData.longitude || '55.2708'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 shadow-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-white text-sm">💡</span>
                            </div>
                            <p className="text-sm text-emerald-800">
                              <span className="font-semibold">Tip:</span> Click on the map or drag the marker to update the location coordinates.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                          <DocumentTextIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Financial Details</h2>
                          <p className="text-sm text-gray-600">Define contract fees and payment structure</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-lg space-y-6">

                      {/* Fees List */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Contract Fees</h3>
          <button
            type="button"
                            onClick={addFee}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Fee
          </button>
                        </div>

                        <div className="space-y-4">
                          {formData.fees.map((fee, index) => (
                            <div key={fee.id} className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-md font-semibold text-gray-800">Fee #{index + 1}</h4>
                                {formData.fees.length > 1 && (
          <button
                                    type="button"
                                    onClick={() => removeFee(fee.id)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <TrashIcon className="w-4 h-4" />
          </button>
                                )}
        </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fee Name
                                  </label>
                                  <input
                                    type="text"
                                    value={fee.name}
                                    onChange={(e) => handleFeeChange(fee.id, 'name', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    placeholder="Enter fee name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fee Type
                                  </label>
                                  <select
                                    value={fee.type}
                                    onChange={(e) => handleFeeChange(fee.id, 'type', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  >
                                    <option value="fixed">Fixed</option>
                                    <option value="percentage">Percentage</option>
                                    <option value="monthly">Monthly Collected</option>
                                    <option value="quarterly">Quarterly Collected</option>
                                  </select>
                                </div>
                              </div>

                              {/* Dynamic Input Fields Based on Fee Type */}
                              {fee.type === 'fixed' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Amount *
                                    </label>
                                    <input
                                      type="number"
                                      value={fee.amount}
                                      onChange={(e) => handleFeeChange(fee.id, 'amount', e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                      placeholder="Enter fixed amount"
                                    />
                                  </div>
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">
                                       Calculated Amount
                                     </label>
                                     <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700">
                                       ${calculateFeeAmount(fee).toLocaleString()}
                                     </div>
                                   </div>
                                 </div>
                                 
                               )}

                              {fee.type === 'percentage' && (
                                <div className="space-y-4 mb-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Square Feet Price *
                                      </label>
                                      <input
                                        type="number"
                                        value={fee.squareFeetPrice}
                                        onChange={(e) => handleFeeChange(fee.id, 'squareFeetPrice', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Price per sq ft"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Size in Square Feet *
                                      </label>
                                      <input
                                        type="number"
                                        value={fee.sizeInSquareFeet}
                                        onChange={(e) => handleFeeChange(fee.id, 'sizeInSquareFeet', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Total sq ft"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Profit Percentage *
                                      </label>
                                      <input
                                        type="number"
                                        value={fee.profitPercentage}
                                        onChange={(e) => handleFeeChange(fee.id, 'profitPercentage', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="e.g., 2"
                                        step="0.1"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Building Cost
                                      </label>
                                      <div className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl text-blue-700">
                                        ${((parseFloat(fee.squareFeetPrice) || 0) * (parseFloat(fee.sizeInSquareFeet) || 0)).toLocaleString()}
                                      </div>
                                    </div>
                                     <div>
                                       <label className="block text-sm font-medium text-gray-700 mb-2">
                                         Calculated Fee
                                       </label>
                                       <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700">
                                         ${calculateFeeAmount(fee).toLocaleString()}
                                       </div>
                                     </div>
                                   </div>
                                   
                                 </div>
                               )}

                              {fee.type === 'monthly' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Monthly Amount *
                                    </label>
                                    <input
                                      type="number"
                                      value={fee.amount}
                                      onChange={(e) => handleFeeChange(fee.id, 'amount', e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                      placeholder="Enter monthly amount"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Number of Months *
                                    </label>
                                    <input
                                      type="number"
                                      value={fee.months}
                                      onChange={(e) => handleFeeChange(fee.id, 'months', e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                      placeholder="e.g., 12"
                                      min="1"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Total Amount
                                    </label>
                                    <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700">
                                      ${calculateFeeAmount(fee).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {fee.type === 'quarterly' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Quarterly Amount *
                                    </label>
                                    <input
                                      type="number"
                                      value={fee.amount}
                                      onChange={(e) => handleFeeChange(fee.id, 'amount', e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                      placeholder="Enter quarterly amount"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Number of Quarters *
                                    </label>
                                    <input
                                      type="number"
                                      value={fee.quarters}
                                      onChange={(e) => handleFeeChange(fee.id, 'quarters', e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                      placeholder="e.g., 4"
                                      min="1"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Total Amount
                                    </label>
                                    <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700">
                                      ${calculateFeeAmount(fee).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Payment Period */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Within how much period would you pay this fee amount?
                                </label>
                                <select
                                  value={fee.paymentPeriod}
                                  onChange={(e) => handleFeeChange(fee.id, 'paymentPeriod', e.target.value)}
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                >
                                  <option value="One-Time">One-Time</option>
                                  <option value="Monthly">Monthly</option>
                                  <option value="Quarterly">Quarterly</option>
                                  <option value="Yearly">Yearly</option>
                                </select>
                              </div>

                              {/* Approximate Due Date */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Approximate Due Date *
                                </label>
                                <div className="relative">
                                  <input
                                    type="date"
                                    value={fee.dueDate}
                                    onChange={(e) => handleFeeChange(fee.id, 'dueDate', e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    min={new Date().toISOString().split('T')[0]}
                                  />
                                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                              </div>

                              {/* Payment Schedule Options */}
                              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                                <h5 className="text-sm font-semibold text-blue-800 mb-3">💳 Payment Schedule</h5>
                                
                                {/* Toggle between Standard and Custom Installments */}
                                <div className="mb-4">
                                  <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                      <input
                                        type="radio"
                                        name={`paymentType-${fee.id}`}
                                        checked={!fee.customInstallments}
                                        onChange={() => handleCustomInstallmentsToggle(fee.id, false)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                      />
                                      <span className="ml-2 text-sm text-gray-700">Standard Schedule</span>
                                    </label>
                                    <label className="flex items-center">
                                      <input
                                        type="radio"
                                        name={`paymentType-${fee.id}`}
                                        checked={fee.customInstallments}
                                        onChange={() => handleCustomInstallmentsToggle(fee.id, true)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                      />
                                      <span className="ml-2 text-sm text-gray-700">Custom Installments</span>
                                    </label>
                                  </div>
                                </div>

                                {!fee.customInstallments ? (
                                  /* Standard Payment Schedule */
                                  (() => {
                                    const installmentInfo = calculateInstallmentInfo(fee);
                                    return (
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                                          <span className="text-blue-700 font-medium block mb-1">Total Amount</span>
                                          <p className="text-blue-900 font-bold text-lg">${(installmentInfo.numberOfInstallments * installmentInfo.installmentAmount).toLocaleString()}</p>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                                          <span className="text-blue-700 font-medium block mb-1">Installments</span>
                                          <p className="text-blue-900 font-bold text-lg">{installmentInfo.numberOfInstallments} × {installmentInfo.period}</p>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                                          <span className="text-blue-700 font-medium block mb-1">Per Installment</span>
                                          <p className="text-blue-900 font-bold text-lg">${installmentInfo.installmentAmount.toLocaleString()}</p>
      </div>
    </div>
  );
                                  })()
                                ) : (
                                  /* Custom Installments */
                                  <div className="space-y-4">
                                    {/* Number of Installments Input */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of Installments
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={fee.numberOfInstallments}
                                        onChange={(e) => handleNumberOfInstallmentsChange(fee.id, e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Enter number of installments"
                                      />
                                    </div>

                                    {/* Installments List */}
                                    <div className="space-y-3">
                                      <h6 className="text-sm font-semibold text-gray-800">Installment Details</h6>
                                      {fee.installments.map((installment) => (
                                        <div key={installment.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Installment #{installment.installmentNumber}
                                              </label>
                                              <div className="text-sm font-semibold text-gray-800">
                                                {installment.installmentNumber}
                                              </div>
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Amount *
                                              </label>
                                              <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={installment.amount}
                                                onChange={(e) => handleInstallmentAmountChange(fee.id, installment.id, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                placeholder="0.00"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Approximate Due Date *
                                              </label>
                                              <input
                                                type="date"
                                                value={installment.dueDate}
                                                onChange={(e) => handleInstallmentDueDateChange(fee.id, installment.id, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                min={new Date().toISOString().split('T')[0]}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Total Validation */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-green-800">Total Installments:</span>
                                        <span className="text-lg font-bold text-green-900">
                                          ${calculateInstallmentTotal(fee.installments).toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center mt-1">
                                        <span className="text-sm font-medium text-green-800">Calculated Amount:</span>
                                        <span className="text-lg font-bold text-green-900">
                                          ${fee.calculatedAmount.toLocaleString()}
                                        </span>
                                      </div>
                                      {Math.abs(calculateInstallmentTotal(fee.installments) - fee.calculatedAmount) > 0.01 && (
                                        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                                          ⚠️ Installment total doesn't match calculated amount. Please adjust installment amounts.
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Generate Invoice */}
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`generateInvoice-${fee.id}`}
                                  checked={fee.generateInvoice}
                                  onChange={(e) => handleFeeChange(fee.id, 'generateInvoice', e.target.checked)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`generateInvoice-${fee.id}`} className="ml-2 text-sm text-gray-700">
                                  Generate Invoice
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Description & Attachments */}
                  <div className="mb-8">
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mr-4">
                        <span className="text-white text-xl">📝</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Description & Attachments</h2>
                        <p className="text-sm text-gray-600">Add detailed description and supporting documents</p>
                      </div>
                    </div>
                    
                    <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-indigo-200 shadow-2xl overflow-hidden">
                      {/* Decorative Background Elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200 to-indigo-200 rounded-full opacity-20 transform -translate-x-12 translate-y-12"></div>
                      <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full opacity-15 transform -translate-x-8 -translate-y-8"></div>
                      
                      {/* Description Section */}
                      <div className="relative mb-8">
                        <div className="flex items-center mb-6">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-sm">📄</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Description</h3>
                        </div>
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center mr-2">
                              <span className="text-white text-xs">✍️</span>
                            </div>
                            Contract Description
                          </label>
                          <div className="relative">
                            <textarea
                              value={formData.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              rows={6}
                              className="w-full px-6 py-4 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 resize-none border-gray-200 hover:border-indigo-300"
                              placeholder="Enter detailed contract description..."
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                        </div>
                      </div>
                    
                      {/* Attachments Section */}
                      <div className="relative">
                        <div className="flex items-center mb-6">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-sm">📎</span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Attachments</h3>
                        </div>
                        
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center mr-2">
                              <span className="text-white text-xs">📁</span>
                            </div>
                            Upload Files
                          </label>
                          
                          <div className="relative border-2 border-dashed border-purple-300 rounded-2xl p-8 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group-hover:border-purple-400">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <span className="text-white text-2xl">📎</span>
                              </div>
                              <div className="flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => setShowUploadModal(true)}
                                  className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                  <span className="mr-2">📤</span>
                                  <span className="font-semibold">Upload files</span>
                                </button>
                              </div>
                              <p className="mt-4 text-sm text-gray-600">
                                <span className="font-medium">Drag and drop files here, or click to select</span>
                              </p>
                              <p className="mt-2 text-xs text-gray-500">
                                Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB each)
                              </p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* File List */}
                      {formData.attachments.length > 0 && (
                        <div className="mt-8">
                          <div className="flex items-center mb-4">
                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center mr-2">
                              <span className="text-white text-xs">📋</span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">Uploaded Files</h4>
                            <span className="ml-2 px-2 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-xs font-semibold rounded-full">
                              {formData.attachments.length} file{formData.attachments.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {formData.attachments.map((file, index) => (
                              <div key={index} className="group flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center mr-3 shadow-md">
                                    <span className="text-white text-sm">📄</span>
                                  </div>
                                  <div>
                                    <span className="text-sm font-semibold text-gray-900 block">{file.name}</span>
                                    <span className="text-xs text-gray-500">
                                      {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeAttachment(index)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-110"
                                  title="Remove file"
                                >
                                  <XMarkIcon className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200">
          <button
            type="button"
                      onClick={() => handleSubmit(true)}
                      disabled={isSubmitting}
                      className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm hover:shadow-md"
          >
                      {isSubmitting ? 'Saving...' : 'Save as Draft'}
          </button>
                    
          <button
            type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-5 h-5 mr-3" />
                          Submit Contract
                        </>
                      )}
          </button>
        </div>
                </form>
      </div>
    </div>
          </div>
        </main>
      </div>

      {/* New Client Modal */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                    <PlusIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Add New Client</h3>
                    <p className="text-sm text-gray-600">Create a new client for this contract</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewClientModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => handleNewClientChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter client name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => handleNewClientChange('email', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => handleNewClientChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Type
                  </label>
                  <select
                    value={newClient.type}
                    onChange={(e) => handleNewClientChange('type', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  >
                    <option value="Person">Person</option>
                    <option value="Company">Company</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowNewClientModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewClientSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Approval Status Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                    <PlusIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Add Custom Approval Status</h3>
                    <p className="text-sm text-gray-600">Create a new authority approval status</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setNewApprovalStatus('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Status Name *
                  </label>
                  <input
                    type="text"
                    value={newApprovalStatus}
                    onChange={(e) => setNewApprovalStatus(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., Dubai Municipality Approval"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddApprovalStatus();
                      }
                    }}
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">💡 Examples:</span> Dubai Municipality Approval, RTA Approval, DEWA Approval, Civil Defense Approval
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setNewApprovalStatus('');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddApprovalStatus}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Project Type Modal */}
      {showCustomProjectTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Add Custom Project Type</h3>
                  <p className="text-sm text-gray-600 mt-1">Create a new project type with custom phases</p>
                </div>
                <button
                  onClick={() => {
                    setShowCustomProjectTypeModal(false);
                    setNewProjectType({
                      name: '',
                      description: '',
                      phases: [{ name: '', nameAr: '' }]
                    });
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Project Type Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type Name *
                  </label>
                  <input
                    type="text"
                    value={newProjectType.name}
                    onChange={(e) => handleCustomProjectTypeChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="e.g., Renovation Project, New Construction"
                  />
                </div>

                {/* Project Type Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newProjectType.description}
                    onChange={(e) => handleCustomProjectTypeChange('description', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    rows="3"
                    placeholder="Describe what this project type involves..."
                  />
                </div>

                {/* Contract Agreement */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Contract Agreement
                    </label>
                    <button
                      type="button"
                      onClick={addPhase}
                      className="flex items-center px-3 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add Phase
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {newProjectType.phases.map((phase, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={phase.name}
                            onChange={(e) => handlePhaseChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Phase name (e.g., Planning, Design, Construction)"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={phase.nameAr}
                            onChange={(e) => handlePhaseChange(index, 'nameAr', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Arabic name (optional)"
                          />
                        </div>
                        {newProjectType.phases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePhase(index)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800">
                    <span className="font-medium">💡 Tip:</span> Add phases that are specific to your custom project type. These will be available for selection when this project type is chosen.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCustomProjectTypeModal(false);
                    setNewProjectType({
                      name: '',
                      description: '',
                      phases: [{ name: '', nameAr: '' }]
                    });
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomProjectType}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add Project Type
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Phase Modal */}
      {showCustomPhaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Add Custom Phase</h3>
                  <p className="text-sm text-gray-600">Create a new phase for your contract</p>
                </div>
                <button
                  onClick={() => setShowCustomPhaseModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Phase Name *
                  </label>
                  <input
                    type="text"
                    value={newPhase.name}
                    onChange={(e) => handleCustomPhaseChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter phase name (e.g., Site Preparation)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Phase Description *
                  </label>
                  <textarea
                    value={newPhase.description}
                    onChange={(e) => handleCustomPhaseChange('description', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Describe what this phase involves..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCustomPhaseModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomPhase}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add Phase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Documents Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Upload Documents</h3>
                  <p className="text-sm text-gray-600">Upload and manage your contract documents</p>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Step 1: File Upload */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Step 1: Drag and drop files in the area below OR click Upload File button</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <span className="text-white text-2xl">📁</span>
                        </div>
                        <p className="text-gray-600 mb-4">Drop files here</p>
                        <p className="text-sm text-gray-500 mb-4">The total size of all uploaded files should not exceed 1000 MB.</p>
                        <label className="cursor-pointer">
                          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                            <span className="mr-2">+</span>
                            Upload a File
                          </div>
                          <input
                            type="file"
                            multiple
                            onChange={handleModalFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="text-center">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Continue to Review ({uploadedFiles.length} files)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Review and Manage */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Step 2: Review and manage uploaded documents</h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">File Name</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">System Ref #</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Document Title</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Document Category</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Size</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Uploaded On</th>
                          <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedFiles.map((file) => (
                          <tr key={file.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-4 py-3 text-sm">{file.name}</td>
                            <td className="border border-gray-200 px-4 py-3 text-sm font-mono">{file.systemRef}</td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">{file.name}</td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">
                              <select
                                value={file.category}
                                onChange={(e) => updateFileCategory(file.id, e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                              >
                                <option value="General">General</option>
                                <option value="Contract">Contract</option>
                                <option value="Invoice">Invoice</option>
                                <option value="Legal">Legal</option>
                                <option value="Technical">Technical</option>
                              </select>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">{(file.size / 1024).toFixed(2)} KB</td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">{file.uploadedOn}</td>
                            <td className="border border-gray-200 px-4 py-3 text-sm">
                              <button
                                onClick={() => removeUploadedFile(file.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Remove file"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                    >
                      Back to Upload
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Continue to Done
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Done */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Step 3: Click Done when you are finished</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Depending on your connection speed and the size of the files you are uploading, this operation may take anywhere from 10 seconds to 20 minutes. Please be patient and do not click "Done" repeatedly.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-blue-800 font-medium">
                        {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} ready to upload
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                    >
                      Back to Review
                    </button>
                    <button
                      onClick={handleUploadDone}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateContract;