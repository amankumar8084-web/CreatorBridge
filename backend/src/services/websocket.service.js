const Message = require('../models/Message.model');
const User = require('../models/User.model');
const ChatRequest = require('../models/ChatRequest.model');

const onlineUsers = new Map();

const initSocket = (io) => {
  // Authentication middleware
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
    
    // Store online user - Ensure ID is a string for reliable Map keys
    const userIdStr = socket.user._id.toString();
    onlineUsers.set(userIdStr, socket.id);
    io.emit('users:online', Array.from(onlineUsers.keys()));
    
    // Join user to their personal room
    socket.join(`user:${userIdStr}`);
    
    // Handle joining chat rooms
    socket.on('chat:join', (roomId) => {
      socket.join(roomId);
      socket.emit('chat:joined', { roomId });
    });
    
    // Handle sending messages
    socket.on('chat:message', async (data, callback) => {
      try {
        const { roomId, content, recipientId } = data;
        
        if (!content || !content.trim()) {
          if (callback) callback({ error: 'Message cannot be empty' });
          return;
        }
        
        // Access Control Validation for DMs — re-fetch from DB for fresh data
        if (recipientId) {
          const [freshSender, recipient] = await Promise.all([
            User.findById(socket.user.id),
            User.findById(recipientId)
          ]);
          
          if (!recipient) {
            if (callback) callback({ error: 'User not found' });
            return;
          }
          
          // Use .toString() to compare ObjectIds properly
          const senderFollowsRecipient = freshSender.following.some(
            id => id.toString() === recipientId.toString()
          );
          const recipientFollowsSender = freshSender.followers.some(
            id => id.toString() === recipientId.toString()
          );
          
          // Also check accepted chat requests
          const acceptedRequest = await ChatRequest.findOne({
            $or: [
              { from: socket.user.id, to: recipientId, status: 'accepted' },
              { from: recipientId, to: socket.user.id, status: 'accepted' }
            ]
          });
          
          if (!senderFollowsRecipient && !recipientFollowsSender && !acceptedRequest) {
            if (callback) callback({ error: 'You can only message users you follow or who follow you. Send a chat request first.' });
            return;
          }
        }
        
        const message = await Message.create({
          room: roomId,
          sender: socket.user.id,
          content: content.trim(),
          readBy: [socket.user.id]
        });
        
        await message.populate('sender', 'name avatar');
        
        // Broadcast to the room (both sender and recipient receive this)
        io.to(roomId).emit('chat:message', message);
        
        // Send notification to recipient if DM and they're online
        if (recipientId) {
          const recipientSocket = onlineUsers.get(recipientId);
          if (recipientSocket) {
            io.to(recipientSocket).emit('notification:new', {
              type: 'message',
              title: `New message from ${socket.user.name}`,
              from: socket.user.name,
              message: content.length > 50 ? content.substring(0, 50) + '...' : content
            });
          }
        }
        
        // Acknowledge success back to sender
        if (callback) callback({ success: true, message });
        
      } catch (error) {
        console.error('Chat message error:', error);
        if (callback) callback({ error: 'Failed to send message' });
      }
    });
    
    // Handle chat requests for non-followers
    socket.on('chat:request', async (data, callback) => {
      try {
        const { recipientId } = data;
        const recipient = await User.findById(recipientId);
        if (!recipient) {
          if (callback) callback({ error: 'User not found' });
          return;
        }
        
        // Check if a pending request already exists
        const existing = await ChatRequest.findOne({
          from: socket.user.id,
          to: recipientId,
          status: 'pending'
        });
        
        if (existing) {
          if (callback) callback({ success: true, message: 'Chat request already sent.' });
          return;
        }
        
        // Persist the request
        await ChatRequest.create({
          from: socket.user.id,
          to: recipientId,
          status: 'pending'
        });

        // Notify recipient if online
        const recipientSocket = onlineUsers.get(recipientId);
        if (recipientSocket) {
          io.to(recipientSocket).emit('chat:request:new', {
            from: {
              _id: socket.user.id,
              name: socket.user.name,
              avatar: socket.user.avatar
            }
          });
          io.to(recipientSocket).emit('notification:new', {
            type: 'chat_request',
            title: 'Chat Request',
            from: socket.user.name,
            message: `${socket.user.name} wants to chat with you!`
          });
        }
        
        if (callback) callback({ success: true, message: 'Chat request sent!' });
      } catch (error) {
        // Handle duplicate key error gracefully
        if (error.code === 11000) {
          if (callback) callback({ success: true, message: 'Chat request already sent.' });
          return;
        }
        console.error('Chat request error:', error);
        if (callback) callback({ error: 'Failed to send chat request' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
      onlineUsers.delete(socket.user._id.toString());
      io.emit('users:online', Array.from(onlineUsers.keys()));
      
      // Update last active
      User.findByIdAndUpdate(socket.user._id, { lastActive: new Date() }).exec();
    });
  });
};

module.exports = { initSocket, onlineUsers };