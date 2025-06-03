import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json',
  withCredentials: true,
});

export const api = {
  // University endpoints
  getUniversities: () => 
    axios.get(`${API_BASE_URL}/universities`, { headers: getAuthHeaders() }),
  
  initializeApplication: (universityId) =>
    axios.post(`${API_BASE_URL}/universities/${universityId}/applications/initialize`, {}, 
      { headers: getAuthHeaders() }),

  // Application endpoints
  getApplications: () =>
    axios.get(`${API_BASE_URL}/applications`, { headers: getAuthHeaders() }),
  
  getApplicationDetail: (applicationId) =>
    axios.get(`${API_BASE_URL}/applications/${applicationId}`, 
      { headers: getAuthHeaders() }),
  
  updateResponses: (applicationId, responses) =>
    axios.put(`${API_BASE_URL}/applications/${applicationId}/responses`,
      { responses }, { headers: getAuthHeaders() }),
  
  submitApplication: (applicationId) =>
    axios.put(`${API_BASE_URL}/applications/${applicationId}/submit`, {},
      { headers: getAuthHeaders() }),
  
  updateApplicationStatus: (applicationId, status) =>
    axios.put(`${API_BASE_URL}/applications/${applicationId}/status`,
      { status }, { headers: getAuthHeaders() }),
};