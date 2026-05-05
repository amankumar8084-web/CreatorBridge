import api from './api';

const youtubeService = {
  verifyChannel: async (data) => {
    const response = await api.post('/youtube/verify', data);
    return response.data.data;
  },

  getStats: async (userId) => {
    const response = await api.get(`/youtube/stats/${userId}`);
    return response.data.data;
  },

  searchChannels: async (query) => {
    const response = await api.get('/youtube/search', {
      params: { query }
    });
    return response.data.data;
  },

  removeChannel: async (channelId) => {
    const response = await api.delete(`/youtube/${channelId}`);
    return response.data.data;
  }
};

export default youtubeService;
