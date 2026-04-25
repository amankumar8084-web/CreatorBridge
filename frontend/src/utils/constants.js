export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const CATEGORIES = [
  'Tech',
  'Gaming',
  'Cooking',
  'Beauty',
  'Finance',
  'Lifestyle',
  'Education',
  'Comedy'
];

export const POST_TYPES = {
  DISCUSSION: 'discussion',
  QUESTION: 'question',
  COLLAB: 'collab',
  REVIEW: 'review'
};
