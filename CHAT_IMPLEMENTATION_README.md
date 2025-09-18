# 💬 Project Chat Implementation

This document describes the chat functionality implementation for the ONIX ERP project management application.

## 🎯 Features Implemented

### ✅ Core Features
- **💬 Chat Button**: Added to every project row in the main table
- **📱 Right-side Drawer**: Slides in from the right with fixed width (w-96)
- **🔄 Real-time Messaging**: Socket.IO integration for live communication
- **🏠 Project Rooms**: Each project has its own chat room (`project-{id}`)
- **👥 Multi-user Support**: Multiple users can chat in the same project room
- **👨‍💻 Engineer Invitations**: Invite engineers to project chats with role-based selection
- **👥 Participant Management**: View and manage chat participants with online status
- **📱 Responsive Design**: Clean, modern UI with Tailwind CSS

### ✅ UI Components
- **ChatDrawer.js**: Main chat interface component
- **useSocket.js**: Custom hook for Socket.IO integration
- **Updated ProjectRow.js**: Added chat button to project rows
- **Updated MainTable.js**: Integrated chat functionality

## 🚀 Quick Start

### 1. Install Socket.IO Dependencies

```bash
# Install socket.io-client for React app
npm install socket.io-client

# For the server (optional - see socket-server-example.js)
npm install express socket.io cors
```

### 2. Start the Socket.IO Server

```bash
# Copy the example server
cp socket-server-package.json package.json
npm install
node socket-server-example.js
```

The server will run on `http://localhost:3001`

### 3. Update React App Socket URL (if needed)

In `src/hooks/useSocket.js`, update the URL if your server runs on a different port:

```javascript
const useSocket = (url = 'http://localhost:3001') => {
  // ... rest of the code
};
```

## 📁 File Structure

```
ONIX-ERP-V2/
├── src/
│   ├── components/tasks/
│   │   ├── ChatDrawer.js              # Main chat interface
│   │   ├── MainTable.js               # Updated with chat integration
│   │   └── MainTable/
│   │       ├── ProjectRow.js          # Updated with chat button
│   │       └── SortableProjectRow.js  # Updated with chat prop
│   └── hooks/
│       └── useSocket.js               # Socket.IO integration hook
├── socket-server-example.js           # Example Socket.IO server
├── socket-server-package.json         # Server dependencies
└── CHAT_IMPLEMENTATION_README.md      # This file
```

## 🔧 Implementation Details

### ChatDrawer Component

**Location**: `src/components/tasks/ChatDrawer.js`

**Features**:
- Right-side sliding drawer (w-96 width)
- Project name display in header
- Scrollable messages area
- Message input with send button
- Real-time message updates
- Connection status indicator
- Engineer invitation system
- Participant management with online status
- Sample messages for demonstration

**Props**:
```javascript
<ChatDrawer
  isOpen={boolean}           // Controls drawer visibility
  project={object}           // Project data
  onClose={function}         // Close handler
  socket={object}            // Socket.IO instance
/>
```

### useSocket Hook

**Location**: `src/hooks/useSocket.js`

**Features**:
- Automatic connection management
- Reconnection handling
- Room management (join/leave)
- Message sending/receiving
- Error handling

**Usage**:
```javascript
const { socket, isConnected, error, joinRoom, leaveRoom, sendMessage } = useSocket();
```

### ProjectRow Integration

**Location**: `src/components/tasks/MainTable/ProjectRow.js`

**Changes**:
- Added `ChatBubbleLeftRightIcon` import
- Added `onOpenChat` prop
- Added chat button with green styling
- Button positioned after "Add Task" button

### MainTable Integration

**Location**: `src/components/tasks/MainTable.js`

**Changes**:
- Added chat state management
- Added Socket.IO integration
- Added chat handlers
- Added ChatDrawer component to render

## 🎨 UI Design

### Chat Button
- **Color**: Green gradient (`bg-green-500` to `bg-green-600`)
- **Icon**: Chat bubble icon + 💬 emoji
- **Position**: After "Add Task" button
- **Hover**: Darker green with scale effect

### Chat Drawer
- **Width**: Fixed 384px (`w-96`)
- **Position**: Right side, slides in from right
- **Header**: Gradient background with project name
- **Messages**: Scrollable area with message bubbles
- **Input**: Bottom-fixed input with send button

### Message Bubbles
- **Own messages**: Right-aligned, indigo background
- **Other messages**: Left-aligned, white background with border
- **Avatars**: Colored circles with user initials
- **Timestamps**: Small text below messages

## 🔌 Socket.IO Integration

### Client-Side (React)

```javascript
// Initialize socket
const { socket, isConnected } = useSocket();

// Join project room
socket.emit('join-room', `project-${projectId}`);

// Send message
socket.emit('send-message', {
  room: `project-${projectId}`,
  message: {
    text: 'Hello!',
    sender: 'Current User',
    timestamp: new Date()
  }
});

// Listen for messages
socket.on('new-message', (message) => {
  setMessages(prev => [...prev, message]);
});
```

### Server-Side (Node.js)

```javascript
// Handle room joining
socket.on('join-room', (roomName) => {
  socket.join(roomName);
});

// Handle message sending
socket.on('send-message', (data) => {
  const { room, message } = data;
  io.to(room).emit('new-message', message);
});
```

## 👨‍💻 Engineer Invitation System

### Features
- **Engineer Selection**: Choose from available engineers with different roles
- **Role-based Filtering**: Filter engineers by role (Developer, Designer, QA, etc.)
- **Online Status**: See who's online, away, or offline
- **Invitation Messages**: Add personal messages to invitations
- **Participant Management**: View and remove chat participants
- **Real-time Updates**: Invitations appear as system messages in chat

### Available Engineers
```javascript
const availableEngineers = [
  { id: 'SA', name: 'Sarah Ahmed', role: 'Senior Developer', status: 'online' },
  { id: 'MN', name: 'Mohammed Nasser', role: 'Project Manager', status: 'online' },
  { id: 'AH', name: 'Ahmed Hassan', role: 'Frontend Developer', status: 'away' },
  { id: 'MA', name: 'Mariam Ali', role: 'Backend Developer', status: 'offline' },
  { id: 'FK', name: 'Fatima Khalil', role: 'UI/UX Designer', status: 'online' },
  { id: 'OS', name: 'Omar Salem', role: 'DevOps Engineer', status: 'online' },
  { id: 'RA', name: 'Rana Ahmed', role: 'QA Engineer', status: 'away' },
  { id: 'YK', name: 'Youssef Khalil', role: 'Database Admin', status: 'offline' }
];
```

### Invitation Flow
1. Click "Invite" button in chat header
2. Select engineers from the modal
3. Add optional invitation message
4. Send invitations
5. Engineers are added to chat participants
6. System message appears in chat
7. Socket.IO notifies all participants

## 🚀 Usage Examples

### Opening a Chat

```javascript
// In ProjectRow component
<button
  onClick={() => onOpenChat && onOpenChat(task)}
  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-500 text-white hover:bg-green-600 transition-all duration-200 w-fit"
>
  <ChatBubbleLeftRightIcon className="w-3 h-3" />
  💬 Chat
</button>
```

### Handling Chat State

```javascript
// In MainTable component
const [chatProject, setChatProject] = useState(null);
const [isChatOpen, setIsChatOpen] = useState(false);

const handleOpenChat = (project) => {
  setChatProject(project);
  setIsChatOpen(true);
};

const handleCloseChat = () => {
  setIsChatOpen(false);
  setChatProject(null);
};
```

## 🛠️ Customization

### Styling
- Modify colors in `ChatDrawer.js`
- Adjust drawer width by changing `w-96` class
- Customize message bubble styles

### Functionality
- Add message persistence (database integration)
- Implement user authentication
- Add file sharing capabilities
- Implement typing indicators

### Server
- Add database integration for message storage
- Implement user authentication
- Add message moderation features
- Implement room permissions

## 🐛 Troubleshooting

### Common Issues

1. **Socket not connecting**
   - Check if server is running on correct port
   - Verify CORS settings
   - Check network connectivity

2. **Messages not appearing**
   - Verify room joining logic
   - Check message event names
   - Ensure proper state updates

3. **UI not updating**
   - Check React state management
   - Verify component re-renders
   - Check for JavaScript errors

### Debug Tips

```javascript
// Add debugging to useSocket hook
useEffect(() => {
  if (socket) {
    socket.on('connect', () => console.log('Connected:', socket.id));
    socket.on('disconnect', () => console.log('Disconnected'));
    socket.on('error', (err) => console.error('Socket error:', err));
  }
}, [socket]);
```

## 📈 Future Enhancements

### Planned Features
- [ ] Message persistence with database
- [ ] User authentication and profiles
- [ ] File and image sharing
- [ ] Message search and filtering
- [ ] Push notifications
- [ ] Message reactions and emojis
- [ ] Voice messages
- [ ] Screen sharing integration

### Technical Improvements
- [ ] Message encryption
- [ ] Rate limiting
- [ ] Message moderation
- [ ] Analytics and metrics
- [ ] Performance optimization
- [ ] Mobile responsiveness

## 📝 Notes

- The implementation uses sample data for demonstration
- Socket.IO server is optional but recommended for real-time features
- All styling uses Tailwind CSS classes
- Components are fully reusable and modular
- Error handling is basic and can be enhanced
- No authentication is implemented (add as needed)

## 🤝 Contributing

When adding new chat features:
1. Follow the existing code structure
2. Use Tailwind CSS for styling
3. Add proper error handling
4. Include TypeScript types if applicable
5. Update this README with new features

---

**Happy Chatting! 💬✨**
