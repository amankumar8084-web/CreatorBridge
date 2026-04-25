import api from './api';

const meetingService = {
  getMeetings: async () => {
    const response = await api.get('/meetings');
    return response.data.data;
  },

  createMeeting: async (meetingData) => {
    const response = await api.post('/meetings', meetingData);
    return response.data.data;
  },

  joinMeeting: async (meetingId) => {
    const response = await api.post(`/meetings/${meetingId}/join`);
    return response.data.data;
  },

  getMeeting: async (meetingId) => {
    const response = await api.get(`/meetings/${meetingId}`);
    return response.data.data;
  }
};

export default meetingService;
