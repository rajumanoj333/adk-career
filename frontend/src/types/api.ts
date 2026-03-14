export interface ApiError {
  message: string;
  status?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  status: string;
}

export interface OnboardPayload {
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
}

export interface OnboardResponse {
  status: string;
  user: User;
  roadmap_generation: {
    scheduled: boolean;
    message: string;
    check_status_endpoint: string;
  };
}

export interface AssessmentQuestion {
  id: number;
  text: string;
  dimension: string;
  weight: number;
}

export interface AssessmentQuestionsResponse {
  questions: AssessmentQuestion[];
  total: number;
}

export interface AssessmentAnswer {
  question_id: number;
  answer: 'agree' | 'neutral' | 'disagree';
}

export interface AssessmentBatchPayload {
  user_id: number;
  answers: AssessmentAnswer[];
}

export interface AssessmentBatchResponse {
  status: string;
  count: number;
}

export interface AnalysisResponse {
  user_id: number;
  personality_profile: string;
  riasec_scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  career_matches: Record<string, number>;
  analysis_text: string;
}

export interface RoadmapRequest {
  user_id: number;
  force_regenerate?: boolean;
}

export interface RoadmapGenerationResponse {
  status: string;
  message: string;
  from_cache: boolean;
  roadmap: Record<string, unknown>;
  colleges_count?: number;
  generated_at?: string;
}

export interface SavedRoadmapResponse {
  status: string;
  user: {
    id: number;
    name: string;
    status: string;
  };
  roadmap: Record<string, unknown> | null;
  roadmap_generated_at: string | null;
  colleges: Array<{
    id: number;
    name: string;
    career_path: string;
    probability: number;
    data: Record<string, unknown>;
    created_at: string;
  }>;
  colleges_count: number;
}

export interface CollegeSearchPayload {
  user_id: number;
  specialization?: string;
  districts?: string[];
}

export interface CollegeSearchResponse {
  status: string;
  specialization: string;
  districts: string[];
  colleges: Array<Record<string, unknown>>;
  count: number;
}
