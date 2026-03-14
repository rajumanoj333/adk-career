'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowRight, TrendingUp, Target, Zap, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { analysisAPI, adkAPI } from '@/lib/api';

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
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchAnalysis();
  }, [userId]);

  const fetchAnalysis = async () => {
    try {
      const response = await analysisAPI.get(parseInt(userId));
      setAnalysis(response.data);
    } catch (error) {
      toast.error('Failed to load analysis. Please complete the assessment first.');
      router.push('/assessment?userId=' + userId);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!userId) return;
    
    setGeneratingRoadmap(true);
    try {
      toast.loading('Generating your personalized AI roadmap...', { duration: 30000 });
      
      const response = await adkAPI.generateRoadmap(parseInt(userId), false);
      
      toast.dismiss();
      toast.success('Roadmap generated successfully!');
      
      // Navigate to roadmap page to view results
      router.push(`/roadmap?userId=${userId}`);
    } catch (error: any) {
      toast.dismiss();
      const errorMsg = error.response?.data?.detail || 'Failed to generate roadmap';
      
      if (errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        toast.error('AI service is temporarily busy. Please try again in a minute.');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Analyzing your profile...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Analysis Available</h2>
          <p className="text-gray-600 mb-6">Please complete the assessment first to see your personality analysis.</p>
          <button
            onClick={() => router.push(`/assessment?userId=${userId}`)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  const topCareers = Object.entries(analysis.career_matches)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topCareer = topCareers[0]?.[0] || 'Career';

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-primary-50 to-primary-100">
      <Toaster />
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Personality Analysis</h1>
          <p className="text-gray-600">Discover your strengths and ideal career paths</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 border-primary-100">
          <div className="text-center">
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-bold text-lg mb-4 shadow-md">
              {analysis.personality_profile}
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">{analysis.analysis_text}</p>
          </div>
        </div>

        {/* RIASEC Scores */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-6 flex items-center text-gray-900">
            <TrendingUp className="w-6 h-6 mr-2 text-primary-600" /> RIASEC Profile
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(analysis.riasec_scores).map(([dim, score]) => (
              <div key={dim} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <div className="text-sm text-gray-600 font-medium mb-1">{dim}</div>
                <div className="text-3xl font-bold text-primary-600 mb-2">{score.toFixed(1)}</div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${(score / 3) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
              <Zap className="w-6 h-6 mr-2 text-green-500" /> Your Strengths
            </h2>
            <ul className="space-y-3">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0" />
                  <span className="capitalize">{s}</span>
                </li>
              ))}
              {analysis.strengths.length === 0 && (
                <li className="text-gray-500 italic">Complete more assessments to discover strengths</li>
              )}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
              <AlertCircle className="w-6 h-6 mr-2 text-orange-500" /> Areas to Develop
            </h2>
            <ul className="space-y-3">
              {analysis.weaknesses.map((w, i) => (
                <li key={i} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0" />
                  <span className="capitalize">{w}</span>
                </li>
              ))}
              {analysis.weaknesses.length === 0 && (
                <li className="text-gray-500 italic">Great job! Keep developing your skills</li>
              )}
            </ul>
          </div>
        </div>

        {/* Career Matches */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center text-gray-900">
            <Target className="w-6 h-6 mr-2 text-primary-600" /> Top Career Matches
          </h2>
          <div className="space-y-4">
            {topCareers.map(([career, score], index) => (
              <div key={career} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-primary-200 transition">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <span className="font-semibold text-gray-800 flex-1">{career}</span>
                <div className="flex items-center gap-3">
                  <div className="w-40 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-primary-600 font-bold w-14 text-right">{score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section - Generate AI Roadmap */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Get Your Personalized Career Roadmap</h2>
              </div>
              <p className="text-primary-100 text-lg leading-relaxed mb-6">
                Based on your <strong className="text-white">{analysis.personality_profile}</strong> personality type and RIASEC scores, 
                our AI will create a complete M.Tech career plan with:
              </p>
              <ul className="grid md:grid-cols-2 gap-3 mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full" />
                  Personalized career path
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full" />
                  Month-by-month roadmap
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full" />
                  Top college recommendations
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full" />
                  Salary progression chart
                </li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={handleGenerateRoadmap}
            disabled={generatingRoadmap}
            className="w-full md:w-auto px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
          >
            {generatingRoadmap ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Generating Roadmap...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate AI Roadmap
              </>
            )}
          </button>
        </div>

        {/* Alternative Actions */}
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <button
            onClick={() => router.push(`/colleges?userId=${userId}`)}
            className="flex items-center px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition"
          >
            Browse Colleges
          </button>
          <button
            onClick={() => router.push(`/dashboard?userId=${userId}`)}
            className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
