'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { BookOpen, Clock, CheckCircle, ArrowRight } from 'lucide-react';

interface RoadmapStage {
  stage: number;
  title: string;
  duration: string;
  topics?: string[];
  projects?: string[];
}

interface RoadmapData {
  career: string;
  description: string;
  estimated_duration: string;
  salary_range: string;
  demand: string;
  stages: RoadmapStage[];
}

export default function Roadmap() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const careerParam = searchParams.get('career');
  
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [career, setCareer] = useState(careerParam || 'Software Engineer');

  useEffect(() => {
    fetchRoadmap();
  }, [career]);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/roadmap/${career}`);
      setRoadmap(response.data);
    } catch (error) {
      toast.error('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading roadmap...</div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No roadmap available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <Toaster />
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{roadmap.career} Roadmap</h1>
          <p className="text-gray-600 mt-2">{roadmap.description}</p>
          
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {roadmap.estimated_duration}
            </span>
            <span>💰 {roadmap.salary_range}</span>
            <span>📈 {roadmap.demand} demand</span>
          </div>
        </div>

        {/* Career Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Change Career</label>
          <select
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border rounded-lg"
          >
            <option value="AI Engineer">AI Engineer</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Web Developer">Web Developer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="Cybersecurity">Cybersecurity</option>
          </select>
        </div>

        {/* Timeline */}
        <div className="relative">
          {roadmap.stages.map((stage, index) => (
            <div key={stage.stage} className="flex gap-4 mb-8">
              {/* Timeline marker */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                  {stage.stage}
                </div>
                {index < roadmap.stages.length - 1 && (
                  <div className="w-0.5 h-full bg-primary-200 mt-2" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{stage.title}</h3>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" /> {stage.duration}
                  </span>
                </div>
                
                {stage.topics && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" /> Topics to Learn
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {stage.topics.map((topic, i) => (
                        <span 
                          key={i} 
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {stage.projects && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Projects</h4>
                    <ul className="space-y-1">
                      {stage.projects.map((project, i) => (
                        <li key={i} className="flex items-center text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          {project}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
