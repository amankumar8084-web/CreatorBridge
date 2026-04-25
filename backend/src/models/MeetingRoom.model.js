const mongoose = require('mongoose');

const meetingRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Meeting name is required'],
    trim: true,
    maxlength: [100, 'Meeting name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pendingRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    default: 8,
    min: 2,
    max: 50
  },
  scheduledFor: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  startedAt: Date,
  endedAt: Date,
  tags: [String],
  recording: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

meetingRoomSchema.index({ isActive: 1, scheduledFor: 1 });
meetingRoomSchema.index({ host: 1 });
meetingRoomSchema.index({ participants: 1 });

const MeetingRoom = mongoose.model('MeetingRoom', meetingRoomSchema);
module.exports = MeetingRoom;