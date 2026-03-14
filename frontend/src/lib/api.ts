import axios from 'axios';
import type {
  AnalysisResponse,
  ApiError,
  AssessmentBatchPayload,
  AssessmentBatchResponse,
  AssessmentQuestionsResponse,
  CollegeSearchPayload,
  CollegeSearchResponse,
  OnboardPayload,
  OnboardResponse,
  RoadmapGenerationResponse,
  RoadmapRequest,
  SavedRoadmapResponse,
} from '../types/api';

function getDefaultBaseURL(): string {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.app.github.dev')) {
    return window.location.origin.replace(/-\d+\.app\.github\.dev$/, '-8000.app.github.dev');
  }

  return 'http://localhost:8000';
}

const shouldUseDevProxy = import.meta.env.DEV && import.meta.env.VITE_DISABLE_DEV_PROXY !== 'true';
const baseURL = import.meta.env.VITE_API_BASE_URL || (shouldUseDevProxy ? '/api' : getDefaultBaseURL());

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const detail =
      (typeof error.response?.data?.detail === 'string' && error.response.data.detail) ||
      error.message;
    return {
      message: detail || 'Request failed',
      status: error.response?.status,
    };
  }

  return {
    message: error instanceof Error ? error.message : 'Unexpected error',
  };
}

export const api = {
  async onboard(payload: OnboardPayload): Promise<OnboardResponse> {
    try {
      const { data } = await client.post<OnboardResponse>('/api/user/onboard', payload);
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async getAssessmentQuestions(): Promise<AssessmentQuestionsResponse> {
    try {
      const { data } = await client.get<AssessmentQuestionsResponse>('/api/assessment/questions');
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async submitAssessmentBatch(payload: AssessmentBatchPayload): Promise<AssessmentBatchResponse> {
    try {
      const { data } = await client.post<AssessmentBatchResponse>('/api/assessment/batch', payload);
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async runAnalysis(userId: number): Promise<AnalysisResponse> {
    try {
      const { data } = await client.post<AnalysisResponse>('/api/analysis/run', { user_id: userId });
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async getAnalysis(userId: number): Promise<AnalysisResponse> {
    try {
      const { data } = await client.get<AnalysisResponse>(`/api/analysis/${userId}`);
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async generateRoadmap(payload: RoadmapRequest): Promise<RoadmapGenerationResponse> {
    try {
      const { data } = await client.post<RoadmapGenerationResponse>('/api/adk/generate-roadmap', payload);
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async getSavedRoadmap(userId: number): Promise<SavedRoadmapResponse> {
    try {
      const { data } = await client.get<SavedRoadmapResponse>(`/api/adk/my-roadmap/${userId}`);
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async searchColleges(payload: CollegeSearchPayload): Promise<CollegeSearchResponse> {
    try {
      const { data } = await client.post<CollegeSearchResponse>('/api/adk/search-colleges', payload);
      return data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
};
