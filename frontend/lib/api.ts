// API client for FastAPI backend
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User endpoints
export const userAPI = {
  onboard: (data: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    tenth_marks?: number;
    twelfth_marks?: number;
    entrance_exam?: string;
    entrance_rank?: number;
    budget?: number;
    preferred_cities?: string[];
    interests?: string[];
    generate_roadmap?: boolean;
  }) => api.post('/api/user/onboard', data),
  
  getById: (userId: number) => api.get(`/api/user/${userId}`),
  
  getByEmail: (email: string) => api.get(`/api/user/by-email/${email}`),
  
  update: (userId: number, data: any) => api.patch(`/api/user/${userId}`, data),
};

// Assessment endpoints
export const assessmentAPI = {
  getQuestions: () => api.get('/api/assessment/questions'),
  
  getQuestion: (questionId: number) => api.get(`/api/assessment/questions/${questionId}`),
  
  submitAnswer: (data: { user_id: number; question_id: number; answer: string }) => 
    api.post('/api/assessment/answer', data),
  
  submitBatch: (data: { user_id: number; answers: { question_id: number; answer: string }[] }) => 
    api.post('/api/assessment/batch', data),
  
  getUserAssessment: (userId: number) => api.get(`/api/assessment/user/${userId}`),
};

// Analysis endpoints
export const analysisAPI = {
  run: (userId: number) => api.post('/api/analysis/run', { user_id: userId }),
  
  get: (userId: number) => api.get(`/api/analysis/${userId}`),
};

// ADK endpoints
export const adkAPI = {
  generateRoadmap: (userId: number, forceRegenerate = false) => 
    api.post('/api/adk/generate-roadmap', { user_id: userId, force_regenerate: forceRegenerate }),
  
  searchColleges: (userId: number, specialization?: string, districts?: string[]) => 
    api.post('/api/adk/search-colleges', { user_id: userId, specialization, districts }),
  
  getRoadmap: (userId: number) => api.get(`/api/adk/my-roadmap/${userId}`),
  
  chat: (userId: string, message: string, agentName = 'eamcet') => 
    api.post('/api/adk/chat', { user_id: userId, message, agent_name: agentName }),
  
  getAgents: () => api.get('/api/adk/agents'),
};

// Colleges endpoints
export const collegesAPI = {
  list: () => api.get('/api/colleges/'),
  
  getById: (id: number) => api.get(`/api/colleges/${id}`),
  
  recommend: (userId: number) => api.get(`/api/colleges/recommend/user/${userId}`),
  
  checkEligibility: (data: any) => api.post('/api/colleges/check-eligibility', data),
};

// Roadmap endpoints (static templates)
export const roadmapAPI = {
  list: () => api.get('/api/roadmap/'),
  
  get: (career: string) => api.get(`/api/roadmap/${career}`),
};

export default api;
