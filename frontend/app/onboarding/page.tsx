'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  phone: string;
  location: string;
  tenth_marks: number;
  twelfth_marks: number;
  entrance_exam: string;
  entrance_rank: number;
  budget: number;
  preferred_cities: string[];
  interests: string[];
}

const INTEREST_OPTIONS = [
  'AI', 'Machine Learning', 'Data Science', 'Programming', 'Web Development',
  'Design', 'Graphics', 'Security', 'Networking', 'Cloud', 'Mobile',
  'Game Development', 'Blockchain', 'Robotics', 'IoT', 'Hardware', 'Electronics',
  'Management', 'Business', 'Teaching', 'Research', 'Mathematics', 'Statistics'
];

const CITY_OPTIONS = ['Hyderabad', 'Secunderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Other'];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<number | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<UserData>();

  const onSubmit = async (data: UserData) => {
    try {
      const response = await axios.post('/api/user/onboard', {
        ...data,
        preferred_cities: data.preferred_cities || [],
        interests: data.interests || []
      });
      
      if (response.data.id) {
        setUserId(response.data.id);
        toast.success('Profile created!');
        router.push(`/assessment?userId=${response.data.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create profile');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <Toaster />
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-primary-600 rounded-full transition-all"
              style={{ width: `${step * 25}%` }}
            />
          </div>
          <p className="text-center text-gray-600 mt-2">Step {step} of 4</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-lg p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  {...register('name', { required: true })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your name"
                />
                {errors.name && <span className="text-red-500 text-sm">Name is required</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  {...register('email', { required: true })}
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  {...register('phone')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  {...register('location')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="City, District"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full flex justify-center items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
              >
                Next <ArrowRight className="ml-2" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Academic Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">10th Marks (%)</label>
                <input
                  {...register('tenth_marks', { min: 0, max: 100 })}
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 85"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">12th Marks (%)</label>
                <input
                  {...register('twelfth_marks', { min: 0, max: 100 })}
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entrance Exam</label>
                <select
                  {...register('entrance_exam')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select exam</option>
                  <option value="EAMCET">EAMCET</option>
                  <option value="JEE Main">JEE Main</option>
                  <option value="JEE Advanced">JEE Advanced</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entrance Rank</label>
                <input
                  {...register('entrance_rank', { min: 1 })}
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Your exam rank"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 flex justify-center items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  <ArrowLeft className="mr-2" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 flex justify-center items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
                >
                  Next <ArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (Lakhs)</label>
                <input
                  {...register('budget', { min: 1 })}
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Cities</label>
                <div className="grid grid-cols-2 gap-2">
                  {CITY_OPTIONS.map((city) => (
                    <label key={city} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={city}
                        {...register('preferred_cities')}
                        className="rounded text-primary-600"
                      />
                      <span>{city}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 flex justify-center items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  <ArrowLeft className="mr-2" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 flex justify-center items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
                >
                  Next <ArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Interests</h2>
              <p className="text-gray-600">Select all that apply</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <label key={interest} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      value={interest}
                      {...register('interests')}
                      className="rounded text-primary-600"
                    />
                    <span className="text-sm">{interest}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 flex justify-center items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                >
                  <ArrowLeft className="mr-2" /> Back
                </button>
                <button
                  type="submit"
                  className="flex-1 flex justify-center items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
