# ONIX ERP V2 - Task Management System

A comprehensive Enterprise Resource Planning (ERP) system built with React, featuring advanced task management, project tracking, and team collaboration tools.

## 🚀 Features

### Task Management
- **Main Table View**: Comprehensive task management with sortable columns
- **Kanban Board**: Visual task organization with drag-and-drop functionality
- **Hierarchical Tasks**: Support for main tasks, subtasks, and child subtasks
- **Real-time Updates**: Dynamic task status and progress tracking
- **Advanced Filtering**: Filter tasks by status, category, owner, priority, and more

### Project Tracking
- **Project Life Cycle**: Visual project progression tracking
- **Team Project Tracker**: Multi-user project collaboration
- **Timeline Management**: Date range selection and timeline visualization
- **Progress Monitoring**: Real-time progress tracking and reporting

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Customizable theme preferences
- **Multi-language Support**: English and Arabic language support
- **Interactive Dashboard**: Statistics and overview widgets

### Data Management
- **Import/Export**: Excel file import and export capabilities
- **Data Validation**: Comprehensive task validation
- **Search & Filter**: Advanced search and filtering options
- **Column Customization**: Drag-and-drop column reordering

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14.0 or higher)
- **npm** (version 6.0 or higher) or **yarn**
- **Git** for version control

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd ONIX-ERP-V2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm start
```
or
```bash
yarn start
```

This will start the development server at `http://localhost:3000`. The page will reload automatically when you make changes.

### Production Build
```bash
npm run build
```
or
```bash
yarn build
```

This creates an optimized production build in the `build` folder.

### Serve Production Build
```bash
npm install -g serve
serve -s build
```

## 📁 Project Structure

```
ONIX-ERP-V2/
├── public/
│   ├── index.html
│   └── onix-bg.png          # ONIX logo
├── src/
│   ├── components/
│   │   ├── tasks/           # Task management components
│   │   │   ├── MainTable.js # Main task table view
│   │   │   ├── TaskList.js  # Task list container
│   │   │   └── ...
│   │   ├── TeamProjectTracker/ # Team collaboration
│   │   └── ...
│   ├── layout/
│   │   ├── Navbar.js        # Top navigation
│   │   └── Sidebar.js       # Side navigation
│   ├── modules/             # Core modules
│   ├── pages/               # Page components
│   └── utils/               # Utility functions
├── package.json
└── README.md
```

## 🎯 Usage Guide

### Getting Started

1. **Launch the application** using `npm start`
2. **Navigate to `http://localhost:3000`** in your browser
3. **Use the sidebar** to navigate between different modules

### Task Management

#### Main Table View
- Click on **"Main Table"** tab to access the primary task management interface
- **Add new tasks** using the "New Project" button
- **Edit tasks** by clicking on any cell in the table
- **Create subtasks** using the "Add Task" button within each project row
- **Keyboard shortcuts**:
  - `Enter`: Save changes
  - `Escape`: Cancel editing

#### Kanban Board
- Switch to **"Kanban"** view for visual task organization
- **Drag and drop** tasks between different status columns
- **Create new tasks** directly in any column

### Project Features

#### Hierarchical Task Structure
- **Main Tasks (Projects)**: Top-level project entries (white background)
- **Subtasks**: Secondary level tasks (light beige background)
- **Child Tasks**: Third level tasks (light blue background)

#### Column Management
- **Drag and drop** column headers to reorder
- **Add new columns** using the "+" button in the header
- **Hide/show columns** using the visibility controls

#### Task Properties
Each task supports the following properties:
- Task Name
- Reference Number
- Category (Design, Development, Testing, Review)
- Status (Done, In Progress, Pending, Stuck, etc.)
- Owner/Assignee
- Timeline (Start and End dates)
- Plan Days
- Remarks
- Assignee Notes
- Priority (Low, Medium, High)
- Location
- Link
- Attachments
- Rating (1-5 stars)
- Predecessors
- Checklist

### Navigation

#### Sidebar Menu
- **Dashboard**: Overview and statistics
- **Tasks**: Task management (Project List, Contracts, Categories)
- **Team Project Tracker**: Team collaboration tools
- **Company Resources**: Company management
- **Workplace Hub**: HR and workplace tools

#### Top Navigation
- **Language Toggle**: Switch between English and Arabic
- **User Profile**: User settings and logout
- **System Status**: Real-time system status indicator

## 🎨 Customization

### Theme Colors
The application uses a professional color scheme:
- **Main Tasks**: White background
- **Subtasks**: Light beige background (`#faf8f5`)
- **Child Tasks**: Light blue background (`#f0f8ff`)
- **Hover Effects**: Blue highlight (`#e6f4ff`)

### Language Support
- English (default)
- Arabic (RTL support)
- Switch languages using the globe icon in the top navigation

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory for custom configuration:
```env
REACT_APP_API_URL=your_api_endpoint
REACT_APP_VERSION=2.0.0
```

### Build Configuration
Modify `package.json` for custom build settings:
```json
{
  "homepage": ".",
  "scripts": {
    "build": "react-scripts build"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Node modules not found**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Port already in use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   # Or use different port
   PORT=3001 npm start
   ```

3. **Build errors**
   ```bash
   npm run build 2>&1 | tee build.log
   ```

### Performance Optimization
- Use production build for deployment
- Enable gzip compression on your server
- Implement lazy loading for large datasets

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for ONIX.

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ by the ONIX Development Team**