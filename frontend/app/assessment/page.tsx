'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { assessmentAPI, analysisAPI } from '@/lib/api';

interface Question {
  id: number;
  text: string;
  dimension: string;
  weight: number;
}

export default function Assessment() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) {
      toast.error('Please complete onboarding first');
      router.push('/onboarding');
      return;
    }

    fetchQuestions();
  }, [userId]);

  const fetchQuestions = async () => {
    try {
      const response = await assessmentAPI.getQuestions();
      setQuestions(response.data.questions);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load questions');
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: 'agree' | 'neutral' | 'disagree') => {
    if (!userId || !questions[currentIndex]) return;

    const currentQuestion = questions[currentIndex];

    // Animate card out
    setDirection(answer === 'agree' ? 'right' : 'left');

    // Submit to API
    try {
      await assessmentAPI.submitAnswer({
        user_id: parseInt(userId),
        question_id: currentQuestion.id,
        answer
      });
    } catch (error) {
      console.error('Failed to save answer');
    }

    // Move to next or finish
    setTimeout(() => {
      setDirection(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // All done - run analysis
        finishAssessment();
      }
    }, 300);
  };

  const finishAssessment = async () => {
    setSubmitting(true);
    try {
      await analysisAPI.run(parseInt(userId));
      toast.success('Assessment complete! Analyzing your profile...');
      router.push(`/analysis?userId=${userId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Analysis failed');
      router.push(`/dashboard?userId=${userId}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No questions available</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="text-primary-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-primary-50 to-primary-100">
      <Toaster />
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="relative h-[400px] mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ x: 300, opacity: 0, rotate: 5 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              exit={{
                x: direction === 'right' ? 300 : -300,
                opacity: 0,
                rotate: direction === 'right' ? 20 : -20,
                scale: 0.9
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0 bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center border border-gray-100"
            >
              <div className="text-sm text-primary-600 font-semibold uppercase tracking-wide mb-4 bg-primary-50 px-4 py-1 rounded-full">
                {currentQuestion.dimension}
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 text-gray-800 leading-relaxed">
                "{currentQuestion.text}"
              </h2>

              <div className="flex gap-4">
                <button
                  onClick={() => handleAnswer('disagree')}
                  disabled={submitting}
                  className="flex flex-col items-center p-5 border-2 border-red-200 rounded-2xl hover:bg-red-50 hover:border-red-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ThumbsDown className="w-10 h-10 text-red-500 mb-2" />
                  <span className="text-red-600 font-semibold">Disagree</span>
                </button>

                <button
                  onClick={() => handleAnswer('neutral')}
                  disabled={submitting}
                  className="flex flex-col items-center p-5 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HelpCircle className="w-10 h-10 text-gray-500 mb-2" />
                  <span className="text-gray-600 font-semibold">Neutral</span>
                </button>

                <button
                  onClick={() => handleAnswer('agree')}
                  disabled={submitting}
                  className="flex flex-col items-center p-5 border-2 border-green-200 rounded-2xl hover:bg-green-50 hover:border-green-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ThumbsUp className="w-10 h-10 text-green-500 mb-2" />
                  <span className="text-green-600 font-semibold">Agree</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Skip button */}
        <div className="text-center">
          <button
            onClick={() => {
              if (confirm('Skip assessment and go to dashboard?')) {
                router.push(`/dashboard?userId=${userId}`);
              }
            }}
            className="text-gray-500 hover:text-gray-700 font-medium transition"
          >
            Skip assessment →
          </button>
        </div>
      </div>
    </div>
  );
}
