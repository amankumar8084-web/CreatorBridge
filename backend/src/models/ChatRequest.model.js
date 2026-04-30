const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Prevent duplicate pending requests
chatRequestSchema.index({ from: 1, to: 1, status: 1 }, { unique: true });

const ChatRequest = mongoose.model('ChatRequest', chatRequestSchema);
module.exports = ChatRequest;
