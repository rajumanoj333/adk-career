'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { userAPI } from '@/lib/api';

interface FormData {
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
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();

  const preferredCities = watch('preferred_cities');
  const interests = watch('interests');

  const onSubmit = async (data: FormData) => {
    try {
      const response = await userAPI.onboard({
        ...data,
        preferred_cities: data.preferred_cities || [],
        interests: data.interests || [],
        generate_roadmap: true
      });

      if (response.data.user?.id) {
        const userId = response.data.user.id;
        toast.success('Profile created successfully!');
        router.push(`/assessment?userId=${userId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create profile');
    }
  };

  const toggleCity = (city: string) => {
    const current = preferredCities || [];
    if (current.includes(city)) {
      setValue('preferred_cities', current.filter(c => c !== city));
    } else {
      setValue('preferred_cities', [...current, city]);
    }
  };

  const toggleInterest = (interest: string) => {
    const current = interests || [];
    if (current.includes(interest)) {
      setValue('interests', current.filter(i => i !== interest));
    } else {
      setValue('interests', [...current, interest]);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-primary-50 to-primary-100">
      <Toaster />
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${step * 25}%` }}
            />
          </div>
          <p className="text-center text-gray-600 mt-2 font-medium">Step {step} of 4</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                <p className="text-gray-600">Let's start with your basic details</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                  })}
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  {...register('phone')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  {...register('location')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="City, District"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full flex justify-center items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Next <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Academic Details</h2>
                <p className="text-gray-600">Tell us about your academic performance</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">10th Marks (%) *</label>
                <input
                  {...register('tenth_marks', { 
                    required: '10th marks required',
                    min: { value: 0, message: 'Min 0%' },
                    max: { value: 100, message: 'Max 100%' }
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 85.5"
                />
                {errors.tenth_marks && <p className="text-red-500 text-sm mt-1">{errors.tenth_marks.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">12th Marks (%) *</label>
                <input
                  {...register('twelfth_marks', { 
                    required: '12th marks required',
                    min: { value: 0, message: 'Min 0%' },
                    max: { value: 100, message: 'Max 100%' }
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 80.0"
                />
                {errors.twelfth_marks && <p className="text-red-500 text-sm mt-1">{errors.twelfth_marks.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entrance Exam *</label>
                <select
                  {...register('entrance_exam', { required: 'Please select an exam' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select exam</option>
                  <option value="EAMCET">EAMCET</option>
                  <option value="JEE Main">JEE Main</option>
                  <option value="JEE Advanced">JEE Advanced</option>
                  <option value="Other">Other</option>
                </select>
                {errors.entrance_exam && <p className="text-red-500 text-sm mt-1">{errors.entrance_exam.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entrance Rank *</label>
                <input
                  {...register('entrance_rank', { 
                    required: 'Entrance rank required',
                    min: { value: 1, message: 'Rank must be at least 1' }
                  })}
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Your exam rank (e.g., 5000)"
                />
                {errors.entrance_rank && <p className="text-red-500 text-sm mt-1">{errors.entrance_rank.message}</p>}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 flex justify-center items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 flex justify-center items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  Next <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferences</h2>
                <p className="text-gray-600">Set your budget and location preferences</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (Lakhs) *</label>
                <input
                  {...register('budget', { 
                    required: 'Budget is required',
                    min: { value: 1, message: 'Min budget is 1 Lakh' }
                  })}
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 10"
                />
                {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Cities *</label>
                <div className="grid grid-cols-2 gap-2">
                  {CITY_OPTIONS.map((city) => (
                    <label 
                      key={city} 
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition ${
                        preferredCities?.includes(city) 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={preferredCities?.includes(city) || false}
                        onChange={() => toggleCity(city)}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm">{city}</span>
                    </label>
                  ))}
                </div>
                {preferredCities?.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">Select at least one city</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 flex justify-center items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (preferredCities?.length === 0) {
                      toast.error('Please select at least one city');
                      return;
                    }
                    setStep(4);
                  }}
                  className="flex-1 flex justify-center items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  Next <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Interests</h2>
                <p className="text-gray-600">Select all areas that interest you</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <label 
                    key={interest} 
                    className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition ${
                      interests?.includes(interest) 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={interests?.includes(interest) || false}
                      onChange={() => toggleInterest(interest)}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{interest}</span>
                  </label>
                ))}
              </div>
              {interests?.length === 0 && (
                <p className="text-red-500 text-sm">Select at least one interest</p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 flex justify-center items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={interests?.length === 0}
                  className="flex-1 flex justify-center items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Profile <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
