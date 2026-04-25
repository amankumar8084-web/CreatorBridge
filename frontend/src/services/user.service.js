import api from './api';

const userService = {
  getProfile: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data.data;
  },

  followUser: async (id) => {
    const response = await api.post(`/users/follow/${id}`);
    return response.data.data;
  },

  getFollowers: async (id) => {
    const response = await api.get(`/users/${id}/followers`);
    return response.data.data;
  },

  getFollowing: async (id) => {
    const response = await api.get(`/users/${id}/following`);
    return response.data.data;
  },

  searchUsers: async (filters) => {
    const response = await api.get('/users/search', { params: filters });
    return response.data.data;
  }
};

export default userService;
