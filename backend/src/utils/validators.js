const validateYouTubeUrl = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/channel\/([^\/\?\&]+)/,
    /youtube\.com\/c\/([^\/\?\&]+)/,
    /youtube\.com\/@([^\/\?\&]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const validatePasswordStrength = (password) => {
  const checks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const strength = passedChecks <= 2 ? 'weak' : passedChecks <= 4 ? 'medium' : 'strong';
  
  return {
    isValid: passedChecks >= 3,
    strength,
    checks,
    message: passedChecks >= 3 ? 'Password is strong enough' : 'Password is too weak'
  };
};

const validateNiche = (niche) => {
  const validNiches = [
    'Gaming', 'Cooking', 'Tech', 'Education', 
    'Vlogs', 'Music', 'Fitness', 'Art', 'Other'
  ];
  return validNiches.includes(niche);
};

const sanitizeHtml = (text) => {
  // Basic sanitization - remove script tags and dangerous attributes
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, '');
};

const validatePostContent = (content) => {
  const wordCount = content.trim().split(/\s+/).length;
  return {
    isValid: wordCount >= 10 && wordCount <= 5000,
    wordCount,
    message: wordCount < 10 ? 'Too short' : wordCount > 5000 ? 'Too long' : 'Valid'
  };
};

module.exports = {
  validateYouTubeUrl,
  validatePasswordStrength,
  validateNiche,
  sanitizeHtml,
  validatePostContent
};