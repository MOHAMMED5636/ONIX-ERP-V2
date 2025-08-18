import { 
  PaintBrushIcon, 
  CodeBracketIcon, 
  EyeIcon, 
  BeakerIcon, 
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Initial stages data
export const initialStages = [
  {
    id: 'design',
    name: 'Design',
    description: 'Create project specifications and visual mockups',
    icon: PaintBrushIcon,
    color: '#4A90E2',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-100',
    route: '/tasks',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    tasks: [
      'Create wireframes',
      'Design user interface',
      'Create style guide',
      'Design system components',
      'User experience mapping'
    ]
  },
  {
    id: 'development',
    name: 'Development',
    description: 'Build and implement the project features',
    icon: CodeBracketIcon,
    color: '#50E3C2',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    hoverColor: 'hover:bg-teal-100',
    route: '/tasks',
    startDate: '2024-02-16',
    endDate: '2024-04-15',
    tasks: [
      'Frontend development',
      'Backend API development',
      'Database setup',
      'Integration testing',
      'Performance optimization'
    ]
  },
  {
    id: 'review',
    name: 'Review',
    description: 'Evaluate and validate project deliverables',
    icon: EyeIcon,
    color: '#F5A623',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    hoverColor: 'hover:bg-amber-100',
    route: '/tasks',
    startDate: '2024-04-16',
    endDate: '2024-05-15',
    tasks: [
      'Code review',
      'Design review',
      'User acceptance testing',
      'Stakeholder feedback',
      'Quality assurance check'
    ]
  },
  {
    id: 'testing',
    name: 'Testing',
    description: 'Quality assurance and bug testing',
    icon: BeakerIcon,
    color: '#9013FE',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-100',
    route: '/tasks',
    startDate: '2024-05-16',
    endDate: '2024-06-15',
    tasks: [
      'Unit testing',
      'Integration testing',
      'System testing',
      'User acceptance testing',
      'Performance testing'
    ]
  },
  {
    id: 'handover',
    name: 'Handover',
    description: 'Deliver final project to stakeholders',
    icon: CheckCircleIcon,
    color: '#7ED321',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-100',
    route: '/tasks',
    startDate: '2024-06-16',
    endDate: '2024-07-15',
    tasks: [
      'Documentation completion',
      'Training materials',
      'Deployment preparation',
      'Stakeholder handover',
      'Project closure'
    ]
  }
];

// Available icons for selection
export const availableIcons = [
  { name: 'PaintBrush', icon: PaintBrushIcon },
  { name: 'CodeBracket', icon: CodeBracketIcon },
  { name: 'Eye', icon: EyeIcon },
  { name: 'Beaker', icon: BeakerIcon },
  { name: 'CheckCircle', icon: CheckCircleIcon },
];

// Color options
export const colorOptions = [
  { name: 'Blue', value: '#4A90E2', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', hoverColor: 'hover:bg-blue-100' },
  { name: 'Teal', value: '#50E3C2', bgColor: 'bg-teal-50', borderColor: 'border-teal-200', hoverColor: 'hover:bg-teal-100' },
  { name: 'Amber', value: '#F5A623', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', hoverColor: 'hover:bg-amber-100' },
  { name: 'Purple', value: '#9013FE', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', hoverColor: 'hover:bg-purple-100' },
  { name: 'Green', value: '#7ED321', bgColor: 'bg-green-50', borderColor: 'border-green-200', hoverColor: 'hover:bg-green-100' },
  { name: 'Red', value: '#E53E3E', bgColor: 'bg-red-50', borderColor: 'border-red-200', hoverColor: 'hover:bg-red-100' },
  { name: 'Pink', value: '#EC4899', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', hoverColor: 'hover:bg-pink-100' },
  { name: 'Indigo', value: '#6366F1', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', hoverColor: 'hover:bg-indigo-100' },
];

// Default form data
export const defaultFormData = {
  name: '',
  description: '',
  color: '#4A90E2',
  startDate: '',
  endDate: '',
  tasks: []
};
