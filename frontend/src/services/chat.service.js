import api from './api';

const chatService = {
  getChats: async () => {
    const response = await api.get('/chat/rooms');
    return response.data.data;
  },

  getMessages: async (roomId) => {
    const response = await api.get('/chat/messages', {
      params: { roomId }
    });
    return response.data.data;
  },

  createRoom: async (participants, name, isDM = false) => {
    const response = await api.post('/chat/rooms', {
      participants,
      name,
      isDM
    });
    return response.data.data;
  },

  createDMRoom: async (userId) => {
    const response = await api.post('/chat/dm-room', { userId });
    return response.data.data;
  },

  markAsRead: async (roomId) => {
    const response = await api.post('/chat/mark-read', { roomId });
    return response.data.data;
  },

  // Chat request endpoints
  getChatRequests: async () => {
    const response = await api.get('/chat/requests');
    return response.data.data;
  },

  respondChatRequest: async (requestId, action) => {
    const response = await api.put(`/chat/requests/${requestId}`, { action });
    return response.data;
  }
};

export default chatService;
