const Message = require('../models/Message.model');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');

exports.getMessages = async (req, res, next) => {
  try {
    const { roomId, page = 1, limit = 50 } = req.query;
    
    if (!roomId) {
      return next(new AppError('Room ID is required', 400));
    }
    
    const messages = await Message.find({ room: roomId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: messages.reverse()
    });
  } catch (error) {
    next(error);
  }
};

exports.getChatRooms = async (req, res, next) => {
  try {
    // Get unique rooms where user has messages
    const rooms = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { readBy: req.user._id }] } },
      { $group: { _id: '$room', lastMessage: { $max: '$createdAt' } } },
      { $sort: { lastMessage: -1 } }
    ]);
    
    const roomDetails = await Promise.all(rooms.map(async (room) => {
      const isDM = room._id.includes('dm_');
      let roomName = room._id;
      let participants = [];
      
      if (isDM) {
        const userIds = room._id.replace('dm_', '').split('_');
        const otherUser = userIds.find(id => id !== req.user._id.toString());
        if (otherUser) {
          const user = await User.findById(otherUser).select('name avatar');
          roomName = user?.name || 'Unknown User';
          participants = [user];
        }
      }
      
      const lastMessage = await Message.findOne({ room: room._id })
        .sort({ createdAt: -1 })
        .populate('sender', 'name');
      
      return {
        _id: room._id,
        name: roomName,
        isDM,
        lastMessage: lastMessage,
        lastMessageTime: room.lastMessage,
        participants
      };
    }));
    
    res.status(200).json({
      status: 'success',
      data: roomDetails
    });
  } catch (error) {
    next(error);
  }
};

exports.createDMRoom = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const otherUser = await User.findById(userId);
    
    if (!otherUser) {
      return next(new AppError('User not found', 404));
    }
    
    const roomId = `dm_${[req.user._id, userId].sort().join('_')}`;
    
    res.status(200).json({
      status: 'success',
      data: {
        roomId,
        user: {
          id: otherUser._id,
          name: otherUser.name,
          avatar: otherUser.avatar
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.markMessagesAsRead = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    
    await Message.updateMany(
      { room: roomId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};