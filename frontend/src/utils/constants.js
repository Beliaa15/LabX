// API Configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, API is served from same domain
  : 'http://localhost:3000/api';  // In development, backend runs on different port

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