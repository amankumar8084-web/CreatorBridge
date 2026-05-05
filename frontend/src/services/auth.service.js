import api from './api';

export const authService = {
  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  async updateProfile(data) {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
  
  async followUser(userId) {
    const response = await api.post(`/users/follow/${userId}`);
    return response.data;
  },
  
  async getUserProfile(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  async searchUsers(query, niche) {
    const response = await api.get('/users/search', { params: { q: query, niche } });
    return response.data;
  }
};

export const postService = {
  async getPosts(params) {
    const response = await api.get('/posts', { params });
    return response.data;
  },
  
  async getPost(id) {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },
  
  async createPost(data) {
    const response = await api.post('/posts', data);
    return response.data;
  },
  
  async updatePost(id, data) {
    const response = await api.patch(`/posts/${id}`, data);
    return response.data;
  },
  
  async deletePost(id) {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
  
  async upvotePost(id) {
    const response = await api.post(`/posts/${id}/upvote`);
    return response.data;
  }
};

export const commentService = {
  async getComments(postId) {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data;
  },
  
  async createComment(data) {
    const response = await api.post('/comments', data);
    return response.data;
  },
  
  async deleteComment(id) {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
  
  async markAsBestAnswer(id) {
    const response = await api.post(`/comments/${id}/best-answer`);
    return response.data;
  }
};

export const youtubeService = {
  async verifyChannel(channelId) {
    const response = await api.post('/youtube/verify', { channelId });
    return response.data;
  },
  
  async getChannelStats(userId) {
    const response = await api.get(`/youtube/stats/${userId}`);
    return response.data;
  },
  
  async searchChannels(query) {
    const response = await api.get('/youtube/search', { params: { query } });
    return response.data;
  }
};