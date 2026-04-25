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

  markAsRead: async (roomId) => {
    const response = await api.put(`/chat/rooms/${roomId}/read`);
    return response.data.data;
  }
};

export default chatService;
