import api from './api';

const postService = {
  getPosts: async (params) => {
    const response = await api.get('/posts', { params });
    return response.data.data;
  },

  getPost: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data.data;
  },

  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data.data;
  },

  updatePost: async (id, postData) => {
    const response = await api.patch(`/posts/${id}`, postData);
    return response.data.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data.data;
  },

  upvotePost: async (id) => {
    const response = await api.post(`/posts/${id}/upvote`);
    return response.data.data;
  },

  getComments: async (postId) => {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data.data;
  },

  createComment: async (commentData) => {
    const response = await api.post('/comments', commentData);
    return response.data.data;
  },

  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data.data;
  },

  markAsBestAnswer: async (commentId) => {
    const response = await api.post(`/comments/${commentId}/best-answer`);
    return response.data.data;
  }
};

export default postService;
