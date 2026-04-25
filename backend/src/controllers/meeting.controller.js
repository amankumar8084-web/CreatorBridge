const MeetingRoom = require('../models/MeetingRoom.model');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');

exports.createMeeting = async (req, res, next) => {
  try {
    const { name, description, isPrivate, maxParticipants, scheduledFor, duration, tags } = req.body;
    
    const meeting = await MeetingRoom.create({
      name,
      description,
      host: req.user._id,
      participants: [req.user._id],
      isPrivate: isPrivate || false,
      maxParticipants: maxParticipants || 8,
      scheduledFor: scheduledFor || new Date(),
      duration: duration || 60,
      tags: tags || []
    });
    
    await meeting.populate('host', 'name avatar');
    
    res.status(201).json({
      status: 'success',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

exports.getMeetings = async (req, res, next) => {
  try {
    const { status = 'active', page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (status === 'active') {
      query.isActive = true;
      query.scheduledFor = { $lte: new Date() };
    } else if (status === 'upcoming') {
      query.scheduledFor = { $gt: new Date() };
    } else if (status === 'past') {
      query.isActive = false;
    }
    
    const meetings = await MeetingRoom.find(query)
      .populate('host', 'name avatar')
      .populate('participants', 'name avatar')
      .sort({ scheduledFor: status === 'upcoming' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await MeetingRoom.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      results: meetings.length,
      data: { meetings, total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMeeting = async (req, res, next) => {
  try {
    const meeting = await MeetingRoom.findById(req.params.id)
      .populate('host', 'name avatar email')
      .populate('participants', 'name avatar')
      .populate('pendingRequests', 'name avatar');
    
    if (!meeting) {
      return next(new AppError('Meeting not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

exports.joinMeeting = async (req, res, next) => {
  try {
    const meeting = await MeetingRoom.findById(req.params.id);
    
    if (!meeting) {
      return next(new AppError('Meeting not found', 404));
    }
    
    if (!meeting.isActive) {
      return next(new AppError('Meeting is no longer active', 400));
    }
    
    if (meeting.participants.length >= meeting.maxParticipants) {
      return next(new AppError('Meeting is full', 400));
    }
    
    if (meeting.isPrivate) {
      if (!meeting.pendingRequests.includes(req.user._id) && 
          meeting.host.toString() !== req.user._id.toString()) {
        meeting.pendingRequests.push(req.user._id);
        await meeting.save();
        return res.status(200).json({
          status: 'pending',
          message: 'Join request sent to host'
        });
      }
    }
    
    if (!meeting.participants.includes(req.user._id)) {
      meeting.participants.push(req.user._id);
      await meeting.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

exports.leaveMeeting = async (req, res, next) => {
  try {
    const meeting = await MeetingRoom.findById(req.params.id);
    
    if (!meeting) {
      return next(new AppError('Meeting not found', 404));
    }
    
    meeting.participants = meeting.participants.filter(
      p => p.toString() !== req.user._id.toString()
    );
    
    if (meeting.host.toString() === req.user._id.toString() && meeting.participants.length > 0) {
      // Transfer host to next participant
      meeting.host = meeting.participants[0];
    }
    
    if (meeting.participants.length === 0) {
      meeting.isActive = false;
      meeting.endedAt = new Date();
    }
    
    await meeting.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Left meeting'
    });
  } catch (error) {
    next(error);
  }
};

exports.approveParticipant = async (req, res, next) => {
  try {
    const meeting = await MeetingRoom.findById(req.params.id);
    
    if (!meeting) {
      return next(new AppError('Meeting not found', 404));
    }
    
    if (meeting.host.toString() !== req.user._id.toString()) {
      return next(new AppError('Only host can approve participants', 403));
    }
    
    const { userId, approve } = req.body;
    
    if (approve) {
      meeting.pendingRequests = meeting.pendingRequests.filter(
        id => id.toString() !== userId
      );
      if (!meeting.participants.includes(userId)) {
        meeting.participants.push(userId);
      }
    } else {
      meeting.pendingRequests = meeting.pendingRequests.filter(
        id => id.toString() !== userId
      );
    }
    
    await meeting.save();
    
    res.status(200).json({
      status: 'success',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

exports.endMeeting = async (req, res, next) => {
  try {
    const meeting = await MeetingRoom.findById(req.params.id);
    
    if (!meeting) {
      return next(new AppError('Meeting not found', 404));
    }
    
    if (meeting.host.toString() !== req.user._id.toString()) {
      return next(new AppError('Only host can end the meeting', 403));
    }
    
    meeting.isActive = false;
    meeting.endedAt = new Date();
    await meeting.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Meeting ended'
    });
  } catch (error) {
    next(error);
  }
};