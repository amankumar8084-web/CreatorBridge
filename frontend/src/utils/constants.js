const isProduction = import.meta.env.PROD;
const hostname = window.location.hostname;

export const API_URL = (isProduction && import.meta.env.VITE_API_URL?.includes('localhost'))
  ? '/api' 
  : (import.meta.env.VITE_API_URL || '/api');

export const SOCKET_URL = (isProduction && import.meta.env.VITE_SOCKET_URL?.includes('localhost'))
  ? window.location.origin 
  : (import.meta.env.VITE_SOCKET_URL || window.location.origin);

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
