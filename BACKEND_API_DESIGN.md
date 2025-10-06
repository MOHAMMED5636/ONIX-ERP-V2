# Backend API Design for Task-Level Copy-Paste

## Overview
This document outlines the backend API design for implementing task-level copy-paste functionality in the project management application. The API supports copying selected tasks and subtasks while maintaining parent-child hierarchy.

## API Endpoints

### 1. Copy Tasks/Subtasks
**Endpoint:** `POST /api/tasks/copy`
**Description:** Copy selected tasks and subtasks to clipboard

**Request Body:**
```json
{
  "taskIds": [1, 2, 3],
  "subtaskIds": [4, 5, 6],
  "childTaskIds": [7, 8, 9],
  "includeHierarchy": true,
  "copyMode": "full" // "full", "structure", "data"
}
```

**Response:**
```json
{
  "success": true,
  "clipboardId": "clip_123456789",
  "copiedItems": {
    "tasks": [
      {
        "id": 1,
        "name": "Website Development",
        "referenceNumber": "REF-001",
        "status": "working",
        "priority": "High",
        "category": "Development",
        "subtasks": [...],
        "childSubtasks": [...]
      }
    ],
    "subtasks": [...],
    "childTasks": [...]
  },
  "summary": {
    "totalTasks": 3,
    "totalSubtasks": 5,
    "totalChildTasks": 2,
    "hierarchyMaintained": true
  }
}
```

### 2. Paste Tasks/Subtasks
**Endpoint:** `POST /api/tasks/paste`
**Description:** Paste copied tasks and subtasks to target project

**Request Body:**
```json
{
  "clipboardId": "clip_123456789",
  "targetProjectId": 10,
  "targetSubtaskId": 15, // Optional, for pasting child tasks
  "pasteMode": "copy", // "copy", "move", "reference"
  "namingStrategy": "suffix", // "suffix", "prefix", "timestamp"
  "conflictResolution": "rename" // "rename", "overwrite", "skip"
}
```

**Response:**
```json
{
  "success": true,
  "pastedItems": {
    "newTasks": [
      {
        "id": 101,
        "name": "Website Development (Copy)",
        "referenceNumber": "REF-101",
        "originalId": 1,
        "parentProjectId": 10
      }
    ],
    "newSubtasks": [...],
    "newChildTasks": [...]
  },
  "summary": {
    "totalPasted": 10,
    "tasksCreated": 3,
    "subtasksCreated": 5,
    "childTasksCreated": 2,
    "conflictsResolved": 0
  }
}
```

### 3. Get Clipboard Status
**Endpoint:** `GET /api/tasks/clipboard/{clipboardId}`
**Description:** Get information about clipboard contents

**Response:**
```json
{
  "clipboardId": "clip_123456789",
  "createdAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-15T22:30:00Z",
  "items": {
    "tasks": 3,
    "subtasks": 5,
    "childTasks": 2
  },
  "hierarchy": {
    "maxDepth": 3,
    "totalNodes": 10,
    "rootTasks": 3
  }
}
```

### 4. Validate Paste Operation
**Endpoint:** `POST /api/tasks/paste/validate`
**Description:** Validate if paste operation is possible

**Request Body:**
```json
{
  "clipboardId": "clip_123456789",
  "targetProjectId": 10,
  "targetSubtaskId": 15
}
```

**Response:**
```json
{
  "valid": true,
  "warnings": [
    "Target project has different category",
    "Some subtasks may conflict with existing names"
  ],
  "estimatedImpact": {
    "newTasks": 3,
    "newSubtasks": 5,
    "newChildTasks": 2,
    "affectedProjects": 1
  }
}
```

## Data Models

### TaskCopyPaste Model
```javascript
{
  id: String, // clipboardId
  userId: String,
  createdAt: Date,
  expiresAt: Date,
  items: {
    tasks: [TaskCopyItem],
    subtasks: [SubtaskCopyItem],
    childTasks: [ChildTaskCopyItem]
  },
  metadata: {
    copyMode: String,
    includeHierarchy: Boolean,
    sourceProjectIds: [String]
  }
}
```

### TaskCopyItem Model
```javascript
{
  originalId: String,
  name: String,
  referenceNumber: String,
  status: String,
  priority: String,
  category: String,
  owner: String,
  timeline: [Date],
  planDays: Number,
  remarks: String,
  assigneeNotes: String,
  attachments: [Attachment],
  checklist: Boolean,
  checklistItems: [ChecklistItem],
  rating: Number,
  progress: Number,
  color: String,
  location: String,
  plotNumber: String,
  community: String,
  projectType: String,
  projectFloor: String,
  developerProject: String,
  subtasks: [SubtaskCopyItem],
  childSubtasks: [ChildTaskCopyItem],
  hierarchy: {
    level: Number,
    parentId: String,
    children: [String]
  }
}
```

## Business Logic

### Copy Operations
1. **Task Selection**: Users can select multiple tasks, subtasks, and child tasks
2. **Hierarchy Preservation**: Maintain parent-child relationships during copy
3. **Dependency Tracking**: Track which items depend on others
4. **Reference Generation**: Generate new reference numbers for copied items
5. **Conflict Detection**: Identify potential naming conflicts

### Paste Operations
1. **Target Validation**: Ensure target project exists and is accessible
2. **Permission Checking**: Verify user has permission to paste to target
3. **Naming Strategy**: Apply naming conventions (suffix, prefix, timestamp)
4. **Conflict Resolution**: Handle naming conflicts according to strategy
5. **Hierarchy Reconstruction**: Rebuild parent-child relationships
6. **Reference Updates**: Update all internal references and IDs

### Error Handling
```javascript
// Common error responses
{
  "success": false,
  "error": {
    "code": "INVALID_TARGET",
    "message": "Target project does not exist or is not accessible",
    "details": {
      "targetProjectId": 10,
      "userId": "user123"
    }
  }
}
```

## Security Considerations

1. **Access Control**: Users can only copy/paste items they have access to
2. **Permission Validation**: Check write permissions for target projects
3. **Data Sanitization**: Sanitize copied data to prevent injection attacks
4. **Rate Limiting**: Implement rate limiting for copy/paste operations
5. **Audit Logging**: Log all copy/paste operations for security auditing

## Performance Optimizations

1. **Batch Operations**: Process multiple items in single transaction
2. **Lazy Loading**: Load subtasks and child tasks only when needed
3. **Caching**: Cache frequently accessed project structures
4. **Indexing**: Optimize database queries with proper indexing
5. **Pagination**: Implement pagination for large clipboard contents

## Implementation Notes

1. **Database Transactions**: Use transactions to ensure data consistency
2. **Event Sourcing**: Consider event sourcing for complex copy/paste operations
3. **WebSocket Updates**: Send real-time updates to connected clients
4. **Background Processing**: Use background jobs for large copy/paste operations
5. **Monitoring**: Implement monitoring for copy/paste operation performance

## Testing Strategy

1. **Unit Tests**: Test individual copy/paste functions
2. **Integration Tests**: Test end-to-end copy/paste workflows
3. **Performance Tests**: Test with large datasets
4. **Security Tests**: Test access control and permission validation
5. **User Acceptance Tests**: Test with real user scenarios






