'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { BookOpen, Clock, CheckCircle, TrendingUp, MapPin, Rupee, BarChart3, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { adkAPI } from '@/lib/api';

interface College {
  id: number;
  name: string;
  career_path: string;
  probability: number;
  data: any;
  created_at: string;
}

interface RoadmapPhase {
  phase: number;
  title: string;
  duration_months: number;
  activities?: string[];
  milestones?: string[];
}

interface RoadmapData {
  target_specialization: string;
  career_path: string;
  job_roles: string[];
  colleges: any[];
  roadmap_phases: RoadmapPhase[];
  timeline: {
    preparation_months: number;
    mtech_duration_months: number;
    total_months: number;
  };
  salary_projection: {
    starting_lpa: number;
    year_3_lpa: number;
    year_5_lpa: number;
  };
}

export default function Roadmap() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'colleges' | 'salary'>('roadmap');

  useEffect(() => {
    if (!userId) {
      toast.error('User ID is required');
      return;
    }
    fetchRoadmap();
  }, [userId]);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const response = await adkAPI.getRoadmap(parseInt(userId));
      const data = response.data;

      if (data.status === 'success' && data.roadmap) {
        setRoadmap(data.roadmap);
        setColleges(data.colleges || []);
      } else if (data.status === 'success' && !data.roadmap) {
        toast.info('No roadmap generated yet. Click "Generate Roadmap" to create one.');
      }
    } catch (error) {
      toast.error('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!userId) return;

    setGenerating(true);
    try {
      toast.loading('AI is analyzing your profile and generating roadmap...', { duration: 30000 });
      
      const response = await adkAPI.generateRoadmap(parseInt(userId), false);
      
      toast.dismiss();
      
      if (response.data.status === 'success') {
        setRoadmap(response.data.roadmap);
        toast.success('Roadmap generated successfully!');
        fetchRoadmap();
      }
    } catch (error: any) {
      toast.dismiss();
      const errorMsg = error.response?.data?.detail || 'Failed to generate roadmap';
      
      if (errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        toast.error('AI service is temporarily busy. Please try again in a minute.');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmap && !generating) {
    return (
      <div className="min-h-screen py-8 bg-gradient-to-br from-primary-50 to-primary-100">
        <Toaster />
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Sparkles className="w-20 h-20 text-primary-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Career Roadmap Awaits!</h1>
            <p className="text-gray-600 mb-8 text-lg">
              Get a personalized AI-powered career plan with college recommendations, 
              month-by-month roadmap, and salary projections.
            </p>
            <button
              onClick={handleGenerateRoadmap}
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Generate My Roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-xl text-gray-600">Generating your personalized roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-primary-50 to-primary-100">
      <Toaster />
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {roadmap.target_specialization || 'M.Tech'} Career Roadmap
              </h1>
              <p className="text-gray-600 text-lg">{roadmap.career_path}</p>
            </div>
            <button
              onClick={handleGenerateRoadmap}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <Clock className="w-6 h-6 text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-700">{roadmap.timeline?.total_months || 24}</div>
              <div className="text-sm text-blue-600">Total Months</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-700">₹{roadmap.salary_projection?.starting_lpa || 8} LPA</div>
              <div className="text-sm text-green-600">Starting Salary</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <MapPin className="w-6 h-6 text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-700">{colleges.length}</div>
              <div className="text-sm text-purple-600">Colleges</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
              <BookOpen className="w-6 h-6 text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-orange-700">{roadmap.roadmap_phases?.length || 3}</div>
              <div className="text-sm text-orange-600">Phases</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === 'roadmap'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-5 h-5 inline mr-2" />
            Roadmap
          </button>
          <button
            onClick={() => setActiveTab('colleges')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === 'colleges'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MapPin className="w-5 h-5 inline mr-2" />
            Colleges
          </button>
          <button
            onClick={() => setActiveTab('salary')}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === 'salary'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Salary Chart
          </button>
        </div>

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            {roadmap.roadmap_phases?.map((phase, index) => (
              <div key={phase.phase} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Phase {phase.phase}: {phase.title}</h3>
                    <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                      <Clock className="w-4 h-4" />
                      {phase.duration_months} months
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  {phase.activities && phase.activities.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" /> Key Activities
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {phase.activities.map((activity: string, i: number) => (
                          <span
                            key={i}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {phase.milestones && phase.milestones.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" /> Milestones
                      </h4>
                      <ul className="space-y-2">
                        {phase.milestones.map((milestone: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{milestone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Colleges Tab */}
        {activeTab === 'colleges' && (
          <div className="space-y-4">
            {colleges.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No College Recommendations</h3>
                <p className="text-gray-600">College recommendations will appear here after roadmap generation.</p>
              </div>
            ) : (
              colleges.map((college, index) => (
                <div key={college.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{college.name}</h3>
                        <p className="text-gray-600">{college.career_path}</p>
                        {college.data?.location && (
                          <p className="text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4" /> {college.data.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">{college.probability}%</div>
                      <div className="text-sm text-gray-500">Match Score</div>
                    </div>
                  </div>
                  {college.data?.estimated_fee && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Rupee className="w-4 h-4" />
                      <span>Estimated Fee: ₹{college.data.estimated_fee} Lakhs</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Salary Tab */}
        {activeTab === 'salary' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-primary-600" />
              Salary Progression
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                <div>
                  <div className="text-sm text-green-600 font-medium">Starting Salary (M.Tech)</div>
                  <div className="text-3xl font-bold text-green-700">₹{roadmap.salary_projection?.starting_lpa || 8} LPA</div>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div>
                  <div className="text-sm text-blue-600 font-medium">Year 3</div>
                  <div className="text-3xl font-bold text-blue-700">₹{roadmap.salary_projection?.year_3_lpa || 18} LPA</div>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                <div>
                  <div className="text-sm text-purple-600 font-medium">Year 5+</div>
                  <div className="text-3xl font-bold text-purple-700">₹{roadmap.salary_projection?.year_5_lpa || 30} LPA</div>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-600" />
              </div>
            </div>
            
            {/* Salary Chart Visualization */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Growth Chart</h4>
              <div className="flex items-end justify-around h-48 bg-gray-50 rounded-xl p-4">
                {[
                  { label: 'Start', value: roadmap.salary_projection?.starting_lpa || 8 },
                  { label: 'Year 3', value: roadmap.salary_projection?.year_3_lpa || 18 },
                  { label: 'Year 5', value: roadmap.salary_projection?.year_5_lpa || 30 }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="text-lg font-bold text-gray-700">₹{item.value} LPA</div>
                    <div
                      className="w-20 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(item.value / 35) * 100}%` }}
                    />
                    <div className="text-sm text-gray-600 font-medium">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
