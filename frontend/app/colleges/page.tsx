'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Building2, MapPin, Award, DollarSign, TrendingUp } from 'lucide-react';

interface College {
  id: number;
  name: string;
  code: string;
  location: string;
  city: string;
  university: string;
  rating: number;
  autonomous: boolean;
  nba: boolean;
}

interface Recommendation {
  college: College;
  course: string;
  closing_rank: number;
  tuition_fee: number;
  probability: number;
  seat_type: string;
  recommendation_reason: string;
}

export default function Colleges() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState('CSE');
  const [budget, setBudget] = useState(10);

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId, course, budget]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/colleges/recommend/user/${userId}?course=${course}&budget=${budget}`
      );
      setRecommendations(response.data.recommendations);
    } catch (error) {
      // Try without user
      try {
        const response = await axios.post('/api/colleges/check-eligibility', {
          rank: 10000,
          course
        });
        setRecommendations(response.data.eligible_colleges.map((c: any) => ({
          ...c,
          probability: c.eligible ? 75 : 20
        })));
      } catch {
        toast.error('Failed to load colleges');
      }
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 80) return 'bg-green-100 text-green-800';
    if (prob >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen py-8">
      <Toaster />
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          College Recommendations
        </h1>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="CSE">Computer Science Engineering</option>
                <option value="ECE">Electronics & Communication</option>
                <option value="EEE">Electrical & Electronics</option>
                <option value="ME">Mechanical Engineering</option>
                <option value="IT">Information Technology</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (Lakhs)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Rank</label>
              <input
                type="number"
                placeholder="Enter your rank"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl text-gray-600">Loading colleges...</div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No colleges match your criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={rec.college.id} 
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                      {rec.college.autonomous && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                          Autonomous
                        </span>
                      )}
                      {rec.college.nba && (
                        <span className="px-2 py-0.5 bg-gold-100 text-gold-700 text-xs rounded flex items-center">
                          <Award className="w-3 h-3 mr-1" /> NBA
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900">
                      {rec.college.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {rec.college.location}
                      </span>
                      <span>{rec.college.university}</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" /> {rec.course}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getProbabilityColor(rec.probability)}`}>
                      {rec.probability}% chance
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{rec.seat_type}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="flex gap-6 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="w-4 h-4" /> 
                      ₹{rec.tuition_fee.toLocaleString()}/year
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <TrendingUp className="w-4 h-4" /> 
                      Closing Rank: {rec.closing_rank}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      ⭐ {rec.college.rating}/5
                    </span>
                  </div>
                  
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
