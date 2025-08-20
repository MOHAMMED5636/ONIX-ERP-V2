// Dummy data for Jira-like project table
export const initialProjects = [
  {
    id: '1',
    projectName: 'Residential Complex Alpha',
    referenceNumber: 'REF-001',
    status: 'In Progress',
    owner: 'John Smith',
    timeline: { startDate: '2024-01-15', endDate: '2024-06-30' },
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
    projectAutoPredecessor: 'REF-000',
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
        timeline: { startDate: '2024-01-15', endDate: '2024-02-28' },
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
        projectAutoPredecessor: 'REF-001',
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
        timeline: { startDate: '2024-03-01', endDate: '2024-04-30' },
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
        projectAutoPredecessor: 'REF-001-01',
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
    timeline: { startDate: '2024-03-01', endDate: '2024-12-31' },
    planDays: 305,
    remarks: 'New commercial development project',
    assigneeNotes: 'Project planning phase. Awaiting final approval.',
    attachments: [
      { name: 'commercial-plan.pdf', size: '4.1MB' },
      { name: 'market-analysis.xlsx', size: '0.9MB' }
    ],
    priority: 'Medium',
    location: 'Business District',
    plotNumber: 'PL-2024-002',
    community: 'Central Business',
    projectType: 'Commercial',
    projectFloor: 8,
    developer: 'Beta Properties Inc',
    projectAutoPredecessor: 'REF-001',
    checklist: [
      { id: 1, text: 'Market research', completed: true },
      { id: 2, text: 'Site selection', completed: true },
      { id: 3, text: 'Design approval', completed: false },
      { id: 4, text: 'Permit application', completed: false },
      { id: 5, text: 'Construction start', completed: false }
    ],
    link: 'https://plaza-beta.com',
    rating: 3,
    progress: 15,
    colorIndicator: '#6B7280',
    subtasks: []
  },
  {
    id: '3',
    projectName: 'Luxury Hotel Gamma',
    referenceNumber: 'REF-003',
    status: 'Done',
    owner: 'David Brown',
    timeline: { startDate: '2023-06-01', endDate: '2024-01-31' },
    planDays: 245,
    remarks: 'Completed luxury hotel project',
    assigneeNotes: 'Project completed successfully. Hotel is operational.',
    attachments: [
      { name: 'final-inspection.pdf', size: '1.8MB' },
      { name: 'certificate.pdf', size: '0.5MB' }
    ],
    priority: 'High',
    location: 'Tourist District',
    plotNumber: 'PL-2023-003',
    community: 'Tourist Hub',
    projectType: 'Hospitality',
    projectFloor: 12,
    developer: 'Gamma Hospitality Group',
    projectAutoPredecessor: 'REF-002',
    checklist: [
      { id: 1, text: 'Design and planning', completed: true },
      { id: 2, text: 'Construction', completed: true },
      { id: 3, text: 'Interior design', completed: true },
      { id: 4, text: 'Furnishing', completed: true },
      { id: 5, text: 'Final inspection', completed: true },
      { id: 6, text: 'Opening ceremony', completed: true }
    ],
    link: 'https://hotel-gamma.com',
    rating: 5,
    progress: 100,
    colorIndicator: '#10B981',
    subtasks: []
  }
];

// Column definitions
export const columnDefinitions = [
  { key: 'projectName', label: 'Project Name', type: 'text', width: 200, sortable: true },
  { key: 'referenceNumber', label: 'Reference Number', type: 'text', width: 150, sortable: true },
  { key: 'status', label: 'Status', type: 'dropdown', width: 120, sortable: true, options: ['To Do', 'In Progress', 'Done'] },
  { key: 'owner', label: 'Owner', type: 'person', width: 150, sortable: true },
  { key: 'timeline', label: 'Timeline', type: 'daterange', width: 180, sortable: true },
  { key: 'planDays', label: 'Plan Days', type: 'number', width: 100, sortable: true },
  { key: 'remarks', label: 'Remarks', type: 'text', width: 200, sortable: false },
  { key: 'assigneeNotes', label: 'Assignee Notes', type: 'textarea', width: 250, sortable: false },
  { key: 'attachments', label: 'Attachments', type: 'file', width: 120, sortable: false },
  { key: 'priority', label: 'Priority', type: 'dropdown', width: 100, sortable: true, options: ['Low', 'Medium', 'High'] },
  { key: 'location', label: 'Location', type: 'text', width: 150, sortable: true },
  { key: 'plotNumber', label: 'Plot Number', type: 'text', width: 120, sortable: true },
  { key: 'community', label: 'Community', type: 'text', width: 150, sortable: true },
  { key: 'projectType', label: 'Project Type', type: 'dropdown', width: 120, sortable: true, options: ['Residential', 'Commercial', 'Hospitality', 'Industrial'] },
  { key: 'projectFloor', label: 'Project Floor', type: 'number', width: 100, sortable: true },
  { key: 'developer', label: 'Developer', type: 'text', width: 180, sortable: true },
  { key: 'projectAutoPredecessor', label: 'Auto Predecessor', type: 'text', width: 150, sortable: true },
  { key: 'checklist', label: 'Checklist', type: 'checklist', width: 150, sortable: false },
  { key: 'link', label: 'Link', type: 'url', width: 120, sortable: false },
  { key: 'rating', label: 'Rating', type: 'rating', width: 100, sortable: true },
  { key: 'progress', label: 'Progress', type: 'progress', width: 120, sortable: true },
  { key: 'colorIndicator', label: 'Color', type: 'color', width: 80, sortable: false }
];

// Sample data for auto-suggestions
export const autoSuggestData = {
  owners: ['John Smith', 'Emily Davis', 'David Brown', 'Mike Johnson', 'Sarah Wilson', 'Lisa Anderson', 'Robert Chen'],
  developers: ['Alpha Developers Ltd', 'Beta Properties Inc', 'Gamma Hospitality Group', 'Delta Construction Co', 'Epsilon Real Estate'],
  locations: ['Downtown District', 'Business District', 'Tourist District', 'Residential Area', 'Industrial Zone'],
  communities: ['Green Valley', 'Central Business', 'Tourist Hub', 'Sunset Hills', 'Riverside Park']
};

