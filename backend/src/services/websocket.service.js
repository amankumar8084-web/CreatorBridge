const Message = require('../models/Message.model');
const User = require('../models/User.model');

const onlineUsers = new Map();

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error'));
      }
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`);
    
    // Store online user
    onlineUsers.set(socket.user.id, socket.id);
    io.emit('users:online', Array.from(onlineUsers.keys()));
    
    // Join user to their personal room
    socket.join(`user:${socket.user.id}`);
    
    // Handle joining chat rooms
    socket.on('chat:join', (roomId) => {
      socket.join(roomId);
      socket.emit('chat:joined', { roomId });
    });
    
    // Handle sending messages
    socket.on('chat:message', async (data) => {
      const { roomId, content, recipientId } = data;
      
      const message = await Message.create({
        room: roomId,
        sender: socket.user.id,
        content,
        readBy: [socket.user.id]
      });
      
      await message.populate('sender', 'name avatar');
      
      io.to(roomId).emit('chat:message', message);
      
      // Send notification to recipient if DM
      if (recipientId) {
        const recipientSocket = onlineUsers.get(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('notification:new', {
            type: 'message',
            from: socket.user.name,
            message: content
          });
        }
      }
    });
    
    // Handle typing indicators
    socket.on('chat:typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('chat:typing', {
        userId: socket.user.id,
        name: socket.user.name,
        isTyping
      });
    });
    
    // WebRTC signaling for meetings
    socket.on('meeting:join', (meetingId) => {
      socket.join(`meeting:${meetingId}`);
      socket.to(`meeting:${meetingId}`).emit('meeting:user-joined', {
        userId: socket.user.id,
        name: socket.user.name
      });
    });
    
    socket.on('meeting:signal', ({ meetingId, signal, to }) => {
      // 'to' is the userId, so we need to find their socketId or use their personal room
      io.to(`user:${to}`).emit('meeting:signal', { signal, from: socket.user.id, name: socket.user.name });
    });

    socket.on('meeting:offer', ({ meetingId, offer, to }) => {
      socket.to(to).emit('meeting:offer', { offer, from: socket.id });
    });
    
    socket.on('meeting:answer', ({ meetingId, answer, to }) => {
      socket.to(to).emit('meeting:answer', { answer, from: socket.id });
    });
    
    socket.on('meeting:ice-candidate', ({ meetingId, candidate, to }) => {
      socket.to(to).emit('meeting:ice-candidate', { candidate, from: socket.id });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
      onlineUsers.delete(socket.user.id);
      io.emit('users:online', Array.from(onlineUsers.keys()));
      
      // Update last active
      User.findByIdAndUpdate(socket.user.id, { lastActive: new Date() }).exec();
    });
  });
};

module.exports = { initSocket, onlineUsers };