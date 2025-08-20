// Dummy data for Jira-like project table
export const initialProjects = [
  {
    id: '1',
    projectName: 'Residential Complex Alpha',
    referenceNumber: 'REF-001',
    status: 'In Progress',
    owner: 'John Smith',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    planDays: 165,
    remarks: 'High priority residential project',
    assigneeNotes: 'Foundation work completed. Moving to structural phase.',
    attachments: [
      { name: 'blueprint.pdf', size: '2.3MB' },
      { name: 'site-survey.docx', size: '1.1MB' }
    ],
    priority: 'High',
    location: 'Downtown District',
    plotNumber: 'PL-2024-001',
    community: 'Green Valley',
    projectType: 'Residential',
    projectFloor: 15,
    developer: 'Alpha Developers Ltd',
    predecessor: '',
    communityChecklist: [
      { id: 1, text: 'Community approval', completed: true },
      { id: 2, text: 'Environmental impact assessment', completed: true },
      { id: 3, text: 'Traffic study', completed: false },
      { id: 4, text: 'Public consultation', completed: false }
    ],
    checklist: [
      { id: 1, text: 'Site survey completed', completed: true },
      { id: 2, text: 'Permits obtained', completed: true },
      { id: 3, text: 'Foundation work', completed: true },
      { id: 4, text: 'Structural framework', completed: false },
      { id: 5, text: 'Interior finishing', completed: false }
    ],
    link: 'https://project-alpha.com',
    rating: 4,
    progress: 35,
    colorIndicator: '#3B82F6',
    subtasks: [
      {
        id: '1-1',
        projectName: 'Foundation Work',
        referenceNumber: 'REF-001-01',
        status: 'Done',
        owner: 'Mike Johnson',
        startDate: '2024-01-15',
        endDate: '2024-02-28',
        planDays: 45,
        remarks: 'Foundation completed ahead of schedule',
        assigneeNotes: 'All foundation work completed successfully',
        attachments: [{ name: 'foundation-report.pdf', size: '0.8MB' }],
        priority: 'High',
        location: 'Downtown District',
        plotNumber: 'PL-2024-001',
        community: 'Green Valley',
        projectType: 'Residential',
        projectFloor: 1,
        developer: 'Alpha Developers Ltd',
        predecessor: 'REF-001',
        communityChecklist: [
          { id: 1, text: 'Foundation inspection', completed: true },
          { id: 2, text: 'Safety compliance', completed: true }
        ],
        checklist: [
          { id: 1, text: 'Excavation', completed: true },
          { id: 2, text: 'Reinforcement', completed: true },
          { id: 3, text: 'Concrete pouring', completed: true }
        ],
        link: 'https://project-alpha.com/foundation',
        rating: 5,
        progress: 100,
        colorIndicator: '#10B981'
      },
      {
        id: '1-2',
        projectName: 'Structural Framework',
        referenceNumber: 'REF-001-02',
        status: 'In Progress',
        owner: 'Sarah Wilson',
        startDate: '2024-03-01',
        endDate: '2024-04-30',
        planDays: 60,
        remarks: 'Steel framework installation in progress',
        assigneeNotes: '50% of structural work completed',
        attachments: [{ name: 'structural-plan.pdf', size: '3.2MB' }],
        priority: 'High',
        location: 'Downtown District',
        plotNumber: 'PL-2024-001',
        community: 'Green Valley',
        projectType: 'Residential',
        projectFloor: 15,
        developer: 'Alpha Developers Ltd',
        predecessor: 'REF-001-01',
        communityChecklist: [
          { id: 1, text: 'Structural inspection', completed: true },
          { id: 2, text: 'Building code compliance', completed: false }
        ],
        checklist: [
          { id: 1, text: 'Steel beams installation', completed: true },
          { id: 2, text: 'Column erection', completed: true },
          { id: 3, text: 'Floor slabs', completed: false },
          { id: 4, text: 'Roof structure', completed: false }
        ],
        link: 'https://project-alpha.com/structural',
        rating: 4,
        progress: 50,
        colorIndicator: '#F59E0B'
      }
    ]
  },
  {
    id: '2',
    projectName: 'Commercial Plaza Beta',
    referenceNumber: 'REF-002',
    status: 'To Do',
    owner: 'Emily Davis',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    planDays: 305,
    remarks: 'Large commercial development project',
    assigneeNotes: 'Planning phase completed. Ready to start construction.',
    attachments: [
      { name: 'commercial-plan.pdf', size: '4.1MB' },
      { name: 'financial-analysis.xlsx', size: '0.9MB' }
    ],
    priority: 'Medium',
    location: 'Business District',
    plotNumber: 'PL-2024-002',
    community: 'Central Business',
    projectType: 'Commercial',
    projectFloor: 25,
    developer: 'Beta Properties Inc',
    predecessor: 'REF-001',
    communityChecklist: [
      { id: 1, text: 'Business district approval', completed: true },
      { id: 2, text: 'Economic impact study', completed: true },
      { id: 3, text: 'Parking requirements', completed: false }
    ],
    checklist: [
      { id: 1, text: 'Site planning', completed: true },
      { id: 2, text: 'Financial approval', completed: true },
      { id: 3, text: 'Construction permits', completed: false },
      { id: 4, text: 'Foundation work', completed: false },
      { id: 5, text: 'Building construction', completed: false }
    ],
    link: 'https://project-beta.com',
    rating: 3,
    progress: 15,
    colorIndicator: '#6B7280'
  },
  {
    id: '3',
    projectName: 'Luxury Hotel Gamma',
    referenceNumber: 'REF-003',
    status: 'Done',
    owner: 'David Brown',
    startDate: '2023-06-01',
    endDate: '2024-01-31',
    planDays: 245,
    remarks: '5-star luxury hotel project completed successfully',
    assigneeNotes: 'Project completed on time and within budget.',
    attachments: [
      { name: 'hotel-design.pdf', size: '5.2MB' },
      { name: 'completion-certificate.pdf', size: '0.5MB' }
    ],
    priority: 'High',
    location: 'Tourist District',
    plotNumber: 'PL-2023-003',
    community: 'Seaside Resort',
    projectType: 'Hospitality',
    projectFloor: 20,
    developer: 'Gamma Hospitality Group',
    predecessor: 'REF-002',
    communityChecklist: [
      { id: 1, text: 'Tourism board approval', completed: true },
      { id: 2, text: 'Environmental compliance', completed: true },
      { id: 3, text: 'Local business impact', completed: true }
    ],
    checklist: [
      { id: 1, text: 'Design approval', completed: true },
      { id: 2, text: 'Construction permits', completed: true },
      { id: 3, text: 'Foundation work', completed: true },
      { id: 4, text: 'Building construction', completed: true },
      { id: 5, text: 'Interior finishing', completed: true },
      { id: 6, text: 'Final inspection', completed: true }
    ],
    link: 'https://project-gamma.com',
    rating: 5,
    progress: 100,
    colorIndicator: '#10B981'
  },
  {
    id: '4',
    projectName: 'Shopping Mall Delta',
    referenceNumber: 'REF-004',
    status: 'In Progress',
    owner: 'Lisa Anderson',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    planDays: 303,
    remarks: 'Modern shopping mall with entertainment facilities',
    assigneeNotes: 'Structural work 60% complete. Starting interior work.',
    attachments: [
      { name: 'mall-design.pdf', size: '3.8MB' },
      { name: 'tenant-agreements.pdf', size: '2.1MB' }
    ],
    priority: 'Medium',
    location: 'Suburban Area',
    plotNumber: 'PL-2024-004',
    community: 'Suburban Heights',
    projectType: 'Retail',
    projectFloor: 3,
    developer: 'Delta Retail Corp',
    predecessor: 'REF-003',
    communityChecklist: [
      { id: 1, text: 'Community shopping needs', completed: true },
      { id: 2, text: 'Traffic impact assessment', completed: true },
      { id: 3, text: 'Local business consultation', completed: false }
    ],
    checklist: [
      { id: 1, text: 'Site preparation', completed: true },
      { id: 2, text: 'Foundation work', completed: true },
      { id: 3, text: 'Structural framework', completed: true },
      { id: 4, text: 'Roof installation', completed: false },
      { id: 5, text: 'Interior finishing', completed: false }
    ],
    link: 'https://project-delta.com',
    rating: 4,
    progress: 60,
    colorIndicator: '#F59E0B'
  },
  {
    id: '5',
    projectName: 'Office Tower Epsilon',
    referenceNumber: 'REF-005',
    status: 'To Do',
    owner: 'Robert Taylor',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    planDays: 365,
    remarks: 'Modern office tower with smart building features',
    assigneeNotes: 'Design phase in progress. Construction to start soon.',
    attachments: [
      { name: 'tower-design.pdf', size: '6.5MB' },
      { name: 'smart-features.pdf', size: '1.8MB' }
    ],
    priority: 'High',
    location: 'Financial District',
    plotNumber: 'PL-2024-005',
    community: 'Financial Center',
    projectType: 'Office',
    projectFloor: 40,
    developer: 'Epsilon Properties Ltd',
    predecessor: 'REF-004',
    communityChecklist: [
      { id: 1, text: 'Financial district zoning', completed: true },
      { id: 2, text: 'Smart city integration', completed: true },
      { id: 3, text: 'Energy efficiency standards', completed: false }
    ],
    checklist: [
      { id: 1, text: 'Design approval', completed: true },
      { id: 2, text: 'Financial planning', completed: true },
      { id: 3, text: 'Permit application', completed: false },
      { id: 4, text: 'Site preparation', completed: false },
      { id: 5, text: 'Foundation work', completed: false }
    ],
    link: 'https://project-epsilon.com',
    rating: 3,
    progress: 10,
    colorIndicator: '#6B7280'
  },
  {
    id: '6',
    projectName: 'Residential Complex Zeta',
    referenceNumber: 'REF-006',
    status: 'In Progress',
    owner: 'Jennifer Martinez',
    startDate: '2024-01-01',
    endDate: '2024-08-31',
    planDays: 243,
    remarks: 'Affordable housing complex with modern amenities',
    assigneeNotes: 'Foundation work completed. Starting structural phase.',
    attachments: [
      { name: 'housing-plan.pdf', size: '2.9MB' },
      { name: 'amenities-list.pdf', size: '0.7MB' }
    ],
    priority: 'Medium',
    location: 'Residential Area',
    plotNumber: 'PL-2024-006',
    community: 'Family Heights',
    projectType: 'Residential',
    projectFloor: 12,
    developer: 'Zeta Housing Corp',
    predecessor: 'REF-005',
    communityChecklist: [
      { id: 1, text: 'Affordable housing approval', completed: true },
      { id: 2, text: 'Community amenities planning', completed: true },
      { id: 3, text: 'School district coordination', completed: false }
    ],
    checklist: [
      { id: 1, text: 'Site survey', completed: true },
      { id: 2, text: 'Foundation work', completed: true },
      { id: 3, text: 'Structural framework', completed: false },
      { id: 4, text: 'Interior finishing', completed: false },
      { id: 5, text: 'Amenities installation', completed: false }
    ],
    link: 'https://project-zeta.com',
    rating: 4,
    progress: 40,
    colorIndicator: '#F59E0B'
  },
  {
    id: '7',
    projectName: 'Industrial Park Eta',
    referenceNumber: 'REF-007',
    status: 'Done',
    owner: 'Michael Wilson',
    startDate: '2023-09-01',
    endDate: '2024-02-28',
    planDays: 181,
    remarks: 'Modern industrial park with advanced facilities',
    assigneeNotes: 'Project completed successfully. All facilities operational.',
    attachments: [
      { name: 'industrial-design.pdf', size: '4.7MB' },
      { name: 'facility-manual.pdf', size: '1.2MB' }
    ],
    priority: 'High',
    location: 'Industrial Zone',
    plotNumber: 'PL-2023-007',
    community: 'Industrial District',
    projectType: 'Industrial',
    projectFloor: 2,
    developer: 'Eta Industrial Group',
    predecessor: 'REF-006',
    communityChecklist: [
      { id: 1, text: 'Industrial zoning approval', completed: true },
      { id: 2, text: 'Environmental impact study', completed: true },
      { id: 3, text: 'Job creation assessment', completed: true }
    ],
    checklist: [
      { id: 1, text: 'Site preparation', completed: true },
      { id: 2, text: 'Building construction', completed: true },
      { id: 3, text: 'Equipment installation', completed: true },
      { id: 4, text: 'Testing and commissioning', completed: true },
      { id: 5, text: 'Final handover', completed: true }
    ],
    link: 'https://project-eta.com',
    rating: 5,
    progress: 100,
    colorIndicator: '#10B981'
  },
  {
    id: '8',
    projectName: 'Sports Complex Theta',
    referenceNumber: 'REF-008',
    status: 'To Do',
    owner: 'Amanda Johnson',
    startDate: '2024-05-01',
    endDate: '2025-02-28',
    planDays: 304,
    remarks: 'Multi-sport complex with Olympic-standard facilities',
    assigneeNotes: 'Design phase completed. Construction planning in progress.',
    attachments: [
      { name: 'sports-design.pdf', size: '5.8MB' },
      { name: 'facility-specs.pdf', size: '2.3MB' }
    ],
    priority: 'Medium',
    location: 'Sports District',
    plotNumber: 'PL-2024-008',
    community: 'Sports Valley',
    projectType: 'Sports',
    projectFloor: 1,
    developer: 'Theta Sports Corp',
    predecessor: 'REF-007',
    communityChecklist: [
      { id: 1, text: 'Sports facility needs assessment', completed: true },
      { id: 2, text: 'Community sports programs', completed: true },
      { id: 3, text: 'Athletic association approval', completed: false }
    ],
    checklist: [
      { id: 1, text: 'Design approval', completed: true },
      { id: 2, text: 'Site planning', completed: true },
      { id: 3, text: 'Permit application', completed: false },
      { id: 4, text: 'Construction start', completed: false },
      { id: 5, text: 'Facility completion', completed: false }
    ],
    link: 'https://project-theta.com',
    rating: 3,
    progress: 15,
    colorIndicator: '#6B7280'
  },
  {
    id: '9',
    projectName: 'Medical Center Iota',
    referenceNumber: 'REF-009',
    status: 'In Progress',
    owner: 'Dr. Sarah Chen',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    planDays: 306,
    remarks: 'State-of-the-art medical center with advanced equipment',
    assigneeNotes: 'Structural work 70% complete. Starting medical equipment installation.',
    attachments: [
      { name: 'medical-design.pdf', size: '7.2MB' },
      { name: 'equipment-list.pdf', size: '1.5MB' }
    ],
    priority: 'High',
    location: 'Medical District',
    plotNumber: 'PL-2024-009',
    community: 'Health Valley',
    projectType: 'Healthcare',
    projectFloor: 8,
    developer: 'Iota Healthcare Ltd',
    predecessor: 'REF-008',
    communityChecklist: [
      { id: 1, text: 'Healthcare facility approval', completed: true },
      { id: 2, text: 'Medical equipment planning', completed: true },
      { id: 3, text: 'Emergency services coordination', completed: false }
    ],
    checklist: [
      { id: 1, text: 'Site preparation', completed: true },
      { id: 2, text: 'Foundation work', completed: true },
      { id: 3, text: 'Structural framework', completed: true },
      { id: 4, text: 'Medical equipment', completed: false },
      { id: 5, text: 'Final inspection', completed: false }
    ],
    link: 'https://project-iota.com',
    rating: 4,
    progress: 70,
    colorIndicator: '#F59E0B'
  },
  {
    id: '10',
    projectName: 'Educational Campus Kappa',
    referenceNumber: 'REF-010',
    status: 'To Do',
    owner: 'Professor James Lee',
    startDate: '2024-06-01',
    endDate: '2025-05-31',
    planDays: 365,
    remarks: 'Modern educational campus with research facilities',
    assigneeNotes: 'Planning phase in progress. Construction to start soon.',
    attachments: [
      { name: 'campus-design.pdf', size: '8.1MB' },
      { name: 'research-facilities.pdf', size: '2.8MB' }
    ],
    priority: 'Medium',
    location: 'Educational District',
    plotNumber: 'PL-2024-010',
    community: 'Knowledge Park',
    projectType: 'Education',
    projectFloor: 6,
    developer: 'Kappa Education Corp',
    predecessor: 'REF-009',
    communityChecklist: [
      { id: 1, text: 'Educational facility approval', completed: true },
      { id: 2, text: 'Research collaboration planning', completed: true },
      { id: 3, text: 'Student housing coordination', completed: false }
    ],
    checklist: [
      { id: 1, text: 'Design approval', completed: true },
      { id: 2, text: 'Financial planning', completed: true },
      { id: 3, text: 'Site preparation', completed: false },
      { id: 4, text: 'Building construction', completed: false },
      { id: 5, text: 'Equipment installation', completed: false }
    ],
    link: 'https://project-kappa.com',
    rating: 3,
    progress: 10,
    colorIndicator: '#6B7280'
  }
];

// Column definitions
export const columnDefinitions = [
  { key: 'checkbox', label: '', type: 'checkbox', width: 50, sortable: false },
  { key: 'projectName', label: 'Project Name', type: 'text', width: 200, sortable: true },
  { key: 'referenceNumber', label: 'Reference Number', type: 'text', width: 150, sortable: true },
  { key: 'status', label: 'Status', type: 'dropdown', width: 120, sortable: true, options: ['To Do', 'In Progress', 'Done'] },
  { key: 'owner', label: 'Owner', type: 'person', width: 150, sortable: true },
  { key: 'startDate', label: 'Start Date', type: 'date', width: 120, sortable: true },
  { key: 'endDate', label: 'End Date', type: 'date', width: 120, sortable: true },
  { key: 'planDays', label: 'Plan Days', type: 'number', width: 100, sortable: true },
  { key: 'remarks', label: 'Remarks', type: 'text', width: 200, sortable: false },
  { key: 'assigneeNotes', label: 'Assignee Notes', type: 'textarea', width: 250, sortable: false },
  { key: 'attachments', label: 'Attachments', type: 'file', width: 120, sortable: false },
  { key: 'priority', label: 'Priority', type: 'dropdown', width: 100, sortable: true, options: ['Low', 'Medium', 'High'] },
  { key: 'location', label: 'Location', type: 'text', width: 150, sortable: true },
  { key: 'plotNumber', label: 'Plot Number', type: 'text', width: 120, sortable: true },
  { key: 'community', label: 'Community', type: 'text', width: 150, sortable: true },
  { key: 'projectType', label: 'Project Type', type: 'dropdown', width: 120, sortable: true, options: ['Residential', 'Commercial', 'Hospitality', 'Industrial', 'Retail', 'Office', 'Sports', 'Healthcare', 'Education'] },
  { key: 'projectFloor', label: 'Project Floor', type: 'number', width: 100, sortable: true },
  { key: 'developer', label: 'Developer', type: 'text', width: 180, sortable: true },
  { key: 'predecessor', label: 'Predecessor', type: 'dropdown', width: 150, sortable: true, options: [] },
  { key: 'communityChecklist', label: 'Community Checklist', type: 'checklist', width: 200, sortable: false },
  { key: 'checklist', label: 'Checklist', type: 'checklist', width: 150, sortable: false },
  { key: 'link', label: 'Link', type: 'url', width: 120, sortable: false },
  { key: 'rating', label: 'Rating', type: 'rating', width: 100, sortable: true },
  { key: 'progress', label: 'Progress', type: 'progress', width: 120, sortable: true },
  { key: 'colorIndicator', label: 'Color', type: 'color', width: 80, sortable: false }
];

// Sample data for auto-suggestions
export const autoSuggestData = {
  owners: ['John Smith', 'Emily Davis', 'David Brown', 'Mike Johnson', 'Sarah Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez', 'Michael Wilson', 'Amanda Johnson', 'Dr. Sarah Chen', 'Professor James Lee'],
  developers: ['Alpha Developers Ltd', 'Beta Properties Inc', 'Gamma Hospitality Group', 'Delta Retail Corp', 'Epsilon Properties Ltd', 'Zeta Housing Corp', 'Eta Industrial Group', 'Theta Sports Corp', 'Iota Healthcare Ltd', 'Kappa Education Corp'],
  locations: ['Downtown District', 'Business District', 'Tourist District', 'Residential Area', 'Industrial Zone', 'Suburban Area', 'Financial District', 'Medical District', 'Sports District', 'Educational District'],
  communities: ['Green Valley', 'Central Business', 'Seaside Resort', 'Suburban Heights', 'Financial Center', 'Family Heights', 'Industrial District', 'Sports Valley', 'Health Valley', 'Knowledge Park']
};

