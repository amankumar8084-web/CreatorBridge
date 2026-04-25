const logger = require('../utils/logger');

// Simple in-memory store for active WebRTC connections
const activeRooms = new Map();

class WebRTCService {
  constructor() {
    this.peerConnections = new Map();
  }

  createRoom(roomId, hostId) {
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, {
        host: hostId,
        participants: [hostId],
        createdAt: new Date(),
        streams: new Map()
      });
      logger.info(`WebRTC room created: ${roomId} by ${hostId}`);
      return true;
    }
    return false;
  }

  joinRoom(roomId, userId) {
    const room = activeRooms.get(roomId);
    if (room && !room.participants.includes(userId)) {
      room.participants.push(userId);
      logger.info(`User ${userId} joined room ${roomId}`);
      return { success: true, participants: room.participants };
    }
    return { success: false };
  }

  leaveRoom(roomId, userId) {
    const room = activeRooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter(id => id !== userId);
      if (room.participants.length === 0) {
        activeRooms.delete(roomId);
        logger.info(`Room ${roomId} closed (no participants)`);
      } else if (room.host === userId && room.participants.length > 0) {
        room.host = room.participants[0];
        logger.info(`New host for room ${roomId}: ${room.host}`);
      }
      return { success: true, participants: room.participants };
    }
    return { success: false };
  }

  getRoomParticipants(roomId) {
    const room = activeRooms.get(roomId);
    return room ? room.participants : [];
  }

  roomExists(roomId) {
    return activeRooms.has(roomId);
  }

  getActiveRooms() {
    return Array.from(activeRooms.keys()).map(roomId => ({
      roomId,
      participantCount: activeRooms.get(roomId).participants.length
    }));
  }
}

module.exports = new WebRTCService();