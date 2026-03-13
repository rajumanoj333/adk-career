'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowRight, TrendingUp, Target, Zap, AlertCircle } from 'lucide-react';

interface AnalysisData {
  user_id: number;
  personality_profile: string;
  riasec_scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  career_matches: Record<string, number>;
  analysis_text: string;
}

export default function Analysis() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');
  
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchAnalysis();
  }, [userId]);

  const fetchAnalysis = async () => {
    try {
      const response = await axios.get(`/api/analysis/${userId}`);
      setAnalysis(response.data);
    } catch (error) {
      toast.error('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Analyzing your profile...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No analysis available</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="text-primary-600 hover:underline"
          >
            Start fresh
          </button>
        </div>
      </div>
    );
  }

  const topCareers = Object.entries(analysis.career_matches)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen py-8">
      <Toaster />
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Your Personality Analysis
        </h1>

        {/* Profile */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full font-semibold mb-4">
              {analysis.personality_profile}
            </div>
            <p className="text-gray-600">{analysis.analysis_text}</p>
          </div>
        </div>

        {/* RIASEC Scores */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" /> RIASEC Profile
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(analysis.riasec_scores).map(([dim, score]) => (
              <div key={dim} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">{dim}</div>
                <div className="text-2xl font-bold text-primary-600">{score.toFixed(1)}</div>
                <div className="h-2 bg-gray-200 rounded-full mt-2">
                  <div 
                    className="h-2 bg-primary-600 rounded-full"
                    style={{ width: `${(score / 3) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-green-500" /> Strengths
            </h2>
            <ul className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-orange-500" /> Areas to Improve
            </h2>
            <ul className="space-y-2">
              {analysis.weaknesses.map((w, i) => (
                <li key={i} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Career Matches */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" /> Career Matches
          </h2>
          <div className="space-y-3">
            {topCareers.map(([career, score]) => (
              <div key={career} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">{career}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-3 bg-gray-200 rounded-full">
                    <div 
                      className="h-3 bg-primary-600 rounded-full"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-primary-600 font-semibold w-12 text-right">{score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push(`/roadmap?userId=${userId}&career=${topCareers[0]?.[0]}`)}
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
          >
            View Roadmap <ArrowRight className="ml-2" />
          </button>
          <button
            onClick={() => router.push(`/colleges?userId=${userId}`)}
            className="flex items-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50"
          >
            Find Colleges
          </button>
        </div>
      </div>
    </div>
  );
}
