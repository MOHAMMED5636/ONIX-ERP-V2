// Socket.IO Server Example
// This is a basic example of how to set up a Socket.IO server for the chat functionality
// Run this with: node socket-server-example.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // React app URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store active rooms and users
const activeRooms = new Map();
const userSockets = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining a room (project chat)
  socket.on('join-room', (roomName) => {
    socket.join(roomName);
    console.log(`User ${socket.id} joined room: ${roomName}`);
    
    // Track room membership
    if (!activeRooms.has(roomName)) {
      activeRooms.set(roomName, new Set());
    }
    activeRooms.get(roomName).add(socket.id);
    
    // Notify others in the room
    socket.to(roomName).emit('user-joined', {
      userId: socket.id,
      room: roomName
    });
  });

  // Handle leaving a room
  socket.on('leave-room', (roomName) => {
    socket.leave(roomName);
    console.log(`User ${socket.id} left room: ${roomName}`);
    
    // Update room membership
    if (activeRooms.has(roomName)) {
      activeRooms.get(roomName).delete(socket.id);
      if (activeRooms.get(roomName).size === 0) {
        activeRooms.delete(roomName);
      }
    }
    
    // Notify others in the room
    socket.to(roomName).emit('user-left', {
      userId: socket.id,
      room: roomName
    });
  });

  // Handle sending messages
  socket.on('send-message', (data) => {
    const { room, message } = data;
    
    // Add timestamp and sender info
    const messageWithMeta = {
      ...message,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      room: room
    };
    
    console.log(`Message in room ${room}:`, messageWithMeta);
    
    // Broadcast to all users in the room
    io.to(room).emit('new-message', messageWithMeta);
  });

  // Handle engineer invitations
  socket.on('invite-engineers', (data) => {
    const { room, engineers, message, project } = data;
    
    console.log(`Inviting engineers to room ${room}:`, engineers);
    
    // Create invitation message
    const invitationMessage = {
      id: Date.now(),
      text: `Invited ${engineers.map(e => e.name).join(', ')} to the project chat${message ? ': ' + message : ''}`,
      sender: 'System',
      timestamp: new Date().toISOString(),
      type: 'invitation',
      room: room,
      engineers: engineers,
      project: project
    };
    
    // Broadcast invitation to room
    io.to(room).emit('new-message', invitationMessage);
    
    // Notify invited engineers (if they have active connections)
    engineers.forEach(engineer => {
      // In a real app, you'd look up the engineer's socket connection
      // For now, we'll just log it
      console.log(`Notifying engineer ${engineer.name} about invitation to project ${project.name}`);
    });
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { room, user, isTyping } = data;
    socket.to(room).emit('user-typing', {
      user,
      isTyping,
      room
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from all rooms
    for (const [roomName, users] of activeRooms.entries()) {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        if (users.size === 0) {
          activeRooms.delete(roomName);
        }
        // Notify others in the room
        socket.to(roomName).emit('user-left', {
          userId: socket.id,
          room: roomName
        });
      }
    }
    
    // Remove from user tracking
    userSockets.delete(socket.id);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// REST API endpoints for chat history (optional)
app.get('/api/chat/:projectId/messages', (req, res) => {
  const { projectId } = req.params;
  // In a real app, you'd fetch from a database
  res.json({
    projectId,
    messages: [
      {
        id: 1,
        text: "Project kickoff meeting scheduled for tomorrow at 10 AM",
        sender: "SA",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        room: `project-${projectId}`
      }
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    activeRooms: activeRooms.size,
    connectedUsers: io.engine.clientsCount
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, server, io };
