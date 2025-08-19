# Jira-like Project Management Table

A comprehensive, feature-rich project management table built with React, Tailwind CSS, and modern web technologies.

## 🚀 Features

### Core Functionality
- **Project Management**: Add, edit, and manage projects with comprehensive data
- **Expandable Subtasks**: Hierarchical project structure with collapsible subtasks
- **Drag & Drop**: Reorder projects and subtasks with smooth animations
- **Inline Editing**: Click any cell to edit content directly
- **Real-time Updates**: Instant visual feedback for all changes

### Data Visualization
- **Progress Bars**: Visual progress indicators with auto-updates
- **Star Ratings**: Interactive 1-5 star rating system
- **Color Indicators**: Custom color coding for project status
- **Checklist Tracking**: Completion status for task checklists

### Rich Input Types
- **Dropdown Selections**: Status, priority, project type, and more
- **Date Range Pickers**: Timeline selection with start/end dates
- **File Attachments**: Multiple file upload support
- **Auto-suggest**: Smart text inputs for owners, developers, locations
- **Person Selectors**: Dropdown menus for team member assignment

### Search & Filtering
- **Global Search**: Search across all project fields
- **Advanced Filters**: Filter by status, priority, project type
- **Column Visibility**: Show/hide columns as needed
- **Sortable Columns**: Click headers to sort data

### Customization
- **Add Custom Columns**: Dynamic column creation with various input types
- **Resizable Columns**: Adjust column widths to fit content
- **Pagination**: Navigate through large datasets
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Technology Stack

- **React 18** with Hooks for state management
- **Tailwind CSS** for styling and responsive design
- **TanStack Table** for advanced table functionality
- **Framer Motion** for smooth animations
- **@dnd-kit** for drag-and-drop functionality
- **ShadCN UI** components for consistent design
- **Radix UI** for accessible dropdown menus

## 📁 File Structure

```
src/components/JiraTable/
├── JiraProjectTable.jsx      # Main table component
├── ProjectRow.jsx            # Individual row component
├── Toolbar.jsx               # Search, filter, and action buttons
├── AddProjectModal.jsx       # Modal for adding new projects
├── AddColumnModal.jsx        # Modal for adding custom columns
├── JiraTableDemo.jsx         # Demo page with feature showcase
├── data.js                   # Sample data and column definitions
└── index.js                  # Export file
```

## 🎯 Usage

### Access the Demo
Navigate to `/jira-table-demo` in your application to see the full-featured table.

### Basic Implementation
```jsx
import { JiraProjectTable } from './components/JiraTable';

function MyPage() {
  return (
    <div className="container mx-auto p-4">
      <JiraProjectTable />
    </div>
  );
}
```

### Custom Data
```jsx
import { JiraProjectTable } from './components/JiraTable';
import { initialProjects, columnDefinitions } from './components/JiraTable/data';

// Customize your data
const myProjects = [
  {
    id: '1',
    projectName: 'My Project',
    status: 'In Progress',
    // ... other fields
  }
];

// Customize columns
const myColumns = [
  { key: 'projectName', label: 'Project Name', type: 'text', width: 200 },
  // ... other columns
];
```

## 📊 Column Types

The table supports various column types:

- **text**: Simple text input
- **number**: Numeric input with validation
- **textarea**: Multi-line text input
- **dropdown**: Select from predefined options
- **person**: Auto-suggest person selector
- **daterange**: Date range picker
- **file**: File upload interface
- **checklist**: Task checklist with completion tracking
- **url**: URL input with validation
- **rating**: Star rating system
- **progress**: Progress bar visualization
- **color**: Color picker for status indicators

## 🔧 Customization

### Adding Custom Columns
1. Click "Add Column" in the toolbar
2. Choose column type and configure options
3. Set width, sortability, and other properties
4. Save to add the column to your table

### Styling
The table uses Tailwind CSS classes and can be customized by:
- Modifying the component styles
- Adding custom CSS classes
- Using Tailwind's configuration

### Data Integration
The table is designed to work with any data structure that matches the expected format. Simply provide your data in the correct shape and the table will handle the rest.

## 🎨 Design Features

- **Clean & Minimal**: Jira-inspired design with focus on usability
- **Responsive**: Adapts to different screen sizes
- **Accessible**: Follows WCAG guidelines for accessibility
- **Modern UI**: Uses modern design patterns and interactions
- **Consistent**: Maintains design consistency across all components

## 🚀 Performance

- **Optimized Rendering**: Efficient React rendering with proper memoization
- **Virtual Scrolling Ready**: Prepared for large datasets
- **Smooth Animations**: 60fps animations for all interactions
- **Memory Efficient**: Proper cleanup and state management

## 🔮 Future Enhancements

- **Export to Excel/CSV**: Data export functionality
- **Dark Mode**: Theme switching capability
- **Column Color Coding**: Rules-based column styling
- **Advanced Filtering**: Complex filter combinations
- **Bulk Operations**: Multi-select and bulk editing
- **Real-time Collaboration**: Live updates for team members

## 📝 License

This component is part of the ERP application and follows the same licensing terms.

---

Built with ❤️ using modern web technologies for optimal performance and user experience.
