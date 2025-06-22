// API Configuration for different environments
export const API_BASE_URL = (() => {
  // Production: API is served from same domain
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  // Development: Backend runs on port 3000, frontend on 3001
  return process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
})();

// WebGL content base URL
export const WEBGL_BASE_URL = (() => {
  if (process.env.NODE_ENV === 'production') {
    return '/webgl';
  }
  return 'http://localhost:3000/webgl';
})();

export const APPLICATION_STATUS = {
    PENDING: 'pending',
    SUBMITTED: 'submitted',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
  };
  
  export const FIELD_TYPES = {
    TEXT: 'text',
    TEXTAREA: 'textarea'
  };