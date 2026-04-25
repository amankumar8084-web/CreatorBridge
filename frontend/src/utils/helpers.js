export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const NICHE_CATEGORIES = [
  'Gaming', 'Cooking', 'Tech', 'Education', 
  'Vlogs', 'Music', 'Fitness', 'Art', 'Other'
];

export const POST_TAGS = [
  'SEO', 'thumbnails', 'monetization', 'editing', 
  'analytics', 'growth', 'collab', 'general'
];

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro'
};

export const SUBSCRIPTION_PRICES = {
  pro: { monthly: 499, yearly: 4999 }
};

export const MEETING_CONSTRAINTS = {
  maxParticipants: 50,
  minParticipants: 2,
  defaultDuration: 60, // minutes
  maxDuration: 240 // minutes
};

export const UPLOAD_CONSTRAINTS = {
  maxAvatarSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  maxPostLength: 5000,
  minPostLength: 10
};

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100
};

export const YOUTUBE_CONFIG = {
  syncInterval: 6 * 60 * 60 * 1000, // 6 hours
  maxChannelsPerRequest: 50
};