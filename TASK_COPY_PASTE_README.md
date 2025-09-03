# Task Copy-Paste Feature

## 🎯 Overview

The Task Copy-Paste feature allows users to copy parent tasks (with their complete subtrees) from one project and paste them into another project while preserving the hierarchy and generating new unique IDs.

## ✨ Features

- **✅ Parent Task Copying**: Copy parent tasks with all their subtasks and child subtasks
- **✅ Hierarchy Preservation**: Maintain parent-child relationships during copy-paste
- **✅ Unique ID Generation**: Automatically generate new IDs for all copied tasks
- **✅ Validation**: Enforce business rules to prevent invalid copy operations
- **✅ Clipboard Management**: Persistent clipboard storage using localStorage
- **✅ User Feedback**: Clear status messages and error handling

## 🔒 Business Rules

### ✅ Valid Copy Operations
- **Parent tasks only**: Tasks that have subtasks or are main projects
- **Multiple selection**: Multiple parent tasks can be selected together
- **Complete subtrees**: All child tasks are automatically included

### ❌ Invalid Copy Operations
- **Child tasks independently**: Cannot copy subtasks without their parent
- **Mixed selection**: Cannot mix parent and child tasks in selection
- **Empty selection**: No action performed when no tasks are selected

## 🚀 Usage

### 1. Copy Tasks
1. Select parent task(s) using checkboxes
2. Click "Copy" button in the bulk action bar
3. System validates selection and copies tasks to clipboard
4. Success message shows what was copied

### 2. Paste Tasks
1. Navigate to target project
2. Click "Paste" button in the bulk action bar
3. Select target project from dropdown
4. Tasks are pasted with new IDs and preserved hierarchy
5. Clipboard is cleared after successful paste

## 🏗️ Architecture

### Core Functions (`taskCopyPaste.js`)

#### `validateTaskSelection(selectedTasks, allTasks)`
- Validates if selected tasks can be copied
- Returns validation result with message

#### `copyTasks(selectedTasks)`
- Copies selected parent tasks with complete subtrees
- Removes IDs for new ID generation on paste
- Returns copy metadata

#### `pasteTasks(copiedData, targetProjectId, existingTasks)`
- Pastes copied tasks into target project
- Generates new unique IDs for all tasks
- Preserves hierarchy relationships
- Returns paste metadata

#### Clipboard Management
- `saveClipboardData(data)` - Save to localStorage
- `getClipboardData()` - Retrieve from localStorage
- `clearClipboardData()` - Clear clipboard
- `hasClipboardData()` - Check if clipboard has data

### React Components

#### `TaskCopyPasteManager`
- Manages copy-paste UI and state
- Handles validation and error messages
- Shows paste modal for target selection

#### `CopyPasteDemo`
- User guide component
- Shows valid/invalid operations
- Provides usage instructions

## 🔧 Integration

### MainTable Integration
```javascript
// Pass required props to BulkActionBar
<BulkActionBar
  selectedTasks={filteredTasks.filter(task => selectedTaskIds.has(task.id))}
  allTasks={tasks}
  onTasksPasted={handleTasksPasted}
  // ... other props
/>

// Handle pasted tasks
const handleTasksPasted = (pastedTasks) => {
  setTasks(prevTasks => [...prevTasks, ...pastedTasks]);
  showToast(`Successfully pasted ${pastedTasks.length} task(s)`, 'success');
  setSelectedTaskIds(new Set());
};
```

### BulkActionBar Integration
```javascript
// Replace old copy button with TaskCopyPasteManager
<TaskCopyPasteManager
  selectedTasks={selectedTasks}
  allTasks={allTasks}
  onTasksPasted={onTasksPasted}
  onCopySuccess={(copiedData) => console.log('Copied:', copiedData)}
  onPasteSuccess={(pasteResult) => console.log('Pasted:', pasteResult)}
/>
```

## 📊 Data Structure

### Copy Result
```javascript
{
  copiedTasks: [...],           // Array of copied tasks
  copyTimestamp: "2024-01-01T00:00:00.000Z",
  totalTasks: 2,                // Number of parent tasks
  totalSubtasks: 5,             // Number of subtasks
  totalChildSubtasks: 12        // Number of child subtasks
}
```

### Paste Result
```javascript
{
  pastedTasks: [...],           // Array of pasted tasks with new IDs
  targetProjectId: "project_123",
  pasteTimestamp: "2024-01-01T00:00:00.000Z",
  totalPasted: 2,               // Number of pasted parent tasks
  totalSubtasks: 5,             // Number of pasted subtasks
  totalChildSubtasks: 12        // Number of pasted child subtasks
}
```

## 🎨 UI Components

### Copy Button
- **Enabled**: When parent tasks are selected
- **Disabled**: When no tasks selected or invalid selection
- **Color**: Blue when enabled, gray when disabled

### Paste Button
- **Enabled**: When clipboard contains valid data
- **Disabled**: When clipboard is empty
- **Color**: Green when enabled, gray when disabled

### Status Messages
- **Success**: Green background with checkmark icon
- **Error**: Red background with warning icon
- **Auto-dismiss**: After 3-5 seconds

### Paste Modal
- **Project Selection**: Dropdown of available target projects
- **Clipboard Info**: Shows what's in clipboard
- **Action Buttons**: Cancel and Paste buttons

## 🧪 Testing

### Test Scenarios

#### Valid Copy Operations
1. Select single parent task → Copy should succeed
2. Select multiple parent tasks → Copy should succeed
3. Select parent with subtasks → All subtasks included

#### Invalid Copy Operations
1. Select only child task → Copy should fail with error message
2. Select mixed parent/child → Copy should fail with error message
3. Select no tasks → Copy button should be disabled

#### Paste Operations
1. Paste to valid project → Should succeed and clear clipboard
2. Paste without target → Should show error message
3. Paste with invalid data → Should show error message

## 🔮 Future Enhancements

### Potential Improvements
- **Cross-browser clipboard**: Use Clipboard API for better compatibility
- **Undo/Redo**: Add undo functionality for paste operations
- **Batch operations**: Support for multiple paste operations
- **Conflict resolution**: Handle naming conflicts during paste
- **Template system**: Save frequently used task combinations

### Advanced Features
- **Conditional copying**: Copy only specific task types
- **Dependency mapping**: Update task dependencies after paste
- **Version control**: Track copy-paste history
- **Export/Import**: Support for external file formats

## 🐛 Troubleshooting

### Common Issues

#### Copy Button Disabled
- **Cause**: No tasks selected or invalid selection
- **Solution**: Select parent tasks only (not child tasks)

#### Paste Button Disabled
- **Cause**: No data in clipboard
- **Solution**: Copy tasks first, then paste

#### Paste Fails
- **Cause**: Invalid target project or corrupted clipboard data
- **Solution**: Select valid target project or re-copy tasks

#### Performance Issues
- **Cause**: Large number of tasks being copied
- **Solution**: Copy tasks in smaller batches

## 📝 Dependencies

- **uuid**: For generating unique IDs (installed via npm)
- **localStorage**: For clipboard persistence
- **React**: For component management
- **Heroicons**: For UI icons

## 🚀 Getting Started

1. **Install dependencies**: `npm install uuid`
2. **Import components**: Add to your existing components
3. **Integrate with MainTable**: Pass required props
4. **Test functionality**: Try copying and pasting tasks
5. **Customize UI**: Adjust styling and behavior as needed

## 📞 Support

For issues or questions about the copy-paste functionality:
1. Check the browser console for error messages
2. Verify task selection follows business rules
3. Ensure all required props are passed correctly
4. Check localStorage for clipboard data integrity
